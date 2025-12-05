// Mock test data for PTE practice and analytics
// This module provides realistic mock data for testing and demonstration

export interface MockTest {
  id: string
  title: string
  description: string
  section: 'speaking' | 'writing' | 'reading' | 'listening' | 'full'
  difficulty: 'easy' | 'medium' | 'hard'
  questions: MockQuestion[]
  estimatedTime: number // in minutes
  totalPoints: number
  passingScore: number
}

export interface MockQuestion {
  id: string
  type: string
  title: string
  prompt: string
  options?: string[]
  correctAnswer?: string | string[]
  mediaUrl?: string
  points: number
  timeLimit?: number // in seconds
}

// Speaking questions mock data
const speakingMockQuestions: MockQuestion[] = [
  {
    id: 's1',
    type: 'read_aloud',
    title: 'Read Aloud - Academic Text',
    prompt: 'The proliferation of digital technologies has fundamentally transformed the landscape of modern education. Students now have unprecedented access to information, enabling them to explore complex topics beyond the confines of traditional classroom boundaries.',
    points: 5,
    timeLimit: 40,
  },
  {
    id: 's2',
    type: 'repeat_sentence',
    title: 'Repeat Sentence',
    prompt: 'The conference will commence at nine o\'clock sharp on Monday morning.',
    points: 3,
    timeLimit: 15,
  },
  {
    id: 's3',
    type: 'describe_image',
    title: 'Describe Image',
    prompt: 'Describe the image in detail, focusing on the main elements, relationships, and overall message.',
    mediaUrl: '/mock-images/bar-chart.jpg',
    points: 5,
    timeLimit: 40,
  },
  {
    id: 's4',
    type: 'retell_lecture',
    title: 'Retell Lecture',
    prompt: 'Retell the lecture in your own words, covering the main points and supporting details.',
    mediaUrl: '/mock-audio/lecture-sample.mp3',
    points: 5,
    timeLimit: 40,
  },
  {
    id: 's5',
    type: 'answer_short_question',
    title: 'Answer Short Question',
    prompt: 'What is the primary purpose of photosynthesis in plants?',
    points: 1,
    timeLimit: 10,
  },
]

// Writing questions mock data
const writingMockQuestions: MockQuestion[] = [
  {
    id: 'w1',
    type: 'summarize_written_text',
    title: 'Summarize Written Text',
    prompt: `The concept of artificial intelligence has evolved significantly since its inception in the 1950s. Initially, researchers focused on creating machines that could replicate human thinking processes. However, modern AI has shifted towards machine learning and deep learning approaches that can process vast amounts of data to identify patterns and make predictions. This evolution has led to breakthroughs in areas such as natural language processing, computer vision, and autonomous systems. While these advancements offer tremendous potential for solving complex problems, they also raise important questions about the ethical implications of AI deployment and the need for responsible development practices.`,
    points: 10,
    timeLimit: 20,
  },
  {
    id: 'w2',
    type: 'write_essay',
    title: 'Write Essay',
    prompt: 'Do you agree or disagree with the following statement: "Online education is as effective as traditional classroom learning." Use specific reasons and examples to support your answer.',
    points: 20,
    timeLimit: 30,
  },
]

