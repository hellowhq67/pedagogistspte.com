# PTE Academic Practice System - Quick Verification Checklist

Use this checklist for rapid manual verification of the practice system.

## Prerequisites

- [ ] Development server is running (`pnpm dev`)
- [ ] Database is accessible and migrations applied
- [ ] Test user account exists
- [ ] Browser is open to `http://localhost:3000`

---

## Database Setup

- [ ] All migrations have been applied successfully
- [ ] Database contains expected tables (speaking, reading, writing, listening)
- [ ] Foreign keys are configured correctly
- [ ] No database connection errors in logs

---

## Data Seeding

- [ ] Seed data has been loaded for all sections
- [ ] Speaking questions exist in database
- [ ] Reading questions exist in database
- [ ] Writing questions exist in database
- [ ] Listening questions exist in database
- [ ] Question counts match expectations (~10-50 per section)
- [ ] No duplicate questions created

**Quick Seed Test:**

```bash
curl -X POST "http://localhost:3000/api/seed-all" \
  -H "Content-Type: application/json" \
  -d '{"sections": ["speaking"], "reset": false}'
```

Response should show `{"success": true, ...}`

---

## Speaking Section Verification

### Question List Pages

- [ ] `/pte/academic/practice/speaking/read-aloud` loads
- [ ] Questions list displays with cards
- [ ] Pagination controls are visible
- [ ] "Start Practice" buttons work
- [ ] Difficulty badges display correctly

### Individual Question Pages

- [ ] `/pte/academic/practice/speaking/read-aloud/question/1` loads
- [ ] Question prompt displays
- [ ] Audio player renders (if audio available)
- [ ] Recording controls display
- [ ] Timer shows countdown
- [ ] "Submit" button is present
- [ ] Navigation to prev/next questions works
- [ ] Can return to question list

### Other Speaking Question Types

- [ ] Answer Short Question pages load
- [ ] Describe Image pages load
- [ ] Repeat Sentence pages load
- [ ] Respond to a Situation pages load
- [ ] Retell Lecture pages load
- [ ] Summarize Group Discussion pages load

### Attempts History

- [ ] Attempts list page displays (if attempts exist)
- [ ] Past attempts show scores
- [ ] Audio playback available for recordings
- [ ] Timestamps display correctly
- [ ] Empty state shows when no attempts

---

## Reading Section Verification

### Question List Pages

- [ ] `/pte/academic/practice/reading/multiple-choice-single` loads
- [ ] Questions list displays
- [ ] Question cards show titles and difficulty
- [ ] "Practice" button works
- [ ] Pagination works

### Individual Question Pages - MCQ Single

- [ ] `/pte/academic/practice/reading/multiple-choice-single/question/1` loads
- [ ] Passage text displays
- [ ] Question displays clearly
- [ ] Radio buttons for answer options
- [ ] Only one option can be selected
- [ ] "Submit" button works
- [ ] Navigation between questions works

### Individual Question Pages - MCQ Multiple

- [ ] Checkboxes display for multiple answers
- [ ] Multiple options can be selected
- [ ] Submit validates at least one selection

### Individual Question Pages - Fill in the Blanks

- [ ] Text passage displays with input fields
- [ ] Can type in blank fields
- [ ] Word suggestions appear (if implemented)
- [ ] Submit captures all answers

### Individual Question Pages - Reorder Paragraphs

- [ ] Paragraph cards display
- [ ] Drag and drop functionality works
- [ ] Visual feedback during dragging
- [ ] Submit captures final order

### Individual Question Pages - Reading & Writing Fill Blanks

- [ ] Combined passage displays
- [ ] Dropdown/input fields work
- [ ] All blanks can be filled
- [ ] Submit works

### Other Reading Pages

- [ ] All reading question type list pages load
- [ ] All individual question pages render

### Attempts History

- [ ] Reading attempts display
- [ ] Scores show correctly
- [ ] Correct/incorrect answers indicated
- [ ] Can review past attempts

---

## Writing Section Verification

### Question List Pages

- [ ] `/pte/academic/practice/writing/write-essay` loads
- [ ] Essay prompts display
- [ ] Time limits shown (20 minutes/1200 seconds)
- [ ] Word count requirements shown (200-300 words)
- [ ] "Start Writing" button works

### Individual Question Pages - Write Essay

- [ ] `/pte/academic/practice/writing/write-essay/question/1` loads
- [ ] Essay prompt displays clearly
- [ ] Text editor/textarea renders
- [ ] Word counter displays and updates in real-time
- [ ] Timer counts down from 20 minutes
- [ ] Character count works
- [ ] Submit button enables when requirements met
- [ ] Can type and edit content
- [ ] Navigation works

### Individual Question Pages - Summarize Written Text

- [ ] Source passage displays
- [ ] Summary text area available
- [ ] Word counter works (50-70 words)
- [ ] Timer counts down (10 minutes)
- [ ] Submit validates word count
- [ ] Navigation works

### Attempts History

- [ ] Writing attempts list displays
- [ ] Past essays/summaries show
- [ ] Word counts display
- [ ] Scores show breakdown (content, form, grammar, etc.)
- [ ] Can view submitted text
- [ ] Timestamps correct

---

## Listening Section Verification

### Question List Pages

- [ ] `/pte/academic/practice/listening/summarize-spoken-text` loads
- [ ] Audio-based questions list
- [ ] Audio duration shown
- [ ] Question titles display
- [ ] "Start Practice" button works

### Individual Question Pages - Summarize Spoken Text

