-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  startTime TIMESTAMP NOT NULL,
  endTime TIMESTAMP NOT NULL,
  location VARCHAR(255),
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_events_userId ON events(userId);
CREATE INDEX IF NOT EXISTS idx_events_startTime ON events(startTime);
CREATE INDEX IF NOT EXISTS idx_events_endTime ON events(endTime);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
