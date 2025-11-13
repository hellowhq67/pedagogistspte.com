# PTE Mock Test System - Complete Implementation Guide

## Overview

This document outlines the complete mock test simulation system based on the real Pearson Test of English Academic exam.

## System Architecture

### 1. User Tiers

#### Free Tier

- **Mock Tests**: 1 free mock test (Test #1)
- **Practice Sections**: Limited access (few questions per type)
- **AI Scoring**: 10 credits per day
- **Section Tests**: Limited attempts

#### Pro Tier ($29/month)

- **Mock Tests**: Access to all 200 mock tests
- **Practice Sections**: Unlimited access to all questions
- **AI Scoring**: Unlimited
- **Section Tests**: Unlimited attempts
- **Test History**: Full history and analytics

#### Premium Tier ($49/month)

- Everything in Pro+
- Priority AI scoring (faster)
- Personalized study plans
- Teacher review (if linked)
- Advanced analytics

### 2. Mock Test Structure (Based on Real PTE Academic)

Each mock test follows the official PTE Academic format:

#### Part 1: Speaking & Writing (54-67 minutes)

1. **Personal Introduction** (1 question, not scored)
2. **Read Aloud** (6-7 questions)
3. **Repeat Sentence** (10-12 questions)
4. **Describe Image** (3-4 questions)
5. **Re-tell Lecture** (1-2 questions)
6. **Answer Short Question** (5-6 questions)
7. **Summarize Written Text** (2-3 questions)
8. **Essay** (1-2 questions)

#### Part 2: Reading (29-30 minutes)

1. **Reading & Writing: Fill in Blanks** (5-6 questions)
2. **Multiple Choice (Multiple)** (2-3 questions)
3. **Re-order Paragraphs** (2-3 questions)
4. **Fill in Blanks** (4-5 questions)
5. **Multiple Choice (Single)** (2-3 questions)

#### Part 3: Listening (30-43 minutes)

1. **Summarize Spoken Text** (2-3 questions)
2. **Multiple Choice (Multiple)** (2-3 questions)
3. **Fill in Blanks** (2-3 questions)
4. **Highlight Correct Summary** (2-3 questions)
5. **Multiple Choice (Single)** (2-3 questions)
6. **Select Missing Word** (2-3 questions)
7. **Highlight Incorrect Words** (2-3 questions)
8. **Write from Dictation** (3-4 questions)

### 3. Database Schema

```sql
-- Mock Tests (200 pre-generated tests)
mock_tests:
  - id
  - test_number (1-200)
  - title
  - difficulty
  - duration
  - is_free (only test #1)
  - status

-- Mock Test Questions (links to actual questions)
mock_test_questions:
  - mock_test_id
  - question_id (polymorphic)
  - question_type
  - section
  - order_index
  - time_limit

-- Mock Test Attempts
mock_test_attempts:
  - user_id
  - mock_test_id
  - status (in_progress, paused, completed)
  - current_question_index
  - scores (overall, speaking, writing, reading, listening)
  - enabling_skills_scores

-- Mock Test Answers
mock_test_answers:
  - attempt_id
  - question_id
  - user_response
  - scores
  - ai_feedback

-- Practice Locks (for free users)
practice_locks:
  - user_id
  - section
  - question_type
  - attempts_today
  - last_attempt_date
```

### 4. Mock Test Generation Strategy

#### Automated Generation (200 Tests)

```typescript
// For each test (1-200):
- Randomly select questions from each type
- Ensure difficulty distribution (30% Easy, 50% Medium, 20% Hard)
- Maintain variety (no duplicate questions in same test)
- Follow official PTE question count ranges
- Assign proper time limits per section
```

#### Question Distribution per Test

```
Speaking: 28-32 questions
Writing: 3-5 questions
Reading: 15-20 questions
Listening: 17-22 questions
Total: 63-79 questions per test
```

### 5. AI Scoring System

#### Free Users

- 10 AI scoring credits per day
- Resets at midnight UTC
- Can practice unlimited but only get AI feedback for 10 attempts
- Manual scoring available for practice

#### Pro/Premium Users

- Unlimited AI scoring
- Premium users get faster processing

#### Scoring Implementation

```typescript
// AI Scoring triggers:
- Speaking: Audio transcription + scoring
- Writing: Grammar, vocabulary, coherence analysis
- Reading: Auto-scored (multiple choice, fill blanks)
- Listening: Auto-scored + AI for complex answers

// Credit usage:
- Speaking questions: 1 credit
- Writing questions: 1 credit
- Reading: No credit (auto-scored)
- Listening: No credit for MCQ, 1 credit for text responses
```

### 6. Practice Section Locks

#### Free User Limitations

```typescript
const FREE_PRACTICE_LIMITS = {
  speaking: {
    read_aloud: 3,
    repeat_sentence: 3,
    describe_image: 2,
    retell_lecture: 2,
    answer_short_question: 3
  },
  writing: {
    summarize_written_text: 2,
    write_essay: 1
  },
  reading: {
    multiple_choice_single: 3,
    multiple_choice_multiple: 3,
    reorder_paragraphs: 2,
    fill_in_blanks: 3
  },
  listening: {
    summarize_spoken_text: 2,
    multiple_choice_multiple: 3,
    fill_in_blanks: 3,
    write_from_dictation: 3
  }
};
```

### 7. Mock Test Simulation Features

#### Real-Time Features

- Countdown timer for each section
- Auto-advance between questions
- Pause/Resume functionality (with restrictions)
- Progress indicator
- Cannot go back to previous sections
- Can review within current section

#### Navigation Rules

```typescript
// Section progression:
1. Speaking & Writing → Complete before moving to Reading
2. Reading → Complete before moving to Listening
3. Listening → Final section, cannot go back

// Within section:
- Can skip questions
- Can return to previous questions in SAME section
- Unanswered questions flagged
```

#### Timer Logic

```typescript
// Section timers:
Speaking & Writing: 54-67 minutes (auto-calculated)
Reading: 29-30 minutes (strict)
Listening: 30-43 minutes (auto-calculated based on audio)

// Question timers:
Read Aloud: 30-40 seconds
Repeat Sentence: 15 seconds
Describe Image: 40 seconds
Essay: 20 minutes
// etc...
```

### 8. Scoring Algorithm

#### Score Calculation (90-point scale)

```typescript
// Communicative Skills (each 0-90):
Speaking: Weighted average of pronunciation, fluency, content
Writing: Grammar, vocabulary, discourse, spelling
Reading: Correct answers weighted by difficulty
Listening: Correct answers weighted by type

// Enabling Skills (each 0-90):
Grammar: Extracted from Writing and Speaking
Oral Fluency: From Speaking
Pronunciation: From Speaking
Spelling: From Writing
Vocabulary: From Writing and Speaking
Written Discourse: From Writing
```

### 9. Test History & Analytics

#### Stored Data

- All test attempts
- Question-by-question performance
- Time taken per question
- Score trends over time
- Weak areas identification
- Comparison with target score

#### Analytics Dashboard

- Performance graph (overall score trend)
- Section breakdown
- Question type accuracy
- Time management analysis
- Recommended focus areas

### 10. API Endpoints

```
POST   /api/mock-tests/start              - Start new mock test
GET    /api/mock-tests                    - List available tests
GET    /api/mock-tests/[id]               - Get test details
POST   /api/mock-tests/[id]/submit        - Submit answer
POST   /api/mock-tests/[id]/pause         - Pause test
POST   /api/mock-tests/[id]/resume        - Resume test
POST   /api/mock-tests/[id]/complete      - Complete test
GET    /api/mock-tests/attempts/[id]      - Get attempt details
GET    /api/mock-tests/history            - Get user's test history

POST   /api/practice/[section]/[type]     - Practice specific type
GET    /api/practice/limits               - Get user's practice limits
POST   /api/ai-scoring/submit             - Submit for AI scoring
GET    /api/ai-scoring/credits            - Get available credits

GET    /api/subscription/status           - Get subscription status
POST   /api/subscription/upgrade          - Upgrade subscription
```

### 11. Implementation Priority

1. ✅ Database schema and migrations
2. ⏳ Subscription tier system
3. ⏳ Mock test generation script
4. ⏳ Practice limits middleware
5. ⏳ Mock test simulation API
6. ⏳ Timer system
7. ⏳ AI scoring integration with limits
8. ⏳ Test history and analytics
9. ⏳ UI components
10. ⏳ Payment integration (optional)

### 12. Key Features to Implement

#### Must Have

- Mock test simulation with timer
- 1 free mock test, 200 for paid
- Practice limits for free users
- 10 daily AI credits for free users
- Test history
- Basic analytics

#### Nice to Have

- Pause/Resume
- Detailed analytics dashboard
- Study plan generator
- Comparison with other users
- Teacher review system
- Mobile responsive

### 13. File Structure

```
lib/
  db/
    migrations/
      0007_add_mock_test_system.sql
  mock-tests/
    generator.ts          # Generate 200 mock tests
    scoring.ts            # Scoring algorithms
    timer.ts              # Timer logic
  subscription/
    tiers.ts              # Tier definitions
    limits.ts             # Practice limits
    credits.ts            # AI credit management

app/
  api/
    mock-tests/
      route.ts
      [id]/
        route.ts
        submit/route.ts
        complete/route.ts
    subscription/
      route.ts
    ai-scoring/
      route.ts

  pte/
    mock-tests/
      page.tsx              # List tests
      [id]/
        page.tsx            # Take test
        review/
          page.tsx          # Review results

components/
  mock-test/
    simulator.tsx           # Main test interface
    timer.tsx               # Timer component
    question-renderer.tsx   # Render different question types
    navigation.tsx          # Section navigation
    score-card.tsx          # Results display
```

### 14. Testing Strategy

1. Unit tests for scoring algorithms
2. Integration tests for API endpoints
3. E2E tests for mock test flow
4. Load testing for concurrent users
5. Timer accuracy testing

### 15. Performance Considerations

- Cache mock test structures
- Lazy load questions
- Optimize audio loading
- Background AI scoring queue
- Database indexing for fast queries

## Next Steps

1. Run migration to create tables
2. Implement subscription tier system
3. Create mock test generator script
4. Build mock test APIs
5. Create UI components
6. Integrate AI scoring with limits
7. Add payment gateway (Stripe/Paddle)
8. Testing and optimization
