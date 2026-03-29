# Deployment Issues - Root Causes & Fixes

## Issue 1: Database Deployment Failure

### Root Cause
**Schema mismatch between files:**
- `schema.sql` (new): Uses `password_hash`, UUID primary keys, snake_case columns
- `000_init.sql` (old): Uses `password`, SERIAL primary keys, camelCase columns
- During deployment, unclear which schema gets applied

### Additional Problem
**Conflicting database configurations in `.env`:**
```env
DATABASE_URL=postgresql://...@remote-host/...  # Remote service (Render/Railway)
DB_USER=postgres                               # Local development
DB_PASSWORD=...
DB_HOST=localhost
```

### Solution
1. **Choose ONE schema** (recommend `schema.sql` - it's more modern):
   ```bash
   # Use only:
   DATABASE_URL=postgresql://caldb_33l0_user:cHnev2dZ6OhrjJAfQcCSXXlPytDjG0TI@dpg-d74enkp5pdvs7385v7pg-a/caldb_33l
   
   # Remove local variables for production deployment
   ```

2. **For local development**, use:
   ```bash
   DB_USER=postgres
   DB_PASSWORD=Anchal@8210
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=cal_clone
   ```

3. **Updated `db.ts`** ✅ Fixed to support both `DATABASE_URL` and local config with SSL for production

---

## Issue 2: Login Failed Error

### Root Cause
**Column name mismatch:**
- `authController.ts` was checking `user.password`
- But `schema.sql` uses `password_hash` column name
- When user's password hash doesn't exist in expected column, password comparison fails

### Solution
**Updated `authController.ts`** ✅ Now handles both:
- `password_hash` (schema.sql / modern)
- `password` (000_init.sql / legacy)
- Added error logging to debug issues

---

## Deployment Checklist

### For Remote Deployment (Render/Railway):
```env
DATABASE_URL=postgresql://user:password@host/database
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com
JWT_SECRET=generate-secure-random-string
JWT_REFRESH_SECRET=generate-secure-random-string
```

**Remove** local DB variables:
- ❌ DB_USER
- ❌ DB_PASSWORD
- ❌ DB_HOST
- ❌ DB_PORT
- ❌ DB_NAME

### Setup Database on Deployment:
```bash
# Option 1: Use the modern schema (recommended)
npm run setup      # Uses schema.sql

# Option 2: Use legacy schema
npm run setup:old  # Uses 000_init.sql
```

### Verify Connection:
1. Test health endpoint: `GET /health`
2. Try login with seeded user
3. Check database logs for connection errors

---

## Next Steps

1. **Choose which schema to use** and remove the conflicting one
2. **Clean up `.env`** - separate development and production configs
3. **Test locally first** with `DB_HOST=localhost`
4. **Deploy** with `DATABASE_URL` pointing to remote database
5. **Run migrations/setup** on the remote database
