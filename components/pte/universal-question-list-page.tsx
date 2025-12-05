import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { EnhancedQuestionListTable } from '@/components/pte/enhanced-question-list-table'
import type {
  PTEModule,
  QuestionWithStats,
} from '@/lib/pte/types-enhanced'
import { Award, Mic, TrendingUp, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface UniversalQuestionListPageProps {
  module: PTEModule
  questionType: string
  title: string
  description: string
  icon: LucideIcon
  basePath: string
  getQuestions: () => Promise<QuestionWithStats[]>
  getStats: () => Promise<{
    totalQuestions: number
    totalAttempts: number
    averageScore: number | null
    totalUsers: number
  }>
}

export async function UniversalQuestionListPage({
  module,
  questionType,
  title,
  description,
  icon: Icon,
  basePath,
  getQuestions,
  getStats,
}: UniversalQuestionListPageProps) {
  const [questions, stats] = await Promise.all([getQuestions(), getStats()])

  const formatScore = (score: number | null) => {
    if (score === null) return 'N/A'
    if (module === 'reading' || module === 'listening') {
      return `${Math.round(score)}%`
    }
    return `${Math.round(score)}/90`
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Mic className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Questions
                </p>
                <h3 className="text-2xl font-bold">{stats.totalQuestions}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Attempts
                </p>
                <h3 className="text-2xl font-bold">
                  {stats.totalAttempts.toLocaleString()}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Users
                </p>
                <h3 className="text-2xl font-bold">
                  {stats.totalUsers.toLocaleString()}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-500/10">
                <Award className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Score
                </p>
                <h3 className="text-2xl font-bold">
                  {formatScore(stats.averageScore)}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Question List */}
      <Card>
        <CardHeader>
          <CardTitle>Practice Questions</CardTitle>
          <CardDescription>
            Browse {questions.length} {title} questions. Filter by difficulty,
            practice status, or search by keywords. Your progress is tracked
            automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EnhancedQuestionListTable
            module={module}
            questionType={questionType}
            basePath={basePath}
            initialQuestions={questions}
            showFilters={true}
            defaultView="table"
            defaultPageSize={25}
          />
        </CardContent>
      </Card>
    </div>
  )
}
