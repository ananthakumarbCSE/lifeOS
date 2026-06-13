import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, refreshTokens, logoutUser } from '../services/auth.service';
import { User } from '../models/User.model';
import { getEnv } from '../config/environment';

function setRefreshCookie(res: Response, refreshToken: string): void {
  const { JWT_REFRESH_EXPIRY_DAYS, NODE_ENV } = getEnv();
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: JWT_REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, displayName } = req.body;
    const { user, tokens } = await registerUser(email, password, displayName);

    setRefreshCookie(res, tokens.refreshToken);

    res.status(201).json({
      user: user.toJSON(),
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    const { user, tokens } = await loginUser(email, password);

    setRefreshCookie(res, tokens.refreshToken);

    res.json({
      user: user.toJSON(),
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const oldRefreshToken = req.cookies?.refreshToken;
    if (!oldRefreshToken) {
      res.status(401).json({ error: 'Refresh token not found' });
      return;
    }

    const tokens = await refreshTokens(oldRefreshToken);
    setRefreshCookie(res, tokens.refreshToken);

    res.json({ accessToken: tokens.accessToken });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await logoutUser(refreshToken);
    }

    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user: user.toJSON() });
  } catch (error) {
    next(error);
  }
}
