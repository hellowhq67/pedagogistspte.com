# Practice Attempts Page - Complete Guide

## Overview

The Practice Attempts page provides a comprehensive view of all user practice attempts across Speaking, Writing, Reading, and Listening sections with:

- **Statistics Dashboard** - Total attempts, average score, top score, exam countdown
- **Section Breakdown** - Visual breakdown of attempts per section
- **Interactive Charts** - Score progress and activity charts
- **Exam Goal Setting** - Set target score and exam date
- **Advanced Filtering** - Filter by section, date range, and search
- **Detailed Table** - All attempts with scores and status
- **Progress Tracking** - Visual feedback on goal progress

## Files Created

### 1. Page Component

**File**: `app/pte/academic/practice-attempts/page.tsx`

- Server component with metadata
- Suspense boundary for loading states
- Integrates with existing header

### 2. Main Client Component

**File**: `components/pte/practice-attempts/practice-attempts-client.tsx`

- State management for filters, exam date, target score
- Fetches attempts from all four sections
- Calculates comprehensive statistics
- Implements real-time filtering
- Profile management (save/load exam goals)

### 3. Score Progress Chart

**File**: `components/pte/practice-attempts/score-progress-chart.tsx`

- Line chart showing score trends
- Displays all four sections
- Last 14 days of data
- Color-coded by section

### 4. Activity Chart

**File**: `components/pte/practice-attempts/attempts-chart.tsx`

- Stacked bar chart
- Shows attempts per day
- Last 7 days
- Section breakdown

### 5. Profile API

**File**: `app/api/user/profile/route.ts`

- GET: Fetch user profile (exam date, target score)
- PATCH: Update user profile
- Authenticated endpoints

## Installation

### 1. Install Required Dependencies

```bash
npm install recharts date-fns
# or
pnpm add recharts date-fns
```

### 2. Add Missing UI Components

If you don't have these components, install them:

```bash
npx shadcn@latest add calendar popover label
```

### 3. Ensure Database Schema

Make sure `userProfiles` table has these fields:

```typescript
examDate: timestamp("exam_date"),
targetScore: integer("target_score"),
```

## Features

### 📊 Statistics Dashboard

**Four Key Metrics:**

1. **Total Attempts** - Across all sections
2. **Average Score** - Weighted average of all scored attempts
3. **Top Score** - Personal best score
4. **Exam Countdown** - Days until exam (if set)

### 📈 Section Breakdown

Visual grid showing attempts per section:

- Speaking (Blue)
- Writing (Green)
- Reading (Purple)
- Listening (Orange)

### 📉 Interactive Charts

**Score Progress Chart:**

- Multi-line chart
- Last 14 days
- Separate line per section
- Shows score trends

**Activity Overview:**

- Stacked bar chart
- Last 7 days
- Shows daily practice volume
- Color-coded by section

### 🎯 Exam Goals

**Set Target Score:**

- Input field (10-90 scale)
- Visual progress indicator
- Gap analysis

**Set Exam Date:**

- Calendar picker
- Countdown calculator
- Motivation tracker

**Smart Feedback:**

- Green alert if target reached
- Orange alert with gap analysis
- Encouraging messages

### 🔍 Advanced Filtering

**Section Filter:**

- All Sections
- Speaking
- Writing
- Reading
- Listening

**Date Range Filter:**

- All Time
- Last 7 Days
- Last 30 Days

**Search:**

- Search by question title
- Real-time filtering

### 📋 Detailed Table

**Columns:**

- Date (formatted)
- Section (badge)
- Question Type
- Score (color-coded)
- Time Taken
- Status (Scored/Pending)

**Features:**

- Sorted by date (newest first)
- Limited to 50 rows for performance
- Responsive design
- Empty state handling

## Usage

### Access the Page

```
http://localhost:3000/pte/academic/practice-attempts
```

### Set Exam Goals

