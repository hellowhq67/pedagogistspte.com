# PTE Academic Practice System Testing Guide

## Prerequisites

### Environment Setup

1. **Database**: Ensure PostgreSQL is running and accessible
2. **Environment Variables**: Verify `.env.local` contains:
   ```
   DATABASE_URL=postgresql://...
   BETTER_AUTH_SECRET=...
   BETTER_AUTH_URL=http://localhost:3000
   ```
3. **Dependencies**: Run `pnpm install`
4. **Migrations**: Apply all migrations with `pnpm db:push` or `pnpm db:migrate`
5. **Development Server**: Start with `pnpm dev` on port 3000

### Test User Account

Create a test account or use existing credentials for authenticated endpoint testing.

---

## A. Database & Migration Testing

### 1. Verify All Migrations Applied

**Command:**

```bash
pnpm db:migrate
```

**Expected Result:**

- All 7 migrations should complete successfully
- No errors should be reported

**Migrations to Verify:**

- `0000_many_champions.sql` - Initial schema
- `0001_premium_nomad.sql` - Speaking questions and attempts
- `0002_next_the_santerians.sql` - Updates
- `0003_sparkling_mindworm.sql` - Reading questions
- `0004_add_reading_attempts.sql` - Reading attempts
- `0005_add_listening_tables.sql` - Listening questions and attempts
- `0006_add_writing_attempts.sql` - Writing questions and attempts

### 2. Verify All Tables Exist

**Required Tables:**

#### Core Tables

- `user` - User accounts
- `session` - User sessions
- `account` - OAuth accounts
- `verification` - Email verification

#### Speaking Section

- `speaking_questions` - Question prompts and metadata
- `speaking_attempts` - User submission records

#### Reading Section

- `reading_questions` - Question content and configuration
- `reading_attempts` - User submission records

#### Writing Section

- `writing_questions` - Essay and summary prompts
- `writing_attempts` - User submission records

#### Listening Section

- `listening_questions` - Audio-based questions
- `listening_attempts` - User submission records

**Verification Query:**

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### 3. Verify Foreign Key Relationships

**Key Relationships:**

#### Speaking

```sql
-- Attempts reference questions
ALTER TABLE speaking_attempts
  ADD CONSTRAINT fk_speaking_question
  FOREIGN KEY (question_id) REFERENCES speaking_questions(id);

-- Attempts reference users
ALTER TABLE speaking_attempts
  ADD CONSTRAINT fk_speaking_user
  FOREIGN KEY (user_id) REFERENCES user(id);
```

#### Reading

```sql
ALTER TABLE reading_attempts
  ADD CONSTRAINT fk_reading_question
  FOREIGN KEY (question_id) REFERENCES reading_questions(id);

ALTER TABLE reading_attempts
  ADD CONSTRAINT fk_reading_user
  FOREIGN KEY (user_id) REFERENCES user(id);
```

#### Writing

```sql
ALTER TABLE writing_attempts
  ADD CONSTRAINT fk_writing_question
  FOREIGN KEY (question_id) REFERENCES writing_questions(id);

ALTER TABLE writing_attempts
  ADD CONSTRAINT fk_writing_user
  FOREIGN KEY (user_id) REFERENCES user(id);
```

#### Listening

```sql
ALTER TABLE listening_attempts
  ADD CONSTRAINT fk_listening_question
  FOREIGN KEY (question_id) REFERENCES listening_questions(id);

ALTER TABLE listening_attempts
  ADD CONSTRAINT fk_listening_user
  FOREIGN KEY (user_id) REFERENCES user(id);
```

### 4. Verify Indexes

**Performance Indexes:**

```sql
-- Check indexes exist
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Expected Indexes:**

- Primary keys on all ID columns
- Foreign key indexes on question_id and user_id
- Question type indexes for filtering
- Difficulty level indexes for queries

---

## B. API Endpoint Testing

### Authentication Setup

All API endpoints (except seed endpoints in development) require authentication. Set up headers:

```bash
# Get session cookie after login
COOKIE="better-auth.session_token=your_session_token"
```

### Speaking Section

#### 1. List Speaking Questions

```bash
# Test pagination
curl -X GET "http://localhost:3000/api/speaking/questions?page=1&limit=10" \
  -H "Cookie: $COOKIE"
