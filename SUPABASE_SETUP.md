# Supabase Setup Guide

This CRM supports optional Supabase backend for cloud data persistence. If not configured, it uses local browser storage as a fallback.

## Setup Steps

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Wait for the project to initialize
4. Go to **Settings → API** to get your credentials

### 2. Get Your Credentials

Copy:
- **Project URL** (e.g., `https://xxxxx.supabase.co`)
- **Anon Key** (public anonymous key for client-side access)

### 3. Set Environment Variables

Edit `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Create Database Tables

Run these SQL queries in Supabase SQL Editor:

#### Creators Table
```sql
CREATE TABLE creators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  instagramUsername TEXT NOT NULL,
  accountSize INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  createdAt BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX creators_status_idx ON creators(status);
```

#### Videos Table
```sql
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
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX videos_date_idx ON videos(date);
CREATE INDEX videos_creatorId_idx ON videos(creatorId);
CREATE INDEX videos_status_idx ON videos(status);
```

#### Settings Table
```sql
CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  dailyRequirements JSONB DEFAULT '[]'::jsonb,
  accentColor TEXT DEFAULT '#8B5CF6',
  darkMode BOOLEAN DEFAULT false,
  updatedAt TIMESTAMP DEFAULT now()
);

INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
```

### 5. Set Row Level Security (RLS)

For development, disable RLS on all tables (not recommended for production):

1. Go to **Authentication → Policies**
2. For each table (creators, videos, settings):
   - Click on the table
   - Disable RLS or create permissive policies

**For production**, create proper RLS policies to secure data.

### 6. Restart the App

```bash
npm run dev
```

The app will now:
- Automatically sync to Supabase on every change
- Load data from Supabase on startup
- Fall back to local storage if Supabase is unavailable

## How It Works

- **Data is written to local storage immediately** (fast UI updates)
- **Data is also synced to Supabase in the background** (cloud backup)
- **On app load**, data is synced from Supabase to local storage
- **If Supabase is unavailable**, the app continues to work with local storage

## Testing

1. Add some creators and videos
2. Go to Supabase dashboard → **Table Editor**
3. You should see your data in the tables
4. Close and reopen the app - data persists from Supabase

## Troubleshooting

### "Could not sync from Supabase"
- Check your `.env.local` credentials
- Ensure RLS is disabled or policies allow access
- Check browser console for specific errors

### Data not syncing
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Open browser DevTools Console to see sync status messages
- Check Supabase project status

### "Table does not exist"
- Run all SQL queries from section 4
- Verify tables exist in Supabase Table Editor

## Optional: Production Setup

For production, consider:

1. **Enable Row Level Security (RLS)** - restrict data access
2. **Add authentication** - implement user login with Supabase Auth
3. **Use service role key** - for backend operations
4. **Enable backups** - in Supabase project settings
5. **Monitor usage** - watch your Supabase quota
