import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../db';

export interface AuthRequest extends Request {
  userId?: string;
  body?: any;
  params?: any;
  query?: any;
  headers?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers?.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Check if token is blacklisted
    const blacklistedResult = await db.query(
      'SELECT * FROM token_blacklist WHERE token = $1 AND expiresAt > NOW()',
      [token]
    );

    if (blacklistedResult.rows.length > 0) {
      return res.status(401).json({ message: 'Token has been revoked' });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as any;

    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token has expired' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Authentication error' });
  }
};
