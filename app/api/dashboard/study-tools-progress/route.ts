import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/db/queries'

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // In a real implementation, this would track actual user progress
    // For now, we'll return mock progress data that could be personalized
    const studyToolsProgress = {
      vocabBooks: {
        totalWords: 5000,
        learnedWords: 1200,
        progress: 24,
        lastStudied: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        streak: 5,
        timeSpent: 45, // minutes
      },
      shadowing: {
        totalHours: 50,
        completedHours: 12,
        progress: 24,
        lastSession: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        streak: 3,
        timeSpent: 720, // minutes
      },
      mp3Files: {
        totalFiles: 1000,
        listenedFiles: 150,
        progress: 15,
        lastListened: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        favoriteCategory: 'Academic Lectures',
        timeSpent: 180, // minutes
      },
      overall: {
        totalTools: 3,
        activeTools: 2,
        averageProgress: 21,
        totalTimeSpent: 945, // minutes
        currentStreak: 4,
      },
    }

    return NextResponse.json(studyToolsProgress)
  } catch (error) {
    console.error('Error fetching study tools progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch study tools progress' },
      { status: 500 }
    )
  }
}