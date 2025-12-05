# Quick Start Guide - Database Implementation

## ✅ What's Ready

1. **Schema Files Created:**
   - `lib/db/schema-lessons.ts` - New lesson system tables
   - `lib/db/index.ts` - Updated to export lesson tables
   - `drizzle.config.ts` - Updated to include lesson schema

2. **Scripts Created:**
   - `scripts/cleanup-invalid-questions.ts` - Clean outdated questions
   - `scripts/seed-speaking-lessons.ts` - Seed speaking module (sample)

3. **Documentation:**
   - `DATABASE_SCHEMA_DOCUMENTATION.md` - Complete schema docs
   - `plans/proud-chasing-hamming.md` - Implementation plan
   - `IMPLEMENTATION_STATUS.md` - Current status

## 🚀 Execute Implementation

### Step 1: Generate & Run Migrations (5 minutes)

```bash
# Generate migration files from schema
pnpm db:generate

# Review the generated SQL (optional)
cat lib/db/migrations/*.sql

# Apply migrations to database
pnpm db:migrate
```

This will create the new tables:
- `media` - Centralized media storage
- `practice_lessons` - Lesson organization
- `user_subscriptions` - Membership management
- `lesson_progress` - Progress tracking
- `user_stats` - User analytics

### Step 2: Clean Invalid Questions (2 minutes)

```bash
# Dry run - see what will be deleted
pnpm tsx scripts/cleanup-invalid-questions.ts

# Actually delete (if you want to)
pnpm tsx scripts/cleanup-invalid-questions.ts --confirm
```

### Step 3: Seed Data (10 minutes)

I need to create the complete seed scripts. Would you like me to:

**Option A:** Create ONE master seed script for all modules
- Single file: `scripts/seed-all-lessons.ts`
- Seeds all 47 lessons, 235 questions
- Run once: `pnpm tsx scripts/seed-all-lessons.ts`
- Faster to implement

**Option B:** Create separate seed scripts per module
- 4 files: `seed-speaking.ts`, `seed-writing.ts`, `seed-reading.ts`, `seed-listening.ts`
- More modular, can run individually
- Takes longer to create

### Step 4: Update API Routes (Planned)

Files to update:
- `app/api/speaking/questions/route.ts`
- `app/api/speaking/questions/[id]/route.ts`
- `app/api/speaking/attempts/route.ts`

New files to create:
- `app/api/practice/lessons/route.ts`
- `app/api/practice/lessons/[id]/route.ts`

### Step 5: Update Frontend (Planned)

Components to create:
- `components/pte/lessons/LessonList.tsx`
- `components/pte/lessons/LessonCard.tsx`
- `components/pte/lessons/LessonProgress.tsx`

Pages to update:
- `app/pte/academic/practice/[section]/page.tsx`

## ⚡ Current Status

✅ Schema created
✅ Cleanup script ready
✅ Sample seed script created
🚧 Need: Complete seed scripts
🚧 Need: API updates
🚧 Need: Frontend updates

## 🎯 Next Action Required

**Tell me which option you prefer:**

1. **Quick & Complete** - I'll create ONE master seed script with all 235 questions right now
2. **Modular** - I'll create 4 separate seed scripts (takes a bit longer)
3. **Run What We Have** - Let's run migrations and test with just the speaking seed script first

What would you like me to do?
