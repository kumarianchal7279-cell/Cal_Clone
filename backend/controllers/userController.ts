import { Request, Response } from 'express';
import db from '../db';

interface AuthRequest extends Request {
  userId?: string;
}

export async function getUserSettings(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;

    const query = `
      SELECT 
        u.email,
        u.firstName as "firstName",
        u.lastName as "lastName",
        COALESCE(s.timezone, 'UTC') as timezone,
        COALESCE(s.emailNotifications, true) as "emailNotifications"
      FROM users u
      LEFT JOIN user_settings s ON u.id = s.userId
      WHERE u.id = $1
    `;

    const result = await db.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ message: 'Failed to fetch user settings' });
  }
}

export async function updateUserSettings(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { firstName, lastName, timezone, emailNotifications } = req.body;

    // Start transaction
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Update user table
      if (firstName !== undefined || lastName !== undefined) {
        const updateUserQuery = `
          UPDATE users
          SET 
            firstName = COALESCE($2, firstName),
            lastName = COALESCE($3, lastName),
            updatedAt = NOW()
          WHERE id = $1
        `;

        await client.query(updateUserQuery, [userId, firstName || null, lastName || null]);
      }

      // Update or insert user settings
      const upsertSettingsQuery = `
        INSERT INTO user_settings (userId, timezone, emailNotifications, createdAt, updatedAt)
        VALUES ($1, $2, $3, NOW(), NOW())
        ON CONFLICT (userId)
        DO UPDATE SET
          timezone = COALESCE($2, user_settings.timezone),
          emailNotifications = COALESCE($3, user_settings.emailNotifications),
          updatedAt = NOW()
      `;

      await client.query(upsertSettingsQuery, [
        userId,
        timezone || null,
        emailNotifications !== undefined ? emailNotifications : null,
      ]);

      await client.query('COMMIT');

      // Fetch updated settings
      const query = `
        SELECT 
          u.email,
          u.firstName as "firstName",
          u.lastName as "lastName",
          COALESCE(s.timezone, 'UTC') as timezone,
          COALESCE(s.emailNotifications, true) as "emailNotifications"
        FROM users u
        LEFT JOIN user_settings s ON u.id = s.userId
        WHERE u.id = $1
      `;

      const result = await db.query(query, [userId]);

      res.json(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ message: 'Failed to update user settings' });
  }
}

export async function getUserProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;

    const query = `
      SELECT 
        id,
        email,
        firstName as "firstName",
        lastName as "lastName",
        createdAt as "createdAt"
      FROM users
      WHERE id = $1
    `;

    const result = await db.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
}

export async function updateUserProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { firstName, lastName } = req.body;

    const query = `
      UPDATE users
      SET 
        firstName = COALESCE($2, firstName),
        lastName = COALESCE($3, lastName),
        updatedAt = NOW()
      WHERE id = $1
      RETURNING id, email, firstName as "firstName", lastName as "lastName", createdAt as "createdAt"
    `;

    const result = await db.query(query, [userId, firstName || null, lastName || null]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Failed to update user profile' });
  }
}