```

**Expected Response (200):**

```json
{
  "questions": [
    {
      "id": 1,
      "question_type": "read_aloud",
      "prompt": "...",
      "difficulty": "medium",
      "created_at": "..."
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

**Test Cases:**

- ✅ Default pagination (page 1, limit 20)
- ✅ Custom pagination (page 2, limit 5)
- ✅ Filter by question type: `?question_type=read_aloud`
- ✅ Filter by difficulty: `?difficulty=easy`
- ✅ Invalid page (returns empty array)
- ❌ Without auth (401)

#### 2. Get Single Speaking Question

```bash
curl -X GET "http://localhost:3000/api/speaking/questions/1" \
  -H "Cookie: $COOKIE"
```

**Expected Response (200):**

```json
{
  "id": 1,
  "question_type": "read_aloud",
  "prompt": "Read the following text aloud.",
  "audio_url": "https://...",
  "duration": 40,
  "difficulty": "medium",
  "instructions": "..."
}
```

**Test Cases:**

- ✅ Valid question ID
- ❌ Invalid question ID (404)
- ❌ Non-numeric ID (400)
- ❌ Without auth (401)

#### 3. Submit Speaking Attempt

```bash
curl -X POST "http://localhost:3000/api/speaking/attempts" \
  -H "Cookie: $COOKIE" \
  -H "Content-Type: application/json" \
  -d '{
    "question_id": 1,
    "audio_url": "https://storage.../recording.wav",
    "duration": 35
  }'
```

**Expected Response (201):**

```json
{
  "id": 123,
  "question_id": 1,
  "user_id": "user_123",
  "audio_url": "https://...",
  "score": {
    "overall": 85,
    "fluency": 90,
    "pronunciation": 80,
    "content": 85
  },
  "created_at": "..."
}
```

**Test Cases:**

- ✅ Valid submission with all required fields
- ❌ Missing question_id (400)
- ❌ Missing audio_url (400)
- ❌ Invalid question_id (404)
- ❌ Without auth (401)

#### 4. Get Speaking Attempts History

```bash
curl -X GET "http://localhost:3000/api/speaking/attempts?question_id=1" \
  -H "Cookie: $COOKIE"
```

**Expected Response (200):**

```json
{
  "attempts": [
    {
      "id": 123,
      "question_id": 1,
      "score": 85,
      "created_at": "..."
    }
  ]
}
```

**Test Cases:**

- ✅ Filter by question_id
- ✅ Without filter (all user attempts)
- ✅ Pagination support
- ❌ Without auth (401)

#### 5. Seed Speaking Questions

```bash
curl -X POST "http://localhost:3000/api/speaking/seed" \
  -H "Content-Type: application/json" \
  -d '{
    "question_type": "read_aloud",
    "reset": false
  }'
```

**Expected Response (200):**

```json
{
  "success": true,
  "count": 10,
  "question_type": "read_aloud"
}
```

**Test Cases:**

- ✅ Seed specific question type
- ✅ Reset flag clears existing data
- ✅ Seed all types (omit question_type)
- ❌ Invalid question type (400)
- ⚠️ Duplicate handling (should skip or update)

### Reading Section

#### 1. List Reading Questions

```bash
curl -X GET "http://localhost:3000/api/reading/questions?page=1&limit=10" \
  -H "Cookie: $COOKIE"
```

**Expected Response (200):**

```json
{
  "questions": [
    {
      "id": 1,
      "question_type": "multiple-choice-single",
      "title": "...",
      "difficulty": "medium",
      "time_limit": 180
    }
  ],
  "pagination": {
    "total": 30,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

**Test Cases:**

- ✅ Default pagination
- ✅ Filter by question_type
- ✅ Filter by difficulty
- ❌ Without auth (401)

#### 2. Get Single Reading Question

```bash
curl -X GET "http://localhost:3000/api/reading/questions/1" \
  -H "Cookie: $COOKIE"
```

**Expected Response (200):**

```json
{
  "id": 1,
  "question_type": "multiple-choice-single",
  "title": "Climate Change Impact",
  "passage": "Long text passage...",
  "question": "What is the main idea?",
  "options": ["A", "B", "C", "D"],
  "correct_answer": "B",
  "time_limit": 180,
  "difficulty": "medium"
}
```

**Test Cases:**

- ✅ Valid question ID
- ❌ Invalid question ID (404)
- ❌ Without auth (401)

#### 3. Submit Reading Attempt

```bash
curl -X POST "http://localhost:3000/api/reading/attempts" \
  -H "Cookie: $COOKIE" \
  -H "Content-Type: application/json" \
  -d '{
    "question_id": 1,
    "answer": "B",
    "time_taken": 150
  }'
```

**Expected Response (201):**

```json
{
  "id": 456,
  "question_id": 1,
  "user_id": "user_123",
  "answer": "B",
  "is_correct": true,
  "time_taken": 150,
  "score": 100,
  "created_at": "..."
}
```

**Test Cases:**

- ✅ Correct answer
- ✅ Wrong answer
- ❌ Missing answer (400)
- ❌ Invalid question_id (404)
- ❌ Without auth (401)

#### 4. Get Reading Attempts History

```bash
curl -X GET "http://localhost:3000/api/reading/attempts" \
  -H "Cookie: $COOKIE"
```

**Test Cases:**

- ✅ All user attempts
- ✅ Filter by question_id
- ✅ Pagination
- ❌ Without auth (401)

#### 5. Seed Reading Questions

```bash
curl -X POST "http://localhost:3000/api/reading/seed" \
  -H "Content-Type: application/json" \
  -d '{
    "question_type": "multiple-choice-single",
    "reset": false
  }'
```

**Test Cases:**

- ✅ Seed specific type
- ✅ Seed all types
- ✅ Reset functionality
- ❌ Invalid question type (400)

### Writing Section

#### 1. List Writing Questions

```bash
curl -X GET "http://localhost:3000/api/writing/questions" \
  -H "Cookie: $COOKIE"
```

**Expected Response (200):**

```json
{
  "questions": [
    {
      "id": 1,
      "question_type": "write-essay",
      "prompt": "Discuss the impact of...",
      "word_limit": 300,
      "time_limit": 1200
    }
  ]
}
```

**Test Cases:**

- ✅ List all questions
- ✅ Filter by question_type
- ✅ Pagination
- ❌ Without auth (401)

#### 2. Get Single Writing Question

```bash
curl -X GET "http://localhost:3000/api/writing/questions/1" \
  -H "Cookie: $COOKIE"
```

**Expected Response (200):**

```json
{
  "id": 1,
  "question_type": "write-essay",
  "prompt": "Discuss the advantages and disadvantages...",
  "instructions": "Write between 200-300 words",
  "word_limit": 300,
  "time_limit": 1200
}
```

**Test Cases:**

- ✅ Valid question ID
- ❌ Invalid question ID (404)
- ❌ Without auth (401)

#### 3. Submit Writing Attempt

```bash
curl -X POST "http://localhost:3000/api/writing/attempts" \
  -H "Cookie: $COOKIE" \
  -H "Content-Type: application/json" \
  -d '{
    "question_id": 1,
    "answer": "Technology has transformed modern society in numerous ways...",
    "word_count": 285,
    "time_taken": 1100
  }'
