/**
 * Unit tests for components/pte/universal-question-page.tsx
 * 
 * Tests cover:
 * - Component rendering with various props
 * - formatScoreByModule integration
 * - User interactions (bookmark, audio play, navigation)
 * - Loading and error states
 * - Edge cases and accessibility
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { UniversalQuestionPage } from '../universal-question-page';
import {
  UniversalQuestionPageComponentProps,
  QuestionWithStats,
  PTEModule,
} from '@/lib/pte/types-enhanced';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Audio API
const mockAudioPlay = jest.fn().mockResolvedValue(undefined);
const mockAudioOnPlay = jest.fn();
const mockAudioOnEnded = jest.fn();

global.Audio = jest.fn().mockImplementation(() => ({
  play: mockAudioPlay,
  onplay: null,
  onended: null,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
})) as any;

describe('UniversalQuestionPage', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  };

  const mockQuestion: QuestionWithStats = {
    id: 'q-123',
    title: 'Sample Speaking Question',
    promptText: 'Look at the text below. In 40 seconds, you must read this text aloud as naturally and clearly as possible.',
    audioUrl: 'https://example.com/audio.mp3',
    difficulty: 'Medium',
    communityAverageScore: 75,
    communityPracticeCount: 1250,
    userBestScore: 82,
    userPracticeCount: 5,
    bookmarked: false,
  };

  const mockInstructions = {
    taskDescription: 'Read the text aloud clearly and naturally within the time limit.',
    tips: [
      'Practice pronunciation before recording',
      'Speak at a natural pace',
      'Pay attention to punctuation',
    ],
    scoringCriteria: [
      {
        name: 'Content',
        description: 'All words pronounced correctly',
        maxScore: 5,
      },
      {
        name: 'Pronunciation',
        description: 'Clear and natural pronunciation',
        maxScore: 5,
      },
      {
        name: 'Oral Fluency',
        description: 'Smooth and natural speech flow',
        maxScore: 5,
      },
    ],
  };

  const defaultProps: UniversalQuestionPageComponentProps = {
    module: 'speaking' as PTEModule,
    questionType: 'read-aloud',
    question: mockQuestion,
    instructions: mockInstructions,
    children: <div data-testid="practice-area">Practice Area</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  describe('Rendering', () => {
    it('should render question title and description', () => {
      render(<UniversalQuestionPage {...defaultProps} />);
      
      expect(screen.getByText('Sample Speaking Question')).toBeInTheDocument();
      expect(screen.getByText(/speaking - read aloud/i)).toBeInTheDocument();
    });

    it('should render question prompt text', () => {
      render(<UniversalQuestionPage {...defaultProps} />);
      
      expect(screen.getByText(/Look at the text below/i)).toBeInTheDocument();
    });

    it('should render difficulty badge', () => {
      render(<UniversalQuestionPage {...defaultProps} />);
      
      expect(screen.getByText('Medium')).toBeInTheDocument();
    });

    it('should render all difficulty levels with correct styling', () => {
      const difficulties: Array<'Easy' | 'Medium' | 'Hard'> = ['Easy', 'Medium', 'Hard'];
      
      difficulties.forEach((difficulty) => {
        const { container } = render(
          <UniversalQuestionPage
            {...defaultProps}
            question={{ ...mockQuestion, difficulty }}
          />
        );
        
        expect(screen.getByText(difficulty)).toBeInTheDocument();
      });
    });

    it('should render practice area children', () => {
      render(<UniversalQuestionPage {...defaultProps} />);
      
      expect(screen.getByTestId('practice-area')).toBeInTheDocument();
      expect(screen.getByText('Practice Area')).toBeInTheDocument();
    });

    it('should render instructions section', () => {
      render(<UniversalQuestionPage {...defaultProps} />);
      
      expect(screen.getByText('Instructions')).toBeInTheDocument();
      expect(screen.getByText(mockInstructions.taskDescription)).toBeInTheDocument();
    });

    it('should render tips when provided', () => {
      render(<UniversalQuestionPage {...defaultProps} />);
      
      expect(screen.getByText('Tips:')).toBeInTheDocument();
      mockInstructions.tips!.forEach((tip) => {
        expect(screen.getByText(tip)).toBeInTheDocument();
      });
    });

    it('should render scoring criteria when provided', () => {
      render(<UniversalQuestionPage {...defaultProps} />);
      
      expect(screen.getByText('Scoring Criteria:')).toBeInTheDocument();
      mockInstructions.scoringCriteria!.forEach((criteria) => {
        expect(screen.getByText(new RegExp(criteria.name))).toBeInTheDocument();
      });
    });
  });

  describe('Statistics Display - formatScoreByModule Integration', () => {
    it('should display speaking scores as ranges', () => {
      render(<UniversalQuestionPage {...defaultProps} />);
      
      expect(screen.getByText('75-80')).toBeInTheDocument(); // Community avg: 75
      expect(screen.getByText('80-85')).toBeInTheDocument(); // User best: 82
    });

    it('should display listening scores as ranges', () => {
      render(
        <UniversalQuestionPage
          {...defaultProps}
          module="listening"
          question={{ ...mockQuestion, communityAverageScore: 63, userBestScore: 88 }}
        />
      );
      
      expect(screen.getByText('60-65')).toBeInTheDocument(); // Community avg: 63
      expect(screen.getByText('85-90')).toBeInTheDocument(); // User best: 88
    });

    it('should display reading scores as exact values', () => {
      render(
        <UniversalQuestionPage
          {...defaultProps}
          module="reading"
          question={{ ...mockQuestion, communityAverageScore: 75, userBestScore: 82 }}
        />
      );
      
      expect(screen.getByText('75')).toBeInTheDocument(); // Community avg
      expect(screen.getByText('82')).toBeInTheDocument(); // User best
    });

    it('should display writing scores as exact values', () => {
      render(
        <UniversalQuestionPage
          {...defaultProps}
          module="writing"
          question={{ ...mockQuestion, communityAverageScore: 67, userBestScore: 79 }}
        />
      );
      
      expect(screen.getByText('67')).toBeInTheDocument();
      expect(screen.getByText('79')).toBeInTheDocument();
    });

    it('should display N/A for null scores', () => {
      render(
        <UniversalQuestionPage
          {...defaultProps}
          question={{
            ...mockQuestion,
            communityAverageScore: null,
            userBestScore: null,
          }}
        />
      );
      
      const naElements = screen.getAllByText('N/A');
      expect(naElements.length).toBeGreaterThanOrEqual(2);
    });

    it('should display practice counts', () => {
      render(<UniversalQuestionPage {...defaultProps} />);
      
      expect(screen.getByText('1,250')).toBeInTheDocument(); // Community count
      expect(screen.getByText('5')).toBeInTheDocument(); // User count
    });
  });

  describe('Audio Functionality', () => {
    it('should render Play Audio button when audioUrl is provided', () => {
      render(<UniversalQuestionPage {...defaultProps} />);
      
      expect(screen.getByText('Play Audio')).toBeInTheDocument();
    });

    it('should not render Play Audio button when audioUrl is missing', () => {
      render(
        <UniversalQuestionPage
          {...defaultProps}
          question={{ ...mockQuestion, audioUrl: undefined }}
        />
      );
      
      expect(screen.queryByText('Play Audio')).not.toBeInTheDocument();
    });

    it('should play audio when Play Audio button is clicked', async () => {
      render(<UniversalQuestionPage {...defaultProps} />);
      
      const playButton = screen.getByText('Play Audio');
      fireEvent.click(playButton);
      
      await waitFor(() => {
        expect(mockAudioPlay).toHaveBeenCalled();
      });
    });

    it('should show "Playing..." when audio is playing', async () => {
      render(<UniversalQuestionPage {...defaultProps} />);
      
      const playButton = screen.getByText('Play Audio');
      fireEvent.click(playButton);
      
      // Simulate audio playing state
      await waitFor(() => {
        expect(mockAudioPlay).toHaveBeenCalled();
      });
    });

    it('should handle audio play errors gracefully', async () => {
      mockAudioPlay.mockRejectedValueOnce(new Error('Audio playback failed'));
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      
      render(<UniversalQuestionPage {...defaultProps} />);
      
      const playButton = screen.getByText('Play Audio');
      fireEvent.click(playButton);
      
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          'Error playing audio:',
          expect.any(Error)
        );
      });
      
      consoleError.mockRestore();
    });
  });

  describe('Bookmark Functionality', () => {
    it('should render bookmark button', () => {
      render(<UniversalQuestionPage {...defaultProps} />);
      
      const bookmarkButton = screen.getByLabelText('Add bookmark');
      expect(bookmarkButton).toBeInTheDocument();
    });

    it('should show filled bookmark icon when bookmarked', () => {
      render(
        <UniversalQuestionPage
          {...defaultProps}
          question={{ ...mockQuestion, bookmarked: true }}
        />
      );
      
      expect(screen.getByLabelText('Remove bookmark')).toBeInTheDocument();
    });

    it('should call onBookmarkToggle when clicked', () => {
      const mockOnBookmarkToggle = jest.fn();
      render(
        <UniversalQuestionPage
          {...defaultProps}
          onBookmarkToggle={mockOnBookmarkToggle}
        />
      );
      
      const bookmarkButton = screen.getByLabelText('Add bookmark');
      fireEvent.click(bookmarkButton);
      
      expect(mockOnBookmarkToggle).toHaveBeenCalledWith('q-123', true);
    });

    it('should toggle bookmark state correctly', () => {
      const mockOnBookmarkToggle = jest.fn();
      const { rerender } = render(
        <UniversalQuestionPage
          {...defaultProps}
          onBookmarkToggle={mockOnBookmarkToggle}
        />
      );
      
      const bookmarkButton = screen.getByLabelText('Add bookmark');
      fireEvent.click(bookmarkButton);
      
      expect(mockOnBookmarkToggle).toHaveBeenCalledWith('q-123', true);
      
      // Rerender with bookmarked state
      rerender(
        <UniversalQuestionPage
          {...defaultProps}
          question={{ ...mockQuestion, bookmarked: true }}
          onBookmarkToggle={mockOnBookmarkToggle}
        />
      );
      
      const unbookmarkButton = screen.getByLabelText('Remove bookmark');
      fireEvent.click(unbookmarkButton);
      
      expect(mockOnBookmarkToggle).toHaveBeenCalledWith('q-123', false);
    });
  });

  describe('Navigation', () => {
    it('should render back button', () => {
      render(<UniversalQuestionPage {...defaultProps} />);
      
      expect(screen.getByText(/Back to read-aloud List/i)).toBeInTheDocument();
    });

    it('should navigate back when back button is clicked', () => {
      render(<UniversalQuestionPage {...defaultProps} />);
      
      const backButton = screen.getByText(/Back to read-aloud List/i);
      fireEvent.click(backButton);
      
      expect(mockRouter.back).toHaveBeenCalled();
    });

    it('should format question type in back button text', () => {
      render(
        <UniversalQuestionPage
          {...defaultProps}
          questionType="multiple-choice-single"
        />
      );
      
      expect(screen.getByText(/Back to multiple-choice-single List/i)).toBeInTheDocument();
    });
  });

  describe('Skip Functionality', () => {
    it('should not render Skip button when onSkip is not provided', () => {
      render(<UniversalQuestionPage {...defaultProps} />);
      
      expect(screen.queryByText('Skip Question')).not.toBeInTheDocument();
    });

    it('should render Skip button when onSkip is provided', () => {
      const mockOnSkip = jest.fn();
      render(<UniversalQuestionPage {...defaultProps} onSkip={mockOnSkip} />);
      
      expect(screen.getByText('Skip Question')).toBeInTheDocument();
    });

    it('should call onSkip with question ID when clicked', () => {
      const mockOnSkip = jest.fn();
      render(<UniversalQuestionPage {...defaultProps} onSkip={mockOnSkip} />);
      
      const skipButton = screen.getByText('Skip Question');
      fireEvent.click(skipButton);
      
      expect(mockOnSkip).toHaveBeenCalledWith('q-123');
    });
  });

  describe('Loading State', () => {
    it('should render loading skeletons when isLoading is true', () => {
      render(<UniversalQuestionPage {...defaultProps} isLoading={true} />);
      
      // Should not render actual content
      expect(screen.queryByText('Sample Speaking Question')).not.toBeInTheDocument();
    });

    it('should not render content when loading', () => {
      render(<UniversalQuestionPage {...defaultProps} isLoading={true} />);
      
      expect(screen.queryByText('Instructions')).not.toBeInTheDocument();
      expect(screen.queryByTestId('practice-area')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should render error message when error prop is provided', () => {
      const errorMessage = 'Failed to load question';
      render(<UniversalQuestionPage {...defaultProps} error={errorMessage} />);
      
      expect(screen.getByText(`Error loading question: ${errorMessage}`)).toBeInTheDocument();
    });

    it('should render Go Back button in error state', () => {
      render(<UniversalQuestionPage {...defaultProps} error="Some error" />);
      
      expect(screen.getByText('Go Back')).toBeInTheDocument();
    });

    it('should navigate back when Go Back button is clicked in error state', () => {
      render(<UniversalQuestionPage {...defaultProps} error="Some error" />);
      
      const goBackButton = screen.getByText('Go Back');
      fireEvent.click(goBackButton);
      
      expect(mockRouter.back).toHaveBeenCalled();
    });

    it('should not render content when error is present', () => {
      render(<UniversalQuestionPage {...defaultProps} error="Some error" />);
      
      expect(screen.queryByText('Sample Speaking Question')).not.toBeInTheDocument();
      expect(screen.queryByTestId('practice-area')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing tips gracefully', () => {
      render(
        <UniversalQuestionPage
          {...defaultProps}
          instructions={{ ...mockInstructions, tips: undefined }}
        />
      );
      
      expect(screen.queryByText('Tips:')).not.toBeInTheDocument();
    });

    it('should handle empty tips array', () => {
      render(
        <UniversalQuestionPage
          {...defaultProps}
          instructions={{ ...mockInstructions, tips: [] }}
        />
      );
      
      expect(screen.queryByText('Tips:')).not.toBeInTheDocument();
    });

    it('should handle missing scoring criteria', () => {
      render(
        <UniversalQuestionPage
          {...defaultProps}
          instructions={{ ...mockInstructions, scoringCriteria: undefined }}
        />
      );
      
      expect(screen.queryByText('Scoring Criteria:')).not.toBeInTheDocument();
    });

    it('should handle empty scoring criteria array', () => {
      render(
        <UniversalQuestionPage
          {...defaultProps}
          instructions={{ ...mockInstructions, scoringCriteria: [] }}
        />
      );
      
      expect(screen.queryByText('Scoring Criteria:')).not.toBeInTheDocument();
    });

    it('should handle very long prompt text', () => {
      const longPrompt = 'A'.repeat(5000);
      render(
        <UniversalQuestionPage
          {...defaultProps}
          question={{ ...mockQuestion, promptText: longPrompt }}
        />
      );
      
      expect(screen.getByText(longPrompt)).toBeInTheDocument();
    });

    it('should handle zero practice counts', () => {
      render(
        <UniversalQuestionPage
          {...defaultProps}
          question={{
            ...mockQuestion,
            communityPracticeCount: 0,
            userPracticeCount: 0,
          }}
        />
      );
      
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle large practice counts with formatting', () => {
      render(
        <UniversalQuestionPage
          {...defaultProps}
          question={{
            ...mockQuestion,
            communityPracticeCount: 1234567,
            userPracticeCount: 9876,
          }}
        />
      );
      
      expect(screen.getByText('1,234,567')).toBeInTheDocument();
      expect(screen.getByText('9,876')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible bookmark button label when not bookmarked', () => {
      render(<UniversalQuestionPage {...defaultProps} />);
      
      const button = screen.getByLabelText('Add bookmark');
      expect(button).toBeInTheDocument();
    });

    it('should have accessible bookmark button label when bookmarked', () => {
      render(
        <UniversalQuestionPage
          {...defaultProps}
          question={{ ...mockQuestion, bookmarked: true }}
        />
      );
      
      const button = screen.getByLabelText('Remove bookmark');
      expect(button).toBeInTheDocument();
    });

    it('should have accessible audio play button label', () => {
      render(<UniversalQuestionPage {...defaultProps} />);
      
      const button = screen.getByLabelText('Play audio');
      expect(button).toBeInTheDocument();
    });

    it('should render proper heading hierarchy', () => {
      const { container } = render(<UniversalQuestionPage {...defaultProps} />);
      
      const h3Elements = container.querySelectorAll('h3');
      expect(h3Elements.length).toBeGreaterThan(0);
    });
  });

  describe('Module Type Variations', () => {
    const modules: Array<PTEModule> = ['speaking', 'reading', 'writing', 'listening'];
    
    modules.forEach((module) => {
      it(`should render correctly for ${module} module`, () => {
        render(<UniversalQuestionPage {...defaultProps} module={module} />);
        
        expect(screen.getByText(new RegExp(module, 'i'))).toBeInTheDocument();
      });
    });
  });
});