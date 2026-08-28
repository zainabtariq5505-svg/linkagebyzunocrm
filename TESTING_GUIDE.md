# Linkage CRM - Testing & Demo Guide

## Quick Start

### Step 1: Install & Run
```bash
cd e:\crmkiro\linkagebyzunocrm
npm install
npm run dev
```

Open browser: `http://localhost:3000`

---

## Test Scenarios

### Test 1: Authentication ✓
**Objective:** Verify login system works correctly

**Steps:**
1. Navigate to `http://localhost:3000`
2. Should redirect to login page
3. Try wrong credentials:
   - Email: `test@test.com`
   - Password: `wrong`
   - ❌ Should show "Invalid email or password"
4. Try correct credentials:
   - Email: `azozzuno@linkage.com`
   - Password: `linkagewillbenumber1@69`
   - ✅ Should redirect to Dashboard
5. Reload page
   - ✅ Should stay logged in (token persists)
6. Click logout in navigation
   - ✅ Should redirect to login
   - ✅ Token should be cleared

**Expected:** All steps pass ✓

---

### Test 2: Icons Display ✓
**Objective:** Verify all icons render correctly

**After Login - Check These:**
1. Navigation sidebar icons:
   - 📊 Dashboard icon
   - 👥 Creators icon
   - 📅 Calendar icon
   - 🎬 Videos icon
   - 📈 Analytics icon
   - ⚙️ Settings icon
   - 🚪 Logout icon

2. Dashboard quick action buttons:
   - ➕ Add Creator icon
   - ➕ Add Video icon
   - 📅 Calendar icon

3. Settings page icons:
   - 💾 Save icon
   - 🔄 Rotate icon (restore backup)
   - ⚠️ Alert icon

4. Add Video Modal:
   - ✖️ Close icon
   - ⏳ Loading/spinner icon (when fetching)

**Expected:** All icons display correctly ✓

---

### Test 3: Data Persistence ✓
**Objective:** Verify data saves and persists across sessions

**Steps:**
1. After login, click "Add Creator"
2. Fill form:
   - Name: "Test Creator 1"
   - Instagram Username: "@testcreator1"
   - Account Size: "50000"
   - Status: "Active"
3. Click "Add Creator"
   - ✅ Dashboard should refresh
   - ✅ New creator appears in list
4. Go to Creators page
   - ✅ "Test Creator 1" shows in the list
5. Reload page (Ctrl+R)
   - ✅ Creator is still there!
   - ✅ Data persisted to localStorage
6. Go to Settings page
   - ✅ "Data & Backups" section visible
   - ✅ Backup listed with timestamp

**Expected:** Data persists after reload ✓

---

### Test 4: Instagram Auto-Fetch ✓
**Objective:** Test Instagram stats fetching feature

**Prerequisites:**
- Must have at least one active creator (from Test 3)

**Steps:**
1. Click "Add Video" on Dashboard
2. Select the creator from Test 3
3. Choose today's date
4. Set Slot: 1
5. Paste Instagram URL:
   ```
   https://www.instagram.com/reel/ABC123DEF/
   ```
6. Click "Fetch" button
   - ⏳ Button shows loading spinner
   - ⏳ Wait ~1 second
   - ✅ Views field fills with a number (e.g., 12,345)
   - ✅ Likes field fills with a number (e.g., 1,234)
   - ✅ Comments field fills with a number (e.g., 123)
7. Fields should be editable - try changing Views to "5000"
   - ✅ Value updates
8. Click "Add Video"
   - ✅ Dashboard refreshes
   - ✅ Video appears in stats

**Test Invalid URL:**
1. Click "Add Video" again
2. Enter invalid URL: `https://example.com`
3. Click "Fetch"
   - ✅ Should show error: "Please enter a valid Instagram URL"

**Expected:** 
- Valid URLs fetch stats ✓
- Invalid URLs show error ✓
- Fields remain editable ✓

---

### Test 5: Data Recovery ✓
**Objective:** Verify backup and restore functionality

**Steps:**
1. Go to Settings page
2. Scroll to "Data & Backups" section
3. Should show at least one backup
   - Example: "8/28/2024, 2:30:45 PM"
4. Add another video or creator
5. Go back to Settings
6. Should see a NEW backup with current timestamp
7. Click "Restore" on the OLDER backup
   - ✅ Confirmation dialog appears
   - Click "OK"
   - ✅ App reloads
   - ✅ Dashboard shows data from that backup point
   - ✅ Recent additions are gone
8. Go to Settings again
9. Click "Restore" on the NEWEST backup
   - ✅ Recent additions return

**Expected:**
- Backups auto-created ✓
- Can restore from any backup ✓
- Data restored correctly ✓
- Recent data recoverable ✓

