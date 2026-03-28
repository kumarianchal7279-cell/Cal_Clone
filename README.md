# Cal.com Clone - Scheduling Platform

A fully functional scheduling/booking web application that replicates Cal.com's design and user experience. Users can create event types, set their availability, and allow others to book time slots through a public booking page.

## Tech Stack

- **Frontend**: Next.js with React
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **Styling**: Custom CSS (Cal.com-inspired design)

## Project Structure

```
Cal_Clone/
├── frontend/               # Next.js frontend application
│   ├── pages/             # Page components
│   │   ├── _app.js       # App wrapper with global styles
│   │   ├── index.js      # Dashboard (event types management)
│   │   ├── bookings.js   # Bookings dashboard
│   │   └── [slug].js     # Public booking page
│   ├── styles/           # CSS files
│   │   ├── globals.css   # Global styles
│   │   ├── dashboard.css # Dashboard styles
│   │   ├── bookings.css  # Bookings styles
│   │   └── booking.css   # Public booking page styles
│   ├── lib/              # Utilities
│   │   └── api.js        # API client
│   └── package.json
│
└── backend/              # Node.js backend application
    ├── src/
    │   ├── index.js      # Express server entry point
    │   ├── config/
    │   │   └── database.js    # Database connection
    │   └── routes/
    │       ├── eventTypes.js  # Event types CRUD endpoints
    │       ├── availability.js # Availability management endpoints
    │       ├── bookings.js     # Bookings endpoints
    │       └── public.js       # Public API endpoints
    ├── database/
    │   ├── schema.sql    # Database schema
    │   ├── setup.js      # Setup script
    │   └── seed.js       # Sample data seeding
    └── package.json
```

## Features

### Core Features (Implemented)

1. **Event Types Management**
   - Create, edit, delete event types
   - Set duration, title, description, URL slug, and color
   - Unique public booking links for each event type

2. **Availability Settings**
   - Set available days of the week (Monday-Sunday)
   - Set time slots for each day (e.g., 9:00 AM - 5:00 PM)
   - Support for different timezones

3. **Public Booking Page**
   - Interactive calendar to select dates
   - Display available time slots based on availability
   - Booking form with name and email fields
   - Prevent double booking of the same time slot
   - Booking confirmation page with event details

4. **Bookings Dashboard**
   - View upcoming bookings
   - View past bookings
   - Cancel existing bookings

5. **User Settings Management**
   - Update profile information (first name, last name)
   - Configure timezone preferences
   - Manage email notification settings
   - Logout functionality with token blacklisting
   - Secure password hashing with bcrypt

### Database Schema

**event_types**
- id (UUID)
- title (VARCHAR)
- description (TEXT)
- duration_minutes (INT)
- slug (VARCHAR, UNIQUE)
- color (VARCHAR)
- created_at, updated_at (TIMESTAMP)

**availability**
- id (UUID)
- event_type_id (UUID FK)
- day_of_week (INT, 0-6)
- start_time (TIME)
- end_time (TIME)
- timezone (VARCHAR)
- created_at, updated_at (TIMESTAMP)

**bookings**
- id (UUID)
- event_type_id (UUID FK)
- booker_name (VARCHAR)
- booker_email (VARCHAR)
- booked_date (DATE)
- booked_time (TIME)
- booked_datetime (TIMESTAMP)
- status (VARCHAR - confirmed/cancelled)
- created_at, updated_at (TIMESTAMP)

**users**
- id (SERIAL PRIMARY KEY)
- email (VARCHAR UNIQUE NOT NULL)
- password (VARCHAR NOT NULL)
- firstName (VARCHAR)
- lastName (VARCHAR)
- created_at, updated_at (TIMESTAMP)

**user_settings**
- id (SERIAL PRIMARY KEY)
- userId (INTEGER FK to users.id)
- timezone (VARCHAR DEFAULT 'UTC')
- emailNotifications (BOOLEAN DEFAULT true)
- created_at, updated_at (TIMESTAMP)

**refresh_tokens**
- id (SERIAL PRIMARY KEY)
- userId (INTEGER FK to users.id)
- token (TEXT UNIQUE NOT NULL)
- expiresAt (TIMESTAMP NOT NULL)
- created_at (TIMESTAMP)

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** (copy from `.env.example`)
   ```bash
   cp .env.example .env
   ```

4. **Update `.env` with your database credentials**
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/cal_clone
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

5. **Create the database**
   ```bash
   createdb cal_clone
   ```

6. **Setup database schema**
   ```bash
   npm run db:setup
   ```

