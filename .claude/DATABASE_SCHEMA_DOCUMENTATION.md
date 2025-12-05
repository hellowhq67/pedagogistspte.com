# PTE Academic Platform - Improved Database Schema Documentation

## Overview

This document describes the improved database schema for the PTE Academic practice platform. The schema has been redesigned to support:

1. **Practice Lessons** - Organized study units with 5-10 questions each
2. **Mock Tests** - Full-length practice tests (separate question bank)
3. **User Membership Tiers** - Free Trial, Pro, and Premium
4. **All PTE Modules** - Speaking, Writing, Reading, Listening
5. **Media Management** - Centralized audio, image, and video storage
6. **Progress Tracking** - Detailed analytics and lesson completion tracking

---

## Key Design Principles

### 1. Separation of Concerns
- **Practice Lessons**: For daily practice, organized by module and type
- **Mock Tests**: Full-length tests with time limits (uses existing `schema-mock-tests.ts`)

### 2. Membership Tiers
- **Free Trial**: Limited access, 4 AI credits/day
- **Pro**: Full access to practice lessons, 50 AI credits/day
- **Premium**: All features including mock tests, unlimited AI credits

### 3. Media Management
- Centralized `media` table for all audio, images, videos
- Foreign key references from questions to media
- Supports versioning and metadata

### 4. Lesson Structure
Each lesson contains:
- 5-10 questions of the same type
- Difficulty level (Easy/Medium/Hard)
- Access control (Free vs. Paid)
- Progress tracking per user

---

## Database Tables

### Core Tables

#### `users`
Main user account table with membership information.

**Key Fields:**
- `membershipTier`: free_trial | pro | premium
- `membershipStatus`: active | expired | cancelled | trial
- `dailyAiCredits`: Credits available (4 for free, 50 for pro, -1 for unlimited)
- `preferredAlgorithm`: EN_V2e | S-ASIA_V4i

**Relations:**
- One-to-one: `user_subscriptions`, `user_stats`
- One-to-many: All attempt tables, `lesson_progress`

---

#### `user_subscriptions`
Manages user subscription details and billing.

**Key Fields:**
- `tier`: Which membership tier
- `status`: Current subscription status
- `startDate` / `endDate`: Subscription period
- `stripeSubscriptionId`: For payment processing

---

#### `media`
Centralized storage for all media files.

**Key Fields:**
- `type`: audio | image | video | document
- `url`: Full URL to the media file
- `duration`: For audio/video (in seconds)
- `metadata`: Additional info (width, height, bitrate, etc.)

**Used By:**
- Speaking questions (prompt images, audio, sample answers)
- Listening questions (audio prompts)
- User attempts (submitted audio)

---

### Practice Lesson System

#### `practice_lessons`
Organizes questions into manageable learning units.

**Key Fields:**
- `lessonNumber`: L1, L2, L3, etc.
- `module`: speaking | writing | reading | listening
- `questionType`: Specific type (e.g., read_aloud, describe_image)
- `isFree`: Whether accessible to free users
- `requiredTier`: Minimum membership tier required
- `questionCount`: Total questions in lesson (auto-calculated)
- `orderIndex`: Display order within module

**Example Lessons:**
```
Lesson 1: Read Aloud - Easy (10 questions) [FREE]
Lesson 2: Read Aloud - Medium (10 questions) [PRO]
Lesson 3: Describe Image - Easy (8 questions) [PRO]
Lesson 4: Repeat Sentence - Medium (10 questions) [PRO]
```

---

### Speaking Module

#### `speaking_questions`
All speaking practice questions.

**Speaking Types:**
1. **read_aloud** - Read text (40-60 words) aloud
2. **repeat_sentence** - Listen and repeat
3. **describe_image** - Describe an image
4. **retell_lecture** - Summarize a lecture
5. **answer_short_question** - Quick answer to a question
6. **summarize_group_discussion** - Summarize a 90-120 second discussion
7. **respond_to_a_situation** - Respond to a scenario

**Key Fields:**
- `type`: The speaking type (enum)
- `promptText`: Text to read or description
- `promptImageId`: FK to media (for describe_image)
- `promptAudioId`: FK to media (for repeat_sentence, retell_lecture, etc.)
- `sampleAnswerAudioId`: FK to media (high-score example)
- `referenceAudioUrlUS/UK`: Native speaker pronunciation
- `lessonId`: FK to practice_lessons (NULL for mock test questions)
- `prepTimeSeconds`: How long user can prepare
- `estimatedSeconds`: Expected answer duration

