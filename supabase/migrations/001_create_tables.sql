-- Linkage CRM Database Schema
-- Run this in Supabase SQL Editor

-- Drop existing tables if they exist (optional, for fresh setup)
DROP TABLE IF EXISTS automationAlerts;
DROP TABLE IF EXISTS automationRules;
DROP TABLE IF EXISTS activityLogs;
DROP TABLE IF EXISTS "dailyRequirements";
DROP TABLE IF EXISTS videos;
DROP TABLE IF EXISTS creators;

-- Creators table
CREATE TABLE creators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  instagramHandle TEXT,
  createdAt BIGINT NOT NULL,
  updatedAt BIGINT NOT NULL
);

-- Videos table
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
  updatedAt BIGINT NOT NULL,
  FOREIGN KEY (creatorId) REFERENCES creators(id) ON DELETE CASCADE
);

-- Daily Requirements table
CREATE TABLE "dailyRequirements" (
  id TEXT PRIMARY KEY,
  dayOfWeek INTEGER NOT NULL UNIQUE,
  requiredVideos INTEGER NOT NULL,
  createdAt BIGINT NOT NULL,
  updatedAt BIGINT NOT NULL
);

-- Activity Logs table
CREATE TABLE activityLogs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  targetType TEXT NOT NULL,
  targetId TEXT NOT NULL,
  targetName TEXT,
  details TEXT,
  timestamp BIGINT NOT NULL
);

-- Automation Rules table
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

-- Automation Alerts table
CREATE TABLE automationAlerts (
  id TEXT PRIMARY KEY,
  ruleId TEXT NOT NULL,
  type TEXT NOT NULL,
  targetId TEXT NOT NULL,
  targetName TEXT,
  message TEXT NOT NULL,
  severity TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  read BOOLEAN DEFAULT false,
  FOREIGN KEY (ruleId) REFERENCES automationRules(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_videos_creatorId ON videos(creatorId);
CREATE INDEX IF NOT EXISTS idx_videos_date ON videos(date);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_activityLogs_targetId ON activityLogs(targetId);
CREATE INDEX IF NOT EXISTS idx_activityLogs_timestamp ON activityLogs(timestamp);
CREATE INDEX IF NOT EXISTS idx_automationAlerts_ruleId ON automationAlerts(ruleId);
CREATE INDEX IF NOT EXISTS idx_automationAlerts_read ON automationAlerts(read);
CREATE INDEX IF NOT EXISTS idx_creators_status ON creators(status);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dailyRequirements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE activityLogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automationRules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automationAlerts ENABLE ROW LEVEL SECURITY;
