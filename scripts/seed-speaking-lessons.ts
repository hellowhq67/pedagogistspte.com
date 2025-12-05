/**
 * Seed Script: Speaking Module Practice Lessons
 *
 * This script creates:
 * 1. Media records for audio/images
 * 2. Practice lessons for each speaking type
 * 3. Speaking questions (5-10 per lesson)
 *
 * Usage: pnpm tsx scripts/seed-speaking-lessons.ts
 */

import { db } from '../lib/db'
import {
  media,
  practiceLessons,
  speakingQuestions,
} from '../lib/db/schema-improved'

// Sample media URLs from your Vercel Blob Storage
const MEDIA_URLS = {
  readAloud: {
    sample1: 'https://0bnqt3onuegvdmxo.public.blob.vercel-storage.com/read_aloud/PTE_M2_ReadAloudExample-zbAlXwcOMOV7SxGErXLUvZPKvilPxI.mp3',
  },
  repeatSentence: {
    sample1: 'https://0bnqt3onuegvdmxo.public.blob.vercel-storage.com/repet_sentence/PTE_M2_RepeatSentenceExample%20%281%29-loFIIhwyf56aAjcXAhqh03G42XWwub.mp3',
  },
  describeImage: {
    sample1: 'https://dl26yht2ovo33.cloudfront.net/public/system/describe_images/images/occupational_data/original/33ae53cfbe08fb00537a596c7d92ab3b/occupational_data.png?1640079410',
    frontendExample: 'https://0bnqt3onuegvdmxo.public.blob.vercel-storage.com/MEDIA_ASSETS/PTE-Read-Aloud-Practice-Test-Question-618-PTE-Academic-12-04-2025_09_13_AM-FLFvUwnfdvGfGFEufRflrwFhHUU8J8.png',
  },
  answerShortQuestion: {
    sample1: 'https://0bnqt3onuegvdmxo.public.blob.vercel-storage.com/answear_short_qustion/PTE_M2_AnswerShortQuestionQ%20%281%29-9rPumviwIdcdn8ZxOcB1y97crnyzrh.mp3',
  },
  summarizeGroupDiscussion: {
    sample1: 'https://0bnqt3onuegvdmxo.public.blob.vercel-storage.com/summarzie_group_discussion/L6_Summarize_group_discussion_2_Response_C1-WCsTtshJRi0NonqBhFQq3VtdEVH0y2.m4a',
  },
}

