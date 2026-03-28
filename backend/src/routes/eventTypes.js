const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Middleware to extract user from token (optional)
const extractUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // Token invalid, but we allow public access
    }
  }
  next();
};

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

// Get all event types (for authenticated user)
router.get('/', extractUser, async (req, res) => {
  try {
    let query = 'SELECT * FROM event_types';
    let params = [];

    if (req.user) {
      query += ' WHERE user_id = $1';
      params.push(req.user.userId);
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single event type by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM event_types WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event type not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create event type (requires authentication)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, duration_minutes, slug, color, buffer_time_minutes, minimum_notice_minutes } = req.body;
    const id = uuidv4();

    if (!title || !slug) {
      return res.status(400).json({ error: 'Title and slug are required' });
    }

    const result = await pool.query(
      `INSERT INTO event_types (id, user_id, title, description, duration_minutes, slug, color, buffer_time_minutes, minimum_notice_minutes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        id, 
        req.user.userId, 
        title, 
        description || null, 
        duration_minutes || 30, 
        slug, 
        color || '#3b82f6',
        buffer_time_minutes || 0,
        minimum_notice_minutes || 0
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Slug already exists for this user' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update event type (requires authentication)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, duration_minutes, slug, color, buffer_time_minutes, minimum_notice_minutes } = req.body;
    
    // Verify ownership
    const checkOwner = await pool.query('SELECT user_id FROM event_types WHERE id = $1', [req.params.id]);
    if (checkOwner.rows.length === 0) {
      return res.status(404).json({ error: 'Event type not found' });
    }
    if (checkOwner.rows[0].user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to update this event type' });
    }

    const result = await pool.query(
      `UPDATE event_types 
       SET title = $1, description = $2, duration_minutes = $3, slug = $4, color = $5, 
           buffer_time_minutes = $6, minimum_notice_minutes = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND user_id = $9 RETURNING *`,
      [title || null, description || null, duration_minutes || 30, slug, color || '#3b82f6', 
       buffer_time_minutes || 0, minimum_notice_minutes || 0, req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event type not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Slug already exists for this user' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete event type (requires authentication)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Verify ownership
    const checkOwner = await pool.query('SELECT user_id FROM event_types WHERE id = $1', [req.params.id]);
    if (checkOwner.rows.length === 0) {
      return res.status(404).json({ error: 'Event type not found' });
    }
    if (checkOwner.rows[0].user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this event type' });
    }

    const result = await pool.query('DELETE FROM event_types WHERE id = $1 AND user_id = $2 RETURNING *', 
      [req.params.id, req.user.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event type not found' });
    }
    res.json({ message: 'Event type deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

module.exports = router;
