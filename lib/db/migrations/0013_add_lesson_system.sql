-- Migration: Add lesson system tables
-- Creates: media, practice_lessons, lesson_progress, user_stats tables

-- Create enums for lesson system
DO $$ BEGIN
  CREATE TYPE "membership_tier" AS ENUM('free_trial', 'pro', 'premium');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "membership_status" AS ENUM('active', 'expired', 'cancelled', 'trial');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "media_type" AS ENUM('audio', 'image', 'video', 'document');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "lesson_status" AS ENUM('draft', 'published', 'archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "algorithm_version" AS ENUM('EN_V2e', 'S-ASIA_V4i');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Media table
CREATE TABLE IF NOT EXISTS "media" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "type" "media_type" NOT NULL,
  "url" text NOT NULL,
  "thumbnail_url" text,
  "duration" integer,
  "file_size" integer,
  "mime_type" text,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Practice lessons table
CREATE TABLE IF NOT EXISTS "practice_lessons" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "lesson_number" integer NOT NULL,
  "module" text NOT NULL,
  "question_type" text NOT NULL,
  "is_free" boolean DEFAULT false NOT NULL,
  "required_tier" "membership_tier" DEFAULT 'pro',
  "difficulty" text DEFAULT 'Medium' NOT NULL,
  "estimated_minutes" integer DEFAULT 15,
  "question_count" integer DEFAULT 0,
  "status" "lesson_status" DEFAULT 'published' NOT NULL,
  "order_index" integer DEFAULT 0 NOT NULL,
  "slug" text UNIQUE,
  "thumbnail_url" text,
  "tags" jsonb DEFAULT '[]'::jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Lesson progress table
CREATE TABLE IF NOT EXISTS "lesson_progress" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "lesson_id" uuid NOT NULL REFERENCES "practice_lessons"("id") ON DELETE cascade,
  "questions_completed" integer DEFAULT 0,
  "questions_total" integer NOT NULL,
  "completion_percentage" integer DEFAULT 0,
  "average_score" numeric(5, 2),
  "best_score" integer,
  "total_attempts" integer DEFAULT 0,
  "started_at" timestamp DEFAULT now(),
  "last_activity_at" timestamp DEFAULT now(),
  "completed_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "lesson_progress_user_lesson_unique" UNIQUE("user_id", "lesson_id")
);

-- User stats table
CREATE TABLE IF NOT EXISTS "user_stats" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE cascade UNIQUE,
  "total_practice_time_minutes" integer DEFAULT 0,
  "total_attempts" integer DEFAULT 0,
  "lessons_completed" integer DEFAULT 0,
  "current_streak_days" integer DEFAULT 0,
  "longest_streak_days" integer DEFAULT 0,
  "speaking_average" numeric(5, 2),
  "writing_average" numeric(5, 2),
  "reading_average" numeric(5, 2),
  "listening_average" numeric(5, 2),
  "speaking_attempts" integer DEFAULT 0,
  "writing_attempts" integer DEFAULT 0,
  "reading_attempts" integer DEFAULT 0,
  "listening_attempts" integer DEFAULT 0,
  "last_activity_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_media_type" ON "media" USING btree ("type");
CREATE INDEX IF NOT EXISTS "idx_media_url" ON "media" USING btree ("url");

CREATE INDEX IF NOT EXISTS "idx_practice_lessons_module" ON "practice_lessons" USING btree ("module");
CREATE INDEX IF NOT EXISTS "idx_practice_lessons_type" ON "practice_lessons" USING btree ("question_type");
CREATE INDEX IF NOT EXISTS "idx_practice_lessons_tier" ON "practice_lessons" USING btree ("required_tier");
CREATE INDEX IF NOT EXISTS "idx_practice_lessons_status" ON "practice_lessons" USING btree ("status");
CREATE INDEX IF NOT EXISTS "idx_practice_lessons_order" ON "practice_lessons" USING btree ("module", "order_index");
CREATE INDEX IF NOT EXISTS "idx_practice_lessons_slug" ON "practice_lessons" USING btree ("slug");

CREATE INDEX IF NOT EXISTS "idx_lesson_progress_user" ON "lesson_progress" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "idx_lesson_progress_lesson" ON "lesson_progress" USING btree ("lesson_id");
CREATE INDEX IF NOT EXISTS "idx_lesson_progress_completed" ON "lesson_progress" USING btree ("completed_at");

CREATE INDEX IF NOT EXISTS "idx_user_stats_user" ON "user_stats" USING btree ("user_id");
