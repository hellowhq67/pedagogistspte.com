ALTER TABLE "listening_questions" ADD COLUMN "bookmarked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "reading_questions" ADD COLUMN "bookmarked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "speaking_questions" ADD COLUMN "bookmarked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "writing_questions" ADD COLUMN "bookmarked" boolean DEFAULT false NOT NULL;