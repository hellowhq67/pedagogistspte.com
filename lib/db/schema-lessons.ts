/**
 * LESSON SYSTEM SCHEMA - Supplementary Tables
 *
 * This file adds the lesson system to the existing schema without breaking changes.
 * Import and export these tables alongside the existing schema.
 */

import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  unique,
} from 'drizzle-orm/pg-core'
import {
  users,
  speakingQuestions,
  readingQuestions,
  writingQuestions,
  listeningQuestions,
  speakingAttempts,
  readingAttempts,
  writingAttempts,
  listeningAttempts,
} from './schema'

// =====================
// NEW ENUMS
// =====================

export const membershipTierEnum = pgEnum('membership_tier', [
  'free_trial',
  'pro',
  'premium',
])

export const membershipStatusEnum = pgEnum('membership_status', [
  'active',
  'expired',
  'cancelled',
  'trial',
])

export const mediaTypeEnum = pgEnum('media_type', [
  'audio',
  'image',
  'video',
  'document',
])

export const lessonStatusEnum = pgEnum('lesson_status', [
  'draft',
  'published',
  'archived',
])

export const algorithmVersionEnum = pgEnum('algorithm_version', [
  'EN_V2e',
  'S-ASIA_V4i',
])

// =====================
// MEDIA TABLE
// =====================

export const media = pgTable('media', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  type: mediaTypeEnum('type').notNull(),
  url: text('url').notNull(),

  thumbnailUrl: text('thumbnail_url'),
  duration: integer('duration'), // seconds
  fileSize: integer('file_size'), // bytes
  mimeType: text('mime_type'),

  metadata: jsonb('metadata').$type<{
    width?: number
    height?: number
    bitrate?: number
    sampleRate?: number
    format?: string
    [key: string]: any
  }>(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  typeIdx: index('idx_media_type').on(table.type),
  urlIdx: index('idx_media_url').on(table.url),
}))

// =====================
// PRACTICE LESSONS
// =====================

export const practiceLessons = pgTable('practice_lessons', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  title: text('title').notNull(),
  description: text('description'),
  lessonNumber: integer('lesson_number').notNull(),

  module: text('module').notNull(), // 'speaking', 'writing', 'reading', 'listening'
  questionType: text('question_type').notNull(),

  isFree: boolean('is_free').notNull().default(false),
  requiredTier: membershipTierEnum('required_tier').default('pro'),

  difficulty: text('difficulty').default('Medium').notNull(),
  estimatedMinutes: integer('estimated_minutes').default(15),
  questionCount: integer('question_count').default(0),

  status: lessonStatusEnum('status').default('published').notNull(),
  orderIndex: integer('order_index').notNull().default(0),

  slug: text('slug').unique(),
  thumbnailUrl: text('thumbnail_url'),
  tags: jsonb('tags').$type<string[]>().default(sql`'[]'::jsonb`),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => ({
  moduleIdx: index('idx_practice_lessons_module').on(table.module),
  typeIdx: index('idx_practice_lessons_type').on(table.questionType),
  tierIdx: index('idx_practice_lessons_tier').on(table.requiredTier),
  statusIdx: index('idx_practice_lessons_status').on(table.status),
  orderIdx: index('idx_practice_lessons_order').on(table.module, table.orderIndex),
  slugIdx: index('idx_practice_lessons_slug').on(table.slug),
}))

// =====================
// USER SUBSCRIPTIONS
// =====================

export const userSubscriptions = pgTable('user_subscriptions', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),

  tier: membershipTierEnum('tier').notNull(),
  status: membershipStatusEnum('status').notNull().default('active'),

  startDate: timestamp('start_date').defaultNow().notNull(),
  endDate: timestamp('end_date'),
  trialEndsAt: timestamp('trial_ends_at'),

  autoRenew: boolean('auto_renew').default(true),
  stripeSubscriptionId: text('stripe_subscription_id'),
  stripeCustomerId: text('stripe_customer_id'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => ({
  userIdIdx: index('idx_user_subscriptions_user_id').on(table.userId),
  statusIdx: index('idx_user_subscriptions_status').on(table.status),
}))

// =====================
// LESSON PROGRESS
// =====================

