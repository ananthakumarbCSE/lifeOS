import jwt, { type SignOptions } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { getEnv } from '../config/environment';

export interface AccessTokenPayload {
  userId: string;
  email: string;
}

export interface RefreshTokenPayload {
  userId: string;
  family: string;
}

export function generateAccessToken(userId: Types.ObjectId, email: string): string {
  const { JWT_ACCESS_SECRET, JWT_ACCESS_EXPIRY } = getEnv();
  const options: SignOptions = { expiresIn: JWT_ACCESS_EXPIRY as string & SignOptions['expiresIn'] };
  return jwt.sign(
    { userId: userId.toString(), email } satisfies AccessTokenPayload,
    JWT_ACCESS_SECRET,
    options
  );
}

export function generateRefreshToken(userId: Types.ObjectId, family: string): string {
  const { JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRY_DAYS } = getEnv();
  const options: SignOptions = { expiresIn: `${JWT_REFRESH_EXPIRY_DAYS}d` as string & SignOptions['expiresIn'] };
  return jwt.sign(
    { userId: userId.toString(), family } satisfies RefreshTokenPayload,
    JWT_REFRESH_SECRET,
    options
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const { JWT_ACCESS_SECRET } = getEnv();
  return jwt.verify(token, JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const { JWT_REFRESH_SECRET } = getEnv();
  return jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
}
