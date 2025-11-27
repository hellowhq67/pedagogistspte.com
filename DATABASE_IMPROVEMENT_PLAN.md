# Database Schema & Query Optimization Plan

## Executive Summary
This document outlines a comprehensive plan to optimize database schema design, improve query performance, and enhance data integrity for the PTE Practice application.

---

## Current State Analysis

### Database Structure
- **ORM**: Drizzle ORM with PostgreSQL
- **Total Tables**: 30+ tables
- **Main Modules**: Auth (Better-Auth), PTE Practice (Speaking/Reading/Writing/Listening), User Management, Teams, Forums

### Existing Indexes
✅ **Good Coverage:**
- Speaking/Reading/Writing/Listening attempts: `userId`, `questionId`, `createdAt`
- Questions tables: `type`, `isActive`, `tags` (GIN index)
- Better-Auth tables: Standard indexes

⚠️ **Missing Indexes:** (See recommendations below)

---

## Priority 1: Critical Performance Improvements

### 1.1 Missing Composite Indexes

**Problem**: Common query patterns not optimized
**Impact**: Slow queries on high-traffic endpoints

#### Recommendations:

```typescript
// lib/db/schema.ts

// 1. Speaking Attempts - Filter by user AND date range
export const speakingAttempts = pgTable('speaking_attempts', {
  // ... existing fields
}, (table) => ({
  // Existing indexes
  idxQuestion: index('idx_speaking_attempts_question').on(table.questionId),
  idxUserType: index('idx_speaking_attempts_user_type').on(table.userId, table.type),
  idxPublic: index('idx_speaking_attempts_public').on(table.isPublic),

  // NEW: Composite index for date-range queries
  idxUserCreated: index('idx_speaking_attempts_user_created').on(
    table.userId,
    table.createdAt.desc()
  ),

  // NEW: For leaderboard/public answers
  idxPublicScores: index('idx_speaking_attempts_public_scores').on(
    table.isPublic,
    table.questionId,
    table.createdAt.desc()
  ),
}))

// 2. Reading/Writing/Listening Attempts - Same pattern
export const readingAttempts = pgTable('reading_attempts', {
  // ... existing fields
}, (table) => ({
  userIdIdx: index('reading_attempts_user_id_idx').on(table.userId),
  questionIdIdx: index('reading_attempts_question_id_idx').on(table.questionId),
  createdAtIdx: index('reading_attempts_created_at_idx').on(table.createdAt),

  // NEW: Composite for user history queries
  idxUserCreated: index('reading_attempts_user_created_idx').on(
    table.userId,
    table.createdAt.desc()
  ),
}))

// Apply same pattern to writingAttempts and listeningAttempts

// 3. AI Credit Usage - Critical for billing
export const aiCreditUsage = pgTable('ai_credit_usage', {
  // ... existing fields
}, (table) => ({
  // NEW: For user usage reports
  idxUserCreated: index('ai_credit_usage_user_created_idx').on(
    table.userId,
    table.createdAt.desc()
  ),

  // NEW: For cost analysis by type
  idxUserTypeCreated: index('ai_credit_usage_user_type_created_idx').on(
    table.userId,
    table.usageType,
    table.createdAt.desc()
  ),
}))

// 4. Activity Logs - Prevent full table scans
export const activityLogs = pgTable('activity_logs', {
  // ... existing fields
}, (table) => ({
  // NEW: Most logs are queried by user + recent time
  idxUserCreated: index('activity_logs_user_created_idx').on(
    table.userId,
    table.createdAt.desc()
  ),

  // NEW: For security audits
  idxActionCreated: index('activity_logs_action_created_idx').on(
    table.action,
    table.createdAt.desc()
  ),
}))
```

**Migration Priority**: HIGH
**Estimated Impact**: 60-80% faster queries on user history, reports, and dashboards

---

### 1.2 Add Partial Indexes for Common Filters

```typescript
// Only index active questions (reduces index size by ~30-40%)
export const speakingQuestions = pgTable('speaking_questions', {
  // ... existing fields
}, (table) => ({
  // ... existing indexes

  // NEW: Partial index for active questions only
  idxActiveType: index('idx_speaking_questions_active_type')
    .on(table.type, table.difficulty)
    .where(sql`${table.isActive} = true`),

  // NEW: Bookmarked questions for user
  idxBookmarked: index('idx_speaking_questions_bookmarked')
    .on(table.bookmarked)
    .where(sql`${table.bookmarked} = true`),
}))

// Apply same pattern to reading/writing/listening questions
```