```

**Expected Response (201):**

```json
{
  "id": 789,
  "question_id": 1,
  "user_id": "user_123",
  "answer": "Technology has transformed...",
  "word_count": 285,
  "time_taken": 1100,
  "score": {
    "overall": 80,
    "content": 85,
    "form": 75,
    "grammar": 80,
    "vocabulary": 85,
    "spelling": 90
  },
  "created_at": "..."
}
```

**Test Cases:**

- ✅ Valid essay submission
- ✅ Word count validation
- ❌ Missing answer (400)
- ❌ Empty answer (400)
- ❌ Without auth (401)

#### 4. Get Writing Attempts History

```bash
curl -X GET "http://localhost:3000/api/writing/attempts" \
  -H "Cookie: $COOKIE"
```

**Test Cases:**

- ✅ All user attempts
- ✅ Filter by question_id
- ✅ Pagination
- ❌ Without auth (401)

#### 5. Seed Writing Questions

```bash
curl -X POST "http://localhost:3000/api/writing/seed" \
  -H "Content-Type: application/json" \
  -d '{
    "question_type": "write-essay",
    "reset": false
  }'
```

### Listening Section

#### 1. List Listening Questions

```bash
curl -X GET "http://localhost:3000/api/listening/questions" \
  -H "Cookie: $COOKIE"
