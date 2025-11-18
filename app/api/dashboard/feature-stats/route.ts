import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/db/queries'

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // In a real implementation, these would come from database queries
    // For now, we'll return realistic statistics
    const featureStats = {
      ptePractice: {
        totalQuestions: 5000,
        sections: {
          listening: 1200,
          reading: 1500,
          speaking: 1200,
          writing: 1100,
        },
        lastUpdated: new Date().toISOString(),
      },
      mockTests: {
        totalTests: 200,
        completedByUser: 5,
        averageScore: 68,
        lastCompleted: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      templates: {
        totalTemplates: 20,
        categories: ['speaking', 'writing', 'reading'],
        downloads: 150,
      },
      studyTools: {
        vocabBooks: {
          totalWords: 5000,
          completedWords: 1200,
          progress: 24,
        },
        shadowing: {
          totalHours: 50,
          completedHours: 12,
          progress: 24,
        },
        mp3Files: {
          totalFiles: 1000,
          downloadedFiles: 150,
          progress: 15,
        },
      },
    }

    return NextResponse.json(featureStats)
  } catch (error) {
    console.error('Error fetching feature stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feature statistics' },
      { status: 500 }
    )
  }
}