**Migration Priority**: MEDIUM
**Estimated Impact**: 40-50% faster question listing queries, reduced index size

---

## Priority 2: Schema Design Improvements

### 2.1 Normalize Score Storage

**Problem**: Scores stored as JSONB makes querying/aggregating difficult
**Current**: `scores: jsonb('scores')`
**Impact**: Cannot efficiently query "top scores" or generate analytics

#### Recommendation: Add score summary columns

```typescript
export const speakingAttempts = pgTable('speaking_attempts', {
  // ... existing fields
  scores: jsonb('scores').notNull().default(sql`'{}'::jsonb`),

  // NEW: Extracted score fields for efficient querying
  overallScore: integer('overall_score'), // Extracted from scores.total
  pronunciationScore: integer('pronunciation_score'), // From scores.pronunciation
  fluencyScore: integer('fluency_score'), // From scores.fluency
  contentScore: integer('content_score'), // From scores.content
}, (table) => ({
  // ... existing indexes

  // NEW: For leaderboards and analytics
  idxOverallScore: index('idx_speaking_attempts_overall_score').on(
    table.overallScore.desc()
  ),

  // NEW: For weak area identification
  idxUserScores: index('idx_speaking_attempts_user_scores').on(
    table.userId,
    table.overallScore.desc()
  ),
}))
```

**Implementation**:
1. Add migration to add columns
2. Backfill from existing JSONB data
3. Update attempt creation logic to set both JSONB + columns
4. Update queries to use new columns

**Migration Priority**: HIGH
**Estimated Impact**: Enable fast analytics, leaderboards, progress tracking

---

### 2.2 Add User Progress Snapshot Table

**Problem**: Calculating user progress requires aggregating all attempts (expensive)
**Solution**: Maintain a daily/weekly snapshot table

```typescript
export const userProgressSnapshots = pgTable('user_progress_snapshots', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  snapshotDate: timestamp('snapshot_date').notNull(),

  // Aggregated stats
  totalAttempts: integer('total_attempts').default(0),
  speakingAttempts: integer('speaking_attempts').default(0),
  writingAttempts: integer('writing_attempts').default(0),
  readingAttempts: integer('reading_attempts').default(0),
  listeningAttempts: integer('listening_attempts').default(0),

  // Average scores
  avgSpeakingScore: decimal('avg_speaking_score', { precision: 5, scale: 2 }),
  avgWritingScore: decimal('avg_writing_score', { precision: 5, scale: 2 }),
  avgReadingScore: decimal('avg_reading_score', { precision: 5, scale: 2 }),
  avgListeningScore: decimal('avg_listening_score', { precision: 5, scale: 2 }),

  // Study patterns
  totalStudyTimeMinutes: integer('total_study_time_minutes').default(0),
  uniqueDaysActive: integer('unique_days_active').default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  idxUserDate: index('user_progress_snapshots_user_date_idx').on(
    table.userId,
    table.snapshotDate.desc()
  ),
  // Unique constraint to prevent duplicate snapshots
  uniqUserDate: index('user_progress_snapshots_user_date_uniq')
    .on(table.userId, table.snapshotDate)
    .unique(),
}))
```

**Implementation**:
1. Create table
2. Add cron job/background task to calculate daily snapshots
3. Update dashboard queries to use snapshots instead of raw aggregation

**Migration Priority**: MEDIUM
**Estimated Impact**: Dashboard loads 10-20x faster

---

### 2.3 Add Question Performance Tracking

**Problem**: No visibility into which questions are too hard/easy
**Solution**: Track aggregate question statistics

```typescript
export const questionStats = pgTable('question_stats', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  questionId: uuid('question_id').notNull(), // Generic - works for all question types
  questionType: text('question_type').notNull(), // 'speaking', 'reading', etc.

  // Aggregate stats
  totalAttempts: integer('total_attempts').default(0),
  uniqueUsers: integer('unique_users').default(0),
  avgScore: decimal('avg_score', { precision: 5, scale: 2 }),
  passRate: decimal('pass_rate', { precision: 5, scale: 2 }), // % scoring >65

  // Difficulty calibration
  calculatedDifficulty: text('calculated_difficulty'), // 'Easy', 'Medium', 'Hard' based on stats
  lastCalculated: timestamp('last_calculated').defaultNow().notNull(),

  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  idxQuestionType: index('question_stats_question_type_idx').on(
    table.questionType,
    table.questionId
  ),
  // Unique per question
  uniqQuestion: index('question_stats_question_uniq')
    .on(table.questionType, table.questionId)
    .unique(),
}))
```