```

**Expected Response (200):**

```json
{
  "questions": [
    {
      "id": 1,
      "question_type": "summarize-spoken-text",
      "title": "Lecture on Climate Change",
      "audio_url": "https://...",
      "duration": 60,
      "difficulty": "hard"
    }
  ]
}
```

**Test Cases:**

- ✅ List all questions
- ✅ Filter by question_type
- ✅ Pagination
- ❌ Without auth (401)

#### 2. Get Single Listening Question

```bash
curl -X GET "http://localhost:3000/api/listening/questions/1" \
  -H "Cookie: $COOKIE"
```

**Expected Response (200):**

```json
{
  "id": 1,
  "question_type": "summarize-spoken-text",
  "title": "Climate Change Lecture",
  "audio_url": "https://...",
  "duration": 60,
  "instructions": "Listen and summarize...",
  "transcript": "...",
  "difficulty": "hard",
  "time_limit": 600
}
```

**Test Cases:**

- ✅ Valid question ID
- ❌ Invalid question ID (404)
- ❌ Without auth (401)

#### 3. Submit Listening Attempt

```bash
curl -X POST "http://localhost:3000/api/listening/attempts" \
  -H "Cookie: $COOKIE" \
  -H "Content-Type: application/json" \
  -d '{
    "question_id": 1,
    "answer": "The lecture discussed climate change impacts...",
    "time_taken": 550
  }'
```

**Expected Response (201):**

```json
{
  "id": 321,
  "question_id": 1,
  "user_id": "user_123",
  "answer": "The lecture discussed...",
  "time_taken": 550,
  "score": 75,
  "created_at": "..."
}
```

**Test Cases:**

- ✅ Text answer submission
- ✅ JSON answer submission (for MCQ)
- ❌ Missing answer (400)
- ❌ Without auth (401)

#### 4. Get Listening Attempts History

```bash
curl -X GET "http://localhost:3000/api/listening/attempts" \
  -H "Cookie: $COOKIE"
```

#### 5. Seed Listening Questions

```bash
curl -X POST "http://localhost:3000/api/listening/seed" \
  -H "Content-Type: application/json" \
  -d '{
    "question_type": "summarize-spoken-text",
    "reset": false
  }'
```

### Unified Seed Endpoint

```bash
curl -X POST "http://localhost:3000/api/seed-all" \
  -H "Content-Type: application/json" \
  -d '{
    "sections": ["speaking", "reading", "writing", "listening"],
    "reset": false
  }'
```

**Expected Response (200):**

```json
{
  "success": true,
  "results": {
    "speaking": { "count": 50, "success": true },
    "reading": { "count": 30, "success": true },
    "writing": { "count": 20, "success": true },
    "listening": { "count": 40, "success": true }
  }
}
```

**Test Cases:**

- ✅ Seed all sections
- ✅ Seed specific sections only
- ✅ Reset flag behavior
- ❌ Invalid section name (400)

### Rate Limiting Tests

**Test rapid requests:**

```bash
# Make 100 requests rapidly
for i in {1..100}; do
  curl -X GET "http://localhost:3000/api/speaking/questions" \
    -H "Cookie: $COOKIE" &
done
```

**Expected:**

- First ~20 requests succeed (200)
- Additional requests are rate limited (429)
- Rate limit headers present:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

### Error Handling Tests

#### 400 Bad Request

```bash
# Missing required field
curl -X POST "http://localhost:3000/api/speaking/attempts" \
  -H "Cookie: $COOKIE" \
  -H "Content-Type: application/json" \
  -d '{"question_id": 1}'
