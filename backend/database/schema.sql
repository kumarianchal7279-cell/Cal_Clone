-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event Types Table
CREATE TABLE IF NOT EXISTS event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL DEFAULT 30,
  slug VARCHAR(255) NOT NULL,
  color VARCHAR(7) DEFAULT '#3b82f6',
  buffer_time_minutes INT DEFAULT 0,
  minimum_notice_minutes INT DEFAULT 0,
  max_booking_days_ahead INT DEFAULT 90,
  video_call_link VARCHAR(255),
  location VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, slug)
);

-- Availability Table
CREATE TABLE IF NOT EXISTS availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id UUID NOT NULL REFERENCES event_types(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_type_id, day_of_week)
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id UUID NOT NULL REFERENCES event_types(id) ON DELETE CASCADE,
  booker_name VARCHAR(255) NOT NULL,
  booker_email VARCHAR(255) NOT NULL,
  booked_date DATE NOT NULL,
  booked_time TIME NOT NULL,
  booked_datetime TIMESTAMP NOT NULL,
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  status VARCHAR(50) DEFAULT 'confirmed',
  notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_event_types_user_id ON event_types(user_id);
CREATE INDEX idx_event_types_slug ON event_types(slug);
CREATE INDEX idx_availability_event_type ON availability(event_type_id);
CREATE INDEX idx_bookings_event_type ON bookings(event_type_id);
CREATE INDEX idx_bookings_date ON bookings(booked_date);
CREATE INDEX idx_bookings_datetime ON bookings(booked_datetime);
