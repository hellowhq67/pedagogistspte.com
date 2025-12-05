# Database Plan - PTE Academic Platform

## Overview
This document outlines the database schema improvements, migrations, and next steps for the PTE Academic platform overhaul.

## Completed Tasks

### 1. Schema Consolidation ✅
- **Resolved duplicate `userSubscriptions` table definition**
  - Removed old definition from `lib/db/schema.ts`
  - Kept enhanced version in `lib/db/schema-lessons.ts` with:
    - `tier` field (membership_tier enum)
    - `status` field (membership_status enum)
    - Stripe integration fields (`stripe_subscription_id`, `stripe_customer_id`)
    - Trial management (`trial_ends_at`)

### 2. Migration Files Created ✅

#### Migration 0012: User Subscriptions Schema Update
- **File**: `lib/db/migrations/0012_migrate_user_subscriptions.sql`
- **Purpose**: Migrates existing `user_subscriptions` table to new schema
- **Changes**:
  - Adds new columns: `tier`, `status_new`, `trial_ends_at`, `stripe_subscription_id`, `stripe_customer_id`
  - Migrates data from old `plan_type` to new `tier` enum
  - Migrates data from old `status` to new `status` enum
  - Removes deprecated columns: `plan_type`, `payment_method`
  - Adds unique constraint on `user_id`
  - Creates necessary indexes

#### Migration 0013: Lesson System Tables
- **File**: `lib/db/migrations/0013_add_lesson_system.sql`
- **Purpose**: Creates all lesson system tables
- **New Tables**:
  1. **media** - Stores media files (audio, images, videos, documents)
  2. **practice_lessons** - Structured lessons by module and question type
  3. **lesson_progress** - Tracks user progress through lessons
  4. **user_stats** - Aggregated user statistics and streaks

- **New Enums**:
  - `membership_tier`: free_trial, pro, premium
  - `membership_status`: active, expired, cancelled, trial
  - `media_type`: audio, image, video, document
  - `lesson_status`: draft, published, archived
  - `algorithm_version`: EN_V2e, S-ASIA_V4i

### 3. Utility Scripts Created ✅

#### Test Database Connection Script
- **File**: `scripts/test-db-connection.ts`
- **Usage**: `pnpm tsx scripts/test-db-connection.ts`
- **Features**:
  - Tests database connectivity
  - Lists all tables in the database
  - Checks migration status
  - Shows recent migrations

#### Migration Runner Script
- **File**: `scripts/migrate.ts`
- **Usage**: `pnpm db:migrate`
- **Features**:
  - Runs all pending Drizzle migrations
  - Handles connection errors gracefully
  - Shows progress and completion status

## Current Database Schema Structure

### Core Tables
1. **users** - User accounts (Better Auth)
2. **sessions** - User sessions (Better Auth)
3. **accounts** - OAuth accounts (Better Auth)
4. **verifications** - Email verifications (Better Auth)

### Organization & Teams
5. **organizations** - Multi-tenant organizations
6. **teams** - Team management
7. **team_members** - Team membership

### PTE Test System
8. **pte_tests** - Mock/practice tests
9. **pte_questions** - Question bank
10. **pte_question_media** - Media attachments
11. **test_attempts** - User test attempts
12. **test_answers** - User answers

### Speaking Module
13. **speaking_questions** - Speaking practice questions
14. **speaking_attempts** - User speaking attempts with AI scoring
15. **speaking_templates** - High-scoring answer templates

### Reading Module
16. **reading_questions** - Reading comprehension questions
17. **reading_attempts** - User reading attempts

### Writing Module
18. **writing_questions** - Writing task questions
19. **writing_attempts** - User writing submissions

### Listening Module
20. **listening_questions** - Listening practice questions
21. **listening_attempts** - User listening attempts
22. **pte_categories** - OnePTE category mapping

### Lesson System (NEW) 🆕
23. **media** - Centralized media storage
24. **practice_lessons** - Structured lesson plans
25. **lesson_progress** - User lesson tracking
26. **user_stats** - Comprehensive user statistics

