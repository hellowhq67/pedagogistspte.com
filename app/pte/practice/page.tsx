import Link from 'next/link'
import { BookOpen, FileCheck, History } from 'lucide-react'

export default function PracticePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">PTE Practice</h1>
        <p className="text-muted-foreground mt-2">
          Practice questions for PTE exam by question type
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Link
          href="/pte/practice/full-tests"
          className="bg-card hover:bg-accent rounded-lg border p-6 transition-colors"
        >
          <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
            <BookOpen className="text-primary h-6 w-6" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Full Tests</h3>
          <p className="text-muted-foreground text-sm">
            Complete PTE practice tests with all sections
          </p>
          <div className="text-primary mt-4 text-sm font-medium">
            5000+ Questions →
          </div>
        </Link>

        <Link
          href="/pte/practice/section-tests"
          className="bg-card hover:bg-accent rounded-lg border p-6 transition-colors"
        >
          <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
            <FileCheck className="text-primary h-6 w-6" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Section Tests</h3>
          <p className="text-muted-foreground text-sm">
            Practice individual sections: Reading, Writing, Listening, Speaking
          </p>
          <div className="text-primary mt-4 text-sm font-medium">
            Start Practice →
          </div>
        </Link>

        <Link
          href="/pte/practice/history"
          className="bg-card hover:bg-accent rounded-lg border p-6 transition-colors"
        >
          <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
            <History className="text-primary h-6 w-6" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Test History</h3>
          <p className="text-muted-foreground text-sm">
            Review your past attempts and track your progress
          </p>
          <div className="text-primary mt-4 text-sm font-medium">
            View History →
          </div>
        </Link>
      </div>
    </div>
  )
}