// Reading questions mock data
const readingMockQuestions: MockQuestion[] = [
  {
    id: 'r1',
    type: 'multiple_choice_single',
    title: 'Multiple Choice - Single Answer',
    prompt: 'According to the passage, what is the main factor contributing to climate change?',
    options: [
      'Solar radiation variations',
      'Human activities and greenhouse gas emissions',
      'Natural geological processes',
      'Ocean current changes',
    ],
    correctAnswer: 'Human activities and greenhouse gas emissions',
    points: 1,
    timeLimit: 90,
  },
  {
    id: 'r2',
    type: 'multiple_choice_multiple',
    title: 'Multiple Choice - Multiple Answers',
    prompt: 'Which of the following are benefits of renewable energy? (Select all that apply)',
    options: [
      'Reduces carbon emissions',
      'Creates job opportunities',
      'Eliminates all environmental impact',
      'Provides long-term cost savings',
      'Decreases energy independence',
    ],
    correctAnswer: ['Reduces carbon emissions', 'Creates job opportunities', 'Provides long-term cost savings'],
    points: 2,
    timeLimit: 90,
  },
  {
    id: 'r3',
    type: 'reorder_paragraphs',
    title: 'Reorder Paragraphs',
    prompt: 'Arrange the following sentences to form a coherent paragraph.',
    options: [
      'The first attempts at flight were based on bird observation.',
      'Eventually, the Wright brothers achieved sustained powered flight in 1903.',
      'Early aviation pioneers struggled with control mechanisms.',
      'Modern aircraft rely on sophisticated engineering principles.',
    ],
    correctAnswer: ['The first attempts at flight were based on bird observation.', 'Early aviation pioneers struggled with control mechanisms.', 'Eventually, the Wright brothers achieved sustained powered flight in 1903.', 'Modern aircraft rely on sophisticated engineering principles.'],
    points: 5,
    timeLimit: 120,
  },
  {
    id: 'r4',
    type: 'fill_in_blanks',
    title: 'Fill in the Blanks',
    prompt: 'Complete the passage by filling in the blanks with the correct words from the options provided.',
    options: ['complex', 'simple', 'difficult', 'challenging'],
    correctAnswer: 'complex',
    points: 3,
    timeLimit: 90,
  },
  {
    id: 'r5',
    type: 'reading_writing_fill_blanks',
    title: 'Reading and Writing Fill in the Blanks',
    prompt: 'Complete the summary by filling in the blanks with appropriate words.',
    options: ['analysis', 'data', 'research', 'conclusion', 'methodology', 'results'],
    correctAnswer: ['research', 'methodology', 'data', 'analysis', 'results', 'conclusion'],
    points: 5,
    timeLimit: 120,
  },
]

// Listening questions mock data
const listeningMockQuestions: MockQuestion[] = [
  {
    id: 'l1',
    type: 'summarize_spoken_text',
    title: 'Summarize Spoken Text',
    prompt: 'Summarize the main points from the audio lecture.',
    mediaUrl: '/mock-audio/lecture-sample.mp3',
    points: 10,
    timeLimit: 60,
  },
  {
    id: 'l2',
    type: 'multiple_choice_single',
    title: 'Multiple Choice - Single Answer',
    prompt: 'What does the speaker mention as the primary challenge in urban planning?',
    options: [
      'Budget constraints',
      'Population density management',
      'Environmental regulations',
      'Technology integration',
    ],
    correctAnswer: 'Population density management',
    points: 1,
    timeLimit: 45,
  },
  {
    id: 'l3',
    type: 'multiple_choice_multiple',
    title: 'Multiple Choice - Multiple Answers',
    prompt: 'According to the audio, which factors influence student performance? (Select all that apply)',
    options: [
      'Study habits',
      'Sleep patterns',
      'Social media usage',
      'Nutritional intake',
      'Physical activity',
    ],
    correctAnswer: ['Study habits', 'Sleep patterns', 'Physical activity'],
    points: 2,
    timeLimit: 60,
  },
  {
    id: 'l4',
    type: 'fill_in_blanks',
    title: 'Fill in the Blanks',
    prompt: 'Complete the notes by filling in the missing words.',
    mediaUrl: '/mock-audio/lecture-sample.mp3',
    options: ['hypothesis', 'theory', 'experiment', 'evidence'],
    correctAnswer: 'hypothesis',
    points: 3,
    timeLimit: 60,
  },
  {
    id: 'l5',
    type: 'highlight_correct_summary',
    title: 'Highlight Correct Summary',
    prompt: 'Select the summary that best captures the main idea of the audio passage.',
    options: [
      'The passage discusses various educational methodologies.',
      'The audio focuses on the importance of technology in learning.',
      'The lecture emphasizes the role of critical thinking in problem-solving.',
      'The speaker outlines the history of scientific discovery.',
    ],
    correctAnswer: 'The lecture emphasizes the role of critical thinking in problem-solving.',
    points: 1,
    timeLimit: 45,
  },
  {
    id: 'l6',
    type: 'select_missing_word',
    title: 'Select Missing Word',
    prompt: 'Select the word that best completes the sentence in the audio.',
    mediaUrl: '/mock-audio/lecture-sample.mp3',
    options: ['fundamental', 'basic', 'essential', 'crucial'],
    correctAnswer: 'fundamental',
    points: 1,
    timeLimit: 30,
  },
  {
    id: 'l7',
    type: 'highlight_incorrect_words',
    title: 'Highlight Incorrect Words',
    prompt: 'Identify the words that are different from what you heard in the audio.',
    mediaUrl: '/mock-audio/lecture-sample.mp3',
    options: ['research', 'analysis', 'conclusion', 'discovery'],
    correctAnswer: ['conclusion', 'discovery'],
    points: 2,
    timeLimit: 60,
  },
  {
    id: 'l8',
    type: 'write_from_dictation',
    title: 'Write From Dictation',
    prompt: 'Type the sentence exactly as you hear it.',
    mediaUrl: '/mock-audio/dictation-sample.mp3',
    points: 3,
    timeLimit: 30,
  },
]

