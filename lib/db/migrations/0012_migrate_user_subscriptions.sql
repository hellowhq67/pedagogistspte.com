-- Migration: Migrate user_subscriptions table to new schema with tier system
-- This migration updates the user_subscriptions table to match schema-lessons.ts

-- Add new columns for enhanced subscription tracking
ALTER TABLE "user_subscriptions" ADD COLUMN IF NOT EXISTS "tier" "membership_tier";
ALTER TABLE "user_subscriptions" ADD COLUMN IF NOT EXISTS "status_new" "membership_status";
ALTER TABLE "user_subscriptions" ADD COLUMN IF NOT EXISTS "trial_ends_at" timestamp;
ALTER TABLE "user_subscriptions" ADD COLUMN IF NOT EXISTS "stripe_subscription_id" text;
ALTER TABLE "user_subscriptions" ADD COLUMN IF NOT EXISTS "stripe_customer_id" text;

-- Migrate data from old columns to new columns
UPDATE "user_subscriptions"
SET
  "tier" = CASE
    WHEN "plan_type" = 'free' THEN 'free_trial'::membership_tier
    WHEN "plan_type" = 'basic' THEN 'pro'::membership_tier
    WHEN "plan_type" = 'premium' THEN 'premium'::membership_tier
    WHEN "plan_type" = 'enterprise' THEN 'premium'::membership_tier
    ELSE 'pro'::membership_tier
  END,
  "status_new" = CASE
    WHEN "status" = 'active' THEN 'active'::membership_status
    WHEN "status" = 'expired' THEN 'expired'::membership_status
    WHEN "status" = 'cancelled' THEN 'cancelled'::membership_status
    ELSE 'active'::membership_status
  END
WHERE "tier" IS NULL;

-- Drop old columns
ALTER TABLE "user_subscriptions" DROP COLUMN IF EXISTS "plan_type";
ALTER TABLE "user_subscriptions" DROP COLUMN IF EXISTS "status";
ALTER TABLE "user_subscriptions" DROP COLUMN IF EXISTS "payment_method";

-- Rename new status column
ALTER TABLE "user_subscriptions" RENAME COLUMN "status_new" TO "status";

-- Make tier NOT NULL
ALTER TABLE "user_subscriptions" ALTER COLUMN "tier" SET NOT NULL;
ALTER TABLE "user_subscriptions" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "user_subscriptions" ALTER COLUMN "status" SET DEFAULT 'active'::membership_status;

-- Add unique constraint on userId
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_unique" UNIQUE("user_id");

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_user_subscriptions_user_id" ON "user_subscriptions" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_subscriptions_status" ON "user_subscriptions" USING btree ("status");
