import { Request, Response } from 'express';
import db from '../db';

interface AuthRequest extends Request {
  userId?: string;
}

export async function getEvents(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;

    const query = `
      SELECT id, userId, title, description, startTime, endTime, location, createdAt, updatedAt
      FROM events
      WHERE userId = $1
      ORDER BY startTime DESC
    `;

    const result = await db.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
}

export async function getEventById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const query = `
      SELECT id, userId, title, description, startTime, endTime, location, createdAt, updatedAt
      FROM events
      WHERE id = $1 AND userId = $2
    `;

    const result = await db.query(query, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Failed to fetch event' });
  }
}

export async function createEvent(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { title, description, startTime, endTime, location } = req.body;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({ message: 'Title, startTime, and endTime are required' });
    }

    const query = `
      INSERT INTO events (userId, title, description, startTime, endTime, location, createdAt, updatedAt)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, userId, title, description, startTime, endTime, location, createdAt, updatedAt
    `;

    const result = await db.query(query, [userId, title, description || '', startTime, endTime, location || '']);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
}

export async function updateEvent(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { title, description, startTime, endTime, location } = req.body;

    // Check if event belongs to user
    const checkQuery = 'SELECT * FROM events WHERE id = $1 AND userId = $2';
    const checkResult = await db.query(checkQuery, [id, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const query = `
      UPDATE events
      SET 
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        startTime = COALESCE($4, startTime),
        endTime = COALESCE($5, endTime),
        location = COALESCE($6, location),
        updatedAt = NOW()
      WHERE id = $1 AND userId = $7
      RETURNING id, userId, title, description, startTime, endTime, location, createdAt, updatedAt
    `;

    const result = await db.query(query, [id, title || null, description || null, startTime || null, endTime || null, location || null, userId]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Failed to update event' });
  }
}

export async function deleteEvent(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Check if event belongs to user
    const checkQuery = 'SELECT * FROM events WHERE id = $1 AND userId = $2';
    const checkResult = await db.query(checkQuery, [id, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const query = 'DELETE FROM events WHERE id = $1 AND userId = $2 RETURNING id';
    const result = await db.query(query, [id, userId]);

    res.json({ message: 'Event deleted successfully', id: result.rows[0]?.id });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Failed to delete event' });
  }
}

export async function getEventsByDateRange(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }

    const query = `
      SELECT id, userId, title, description, startTime, endTime, location, createdAt, updatedAt
      FROM events
      WHERE userId = $1
        AND startTime >= $2
        AND endTime <= $3
      ORDER BY startTime ASC
    `;

    const result = await db.query(query, [userId, startDate, endDate]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching events by date range:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
}