**Migration Priority**: LOW
**Estimated Impact**: Better question curation, adaptive difficulty

---

## Priority 3: Query Optimization Patterns

### 3.1 Implement Query Batching

**File**: `lib/db/queries.ts`

```typescript
// BEFORE: N+1 query problem
async function getUserAttempts(userId: string) {
  const attempts = await db.select().from(speakingAttempts).where(eq(speakingAttempts.userId, userId))

  // N queries for questions!
  for (const attempt of attempts) {
    attempt.question = await db.select().from(speakingQuestions).where(eq(speakingQuestions.id, attempt.questionId))
  }
  return attempts
}

// AFTER: Single join query
async function getUserAttempts(userId: string) {
  return await db
    .select({
      attempt: speakingAttempts,
      question: speakingQuestions,
    })
    .from(speakingAttempts)
    .innerJoin(speakingQuestions, eq(speakingAttempts.questionId, speakingQuestions.id))
    .where(eq(speakingAttempts.userId, userId))
    .orderBy(desc(speakingAttempts.createdAt))
}
```

### 3.2 Add Database-Level Pagination

```typescript
// BEFORE: Load all, paginate in memory (BAD!)
const allAttempts = await db.select().from(speakingAttempts)
const page1 = allAttempts.slice(0, 20)

// AFTER: Database pagination
const page1 = await db
  .select()
  .from(speakingAttempts)
  .where(eq(speakingAttempts.userId, userId))
  .orderBy(desc(speakingAttempts.createdAt))
  .limit(20)
  .offset(0)
```

### 3.3 Use Prepared Statements for Repeated Queries

```typescript
// lib/db/prepared-queries.ts
import { db } from './drizzle'
import { sql } from 'drizzle-orm'

// Prepared statement - compiled once, reused many times
export const getUserAttemptsByType = db
  .select()
  .from(speakingAttempts)
  .where(sql`user_id = $1 AND type = $2`)
  .orderBy(desc(speakingAttempts.createdAt))
  .limit(sql`$3`)
  .prepare('get_user_attempts_by_type')

// Usage
const attempts = await getUserAttemptsByType.execute({
  $1: userId,
  $2: 'read_aloud',
  $3: 20
})
```

---

## Priority 4: Data Integrity Enhancements

### 4.1 Add Check Constraints

```typescript
export const speakingAttempts = pgTable('speaking_attempts', {
  // ... existing fields
  durationMs: integer('duration_ms').notNull(),
  overallScore: integer('overall_score'),
}, (table) => ({
  // Existing indexes...

  // NEW: Ensure scores are in valid range (10-90 for PTE)
  checkScoreRange: sql`CHECK (overall_score >= 10 AND overall_score <= 90)`,

  // NEW: Ensure duration is reasonable (30 seconds to 5 minutes)
  checkDurationRange: sql`CHECK (duration_ms >= 30000 AND duration_ms <= 300000)`,
}))

export const users = pgTable('users', {
  // ... existing fields
  dailyAiCredits: integer('daily_ai_credits').notNull().default(4),
  aiCreditsUsed: integer('ai_credits_used').notNull().default(0),
}, (table) => ({
  // NEW: Can't use more credits than allocated
  checkCredits: sql`CHECK (ai_credits_used <= daily_ai_credits)`,
}))
```

### 4.2 Add Updated_At Triggers

```sql
-- migrations/add_updated_at_triggers.sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_speaking_questions_updated_at
  BEFORE UPDATE ON speaking_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Repeat for all tables with updated_at column
```

---

## Priority 5: Caching Strategy

### 5.1 Implement React Cache for Server Components

```typescript
// lib/db/queries.ts
import { cache } from 'react'

// Cache for request duration (React 19 feature)
export const getCachedUserProfile = cache(async (userId: string) => {
  return await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
})

// Use in server components - automatically deduplicated
async function UserProfile() {
  const user = await getCachedUserProfile(userId)
  // Multiple calls in same request = single DB query
}
```

### 5.2 Add Redis for Application-Level Caching

