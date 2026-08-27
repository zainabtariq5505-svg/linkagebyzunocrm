# Linkage Creator CRM

A lightweight, premium admin-only CRM for managing creator content and scheduling for Linkage by Zuno.

## Getting Started

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

## Features

### Dashboard
- Quick overview of today's metrics
- Required videos, added, approved, remaining counts
- Daily views and averages
- Active creators and filled slots
- Visual slot status indicators
- Quick action buttons for adding creators/videos

### Creators Management
- Add, edit, delete creators
- Track creator stats:
  - Total videos
  - Total views
  - Average views per video
  - Compliance rate
  - Missed content
- Search by name or Instagram handle
- Creator statuses: Active, Paused, Inactive, Breached

### Calendar
- Monthly calendar view
- Click any date to see/manage slot assignments
- Visual indicators:
  - **Green** = slots complete
  - **Yellow** = slots partial
  - **Red** = slots behind
  - **Gray** = no requirement
- View and edit videos for any day
- Change video status directly from calendar

### Videos
- Manual entry of videos with:
  - Creator selection
  - Date and slot assignment
  - Video URL
  - View count (manual entry)
  - Status (Added, Approved, Rejected, Missed)
  - Optional notes
- Open video link directly
- Edit or delete videos
- Sort by date (newest first)

### Analytics
- Key metrics: Total videos, views, averages, approval rates
- Views over time chart (7 days or 30 days)
- Status breakdown with percentages

### Settings
- Configure daily video requirements per day of week
  - Default: Mon-Fri = 10/day, Sat = 20/day, Sun = 0
  - Easily adjust to your needs
- Dark mode toggle
- Project information

## Data Storage

All data is stored locally in your browser using `localStorage` by default. 

**Optional:** Connect to Supabase for cloud backup and multi-device sync:
- No additional setup required if you skip this
- Data stays private in localStorage
- Add Supabase later without losing any data
- See `SUPABASE_SETUP.md` for cloud integration guide

## Design

- **Light-first premium design** with warm whites and dark text
- Soft gray borders and subtle shadows
- Purple accent color (#8B5CF6)
- Responsive layout (desktop, tablet, mobile-optimized)
- Subtle micro-interactions and smooth transitions
- Custom cursor on desktop
- Optional dark mode

## Technology Stack

- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Storage**: Browser localStorage (persistent, no backend required)

## Browser Support

Works on all modern browsers that support:
- ES2020
- localStorage API
- CSS Grid and Flexbox

## Architecture

### File Structure
```
├── app/
│   ├── page.tsx              # Dashboard
│   ├── creators/             # Creators management
│   ├── calendar/             # Calendar & scheduling
│   ├── videos/               # Video management
│   ├── analytics/            # Analytics & charts
│   ├── settings/             # Settings
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── Navigation.tsx        # Main navigation
│   ├── StatCard.tsx          # Stat display component
│   └── modals/               # Modal dialogs
├── lib/
│   ├── types.ts              # TypeScript types
│   ├── storage.ts            # localStorage API
│   └── utils.ts              # Utility functions
```

### Data Model

**Creator**
- ID, Name, Instagram Username, Account Size, Status
- Computed: Total Videos, Views, Averages, Compliance

**Video**
- ID, Creator ID, Date, Slot, URL, Views, Status, Notes
- Statuses: Added, Approved, Rejected, Missed

**Daily Requirements**
- Day of week (0-6), Required videos count

## License

Private project for Linkage by Zuno.
