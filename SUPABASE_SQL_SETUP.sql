-- Linkage Creator CRM - Supabase Database Setup
-- Run this SQL in Supabase SQL Editor

-- ============================================================================
-- 1. CREATE CREATORS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS creators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  instagramUsername TEXT NOT NULL,
  accountSize INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  createdAt BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS creators_status_idx ON creators(status);
CREATE INDEX IF NOT EXISTS creators_created_at_idx ON creators(created_at);

-- ============================================================================
-- 2. CREATE VIDEOS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  creatorId TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  slot INTEGER NOT NULL,
  videoUrl TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  notes TEXT,
  createdAt BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS videos_date_idx ON videos(date);
CREATE INDEX IF NOT EXISTS videos_creatorId_idx ON videos(creatorId);
CREATE INDEX IF NOT EXISTS videos_status_idx ON videos(status);
CREATE INDEX IF NOT EXISTS videos_created_at_idx ON videos(created_at);

-- ============================================================================
-- 3. CREATE SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  dailyRequirements JSONB DEFAULT '[]'::jsonb,
  accentColor TEXT DEFAULT '#8B5CF6',
  darkMode BOOLEAN DEFAULT false,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Insert default settings
INSERT INTO settings (id, dailyRequirements, accentColor, darkMode)
VALUES (
  1,
  '[{"dayOfWeek":0,"requiredVideos":0},{"dayOfWeek":1,"requiredVideos":10},{"dayOfWeek":2,"requiredVideos":10},{"dayOfWeek":3,"requiredVideos":10},{"dayOfWeek":4,"requiredVideos":10},{"dayOfWeek":5,"requiredVideos":10},{"dayOfWeek":6,"requiredVideos":20}]'::jsonb,
  '#8B5CF6',
  false
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. DISABLE ROW LEVEL SECURITY (FOR DEVELOPMENT)
-- ============================================================================
-- Note: In production, you should implement proper RLS policies

ALTER TABLE creators DISABLE ROW LEVEL SECURITY;
ALTER TABLE videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DONE! Your Supabase database is now ready.
-- ============================================================================
-- 
-- Tables created:
-- ✓ creators - Stores creator information
-- ✓ videos - Stores video entries with creator references
-- ✓ settings - Stores app settings and daily requirements
--
-- Your CRM will now:
-- • Automatically sync data to these tables
-- • Load data from Supabase on startup
-- • Fall back to localStorage if unavailable
--
-- ============================================================================
