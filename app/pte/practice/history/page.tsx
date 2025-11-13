import { Calendar, Clock, Trophy } from 'lucide-react'

const mockHistory = [
  {
    id: 1,
    testName: 'Mock Test 1',
    date: '2024-01-27',
    score: 65,
    status: 'Completed',
    sections: { speaking: 70, writing: 62, reading: 68, listening: 60 },
  },
  {
    id: 2,
    testName: 'Section Test - Speaking',
    date: '2024-01-26',
    score: 72,
    status: 'Completed',
    sections: { speaking: 72 },
  },
  {
    id: 3,
    testName: 'Mock Test 2',
    date: '2024-01-25',
    score: 58,
    status: 'Completed',
    sections: { speaking: 55, writing: 58, reading: 60, listening: 59 },
  },
]

export default function TestHistoryPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Test History</h1>
        <p className="text-muted-foreground mt-2">
          Review your past test attempts and track your progress
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-full p-3">
              <Trophy className="text-primary h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">7</p>
              <p className="text-muted-foreground text-sm">Total Tests</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
              <Trophy className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">65</p>
              <p className="text-muted-foreground text-sm">Average Score</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
              <Trophy className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">72</p>
              <p className="text-muted-foreground text-sm">Best Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Test History Table */}
      <div className="bg-card rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold">Recent Tests</h2>
        </div>
        <div className="divide-y">
          {mockHistory.map((test) => (
            <div
              key={test.id}
              className="hover:bg-accent/50 p-6 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="mb-2 font-semibold">{test.testName}</h3>
                  <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {test.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {test.status}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {test.sections.speaking && (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        Speaking: {test.sections.speaking}
                      </span>
                    )}
                    {test.sections.writing && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                        Writing: {test.sections.writing}
                      </span>
                    )}
                    {test.sections.reading && (
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                        Reading: {test.sections.reading}
                      </span>
                    )}
                    {test.sections.listening && (
                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                        Listening: {test.sections.listening}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-6 flex flex-col items-end gap-2">
                  <div className="text-primary text-3xl font-bold">
                    {test.score}
                  </div>
                  <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
