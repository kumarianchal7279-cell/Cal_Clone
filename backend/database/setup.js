const fs = require('fs');
const path = require('path');
const pool = require('../src/config/database');

async function setupDatabase() {
  try {
    // Drop existing tables if they exist (in correct order for foreign keys)
    await pool.query(`
      DROP TABLE IF EXISTS bookings CASCADE;
      DROP TABLE IF EXISTS availability CASCADE;
      DROP TABLE IF EXISTS event_types CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    console.log('Dropped existing tables');

    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('Database schema created successfully ✓');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
