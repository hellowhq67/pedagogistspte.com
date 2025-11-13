'use client'

import { CheckCircle, Circle, Target } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Progress } from '../ui/progress'

interface AcademicGoal {
  id: number
  title: string
  current: number
  target: number
  // Accept broader status strings to align with callers' inferred types
  status: 'completed' | 'in-progress' | string
}

interface AcademicGoalsSectionProps {
  goals: AcademicGoal[]
  userTargetScore: number
}

export function AcademicGoalsSection({
  goals,
  userTargetScore,
}: AcademicGoalsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Academic Goals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {goals.map((goal) => (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{goal.title}</h3>
                <Badge
                  variant={
                    goal.status === 'completed' ? 'default' : 'secondary'
                  }
                >
                  {goal.status === 'completed' ? 'Completed' : 'In Progress'}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Progress
                  value={(goal.current / goal.target) * 100}
                  className="h-2"
                />
                <span className="text-muted-foreground w-12 text-sm">
                  {goal.current}/{goal.target}
                </span>
              </div>
              {goal.status === 'completed' ? (
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircle className="mr-1 h-4 w-4" />
                  <span>Goal achieved!</span>
                </div>
              ) : (
                <div className="flex items-center text-sm text-blue-600">
                  <Circle className="mr-1 h-4 w-4" />
                  <span>{goal.target - goal.current} points to go</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
