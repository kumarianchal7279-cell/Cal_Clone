# Cal.com Clone Setup Guide

## Quick Start (Windows)

1. **Database Setup:**
   ```bash
   createdb calendar_app
   psql -U postgres -d calendar_app -f backend/migrations/000_init.sql
   psql -U postgres -d calendar_app -f backend/migrations/001_create_user_settings.sql
   ```

2. **Configure Backend:**
   - Navigate to `backend` folder
   - Copy `.env.example` to `.env`
   - Edit `.env` with your database credentials:
     ```
     DB_USER=postgres
     DB_PASSWORD=your_password
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=calendar_app
     JWT_SECRET=your_secret_key
     JWT_REFRESH_SECRET=your_refresh_secret
     ```

3. **Start both servers in separate terminals:**
   
   **Terminal 1 (Backend):**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   
   **Terminal 2 (Frontend):**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - Login/Register: http://localhost:3000

## What's Included

✅ User Authentication (Register, Login, Logout)
✅ JWT Token Management with Refresh
✅ User Settings Management (Profile, Timezone, Notifications)
✅ Calendar & Event Management (CRUD operations)
✅ Full Next.js frontend with modern React & TypeScript
✅ Express.js backend with PostgreSQL
✅ Database schema with proper relationships
✅ Protected API endpoints with auth middleware
✅ Cal.com-inspired responsive UI with CSS Modules
✅ Comprehensive API documentation

## First Time Setup

1. Register a new account
   - Email: any@email.com
   - Password: Choose strong password
   - Name: Your name

2. Login with your credentials

3. Create your first event
   - Fill in event details
   - Select date and time
   - Save

4. Manage your settings
   - Update profile info
   - Select timezone
   - Manage notification preferences

5. View all events on calendar page

## Key Files to Review

- `README.md` - Full project documentation
- `SETUP.md` - Detailed setup instructions
- `IMPLEMENTATION.md` - Feature implementation details
- `backend/migrations/` - Database schema
- `backend/routes/` - API endpoints
- `backend/controllers/` - Business logic
- `frontend/pages/` - Page components
- `frontend/styles/` - CSS styling

## Default Credentials

Once seeded, you'll have:

**Event Types:**
- One-on-One Meeting (slug: `one-on-one`)
- Product Demo (slug: `product-demo`)

**Sample Bookings:**
- John Doe's booking on March 30
- Jane Smith's booking on March 31

## Troubleshooting

**"Database connection error"**
- Ensure PostgreSQL is running
- Check DATABASE_URL in backend/.env

**"Port 3000/5000 already in use"**
- Change ports in .env files or kill the process using those ports

**"Module not found"**
- Run `npm install` in both backend and frontend directories

## Next Steps

1. Set up your event types and availability
2. Share the public booking link
3. Monitor bookings in the dashboard
4. Customize colors and text as needed

See README.md for complete documentation.
