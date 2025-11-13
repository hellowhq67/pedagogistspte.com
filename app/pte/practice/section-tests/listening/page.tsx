'use client'

import { use, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Mic, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { initialCategories } from '@/lib/pte/data'

// Define types for our listening questions
type ListeningQuestion = {
  id: string
  title: string
  description: string
  instructions: string
  example?: string
  tips?: string[]
  timeLimit: number // in seconds
  category: string
  audioUrl?: string
  question?: string
  options?: string[]
  correctAnswer?: string
  blanks?: { [key: string]: string }
  transcript?: string
}

type ListeningTab = {
  id: string
  title: string
  shortName: string
  description: string
  icon: string
  color: string
  question_count?: number
  questions: ListeningQuestion[]
}

interface ListeningPracticePageProps {
  params: Promise<{
    category: string
  }>
}

export default function ListeningPracticePage(
  props: ListeningPracticePageProps
) {
  const params = use(props.params)
  const { category } = params
  const [activeTab, setActiveTab] = useState(
    category || 'summarize-spoken-text'
  )
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [selectedOption, setSelectedOption] = useState('')
  const [filledBlanks, setFilledBlanks] = useState<{ [key: string]: string }>(
    {}
  )
  const [timer, setTimer] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [listeningData, setListeningData] = useState<ListeningTab[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch and transform the listening data from initialCategories
  useEffect(() => {
    const fetchListeningData = () => {
      // Get all listening categories (where parent is 4 - the listening parent)
      const listeningCategories = initialCategories.filter(
        (cat) => cat.parent === 4
      )

      // Transform to the format expected by our component
      const transformedData: ListeningTab[] = listeningCategories.map(
        (cat) => ({
          id: cat.code,
          title: cat.title,
          shortName: cat.short_name || cat.code.toUpperCase(),
          description: cat.description,
          icon: cat.icon,
          color: cat.color || '#ef4444', // Default red color if none provided
          question_count: cat.question_count,
          questions: [], // For now, we'll use placeholder questions
        })
      )

      // For now, create some placeholder questions for each category
      const dataWithQuestions = transformedData.map((tab) => ({
        ...tab,
        questions: Array.from({ length: tab.question_count || 5 }, (_, i) => ({
          id: `${tab.id}-${i + 1}`,
          title: `${tab.title} Practice Question ${i + 1}`,
          description: tab.description,
          instructions: `Instructions for ${tab.title}. This is question ${i + 1} in the ${tab.title} category.`,
          example: `This is a sample ${tab.title} example`,
          tips: ['Sample tip 1', 'Sample tip 2'],
          timeLimit: tab.id.includes('summarize-spoken-text')
            ? 600
            : tab.id.includes('fill-blanks')
              ? 150
              : 90,
          category: tab.id,
          audioUrl: `/audio/${tab.id}-question-${i + 1}.mp3`, // Placeholder audio URL
          question: tab.id.includes('multiple-choice')
            ? 'What is the main topic discussed?'
            : tab.id.includes('highlight-summary')
              ? 'Which summary best captures the main points?'
              : tab.id.includes('select-missing-word')
                ? 'Select the missing word.'
                : 'Fill in the blanks based on what you heard.',
          options:
            tab.id.includes('multiple-choice') ||
            tab.id.includes('highlight-summary')
              ? ['Option A', 'Option B', 'Option C', 'Option D']
              : undefined,
          correctAnswer: tab.id.includes('multiple-choice')
            ? 'Option A'
            : undefined,
          blanks: tab.id.includes('fill-blanks')
            ? {
                '1': 'example',
                '2': 'word',
                '3': 'answer',
              }
            : undefined,
          transcript: tab.id.includes('summarize-spoken-text')
            ? 'This is the transcript of the audio. It contains information about various topics that need to be summarized.'
            : undefined,
        })),
      }))

      setListeningData(dataWithQuestions)
      setLoading(false)
    }

    fetchListeningData()
  }, [])

  // Get the current tab data
  const currentTab = listeningData.find((tab) => tab.id === activeTab)
  const currentQuestion = currentTab?.questions[currentQuestionIndex]

  // Handle starting the question
  const startQuestion = () => {
    setTimerActive(true)

    // Start timer
    let timeLeft = currentQuestion?.timeLimit || 90
    setTimer(timeLeft)

    const timerInterval = setInterval(() => {
      timeLeft -= 1
      setTimer(timeLeft)

      if (timeLeft <= 0) {
        clearInterval(timerInterval)
        setTimerActive(false)
      }
    }, 1000)
  }

  // Handle audio playback
  const playAudio = () => {
    setAudioPlaying(true)
    // Simulate audio playback
    setTimeout(() => {
      setAudioPlaying(false)
    }, 3000)
  }

  // Handle fill-in-the-blanks input
  const handleBlankChange = (blankId: string, value: string) => {
    setFilledBlanks((prev) => ({
      ...prev,
      [blankId]: value,
    }))
  }

  // Navigate to next question
  const nextQuestion = () => {
    if (
      currentQuestion &&
      currentQuestionIndex < currentTab!.questions.length - 1
    ) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setUserAnswer('')
      setSelectedOption('')
      setFilledBlanks({})
      setTimerActive(false)
    }
  }

  // Navigate to previous question
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setUserAnswer('')
      setSelectedOption('')
      setFilledBlanks({})
      setTimerActive(false)
    }
  }

  // Reset timer when question changes
  useEffect(() => {
    if (currentQuestion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset timer when question changes
      setTimer(currentQuestion.timeLimit)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset timer active flag on question change
      setTimerActive(false)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Clear user input when question changes
      setUserAnswer('')
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Clear selected option on question change
      setSelectedOption('')
      setFilledBlanks({})
    }
  }, [currentQuestionIndex, currentQuestion])

  if (loading || !currentTab || !currentQuestion) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/pte/practice">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Practice
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">PTE Listening Practice</h1>
        </div>

        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground">
              Loading listening practice...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/pte/practice">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Practice
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">PTE Listening Practice</h1>
            <p className="text-muted-foreground">
              Practice your listening skills for the PTE Academic test
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {listeningData.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex flex-col items-center"
            >
              <div className="relative">
                <Image
                  src={tab.icon}
                  alt={tab.title}
                  width={32}
                  height={32}
                  className="mb-1"
                />
                <div
                  className="absolute -bottom-1 left-1/2 h-1 w-6 -translate-x-1/2 transform rounded-full text-xs"
                  style={{ backgroundColor: tab.color }}
                />
              </div>
              <span className="text-xs">{tab.shortName}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {listeningData.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              {/* Question Bank */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-lg">
                      <span>Questions</span>
                      <span className="text-muted-foreground text-sm">
                        ({tab.questions.length})
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-[600px] space-y-2 overflow-y-auto pr-2">
                      {tab.questions.map((question, index) => (
                        <div
                          key={question.id}
                          className={`cursor-pointer rounded p-3 transition-colors ${
                            index === currentQuestionIndex
                              ? 'bg-primary/10 border-primary border'
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => setCurrentQuestionIndex(index)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium">
                              {index + 1}
                            </span>
                            <span className="truncate text-sm">
                              {question.title}
                            </span>
                          </div>
                          <div className="text-muted-foreground mt-1 ml-8 text-xs">
                            {question.description.substring(0, 40)}...
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Question Content */}
              <div className="space-y-4 lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Image
                        src={tab.icon}
                        alt={tab.title}
                        width={32}
                        height={32}
                        className="rounded bg-gray-100 p-1"
                      />
                      <span>{currentQuestion.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="mb-2 font-medium">Instructions:</h3>
                        <div className="rounded-md bg-blue-50 p-4 text-sm">
                          <p>{currentQuestion.instructions}</p>
                        </div>
                      </div>

                      {/* Audio Player */}
                      <div className="flex flex-col items-center space-y-4">
                        <div className="flex h-32 w-full items-center justify-center rounded-xl border-2 border-dashed bg-gray-200">
                          <span className="text-gray-500">Audio Player</span>
                        </div>
                        <Button
                          variant="outline"
                          onClick={playAudio}
                          disabled={audioPlaying}
                        >
                          <Volume2 className="mr-2 h-4 w-4" />
                          {audioPlaying ? 'Playing...' : 'Play Audio'}
                        </Button>
                      </div>

                      {currentQuestion.question && (
                        <div>
                          <h3 className="mb-2 font-medium">Question:</h3>
                          <p className="text-sm">{currentQuestion.question}</p>
                        </div>
                      )}

                      {currentQuestion.options && (
                        <div>
                          <h3 className="mb-2 font-medium">Options:</h3>
                          <RadioGroup
                            value={selectedOption}
                            onValueChange={setSelectedOption}
                          >
                            {currentQuestion.options.map((option, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2"
                              >
                                <RadioGroupItem
                                  value={option}
                                  id={`option-${index}`}
                                />
                                <Label htmlFor={`option-${index}`}>
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      )}

                      {tab.id.includes('fill-blanks') && (
                        <div>
                          <h3 className="mb-2 font-medium">
                            Fill in the blanks:
                          </h3>
                          <div className="rounded-md bg-gray-50 p-4 text-sm leading-relaxed">
                            {currentQuestion.transcript
                              ?.split('__________')
                              .map((part, index, array) => (
                                <span key={index}>
                                  {part}
                                  {index < array.length - 1 && (
                                    <input
                                      type="text"
                                      className="mx-1 w-20 rounded border border-gray-300 px-2 py-1 text-sm"
                                      value={filledBlanks[index + 1] || ''}
                                      onChange={(e) =>
                                        handleBlankChange(
                                          (index + 1).toString(),
                                          e.target.value
                                        )
                                      }
                                      placeholder={`Blank ${index + 1}`}
                                    />
                                  )}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}

                      {tab.id.includes('summarize-spoken-text') && (
                        <div>
                          <h3 className="mb-2 font-medium">Your Summary:</h3>
                          <Textarea
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Write a summary of what you heard..."
                            className="min-h-[150px] resize-none"
                          />
                          <div className="text-muted-foreground mt-1 text-xs">
                            {userAnswer.length} characters (aim for 50-70 words)
                          </div>
                        </div>
                      )}

                      {currentQuestion.tips &&
                        currentQuestion.tips.length > 0 && (
                          <div>
                            <h3 className="mb-2 font-medium">Tips:</h3>
                            <ul className="list-inside list-disc space-y-1">
                              {currentQuestion.tips.map((tip, index) => (
                                <li
                                  key={index}
                                  className="text-muted-foreground"
                                >
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      <div className="pt-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Time Remaining
                          </span>
                          <span className="text-sm">{timer}s</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="bg-primary h-full transition-all duration-1000"
                            style={{
                              width: `${(timer / currentQuestion.timeLimit) * 100}%`,
                              backgroundColor: tab.color,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {!timerActive && (
                          <Button onClick={startQuestion}>
                            <Mic className="mr-2 h-4 w-4" />
                            Start Question
                          </Button>
                        )}

                        <Button variant="outline">Save Answer</Button>
                        <Button>Submit Answer</Button>
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button
                          onClick={prevQuestion}
                          variant="outline"
                          disabled={currentQuestionIndex === 0}
                        >
                          Previous
                        </Button>

                        <Button
                          onClick={nextQuestion}
                          variant="outline"
                          disabled={
                            currentQuestionIndex === tab.questions.length - 1
                          }
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Feedback Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>AI Feedback</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-primary text-3xl font-bold">
                          7.5
                        </div>
                        <div className="text-muted-foreground text-sm">
                          Overall Score
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-500">
                          8.0
                        </div>
                        <div className="text-muted-foreground text-sm">
                          Listening
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-500">
                          7.0
                        </div>
                        <div className="text-muted-foreground text-sm">
                          Comprehension
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="mb-2 font-medium">Feedback Summary:</h4>
                      <p className="text-muted-foreground text-sm">
                        Good listening comprehension. Work on note-taking speed
                        and spelling accuracy.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
