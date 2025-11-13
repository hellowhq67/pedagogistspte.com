# Practice Attempts Page - Quick Setup

## ✅ What's Been Created

### Pages & Components

1. **Main Page**: `app/pte/academic/practice-attempts/page.tsx`
2. **Client Component**: `components/pte/practice-attempts/practice-attempts-client.tsx`
3. **Score Chart**: `components/pte/practice-attempts/score-progress-chart.tsx`
4. **Activity Chart**: `components/pte/practice-attempts/attempts-chart.tsx`
5. **Profile API**: `app/api/user/profile/route.ts`

### Documentation

- `docs/PRACTICE_ATTEMPTS_GUIDE.md` - Complete guide

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install recharts date-fns
# or
pnpm add recharts date-fns
```

### Step 2: Add Missing UI Components

```bash
npx shadcn@latest add calendar popover label
```

### Step 3: Access the Page

Visit: **http://localhost:3000/pte/academic/practice-attempts**

## ✨ Features

### Dashboard

- ✅ Total attempts counter
- ✅ Average score calculation
- ✅ Top score tracker
- ✅ Exam countdown

### Visualizations

- ✅ Score progress line chart (14 days)
- ✅ Activity bar chart (7 days)
- ✅ Section breakdown grid

### Exam Goals

- ✅ Set target score (10-90)
- ✅ Set exam date with calendar
- ✅ Progress tracking
- ✅ Gap analysis

### Filtering

- ✅ Filter by section (Speaking, Writing, Reading, Listening)
- ✅ Filter by date range (7 days, 30 days, all time)
- ✅ Search by question title
- ✅ Real-time updates

### Table View

- ✅ All attempts with scores
- ✅ Color-coded scores
- ✅ Time tracking
- ✅ Status badges
- ✅ Responsive design

## 📊 How It Works

### Data Flow

```
User Practice → API Endpoints → Database
                      ↓
Practice Attempts Page fetches from:
  - /api/speaking/attempts
  - /api/writing/attempts
  - /api/reading/attempts
  - /api/listening/attempts
                      ↓
      Aggregated and Displayed
```

### Profile Management

```
User sets goals → PATCH /api/user/profile
                       ↓
                 Saved to userProfiles table
                       ↓
              Displayed on page load
```

## 🎨 Design Features

### Color Coding

- **Speaking**: Blue (#3b82f6)
- **Writing**: Green (#10b981)
- **Reading**: Purple (#a855f7)
- **Listening**: Orange (#f97316)

### Score Colors

- **79-90**: Green (Excellent)
- **65-78**: Blue (Good)
- **50-64**: Yellow (Fair)
- **0-49**: Red (Needs Improvement)

## 🔧 Technical Details

### State Management

- React `useState` for filters
- React `useMemo` for performance
- Real-time filtering (no API calls)

### Charts

- **recharts** library
- Responsive containers
- Dark mode support
- Touch-friendly

### Performance

- Memoized calculations
- Limited table display (50 rows)
- Lazy loading with Suspense
- Client-side filtering

## 📱 Responsive Design

### Mobile (< 768px)

- Cards stack vertically
- Filters stack vertically
- Table scrolls horizontally
- Charts adapt

### Tablet (768px - 1024px)

- 2-column grid for stats
- Side-by-side filters
- Optimized charts

### Desktop (> 1024px)

- 4-column stats grid
- Full-width table
- Large charts

## 🐛 Troubleshooting

### "recharts is not defined"

```bash
npm install recharts
```

### "Calendar component not found"

```bash
npx shadcn@latest add calendar
```

### No data showing

1. Make sure you have practice attempts
2. Check browser console for errors
3. Verify API endpoints return data

### Charts not rendering

1. Check `recharts` is installed
2. Verify data format matches expected structure
3. Check browser console

## 🎯 Next Steps

### Add to Navigation

Add link in your sidebar/menu:

```tsx
<Link href="/pte/academic/practice-attempts">
  <BarChart3 className="mr-2 h-4 w-4" />
  Practice Attempts
</Link>
```

### Customize

Edit colors, filters, or add new features in:

- `components/pte/practice-attempts/practice-attempts-client.tsx`

### Extend

Add features like:

- PDF export
- Email reports
- Social sharing
- Detailed attempt views

## 📖 Full Documentation

See `docs/PRACTICE_ATTEMPTS_GUIDE.md` for complete documentation including:

- Detailed feature descriptions
- API specifications
- Integration guide
- Future enhancements

---

## 🎉 You're All Set!

Your Practice Attempts page is ready to use. Users can now:

1. **Track Progress** - See all practice attempts in one place
2. **Set Goals** - Define target scores and exam dates
3. **Analyze Performance** - Visual charts and statistics
4. **Filter Data** - Find specific attempts easily
5. **Monitor Growth** - Track improvement over time

Visit: **http://localhost:3000/pte/academic/practice-attempts**
