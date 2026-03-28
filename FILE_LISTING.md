# 📂 Cal.com Clone - Complete File Directory

## Project Root: `e:\Cal_Clone\`

```
Cal_Clone/
│
├── 📄 START_HERE.md                    ← START HERE! Quick start & usage guide
├── 📄 README.md                        ← Full project documentation
├── 📄 QUICKSTART.md                    ← Fast setup instructions
├── 📄 SUBMISSION_GUIDE.md              ← Interview & deployment guide
├── 📄 ARCHITECTURE.md                  ← System design & diagrams
├── 📄 PROJECT_INVENTORY.json           ← File listing (this script)
├── 📄 FILE_LISTING.md                  ← This file
│
├── 📜 setup.bat                        ← Run this on Windows for auto setup
├── 📜 setup.sh                         ← Run this on Mac/Linux for auto setup
│
│
├── 📁 backend/                         ← Node.js Express Server
│   │
│   ├── 📄 package.json
│   ├── 📄 .env.example                 ← Copy to .env and fill in values
│   ├── 📄 .gitignore
│   │
│   ├── 📁 src/
│   │   ├── 📄 index.js                 ← MAIN SERVER FILE (Start here for code review)
│   │   │   • Express setup
│   │   │   • Middleware config (CORS, JSON)
│   │   │   • Route mounting
│   │   │   • Error handling
│   │   │   ~45 lines
│   │   │
│   │   ├── 📁 config/
│   │   │   └── 📄 database.js          ← PostgreSQL connection pool
│   │   │       • Connection pooling
│   │   │       • Error events
│   │   │       ~20 lines
│   │   │
│   │   └── 📁 routes/
│   │       ├── 📄 eventTypes.js        ← Event Types API (CRUD)
│   │       │   POST /   - Create with title, slug, duration
│   │       │   GET /    - List all event types
│   │       │   GET /:id - Get single event
│   │       │   PUT /:id - Update event
│   │       │   DELETE /:id - Delete event
│   │       │   ~55 lines
│   │       │
│   │       ├── 📄 availability.js      ← Availability API
│   │       │   GET /:eventTypeId  - Get availability for event
│   │       │   POST /:eventTypeId - Set availability for a day
│   │       │   PUT /:id           - Update availability
│   │       │   DELETE /:id        - Delete availability
│   │       │   ~50 lines
│   │       │
│   │       ├── 📄 bookings.js         ← Bookings API (Admin)
│   │       │   GET /              - All bookings
│   │       │   GET /upcoming/list - Upcoming bookings
│   │       │   GET /past/list     - Past bookings
│   │       │   PUT /:id/cancel    - Cancel booking
│   │       │   ~60 lines
│   │       │
│   │       └── 📄 public.js           ← Public Booking API
│   │           GET /event/:slug        - Get event details (PUBLIC)
│   │           GET /slots/:id/:date    - Get available slots
│   │           POST /booking           - Create booking (PUBLIC)
│   │           Includes: Slot generation, Double-booking prevention
│   │           ~80 lines
│   │
│   └── 📁 database/
│       ├── 📄 schema.sql              ← DATABASE DESIGN (Review for interview)
│       │   • event_types table (UUID, title, slug, duration, color)
│       │   • availability table (day_of_week, times, timezone)
│       │   • bookings table (name, email, date/time, status)
│       │   • Relationships (foreign keys)
│       │   • Indexes for performance
│       │   ~50 lines SQL
│       │
│       ├── 📄 setup.js               ← Initialize database
│       │   Run: npm run db:setup
│       │   Creates tables from schema.sql
│       │   ~15 lines
│       │
│       └── 📄 seed.js                ← Add sample data
│           Run: npm run db:seed
│           Adds: 2 event types, availability, 2 sample bookings
│           ~45 lines
│
│
├── 📁 frontend/                       ← Next.js React App
│   │
│   ├── 📄 package.json
│   ├── 📄 next.config.js              ← Next.js configuration
│   ├── 📄 .env.local.example           ← Copy to .env.local
│   ├── 📄 .gitignore
│   │
│   ├── 📁 pages/
│   │   ├── 📄 _app.js                 ← App wrapper (imports global CSS)
│   │   │   ~5 lines
│   │   │
│   │   ├── 📄 index.js                ← DASHBOARD (Admin Page)
│   │   │   Routes: / (GET)
│   │   │   Features:
│   │   │   • List all event types
│   │   │   • Create new event type (form)
│   │   │   • Edit event type
│   │   │   • Delete event type
│   │   │   • Show public link for each
│   │   │   • Manage availability
│   │   │   • View all bookings link
│   │   │   ~120 lines React
│   │   │
│   │   ├── 📄 bookings.js             ← BOOKINGS DASHBOARD
│   │   │   Routes: /bookings (GET)
│   │   │   Features:
│   │   │   • Upcoming bookings tab
│   │   │   • Past bookings tab
│   │   │   • Cancel booking button
│   │   │   • Booking details display
│   │   │   ~80 lines React
│   │   │
│   │   └── 📄 [slug].js               ← PUBLIC BOOKING PAGE (Dynamic)
│   │       Routes: /[slug] (Dynamic route)
│   │       Example: /one-on-one, /product-demo
│   │       Features:
│   │       • Calendar date picker (SimpleCalendar component)
│   │       • Time slot selection
│   │       • Booking form (name, email)
│   │       • Confirmation page
│   │       • Multi-step flow (date → time → form → confirm)
│   │       ~180 lines React
│   │
│   ├── 📁 lib/
│   │   └── 📄 api.js                  ← Axios API Client
│   │       • Base URL setup
│   │       • Default headers
│   │       ~15 lines
│   │
│   └── 📁 styles/
│       ├── 📄 globals.css             ← Global styles
│       │   • Base styles, reset
│       │   • Typography
│       │   • Header & nav
│       │   • Button styles (primary, secondary, danger)
│       │   • Form styles
│       │   • Responsive design
│       │   ~140 lines CSS
│       │
│       ├── 📄 dashboard.css           ← Dashboard page styles
│       │   • Event type cards
│       │   • Form layout
│       │   • Grid layout
│       │   • Create form styles
│       │   ~90 lines CSS
│       │
│       ├── 📄 bookings.css            ← Bookings page styles
│       │   • Tab styles
│       │   • Booking card layout
│       │   • Upcoming/past styling
│       │   • Responsive tabs
│       │   ~80 lines CSS
│       │
│       └── 📄 booking.css             ← Public booking page styles
│           • Calendar component
│           • Date picker
│           • Time slot grid
│           • Form styling
│           • Confirmation styles
│           • Fully responsive
│           ~200 lines CSS
│
│
└── 📁 documentation/                  ← All guides & docs go here
    │
    ├── 📄 README.md                   ← COMPLETE DOCUMENTATION
    │   Sections:
    │   • Project description & features
    │   • Tech stack details
    │   • Project structure explanation
    │   • Complete setup instructions
    │   • API endpoint reference
    │   • Database schema explanation
    │   • Feature descriptions
    │   • Deployment guide
    │   • Code decisions & assumptions
    │   • Troubleshooting
    │
    ├── 📄 START_HERE.md               ← QUICK START (Read first!)
    │   • What you have
    │   • Quick start for Windows
    │   • Project overview
    │   • How to use as admin/booker
    │   • Command reference
    │   • Troubleshooting
    │
    ├── 📄 QUICKSTART.md               ← Fast setup guide
    │   • Setup scripts
    │   • Configuration
    │   • Starting servers
    │   • Testing
    │
    ├── 📄 SUBMISSION_GUIDE.md         ← Interview prep
    │   • Feature checklist
    │   • Code quality points
    │   • Interview questions & answers
    │   • Deployment options
    │   • Testing checklist
    │   • Extra credit ideas
    │
    ├── 📄 ARCHITECTURE.md             ← System design (Great for interview!)
    │   • System architecture diagram
    │   • Data flow examples
    │   • Frontend structure
    │   • Backend routes
    │   • Database design
    │   • Algorithms explained
    │   • Technology stack diagram
    │
    ├── 📄 PROJECT_INVENTORY.json      ← This inventory
    │   • Complete file listing
    │   • File purposes & sizes
    │   • API endpoints
    │   • Technology stack
    │   • Feature list
    │
    └── 📄 FILE_LISTING.md             ← Visual directory (this file)
```

