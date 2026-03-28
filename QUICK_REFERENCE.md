# 🚀 Calendar Clone - Quick Start & Troubleshooting

## 🎯 Quick Access

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### Backend Status Check
```powershell
# Test backend connectivity
Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing
# Returns: {"status":"ok","timestamp":"..."}
```

---

## 🏃 Starting the Servers

### Method 1: Batch Files (Easiest)
```batch
# Terminal 1 - Backend
e:\Cal_Clone\backend\start.bat

# Terminal 2 - Frontend  
e:\Cal_Clone\frontend\start.bat
```

### Method 2: Manual Commands
```bash
# Terminal 1 - Backend
cd e:\Cal_Clone\backend
npm run dev

# Terminal 2 - Frontend
cd e:\Cal_Clone\frontend  
npm run dev
```

**Expected Output**:
```
Backend: ✓ Running on http://localhost:5000
Frontend: ✓ Ready in 3.6s at http://localhost:3000
```

---

## 🎨 Color Theme - What Changed

### Before
- Purple gradients (#667eea → #764ba2)
- Colored buttons and accents
- Multi-colored theme

### After  
- Pure Black & White
- Black buttons (#000000)
- Red accents for alerts (#ff0000)
- Professional monochrome

### Files Updated
- ✅ `auth.module.css`
- ✅ `settings-page.module.css`
- ✅ `globals.css`
- ✅ `dashboard.css`
- ✅ `booking.css`
- ✅ `header.module.css`

---

## 🐛 Troubleshooting

### Problem: Backend won't start - "Port 5000 already in use"

**Solution**:
```powershell
# Kill all Node processes
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force

# Then restart backend
e:\Cal_Clone\backend\start.bat
```

### Problem: Frontend won't start - Dependencies missing

**Solution**:
```bash
cd e:\Cal_Clone\frontend
npm install
npm run dev
```

### Problem: Backend shows error - "Cannot find module 'bcryptjs'"

**Solution**:
```bash
cd e:\Cal_Clone\backend
npm install bcryptjs
npm run dev
```

### Problem: Black & White theme not showing

**Checklist**:
1. ✓ Clear browser cache (Ctrl+Shift+Del)
2. ✓ Hard refresh page (Ctrl+Shift+R)
3. ✓ Check DevTools (F12) → Network tab for CSS files
4. ✓ Verify CSS files were updated (see file list below)

### Problem: "Duplicate page detected" warning

**Info**: Non-critical warning about `settings.js` and `settings.tsx`  
**Action**: Can ignore or delete `.tsx` file
```bash
# Optional - remove duplicate
del e:\Cal_Clone\frontend\pages\settings.tsx
```

### Problem: Database connection failed

**Check**:
1. Is PostgreSQL running?
2. Are credentials in `.env` correct?
3. Does database `calendar_app` exist?

```bash
# Create database if missing
createdb calendar_app
```

---

## 📝 Important Notes

### Black & White Theme
- All UI components now use black text on white background
- Buttons are black with red hover/alert state
- Professional, clean appearance
- Fully consistent across all pages

### Frontend Pages Status
```
✅ /               - Dashboard (B&W theme)
✅ /login          - Login page (B&W theme)
✅ /signup         - Sign up page (B&W theme)
✅ /settings       - User settings (B&W theme)
✅ /bookings       - Bookings list (B&W theme)
✅ /availability   - Availability manager (B&W theme)
✅ /[slug]         - Public booking page (B&W theme)
```

### Backend Endpoints
```
GET  /health                 - Health check
POST /api/auth/login         - User login
POST /api/auth/signup        - User registration
GET  /api/event-types        - Get all events
POST /api/event-types        - Create event
PUT  /api/event-types/:id    - Update event ⭐
GET  /api/user/settings      - Get settings
PUT  /api/user/settings      - Update settings ⭐
GET  /api/bookings           - Get bookings
```

---

## 🧪 Feature Testing Checklist

### Login & Authentication
- [ ] Visit http://localhost:3000 (see B&W login form)
- [ ] Test login with existing user
- [ ] Verify token stored in localStorage
- [ ] Should redirect to dashboard

### Create Event
- [ ] Click "Create Event" button
- [ ] Fill in form (black & white styled)
- [ ] Submit form
- [ ] Verify event appears in list

### Update Event
- [ ] Click edit button on existing event
- [ ] Change event details
- [ ] Click "Update" (tests PUT endpoint)
- [ ] Verify changes saved

### Update Settings
- [ ] Navigate to Settings page
- [ ] Update profile info
- [ ] Change timezone
- [ ] Toggle notifications
- [ ] Click "Save Changes" (tests PUT endpoint)
- [ ] Verify success message

### Logout
- [ ] Click "Logout" button (red button in header)
- [ ] Should redirect to login page
- [ ] Token should be blacklisted

### Public Booking Page
- [ ] Visit http://localhost:3000/[slug] (replace with actual slug)
- [ ] Should show public booking form in B&W theme
- [ ] Calendar and time selection should work
- [ ] Booking form should be styled correctly

---

## 📊 Test API Endpoints

### Get Health Status
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing
```

### Login
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -UseBasicParsing

# Get token from response
$token = ($response.Content | ConvertFrom-Json).token
Write-Host "Token: $token"
```

### Update Event (with token)
```powershell
$headers = @{Authorization="Bearer $token"}
$body = @{
    title = "Updated Event Title"
    duration_minutes = 45
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/event-types/1" `
    -Method PUT `
    -Headers $headers `
    -Body $body `
    -ContentType "application/json" `
    -UseBasicParsing
```

---

## 📁 File Structure

```
e:\Cal_Clone\
├── frontend/
│   ├── pages/
│   │   ├── login.js ✅
│   │   ├── signup.js ✅
│   │   ├── settings.js ✅
│   │   ├── index.js ✅
│   │   ├── [slug].js ✅
│   │   └── ... (other pages)
│   ├── styles/
│   │   ├── auth.module.css ✅ B&W
│   │   ├── settings-page.module.css ✅ B&W
│   │   ├── globals.css ✅ B&W
│   │   ├── dashboard.css ✅ B&W
│   │   ├── booking.css ✅ B&W
│   │   ├── header.module.css ✅ B&W
│   │   └── ... (other styles)
│   ├── start.bat ✅ NEW
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── index.js
│   ├── start.bat ✅ NEW
│   ├── tsconfig.json ✅ FIXED
│   ├── package.json ✅ UPDATED
│   └── node_modules/
│
├── STATUS_REPORT.md ✅ NEW
├── UPDATES_SUMMARY.md ✅ NEW
├── VERIFICATION_REPORT.md ✅ NEW
└── QUICKSTART.md
```

---

## 💡 Pro Tips

### Monitor Servers
```powershell
# Keep both terminals side-by-side
# Backend terminal: Shows API logs
# Frontend terminal: Shows compilation messages
```

### Hot Reload
- Frontend: Auto-reloads on file save
- Backend: Auto-restarts on file change (via nodemon)

### Clear Browser Cache
```
Press: Ctrl + Shift + Delete
Select: Cookies and other site data, Cached images and files
Time range: All time
Click: Delete data
```

### Check Network Traffic
```
Open DevTools: F12
Go to: Network tab
Perform action
See: All API calls and their responses
```

---

## 🎯 Success Indicators

When everything is working:

✅ Backend terminal shows:
```
╔════════════════════════════════════╗
║  Cal.com Clone Backend Server      ║
║  Running on http://localhost:5000  ║
║  CORS enabled for localhost:3001   ║
╚════════════════════════════════════╝
```

✅ Frontend terminal shows:
```
✓ Ready in 3.6s
  Local: http://localhost:3000
✓ Compiled /
```

✅ Browser shows:
- Black and white themed pages
- No purple or colored gradients
- Professional monochrome design
- All forms and buttons in B&W

---

## 📞 Quick Reference Commands

```powershell
# Restart backend
Restart-Process node

# Kill all Node processes
Get-Process | Where-Object {$_.Name -like "*node*"} | Stop-Process -F

# Install missing package
npm install [package-name]

# Clear npm cache
npm cache clean --force

# View running processes on port 5000
Get-NetTCPConnection -LocalPort 5000

# Test API endpoint
curl -X GET http://localhost:5000/health
```

---

**Last Updated**: March 28, 2026  
**Status**: ✅ READY FOR USE

🎉 **All systems operational! Start the servers and enjoy your black & white themed calendar app!**
