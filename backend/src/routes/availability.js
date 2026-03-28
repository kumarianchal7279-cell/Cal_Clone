const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Middleware to require authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Get availability for event type (public endpoint)
router.get('/:eventTypeId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM availability WHERE event_type_id = $1 AND is_active = true ORDER BY day_of_week',
      [req.params.eventTypeId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set availability for a day (requires authentication)
router.post('/:eventTypeId', authenticateToken, async (req, res) => {
  try {
    const { day_of_week, start_time, end_time, timezone } = req.body;
    
    if (!day_of_week || !start_time || !end_time) {
      return res.status(400).json({ error: 'day_of_week, start_time, and end_time are required' });
    }

    // Verify user owns this event type
    const eventType = await pool.query(
      'SELECT user_id FROM event_types WHERE id = $1',
      [req.params.eventTypeId]
    );

    if (eventType.rows.length === 0) {
      return res.status(404).json({ error: 'Event type not found' });
    }

    if (eventType.rows[0].user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to set availability for this event type' });
    }

    const id = uuidv4();

    const result = await pool.query(
      `INSERT INTO availability (id, event_type_id, day_of_week, start_time, end_time, timezone, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, req.params.eventTypeId, day_of_week, start_time, end_time, timezone || 'America/New_York', true]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Availability already exists for this day' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update availability (requires authentication)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { start_time, end_time, timezone } = req.body;

    // Verify user owns this availability through the event type
    const availability = await pool.query(
      `SELECT a.* FROM availability a
       JOIN event_types et ON a.event_type_id = et.id
       WHERE a.id = $1`,
      [req.params.id]
    );

    if (availability.rows.length === 0) {
      return res.status(404).json({ error: 'Availability not found' });
    }

    // Verify ownership through event types
    const eventType = await pool.query(
      'SELECT user_id FROM event_types WHERE id = $1',
      [availability.rows[0].event_type_id]
    );

    if (eventType.rows[0].user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to update this availability' });
    }

    const result = await pool.query(
      `UPDATE availability 
       SET start_time = $1, end_time = $2, timezone = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [start_time, end_time, timezone || 'America/New_York', req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete availability (requires authentication)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Verify user owns this availability
    const availability = await pool.query(
      `SELECT a.* FROM availability a
       JOIN event_types et ON a.event_type_id = et.id
       WHERE a.id = $1`,
      [req.params.id]
    );

    if (availability.rows.length === 0) {
      return res.status(404).json({ error: 'Availability not found' });
    }

    const eventType = await pool.query(
      'SELECT user_id FROM event_types WHERE id = $1',
      [availability.rows[0].event_type_id]
    );

    if (eventType.rows[0].user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this availability' });
    }

    const result = await pool.query('DELETE FROM availability WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Availability not found' });
    }
    res.json({ message: 'Availability deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
