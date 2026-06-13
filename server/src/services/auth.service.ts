import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User, IUser } from '../models/User.model';
import { RefreshToken } from '../models/RefreshToken.model';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token.utils';
import { getEnv } from '../config/environment';
import { createAppError } from '../middleware/error-handler.middleware';
import { logger } from '../utils/logger';

const SALT_ROUNDS = 12;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: IUser;
  tokens: AuthTokens;
}

export async function registerUser(
  email: string,
  password: string,
  displayName: string
): Promise<AuthResult> {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createAppError('Email already registered', 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ email, passwordHash, displayName });
  const tokens = await createTokenPair(user);

  return { user, tokens };
}

export async function loginUser(
  email: string,
  password: string
): Promise<AuthResult> {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw createAppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw createAppError('Invalid email or password', 401);
  }

  const tokens = await createTokenPair(user);
  return { user, tokens };
}

export async function refreshTokens(oldRefreshToken: string): Promise<AuthTokens> {
  let payload;
  try {
    payload = verifyRefreshToken(oldRefreshToken);
  } catch {
    throw createAppError('Invalid refresh token', 401);
  }


  // Find the token record by searching for matching ones
  const storedTokens = await RefreshToken.find({
    userId: payload.userId,
    family: payload.family,
    used: false,
  });

  // Verify the token matches one of the stored hashes
  let matchedToken = null;
  for (const stored of storedTokens) {
    const matches = await bcrypt.compare(oldRefreshToken, stored.tokenHash);
    if (matches) {
      matchedToken = stored;
      break;
    }
  }

  if (!matchedToken) {
    // Possible reuse attack — invalidate entire family
    logger.warn(`Refresh token reuse detected for user ${payload.userId}, family ${payload.family}`);
    await RefreshToken.deleteMany({ family: payload.family });
    throw createAppError('Refresh token reuse detected. Please log in again.', 401);
  }

  // Mark old token as used
  matchedToken.used = true;
  await matchedToken.save();

  // Generate new token pair
  const user = await User.findById(payload.userId);
  if (!user) {
    throw createAppError('User not found', 401);
  }

  const { JWT_REFRESH_EXPIRY_DAYS } = getEnv();
  const newRefreshTokenStr = generateRefreshToken(user._id, payload.family);
  const newRefreshHash = await bcrypt.hash(newRefreshTokenStr, SALT_ROUNDS);

  await RefreshToken.create({
    userId: user._id,
    tokenHash: newRefreshHash,
    family: payload.family,
    expiresAt: new Date(Date.now() + JWT_REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
  });

  const accessToken = generateAccessToken(user._id, user.email);

  return { accessToken, refreshToken: newRefreshTokenStr };
}

export async function logoutUser(refreshToken: string): Promise<void> {
  try {
    const payload = verifyRefreshToken(refreshToken);
    // Invalidate the entire token family
    await RefreshToken.deleteMany({ family: payload.family });
  } catch {
    // Even if verification fails, we don't expose that
    logger.debug('Logout called with invalid refresh token');
  }
}

async function createTokenPair(user: IUser): Promise<AuthTokens> {
  const { JWT_REFRESH_EXPIRY_DAYS } = getEnv();
  const family = uuidv4();

  const accessToken = generateAccessToken(user._id, user.email);
  const refreshTokenStr = generateRefreshToken(user._id, family);

  const refreshHash = await bcrypt.hash(refreshTokenStr, SALT_ROUNDS);

  await RefreshToken.create({
    userId: user._id,
    tokenHash: refreshHash,
    family,
    expiresAt: new Date(Date.now() + JWT_REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken: refreshTokenStr };
}