// Generate full mock tests
export const mockTests: MockTest[] = [
  {
    id: 'full-mock-1',
    title: 'Complete PTE Academic Practice Test',
    description: 'A comprehensive practice test covering all four sections of the PTE Academic exam.',
    section: 'full',
    difficulty: 'medium',
    estimatedTime: 180,
    totalPoints: 90,
    passingScore: 60,
    questions: [
      ...speakingMockQuestions.slice(0, 3),
      ...writingMockQuestions,
      ...readingMockQuestions.slice(0, 3),
      ...listeningMockQuestions.slice(0, 4),
    ],
  },
  {
    id: 'speaking-practice-1',
    title: 'Speaking Section Practice',
    description: 'Practice all speaking question types with timed exercises.',
    section: 'speaking',
    difficulty: 'medium',
    estimatedTime: 30,
    totalPoints: 19,
    passingScore: 13,
    questions: speakingMockQuestions,
  },
  {
    id: 'writing-practice-1',
    title: 'Writing Section Practice',
    description: 'Practice summarize written text and essay writing with sample prompts.',
    section: 'writing',
    difficulty: 'medium',
    estimatedTime: 50,
    totalPoints: 30,
    passingScore: 20,
    questions: writingMockQuestions,
  },
  {
    id: 'reading-practice-1',
    title: 'Reading Section Practice',
    description: 'Practice all reading question types with various text passages.',
    section: 'reading',
    difficulty: 'medium',
    estimatedTime: 60,
    totalPoints: 16,
    passingScore: 11,
    questions: readingMockQuestions,
  },
  {
    id: 'listening-practice-1',
    title: 'Listening Section Practice',
    description: 'Practice all listening question types with audio materials.',
    section: 'listening',
    difficulty: 'medium',
    estimatedTime: 45,
    totalPoints: 22,
    passingScore: 15,
    questions: listeningMockQuestions,
  },
]