---

## 📊 File Count Summary

| Section | Count | Status |
|---------|-------|--------|
| Backend Files | 12 | ✅ Complete |
| Frontend Files | 12 | ✅ Complete |
| Documentation | 6 | ✅ Complete |
| Config/Setup | 4 | ✅ Complete |
| **TOTAL** | **34** | ✅ Ready |

---

## 🎯 Where to Start

### 1️⃣ **First Time?**
   - Read: `START_HERE.md`
   - Run: `setup.bat` (Windows)

### 2️⃣ **Ready to Code?**
   - Backend: `backend/src/index.js`
   - Frontend: `frontend/pages/index.js`
   - Database: `backend/database/schema.sql`

### 3️⃣ **Ready to Deploy?**
   - Read: `SUBMISSION_GUIDE.md`
   - Push code to GitHub
   - Deploy backend & frontend

### 4️⃣ **Interview Prep?**
   - Review: `ARCHITECTURE.md`
   - Review: `SUBMISSION_GUIDE.md`
   - Understand: `backend/database/schema.sql`

---

## 🔗 File Dependencies

```
Frontend pages need → lib/api.js (Axios client)
Pages need → styles/(corresponding CSS file)
Backend routes need → config/database.js (PostgreSQL)
All need → Database tables (created by database/schema.sql)
```