```

**Expected Response:**

```json
{
  "error": "Missing required field: audio_url",
  "status": 400
}
```

#### 401 Unauthorized

```bash
# No authentication
curl -X GET "http://localhost:3000/api/speaking/questions"
```

**Expected Response:**

```json
{
  "error": "Unauthorized",
  "status": 401
}
```

#### 404 Not Found

```bash
# Invalid question ID
curl -X GET "http://localhost:3000/api/speaking/questions/99999" \
  -H "Cookie: $COOKIE"
```

**Expected Response:**

```json
{
  "error": "Question not found",
  "status": 404
}
```

#### 500 Internal Server Error

```bash
# Trigger database error (e.g., invalid data type)
curl -X POST "http://localhost:3000/api/speaking/attempts" \
  -H "Cookie: $COOKIE" \
  -H "Content-Type: application/json" \
  -d '{"question_id": "invalid", "audio_url": "test"}'
```

**Expected Response:**

```json
{
  "error": "Internal server error",
  "status": 500
}
```

---

## C. UI Component Testing

### Speaking Section

#### Question List Page

**URL:** `/pte/academic/practice/speaking/read-aloud`

**Tests:**

1. ✅ Page loads without errors
2. ✅ Questions list displays with pagination
3. ✅ Question cards show:
   - Question type badge
   - Difficulty indicator
   - Duration/time info
   - Practice button
4. ✅ Filter controls work:
   - Difficulty filter
   - Question type filter
5. ✅ Pagination controls work
6. ✅ Loading states display correctly
7. ✅ Empty state shows when no questions

#### Individual Question Page

**URL:** `/pte/academic/practice/speaking/read-aloud/question/[id]`

**Tests:**

1. ✅ Page loads with question data
2. ✅ Audio player displays and works:
   - Play/pause controls
   - Progress bar
   - Volume control
   - Time display
3. ✅ Recording widget displays:
   - Record button
   - Stop button
   - Audio preview
   - Timer
4. ✅ Submission flow works:
   - Record audio
   - Preview recording
   - Submit attempt
   - Success message
5. ✅ Navigation works:
   - Previous question
   - Next question
   - Back to list
6. ✅ Timer functionality:
   - Counts down
   - Auto-submit on zero
   - Shows warnings

#### Attempts History

**URL:** `/pte/academic/practice/speaking/read-aloud` (attempts tab)

**Tests:**

1. ✅ Attempts list displays
2. ✅ Shows score breakdown
3. ✅ Shows timestamp
4. ✅ Audio playback available
5. ✅ Empty state when no attempts

### Reading Section

#### Question List Page

**URL:** `/pte/academic/practice/reading/multiple-choice-single`

**Tests:**

1. ✅ Page loads without errors
2. ✅ Questions list displays
3. ✅ Cards show relevant info
4. ✅ Filters work
5. ✅ Pagination works

#### Individual Question Page

**URL:** `/pte/academic/practice/reading/multiple-choice-single/question/[id]`

**Tests for MCQ Single:**

1. ✅ Passage displays correctly
2. ✅ Question displays
3. ✅ Radio buttons for single answer
4. ✅ Submit button enabled after selection
5. ✅ Feedback shows after submission
6. ✅ Navigation works

**Tests for MCQ Multiple:**

1. ✅ Checkboxes for multiple answers
2. ✅ Can select multiple options
3. ✅ Submit validation

**Tests for Fill in the Blanks:**

1. ✅ Text inputs display in passage
2. ✅ Can type in blanks
3. ✅ Autocomplete/suggestions work
4. ✅ Submit validates all blanks filled

**Tests for Reorder Paragraphs:**

1. ✅ Draggable paragraph cards
2. ✅ Drag and drop works
3. ✅ Visual feedback during drag
4. ✅ Submit captures order

### Writing Section

#### Question List Page

**URL:** `/pte/academic/practice/writing/write-essay`

**Tests:**

1. ✅ Page loads without errors
2. ✅ Essay prompts display
3. ✅ Time limit shown
4. ✅ Word count requirements shown
5. ✅ Start button works

#### Individual Question Page

**URL:** `/pte/academic/practice/writing/write-essay/question/[id]`

**Tests for Write Essay:**

1. ✅ Prompt displays clearly
2. ✅ Text editor renders:
   - Rich text formatting (optional)
   - Plain text area
   - Toolbar (if rich text)
3. ✅ Word counter displays:
   - Updates in real-time
   - Shows remaining words
   - Color codes (red if over/under)
4. ✅ Timer displays and counts down
5. ✅ Submit button:
   - Enabled when valid
   - Shows validation errors
6. ✅ Auto-save functionality
7. ✅ Success message after submit

**Tests for Summarize Written Text:**

1. ✅ Source passage displays
2. ✅ Summary text area
3. ✅ Word limit (50-70 words) enforced
4. ✅ Submit validation

### Listening Section

#### Question List Page

**URL:** `/pte/academic/practice/listening/summarize-spoken-text`

**Tests:**

1. ✅ Page loads without errors
2. ✅ Audio-based questions list
3. ✅ Duration shown
4. ✅ Audio preview available
5. ✅ Start practice button

#### Individual Question Page

**URL:** `/pte/academic/practice/listening/summarize-spoken-text/question/[id]`

**Tests for Summarize Spoken Text:**

1. ✅ Audio player renders:
   - Plays audio
   - Shows duration
   - Seek controls
   - Volume
2. ✅ Text area for summary
3. ✅ Word counter (50-70 words)
4. ✅ Submit button works
5. ✅ Can listen multiple times

**Tests for Multiple Choice:**

1. ✅ Audio plays
2. ✅ Question displays
3. ✅ Options display (radio/checkbox)
4. ✅ Submit after audio finishes

**Tests for Fill in the Blanks:**

1. ✅ Audio plays
2. ✅ Transcript with blanks
3. ✅ Input fields work
4. ✅ Submit captures answers

**Tests for Highlight Incorrect Words:**

1. ✅ Audio plays
2. ✅ Transcript displays
3. ✅ Words are clickable
4. ✅ Selected words highlight
5. ✅ Submit captures selections

**Tests for Write from Dictation:**

1. ✅ Audio plays (once or twice)
2. ✅ Text input field
3. ✅ Submit button
4. ✅ Validation

### Cross-Section Tests

#### Navigation

1. ✅ Sidebar navigation works
2. ✅ Breadcrumbs display correctly
3. ✅ Back button functionality
4. ✅ Section switching

#### Error States

1. ✅ 404 page for invalid question ID
2. ✅ Error boundary catches errors
3. ✅ Network error handling
4. ✅ Timeout handling

#### Loading States

1. ✅ Skeleton loaders display
2. ✅ Spinner shows during operations
3. ✅ Optimistic UI updates

#### Responsive Design

1. ✅ Mobile layout works
2. ✅ Tablet layout works
3. ✅ Desktop layout works
4. ✅ Touch interactions work on mobile

---

## D. Data Seeding Testing

### CLI Seed Commands

#### Using TypeScript Seed Scripts

```bash
# Seed speaking questions
npx tsx scripts/seed-speaking.ts

