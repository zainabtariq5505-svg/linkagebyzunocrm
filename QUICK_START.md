# Quick Start Guide

## 🚀 Run the App (Right Now)

The app is already running on your localhost! Just visit:

**👉 http://localhost:3000**

## 📋 What You Can Do

### Add Creators
1. Click **"+ Add Creator"** (top right)
2. Fill in:
   - Creator Name
   - Instagram Username (@handle)
   - Account Size (follower count)
3. Click **"Add Creator"**
4. Data saves instantly!

### Add Videos
1. Click **"+ Add Video"** (top right)
2. Select creator and date
3. Enter slot number, video URL, and views
4. Click **"Add Video"**
5. Data saves instantly!

### View Calendar
1. Click **"Calendar"** in the sidebar
2. See month view with color-coded slots
3. Click any date to see/edit that day's videos
4. Green = complete, Yellow = partial, Red = behind

### Check Analytics
1. Click **"Analytics"** in sidebar
2. See total views, videos, and approval rates
3. Toggle between 7-day and 30-day charts
4. Track performance over time

### Adjust Settings
1. Click **"Settings"** in sidebar
2. Change daily requirements per day
3. Toggle dark mode on/off
4. Click **"Save Changes"**

## 🔒 Data Storage

Your data is **safe** and **stored locally** in your browser.

- ✅ Works offline
- ✅ Data persists between sessions
- ✅ No login required
- ✅ Never sent anywhere

## ☁️ Add Cloud Backup (Optional)

Want cloud backup? Add Supabase:

1. Go to [supabase.com](https://supabase.com) → Create project
2. Get your **URL** and **Anon Key** from Settings → API
3. Edit `.env.local` and add:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```
4. Create the database tables (see `SUPABASE_SETUP.md`)
5. Restart: `npm run dev`
6. Your data now syncs to cloud!

**Not ready for Supabase?** Just skip it—everything works locally.

## 🎨 UI Features

### Dark Mode
- Toggle in **Settings** page
- Saves to your browser
- Fully responsive design

### Search
- **Creators page:** Search by name or Instagram handle
- Type to filter instantly

### Quick Actions
- Dashboard shows 3 quick buttons
- Add Creator, Add Video, or go to Calendar

### Visual Indicators
- **Green slot:** Complete ✓
- **Yellow slot:** Partial (some videos)
- **Red slot:** Behind (not enough videos)
- **Gray slot:** No requirement for that day

## 📱 Browser Support

Works on:
- Chrome/Chromium
- Firefox
- Safari
- Edge
- Any modern browser with localStorage

## ⚙️ Dev Server Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🆘 Troubleshooting

### "Data disappeared"
- Check browser localStorage: Press F12 → Application → localStorage
- Data should be there under `linkage_crm_data`
- If missing, try adding a creator again

### "Dark mode not saving"
- Refresh page - it should return to your dark mode setting
- Try toggling it again

### "Supabase not working"
- Check `.env.local` has correct credentials
- Make sure database tables are created
- Check browser console (F12) for errors
- See `SUPABASE_SETUP.md` for detailed help

## 📖 Documentation

- `README.md` - Full feature documentation
- `SUPABASE_SETUP.md` - Detailed cloud setup guide
- `UPDATES.md` - What's new and changed

## ✨ Tips & Tricks

1. **Bulk Add:** Can add multiple creators quickly using the modal
2. **Edit Status:** Click status badges to change video status
3. **Quick Links:** Click video URLs to open them
4. **Search Creators:** Use search to find creators by Instagram handle
5. **Calendar Focus:** Click calendar dates to manage specific days

## 🎯 Next Steps

1. **Try the dashboard** - get a feel for the UI
2. **Add some test data** - see how it works
3. **Explore each section** - Dashboard, Creators, Calendar, Videos, Analytics, Settings
4. **Read SUPABASE_SETUP.md** - when you're ready for cloud backup
5. **Deploy** - follow Next.js deployment guides

---

**Need help?** Check the documentation files or open browser console (F12) to see detailed logs.

Enjoy! 🚀