// Generate random mock test data for analytics
export function generateMockTestData(period: 'week' | 'month' | 'year' = 'month') {
  const testResults = []
  const startDate = new Date()
  const endDate = new Date()
  
  // Set date range based on period
  if (period === 'week') {
    startDate.setDate(startDate.getDate() - 7)
  } else if (period === 'month') {
    startDate.setMonth(startDate.getMonth() - 1)
  } else {
    startDate.setFullYear(startDate.getFullYear() - 1)
  }
  
  // Generate 20-50 test results
  const testCount = Math.floor(Math.random() * 30) + 20
  
  for (let i = 0; i < testCount; i++) {
    const testDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()))
    const test = mockTests[Math.floor(Math.random() * mockTests.length)]
    
    testResults.push({
      id: `mock-${i + 1}`,
      testId: test.id,
      testTitle: test.title,
      date: testDate,
      speakingScore: Math.floor(Math.random() * 40) + 40, // 40-80
      writingScore: Math.floor(Math.random() * 40) + 40, // 40-80
      readingScore: Math.floor(Math.random() * 40) + 40, // 40-80
      listeningScore: Math.floor(Math.random() * 40) + 40, // 40-80
      overallScore: Math.floor(Math.random() * 40) + 40, // 40-80
      timeSpent: Math.floor(Math.random() * 60) + 120, // 120-180 minutes
      completed: Math.random() > 0.1, // 90% completion rate
    })
  }
  
  return testResults.sort((a, b) => b.date.getTime() - a.date.getTime())
}

// Generate performance analytics
export function generatePerformanceAnalytics(period: 'week' | 'month' | 'year' = 'month') {
  const testResults = generateMockTestData(period)
  
  const totalTests = testResults.length
  const completedTests = testResults.filter(t => t.completed).length
  const averageScore = testResults.reduce((sum, t) => sum + t.overallScore, 0) / totalTests
  const bestScore = Math.max(...testResults.map(t => t.overallScore))
  const improvementTrend = testResults.slice(0, Math.floor(totalTests / 2)).reduce((sum, t) => sum + t.overallScore, 0) / Math.floor(totalTests / 2) - 
                          testResults.slice(Math.floor(totalTests / 2)).reduce((sum, t) => sum + t.overallScore, 0) / (totalTests - Math.floor(totalTests / 2))
  
  return {
    period,
    totalTests,
    completedTests,
    averageScore: Math.round(averageScore),
    bestScore,
    improvementTrend: Math.round(improvementTrend * 100) / 100,
    testResults: testResults,
    weeklyProgress: generateWeeklyProgress(),
    sectionBreakdown: generateSectionBreakdown(testResults),
  }
}

function generateWeeklyProgress() {
  const weeks = []
  for (let i = 0; i < 12; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (i * 7))
    weeks.unshift({
      week: `Week ${12 - i}`,
      date: date.toISOString().split('T')[0],
      averageScore: Math.floor(Math.random() * 20) + 60, // 60-80
      testCount: Math.floor(Math.random() * 5) + 1, // 1-5 tests
    })
  }
  return weeks
}

function generateSectionBreakdown(testResults: any[]) {
  const speakingScores = testResults.map(t => t.speakingScore).filter(Boolean)
  const writingScores = testResults.map(t => t.writingScore).filter(Boolean)
  const readingScores = testResults.map(t => t.readingScore).filter(Boolean)
  const listeningScores = testResults.map(t => t.listeningScore).filter(Boolean)
  
  return {
    speaking: {
      average: speakingScores.length > 0 ? Math.round(speakingScores.reduce((a, b) => a + b, 0) / speakingScores.length) : 0,
      attempts: speakingScores.length,
    },
    writing: {
      average: writingScores.length > 0 ? Math.round(writingScores.reduce((a, b) => a + b, 0) / writingScores.length) : 0,
      attempts: writingScores.length,
    },
    reading: {
      average: readingScores.length > 0 ? Math.round(readingScores.reduce((a, b) => a + b, 0) / readingScores.length) : 0,
      attempts: readingScores.length,
    },
    listening: {
      average: listeningScores.length > 0 ? Math.round(listeningScores.reduce((a, b) => a + b, 0) / listeningScores.length) : 0,
      attempts: listeningScores.length,
    },
  }
}

// Export specific mock test data for development
export { speakingMockQuestions, writingMockQuestions, readingMockQuestions, listeningMockQuestions }