'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  PlayCircle,
  BookmarkIcon,
  Bookmark,
  Users,
  Trophy,
  Calendar,
  Search,
  Grid3X3,
  List,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  BookOpen,
} from 'lucide-react'
import {
  type QuestionWithStats,
  type QuestionFilters,
  type EnhancedQuestionListTableProps,
  type ViewMode,
  type SortField,
  type Difficulty,
} from '@/lib/pte/types-enhanced'

/**
 * Enhanced Question List Table Component
 *
 * Universal component for displaying PTE questions across all modules
 * with community statistics, filtering, sorting, and responsive design.
 *
 * Features:
 * - Community practice count and average scores
 * - User-specific statistics
 * - Advanced filtering (search, difficulty, status)
 * - Sorting by multiple criteria
 * - Responsive table/grid views
 * - Pagination
 * - Loading and empty states
 */
export function EnhancedQuestionListTable({
  module,
  questionType,
  basePath,
  initialQuestions = [],
  showFilters = true,
  defaultView = 'table',
  defaultPageSize = 25,
  onQuestionClick,
}: EnhancedQuestionListTableProps) {
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView)
  const [isLoading, setIsLoading] = useState(false)

  // Filter state
  const [filters, setFilters] = useState<QuestionFilters>({
    search: '',
    difficulty: 'All',
    status: 'all',
    sortBy: 'number',
    sortOrder: 'asc',
    page: 1,
    pageSize: defaultPageSize,
  })

  // Filter and sort questions
  const filteredQuestions = useMemo(() => {
    let result = [...initialQuestions]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (q) =>
          q.title.toLowerCase().includes(searchLower) ||
          q.promptPreview.toLowerCase().includes(searchLower) ||
          q.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
      )
    }

    // Difficulty filter
    if (filters.difficulty !== 'All') {
      result = result.filter((q) => q.difficulty === filters.difficulty)
    }

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter((q) => {
        switch (filters.status) {
          case 'new':
            return q.userPracticeCount === 0
          case 'practiced':
            return q.userPracticeCount > 0
          case 'bookmarked':
            return q.bookmarked
          default:
            return true
        }
      })
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0

      switch (filters.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'difficulty': {
          const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 }
          comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
          break
        }
        case 'practiceCount':
          comparison = a.communityPracticeCount - b.communityPracticeCount
          break
        case 'averageScore':
          comparison =
            (a.communityAverageScore || 0) - (b.communityAverageScore || 0)
          break
        case 'lastAttempt': {
          const aDate = a.lastAttemptDate ? new Date(a.lastAttemptDate).getTime() : 0
          const bDate = b.lastAttemptDate ? new Date(b.lastAttemptDate).getTime() : 0
          comparison = aDate - bDate
          break
        }
        default:
          // Default: sort by creation order (question number)
          comparison = 0
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [initialQuestions, filters])

  // Pagination
  const totalPages = Math.ceil(filteredQuestions.length / filters.pageSize)
  const paginatedQuestions = useMemo(() => {
    const start = (filters.page - 1) * filters.pageSize
    const end = start + filters.pageSize
    return filteredQuestions.slice(start, end)
  }, [filteredQuestions, filters.page, filters.pageSize])

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }))
  }, [])

  const handleDifficultyChange = useCallback((value: Difficulty | 'All') => {
    setFilters((prev) => ({ ...prev, difficulty: value, page: 1 }))
  }, [])

  const handleStatusChange = useCallback(
    (value: 'all' | 'new' | 'practiced' | 'bookmarked') => {
      setFilters((prev) => ({ ...prev, status: value, page: 1 }))
    },
    []
  )

  const handleSortChange = useCallback((field: SortField) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder:
        prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }))
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const getDifficultyBadgeVariant = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'default' // green
      case 'Medium':
        return 'secondary' // orange
      case 'Hard':
        return 'destructive' // red
      default:
        return 'outline'
    }
  }

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-600 dark:text-green-400 border-green-500/20 bg-green-500/10'
      case 'Medium':
        return 'text-orange-600 dark:text-orange-400 border-orange-500/20 bg-orange-500/10'
      case 'Hard':
        return 'text-red-600 dark:text-red-400 border-red-500/20 bg-red-500/10'
      default:
        return ''
    }
  }

  const formatScore = (score: number | null) => {
    if (score === null) return 'N/A'
    return `${Math.round(score)}/90`
  }

  const formatLastAttempt = (date: string | null) => {
    if (!date) return 'Never'
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch {
      return 'Invalid date'
    }
  }

  // Empty state
  if (initialQuestions.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No questions available</h3>
          <p className="text-sm text-muted-foreground">
            Questions for this section will appear here once they are added.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Toolbar */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search and View Toggle */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search questions..."
                    value={filters.search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('table')}
                    title="Table view"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    title="Grid view"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  value={filters.difficulty}
                  onValueChange={handleDifficultyChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Difficulties</SelectItem>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Questions</SelectItem>
                    <SelectItem value="new">New (Not Practiced)</SelectItem>
                    <SelectItem value="practiced">Practiced</SelectItem>
                    <SelectItem value="bookmarked">Bookmarked</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={`${filters.pageSize}`}
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      pageSize: parseInt(value),
                      page: 1,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                    <SelectItem value="100">100 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results count */}
              <div className="text-sm text-muted-foreground">
                Showing {paginatedQuestions.length} of {filteredQuestions.length}{' '}
                questions
                {filters.search || filters.difficulty !== 'All' || filters.status !== 'all'
                  ? ` (filtered from ${initialQuestions.length})`
                  : ''}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <Card>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">#</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSortChange('title')}
                      className="h-auto p-0 hover:bg-transparent"
                    >
                      Question
                      {filters.sortBy === 'title' && (
                        filters.sortOrder === 'asc' ? (
                          <ArrowUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4" />
                        )
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[120px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSortChange('difficulty')}
                      className="h-auto p-0 hover:bg-transparent"
                    >
                      Difficulty
                      {filters.sortBy === 'difficulty' && (
                        filters.sortOrder === 'asc' ? (
                          <ArrowUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4" />
                        )
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[150px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSortChange('practiceCount')}
                      className="h-auto p-0 hover:bg-transparent"
                    >
                      <Users className="mr-1 h-4 w-4" />
                      Practice Count
                      {filters.sortBy === 'practiceCount' && (
                        filters.sortOrder === 'asc' ? (
                          <ArrowUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4" />
                        )
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[120px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSortChange('averageScore')}
                      className="h-auto p-0 hover:bg-transparent"
                    >
                      <Trophy className="mr-1 h-4 w-4" />
                      Avg Score
                      {filters.sortBy === 'averageScore' && (
                        filters.sortOrder === 'asc' ? (
                          <ArrowUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4" />
                        )
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[150px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSortChange('lastAttempt')}
                      className="h-auto p-0 hover:bg-transparent"
                    >
                      <Calendar className="mr-1 h-4 w-4" />
                      Last Attempt
                      {filters.sortBy === 'lastAttempt' && (
                        filters.sortOrder === 'asc' ? (
                          <ArrowUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4" />
                        )
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[150px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedQuestions.map((question, index) => (
                  <TableRow key={question.id} className="group">
                    <TableCell className="font-medium">
                      {(filters.page - 1) * filters.pageSize + index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium line-clamp-1">
                              {question.title}
                            </span>
                            {question.bookmarked && (
                              <Bookmark className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                            {question.promptPreview}
                          </p>
                          {question.tags && question.tags.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {question.tags.slice(0, 3).map((tag, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getDifficultyColor(question.difficulty)}
                      >
                        {question.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span>{question.communityPracticeCount} users</span>
                        </div>
                        {question.userPracticeCount > 0 && (
                          <div className="text-xs text-muted-foreground">
                            You: {question.userPracticeCount}x
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {formatScore(question.communityAverageScore)}
                        </div>
                        {question.userAverageScore !== null && (
                          <div className="text-xs text-muted-foreground">
                            You: {formatScore(question.userAverageScore)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatLastAttempt(question.lastAttemptDate)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`${basePath}/${questionType}/question/${question.id}`}
                        onClick={() => onQuestionClick?.(question)}
                      >
                        <Button size="sm" className="group-hover:bg-primary">
                          <PlayCircle className="mr-1 h-4 w-4" />
                          Practice
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedQuestions.map((question, index) => (
            <Card
              key={question.id}
              className="group hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{(filters.page - 1) * filters.pageSize + index + 1}
                      </span>
                      <Badge
                        variant="outline"
                        className={getDifficultyColor(question.difficulty)}
                      >
                        {question.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-base line-clamp-2">
                      {question.title}
                    </CardTitle>
                  </div>
                  {question.bookmarked && (
                    <Bookmark className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                  )}
                </div>
                <CardDescription className="line-clamp-2">
                  {question.promptPreview}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <Users className="h-3 w-3" />
                      <span>Practice Count</span>
                    </div>
                    <div className="font-medium">
                      {question.communityPracticeCount} users
                    </div>
                    {question.userPracticeCount > 0 && (
                      <div className="text-xs text-muted-foreground">
                        You: {question.userPracticeCount}x
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <Trophy className="h-3 w-3" />
                      <span>Avg Score</span>
                    </div>
                    <div className="font-medium">
                      {formatScore(question.communityAverageScore)}
                    </div>
                    {question.userAverageScore !== null && (
                      <div className="text-xs text-muted-foreground">
                        You: {formatScore(question.userAverageScore)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Last Attempt */}
                <div className="text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground mb-1">
                    <Calendar className="h-3 w-3" />
                    <span>Last Attempt</span>
                  </div>
                  <div>{formatLastAttempt(question.lastAttemptDate)}</div>
                </div>

                {/* Tags */}
                {question.tags && question.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {question.tags.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Action Button */}
                <Link
                  href={`${basePath}/${questionType}/question/${question.id}`}
                  onClick={() => onQuestionClick?.(question)}
                  className="block"
                >
                  <Button className="w-full group-hover:bg-primary">
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Practice Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {filters.page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No results */}
      {filteredQuestions.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No questions found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your filters or search query
            </p>
            <Button
              variant="outline"
              onClick={() =>
                setFilters({
                  search: '',
                  difficulty: 'All',
                  status: 'all',
                  sortBy: 'number',
                  sortOrder: 'asc',
                  page: 1,
                  pageSize: defaultPageSize,
                })
              }
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/**
 * Loading skeleton for Enhanced Question List Table
 */
export function EnhancedQuestionListSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </Card>
    </div>
  )
}