async function main() {
  console.log('🌱 Starting Speaking Lessons Seed...\n')

  try {
    // ============================================
    // 1. CREATE MEDIA RECORDS
    // ============================================
    console.log('📁 Creating media records...')

    const [describeImageMedia1] = await db
      .insert(media)
      .values({
        type: 'image',
        url: MEDIA_URLS.describeImage.sample1,
        metadata: { width: 800, height: 600, format: 'png' },
      })
      .returning()

    const [readAloudAudio1] = await db
      .insert(media)
      .values({
        type: 'audio',
        url: MEDIA_URLS.readAloud.sample1,
        duration: 15,
        mimeType: 'audio/mpeg',
      })
      .returning()

    const [repeatSentenceAudio1] = await db
      .insert(media)
      .values({
        type: 'audio',
        url: MEDIA_URLS.repeatSentence.sample1,
        duration: 5,
        mimeType: 'audio/mpeg',
      })
      .returning()

    const [answerShortAudio1] = await db
      .insert(media)
      .values({
        type: 'audio',
        url: MEDIA_URLS.answerShortQuestion.sample1,
        duration: 3,
        mimeType: 'audio/mpeg',
      })
      .returning()

    const [groupDiscussionAudio1] = await db
      .insert(media)
      .values({
        type: 'audio',
        url: MEDIA_URLS.summarizeGroupDiscussion.sample1,
        duration: 120,
        mimeType: 'audio/m4a',
      })
      .returning()

    console.log('✅ Created', 5, 'media records\n')

    // ============================================
    // 2. CREATE PRACTICE LESSONS
    // ============================================
    console.log('📚 Creating practice lessons...')

    const lessons = await db
      .insert(practiceLessons)
      .values([
        // Read Aloud Lessons
        {
          title: 'Read Aloud - Beginner Practice (FREE)',
          description: 'Master basic pronunciation and reading fluency with simple texts',
          lessonNumber: 1,
          module: 'speaking',
          questionType: 'read_aloud',
          isFree: true,
          requiredTier: 'free_trial',
          difficulty: 'Easy',
          estimatedMinutes: 15,
          orderIndex: 1,
          slug: 'read-aloud-beginner',
        },
        {
          title: 'Read Aloud - Intermediate Challenge',
          description: 'Practice with academic vocabulary and complex sentences',
          lessonNumber: 2,
          module: 'speaking',
          questionType: 'read_aloud',
          isFree: false,
          requiredTier: 'pro',
          difficulty: 'Medium',
          estimatedMinutes: 20,
          orderIndex: 2,
          slug: 'read-aloud-intermediate',
        },
        {
          title: 'Read Aloud - Advanced Mastery',
          description: 'Challenge yourself with scientific and technical texts',
          lessonNumber: 3,
          module: 'speaking',
          questionType: 'read_aloud',
          isFree: false,
          requiredTier: 'pro',
          difficulty: 'Hard',
          estimatedMinutes: 25,
          orderIndex: 3,
          slug: 'read-aloud-advanced',
        },

        // Repeat Sentence Lessons
        {
          title: 'Repeat Sentence - Foundation (FREE)',
          description: 'Build listening and speaking skills with short sentences',
          lessonNumber: 4,
          module: 'speaking',
          questionType: 'repeat_sentence',
          isFree: true,
          requiredTier: 'free_trial',
          difficulty: 'Easy',
          estimatedMinutes: 10,
          orderIndex: 4,
          slug: 'repeat-sentence-foundation',
        },
        {
          title: 'Repeat Sentence - Advanced Memory',
          description: 'Master longer and more complex sentences',
          lessonNumber: 5,
          module: 'speaking',
          questionType: 'repeat_sentence',
          isFree: false,
          requiredTier: 'pro',
          difficulty: 'Medium',
          estimatedMinutes: 15,
          orderIndex: 5,
          slug: 'repeat-sentence-advanced',
        },

        // Describe Image Lessons
        {
          title: 'Describe Image - Charts & Graphs',
          description: 'Learn to describe data visualizations effectively',
          lessonNumber: 6,
          module: 'speaking',
          questionType: 'describe_image',
          isFree: false,
          requiredTier: 'pro',
          difficulty: 'Medium',
          estimatedMinutes: 20,
          orderIndex: 6,
          slug: 'describe-image-charts',
        },
        {
          title: 'Describe Image - Pictures & Diagrams',
          description: 'Describe real-world images and scientific diagrams',
          lessonNumber: 7,
          module: 'speaking',
          questionType: 'describe_image',
          isFree: false,
          requiredTier: 'pro',
          difficulty: 'Medium',
          estimatedMinutes: 20,
          orderIndex: 7,
          slug: 'describe-image-pictures',
        },

        // Answer Short Question
        {
          title: 'Answer Short Question - Quick Thinking (FREE)',
          description: 'Practice giving quick, accurate answers',
          lessonNumber: 8,
          module: 'speaking',
          questionType: 'answer_short_question',
          isFree: true,
          requiredTier: 'free_trial',
          difficulty: 'Easy',
          estimatedMinutes: 10,
          orderIndex: 8,
          slug: 'answer-short-question-quick',
        },

        // Retell Lecture
        {
          title: 'Retell Lecture - Academic Topics',
          description: 'Summarize academic lectures effectively',
          lessonNumber: 9,
          module: 'speaking',
          questionType: 'retell_lecture',
          isFree: false,
          requiredTier: 'pro',
          difficulty: 'Medium',
          estimatedMinutes: 25,
          orderIndex: 9,
          slug: 'retell-lecture-academic',
        },

        // Summarize Group Discussion
        {
          title: 'Summarize Group Discussion - Practice',
          description: 'Learn to summarize multi-speaker conversations',
          lessonNumber: 10,
          module: 'speaking',
          questionType: 'summarize_group_discussion',
          isFree: false,
          requiredTier: 'pro',
          difficulty: 'Medium',
          estimatedMinutes: 20,
          orderIndex: 10,
          slug: 'summarize-group-discussion-practice',
        },

        // Respond to Situation
        {
          title: 'Respond to Situation - Real-Life Scenarios',
          description: 'Practice responding to everyday situations',
          lessonNumber: 11,
          module: 'speaking',
          questionType: 'respond_to_a_situation',
          isFree: false,
          requiredTier: 'pro',
          difficulty: 'Medium',
          estimatedMinutes: 15,
          orderIndex: 11,
          slug: 'respond-to-situation-practice',
        },
      ])
      .returning()

    console.log('✅ Created', lessons.length, 'practice lessons\n')

    // ============================================
    // 3. CREATE SPEAKING QUESTIONS
    // ============================================
    console.log('❓ Creating speaking questions...')

    // Get specific lessons for assigning questions
    const readAloudBeginner = lessons.find(
      (l) => l.slug === 'read-aloud-beginner'
    )
    const repeatSentenceFoundation = lessons.find(
      (l) => l.slug === 'repeat-sentence-foundation'
    )
    const describeImageCharts = lessons.find(
      (l) => l.slug === 'describe-image-charts'
    )
    const answerShortQuick = lessons.find(
      (l) => l.slug === 'answer-short-question-quick'
    )
    const summarizeGroupDiscussion = lessons.find(
      (l) => l.slug === 'summarize-group-discussion-practice'
    )

    // READ ALOUD QUESTIONS (10 questions for beginner lesson)
    const readAloudQuestions = await db
      .insert(speakingQuestions)
      .values([
        {
          type: 'read_aloud',
          title: 'Read Aloud #1 - Australian Weather',
          promptText:
            'The weather in Australia is generally warm and sunny. Most people enjoy outdoor activities throughout the year. The country has beautiful beaches and national parks that attract millions of visitors annually.',
          lessonId: readAloudBeginner!.id,
          difficulty: 'Easy',
          estimatedSeconds: 40,
          prepTimeSeconds: 30,
          isFree: true,
          sampleAnswerAudioId: readAloudAudio1.id,
        },
        {
          type: 'read_aloud',
          title: 'Read Aloud #2 - Education System',
          promptText:
            'Universities around the world provide opportunities for students to pursue higher education. Academic programs vary in duration and focus, but they all aim to develop critical thinking and professional skills necessary for future careers.',
          lessonId: readAloudBeginner!.id,
          difficulty: 'Easy',
          estimatedSeconds: 45,
          prepTimeSeconds: 30,
          isFree: true,
        },
        {
          type: 'read_aloud',
          title: 'Read Aloud #3 - Technology Impact',
          promptText:
            'Modern technology has transformed the way we communicate and work. Digital devices connect people across vast distances instantly. This connectivity has created new opportunities for collaboration and innovation in various industries.',
          lessonId: readAloudBeginner!.id,
          difficulty: 'Easy',
          estimatedSeconds: 45,
          prepTimeSeconds: 30,
          isFree: true,
        },
        {
          type: 'read_aloud',
          title: 'Read Aloud #4 - Environmental Conservation',
          promptText:
            'Protecting our environment requires collective effort from individuals and governments. Simple actions like recycling, reducing waste, and conserving energy can make a significant difference in preserving natural resources for future generations.',
          lessonId: readAloudBeginner!.id,
          difficulty: 'Easy',
          estimatedSeconds: 45,
          prepTimeSeconds: 30,
          isFree: true,
        },
        {
          type: 'read_aloud',
          title: 'Read Aloud #5 - Cultural Diversity',
          promptText:
            'Cultural diversity enriches societies by bringing together different perspectives and traditions. Communities that embrace multiculturalism often benefit from increased creativity, innovation, and social cohesion through the sharing of diverse ideas and experiences.',
          lessonId: readAloudBeginner!.id,
          difficulty: 'Easy',
          estimatedSeconds: 48,
          prepTimeSeconds: 30,
          isFree: true,
        },
        {
          type: 'read_aloud',
          title: 'Read Aloud #6 - Healthcare Advances',
          promptText:
            'Medical research continues to make breakthroughs in treating diseases and improving patient care. Advanced diagnostic tools and innovative therapies have increased life expectancy and enhanced the quality of life for people worldwide.',
          lessonId: readAloudBeginner!.id,
          difficulty: 'Easy',
          estimatedSeconds: 43,
          prepTimeSeconds: 30,
          isFree: true,
        },
        {
          type: 'read_aloud',
          title: 'Read Aloud #7 - Urban Development',
          promptText:
            'Cities are constantly evolving to accommodate growing populations. Urban planners focus on creating sustainable infrastructure, efficient transportation systems, and green spaces to ensure cities remain livable and environmentally friendly.',
          lessonId: readAloudBeginner!.id,
          difficulty: 'Easy',
          estimatedSeconds: 43,
          prepTimeSeconds: 30,
          isFree: true,
        },
        {
          type: 'read_aloud',
          title: 'Read Aloud #8 - Business Innovation',
          promptText:
            'Successful businesses adapt to changing market conditions by embracing innovation. Companies that invest in research and development, adopt new technologies, and respond to customer needs are more likely to remain competitive in the global marketplace.',
          lessonId: readAloudBeginner!.id,
          difficulty: 'Easy',
          estimatedSeconds: 45,
          prepTimeSeconds: 30,
          isFree: true,
        },
        {
          type: 'read_aloud',
          title: 'Read Aloud #9 - Sports Benefits',
          promptText:
            'Regular physical activity promotes both physical and mental well-being. Participation in sports helps develop teamwork skills, discipline, and resilience. These benefits extend beyond the playing field into personal and professional life.',
          lessonId: readAloudBeginner!.id,
          difficulty: 'Easy',
          estimatedSeconds: 42,
          prepTimeSeconds: 30,
          isFree: true,
        },
        {
          type: 'read_aloud',
          title: 'Read Aloud #10 - Social Media Influence',
          promptText:
            'Social media platforms have revolutionized communication and information sharing. While they offer unprecedented connectivity and opportunities for expression, users must navigate challenges related to privacy, misinformation, and digital well-being.',
          lessonId: readAloudBeginner!.id,
          difficulty: 'Easy',
          estimatedSeconds: 42,
          prepTimeSeconds: 30,
          isFree: true,
        },
      ])
      .returning()

    console.log('✅ Created', readAloudQuestions.length, 'Read Aloud questions')

    // REPEAT SENTENCE QUESTIONS (10 questions)
    const repeatSentenceQuestions = await db
      .insert(speakingQuestions)
      .values([
        {
          type: 'repeat_sentence',
          title: 'Repeat Sentence #1',
          promptText: 'Most students find mathematics challenging.',
          promptAudioId: repeatSentenceAudio1.id,
          lessonId: repeatSentenceFoundation!.id,
          difficulty: 'Easy',
          estimatedSeconds: 5,
          prepTimeSeconds: 0,
          isFree: true,
        },
        {
          type: 'repeat_sentence',
          title: 'Repeat Sentence #2',
          promptText: 'The library closes at eight o\'clock tonight.',
          promptAudioId: repeatSentenceAudio1.id,
          lessonId: repeatSentenceFoundation!.id,
          difficulty: 'Easy',
          estimatedSeconds: 5,
          prepTimeSeconds: 0,
          isFree: true,
        },
        {
          type: 'repeat_sentence',
          title: 'Repeat Sentence #3',
          promptText: 'Regular exercise improves overall health.',
          promptAudioId: repeatSentenceAudio1.id,
          lessonId: repeatSentenceFoundation!.id,
          difficulty: 'Easy',
          estimatedSeconds: 5,
          prepTimeSeconds: 0,
          isFree: true,
        },
        {
          type: 'repeat_sentence',
          title: 'Repeat Sentence #4',
          promptText: 'The research paper is due next Friday.',
          promptAudioId: repeatSentenceAudio1.id,
          lessonId: repeatSentenceFoundation!.id,
          difficulty: 'Easy',
          estimatedSeconds: 5,
          prepTimeSeconds: 0,
          isFree: true,
        },
        {
          type: 'repeat_sentence',
          title: 'Repeat Sentence #5',
          promptText: 'Technology has transformed modern communication.',
          promptAudioId: repeatSentenceAudio1.id,
          lessonId: repeatSentenceFoundation!.id,
          difficulty: 'Easy',
          estimatedSeconds: 5,
          prepTimeSeconds: 0,
          isFree: true,
        },
        {
          type: 'repeat_sentence',
          title: 'Repeat Sentence #6',
          promptText: 'Climate change affects ecosystems globally.',
          promptAudioId: repeatSentenceAudio1.id,
          lessonId: repeatSentenceFoundation!.id,
          difficulty: 'Easy',
          estimatedSeconds: 5,
          prepTimeSeconds: 0,
          isFree: true,
        },
        {
          type: 'repeat_sentence',
          title: 'Repeat Sentence #7',
          promptText: 'Effective teamwork requires clear communication.',
          promptAudioId: repeatSentenceAudio1.id,
          lessonId: repeatSentenceFoundation!.id,
          difficulty: 'Easy',
          estimatedSeconds: 5,
          prepTimeSeconds: 0,
          isFree: true,
        },
        {
          type: 'repeat_sentence',
          title: 'Repeat Sentence #8',
          promptText: 'The museum features contemporary art exhibitions.',
          promptAudioId: repeatSentenceAudio1.id,
          lessonId: repeatSentenceFoundation!.id,
          difficulty: 'Easy',
          estimatedSeconds: 5,
          prepTimeSeconds: 0,
          isFree: true,
        },
        {
          type: 'repeat_sentence',
          title: 'Repeat Sentence #9',
          promptText: 'Renewable energy sources reduce carbon emissions.',
          promptAudioId: repeatSentenceAudio1.id,
          lessonId: repeatSentenceFoundation!.id,
          difficulty: 'Easy',
          estimatedSeconds: 5,
          prepTimeSeconds: 0,
          isFree: true,
        },
        {
          type: 'repeat_sentence',
          title: 'Repeat Sentence #10',
          promptText: 'International trade benefits participating countries.',
          promptAudioId: repeatSentenceAudio1.id,
          lessonId: repeatSentenceFoundation!.id,
          difficulty: 'Easy',
          estimatedSeconds: 5,
          prepTimeSeconds: 0,
          isFree: true,
        },
      ])
      .returning()

    console.log(
      '✅ Created',
      repeatSentenceQuestions.length,
      'Repeat Sentence questions'
    )

    // DESCRIBE IMAGE QUESTIONS (8 questions)
    const describeImageQuestions = await db
      .insert(speakingQuestions)
      .values([
        {
          type: 'describe_image',
          title: 'Describe Image #1 - Occupational Data',
          promptText: 'Describe the image showing occupational statistics.',
          promptImageId: describeImageMedia1.id,
          lessonId: describeImageCharts!.id,
          difficulty: 'Medium',
          estimatedSeconds: 40,
          prepTimeSeconds: 25,
          isFree: false,
        },
        {
          type: 'describe_image',
          title: 'Describe Image #2 - Sales Trend',
          promptText: 'Describe the bar chart showing quarterly sales trends.',
          promptImageId: describeImageMedia1.id,
          lessonId: describeImageCharts!.id,
          difficulty: 'Medium',
          estimatedSeconds: 40,
          prepTimeSeconds: 25,
          isFree: false,
        },
        {
          type: 'describe_image',
          title: 'Describe Image #3 - Population Growth',
          promptText: 'Describe the line graph showing population growth over time.',
          promptImageId: describeImageMedia1.id,
          lessonId: describeImageCharts!.id,
          difficulty: 'Medium',
          estimatedSeconds: 40,
          prepTimeSeconds: 25,
          isFree: false,
        },
        {
          type: 'describe_image',
          title: 'Describe Image #4 - Market Share',
          promptText: 'Describe the pie chart showing market share distribution.',
          promptImageId: describeImageMedia1.id,
          lessonId: describeImageCharts!.id,
          difficulty: 'Medium',
          estimatedSeconds: 40,
          prepTimeSeconds: 25,
          isFree: false,
        },
        {
          type: 'describe_image',
          title: 'Describe Image #5 - Energy Consumption',
          promptText:
            'Describe the chart comparing energy consumption across regions.',
          promptImageId: describeImageMedia1.id,
          lessonId: describeImageCharts!.id,
          difficulty: 'Medium',
          estimatedSeconds: 40,
          prepTimeSeconds: 25,
          isFree: false,
        },
        {
          type: 'describe_image',
          title: 'Describe Image #6 - Survey Results',
          promptText: 'Describe the bar graph showing survey results by category.',
          promptImageId: describeImageMedia1.id,
          lessonId: describeImageCharts!.id,
          difficulty: 'Medium',
          estimatedSeconds: 40,
          prepTimeSeconds: 25,
          isFree: false,
        },
        {
          type: 'describe_image',
          title: 'Describe Image #7 - Temperature Data',
          promptText:
            'Describe the line graph showing annual temperature variations.',
          promptImageId: describeImageMedia1.id,
          lessonId: describeImageCharts!.id,
          difficulty: 'Medium',
          estimatedSeconds: 40,
          prepTimeSeconds: 25,
          isFree: false,
        },
        {
          type: 'describe_image',
          title: 'Describe Image #8 - Export Statistics',
          promptText:
            'Describe the chart showing export statistics for different products.',
          promptImageId: describeImageMedia1.id,
          lessonId: describeImageCharts!.id,
          difficulty: 'Medium',
          estimatedSeconds: 40,
          prepTimeSeconds: 25,
          isFree: false,
        },
      ])
      .returning()

    console.log(
      '✅ Created',
      describeImageQuestions.length,
      'Describe Image questions'
    )

    // ANSWER SHORT QUESTION (10 questions)
    const answerShortQuestions = await db
      .insert(speakingQuestions)
      .values([
        {
          type: 'answer_short_question',
          title: 'Answer Short Question #1',
          promptText: 'What do you call the person who cuts your hair?',
          promptAudioId: answerShortAudio1.id,
          lessonId: answerShortQuick!.id,
          difficulty: 'Easy',
          estimatedSeconds: 3,
          prepTimeSeconds: 0,
          isFree: true,
        },
        {
          type: 'answer_short_question',
          title: 'Answer Short Question #2',
          promptText: 'What is the opposite of expensive?',
          promptAudioId: answerShortAudio1.id,
          lessonId: answerShortQuick!.id,
          difficulty: 'Easy',
          estimatedSeconds: 3,
          prepTimeSeconds: 0,
          isFree: true,
        },
        {
          type: 'answer_short_question',
          title: 'Answer Short Question #3',
          promptText: 'How many days are there in February during a leap year?',
          promptAudioId: answerShortAudio1.id,
          lessonId: answerShortQuick!.id,
          difficulty: 'Easy',
          estimatedSeconds: 3,
          prepTimeSeconds: 0,
          isFree: true,
        },
        {
          type: 'answer_short_question',
          title: 'Answer Short Question #4',
          promptText: 'What do you call a person who studies weather patterns?',
          promptAudioId: answerShortAudio1.id,
          lessonId: answerShortQuick!.id,
          difficulty: 'Easy',
          estimatedSeconds: 3,
          prepTimeSeconds: 0,
          isFree: true,
        },
        {
          type: 'answer_short_question',
          title: 'Answer Short Question #5',
          promptText: 'What is the main ingredient in bread?',
          promptAudioId: answerShortAudio1.id,
          lessonId: answerShortQuick!.id,
          difficulty: 'Easy',
          estimatedSeconds: 3,
          prepTimeSeconds: 0,
          isFree: true,
        },
        {
          type: 'answer_short_question',
          title: 'Answer Short Question #6',
          promptText: 'Which season comes after winter?',
          promptAudioId: answerShortAudio1.id,
          lessonId: answerShortQuick!.id,
          difficulty: 'Easy',
          estimatedSeconds: 3,
          prepTimeSeconds: 0,
          isFree: true,
        },
        {
          type: 'answer_short_question',
          title: 'Answer Short Question #7',
          promptText: 'What do you call a baby dog?',
          promptAudioId: answerShortAudio1.id,
          lessonId: answerShortQuick!.id,
          difficulty: 'Easy',
          estimatedSeconds: 3,
          prepTimeSeconds: 0,
          isFree: true,
        },
        {
          type: 'answer_short_question',
          title: 'Answer Short Question #8',
          promptText: 'How many wheels does a bicycle have?',
          promptAudioId: answerShortAudio1.id,
          lessonId: answerShortQuick!.id,
          difficulty: 'Easy',
          estimatedSeconds: 3,
          prepTimeSeconds: 0,
          isFree: true,
        },
        {
          type: 'answer_short_question',
          title: 'Answer Short Question #9',
          promptText: 'What is the capital city of France?',
          promptAudioId: answerShortAudio1.id,
          lessonId: answerShortQuick!.id,
          difficulty: 'Easy',
          estimatedSeconds: 3,
          prepTimeSeconds: 0,
          isFree: true,
        },
        {
          type: 'answer_short_question',
          title: 'Answer Short Question #10',
          promptText: 'What do you call frozen water?',
          promptAudioId: answerShortAudio1.id,
          lessonId: answerShortQuick!.id,
          difficulty: 'Easy',
          estimatedSeconds: 3,
          prepTimeSeconds: 0,
          isFree: true,
        },
      ])
      .returning()

    console.log(
      '✅ Created',
      answerShortQuestions.length,
      'Answer Short Question questions'
    )

    // SUMMARIZE GROUP DISCUSSION (5 questions)
    const summarizeGroupQuestions = await db
      .insert(speakingQuestions)
      .values([
        {
          type: 'summarize_group_discussion',
          title: 'Summarize Group Discussion #1',
          promptText:
            'Listen to the discussion between three people and summarize their conversation in 90-120 seconds.',
          promptAudioId: groupDiscussionAudio1.id,
          lessonId: summarizeGroupDiscussion!.id,
          difficulty: 'Medium',
          estimatedSeconds: 120,
          prepTimeSeconds: 10,
          isFree: false,
          metadata: {
            speakers: 3,
            topics: ['education', 'technology', 'online learning'],
          },
        },
        {
          type: 'summarize_group_discussion',
          title: 'Summarize Group Discussion #2',
          promptText:
            'Summarize the group discussion about environmental conservation.',
          promptAudioId: groupDiscussionAudio1.id,
          lessonId: summarizeGroupDiscussion!.id,
          difficulty: 'Medium',
          estimatedSeconds: 120,
          prepTimeSeconds: 10,
          isFree: false,
        },
        {
          type: 'summarize_group_discussion',
          title: 'Summarize Group Discussion #3',
          promptText: 'Summarize the conversation about workplace diversity.',
          promptAudioId: groupDiscussionAudio1.id,
          lessonId: summarizeGroupDiscussion!.id,
          difficulty: 'Medium',
          estimatedSeconds: 120,
          prepTimeSeconds: 10,
          isFree: false,
        },
        {
          type: 'summarize_group_discussion',
          title: 'Summarize Group Discussion #4',
          promptText: 'Summarize the discussion about healthcare systems.',
          promptAudioId: groupDiscussionAudio1.id,
          lessonId: summarizeGroupDiscussion!.id,
          difficulty: 'Medium',
          estimatedSeconds: 120,
          prepTimeSeconds: 10,
          isFree: false,
        },
        {
          type: 'summarize_group_discussion',
          title: 'Summarize Group Discussion #5',
          promptText:
            'Summarize the group conversation about sustainable urban development.',
          promptAudioId: groupDiscussionAudio1.id,
          lessonId: summarizeGroupDiscussion!.id,
          difficulty: 'Medium',
          estimatedSeconds: 120,
          prepTimeSeconds: 10,
          isFree: false,
        },
      ])
      .returning()

    console.log(
      '✅ Created',
      summarizeGroupQuestions.length,
      'Summarize Group Discussion questions'
    )

    // ============================================
    // 4. UPDATE LESSON QUESTION COUNTS
    // ============================================
    console.log('\n📊 Updating lesson question counts...')

    // Update each lesson's question count
    for (const lesson of lessons) {
      const count = await db
        .select({ count: sql<number>`count(*)` })
        .from(speakingQuestions)
        .where(sql`${speakingQuestions.lessonId} = ${lesson.id}`)

      await db
        .update(practiceLessons)
        .set({ questionCount: Number(count[0].count) })
        .where(sql`${practiceLessons.id} = ${lesson.id}`)
    }

    console.log('✅ Updated all lesson question counts\n')

    // ============================================
    // SUMMARY
    // ============================================
    const totalQuestions =
      readAloudQuestions.length +
      repeatSentenceQuestions.length +
      describeImageQuestions.length +
      answerShortQuestions.length +
      summarizeGroupQuestions.length

    console.log('=' .repeat(50))
    console.log('🎉 Seed Completed Successfully!\n')
    console.log('Summary:')
    console.log(`  📁 Media records: 5`)
    console.log(`  📚 Practice lessons: ${lessons.length}`)
    console.log(`  ❓ Speaking questions: ${totalQuestions}`)
    console.log('    - Read Aloud: 10')
    console.log('    - Repeat Sentence: 10')
    console.log('    - Describe Image: 8')
    console.log('    - Answer Short Question: 10')
    console.log('    - Summarize Group Discussion: 5')
    console.log('=' .repeat(50))
  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
  .then(() => {
    console.log('\n✅ Seed script completed')
    process.exit(0)
  })