# Seed reading questions
npx tsx scripts/seed-reading.ts

# Seed writing questions
npx tsx scripts/seed-writing.ts

# Seed listening questions
npx tsx scripts/seed-listening.ts
```

**Expected Results:**

- Scripts execute without errors
- Console shows progress messages
- Success message with count
- Database tables populated

### API Seed Endpoints

#### Individual Section Seeding

```bash
# Speaking
curl -X POST "http://localhost:3000/api/speaking/seed" \
  -H "Content-Type: application/json" \
  -d '{"reset": false}'

# Reading
curl -X POST "http://localhost:3000/api/reading/seed" \
  -H "Content-Type: application/json" \
  -d '{"reset": false}'

# Writing
curl -X POST "http://localhost:3000/api/writing/seed" \
  -H "Content-Type: application/json" \
  -d '{"reset": false}'

# Listening
curl -X POST "http://localhost:3000/api/listening/seed" \
  -H "Content-Type: application/json" \
  -d '{"reset": false}'
```

#### Unified Seed Endpoint

```bash
# Seed all sections
curl -X POST "http://localhost:3000/api/seed-all" \
  -H "Content-Type: application/json" \
  -d '{
    "sections": ["speaking", "reading", "writing", "listening"],
    "reset": false
  }'
```

### Duplicate Handling

**Test duplicate prevention:**

1. Seed speaking questions
2. Run seed again without reset
3. Verify: Questions should be skipped or updated, not duplicated

```bash
# First seed
curl -X POST "http://localhost:3000/api/speaking/seed"

