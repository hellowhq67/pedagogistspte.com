import * as React from 'react'
import { AcademicPracticeHeader } from '@/components/pte/practice-header'
import QuestionsTable, {
  QuestionsTableSkeleton,
} from '@/components/pte/questions-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  categorizeQuestions,
  fetchListingQuestions,
  getCurrentMonthName,
} from '@/lib/pte/listing-helpers'

interface SearchParams {
  page?: string
  pageSize?: string
  difficulty?: string
}

async function DescribeImageSections({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  const data = await fetchListingQuestions(
    'speaking',
    'describe_image',
    searchParams
  )
  const { all, weekly, monthly } = categorizeQuestions(data.items)
  const currentMonth = getCurrentMonthName()

  return (
    <div className="mt-6">
      <Tabs defaultValue="all">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Questions</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Prediction</TabsTrigger>
            <TabsTrigger value="monthly">{currentMonth} Prediction</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-4">
          <QuestionsTable
            rows={all}
            section="speaking"
            questionType="describe-image"
          />
        </TabsContent>
        <TabsContent value="weekly" className="mt-4">
          <QuestionsTable
            rows={weekly}
            section="speaking"
            questionType="describe-image"
          />
        </TabsContent>
        <TabsContent value="monthly" className="mt-4">
          <QuestionsTable
            rows={monthly}
            section="speaking"
            questionType="describe-image"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default async function DescribeImagePracticePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const resolvedSearchParams = await searchParams
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <AcademicPracticeHeader section="speaking" showFilters={true} />
        <React.Suspense fallback={<QuestionsTableSkeleton />}>
          <DescribeImageSections searchParams={resolvedSearchParams} />
        </React.Suspense>
      </div>
    </div>
  )
}
