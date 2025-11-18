'use client'

import { useState, useOptimistic, useActionState } from 'react'
import { useAuth } from '@/lib/auth/auth-client'
import { updateProfile } from '@/lib/auth/profile-actions'
import { Button } from '../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

// Simple toast implementation
const toast = {
  success: (message: string) => console.log('Success:', message),
  error: (message: string) => console.error('Error:', message),
}

interface AcademicProfileProps {
  initialTargetScore?: number
  initialExamDate?: string
}

export function AcademicProfile({
  initialTargetScore = 65,
  initialExamDate,
}: AcademicProfileProps) {
  const { user } = useAuth()
  const [targetScore, setTargetScore] = useState(
    initialTargetScore?.toString() || '65'
  )
  const [examDate, setExamDate] = useState(initialExamDate || '')
  const [displayTargetScore, addOptimisticTargetScore] = useOptimistic(targetScore)
  const [displayExamDate, addOptimisticExamDate] = useOptimistic(examDate)

  const updateProfileAction = async (prevState, formData) => {
    if (!user) {
      return { error: 'You must be logged in to update your profile' }
    }

    formData.append('name', user.name || user.email.split('@')[0] || 'User')
    formData.append('email', user.email || '')

    const newTargetScore = formData.get('targetScore')
    const newExamDate = formData.get('examDate')

    addOptimisticTargetScore(newTargetScore)
    addOptimisticExamDate(newExamDate)

    const result = await updateProfile(prevState, formData)

    if (result?.success) {
      setTargetScore(newTargetScore)
      setExamDate(newExamDate)
    } else {
      addOptimisticTargetScore(targetScore)
      addOptimisticExamDate(examDate)
    }

    return result
  }

  const [result, action, isPending] = useActionState(updateProfileAction, null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic Profile</CardTitle>
        <CardDescription>
          Set your target score and exam date to track your progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="targetScore">Target Score</Label>
            <Input
              id="targetScore"
              name="targetScore"
              type="number"
              min="10"
              max="90"
              value={displayTargetScore}
              onChange={(e) => setTargetScore(e.target.value)}
              placeholder="Enter your target score (10-90)"
            />
            <p className="text-muted-foreground text-sm">
              Your target PTE score
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="examDate">Exam Date</Label>
            <Input
              id="examDate"
              name="examDate"
              type="date"
              value={displayExamDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
            <p className="text-muted-foreground text-sm">
              Your scheduled exam date
            </p>
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>

        {result?.success && (
          <div className="mt-4 rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
            {result.success}
          </div>
        )}

        {result?.error && (
          <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {result.error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
