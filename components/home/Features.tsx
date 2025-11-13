import React from 'react'
import { BookOpen, AudioLines, Sparkles, ChartBar, Timer, Shield } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

const FEATURES = [
  { title: 'Real PTE Question Bank', description: 'Practice authentic question types across Speaking, Reading, Listening, and Writing.', icon: BookOpen },
  { title: 'AI-Powered Scoring', description: 'Instant feedback on pronunciation, fluency, grammar, and content.', icon: Sparkles },
  { title: 'Speaking Recorder', description: 'Record, review, and improve with waveform visualisation.', icon: AudioLines },
  { title: 'Smart Analytics', description: 'Track progress and identify weak areas with detailed insights.', icon: ChartBar },
  { title: 'Timed Practice', description: 'Exam-accurate timers so you learn optimal pacing.', icon: Timer },
  { title: 'Secure & Private', description: 'Your recordings and data are encrypted and safe.', icon: Shield },
]

export default function Features() {
  return (
    <section id="features" aria-labelledby="features-heading" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="features-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to ace PTE</h2>
        <p className="text-muted-foreground mt-3 text-base sm:text-lg">Purpose-built tools for faster improvement and higher scores.</p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => {
          const Icon = f.icon
          return (
            <Card key={f.title} className="h-full">
              <CardHeader className="flex flex-row items-center gap-3">
                <span className="bg-primary/10 text-primary inline-flex h-10 w-10 items-center justify-center rounded-lg">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <CardTitle className="text-lg">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{f.description}</CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}