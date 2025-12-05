ALTER TABLE "listening_attempts" ADD COLUMN "accuracy" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "listening_attempts" ADD COLUMN "correct_answers" integer;--> statement-breakpoint
ALTER TABLE "listening_attempts" ADD COLUMN "total_answers" integer;--> statement-breakpoint
ALTER TABLE "reading_attempts" ADD COLUMN "accuracy" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "reading_attempts" ADD COLUMN "correct_answers" integer;--> statement-breakpoint
ALTER TABLE "reading_attempts" ADD COLUMN "total_answers" integer;--> statement-breakpoint
ALTER TABLE "speaking_attempts" ADD COLUMN "overall_score" integer;--> statement-breakpoint
ALTER TABLE "speaking_attempts" ADD COLUMN "pronunciation_score" integer;--> statement-breakpoint
ALTER TABLE "speaking_attempts" ADD COLUMN "fluency_score" integer;--> statement-breakpoint
ALTER TABLE "speaking_attempts" ADD COLUMN "content_score" integer;--> statement-breakpoint
ALTER TABLE "writing_attempts" ADD COLUMN "overall_score" integer;--> statement-breakpoint
ALTER TABLE "writing_attempts" ADD COLUMN "grammar_score" integer;--> statement-breakpoint
ALTER TABLE "writing_attempts" ADD COLUMN "vocabulary_score" integer;--> statement-breakpoint
ALTER TABLE "writing_attempts" ADD COLUMN "coherence_score" integer;--> statement-breakpoint
ALTER TABLE "writing_attempts" ADD COLUMN "content_score" integer;--> statement-breakpoint
ALTER TABLE "writing_attempts" ADD COLUMN "word_count" integer;--> statement-breakpoint
CREATE INDEX "idx_activity_logs_user_created" ON "activity_logs" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_activity_logs_action" ON "activity_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_ai_usage_user_created" ON "ai_credit_usage" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_ai_usage_provider_created" ON "ai_credit_usage" USING btree ("provider","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_listening_attempts_user_created" ON "listening_attempts" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_listening_attempts_accuracy" ON "listening_attempts" USING btree ("accuracy" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_listening_questions_is_active" ON "listening_questions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_listening_questions_active_type" ON "listening_questions" USING btree ("type","difficulty") WHERE "listening_questions"."is_active" = true;--> statement-breakpoint
CREATE INDEX "idx_reading_attempts_user_created" ON "reading_attempts" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_reading_attempts_accuracy" ON "reading_attempts" USING btree ("accuracy" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_reading_questions_active_type" ON "reading_questions" USING btree ("type","difficulty") WHERE "reading_questions"."is_active" = true;--> statement-breakpoint
CREATE INDEX "idx_speaking_attempts_user_created" ON "speaking_attempts" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_speaking_attempts_public_scores" ON "speaking_attempts" USING btree ("is_public","question_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_speaking_attempts_overall_score" ON "speaking_attempts" USING btree ("overall_score" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_speaking_attempts_user_scores" ON "speaking_attempts" USING btree ("user_id","overall_score" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_speaking_questions_active_type" ON "speaking_questions" USING btree ("type","difficulty") WHERE "speaking_questions"."is_active" = true;--> statement-breakpoint
CREATE INDEX "idx_writing_attempts_user_created" ON "writing_attempts" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_writing_attempts_overall_score" ON "writing_attempts" USING btree ("overall_score" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_writing_questions_active_type" ON "writing_questions" USING btree ("type","difficulty") WHERE "writing_questions"."is_active" = true;