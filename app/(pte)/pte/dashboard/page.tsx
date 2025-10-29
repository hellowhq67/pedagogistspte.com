import { Star, Trophy, Clock, Target } from 'lucide-react';

export default function PTEDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome to your PTE Practice Hub</h1>
        <p className="mt-2 text-muted-foreground">
          Get full access to all features and tools to help you succeed
        </p>
      </div>

      {/* VIP Banner */}
      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Star className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Pedagogist's PTE Premium</h2>
            </div>
            <p className="mb-4 text-blue-100">
              Get full access to all features and tools to help you succeed
            </p>
            <div className="flex gap-4">
              <button className="rounded-md bg-white px-6 py-2 font-medium text-blue-600 hover:bg-blue-50">
                Full Access
              </button>
              <button className="rounded-md bg-blue-700 px-6 py-2 font-medium hover:bg-blue-800">
                AI Support
              </button>
              <button className="rounded-md bg-blue-700 px-6 py-2 font-medium hover:bg-blue-800">
                Study Tools
              </button>
            </div>
          </div>
          <div className="hidden lg:block">
            <button className="rounded-md bg-white px-8 py-3 font-semibold text-blue-600 hover:bg-blue-50">
              Go Premium
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Days</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Hours</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Minutes</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Practice Summary</p>
            </div>
          </div>
        </div>
      </div>

      {/* Practice Summary Stats */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 text-center">
          <p className="text-4xl font-bold text-primary">0</p>
          <p className="mt-2 text-sm text-muted-foreground">Today Practiced</p>
        </div>

        <div className="rounded-lg border bg-card p-6 text-center">
          <p className="text-4xl font-bold text-primary">7</p>
          <p className="mt-2 text-sm text-muted-foreground">Total Practiced</p>
        </div>

        <div className="rounded-lg border bg-card p-6 text-center">
          <p className="text-4xl font-bold text-primary">5</p>
          <p className="mt-2 text-sm text-muted-foreground">Practice Days</p>
        </div>
      </div>

      {/* Study Report & Exam In */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Study Report */}
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Study Report</h3>
            <button className="text-sm text-primary hover:underline">
              Set New Target
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall</span>
              <span className="font-semibold">0/90</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Listening</span>
                <span>Reading</span>
                <span>Speaking</span>
                <span>Writing</span>
              </div>
              <div className="h-32 rounded-lg bg-muted/50"></div>
            </div>
          </div>
        </div>

        {/* Exam In */}
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Exam In</h3>
            <button className="text-sm text-primary hover:underline">
              Set New Date
            </button>
          </div>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="mb-2 flex justify-center gap-4">
                <div className="text-center">
                  <p className="text-4xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Days</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Hours</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Study Tips */}
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-full bg-primary p-2">
            <Target className="h-5 w-5 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-semibold">AI Study Tips</h3>
        </div>
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Upgrade to Premium to see:{' '}
            <span className="font-normal">
              question types you should focus on & your correctness requirements & current correctness levels
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