1. Enter target score (e.g., 79)
2. Click calendar to select exam date
3. Click "Save Goals"
4. See progress indicator

### Filter Attempts

1. Select section from dropdown
2. Choose date range
3. Type in search box
4. Table updates automatically

### Export Data (Future)

Click "Export CSV" to download attempts data.

## API Endpoints

### Get Profile

```
GET /api/user/profile
```

**Response:**

```json
{
  "id": "uuid",
  "userId": "user-id",
  "examDate": "2025-06-15T00:00:00Z",
  "targetScore": 79
}
```

### Update Profile

```
PATCH /api/user/profile
```

**Body:**

```json
{
  "examDate": "2025-06-15T00:00:00Z",
  "targetScore": 79
}
```

## Integration with Existing Code

The page automatically fetches from existing APIs:

- `/api/speaking/attempts`
- `/api/writing/attempts`
- `/api/reading/attempts`
- `/api/listening/attempts`

**Expected Response Format:**

```json
{
  "attempts": [
    {
      "id": "uuid",
      "questionId": "uuid",
      "questionType": "read_aloud",
      "userResponse": {},
      "scores": {
        "total": 75,
        "content": 80,
        "pronunciation": 70
      },
      "timeTaken": 45,
      "createdAt": "2025-01-13T..."
    }
  ]
}
```

## Styling

The page uses:

- Tailwind CSS for layout
- shadcn/ui components
- Dark mode support
- Responsive design
- Color-coded sections:
  - Speaking: Blue (#3b82f6)
  - Writing: Green (#10b981)
  - Reading: Purple (#a855f7)
  - Listening: Orange (#f97316)

## Performance Optimizations

1. **Memoization** - useMemo for expensive calculations
2. **Lazy Loading** - Suspense boundaries
3. **Limited Display** - Show only 50 rows
4. **Client-side Filtering** - No API calls on filter change
5. **Optimized Charts** - Recharts with responsive containers

## Future Enhancements

### 1. CSV Export

```typescript
const exportToCSV = () => {
  const csv = filteredAttempts.map(a => ({
    date: format(new Date(a.createdAt), 'yyyy-MM-dd'),
    section: a.section,
    type: a.questionType,
    score: a.scores?.total || 0,
    time: a.timeTaken,
  }));
  // Download logic
};
```

### 2. Detailed Attempt View

Click on row to see full attempt details with AI feedback.

### 3. Comparison with Mock Tests

Compare practice scores with mock test performance.

### 4. Study Recommendations

AI-generated recommendations based on weak areas.

### 5. Share Progress

Generate shareable progress reports.

## Troubleshooting

### Charts Not Displaying

Install dependencies:

```bash
npm install recharts date-fns
```

### No Attempts Showing

1. Check API endpoints are working
2. Verify user is authenticated
3. Check console for errors
4. Ensure attempts exist in database

### Profile Not Saving

1. Check `/api/user/profile` endpoint
2. Verify `userProfiles` table exists
3. Check authentication

### Filters Not Working

1. Check React DevTools for state
2. Verify filter values
3. Check console for errors

## Testing

### Manual Testing Checklist

- [ ] Page loads without errors
- [ ] Statistics display correctly
- [ ] Charts render with data
- [ ] Exam date picker works
- [ ] Target score input works
- [ ] Save goals button works
- [ ] Section filter works
- [ ] Date range filter works
- [ ] Search filter works
- [ ] Table displays attempts
- [ ] Scores are color-coded
- [ ] Empty state shows correctly
- [ ] Dark mode works

### Test Data

Create test attempts via practice pages or seed script.

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance

## Mobile Responsive

- Grid layout adapts to small screens
- Filters stack vertically
- Table scrolls horizontally
- Charts are touch-friendly
- Calendar is mobile-optimized

---

**🎉 The Practice Attempts page is now complete and ready to use!**

Access it at: [http://localhost:3000/pte/academic/practice-attempts](http://localhost:3000/pte/academic/practice-attempts)
