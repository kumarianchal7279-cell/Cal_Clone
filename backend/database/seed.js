const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function seedDatabase() {
  try {
    // Create sample user
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash('password123', 10);

    await pool.query(
      `INSERT INTO users (id, email, password_hash, name, timezone)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, 'demo@example.com', hashedPassword, 'Demo User', 'America/New_York']
    );

    // Create sample event types
    const eventType1Id = uuidv4();
    const eventType2Id = uuidv4();

    await pool.query(
      `INSERT INTO event_types (id, user_id, title, description, duration_minutes, slug, color, buffer_time_minutes, minimum_notice_minutes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9),
              ($10, $11, $12, $13, $14, $15, $16, $17, $18)`,
      [
        eventType1Id, userId, 'One-on-One Meeting', '30-minute meeting', 30, 'one-on-one', '#3b82f6', 15, 60,
        eventType2Id, userId, 'Product Demo', '60-minute product demonstration', 60, 'product-demo', '#10b981', 30, 120
      ]
    );

    // Add availability (Monday-Friday, 9AM-5PM)
    for (let day = 1; day <= 5; day++) {
      await pool.query(
        `INSERT INTO availability (event_type_id, day_of_week, start_time, end_time, timezone, is_active)
         VALUES ($1, $2, $3, $4, $5, $6),
                ($7, $8, $9, $10, $11, $12)`,
        [
          eventType1Id, day, '09:00:00', '17:00:00', 'America/New_York', true,
          eventType2Id, day, '09:00:00', '17:00:00', 'America/New_York', true
        ]
      );
    }

    // Add sample bookings
    const bookingId1 = uuidv4();
    const bookingId2 = uuidv4();

    await pool.query(
      `INSERT INTO bookings (id, event_type_id, booker_name, booker_email, booked_date, booked_time, booked_datetime, status, timezone, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10),
              ($11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
      [
        bookingId1, eventType1Id, 'John Doe', 'john@example.com', '2026-03-30', '10:00:00', 
        new Date('2026-03-30 10:00:00'), 'confirmed', 'America/New_York', 'Discuss Q2 goals',
        bookingId2, eventType2Id, 'Jane Smith', 'jane@example.com', '2026-03-31', '14:00:00',
        new Date('2026-03-31 14:00:00'), 'confirmed', 'America/New_York', 'Product roadmap review'
      ]
    );

    console.log('Database seeded successfully ✓');
    console.log('Test user: demo@example.com / password123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