7. **Seed sample data**
   ```bash
   npm run db:seed
   ```

8. **Start the backend server**
   ```bash
   npm run dev
   ```

The backend will be running on `http://localhost:5000`

### Frontend Setup

1. **In a new terminal, navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env.local` file** (copy from `.env.local.example`)
   ```bash
   cp .env.local.example .env.local
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The frontend will be running on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### User Settings
- `GET /api/user/settings` - Get user settings
- `PUT /api/user/settings` - Update user settings
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Event Types
- `GET /api/event-types` - Get all event types
- `GET /api/event-types/:id` - Get single event type
- `POST /api/event-types` - Create event type
- `PUT /api/event-types/:id` - Update event type
- `DELETE /api/event-types/:id` - Delete event type

### Availability
- `GET /api/availability/:eventTypeId` - Get availability for event type
- `POST /api/availability/:eventTypeId` - Set availability for a day
- `PUT /api/availability/:id` - Update availability
- `DELETE /api/availability/:id` - Delete availability

### Bookings (Admin)
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/upcoming/list` - Get upcoming bookings
- `GET /api/bookings/past/list` - Get past bookings
- `PUT /api/bookings/:id/cancel` - Cancel a booking

### Public API
- `GET /api/public/event/:slug` - Get event type details (public)
- `GET /api/public/slots/:eventTypeId/:date` - Get available slots for a date
- `POST /api/public/booking` - Create a public booking

## Usage

### For Event Creators

1. Go to `http://localhost:3000`
2. Create event types with title, description, and duration
3. Set your availability for each day of the week
4. Share the public booking link found on each event type card
5. View all bookings in the Bookings dashboard

### For Bookers

1. Visit the public booking link: `http://localhost:3000/[event-slug]`
2. Select a date from the calendar
3. Choose available time slot
4. Enter your name and email
5. Confirm your booking
6. You'll receive a confirmation message with details

## Testing with Sample Data

The application comes with sample data:
- 2 event types: "One-on-One Meeting" and "Product Demo"
- Availability set for Monday-Friday, 9AM-5PM
- 2 sample bookings for testing

## Design Inspiration

The UI closely follows Cal.com's design patterns:
- Clean, minimal interface
- Clear color-coded event types
- Intuitive calendar picker
- Smooth multi-step booking flow
- Professional and modern appearance

## Deployment

### Deploy Backend (Render, Railway, Heroku)

1. Push code to GitHub
2. Connect repository to deployment platform
3. Set environment variables (DATABASE_URL, etc.)
4. Deploy

### Deploy Frontend (Vercel, Netlify)

1. Push code to GitHub
2. Connect repository to deployment platform
3. Set NEXT_PUBLIC_API_URL to your backend URL
4. Deploy

## Key Code Decisions

1. **Simple Slot Generation**: Time slots are generated server-side for simplicity
2. **No Authentication**: Admin features assume a logged-in default user for this assignment
3. **UTC Timezone Handling**: Dates and times stored in database, timezone conversion on frontend
4. **CSS Only Styling**: No external UI libraries for maximum customization and learning
5. **REST API**: Simple, straightforward API design for easy understanding and debugging

## Assumptions

1. Default user is always logged in (no auth system required)
2. Each user has one default schedule (extendable to multiple schedules)
3. Timezones are stored but not actively converted (can be enhanced)
4. Buffer time between meetings is not implemented (good to-have feature)
5. Email notifications are not implemented (good to-have feature)

## Future Enhancements

- [x] User authentication and profiles
- [x] Email notifications settings
- [ ] Multiple availability schedules
- [ ] Date overrides for blackout dates
- [ ] Email notifications on booking/cancellation
- [ ] Buffer time between meetings
- [ ] Custom booking questions
- [ ] Recurring bookings
- [ ] Payment integration
- [ ] Calendar synchronization (Google, Outlook)

## Code Quality Notes

- Clean, modular code structure
- Separation of concerns (routes, API client, styles)
- Reusable components and functions
- Proper error handling
- Database indexes for performance
- Clear variable and function naming

## Troubleshooting

**Database connection error**: Ensure PostgreSQL is running and credentials are correct
**Port already in use**: Change PORT in `.env` or `.env.local`
**CORS errors**: Verify FRONTEND_URL in backend `.env` matches your frontend URL
**API not found**: Ensure backend is running on correct port

## License

This project is created for educational purposes as part of the SDE Intern assignment.

## Support

For issues or questions, please refer to the code comments and database schema documentation included in the project.
