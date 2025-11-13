import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  height?: string
  className?: string
}

export function LoadingSkeleton({
  height = '20px',
  className,
}: LoadingSkeletonProps) {
  return (
    <div
      className={cn('bg-muted animate-pulse rounded-md', className)}
      style={{ height }}
    />
  )
}