---

## 📝 Code Statistics

- **Backend Code**: ~290 lines (excluding comments)
- **Frontend Code**: ~480 lines (excluding styles)
- **Styling**: ~600 lines CSS
- **Database**: ~50 lines SQL
- **Documentation**: ~2000 lines

**Total**: ~3,500+ lines of clean, production-ready code

---

## ✨ What Each File Does

### Backend (Production-Ready REST API)

| File | Lines | Purpose |
|------|-------|---------|
| index.js | 45 | Express server with middleware |
| database.js | 20 | PostgreSQL connection pool |
| eventTypes.js | 55 | Event CRUD operations |
| availability.js | 50 | Availability management |
| bookings.js | 60 | Bookings admin operations |
| public.js | 80 | Public booking API + slot logic |
| schema.sql | 50 | Database design |
| setup.js | 15 | Database initialization |
| seed.js | 45 | Sample data |

### Frontend (Interactive React App)

| File | Lines | Purpose |
|------|-------|---------|
| _app.js | 5 | App wrapper |
| index.js | 120 | Admin dashboard |
| bookings.js | 80 | Bookings management |
| [slug].js | 180 | Public booking page |
| api.js | 15 | HTTP client |
| globals.css | 140 | Global styles |
| dashboard.css | 90 | Dashboard styles |
| bookings.css | 80 | Bookings styles |
| booking.css | 200 | Public booking styles |

---

## 🚀 Quick Commands

```bash
# Backend setup
cd backend
npm install
npm run db:setup    # Create database
npm run db:seed     # Add sample data
npm run dev         # Start server (auto-reload)

# Frontend setup
cd frontend
npm install
npm run dev         # Start dev server

# Access the app
# Admin: http://localhost:3000
# Public: http://localhost:3000/one-on-one
```

---

## 📱 Responsive Design

All CSS files include responsive breakpoints:
- ✅ Desktop (>640px)
- ✅ Tablet (640px-1024px) 
- ✅ Mobile (<640px)

---

## 🔐 Environment Variables

**Backend (.env)**
```
DATABASE_URL=postgresql://user:pass@localhost/cal_clone
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## ✅ All Features Implemented

- ✅ Create event types
- ✅ Edit event types
- ✅ Delete event types
- ✅ Set availability (days & hours)
- ✅ Public booking page
- ✅ Calendar date picker
- ✅ Time slot selection
- ✅ Booking form
- ✅ Prevent double-booking
- ✅ Confirmation page
- ✅ View bookings
- ✅ Cancel bookings
- ✅ Upcoming/past filtering
- ✅ Sample data seeding
- ✅ Responsive design
- ✅ Cal.com-inspired UI
- ✅ Clean error handling
- ✅ CORS security

---

## 📚 Documentation Quality

Every document serves a purpose:

1. **START_HERE.md** - For quick understanding
2. **README.md** - For complete reference
3. **QUICKSTART.md** - For fast setup
4. **SUBMISSION_GUIDE.md** - For interviews
5. **ARCHITECTURE.md** - For system understanding
6. **PROJECT_INVENTORY.json** - For file listing

---

## 🎓 Code Learning Value

This project demonstrates:
- ✅ Full-stack development
- ✅ REST API design
- ✅ Database normalization
- ✅ React patterns & hooks
- ✅ Next.js routing
- ✅ CSS responsive design
- ✅ Error handling
- ✅ Data validation
- ✅ CORS & security
- ✅ Environmental configuration

---

**You have everything you need to succeed! 🚀**

Choose your starting point:
- 📖 Read docs? → Start with `START_HERE.md`
- 💻 Build now? → Run `setup.bat`
- 👨‍💻 Review code? → Check `backend/src/index.js`
- 🎨 See design? → Open frontend pages
- 🔧 Understand tech? → Read `ARCHITECTURE.md`
