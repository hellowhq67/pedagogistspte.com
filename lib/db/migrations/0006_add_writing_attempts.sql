CREATE TYPE "writing_question_type" AS ENUM('summarize_written_text', 'write_essay');

CREATE TABLE IF NOT EXISTS "writing_attempts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "question_id" uuid NOT NULL,
  "user_response" text NOT NULL,
  "scores" jsonb,
  "time_taken" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "writing_attempts_user_id_idx" ON "writing_attempts" ("user_id");
CREATE INDEX IF NOT EXISTS "writing_attempts_question_id_idx" ON "writing_attempts" ("question_id");
CREATE INDEX IF NOT EXISTS "writing_attempts_created_at_idx" ON "writing_attempts" ("created_at");

ALTER TABLE "writing_attempts" ADD CONSTRAINT "writing_attempts_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "writing_attempts" ADD CONSTRAINT "writing_attempts_question_id_writing_questions_id_fk"
  FOREIGN KEY ("question_id") REFERENCES "writing_questions"("id") ON DELETE cascade ON UPDATE no action;