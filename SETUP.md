# Calendar Clone - Complete Setup Guide

This guide will walk you through setting up the entire Calendar Clone application with user authentication, settings management, and event scheduling.

## Requirements

- **Node.js** v16 or higher
- **PostgreSQL** v12 or higher
- **npm** or **yarn**
- **Git** (optional, for version control)

## Project Structure

```
Cal_Clone/
├── frontend/                          # React/Next.js frontend
│   ├── pages/
│   │   ├── login.tsx                 # Login page
│   │   ├── register.tsx              # Registration page
│   │   ├── calendar.tsx              # Calendar/events page
│   │   └── settings.tsx              # User settings page
│   ├── styles/
│   │   ├── login-page.module.css
│   │   ├── register-page.module.css
│   │   ├── calendar-page.module.css
│   │   └── settings-page.module.css
│   ├── components/                   # Reusable components
│   └── package.json
│
├── backend/                           # Node.js/Express backend
│   ├── routes/
│   │   ├── authRoutes.ts            # Auth endpoints
│   │   ├── userRoutes.ts            # User/settings endpoints
│   │   └── eventsRoutes.ts          # Event endpoints
│   ├── controllers/
│   │   ├── authController.ts        # Auth logic
│   │   ├── userController.ts        # User logic
│   │   └── eventController.ts       # Event logic
│   ├── middleware/
│   │   └── auth.ts                  # JWT authentication
│   ├── migrations/
│   │   ├── 000_init.sql            # Initial schema
│   │   └── 001_create_user_settings.sql  # User settings schema
│   ├── app.ts                       # Express app
│   ├── db.ts                        # Database connection
│   └── package.json
│
├── .env.example                     # Environment variables template
└── README.md                        # Project documentation
```

## Step 1: Database Setup

### 1.1 Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE calendar_app;

# Connect to the new database
\c calendar_app

# Exit psql
\q
```

### 1.2 Run Migration Scripts

```bash
# Run initial schema migration
psql -U postgres -d calendar_app -f backend/migrations/000_init.sql

# Run user settings migration
psql -U postgres -d calendar_app -f backend/migrations/001_create_user_settings.sql
```

Verify tables were created:
```bash
psql -U postgres -d calendar_app
\dt
```

You should see:
- events
- users
- user_settings
- token_blacklist
- refresh_tokens

## Step 2: Backend Setup

### 2.1 Navigate to Backend Directory

```bash
cd backend
```

### 2.2 Install Dependencies

```bash
npm install
```

### 2.3 Create Environment File

Create `.env` file in the backend directory:

```bash
cp ../.env.example .env
```

Edit `.env` with your database credentials:

```env
# Database Configuration
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_HOST=localhost
DB_PORT=5432
DB_NAME=calendar_app

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production

# Client Configuration
CLIENT_URL=http://localhost:3000
```

### 2.4 Start Backend Server

```bash
npm run dev
```

You should see:
```
Server is running on port 5000
```

The backend is now running at `http://localhost:5000`

## Step 3: Frontend Setup

### 3.1 Navigate to Frontend Directory

Open a new terminal window:

```bash
cd frontend
```

### 3.2 Install Dependencies

```bash
npm install
```

### 3.3 Create Environment File

Create `.env.local` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3.4 Start Frontend Server

```bash
npm start
```

The frontend will open automatically at `http://localhost:3000`

## Step 4: Testing the Application

### 4.1 Register a New User

1. Click "Sign Up" on the login page
2. Enter:
   - Email: `user@example.com`
   - Password: `password123`
   - First Name: `John`
   - Last Name: `Doe`
3. Click "Create Account"

### 4.2 Login

1. Enter your email and password
2. Click "Login"
3. You'll be redirected to the calendar page

### 4.3 Create an Event

1. On the calendar page, click "Create Event"
2. Fill in:
   - Title: "Team Meeting"
   - Description: "Quarterly review"
   - Start Time: Pick a future date and time
   - End Time: 1 hour after start time
   - Location: "Conference Room A"
3. Click "Save Event"

### 4.4 Update User Settings

1. Click "Settings" in the navigation
2. Update:
   - First Name
   - Last Name
   - Timezone
   - Email Notifications preference
3. Click "Save Changes"
4. You should see a success message

### 4.5 Logout

1. Click "Logout" button at the bottom of settings
2. You'll be redirected to the login page

## Authentication Flow

### Registration
```
POST /api/auth/register
Body: { email, password, firstName, lastName }
Response: { user, token, refreshToken }
```

