import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db';

interface AuthRequest extends Request {
  userId?: string;
}

export async function register(req: Request, res: Response) {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (supports both schema formats)
    let result;
    try {
      // Try new schema with UUID and password_hash
      result = await db.query(
        `INSERT INTO users (email, password_hash, name, timezone, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING id, email, name`,
        [email, hashedPassword, `${firstName || ''} ${lastName || ''}`.trim(), 'America/New_York']
      );
    } catch (error) {
      // Fallback to old schema with camelCase
      result = await db.query(
        `INSERT INTO users (email, password, firstName, lastName, createdAt, updatedAt)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING id, email, firstName, lastName`,
        [email, hashedPassword, firstName || '', lastName || '']
      );
    }

    const user = result.rows[0];

    // Generate tokens
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user,
      token,
      refreshToken,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Check password (handles both "password" and "password_hash" columns)
    const hashedPassword = user.password_hash || user.password;
    if (!hashedPassword) {
      console.error('No password hash found for user:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const passwordMatch = await bcrypt.compare(password, hashedPassword);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate tokens
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
      { expiresIn: '7d' }
    );

    // Store refresh token (optional - for token blacklisting)
    await db.query(
      'INSERT INTO refresh_tokens (userId, token, expiresAt) VALUES ($1, $2, NOW() + INTERVAL \'7 days\')',
      [user.id, refreshToken]
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
      refreshToken,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
}

export async function logout(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const token = req.headers.authorization?.split(' ')[1];

    // Blacklist the token
    if (token && userId) {
      await db.query(
        'INSERT INTO token_blacklist (userId, token, expiresAt) VALUES ($1, $2, NOW() + INTERVAL \'24 hours\')',
        [userId, token]
      );
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ message: 'Error logging out' });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret'
    ) as any;

    // Check if token exists in database
    const result = await db.query(
      'SELECT * FROM refresh_tokens WHERE userId = $1 AND token = $2 AND expiresAt > NOW()',
      [decoded.userId, refreshToken]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Generate new access token
    const newToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ token: newToken });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
}

export async function getCurrentUser(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;

    const result = await db.query(
      'SELECT id, email, firstName, lastName FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Error fetching current user' });
  }
}
