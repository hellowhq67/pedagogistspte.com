CREATE TABLE "reading_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"prompt_text" text NOT NULL,
	"options" jsonb,
	"answer_key" jsonb,
	"difficulty" text DEFAULT 'Medium' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "speaking_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"question_id" uuid NOT NULL,
	"type" text NOT NULL,
	"audio_url" text NOT NULL,
	"transcript" text,
	"scores" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"duration_ms" integer NOT NULL,
	"words_per_minute" numeric(6, 2),
	"filler_rate" numeric(6, 3),
	"timings" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "speaking_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"prompt_text" text,
	"prompt_media_url" text,
	"difficulty" text DEFAULT 'Medium' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "writing_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"prompt_text" text NOT NULL,
	"options" jsonb,
	"answer_key" jsonb,
	"difficulty" text DEFAULT 'Medium' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "speaking_attempts" ADD CONSTRAINT "speaking_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speaking_attempts" ADD CONSTRAINT "speaking_attempts_question_id_speaking_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."speaking_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_reading_questions_type" ON "reading_questions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_reading_questions_is_active" ON "reading_questions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_speaking_attempts_question" ON "speaking_attempts" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_speaking_attempts_user_type" ON "speaking_attempts" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "idx_speaking_questions_type" ON "speaking_questions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_speaking_questions_is_active" ON "speaking_questions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_speaking_questions_tags_gin" ON "speaking_questions" USING gin ("tags");--> statement-breakpoint
CREATE INDEX "idx_writing_questions_type" ON "writing_questions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_writing_questions_is_active" ON "writing_questions" USING btree ("is_active");