### Login
```
POST /api/auth/login
Body: { email, password }
Response: { user, token, refreshToken }
```

### Logout
```
POST /api/auth/logout
Headers: { Authorization: Bearer <token> }
```

## Token Management

The application uses JWT tokens with:
- **Access Token**: 24-hour expiration
- **Refresh Token**: 7-day expiration
- **Token Blacklisting**: On logout, tokens are added to blacklist

Tokens are stored in `localStorage`:
```javascript
localStorage.getItem('token')      // Access token
localStorage.getItem('refreshToken') // Refresh token
```

## API Endpoints

### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
POST   /api/auth/logout            - Logout user
POST   /api/auth/refresh           - Refresh access token
GET    /api/auth/me                - Get current user
```

### User Settings
```
GET    /api/user/settings          - Get user settings
PUT    /api/user/settings          - Update settings
GET    /api/user/profile           - Get user profile
PUT    /api/user/profile           - Update profile
```

### Events
```
GET    /api/events                 - Get all user events
POST   /api/events                 - Create new event
GET    /api/events/:id             - Get event by ID
PUT    /api/events/:id             - Update event
DELETE /api/events/:id             - Delete event
GET    /api/events/range           - Get events in date range
```

## Database Schema

### users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL
);
```

### events Table
```sql
CREATE TABLE events (
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
```

### user_settings Table
```sql
CREATE TABLE user_settings (
  id SERIAL PRIMARY KEY,
  userId INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  timezone VARCHAR(50) DEFAULT 'UTC',
  emailNotifications BOOLEAN DEFAULT true,
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL
);
```

### refresh_tokens Table
```sql
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### token_blacklist Table
```sql
CREATE TABLE token_blacklist (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

## Troubleshooting

### Port Already in Use

**Problem**: Can't start backend on port 5000

**Solution**:
```bash
# Kill process on port 5000
# Windows (PowerShell):
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force

# macOS/Linux:
lsof -ti:5000 | xargs kill -9
```

### Database Connection Error

**Problem**: Cannot connect to PostgreSQL

**Check**:
1. PostgreSQL is running
2. Credentials in `.env` are correct
3. Database `calendar_app` exists

```bash
# List databases
psql -U postgres -l

# Connect to database
psql -U postgres -d calendar_app
```

### Migrations Failed

**Problem**: Tables not created

**Solution**:
```bash
# Check if tables exist
psql -U postgres -d calendar_app
\dt

# If missing, run migrations manually
psql -U postgres -d calendar_app -f backend/migrations/000_init.sql
psql -U postgres -d calendar_app -f backend/migrations/001_create_user_settings.sql
```

### JWT Token Errors

**Problem**: "Invalid token" or "Token expired"

**Solutions**:
1. Clear localStorage: Refresh page, logout, login again
2. Reset JWT_SECRET in `.env` (development only)
3. Check token expiration times

### CORS Errors

**Problem**: Frontend can't reach backend

**Check**:
1. Backend is running on port 5000
2. `CLIENT_URL` in backend `.env` matches frontend URL
3. Browser console for specific CORS error

## Development Tips

### Local Testing with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Create Event (use token from login response)
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Test Event",
    "description": "Testing event creation",
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T11:00:00Z",
    "location": "Test Location"
  }'
```

### Debugging

Enable more verbose logging:
1. Add `console.log()` statements in controllers
2. Use VS Code debugger (add breakpoints)
3. Check browser DevTools Network tab for API calls

## Production Deployment

### Before Deploying

1. Change `JWT_SECRET` and `JWT_REFRESH_SECRET` to strong random values
2. Set `NODE_ENV=production`
3. Use a production PostgreSQL instance
4. Enable HTTPS
5. Set up proper error logging
6. Configure CORS for production domain

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
DB_USER=prod_user
DB_PASSWORD=strong_password_here
DB_HOST=prod.db.host.com
DB_NAME=calendar_app_prod
JWT_SECRET=very_long_random_string_here
JWT_REFRESH_SECRET=another_long_random_string_here
CLIENT_URL=https://yourapp.com
```

### Database Backup

```bash
# Backup database
pg_dump -U postgres calendar_app > backup.sql

# Restore database
psql -U postgres calendar_app < backup.sql
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review error logs in browser console and backend terminal
3. Verify all dependencies are installed: `npm list`
4. Ensure PostgreSQL is running and database is created

## Next Steps

After setup is complete:
1. Explore the calendar interface
2. Create multiple events to test functionality
3. Try different timezones in settings
4. Test logout and login flow
5. Consider adding additional features from the roadmap