# Check count
psql -d yourdb -c "SELECT COUNT(*) FROM speaking_questions;"

# Second seed (should not duplicate)
curl -X POST "http://localhost:3000/api/speaking/seed"

# Check count again (should be same)
psql -d yourdb -c "SELECT COUNT(*) FROM speaking_questions;"
```

### Reset Functionality

**Test reset flag:**

```bash
# Seed with reset=true
curl -X POST "http://localhost:3000/api/speaking/seed" \
  -H "Content-Type: application/json" \
  -d '{"reset": true}'

# Should clear existing and insert fresh data
```

**Verify:**

- Old questions removed
- New questions inserted
- Attempts preserved (or discuss if they should cascade delete)

### Question Count Verification

**Expected Counts (adjust based on your seed data):**

```sql
-- Speaking questions
SELECT question_type, COUNT(*)
FROM speaking_questions
GROUP BY question_type;

-- Expected:
-- read_aloud: 10
-- repeat_sentence: 10
-- describe_image: 10
-- retell_lecture: 10
-- answer_short_question: 10
-- respond_to_a_situation: 10
-- summarize_group_discussion: 10

-- Reading questions
SELECT question_type, COUNT(*)
FROM reading_questions
GROUP BY question_type;

-- Expected:
-- multiple-choice-single: 10
-- multiple-choice-multiple: 10
-- fill-in-blanks: 10
-- reorder-paragraphs: 10
-- reading-writing-fill-blanks: 10

-- Writing questions
SELECT question_type, COUNT(*)
FROM writing_questions
GROUP BY question_type;

-- Expected:
-- write-essay: 10
-- summarize-written-text: 10

-- Listening questions
SELECT question_type, COUNT(*)
FROM listening_questions
GROUP BY question_type;

-- Expected:
-- summarize-spoken-text: 5
-- multiple-choice-single: 5
-- multiple-choice-multiple: 5
-- fill-in-blanks: 5
-- highlight-correct-summary: 5
-- highlight-incorrect-words: 5
-- select-missing-word: 5
-- write-from-dictation: 5
```

---

## Common Issues and Troubleshooting

### Issue: Migrations Fail

**Symptoms:** Error during `pnpm db:migrate`

**Solutions:**

1. Check DATABASE_URL is correct
2. Ensure PostgreSQL is running
3. Check database user has permissions
4. Try dropping and recreating database:
   ```bash
   dropdb yourdb
   createdb yourdb
   pnpm db:push
   ```

### Issue: API Returns 401

**Symptoms:** Unauthorized errors even with session

**Solutions:**

1. Check cookie is being sent
2. Verify session hasn't expired
3. Check BETTER_AUTH_SECRET matches
4. Try logging in again
5. Check auth middleware configuration

### Issue: Seed Data Not Appearing

**Symptoms:** Seed endpoint returns success but no data in database

**Solutions:**

1. Check seed JSON files exist in `lib/db/seeds/`
2. Verify file paths in seed scripts
3. Check for validation errors in seed data
4. Look at server logs for errors
5. Verify database connection

### Issue: Questions Not Loading in UI

**Symptoms:** Empty list or loading spinner forever

**Solutions:**

1. Check browser console for errors
2. Verify API endpoint is accessible
3. Check authentication status
4. Look at network tab for failed requests
5. Verify database has questions

### Issue: Audio Not Playing

**Symptoms:** Audio player shows but no sound

**Solutions:**

1. Verify audio URL is accessible
2. Check audio file format (should be mp3/wav)
3. Look for CORS issues
4. Check browser audio permissions
5. Try different browser

### Issue: Submission Fails

**Symptoms:** Submit button doesn't work or returns error

**Solutions:**

1. Check required fields are filled
2. Verify validation rules
3. Look at network request/response
4. Check server logs
5. Verify database constraints

---

## Success Criteria

### Database

- ✅ All migrations applied successfully
- ✅ All 12+ tables exist
- ✅ Foreign keys configured correctly
- ✅ Indexes created for performance

### API Endpoints

- ✅ All 20+ endpoints respond correctly
- ✅ Authentication enforced properly
- ✅ Error handling works as expected
- ✅ Rate limiting functional
- ✅ Response formats consistent

### UI Components

- ✅ All section pages load
- ✅ Question lists display with pagination
- ✅ Individual questions render correctly
- ✅ All input widgets functional
- ✅ Submission flows complete
- ✅ Attempts history displays
- ✅ Navigation works between pages
- ✅ Timers function correctly
- ✅ Error states handled gracefully

### Data Seeding

- ✅ CLI commands work
- ✅ API endpoints seed correctly
- ✅ Unified endpoint seeds all sections
- ✅ Duplicate prevention works
- ✅ Question counts match expectations

---

## Test Execution Checklist

### Pre-Testing

- [ ] Database running
- [ ] Migrations applied
- [ ] Dev server running
- [ ] Test user account created
- [ ] Environment variables configured

### Database Tests

- [ ] Run migration verification
- [ ] Check all tables exist
- [ ] Verify foreign keys
- [ ] Confirm indexes created

### API Tests

- [ ] Test speaking endpoints
- [ ] Test reading endpoints
- [ ] Test writing endpoints
- [ ] Test listening endpoints
- [ ] Test seed-all endpoint
- [ ] Verify rate limiting
- [ ] Test error responses

### UI Tests

- [ ] Test speaking section UI
- [ ] Test reading section UI
- [ ] Test writing section UI
- [ ] Test listening section UI
- [ ] Test navigation
- [ ] Test responsive design

### Seeding Tests

- [ ] Run CLI seed scripts
- [ ] Test API seed endpoints
- [ ] Verify duplicate handling
- [ ] Confirm question counts
- [ ] Test reset functionality

### Post-Testing

- [ ] Document all issues found
- [ ] Create bug reports
- [ ] Verify fixes
- [ ] Generate test report

---

## Reporting

### Test Report Template

```markdown
# PTE Academic Practice System Test Report

