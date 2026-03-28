const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

// Get event type by slug (public)
router.get('/event/:slug', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM event_types WHERE slug = $1', [req.params.slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event type not found' });
    }

    const eventType = result.rows[0];

    // Get availability
    const availResult = await pool.query(
      'SELECT * FROM availability WHERE event_type_id = $1 ORDER BY day_of_week',
      [eventType.id]
    );

    res.json({
      ...eventType,
      availability: availResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available slots for a date
router.get('/slots/:eventTypeId/:date', async (req, res) => {
  try {
    const { eventTypeId, date } = req.params;
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    // Get availability for this day
    const availResult = await pool.query(
      'SELECT * FROM availability WHERE event_type_id = $1 AND day_of_week = $2',
      [eventTypeId, dayOfWeek]
    );

    if (availResult.rows.length === 0) {
      return res.json({ slots: [] });
    }

    const availability = availResult.rows[0];
    const eventDuration = await getEventTypeDuration(eventTypeId);
    const durationMinutes = eventDuration.duration_minutes;

    // Get booked slots for this date
    const bookedResult = await pool.query(
      `SELECT booked_time FROM bookings 
       WHERE event_type_id = $1 AND booked_date = $2 AND status = 'confirmed'`,
      [eventTypeId, date]
    );

    const bookedTimes = bookedResult.rows.map(b => b.booked_time);

    // Generate available slots
    const slots = generateSlots(availability.start_time, availability.end_time, durationMinutes, bookedTimes);

    res.json({ slots });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create booking (public)
router.post('/booking', async (req, res) => {
  try {
    const { event_type_id, booker_name, booker_email, booked_date, booked_time } = req.body;
    const id = uuidv4();

    // Check if slot is already booked
    const checkResult = await pool.query(
      `SELECT * FROM bookings 
       WHERE event_type_id = $1 AND booked_date = $2 AND booked_time = $3 AND status = 'confirmed'`,
      [event_type_id, booked_date, booked_time]
    );

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'This time slot is already booked' });
    }

    const booked_datetime = `${booked_date} ${booked_time}`;

    const result = await pool.query(
      `INSERT INTO bookings (id, event_type_id, booker_name, booker_email, booked_date, booked_time, booked_datetime, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [id, event_type_id, booker_name, booker_email, booked_date, booked_time, booked_datetime, 'confirmed']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function
async function getEventTypeDuration(eventTypeId) {
  const result = await pool.query(
    'SELECT duration_minutes FROM event_types WHERE id = $1',
    [eventTypeId]
  );
  return {
    duration_minutes: result.rows[0]?.duration_minutes || 30
  };
}

function generateSlots(startTime, endTime, durationMinutes, bookedTimes) {
  const slots = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let hours = startHour;
  let mins = startMin;

  while (hours < endHour || (hours === endHour && mins < endMin)) {
    const timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    if (!bookedTimes.includes(timeStr)) {
      slots.push(timeStr);
    }
    mins += durationMinutes;
    if (mins >= 60) {
      hours += Math.floor(mins / 60);
      mins = mins % 60;
    }
  }

  return slots;
}

module.exports = router;