**Media Requirements by Type:**
- `read_aloud`: promptText only (optional reference audio)
- `repeat_sentence`: promptAudioId (3-9 seconds)
- `describe_image`: promptImageId
- `retell_lecture`: promptAudioId (60-90 seconds)
- `answer_short_question`: promptAudioId (short question)
- `summarize_group_discussion`: promptAudioId (90-120 seconds, 3 speakers)
- `respond_to_a_situation`: promptText or promptAudioId

---

#### `speaking_attempts`
User's speaking practice submissions.

**Key Fields:**
- `audioUrl`: User's recorded answer
- `transcript`: AI-generated transcription
- `algorithmVersion`: EN_V2e or S-ASIA_V4i
- **Scores (0-90 scale):**
  - `overallScore`
  - `pronunciationScore`
  - `fluencyScore`
  - `contentScore`
- **Metrics:**
  - `wordsPerMinute`
  - `pauseCount`
  - `fillerWordCount`
- `aiFeedback`: Generated feedback text
- `strengths` / `improvements`: Arrays of feedback points

---

### Reading Module

#### `reading_questions`
All reading practice questions.

**Reading Types:**
1. **multiple_choice_single** - Choose one answer
2. **multiple_choice_multiple** - Choose multiple answers
3. **reorder_paragraphs** - Drag and drop to order
4. **fill_in_blanks** - Fill missing words (dropdown)
5. **reading_writing_fill_blanks** - Fill blanks while reading

**Key Fields:**
- `promptText`: Main reading passage
- `options`: JSON array of choices
- `correctAnswers`: JSON array/object of correct answers
- `estimatedSeconds`: Time limit (typically 120-180s)

---

#### `reading_attempts`
User's reading practice submissions.

**Key Fields:**
- `userResponse`: JSON of selected answers
- `isCorrect`: Boolean for single-answer questions
- `accuracy`: Percentage correct (0-100)
- `correctAnswers` / `totalAnswers`: Count of correct answers

---

### Writing Module

#### `writing_questions`
All writing practice questions.

**Writing Types:**
1. **summarize_written_text** - Summarize in one sentence (5-75 words)
2. **write_essay** - Write an essay (200-300 words)

**Key Fields:**
- `promptText`: Passage to summarize or essay topic
- `minWords` / `maxWords`: Word count requirements
- `timeLimit`: Time limit in seconds

---

#### `writing_attempts`
User's writing practice submissions.

**Key Fields:**
- `userResponse`: User's written text
- `wordCount`: Word count
- **Scores (0-90 scale):**
  - `overallScore`
  - `grammarScore`
  - `vocabularyScore`
  - `coherenceScore`
  - `contentScore`
  - `spellingScore`
- `aiFeedback`: Detailed AI feedback

---

### Listening Module

#### `listening_questions`
All listening practice questions.

**Listening Types:**
1. **summarize_spoken_text** - Summarize audio (50-70 words)
2. **multiple_choice_single** - Choose one answer
3. **multiple_choice_multiple** - Choose multiple answers
4. **fill_in_blanks** - Fill missing words while listening
5. **highlight_correct_summary** - Choose best summary
6. **select_missing_word** - Select missing word at end
7. **highlight_incorrect_words** - Find words different from audio
8. **write_from_dictation** - Type what you hear

**Key Fields:**
- `promptAudioId`: FK to media (required)
- `transcript`: Hidden from users, used for scoring
- `options`: JSON of answer choices
- `correctAnswers`: JSON of correct answers

---

#### `listening_attempts`
User's listening practice submissions.

**Key Fields:**
- `userResponse`: JSON of answers
- `accuracy`: Percentage correct
- `correctAnswers` / `totalAnswers`: Count metrics

---

### Progress Tracking

#### `lesson_progress`
Tracks user progress through each lesson.

**Key Fields:**
- `userId` + `lessonId`: Unique constraint
- `questionsCompleted` / `questionsTotal`: Progress tracking
- `completionPercentage`: 0-100%
- `averageScore`: Average performance
- `bestScore`: Highest score achieved
- `startedAt` / `lastActivityAt` / `completedAt`: Timestamps

