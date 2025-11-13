CREATE TABLE "pte_question_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"url" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pte_sync_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_type" text NOT NULL,
	"question_type" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"finished_at" timestamp,
	"stats" jsonb,
	"error" text
);
--> statement-breakpoint
CREATE TABLE "pte_user_exam_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"exam_date" timestamp,
	"target_score" integer,
	"preferences" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "plan_type" text DEFAULT 'free';--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "custom_branding" jsonb;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "settings" jsonb;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "max_users" integer DEFAULT 10;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "api_key" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "webhook_url" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "status" text DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "pte_questions" ADD COLUMN "external_id" text;--> statement-breakpoint
ALTER TABLE "pte_questions" ADD COLUMN "source" text DEFAULT 'local';--> statement-breakpoint
ALTER TABLE "pte_questions" ADD COLUMN "tags" jsonb;--> statement-breakpoint
ALTER TABLE "pte_question_media" ADD CONSTRAINT "pte_question_media_question_id_pte_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."pte_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_user_exam_settings" ADD CONSTRAINT "pte_user_exam_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_slug_unique" UNIQUE("slug");