export const lessonProgress = pgTable('lesson_progress', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  lessonId: uuid('lesson_id')
    .notNull()
    .references(() => practiceLessons.id, { onDelete: 'cascade' }),

  questionsCompleted: integer('questions_completed').default(0),
  questionsTotal: integer('questions_total').notNull(),
  completionPercentage: integer('completion_percentage').default(0),

  averageScore: decimal('average_score', { precision: 5, scale: 2 }),
  bestScore: integer('best_score'),
  totalAttempts: integer('total_attempts').default(0),

  startedAt: timestamp('started_at').defaultNow(),
  lastActivityAt: timestamp('last_activity_at').defaultNow(),
  completedAt: timestamp('completed_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => ({
  userLessonUnique: unique('lesson_progress_user_lesson_unique').on(
    table.userId,
    table.lessonId
  ),
  userIdIdx: index('idx_lesson_progress_user').on(table.userId),
  lessonIdIdx: index('idx_lesson_progress_lesson').on(table.lessonId),
  completedIdx: index('idx_lesson_progress_completed').on(table.completedAt),
}))

// =====================
// USER STATS
// =====================

export const userStats = pgTable('user_stats', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),

  totalPracticeTime: integer('total_practice_time_minutes').default(0),
  totalAttempts: integer('total_attempts').default(0),
  lessonsCompleted: integer('lessons_completed').default(0),
  currentStreak: integer('current_streak_days').default(0),
  longestStreak: integer('longest_streak_days').default(0),

  speakingAverage: decimal('speaking_average', { precision: 5, scale: 2 }),
  writingAverage: decimal('writing_average', { precision: 5, scale: 2 }),
  readingAverage: decimal('reading_average', { precision: 5, scale: 2 }),
  listeningAverage: decimal('listening_average', { precision: 5, scale: 2 }),

  speakingAttempts: integer('speaking_attempts').default(0),
  writingAttempts: integer('writing_attempts').default(0),
  readingAttempts: integer('reading_attempts').default(0),
  listeningAttempts: integer('listening_attempts').default(0),

  lastActivityAt: timestamp('last_activity_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => ({
  userIdIdx: index('idx_user_stats_user').on(table.userId),
}))

// =====================
// RELATIONS
// =====================

export const mediaRelations = relations(media, ({ many }) => ({
  speakingQuestionsAsPromptImage: many(speakingQuestions),
  speakingQuestionsAsPromptAudio: many(speakingQuestions),
  speakingQuestionsAsSampleAnswer: many(speakingQuestions),
  listeningQuestionsAsPromptAudio: many(listeningQuestions),
  speakingAttemptsAsUserAudio: many(speakingAttempts),
}))

export const practiceLessonsRelations = relations(practiceLessons, ({ many }) => ({
  speakingQuestions: many(speakingQuestions),
  readingQuestions: many(readingQuestions),
  writingQuestions: many(writingQuestions),
  listeningQuestions: many(listeningQuestions),
  progress: many(lessonProgress),
  speakingAttempts: many(speakingAttempts),
  readingAttempts: many(readingAttempts),
  writingAttempts: many(writingAttempts),
  listeningAttempts: many(listeningAttempts),
}))

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [userSubscriptions.userId],
    references: [users.id],
  }),
}))

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  user: one(users, {
    fields: [lessonProgress.userId],
    references: [users.id],
  }),
  lesson: one(practiceLessons, {
    fields: [lessonProgress.lessonId],
    references: [practiceLessons.id],
  }),
}))

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, {
    fields: [userStats.userId],
    references: [users.id],
  }),
}))

// =====================
// TYPE EXPORTS
// =====================

export type Media = typeof media.$inferSelect
export type NewMedia = typeof media.$inferInsert

export type PracticeLesson = typeof practiceLessons.$inferSelect
export type NewPracticeLesson = typeof practiceLessons.$inferInsert

export type UserSubscription = typeof userSubscriptions.$inferSelect
export type NewUserSubscription = typeof userSubscriptions.$inferInsert

export type LessonProgress = typeof lessonProgress.$inferSelect
export type NewLessonProgress = typeof lessonProgress.$inferInsert

export type UserStats = typeof userStats.$inferSelect
export type NewUserStats = typeof userStats.$inferInsert
