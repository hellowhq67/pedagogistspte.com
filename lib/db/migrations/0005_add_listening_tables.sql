CREATE TYPE "listening_question_type" AS ENUM('summarize_spoken_text', 'multiple_choice_single', 'multiple_choice_multiple', 'fill_in_blanks', 'highlight_correct_summary', 'select_missing_word', 'highlight_incorrect_words', 'write_from_dictation');

CREATE TABLE IF NOT EXISTS "listening_questions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "type" "listening_question_type" NOT NULL,
  "title" text NOT NULL,
  "prompt_text" text,
  "prompt_media_url" text,
  "correct_answers" jsonb NOT NULL,
  "options" jsonb,
  "transcript" text,
  "difficulty" "difficulty_level" DEFAULT 'Medium' NOT NULL,
  "tags" jsonb DEFAULT '[]'::jsonb,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "listening_attempts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "question_id" uuid NOT NULL,
  "user_response" jsonb NOT NULL,
  "scores" jsonb,
  "time_taken" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "listening_questions_type_idx" ON "listening_questions" ("type");
CREATE INDEX IF NOT EXISTS "listening_questions_difficulty_idx" ON "listening_questions" ("difficulty");
CREATE INDEX IF NOT EXISTS "listening_questions_created_at_idx" ON "listening_questions" ("created_at");

CREATE INDEX IF NOT EXISTS "listening_attempts_user_id_idx" ON "listening_attempts" ("user_id");
CREATE INDEX IF NOT EXISTS "listening_attempts_question_id_idx" ON "listening_attempts" ("question_id");
CREATE INDEX IF NOT EXISTS "listening_attempts_created_at_idx" ON "listening_attempts" ("created_at");

ALTER TABLE "listening_attempts" ADD CONSTRAINT "listening_attempts_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "listening_attempts" ADD CONSTRAINT "listening_attempts_question_id_listening_questions_id_fk"
  FOREIGN KEY ("question_id") REFERENCES "listening_questions"("id") ON DELETE cascade ON UPDATE no action;