**Date:** YYYY-MM-DD
**Tester:** Name
**Environment:** Development/Staging/Production

## Summary

- Total Tests: X
- Passed: X
- Failed: X
- Blocked: X

## Database Tests

- Migrations: ✅/❌
- Tables: ✅/❌
- Foreign Keys: ✅/❌
- Indexes: ✅/❌

## API Tests

### Speaking Section

- List Questions: ✅/❌
- Get Question: ✅/❌
- Submit Attempt: ✅/❌
- Get Attempts: ✅/❌
- Seed: ✅/❌

### Reading Section

- List Questions: ✅/❌
- Get Question: ✅/❌
- Submit Attempt: ✅/❌
- Get Attempts: ✅/❌
- Seed: ✅/❌

### Writing Section

- List Questions: ✅/❌
- Get Question: ✅/❌
- Submit Attempt: ✅/❌
- Get Attempts: ✅/❌
- Seed: ✅/❌

### Listening Section

- List Questions: ✅/❌
- Get Question: ✅/❌
- Submit Attempt: ✅/❌
- Get Attempts: ✅/❌
- Seed: ✅/❌

## UI Tests

- Speaking: ✅/❌
- Reading: ✅/❌
- Writing: ✅/❌
- Listening: ✅/❌

## Issues Found

1. [Issue description]
   - Severity: Critical/High/Medium/Low
   - Status: Open/In Progress/Resolved

2. [Issue description]
   - Severity: Critical/High/Medium/Low
   - Status: Open/In Progress/Resolved

## Recommendations

1. [Recommendation]
2. [Recommendation]

## Sign-off

Tested by: **\*\***\_\_\_**\*\***
Date: **\*\***\_\_\_**\*\***
```

---

## Next Steps

After completing testing:

1. **Fix Critical Issues:** Address any blocking or critical bugs
2. **Performance Testing:** Run load tests for high traffic
3. **Security Testing:** Verify authentication and authorization
4. **User Acceptance Testing:** Get feedback from real users
5. **Documentation:** Update user guides and API docs
6. **Deployment:** Prepare for production release

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Better Auth Docs](https://better-auth.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Document Version:** 1.0
**Last Updated:** 2025-11-13
