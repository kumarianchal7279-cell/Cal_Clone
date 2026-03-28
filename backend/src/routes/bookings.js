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

// Get all bookings for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.*, 
        e.title as event_type_title, 
        e.slug as event_type_slug, 
        e.duration_minutes,
        e.user_id
      FROM bookings b
      JOIN event_types e ON b.event_type_id = e.id
      WHERE e.user_id = $1
      ORDER BY b.booked_datetime DESC
    `, [req.user.userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bookings for specific event type (authenticated user only)
router.get('/event/:eventTypeId', authenticateToken, async (req, res) => {
  try {
    // Verify ownership
    const eventType = await pool.query(
      'SELECT user_id FROM event_types WHERE id = $1',
      [req.params.eventTypeId]
    );

    if (eventType.rows.length === 0) {
      return res.status(404).json({ error: 'Event type not found' });
    }

    if (eventType.rows[0].user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to view these bookings' });
    }

    const result = await pool.query(
      `SELECT * FROM bookings 
       WHERE event_type_id = $1 AND status = 'confirmed'
       ORDER BY booked_datetime DESC`,
      [req.params.eventTypeId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get upcoming bookings for authenticated user
router.get('/upcoming/list', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.*, 
        e.title as event_type_title, 
        e.slug as event_type_slug
      FROM bookings b
      JOIN event_types e ON b.event_type_id = e.id
      WHERE e.user_id = $1 AND b.booked_datetime >= CURRENT_TIMESTAMP AND b.status = 'confirmed'
      ORDER BY b.booked_datetime ASC
    `, [req.user.userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get past bookings for authenticated user
router.get('/past/list', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.*, 
        e.title as event_type_title, 
        e.slug as event_type_slug
      FROM bookings b
      JOIN event_types e ON b.event_type_id = e.id
      WHERE e.user_id = $1 AND b.booked_datetime < CURRENT_TIMESTAMP AND b.status = 'confirmed'
      ORDER BY b.booked_datetime DESC
    `, [req.user.userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel booking (authenticated user only)
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { cancellation_reason } = req.body;

    // Verify ownership
    const booking = await pool.query(
      `SELECT b.*, e.user_id FROM bookings b
       JOIN event_types e ON b.event_type_id = e.id
       WHERE b.id = $1`,
      [req.params.id]
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.rows[0].user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to cancel this booking' });
    }

    const result = await pool.query(
      `UPDATE bookings 
       SET status = 'cancelled', cancellation_reason = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [cancellation_reason || null, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reschedule booking (authenticated user only)
router.put('/:id/reschedule', authenticateToken, async (req, res) => {
  try {
    const { booked_date, booked_time } = req.body;

    if (!booked_date || !booked_time) {
      return res.status(400).json({ error: 'booked_date and booked_time are required' });
    }

    // Verify ownership
    const booking = await pool.query(
      `SELECT b.*, e.user_id FROM bookings b
       JOIN event_types e ON b.event_type_id = e.id
       WHERE b.id = $1`,
      [req.params.id]
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.rows[0].user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to reschedule this booking' });
    }

    // Create new datetime from date and time
    const booked_datetime = new Date(`${booked_date}T${booked_time}`);

    const result = await pool.query(
      `UPDATE bookings 
       SET booked_date = $1, booked_time = $2, booked_datetime = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [booked_date, booked_time, booked_datetime, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update booking notes (authenticated user only)
router.put('/:id/notes', authenticateToken, async (req, res) => {
  try {
    const { notes } = req.body;

    // Verify ownership
    const booking = await pool.query(
      `SELECT b.*, e.user_id FROM bookings b
       JOIN event_types e ON b.event_type_id = e.id
       WHERE b.id = $1`,
      [req.params.id]
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.rows[0].user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to update this booking' });
    }

    const result = await pool.query(
      `UPDATE bookings 
       SET notes = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [notes || null, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