### User Management
27. **user_subscriptions** - Subscription & tier management (ENHANCED)
28. **user_profiles** - User preferences & settings
29. **user_progress** - Legacy progress tracking
30. **user_scheduled_exam_dates** - Target exam dates
31. **pte_user_exam_settings** - Exam preferences

### AI & Conversations
32. **conversation_sessions** - OpenAI Realtime API sessions
33. **conversation_turns** - Individual conversation messages
34. **conversation_attempt_links** - Links sessions to attempts
35. **ai_credit_usage** - AI usage tracking and billing

### Community
36. **forums** - Discussion forums
37. **posts** - Forum posts
38. **comments** - Post comments

### System
39. **activity_logs** - User activity tracking
40. **practice_sessions** - Legacy practice tracking
41. **pte_sync_jobs** - External data sync jobs

## Database Connection Issue

### Current Status
- Railway PostgreSQL database connection is timing out
- IP: `66.33.22.88:5432`
- Host: `drizzle-gateway-production-0002.up.railway.app`

### Possible Causes
1. Railway database might be paused or sleeping
2. Network/firewall restrictions
3. Database credentials may have changed
4. Railway project might need to be redeployed

### Resolution Steps
1. **Check Railway Dashboard**
   - Verify database is active
   - Check for any service degradation
   - Verify connection strings are current

2. **Update Database URL** (if needed)
   - Get fresh connection URL from Railway
   - Update `.env.local` with new credentials

3. **Alternative: Use Railway CLI**
   ```bash
   # Install Railway CLI (if not installed)
   npm install -g @railway/cli

   # Login
   railway login

   # Link project
   railway link

   # Run migrations via Railway
   railway run pnpm db:migrate
   ```

4. **Alternative: Local PostgreSQL**
   - Set up local PostgreSQL for development
   - Update DATABASE_URL to local instance
   - Run migrations locally first

## Next Steps

### Immediate Actions (When DB is accessible)

1. **Test Database Connection**
   ```bash
   pnpm tsx scripts/test-db-connection.ts
   ```

2. **Run Pending Migrations**
   ```bash
   pnpm db:migrate
   ```

3. **Verify Schema**
   ```bash
   pnpm db:studio
   ```
   - Open Drizzle Studio to visually inspect schema
   - Verify all tables exist
   - Check indexes are created

4. **Test Queries**
   - Use MCP postgres tool to run test queries
   - Verify all foreign keys work
   - Test complex joins

### Schema Improvements (Future)

1. **Add Full-Text Search**
   - Add GIN indexes for text search on questions
   - PostgreSQL full-text search for forums

2. **Add Materialized Views**
   - Leaderboards (cached aggregate queries)
   - User dashboard statistics
   - Question difficulty ratings

3. **Add Partitioning**
   - Partition `activity_logs` by date
   - Partition `attempts` tables by date for better query performance

4. **Add Connection Pooling**
   - Configure PgBouncer for connection pooling
   - Optimize connection limits

5. **Add Backup Strategy**
   - Set up automated daily backups
   - Point-in-time recovery configuration
   - Backup retention policy

### Performance Optimization

1. **Index Analysis**
   - Run `EXPLAIN ANALYZE` on slow queries
   - Add missing indexes
   - Remove unused indexes

2. **Query Optimization**
   - Identify N+1 queries
   - Add eager loading where needed
   - Use Drizzle's batch queries

3. **Caching Strategy**
   - Add Redis caching for frequently accessed data
   - Cache user subscriptions
   - Cache lesson metadata

## Migration Commands Reference

```bash
# Generate new migrations (after schema changes)
pnpm db:generate

# Run migrations
pnpm db:migrate

# Push schema directly (development only - skips migrations)
pnpm db:push

# Open Drizzle Studio
pnpm db:studio

# Test database connection
pnpm tsx scripts/test-db-connection.ts

# Seed database with sample data
pnpm db:seed

# Seed specific modules
pnpm db:seed:speaking
pnpm db:seed:all
```

