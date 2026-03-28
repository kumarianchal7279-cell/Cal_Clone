-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id SERIAL PRIMARY KEY,
  userId INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  timezone VARCHAR(50) DEFAULT 'UTC',
  emailNotifications BOOLEAN DEFAULT true,
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL
);

-- Create token blacklist table for logout functionality
CREATE TABLE IF NOT EXISTS token_blacklist (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Create refresh_tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_token_blacklist_userId ON token_blacklist(userId);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expiresAt ON token_blacklist(expiresAt);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_userId ON refresh_tokens(userId);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expiresAt ON refresh_tokens(expiresAt);
