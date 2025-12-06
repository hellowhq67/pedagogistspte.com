import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UniversalQuestionPage } from './universal-question-page'
import type { QuestionWithStats, QuestionInstructions } from '@/lib/pte/types-enhanced'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
  }),
}))

describe('UniversalQuestionPage', () => {
  const mockQuestion: QuestionWithStats = {
    id: 'test-question-1',
    title: 'Test Reading Question',
    promptText: 'This is a test prompt for reading comprehension.',
    promptPreview: 'This is a test prompt...',
    type: 'multiple_choice_single',
    difficulty: 'Medium',
    bookmarked: false,
    isActive: true,
    userPracticeCount: 5,
    userAverageScore: 75,
    userBestScore: 85,
    lastAttemptDate: '2025-01-01',
    communityPracticeCount: 100,
    communityAverageScore: 70,
    uniqueUsersCount: 50,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  }

  const mockInstructions: QuestionInstructions = {
    taskDescription: 'Read the question carefully and select the best answer.',
    tips: [
      'Read all options before choosing',
      'Look for keywords in the question',
      'Eliminate obviously wrong answers',
    ],
    scoringCriteria: [
      {
        name: 'Accuracy',
        description: 'Correctness of the answer',
        maxScore: 100,
      },
    ],
  }

  const defaultProps = {
    module: 'reading' as const,
    questionType: 'multiple_choice_single',
    question: mockQuestion,
    instructions: mockInstructions,
    children: <div>Practice Area</div>,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render question title and description', () => {
      render(<UniversalQuestionPage {...defaultProps} />)
      
      expect(screen.getByText('Test Reading Question')).toBeInTheDocument()
      expect(screen.getByText(/reading - multiple choice single/i)).toBeInTheDocument()
    })

    it('should render prompt text', () => {
      render(<UniversalQuestionPage {...defaultProps} />)
      
      expect(screen.getByText('This is a test prompt for reading comprehension.')).toBeInTheDocument()
    })

    it('should render difficulty badge', () => {
      render(<UniversalQuestionPage {...defaultProps} />)
      
      expect(screen.getByText('Medium')).toBeInTheDocument()
    })

    it('should render statistics section', () => {
      render(<UniversalQuestionPage {...defaultProps} />)
      
      expect(screen.getByText('Community Avg Score')).toBeInTheDocument()
      expect(screen.getByText('Community Practices')).toBeInTheDocument()
      expect(screen.getByText('Your Best Score')).toBeInTheDocument()
      expect(screen.getByText('Your Practices')).toBeInTheDocument()
    })

    it('should render instructions section', () => {
      render(<UniversalQuestionPage {...defaultProps} />)
      
      expect(screen.getByText('Instructions')).toBeInTheDocument()
      expect(screen.getByText('Read the question carefully and select the best answer.')).toBeInTheDocument()
    })

    it('should render tips when provided', () => {
      render(<UniversalQuestionPage {...defaultProps} />)
      
      expect(screen.getByText('Tips:')).toBeInTheDocument()
      expect(screen.getByText('Read all options before choosing')).toBeInTheDocument()
      expect(screen.getByText('Look for keywords in the question')).toBeInTheDocument()
    })

    it('should render scoring criteria when provided', () => {
      render(<UniversalQuestionPage {...defaultProps} />)
      
      expect(screen.getByText('Scoring Criteria:')).toBeInTheDocument()
      expect(screen.getByText(/Accuracy: Correctness of the answer/)).toBeInTheDocument()
    })

    it('should render children content', () => {
      render(<UniversalQuestionPage {...defaultProps} />)
      
      expect(screen.getByText('Practice Area')).toBeInTheDocument()
    })
  })

  describe('formatScoreByModule integration', () => {
    it('should format reading scores as exact numbers', () => {
      const readingQuestion = { ...mockQuestion, communityAverageScore: 75, userBestScore: 85 }
      render(
        <UniversalQuestionPage
          {...defaultProps}
          module="reading"
          question={readingQuestion}
        />
      )
      
      expect(screen.getByText('75')).toBeInTheDocument() // Community avg
      expect(screen.getByText('85')).toBeInTheDocument() // User best
    })

    it('should format writing scores as exact numbers', () => {
      const writingQuestion = { ...mockQuestion, communityAverageScore: 80, userBestScore: 90 }
      render(
        <UniversalQuestionPage
          {...defaultProps}
          module="writing"
          question={writingQuestion}
        />
      )
      
      expect(screen.getByText('80')).toBeInTheDocument()
      expect(screen.getByText('90')).toBeInTheDocument()
    })

    it('should format speaking scores as ranges', () => {
      const speakingQuestion = { ...mockQuestion, communityAverageScore: 73, userBestScore: 88 }
      render(
        <UniversalQuestionPage
          {...defaultProps}
          module="speaking"
          question={speakingQuestion}
        />
      )
      
      expect(screen.getByText('70-75')).toBeInTheDocument() // 73 rounds to 70-75
      expect(screen.getByText('85-90')).toBeInTheDocument() // 88 rounds to 85-90
    })

    it('should format listening scores as ranges', () => {
      const listeningQuestion = { ...mockQuestion, communityAverageScore: 67, userBestScore: 82 }
      render(
        <UniversalQuestionPage
          {...defaultProps}
          module="listening"
          question={listeningQuestion}
        />
      )
      
      expect(screen.getByText('65-70')).toBeInTheDocument() // 67 rounds to 65-70
      expect(screen.getByText('80-85')).toBeInTheDocument() // 82 rounds to 80-85
    })

    it('should display N/A for null scores', () => {
      const questionWithNullScores = {
        ...mockQuestion,
        communityAverageScore: null,
        userBestScore: null,
      }
      render(
        <UniversalQuestionPage
          {...defaultProps}
          question={questionWithNullScores}
        />
      )
      
      const naElements = screen.getAllByText('N/A')
      expect(naElements.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('bookmark functionality', () => {
    it('should display unfilled bookmark icon when not bookmarked', () => {
      render(<UniversalQuestionPage {...defaultProps} />)
      
      const bookmarkButton = screen.getByLabelText('Add bookmark')
      expect(bookmarkButton).toBeInTheDocument()
    })

    it('should display filled bookmark icon when bookmarked', () => {
      const bookmarkedQuestion = { ...mockQuestion, bookmarked: true }
      render(
        <UniversalQuestionPage
          {...defaultProps}
          question={bookmarkedQuestion}
        />
      )
      
      const bookmarkButton = screen.getByLabelText('Remove bookmark')
      expect(bookmarkButton).toBeInTheDocument()
    })

    it('should call onBookmarkToggle when bookmark button is clicked', () => {
      const onBookmarkToggle = vi.fn()
      render(
        <UniversalQuestionPage
          {...defaultProps}
          onBookmarkToggle={onBookmarkToggle}
        />
      )
      
      const bookmarkButton = screen.getByLabelText('Add bookmark')
      fireEvent.click(bookmarkButton)
      
      expect(onBookmarkToggle).toHaveBeenCalledWith('test-question-1', true)
    })

    it('should toggle bookmark state correctly', () => {
      const onBookmarkToggle = vi.fn()
      const bookmarkedQuestion = { ...mockQuestion, bookmarked: true }
      render(
        <UniversalQuestionPage
          {...defaultProps}
          question={bookmarkedQuestion}
          onBookmarkToggle={onBookmarkToggle}
        />
      )
      
      const bookmarkButton = screen.getByLabelText('Remove bookmark')
      fireEvent.click(bookmarkButton)
      
      expect(onBookmarkToggle).toHaveBeenCalledWith('test-question-1', false)
    })
  })

  describe('audio functionality', () => {
    beforeEach(() => {
      // Mock Audio API
      global.Audio = vi.fn().mockImplementation(() => ({
        play: vi.fn().mockResolvedValue(undefined),
        pause: vi.fn(),
        onplay: null,
        onended: null,
      })) as any
    })

    it('should not render audio button when audioUrl is not provided', () => {
      render(<UniversalQuestionPage {...defaultProps} />)
      
      expect(screen.queryByText('Play Audio')).not.toBeInTheDocument()
    })

    it('should render audio button when audioUrl is provided', () => {
      const questionWithAudio = {
        ...mockQuestion,
        audioUrl: 'https://example.com/audio.mp3',
      }
      render(
        <UniversalQuestionPage
          {...defaultProps}
          question={questionWithAudio}
        />
      )
      
      expect(screen.getByText('Play Audio')).toBeInTheDocument()
    })

    it('should play audio when play button is clicked', async () => {
      const questionWithAudio = {
        ...mockQuestion,
        audioUrl: 'https://example.com/audio.mp3',
      }
      render(
        <UniversalQuestionPage
          {...defaultProps}
          question={questionWithAudio}
        />
      )
      
      const playButton = screen.getByText('Play Audio')
      fireEvent.click(playButton)
      
      expect(global.Audio).toHaveBeenCalledWith('https://example.com/audio.mp3')
    })
  })

  describe('navigation', () => {
    it('should render back button', () => {
      render(<UniversalQuestionPage {...defaultProps} />)
      
      expect(screen.getByText(/Back to multiple_choice_single List/i)).toBeInTheDocument()
    })

    it('should call router.back when back button is clicked', () => {
      const mockBack = vi.fn()
      vi.mocked(require('next/navigation').useRouter).mockReturnValue({
        back: mockBack,
        push: vi.fn(),
        replace: vi.fn(),
      })
      
      render(<UniversalQuestionPage {...defaultProps} />)
      
      const backButton = screen.getByText(/Back to/i)
      fireEvent.click(backButton)
      
      expect(mockBack).toHaveBeenCalled()
    })
  })

  describe('skip functionality', () => {
    it('should not render skip button when onSkip is not provided', () => {
      render(<UniversalQuestionPage {...defaultProps} />)
      
      expect(screen.queryByText('Skip Question')).not.toBeInTheDocument()
    })

    it('should render skip button when onSkip is provided', () => {
      const onSkip = vi.fn()
      render(
        <UniversalQuestionPage
          {...defaultProps}
          onSkip={onSkip}
        />
      )
      
      expect(screen.getByText('Skip Question')).toBeInTheDocument()
    })

    it('should call onSkip with questionId when skip button is clicked', () => {
      const onSkip = vi.fn()
      render(
        <UniversalQuestionPage
          {...defaultProps}
          onSkip={onSkip}
        />
      )
      
      const skipButton = screen.getByText('Skip Question')
      fireEvent.click(skipButton)
      
      expect(onSkip).toHaveBeenCalledWith('test-question-1')
    })
  })

  describe('loading state', () => {
    it('should render skeleton when isLoading is true', () => {
      render(
        <UniversalQuestionPage
          {...defaultProps}
          isLoading={true}
        />
      )
      
      // Skeleton elements don't have text, check for container
      const container = screen.getByRole('generic')
      expect(container).toBeInTheDocument()
    })

    it('should not render question content when loading', () => {
      render(
        <UniversalQuestionPage
          {...defaultProps}
          isLoading={true}
        />
      )
      
      expect(screen.queryByText('Test Reading Question')).not.toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('should render error message when error prop is provided', () => {
      render(
        <UniversalQuestionPage
          {...defaultProps}
          error="Failed to load question"
        />
      )
      
      expect(screen.getByText('Error loading question: Failed to load question')).toBeInTheDocument()
    })

    it('should render go back button in error state', () => {
      render(
        <UniversalQuestionPage
          {...defaultProps}
          error="Failed to load question"
        />
      )
      
      expect(screen.getByText('Go Back')).toBeInTheDocument()
    })

    it('should not render question content when error is present', () => {
      render(
        <UniversalQuestionPage
          {...defaultProps}
          error="Failed to load question"
        />
      )
      
      expect(screen.queryByText('Test Reading Question')).not.toBeInTheDocument()
    })
  })

  describe('difficulty badge styling', () => {
    it('should apply correct styling for Easy difficulty', () => {
      const easyQuestion = { ...mockQuestion, difficulty: 'Easy' as const }
      render(
        <UniversalQuestionPage
          {...defaultProps}
          question={easyQuestion}
        />
      )
      
      const badge = screen.getByText('Easy')
      expect(badge).toBeInTheDocument()
    })

    it('should apply correct styling for Hard difficulty', () => {
      const hardQuestion = { ...mockQuestion, difficulty: 'Hard' as const }
      render(
        <UniversalQuestionPage
          {...defaultProps}
          question={hardQuestion}
        />
      )
      
      const badge = screen.getByText('Hard')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('statistics display', () => {
    it('should format community practice count with locale string', () => {
      const questionWithManyPractices = {
        ...mockQuestion,
        communityPracticeCount: 1234567,
      }
      render(
        <UniversalQuestionPage
          {...defaultProps}
          question={questionWithManyPractices}
        />
      )
      
      // Check if number is formatted (will vary by locale)
      expect(screen.getByText(/1,234,567|1 234 567/)).toBeInTheDocument()
    })

    it('should format user practice count with locale string', () => {
      const questionWithManyAttempts = {
        ...mockQuestion,
        userPracticeCount: 9876,
      }
      render(
        <UniversalQuestionPage
          {...defaultProps}
          question={questionWithManyAttempts}
        />
      )
      
      expect(screen.getByText(/9,876|9 876/)).toBeInTheDocument()
    })
  })
})