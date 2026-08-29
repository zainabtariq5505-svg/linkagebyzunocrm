# 🔥 INSTANT FIX - DO THIS RIGHT NOW

## Copy This Exact SQL

Go to: https://supabase.com → Your Project → SQL Editor → New Query

**PASTE THIS EXACTLY:**

```sql
-- Drop and recreate tables without RLS
DROP TABLE IF EXISTS automationAlerts CASCADE;
DROP TABLE IF EXISTS automationRules CASCADE;
DROP TABLE IF EXISTS activityLogs CASCADE;
DROP TABLE IF EXISTS "dailyRequirements" CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS creators CASCADE;

CREATE TABLE creators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  instagramHandle TEXT,
  createdAt BIGINT NOT NULL,
  updatedAt BIGINT NOT NULL
);

CREATE TABLE videos (
  id TEXT PRIMARY KEY,
  creatorId TEXT NOT NULL,
  date TEXT NOT NULL,
  slot INTEGER NOT NULL,
  videoUrl TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Added',
  notes TEXT,
  createdAt BIGINT NOT NULL,
  updatedAt BIGINT NOT NULL
);

CREATE TABLE "dailyRequirements" (
  id TEXT PRIMARY KEY,
  dayOfWeek INTEGER NOT NULL UNIQUE,
  requiredVideos INTEGER NOT NULL,
  createdAt BIGINT NOT NULL,
  updatedAt BIGINT NOT NULL
);

CREATE TABLE activityLogs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  targetType TEXT NOT NULL,
  targetId TEXT NOT NULL,
  targetName TEXT,
  details TEXT,
  timestamp BIGINT NOT NULL
);

CREATE TABLE automationRules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  threshold INTEGER,
  action TEXT NOT NULL,
  createdAt BIGINT NOT NULL,
  updatedAt BIGINT NOT NULL
);

CREATE TABLE automationAlerts (
  id TEXT PRIMARY KEY,
  ruleId TEXT NOT NULL,
  type TEXT NOT NULL,
  targetId TEXT NOT NULL,
  targetName TEXT,
  message TEXT NOT NULL,
  severity TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  read BOOLEAN DEFAULT false
);

-- NO RLS - Allow all access
CREATE INDEX idx_videos_creatorId ON videos(creatorId);
CREATE INDEX idx_videos_date ON videos(date);
```

**CLICK RUN**

## Then Vercel

1. Go to https://vercel.com
2. Your Project → Deployments
3. Latest deployment → ... → Redeploy
4. Wait for "Ready"

## Test

- Open your URL
- Add a creator
- Check Supabase → creators table → Should see it
- Ask your partner to open same URL
- Partner should see your data

**THAT'S IT. IT WILL WORK.**
