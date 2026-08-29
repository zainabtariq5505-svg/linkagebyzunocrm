# 🚨 CRITICAL: Fix Supabase RLS - Run This NOW

## Step 1: Go to Supabase Console
https://supabase.com → Your Project → SQL Editor

## Step 2: Click "New Query"

## Step 3: Copy and Paste THIS ENTIRE CODE

```sql
-- DISABLE ROW LEVEL SECURITY - CRITICAL FIX
ALTER TABLE creators DISABLE ROW LEVEL SECURITY;
ALTER TABLE videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE "dailyRequirements" DISABLE ROW LEVEL SECURITY;
ALTER TABLE activityLogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE automationRules DISABLE ROW LEVEL SECURITY;
ALTER TABLE automationAlerts DISABLE ROW LEVEL SECURITY;

-- GRANT PERMISSIONS TO PUBLIC
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Verify tables exist
SELECT 
  schemaname, 
  tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

## Step 4: Click RUN

You should see:
- ✅ "ALTER TABLE" for each table
- ✅ "GRANT" statements executed
- ✅ Table list showing all 6 tables

## Step 5: Done! ✅

All users now have access to shared data!

## Verify It Worked

After running, check:
1. Go to Table Editor
2. Click on "creators" table
3. You should see data (if you added any)
4. Try adding data from both users
5. Both should see it instantly

---

## If You Get Permission Error

Try this alternative:

```sql
-- Alternative: Create policies that allow all
DROP POLICY IF EXISTS "Enable all access for all users" ON creators;
DROP POLICY IF EXISTS "Enable all access for all users" ON videos;
DROP POLICY IF EXISTS "Enable all access for all users" ON "dailyRequirements";
DROP POLICY IF EXISTS "Enable all access for all users" ON activityLogs;
DROP POLICY IF EXISTS "Enable all access for all users" ON automationRules;
DROP POLICY IF EXISTS "Enable all access for all users" ON automationAlerts;

ALTER TABLE creators DISABLE ROW LEVEL SECURITY;
ALTER TABLE videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE "dailyRequirements" DISABLE ROW LEVEL SECURITY;
ALTER TABLE activityLogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE automationRules DISABLE ROW LEVEL SECURITY;
ALTER TABLE automationAlerts DISABLE ROW LEVEL SECURITY;
```

---

## Production Deployment

After running SQL:

1. **Go to Vercel Dashboard**
2. **Your Project → Deployments**
3. **Find latest deployment**
4. **Click ... → Redeploy**
5. **Wait 2-3 minutes**
6. **Check status → Should say "Ready"**

That's it! Your app is live with shared data! 🚀
