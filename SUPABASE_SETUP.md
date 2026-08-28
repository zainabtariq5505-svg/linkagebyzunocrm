# Supabase Setup Guide for Linkage CRM

## 📋 Database Schema

Your Supabase project needs the following tables. Copy and run the SQL from `supabase/migrations/001_create_tables.sql`:

### Tables Created:
1. **creators** - Store creator information
2. **videos** - Store video data and metrics
3. **dailyRequirements** - Daily posting requirements per day of week
4. **activityLogs** - Audit trail of all actions
5. **automationRules** - Automation rule configurations
6. **automationAlerts** - Generated alerts from automation rules

## 🔧 Setup Steps

### Step 1: Go to Supabase SQL Editor
1. Open your Supabase project
2. Go to **SQL Editor** on the left sidebar
3. Click **New Query**

### Step 2: Copy and Run SQL
1. Copy the entire content from `supabase/migrations/001_create_tables.sql`
2. Paste into the SQL editor
3. Click **Run**
4. Wait for confirmation (takes ~5 seconds)

### Step 3: Verify Tables
1. Go to **Table Editor** in Supabase
2. You should see all 6 tables listed

### Step 4: Environment Variables
Create `.env.local` file in project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://ojkkrzcjfeixbyyynxao.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qa2tyemNqZmVpeGJ5eXlueGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MTA5MDksImV4cCI6MjEwMzQ4NjkwOX0.wcxEt_GOTuTAwi3f0NKetzDwRSoXpUcnuQuUafSizQw
```

### Step 5: Restart Dev Server
```bash
npm run dev
```

## ✅ Verification

After setup, verify everything works:

1. Add a creator → Check appears in Supabase
2. Add a video → Check appears in Supabase
3. Check automation → Alerts saved to database
4. Check activity logs → All actions logged

## 🔒 Security Notes

- **NEVER** commit `.env.local` to git
- Keep your API keys secret
- The `anon` key is public-facing (safe)
- Don't share the URL publicly

## 🐛 Troubleshooting

**"Connection refused"**
- Check your Supabase URL is correct
- Verify your API key is valid
- Make sure tables exist

**"Permission denied"**
- Anon key doesn't have table access
- Go to Supabase → Authentication → Policies
- Enable anon access for tables

**"Table doesn't exist"**
- Run the SQL migration again
- Check Table Editor to confirm creation

## 📊 Database Schema Details

### creators
```
id (UUID)
name (text)
email (text)
status (text) - 'Active', 'Inactive'
joinDate (text) - ISO date
instagramHandle (text)
notes (text)
createdAt (bigint)
updatedAt (bigint)
```

### videos
```
id (UUID)
creatorId (UUID) - foreign key
date (text) - YYYY-MM-DD
slot (integer)
videoUrl (text)
views (integer)
likes (integer)
comments (integer)
status (text) - 'Added', 'Approved', 'Rejected', 'Missed'
notes (text)
createdAt (bigint)
updatedAt (bigint)
```

### automationAlerts
```
id (UUID)
ruleId (UUID) - foreign key
type (text)
targetId (UUID)
targetName (text)
message (text)
severity (text) - 'info', 'warning', 'critical'
timestamp (bigint)
read (boolean)
```

## 🚀 Next Steps

After tables are created:
1. Environment variables configured
2. Dev server will connect to Supabase
3. All data saves to database instead of localStorage
4. Data persists across sessions and devices