- [ ] `/pte/academic/practice/listening/summarize-spoken-text/question/1` loads
- [ ] Audio player renders
- [ ] Play/pause button works
- [ ] Audio plays correctly
- [ ] Volume control works
- [ ] Progress bar shows playback position
- [ ] Text area for summary
- [ ] Word counter (50-70 words)
- [ ] Can listen multiple times
- [ ] Submit button works
- [ ] Timer counts down

### Individual Question Pages - Multiple Choice Single

- [ ] Audio plays when page loads/on play button
- [ ] Question displays after audio
- [ ] Radio buttons for single answer
- [ ] Submit button enabled after selection

### Individual Question Pages - Multiple Choice Multiple

- [ ] Audio plays
- [ ] Question displays
- [ ] Checkboxes for multiple answers
- [ ] Submit validates selections

### Individual Question Pages - Fill in the Blanks

- [ ] Audio plays
- [ ] Transcript with blanks displays
- [ ] Input fields embedded in text
- [ ] Can type in blanks
- [ ] Submit captures all answers

### Individual Question Pages - Highlight Correct Summary

- [ ] Audio plays
- [ ] Multiple summary options display
- [ ] Radio buttons for selection
- [ ] Submit works

### Individual Question Pages - Highlight Incorrect Words

- [ ] Audio plays
- [ ] Transcript displays
- [ ] Words are clickable
- [ ] Clicked words highlight
- [ ] Can click multiple words
- [ ] Submit captures selected words

### Individual Question Pages - Select Missing Word

- [ ] Audio plays with last word/phrase missing
- [ ] Options display after audio
- [ ] Can select option
- [ ] Submit works

### Individual Question Pages - Write from Dictation

- [ ] Audio plays (usually 1-2 times)
- [ ] Text input field available
- [ ] Can type sentence
- [ ] Submit validates input

### Other Listening Pages

- [ ] All listening question type list pages load
- [ ] All individual question pages render

### Attempts History

- [ ] Listening attempts display
- [ ] Scores show
- [ ] Can see submitted answers
- [ ] Timestamps correct

---

## Cross-Section Functionality

### Navigation

- [ ] Sidebar navigation displays all sections
- [ ] Can switch between Speaking/Reading/Writing/Listening
- [ ] Breadcrumbs show current location
- [ ] Back button returns to previous page
- [ ] Section switching maintains context

### Authentication

- [ ] Login page displays
- [ ] Can sign in with test account
- [ ] Session persists across pages
- [ ] Logout works
- [ ] Protected routes redirect to login

### Error Handling

- [ ] 404 page displays for invalid routes
- [ ] Error boundary catches errors
- [ ] Network errors show user-friendly messages
- [ ] Timeout errors handled gracefully
- [ ] Invalid question IDs show appropriate error

### Loading States

- [ ] Skeleton loaders display while fetching data
- [ ] Spinner shows during submit operations
- [ ] Loading states don't block UI unnecessarily
- [ ] Optimistic UI updates work (if implemented)

### Responsive Design

- [ ] Mobile layout works (< 768px width)
- [ ] Tablet layout works (768px - 1024px)
- [ ] Desktop layout works (> 1024px)
- [ ] Touch interactions work on mobile
- [ ] Navigation menu adapts to screen size

---

## API Endpoints Quick Test

Run the automated test script:

```bash
npx tsx scripts/test-all-apis.ts
```

Or test manually:

### Speaking API

- [ ] `GET /api/speaking/questions` returns 200
- [ ] `GET /api/speaking/questions/1` returns 200
- [ ] `POST /api/speaking/seed` returns 200

### Reading API

- [ ] `GET /api/reading/questions` returns 200
- [ ] `GET /api/reading/questions/1` returns 200
- [ ] `POST /api/reading/seed` returns 200

### Writing API

- [ ] `GET /api/writing/questions` returns 200
- [ ] `GET /api/writing/questions/1` returns 200
- [ ] `POST /api/writing/seed` returns 200

### Listening API

- [ ] `GET /api/listening/questions` returns 200
- [ ] `GET /api/listening/questions/1` returns 200
- [ ] `POST /api/listening/seed` returns 200

### Unified Seed API

- [ ] `POST /api/seed-all` returns 200

---

## Performance Checks

- [ ] Question list pages load in < 2 seconds
- [ ] Individual question pages load in < 1 second
- [ ] API responses return in < 500ms
- [ ] Audio loads and plays without buffering issues
- [ ] No memory leaks during navigation
- [ ] No excessive re-renders

---

## Browser Console Checks

- [ ] No JavaScript errors in console
- [ ] No React warnings in console
- [ ] No failed network requests (except expected 401s)
- [ ] No CORS errors
- [ ] Proper logging for debugging (if verbose mode)

---

## Final Checks

- [ ] All critical user flows work end-to-end
- [ ] No blocking bugs found
- [ ] Documentation is accurate
- [ ] Test scripts run successfully
- [ ] Database verification passes
- [ ] Ready for user acceptance testing

---

## Notes & Issues

Document any issues found during verification:

**Issue 1:**

- Description:
- Severity: Critical / High / Medium / Low
- Steps to reproduce:
- Expected behavior:
- Actual behavior:

**Issue 2:**

- Description:
- Severity:
- Steps to reproduce:
- Expected behavior:
- Actual behavior:

---

## Sign-Off

- [ ] Verified by: **\*\***\_\_\_**\*\***
- [ ] Date: **\*\***\_\_\_**\*\***
- [ ] Status: ✅ Ready / ⚠️ Issues Found / ❌ Blocking Issues
- [ ] Next Steps: **\*\***\_\_\_**\*\***

---

**Completion Time:** **\_\_** minutes

**Overall Assessment:**

- System Readiness: Ready / Needs Work / Not Ready
- Confidence Level: High / Medium / Low
- Recommendation: Deploy / Fix Issues First / Major Rework Needed
