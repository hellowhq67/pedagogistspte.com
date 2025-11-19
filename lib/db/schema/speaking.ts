import { pgTable, text, varchar } from 'drizzle-orm/pg-core';

export const speakingQuestions = pgTable('speaking_questions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  type: text('type').notNull(),
});

export type SpeakingQuestion = typeof speakingQuestions.$inferSelect;