---

### Test 6: Dark Mode ✓
**Objective:** Verify dark mode toggle

**Steps:**
1. Go to Settings page
2. Find "Appearance" section
3. Toggle is currently OFF (light mode)
4. Click toggle
   - ✅ Entire app turns dark
   - ✅ Text remains readable
   - ✅ Colors are still distinct
5. Navigate to other pages
   - Dashboard ✅
   - Creators ✅
   - Calendar ✅
   - Videos ✅
   - Analytics ✅
6. Go back to Settings
7. Toggle OFF
   - ✅ Back to light mode

**Expected:** Dark mode works across all pages ✓

---

### Test 7: Navigation & Routing ✓
**Objective:** Verify all pages load correctly

**After Login, Click Each Nav Item:**

| Page | Icon | Works? |
|------|------|--------|
| Dashboard | 📊 | Check that stats display |
| Creators | 👥 | Check creator list loads |
| Calendar | 📅 | Check calendar grid displays |
| Videos | 🎬 | Check video list displays |
| Analytics | 📈 | Check charts render |
| Settings | ⚙️ | Check all sections visible |

**Expected:** All pages load without errors ✓

---

### Test 8: Full User Workflow ✓
**Objective:** Complete realistic workflow from start to finish

**Scenario:** Add a creator with multiple videos

**Steps:**
1. Login with correct credentials
2. Click "Add Creator"
3. Fill:
   - Name: "Sarah Content Creator"
   - Instagram: "@sarahcreates"
   - Account Size: "250000"
   - Status: "Active"
4. Add Creator - ✅ redirects to dashboard
5. Click "Add Video"
6. Fill:
   - Creator: "Sarah Content Creator"
   - Date: Today
   - Slot: 1
   - Instagram URL: `https://www.instagram.com/reel/XYZ789ABC/`
7. Click "Fetch"
   - ✅ Stats populate
8. Status: "Approved"
9. Add Video - ✅ dashboard updates
10. Go to Videos page
    - ✅ Video shows with creator name, date, stats
11. Go to Calendar
    - ✅ Today shows "1" filled slot
12. Go to Analytics
    - ✅ Chart shows 1 video with its views
13. Go to Settings
    - ✅ Multiple backups should exist
14. Logout
    - ✅ Redirects to login
15. Login again
    - ✅ All data intact!

**Expected:** Full workflow succeeds ✓

---

## Performance Checks

### Load Time
- [ ] Login page loads < 2 seconds
- [ ] Dashboard loads < 3 seconds
- [ ] Each page transition < 1 second

### Instagram Fetch
- [ ] Fetch takes ~1 second (simulated network)
- [ ] Works reliably 10+ times in a row

### Data Operations
- [ ] Add creator takes < 1 second
- [ ] Add video takes < 1 second
- [ ] Save settings takes < 1 second

---

## Browser Compatibility

### Test on:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browser (responsive)

### Features to Test:
- [ ] LocalStorage works
- [ ] Icons render
- [ ] Responsive layout adapts
- [ ] Forms are usable

---

## Troubleshooting

### Icons Not Showing?
- Clear browser cache (Ctrl+Shift+Delete)
- Restart dev server
- Check console for errors (F12)

### Data Disappeared?
- Check Settings > Data & Backups
- Look for backup to restore
- Check browser localStorage is enabled

### Can't Login?
- Verify exact credentials
- Check Caps Lock is off
- Try clearing cache and trying again

### Instagram Fetch Not Working?
- Verify URL format: `instagram.com/reel/ID` or `/p/ID`
- Check for typos
- Try a different post/reel

---

## Success Criteria

✅ All tests pass = **Implementation Complete**

When you can successfully:
1. Login/logout ✓
2. See icons everywhere ✓
3. Add creators and videos ✓
4. Fetch Instagram stats ✓
5. Persist data across reloads ✓
6. Restore from backups ✓
7. Toggle dark mode ✓
8. Navigate all pages ✓

**Then the implementation is complete!** 🎉

---

## Additional Notes

### Mock Instagram Data
- Current system uses simulated stats for testing
- For production, replace with real Instagram Graph API
- Data is deterministic per URL (same URL = same stats)

### Security Notes
- Credentials are hardcoded for admin-only use
- Consider backend auth for production
- All data is stored locally (not synced to cloud by default)

### Browser Developer Tools
Open with F12 to see:
- Console logs: Data recovery status
- Application tab: localStorage keys
- Network tab: Fetch operations

---

## Questions?

Refer to:
- `IMPLEMENTATION_SUMMARY.md` - Technical details
- `README.md` - General project info
- Code comments - Inline documentation

---

**Last Updated:** August 28, 2024
**Version:** 1.0.0
