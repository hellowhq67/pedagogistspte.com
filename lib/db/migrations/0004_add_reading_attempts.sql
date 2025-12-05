CREATE TYPE "reading_question_type" AS ENUM('multiple_choice_single', 'multiple_choice_multiple', 'reorder_paragraphs', 'fill_in_blanks', 'reading_writing_fill_blanks');

CREATE TABLE IF NOT EXISTS "reading_attempts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "question_id" uuid NOT NULL,
  "user_response" jsonb NOT NULL,
  "scores" jsonb,
  "time_taken" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "reading_attempts_user_id_idx" ON "reading_attempts" ("user_id");
CREATE INDEX IF NOT EXISTS "reading_attempts_question_id_idx" ON "reading_attempts" ("question_id");
CREATE INDEX IF NOT EXISTS "reading_attempts_created_at_idx" ON "reading_attempts" ("created_at");

ALTER TABLE "reading_attempts" ADD CONSTRAINT "reading_attempts_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "reading_attempts" ADD CONSTRAINT "reading_attempts_question_id_reading_questions_id_fk"
  FOREIGN KEY ("question_id") REFERENCES "reading_questions"("id") ON DELETE cascade ON UPDATE no action;