**When User Submits an Attempt:**
1. Increment `questionsCompleted`
2. Update `averageScore`
3. Update `bestScore` if applicable
4. Set `lastActivityAt` to now
5. If all questions done, set `completedAt`

---

#### `user_stats`
Overall user statistics and analytics.

**Key Fields:**
- `totalPracticeTime`: Total minutes practiced
- `totalAttempts`: All attempts across modules
- `lessonsCompleted`: Number of lessons completed
- `currentStreak` / `longestStreak`: Daily practice streaks
- **Module Averages (0-90 scale):**
  - `speakingAverage`
  - `writingAverage`
  - `readingAverage`
  - `listeningAverage`
- **Attempt Counts:**
  - `speakingAttempts`
  - `writingAttempts`
  - `readingAttempts`
  - `listeningAttempts`

**Updated:**
- After each attempt submission
- Daily for streak calculations

---

## Schema Relationships Diagram

```
users
├── user_subscriptions (1:1)
├── user_stats (1:1)
├── lesson_progress (1:N)
└── *_attempts (1:N)
    └── *_questions (N:1)
        ├── media (N:1) [for prompts]
        └── practice_lessons (N:1)

practice_lessons (1:N)
├── speaking_questions
├── reading_questions
├── writing_questions
└── listening_questions

media (1:N)
├── speaking_questions.promptImageId
├── speaking_questions.promptAudioId
├── speaking_questions.sampleAnswerAudioId
├── listening_questions.promptAudioId
└── speaking_attempts.audioMediaId
```

---

## Access Control Logic

### Free Trial Users
- Can access lessons marked `isFree = true`
- 4 AI credits per day
- Limited to basic features

### Pro Users
- Can access all practice lessons
- Cannot access mock tests
- 50 AI credits per day

### Premium Users
- Full access to everything
- Unlimited AI credits (`dailyAiCredits = -1`)
- Access to all mock tests

### Checking Access in Code
```typescript
function canAccessLesson(user: User, lesson: PracticeLesson): boolean {
  // Free lessons are accessible to everyone
  if (lesson.isFree) return true

  // Check membership tier
  if (lesson.requiredTier === 'pro' && user.membershipTier === 'free_trial') {
    return false
  }

  // Premium can access everything
  if (user.membershipTier === 'premium') return true

  // Pro can access pro lessons
  if (user.membershipTier === 'pro' && lesson.requiredTier !== 'premium') {
    return true
  }

  return false
}
```

---

## Sample Data Structure

### Example: Read Aloud Lesson with Questions

**Lesson:**
```json
{
  "id": "uuid-1",
  "lessonNumber": 1,
  "title": "Read Aloud - Beginner Level",
  "module": "speaking",
  "questionType": "read_aloud",
  "isFree": true,
  "requiredTier": "free_trial",
  "difficulty": "Easy",
  "questionCount": 10,
  "orderIndex": 1
}
```

**Question 1:**
```json
{
  "id": "uuid-q1",
  "type": "read_aloud",
  "title": "Read Aloud #1 - Simple Introduction",
  "promptText": "The weather in Australia is generally warm and sunny. Most people enjoy outdoor activities throughout the year. The country has beautiful beaches and national parks that attract millions of visitors annually.",
  "lessonId": "uuid-1",
  "difficulty": "Easy",
  "estimatedSeconds": 40,
  "prepTimeSeconds": 30,
  "referenceAudioUrlUS": "https://blob.../read-aloud-1-us.mp3",
  "isFree": true
}
```

**User Attempt:**
```json
{
  "id": "uuid-att1",
  "userId": "user-123",
  "questionId": "uuid-q1",
  "lessonId": "uuid-1",
  "audioUrl": "https://blob.../user-123-attempt-1.mp3",
  "transcript": "The weather in Australia is generally warm and sunny...",
  "algorithmVersion": "EN_V2e",
  "overallScore": 75,
  "pronunciationScore": 78,
  "fluencyScore": 72,
  "contentScore": 75,
  "durationMs": 42000,
  "wordsPerMinute": 125.5,
  "aiFeedback": "Good pronunciation. Work on natural pauses."
}
```

---

## Migration Strategy

### Phase 1: Create New Tables
1. Create `media` table
2. Create `practice_lessons` table
3. Create improved question tables with `lessonId` FK
4. Create `lesson_progress` and `user_stats` tables

