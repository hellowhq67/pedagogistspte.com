/**
 * Seed Script: Writing Module Practice Lessons
 *
 * Creates:
 * - 6 lessons (2 types × 3 lessons each)
 * - 30 questions total (5 per lesson)
 * - 2 FREE lessons (one per type)
 *
 * Usage: pnpm tsx scripts/seed-writing-lessons.ts
 */

import { db } from '../lib/db'
import { practiceLessons, writingQuestions } from '../lib/db'
import { sql } from 'drizzle-orm'

async function main() {
  console.log('🌱 Seeding Writing Module...\n')

  try {
    // Create Lessons
    console.log('📚 Creating writing lessons...')

    const lessons = await db
      .insert(practiceLessons)
      .values([
        // Summarize Written Text
        {
          title: 'Summarize Written Text - Academic Passages',
          description: 'Practice summarizing academic texts in one sentence (50-70 words)',
          lessonNumber: 16,
          module: 'writing',
          questionType: 'summarize_written_text',
          isFree: true,
          requiredTier: 'free_trial',
          difficulty: 'Easy',
          estimatedMinutes: 25,
          orderIndex: 1,
          slug: 'swt-academic-passages',
        },
        {
          title: 'Summarize Written Text - Scientific Articles',
          description: 'Master summarizing complex scientific content concisely',
          lessonNumber: 17,
          module: 'writing',
          questionType: 'summarize_written_text',
          isFree: false,
          requiredTier: 'pro',
          difficulty: 'Medium',
          estimatedMinutes: 30,
          orderIndex: 2,
          slug: 'swt-scientific-articles',
        },
        {
          title: 'Summarize Written Text - Social Issues',
          description: 'Summarize texts on contemporary social topics',
          lessonNumber: 18,
          module: 'writing',
          questionType: 'summarize_written_text',
          isFree: false,
          requiredTier: 'pro',
          difficulty: 'Medium',
          estimatedMinutes: 30,
          orderIndex: 3,
          slug: 'swt-social-issues',
        },

        // Write Essay
        {
          title: 'Write Essay - Opinion Essays',
          description: 'Learn to write clear opinion essays (200-300 words)',
          lessonNumber: 19,
          module: 'writing',
          questionType: 'write_essay',
          isFree: true,
          requiredTier: 'free_trial',
          difficulty: 'Easy',
          estimatedMinutes: 30,
          orderIndex: 4,
          slug: 'essay-opinion',
        },
        {
          title: 'Write Essay - Argument Essays',
          description: 'Develop skills in presenting and supporting arguments',
          lessonNumber: 20,
          module: 'writing',
          questionType: 'write_essay',
          isFree: false,
          requiredTier: 'pro',
          difficulty: 'Medium',
          estimatedMinutes: 35,
          orderIndex: 5,
          slug: 'essay-argument',
        },
        {
          title: 'Write Essay - Problem-Solution Essays',
          description: 'Master the problem-solution essay structure',
          lessonNumber: 21,
          module: 'writing',
          questionType: 'write_essay',
          isFree: false,
          requiredTier: 'pro',
          difficulty: 'Hard',
          estimatedMinutes: 35,
          orderIndex: 6,
          slug: 'essay-problem-solution',
        },
      ])
      .returning()

    console.log(`✅ Created ${lessons.length} writing lessons\n`)

    // Get specific lessons
    const swtAcademic = lessons.find(l => l.slug === 'swt-academic-passages')!
    const swtScientific = lessons.find(l => l.slug === 'swt-scientific-articles')!
    const swtSocial = lessons.find(l => l.slug === 'swt-social-issues')!
    const essayOpinion = lessons.find(l => l.slug === 'essay-opinion')!
    const essayArgument = lessons.find(l => l.slug === 'essay-argument')!
    const essayProblem = lessons.find(l => l.slug === 'essay-problem-solution')!

    // Create Questions
    console.log('❓ Creating writing questions...')

    // SUMMARIZE WRITTEN TEXT - Academic Passages (5q)
    const swtAcademicQuestions = await db
      .insert(writingQuestions)
      .values([
        {
          type: 'summarize_written_text',
          title: 'SWT #1 - Climate Change Impact',
          promptText: 'Climate change represents one of the most significant challenges facing humanity in the 21st century. Rising global temperatures, caused primarily by greenhouse gas emissions from human activities, are leading to widespread environmental changes. These include melting polar ice caps, rising sea levels, and more frequent extreme weather events. The scientific consensus is clear: immediate action is needed to reduce emissions and transition to renewable energy sources to mitigate the worst effects of climate change and protect future generations.',
          lessonId: swtAcademic.id,
          difficulty: 'Easy',
          minWords: 50,
          maxWords: 70,
          timeLimit: 600,
          isFree: true,
        },
        {
          type: 'summarize_written_text',
          title: 'SWT #2 - Digital Technology in Education',
          promptText: 'The integration of digital technology in education has transformed traditional teaching methods and learning experiences. Interactive whiteboards, tablets, and online learning platforms enable more engaging and personalized instruction. Students can access vast amounts of information instantly and collaborate with peers globally. However, this shift also presents challenges, including the digital divide between students with varying levels of technology access and concerns about screen time and its impact on child development.',
          lessonId: swtAcademic.id,
          difficulty: 'Easy',
          minWords: 50,
          maxWords: 70,
          timeLimit: 600,
          isFree: true,
        },
        {
          type: 'summarize_written_text',
          title: 'SWT #3 - Urbanization Trends',
          promptText: 'Rapid urbanization is reshaping cities worldwide, with more than half of the global population now living in urban areas. This trend brings both opportunities and challenges. Cities offer better access to employment, education, and healthcare services. However, rapid urban growth also strains infrastructure, increases pollution, and can exacerbate social inequality. Sustainable urban planning is essential to ensure cities remain livable while accommodating growing populations.',
          lessonId: swtAcademic.id,
          difficulty: 'Easy',
          minWords: 50,
          maxWords: 70,
          timeLimit: 600,
          isFree: true,
        },
        {
          type: 'summarize_written_text',
          title: 'SWT #4 - Renewable Energy Sources',
          promptText: 'Renewable energy sources, including solar, wind, and hydroelectric power, are becoming increasingly important in the global effort to reduce carbon emissions and combat climate change. Unlike fossil fuels, renewable sources produce little to no greenhouse gas emissions during operation. Advances in technology have made renewable energy more efficient and cost-effective. Governments worldwide are investing in renewable infrastructure to achieve energy independence and meet climate targets.',
          lessonId: swtAcademic.id,
          difficulty: 'Easy',
          minWords: 50,
          maxWords: 70,
          timeLimit: 600,
          isFree: true,
        },
        {
          type: 'summarize_written_text',
          title: 'SWT #5 - Biodiversity Conservation',
          promptText: 'Biodiversity conservation is crucial for maintaining healthy ecosystems and ensuring the survival of countless species. Human activities such as deforestation, pollution, and climate change threaten biodiversity worldwide. Protected areas, wildlife corridors, and sustainable resource management practices help preserve natural habitats. Conservation efforts not only protect endangered species but also maintain ecosystem services that humans depend on, including clean air, water, and food security.',
          lessonId: swtAcademic.id,
          difficulty: 'Easy',
          minWords: 50,
          maxWords: 70,
          timeLimit: 600,
          isFree: true,
        },
      ])
      .returning()

    console.log(`✅ Created ${swtAcademicQuestions.length} SWT Academic questions`)

    // SUMMARIZE WRITTEN TEXT - Scientific (5q)
    const swtScientificQuestions = await db
      .insert(writingQuestions)
      .values([
        {
          type: 'summarize_written_text',
          title: 'SWT #6 - Quantum Computing',
          promptText: 'Quantum computing represents a paradigm shift in computational power, utilizing quantum mechanical phenomena such as superposition and entanglement to process information. Unlike classical computers that use bits representing either 0 or 1, quantum computers use quantum bits or qubits that can exist in multiple states simultaneously. This allows quantum computers to solve certain complex problems exponentially faster than classical computers, with potential applications in cryptography, drug discovery, and artificial intelligence.',
          lessonId: swtScientific.id,
          difficulty: 'Medium',
          minWords: 50,
          maxWords: 70,
          timeLimit: 600,
          isFree: false,
        },
        {
          type: 'summarize_written_text',
          title: 'SWT #7 - Gene Editing Technology',
          promptText: 'CRISPR-Cas9 gene editing technology has revolutionized genetic research by enabling precise modifications to DNA sequences. This powerful tool allows scientists to add, remove, or alter genetic material with unprecedented accuracy and efficiency. Applications range from treating genetic diseases to improving crop resistance and productivity. However, the technology also raises ethical concerns about human genetic modification and the potential for unintended consequences in ecosystems.',
          lessonId: swtScientific.id,
          difficulty: 'Medium',
          minWords: 50,
          maxWords: 70,
          timeLimit: 600,
          isFree: false,
        },
        {
          type: 'summarize_written_text',
          title: 'SWT #8 - Neuroplasticity Research',
          promptText: 'Recent neuroplasticity research has revealed that the human brain possesses remarkable capacity to reorganize itself throughout life. Neural pathways can strengthen or weaken based on experiences and behaviors, challenging previous beliefs about fixed brain structure. This discovery has significant implications for rehabilitation after brain injury, learning strategies, and understanding mental health disorders. Regular mental stimulation and physical exercise can promote positive neuroplastic changes.',
          lessonId: swtScientific.id,
          difficulty: 'Medium',
          minWords: 50,
          maxWords: 70,
          timeLimit: 600,
          isFree: false,
        },
        {
          type: 'summarize_written_text',
          title: 'SWT #9 - Microbiome Science',
          promptText: 'The human microbiome, consisting of trillions of microorganisms living in and on the body, plays a crucial role in health and disease. Research has linked microbiome composition to immune function, mental health, metabolism, and susceptibility to various diseases. Diet, antibiotics, and lifestyle factors significantly influence microbiome diversity. Understanding these complex relationships may lead to new therapeutic approaches for treating conditions from obesity to depression.',
          lessonId: swtScientific.id,
          difficulty: 'Medium',
          minWords: 50,
          maxWords: 70,
          timeLimit: 600,
          isFree: false,
        },
        {
          type: 'summarize_written_text',
          title: 'SWT #10 - Dark Matter Investigation',
          promptText: 'Dark matter comprises approximately 85% of the matter in the universe, yet remains invisible and undetectable by conventional means. Scientists infer its existence through gravitational effects on visible matter and the structure of galaxies. Various experiments worldwide attempt to directly detect dark matter particles. Understanding dark matter is essential for explaining galaxy formation, cosmic structure evolution, and fundamental physics beyond the Standard Model.',
          lessonId: swtScientific.id,
          difficulty: 'Medium',
          minWords: 50,
          maxWords: 70,
          timeLimit: 600,
          isFree: false,
        },
      ])
      .returning()

    console.log(`✅ Created ${swtScientificQuestions.length} SWT Scientific questions`)

    // SUMMARIZE WRITTEN TEXT - Social Issues (5q)
    const swtSocialQuestions = await db
      .insert(writingQuestions)
      .values([
        {
          type: 'summarize_written_text',
          title: 'SWT #11 - Remote Work Revolution',
          promptText: 'The COVID-19 pandemic accelerated the adoption of remote work, fundamentally changing workplace dynamics and employee expectations. Many organizations discovered that remote work can maintain or increase productivity while reducing overhead costs. Employees appreciate the flexibility and improved work-life balance. However, challenges include maintaining team cohesion, managing communication across time zones, and ensuring equitable opportunities for remote and in-office workers.',
          lessonId: swtSocial.id,
          difficulty: 'Medium',
          minWords: 50,
          maxWords: 70,
          timeLimit: 600,
          isFree: false,
        },
        {
          type: 'summarize_written_text',
          title: 'SWT #12 - Social Media Influence',
          promptText: 'Social media platforms have transformed how people communicate, access information, and form opinions. While enabling unprecedented global connectivity and democratizing content creation, these platforms also raise concerns about privacy, misinformation, and mental health impacts. The algorithms that curate content can create echo chambers, reinforcing existing beliefs and polarizing communities. Balancing free expression with content moderation remains a significant challenge.',
          lessonId: swtSocial.id,
          difficulty: 'Medium',
          minWords: 50,
          maxWords: 70,
          timeLimit: 600,
          isFree: false,
        },
        {
          type: 'summarize_written_text',
          title: 'SWT #13 - Income Inequality',
          promptText: 'Income inequality has increased significantly in many countries over recent decades, with wealth concentrated among a small percentage of the population. This disparity affects access to education, healthcare, and economic opportunities, potentially hindering social mobility. Factors contributing to inequality include globalization, technological change, and policy decisions. Addressing inequality requires comprehensive approaches including progressive taxation, education investment, and labor market reforms.',
          lessonId: swtSocial.id,
          difficulty: 'Medium',
          minWords: 50,
          maxWords: 70,
          timeLimit: 600,
          isFree: false,
        },
        {
          type: 'summarize_written_text',
          title: 'SWT #14 - Aging Population Challenges',
          promptText: 'Many developed countries face challenges associated with aging populations, including increased healthcare costs, pension sustainability, and labor force shortages. As life expectancy rises and birth rates decline, the proportion of elderly citizens grows. This demographic shift requires adaptations in healthcare systems, retirement policies, and urban planning. However, older adults also represent valuable experience and wisdom that societies should leverage through flexible retirement options.',
          lessonId: swtSocial.id,
          difficulty: 'Medium',
          minWords: 50,
          maxWords: 70,
          timeLimit: 600,
          isFree: false,
        },
        {
          type: 'summarize_written_text',
          title: 'SWT #15 - Sustainable Consumption',
          promptText: 'Sustainable consumption involves making purchasing decisions that minimize environmental impact and promote social responsibility. Consumers increasingly consider factors beyond price and quality, including carbon footprint, ethical labor practices, and packaging waste. Businesses respond by adopting sustainable practices and transparent supply chains. However, challenges include greenwashing, affordability of sustainable products, and the need for systemic changes beyond individual consumer choices.',
          lessonId: swtSocial.id,
          difficulty: 'Medium',
          minWords: 50,
          maxWords: 70,
          timeLimit: 600,
          isFree: false,
        },
      ])
      .returning()

    console.log(`✅ Created ${swtSocialQuestions.length} SWT Social Issues questions`)

    // WRITE ESSAY - Opinion (5q)
    const essayOpinionQuestions = await db
      .insert(writingQuestions)
      .values([
        {
          type: 'write_essay',
          title: 'Essay #1 - Online Education vs Traditional',
          promptText: 'Some people believe that online education is as effective as traditional classroom learning, while others argue that face-to-face interaction is essential for quality education. Discuss both views and give your opinion.',
          lessonId: essayOpinion.id,
          difficulty: 'Easy',
          minWords: 200,
          maxWords: 300,
          timeLimit: 1200,
          isFree: true,
        },
        {
          type: 'write_essay',
          title: 'Essay #2 - Work-Life Balance',
          promptText: 'In modern society, achieving work-life balance has become increasingly difficult. Do you agree or disagree with this statement? Provide reasons and examples to support your opinion.',
          lessonId: essayOpinion.id,
          difficulty: 'Easy',
          minWords: 200,
          maxWords: 300,
          timeLimit: 1200,
          isFree: true,
        },
        {
          type: 'write_essay',
          title: 'Essay #3 - Public Transportation',
          promptText: 'Many cities are investing heavily in public transportation to reduce traffic congestion and pollution. To what extent do you think this is a positive development? Explain your viewpoint with relevant examples.',
          lessonId: essayOpinion.id,
          difficulty: 'Easy',
          minWords: 200,
          maxWords: 300,
          timeLimit: 1200,
          isFree: true,
        },
        {
          type: 'write_essay',
          title: 'Essay #4 - Social Media Impact',
          promptText: 'Social media has both positive and negative effects on society. In your opinion, do the advantages outweigh the disadvantages? Support your answer with specific examples.',
          lessonId: essayOpinion.id,
          difficulty: 'Easy',
          minWords: 200,
          maxWords: 300,
          timeLimit: 1200,
          isFree: true,
        },
        {
          type: 'write_essay',
          title: 'Essay #5 - Healthy Lifestyle',
          promptText: 'Some people argue that individuals are responsible for their own health, while others believe governments should regulate unhealthy products. What is your opinion on this issue?',
          lessonId: essayOpinion.id,
          difficulty: 'Easy',
          minWords: 200,
          maxWords: 300,
          timeLimit: 1200,
          isFree: true,
        },
      ])
      .returning()

    console.log(`✅ Created ${essayOpinionQuestions.length} Essay Opinion questions`)

    // WRITE ESSAY - Argument (5q)
    const essayArgumentQuestions = await db
      .insert(writingQuestions)
      .values([
        {
          type: 'write_essay',
          title: 'Essay #6 - University Education Value',
          promptText: 'Some argue that university education should be free for all students, while others believe students should pay fees. Present arguments for both sides and state which viewpoint you support.',
          lessonId: essayArgument.id,
          difficulty: 'Medium',
          minWords: 200,
          maxWords: 300,
          timeLimit: 1200,
          isFree: false,
        },
        {
          type: 'write_essay',
          title: 'Essay #7 - Environmental Responsibility',
          promptText: 'Who should take primary responsibility for protecting the environment: individuals, businesses, or governments? Present arguments and justify your position with examples.',
          lessonId: essayArgument.id,
          difficulty: 'Medium',
          minWords: 200,
          maxWords: 300,
          timeLimit: 1200,
          isFree: false,
        },
        {
          type: 'write_essay',
          title: 'Essay #8 - Technology and Employment',
          promptText: 'Automation and artificial intelligence are replacing many jobs. Some view this as progress, others see it as a threat. Analyze both perspectives and present your stance.',
          lessonId: essayArgument.id,
          difficulty: 'Medium',
          minWords: 200,
          maxWords: 300,
          timeLimit: 1200,
          isFree: false,
        },
        {
          type: 'write_essay',
          title: 'Essay #9 - Cultural Preservation',
          promptText: 'Globalization threatens local cultures and traditions. Should societies prioritize preserving their cultural identity or embrace global integration? Discuss both views.',
          lessonId: essayArgument.id,
          difficulty: 'Medium',
          minWords: 200,
          maxWords: 300,
          timeLimit: 1200,
          isFree: false,
        },
        {
          type: 'write_essay',
          title: 'Essay #10 - Privacy vs Security',
          promptText: 'Increased surveillance can enhance public safety but may compromise individual privacy. Which is more important in modern society? Present arguments for both sides.',
          lessonId: essayArgument.id,
          difficulty: 'Medium',
          minWords: 200,
          maxWords: 300,
          timeLimit: 1200,
          isFree: false,
        },
      ])
      .returning()

    console.log(`✅ Created ${essayArgumentQuestions.length} Essay Argument questions`)

    // WRITE ESSAY - Problem-Solution (5q)
    const essayProblemQuestions = await db
      .insert(writingQuestions)
      .values([
        {
          type: 'write_essay',
          title: 'Essay #11 - Traffic Congestion',
          promptText: 'Traffic congestion is a major problem in many cities worldwide. What are the causes of this problem, and what solutions can you suggest to address it?',
          lessonId: essayProblem.id,
          difficulty: 'Hard',
          minWords: 200,
          maxWords: 300,
          timeLimit: 1200,
          isFree: false,
        },
        {
          type: 'write_essay',
          title: 'Essay #12 - Youth Unemployment',
          promptText: 'Youth unemployment rates remain high in many countries. Identify the main causes of this issue and propose practical solutions that governments and businesses could implement.',
          lessonId: essayProblem.id,
          difficulty: 'Hard',
          minWords: 200,
          maxWords: 300,
          timeLimit: 1200,
          isFree: false,
        },
        {
          type: 'write_essay',
          title: 'Essay #13 - Plastic Pollution',
          promptText: 'Plastic pollution in oceans threatens marine ecosystems. Discuss the reasons for this problem and suggest effective measures to reduce plastic waste.',
          lessonId: essayProblem.id,
          difficulty: 'Hard',
          minWords: 200,
          maxWords: 300,
          timeLimit: 1200,
          isFree: false,
        },
        {
          type: 'write_essay',
          title: 'Essay #14 - Declining Reading Habits',
          promptText: 'Reading habits, especially among young people, have declined significantly. What factors contribute to this trend, and what can be done to encourage more reading?',
          lessonId: essayProblem.id,
          difficulty: 'Hard',
          minWords: 200,
          maxWords: 300,
          timeLimit: 1200,
          isFree: false,
        },
        {
          type: 'write_essay',
          title: 'Essay #15 - Healthcare Access',
          promptText: 'Many people in developing countries lack access to quality healthcare. Analyze the causes of this problem and propose solutions that could improve healthcare accessibility.',
          lessonId: essayProblem.id,
          difficulty: 'Hard',
          minWords: 200,
          maxWords: 300,
          timeLimit: 1200,
          isFree: false,
        },
      ])
      .returning()

    console.log(`✅ Created ${essayProblemQuestions.length} Essay Problem-Solution questions`)

    // Update lesson question counts
    console.log('\n📊 Updating lesson question counts...')
    for (const lesson of lessons) {
      const count = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM writing_questions
        WHERE lesson_id = ${lesson.id}
      `)

      await db.execute(sql`
        UPDATE practice_lessons
        SET question_count = ${Number(count.rows[0].count)}
        WHERE id = ${lesson.id}
      `)
    }

    console.log('✅ Updated all lesson question counts\n')

    // Summary
    const totalQuestions =
      swtAcademicQuestions.length +
      swtScientificQuestions.length +
      swtSocialQuestions.length +
      essayOpinionQuestions.length +
      essayArgumentQuestions.length +
      essayProblemQuestions.length

    console.log('='.repeat(60))
    console.log('🎉 Writing Module Seed Completed!\n')
    console.log('Summary:')
    console.log(`  📚 Lessons created: ${lessons.length}`)
    console.log(`  ❓ Questions created: ${totalQuestions}`)
    console.log('    - SWT Academic: 5 (FREE)')
    console.log('    - SWT Scientific: 5')
    console.log('    - SWT Social: 5')
    console.log('    - Essay Opinion: 5 (FREE)')
    console.log('    - Essay Argument: 5')
    console.log('    - Essay Problem-Solution: 5')
    console.log('='.repeat(60))

  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  }
}

main()
  .then(() => {
    console.log('\n✅ Writing module seed completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
