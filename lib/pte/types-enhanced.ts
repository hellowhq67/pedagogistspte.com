/**
 * Enhanced Type Definitions for PTE Question System
 *
 * These types support the new universal question list and detail pages
 * with community statistics and enhanced features.
 */

export type PTEModule = 'speaking' | 'reading' | 'writing' | 'listening'

export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export type QuestionStatus = 'all' | 'new' | 'practiced' | 'bookmarked'

export type SortField = 'number' | 'title' | 'difficulty' | 'practiceCount' | 'averageScore' | 'lastAttempt'

export type SortOrder = 'asc' | 'desc'

export type ViewMode = 'table' | 'grid'

/**
 * Question with enhanced statistics for list views
 */
export interface QuestionWithStats {
  id: string
  title: string
  promptText: string // Made required
  promptPreview: string // First 100 chars for table display
  type: string
  difficulty: Difficulty
  bookmarked: boolean
  isActive: boolean
  audioUrl?: string // Added optional audioUrl

  // User-specific stats
  userPracticeCount: number
  userAverageScore: number | null
  userBestScore: number | null
  lastAttemptDate: string | null

  // Community stats
  communityPracticeCount: number
  communityAverageScore: number | null
  uniqueUsersCount: number

  // Metadata
  tags?: string[]
  estimatedMinutes?: number
  createdAt: string
  updatedAt: string
}

/**
 * Question detail with comprehensive statistics for the Question Details Page
 */
export interface QuestionDetailsPageProps {
  question: QuestionWithStats

  stats: {
    totalAttempts: number
    uniqueUsers: number
    averageScore: number | null
    medianScore: number | null
    scoreDistribution: {
      range: string
      count: number
      percentage: number
    }[]
    difficultyRating: {
      veryEasy: number
      easy: number
      medium: number
      hard: number
      veryHard: number
    }
  }

  userStats: {
    attemptCount: number
    bestScore: number | null
    averageScore: number | null
    worstScore: number | null
    lastAttemptDate: string | null
    improvement: number | null // Percentage improvement from first to last
  }

  // Navigation
  navigation?: {
    prevId: string | null
    nextId: string | null
    prevTitle?: string
    nextTitle?: string
  }
}

/**
 * Props for Universal Question Page Component
 */
export interface UniversalQuestionPageComponentProps {
  module: PTEModule
  questionType: string
  question: QuestionWithStats // Use QuestionWithStats here
  instructions: QuestionInstructions
  children: React.ReactNode // Practice area content
  showSidebar?: boolean
  onBookmarkToggle?: (questionId: string, bookmarked: boolean) => Promise<void>
  onNext?: () => void
  onPrevious?: () => void
}
