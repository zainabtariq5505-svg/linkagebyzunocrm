# Supabase Setup - Step by Step

Your credentials have been configured! Now let's create the database tables.

## Step 1: Go to Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project: `epolwqnffmxgzadsamvr`
3. In the sidebar, click **SQL Editor**

## Step 2: Create Tables

1. Click **+ New Query**
2. Copy the entire SQL from `SUPABASE_SQL_SETUP.sql` file
3. Paste it into the SQL editor
4. Click **Run** (or press Ctrl+Enter)
5. You should see: "Query successful"

## Step 3: Verify Tables Created

1. Go to **Table Editor** in sidebar
2. You should see three tables:
   - ✓ creators
   - ✓ videos
   - ✓ settings

## Step 4: Restart Your App

```bash
# Press Ctrl+C to stop the dev server
# Then restart:
npm run dev
```

## Done! 🎉

Your CRM is now connected to Supabase!

### What Happens Now:
- When you add creators/videos, they sync to Supabase
- When you refresh the page, data loads from Supabase
- All data is backed up in the cloud
- Works offline with localStorage fallback

### Test It:
1. Open http://localhost:3000
2. Add a creator
3. Go to Supabase **Table Editor**
4. Check **creators** table - your creator should be there!

---

## Troubleshooting

### "Query failed"
- Copy the SQL carefully
- Make sure you selected your project
- Check for typos

### "Tables don't appear"
- Refresh the page
- Check if SQL executed without errors
- Try running the query again

### "Data not syncing"
- Check console (F12) for errors
- Verify .env.local has correct credentials
- Try adding new creator (should appear in Supabase)

---

## Quick SQL Reference

The setup SQL does this:

```sql
-- Creates creators table
CREATE TABLE creators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  instagramUsername TEXT NOT NULL,
  accountSize INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  createdAt BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Creates videos table with foreign key to creators
CREATE TABLE videos (
  id TEXT PRIMARY KEY,
  creatorId TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  slot INTEGER NOT NULL,
  videoUrl TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  notes TEXT,
  createdAt BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Creates settings table for app configuration
CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  dailyRequirements JSONB DEFAULT '[]'::jsonb,
  accentColor TEXT DEFAULT '#8B5CF6',
  darkMode BOOLEAN DEFAULT false,
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Disables RLS for development (enable in production!)
ALTER TABLE creators DISABLE ROW LEVEL SECURITY;
ALTER TABLE videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
```

---

## Next Steps

1. ✅ Credentials configured (.env.local)
2. ⏳ Create database tables (do this now)
3. ⏳ Restart app
4. ⏳ Test by adding data
5. ⏳ Verify in Supabase Table Editor

---

**Ready? Let's go!**

👉 Open Supabase SQL Editor and run the SQL from `SUPABASE_SQL_SETUP.sql`
