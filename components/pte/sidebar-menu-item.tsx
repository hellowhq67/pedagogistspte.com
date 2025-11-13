'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarMenuItemProps {
  title: string
  href: string
  icon: ReactNode
  isActive: boolean
  isCollapsed?: boolean
  onClick?: () => void
  collapsible?: boolean
  isExpanded?: boolean
  children?: ReactNode
  className?: string
}

/**
 * Reusable sidebar menu item component with support for:
 * - Active state indication
 * - Collapsible groups
 * - Smooth transitions
 * - Responsive sizing
 * - Accessibility (ARIA labels, keyboard navigation)
 */
export function SidebarMenuItem({
  title,
  href,
  icon,
  isActive,
  isCollapsed = false,
  onClick,
  collapsible = false,
  isExpanded = false,
  children,
  className,
}: SidebarMenuItemProps) {
  const baseClasses = cn(
    'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out',
    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
    isActive && 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm',
    !isActive && 'text-sidebar-foreground hover:bg-sidebar-accent',
    isCollapsed && 'justify-center px-3',
    className
  )

  // Collapsible item (e.g., Practice with sub-items)
  if (collapsible) {
    return (
      <div>
        <Button
          onClick={onClick}
          variant={isActive ? 'default' : 'ghost'}
          className={cn(
            baseClasses,
            'justify-between',
            isCollapsed && 'justify-center'
          )}
          aria-expanded={isExpanded}
          aria-label={`${title} menu${isExpanded ? ', expanded' : ', collapsed'}`}
        >
          <div
            className={cn(
              'flex items-center gap-3',
              isCollapsed && 'w-full justify-center'
            )}
          >
            <span className="flex h-5 w-5 items-center justify-center">
              {icon}
            </span>
            {!isCollapsed && <span>{title}</span>}
          </div>
          {!isCollapsed && (
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                isExpanded && 'rotate-180'
              )}
              aria-hidden="true"
            />
          )}
        </Button>
        {isExpanded && !isCollapsed && (
          <div className="mt-1 space-y-1 pl-4">{children}</div>
        )}
      </div>
    )
  }

  // Regular link item
  return (
    <Button
      variant={isActive ? 'default' : 'ghost'}
      className={baseClasses}
      asChild
      aria-current={isActive ? 'page' : undefined}
    >
      <Link href={href} className="flex items-center gap-3">
        <span className="flex h-5 w-5 items-center justify-center">{icon}</span>
        {!isCollapsed && <span>{title}</span>}
      </Link>
    </Button>
  )
}
