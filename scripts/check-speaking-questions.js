import { db } from '../lib/db/drizzle.js';
import { speakingQuestions } from '../lib/db/schema.js';
import { eq } from 'drizzle-orm';

async function checkSpeakingQuestions() {
  try {
    console.log('Checking speaking questions in database...\n');

    // Get count by type
    const types = [
      'read_aloud',
      'repeat_sentence',
      'describe_image',
      'retell_lecture',
      'answer_short_question',
      'respond_to_a_situation',
      'summarize_group_discussion'
    ];

    for (const type of types) {
      const questions = await db
        .select()
        .from(speakingQuestions)
        .where(eq(speakingQuestions.type, type));

      const activeCount = questions.filter(q => q.isActive).length;
      const inactiveCount = questions.filter(q => !q.isActive).length;

      console.log(`${type}:`);
      console.log(`  Total: ${questions.length}`);
      console.log(`  Active: ${activeCount}`);
      console.log(`  Inactive: ${inactiveCount}`);
      console.log('');
    }

    // Show sample questions
    console.log('Sample questions:');
    const samples = await db
      .select()
      .from(speakingQuestions)
      .limit(5);

    samples.forEach(q => {
      console.log(`- ${q.type}: ${q.title} (Active: ${q.isActive})`);
    });

  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    process.exit(0);
  }
}

checkSpeakingQuestions();