### Phase 2: Data Migration
1. Upload media files to Vercel Blob Storage
2. Insert media records into `media` table
3. Create practice lessons (organize existing questions)
4. Update existing questions with `lessonId`
5. Migrate user membership data

### Phase 3: Update Application Code
1. Update API routes to use new schema
2. Update frontend to show lessons
3. Add membership tier checks
4. Update progress tracking logic

### Phase 4: Testing & Deployment
1. Test with sample users
2. Verify all relations work correctly
3. Test access control
4. Deploy to production

---

## Query Examples

### Get All Lessons for a Module
```sql
SELECT * FROM practice_lessons
WHERE module = 'speaking'
  AND status = 'published'
ORDER BY order_index ASC;
```

### Get Questions for a Lesson
```sql
SELECT sq.*,
       pi.url as prompt_image_url,
       pa.url as prompt_audio_url,
       sa.url as sample_answer_url
FROM speaking_questions sq
LEFT JOIN media pi ON sq.prompt_image_id = pi.id
LEFT JOIN media pa ON sq.prompt_audio_id = pa.id
LEFT JOIN media sa ON sq.sample_answer_audio_id = sa.id
WHERE sq.lesson_id = 'lesson-uuid'
  AND sq.is_active = true
ORDER BY sq.created_at ASC;
```

### Get User's Lesson Progress
```sql
SELECT lp.*, pl.title, pl.module, pl.question_type
FROM lesson_progress lp
JOIN practice_lessons pl ON lp.lesson_id = pl.id
WHERE lp.user_id = 'user-123'
  AND lp.completed_at IS NULL
ORDER BY lp.last_activity_at DESC;
```

### Get User's Recent Attempts
```sql
SELECT sa.*,
       sq.title as question_title,
       sq.type as question_type,
       pl.title as lesson_title
FROM speaking_attempts sa
JOIN speaking_questions sq ON sa.question_id = sq.id
LEFT JOIN practice_lessons pl ON sa.lesson_id = pl.id
WHERE sa.user_id = 'user-123'
ORDER BY sa.created_at DESC
LIMIT 10;
```

---

## Indexes

All tables include appropriate indexes for:
- Foreign keys
- Filter columns (module, type, status)
- Sort columns (created_at, order_index)
- Composite indexes for common queries

Example composite indexes:
- `(user_id, lesson_id, created_at DESC)` - User's lesson attempts
- `(is_active, type, difficulty)` - Active questions by type/difficulty
- `(module, order_index)` - Lessons in order by module

---

## Best Practices

### When Adding New Questions
1. Upload media files first
2. Create media records
3. Create question with media FKs
4. Assign to a lesson (or leave NULL for mock tests)
5. Set appropriate difficulty and access levels

### When User Submits Attempt
1. Validate user has access to question
2. Check AI credits available
3. Process submission (transcription, scoring)
4. Deduct AI credits
5. Update `lesson_progress`
6. Update `user_stats`
7. Return results with feedback

### Access Control Checks
Always check:
1. User's `membershipTier` and `membershipStatus`
2. Lesson's `requiredTier` and `isFree`
3. Question's `isFree` (can override lesson)
4. AI credits available before processing

---

## Future Enhancements

### Planned Features
1. **Question Pools**: Random selection from pools for variety
2. **Adaptive Difficulty**: Adjust question difficulty based on performance
3. **Custom Lesson Paths**: Personalized learning paths
4. **Team/Organization Support**: Multi-user accounts
5. **Advanced Analytics**: Detailed performance insights
6. **Spaced Repetition**: Smart review scheduling
7. **Peer Comparison**: Compare with other users

### Schema Additions Needed
- `question_pools` table
- `user_learning_paths` table
- `organization_accounts` table
- `review_schedule` table

---

## Summary

This improved schema provides:

✅ **Clear Separation**: Practice lessons vs. mock tests
✅ **Membership Tiers**: Free, Pro, Premium with proper access control
✅ **Media Management**: Centralized storage with proper references
✅ **Progress Tracking**: Detailed analytics and completion tracking
✅ **Scalability**: Designed to handle thousands of questions and users
✅ **Flexibility**: Easy to add new question types and features
✅ **Performance**: Proper indexes for fast queries
✅ **Relations**: Complete foreign key relationships throughout

This schema is production-ready and supports all your requirements for the PTE Academic practice platform!