```typescript
// lib/cache/redis.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function getCachedQuestions(type: string) {
  const cacheKey = `questions:${type}:active`

  // Try cache first
  const cached = await redis.get(cacheKey)
  if (cached) return cached

  // Cache miss - query DB
  const questions = await db
    .select()
    .from(speakingQuestions)
    .where(and(
      eq(speakingQuestions.type, type),
      eq(speakingQuestions.isActive, true)
    ))

  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(questions))

  return questions
}
```

---

## Implementation Roadmap

### Phase 1: Critical Fixes (Week 1-2)
- [ ] Add composite indexes for common query patterns
- [ ] Extract score columns from JSONB for speaking/writing attempts
- [ ] Fix N+1 query problems in existing code
- [ ] Add database pagination to all list endpoints

### Phase 2: Performance (Week 3-4)
- [ ] Implement user progress snapshots table
- [ ] Add partial indexes for filtered queries
- [ ] Set up prepared statements for hot paths
- [ ] Add React cache to all server components

### Phase 3: Data Integrity (Week 5-6)
- [ ] Add check constraints for data validation
- [ ] Implement updated_at triggers
- [ ] Add question performance tracking
- [ ] Set up database backups and point-in-time recovery

### Phase 4: Scaling (Week 7-8)
- [ ] Implement Redis caching layer
- [ ] Add read replicas for analytics queries
- [ ] Set up connection pooling (PgBouncer)
- [ ] Implement query performance monitoring

---

## Monitoring & Metrics

### Key Metrics to Track
1. **Query Performance**
   - P50, P95, P99 latency per endpoint
   - Slow query log (>1000ms)
   - Index hit rate (target: >95%)

2. **Database Health**
   - Connection pool utilization
   - Cache hit rate
   - Table bloat percentage
   - Index size vs table size

3. **Business Metrics**
   - Attempts per user per day
   - Most popular question types
   - Average time per attempt
   - User retention by activity level

### Tools
- **Drizzle Studio**: Schema management
- **pg_stat_statements**: Query analytics
- **pgAdmin**: Database monitoring
- **Sentry**: Error tracking for DB queries
- **Vercel Analytics**: API endpoint performance

---

## Migration Scripts

### Generate New Indexes
```bash
# Generate migration for new indexes
pnpm drizzle-kit generate

# Review generated SQL in drizzle/ folder
# Apply migration
pnpm db:migrate
```

### Backfill Score Columns
```sql
-- migrations/backfill_scores.sql
-- Extract overall score from JSONB to column
UPDATE speaking_attempts
SET overall_score = CAST(scores->>'total' AS INTEGER)
WHERE overall_score IS NULL AND scores->>'total' IS NOT NULL;

-- Extract pronunciation score
UPDATE speaking_attempts
SET pronunciation_score = CAST(scores->>'pronunciation' AS INTEGER)
WHERE pronunciation_score IS NULL AND scores->>'pronunciation' IS NOT NULL;

-- Repeat for other score fields
```

---

## Expected Outcomes

### Performance Improvements
- **Dashboard load time**: 5s → 0.5s (10x faster)
- **Question listing**: 2s → 0.2s (10x faster)
- **User history**: 3s → 0.3s (10x faster)
- **Database CPU usage**: -40%
- **Database storage**: -20% (with partial indexes)

### Development Benefits
- Type-safe queries with better IntelliSense
- Easier to write complex analytics queries
- Better error messages from check constraints
- Faster development with prepared statements

### Business Impact
- Support 10x more users on same infrastructure
- Enable real-time leaderboards
- Provide detailed user analytics
- Reduce infrastructure costs by 30-40%

---

## Risk Mitigation

### Testing Strategy
1. **Test migrations on staging first**
2. **Benchmark before/after each change**
3. **Run load tests to verify improvements**
4. **Keep rollback scripts ready**

### Deployment Strategy
1. **Blue-green deployment for major changes**
2. **Gradual rollout with feature flags**
3. **Monitor error rates during deployment**
4. **Automated rollback if error rate > 1%**

---

## Support & Maintenance

### Documentation
- Update schema diagrams after each change
- Document all new indexes in code comments
- Keep this plan updated as implementation progresses

### Training
- Team training on new query patterns
- Code review checklist for database changes
- Performance testing guidelines

---

*Last Updated: 2025-01-25*
*Status: DRAFT - Pending Review*
