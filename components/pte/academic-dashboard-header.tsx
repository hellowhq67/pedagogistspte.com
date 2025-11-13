import { Calendar, Target } from 'lucide-react'
import { User } from '@/lib/db/schema'

interface AcademicDashboardHeaderProps {
  user: User & { targetScore?: number | null; examDate?: string | Date | null }
}

export function AcademicDashboardHeader({
  user,
}: AcademicDashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold">Academic Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name}. Here's your academic progress.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
          <Target className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-muted-foreground text-sm">Target Score</p>
            <p className="font-semibold">{user.targetScore ?? 65}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
          <Calendar className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-muted-foreground text-sm">Exam Date</p>
            <p className="font-semibold">
              {user.examDate
                ? new Date(user.examDate).toLocaleDateString()
                : 'Not set'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