## MCP Postgres Tool Usage

Once database is accessible, you can use the MCP Postgres tool:

```typescript
// List all tables
mcp__postgres__query({
  sql: "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
})

// Check user_subscriptions schema
mcp__postgres__query({
  sql: "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'user_subscriptions' ORDER BY ordinal_position;"
})

// Count records
mcp__postgres__query({
  sql: "SELECT COUNT(*) as total_users FROM users;"
})

// Check migration status
mcp__postgres__query({
  sql: "SELECT id, created_at FROM __drizzle_migrations ORDER BY created_at DESC LIMIT 10;"
})
```

## Schema Diagram (High-Level)

```
┌─────────────────────────────────────────────────────────────┐
│                        Authentication                        │
│  users ← sessions ← accounts, verifications                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      User Management                         │
│  user_subscriptions, user_profiles, user_stats,              │
│  user_progress, user_scheduled_exam_dates                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       Lesson System                          │
│  practice_lessons → lesson_progress                          │
│  media (shared media storage)                                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Practice Modules                        │
│  speaking_questions → speaking_attempts                      │
│  reading_questions → reading_attempts                        │
│  writing_questions → writing_attempts                        │
│  listening_questions → listening_attempts                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Mock Test System                        │
│  pte_tests → pte_questions → test_attempts → test_answers    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     AI & Conversations                       │
│  conversation_sessions → conversation_turns                  │
│  ai_credit_usage (billing & usage tracking)                  │
└─────────────────────────────────────────────────────────────┘
```

## Key Indexes for Performance

### Most Important Indexes (Already Created)

1. **User Lookup**
   - `users.email` (unique)
   - `users.id` (primary)

2. **Attempt Queries**
   - `idx_speaking_attempts_user_created` - User's recent attempts
   - `idx_reading_attempts_user_created` - User's reading history
   - `idx_writing_attempts_user_created` - User's writing history
   - `idx_listening_attempts_user_created` - User's listening history

3. **Leaderboards**
   - `idx_speaking_attempts_overall_score` - Speaking leaderboard
   - `idx_writing_attempts_overall_score` - Writing leaderboard

4. **Active Questions**
   - `idx_speaking_questions_active_type` - Filter active questions
   - Partial indexes for better performance on active=true queries

5. **Lesson Progress**
   - `idx_lesson_progress_user` - User's lesson history
   - `idx_lesson_progress_lesson` - Lesson completion stats

## Environment Variables Required

```env
# Database Connection
DATABASE_URL="postgresql://user:password@host:5432/database"
POSTGRES_URL="postgresql://user:password@host:5432/database"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="your-password"

# Railway (if using Railway)
RAILWAY_PUBLIC_DOMAIN="your-app.up.railway.app"
RAILWAY_PRIVATE_DOMAIN="your-app.railway.internal"
RAILWAY_PROJECT_NAME="your-project"
RAILWAY_ENVIRONMENT_NAME="production"
```

## Troubleshooting

### Migration Fails
1. Check database connectivity
2. Verify user has sufficient permissions
3. Check for schema conflicts
4. Review error messages in migration logs

### Schema Out of Sync
1. Generate fresh migrations: `pnpm db:generate`
2. Review generated SQL
3. Apply migrations: `pnpm db:migrate`

### Connection Timeouts
1. Check network connectivity
2. Verify database is running
3. Check connection string format
4. Test with direct psql connection
5. Check Railway/hosting platform status

## Summary

The database schema has been successfully organized and enhanced with:
- ✅ Consolidated user subscriptions with tier system
- ✅ Complete lesson system with progress tracking
- ✅ Comprehensive user statistics
- ✅ All necessary migrations prepared
- ✅ Helper scripts for testing and migration

**Next action required**: Resolve Railway database connectivity to apply migrations.
