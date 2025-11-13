'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <div className="bg-background text-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden pt-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56"
          >
            <div className="hidden sm:mb-8 sm:flex sm:justify-center">
              <div className="text-muted-foreground ring-ring/10 hover:ring-ring/20 relative rounded-full px-3 py-1 text-sm leading-6 ring-1">
                Announcing our next round of funding.{' '}
                <a href="#" className="text-primary font-semibold">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Read more <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                PTE Academic Practice Platform for Ambitious Students
              </h1>
              <p className="text-muted-foreground mt-6 text-lg leading-8">
                Join thousands of students who have achieved their desired
                scores with our AI-powered practice tests, mock exams, and
                personalized feedback.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button asChild>
                  <Link href="/sign-up">Get started</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/pricing">
                    Learn more <span aria-hidden="true">→</span>
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
