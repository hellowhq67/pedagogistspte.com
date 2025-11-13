'use client'

import { memo, ReactNode, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  BookOpen,
  Bot,
  ChevronDown,
  FileCheck,
  Headphones,
  LayoutDashboard,
  Mic,
  PenSquare,
  Settings,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { SidebarMenuItem } from './sidebar-menu-item'

/**
 * Navigation structure with sections and items
 * Organized for maximum usability and logical grouping
 */
interface NavSection {
  title: string
  collapsible?: boolean
  items: NavItem[]
}

interface NavItem {
  title: string
  href: string
  icon: ReactNode
  children?: NavItem[]
}

const navigationSections: NavSection[] = [
  {
    title: 'Dashboard',
    items: [
      {
        title: 'Dashboard',
        href: '/pte/dashboard',
        icon: <LayoutDashboard className="h-5 w-5" />,
      },
    ],
  },
  {
    title: 'Practice',
    collapsible: true,
    items: [
      {
        title: 'Practice',
        href: '/pte/academic/practice',
        icon: <BookOpen className="h-5 w-5" />,
        children: [
          {
            title: 'Listening',
            href: '/pte/academic/practice/listening',
            icon: <Headphones className="h-5 w-5" />,
          },
          {
            title: 'Speaking',
            href: '/pte/academic/practice/speaking',
            icon: <Mic className="h-5 w-5" />,
          },
          {
            title: 'Reading',
            href: '/pte/academic/practice/reading',
            icon: <BookOpen className="h-5 w-5" />,
          },
          {
            title: 'Writing',
            href: '/pte/academic/practice/writing',
            icon: <PenSquare className="h-5 w-5" />,
          },
        ],
      },
    ],
  },
  {
    title: 'Resources',
    collapsible: false,
    items: [
      {
        title: 'Mock Tests',
        href: '/pte/mock-tests',
        icon: <FileCheck className="h-5 w-5" />,
      },
      {
        title: 'Analytics',
        href: '/pte/analytics',
        icon: <BarChart3 className="h-5 w-5" />,
      },
    ],
  },
  {
    title: 'Community',
    collapsible: false,
    items: [
      {
        title: 'Community',
        href: '/pte/community',
        icon: <Users className="h-5 w-5" />,
      },
    ],
  },
  {
    title: 'Settings',
    collapsible: false,
    items: [
      {
        title: 'AI Coach',
        href: '/pte/ai-coach',
        icon: <Bot className="h-5 w-5" />,
      },
      {
        title: 'Settings',
        href: '/pte/academic/settings',
        icon: <Settings className="h-5 w-5" />,
      },
    ],
  },
]

/**
 * Memoized sidebar section component to optimize re-renders
 */
const SidebarSection = memo(function SidebarSection({
  section,
  isCollapsed,
  expandedSections,
  onToggleExpanded,
  pathname,
}: {
  section: NavSection
  isCollapsed: boolean
  expandedSections: Set<string>
  onToggleExpanded: (title: string) => void
  pathname: string
}) {
  const isExpanded = expandedSections.has(section.title)

  return (
    <div className="space-y-1">
      {!isCollapsed && section.collapsible && (
        <h3 className="text-sidebar-foreground/60 mb-2 px-3 text-xs font-semibold tracking-wider uppercase">
          {section.title}
        </h3>
      )}

      {section.items.map((item) => {
        const isActive =
          pathname === item.href || pathname?.startsWith(item.href + '/')

        return (
          <div key={item.href}>
            <SidebarMenuItem
              title={item.title}
              href={item.href}
              icon={item.icon}
              isActive={isActive}
              isCollapsed={isCollapsed}
              collapsible={!!item.children && section.collapsible}
              isExpanded={isExpanded}
              onClick={() =>
                section.collapsible && onToggleExpanded(section.title)
              }
            />

            {item.children &&
              section.collapsible &&
              isExpanded &&
              !isCollapsed && (
                <div className="border-sidebar-border ml-2 space-y-1 border-l-2 pl-2">
                  {item.children.map((child) => {
                    const childIsActive =
                      pathname === child.href ||
                      pathname?.startsWith(child.href + '/')

                    return (
                      <SidebarMenuItem
                        key={child.href}
                        title={child.title}
                        href={child.href}
                        icon={child.icon}
                        isActive={childIsActive}
                        isCollapsed={false}
                      />
                    )
                  })}
                </div>
              )}
          </div>
        )
      })}
    </div>
  )
})

/**
 * Desktop sidebar - always visible, collapsible sections
 */
function DesktopSidebar({
  isCollapsed,
  expandedSections,
  onToggleExpanded,
  pathname,
}: {
  isCollapsed: boolean
  expandedSections: Set<string>
  onToggleExpanded: (title: string) => void
  pathname: string
}) {
  return (
    <div
      className={cn(
        'border-sidebar-border bg-sidebar fixed top-0 left-0 z-40 border-r transition-all duration-300 ease-out',
        'flex h-screen flex-col',
        isCollapsed ? 'w-20' : 'w-64'
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Header */}
      <div className="border-sidebar-border flex h-16 items-center border-b px-4">
        <Link
          href="/pte/dashboard"
          className="flex items-center gap-2 font-semibold transition-all duration-200"
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg">
            <span className="font-bold">P</span>
          </div>
          {!isCollapsed && (
            <span className="text-sidebar-foreground text-sm font-semibold">
              PTE Academy
            </span>
          )}
        </Link>
      </div>

      {/* Navigation sections */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {navigationSections.map((section) => (
          <SidebarSection
            key={section.title}
            section={section}
            isCollapsed={isCollapsed}
            expandedSections={expandedSections}
            onToggleExpanded={onToggleExpanded}
            pathname={pathname}
          />
        ))}
      </nav>

      {/* Footer info */}
      {!isCollapsed && (
        <div className="border-sidebar-border border-t p-4">
          <div className="bg-sidebar-accent rounded-lg p-3">
            <p className="text-sidebar-accent-foreground text-xs font-medium">
              PTE Academic Platform
            </p>
            <p className="text-sidebar-accent-foreground/70 text-xs">v1.0</p>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Mobile drawer - Radix UI Sheet for mobile (<768px)
 */
const MobileSidebarContent = memo(
  ({
    expandedSections,
    onToggleExpanded,
    pathname,
  }: {
    expandedSections: Set<string>
    onToggleExpanded: (title: string) => void
    pathname: string
  }) => (
    <nav className="space-y-6 px-3 py-4">
      {navigationSections.map((section) => (
        <SidebarSection
          key={section.title}
          section={section}
          isCollapsed={false}
          expandedSections={expandedSections}
          onToggleExpanded={onToggleExpanded}
          pathname={pathname}
        />
      ))}
    </nav>
  )
)

/**
 * Main responsive sidebar component
 *
 * Breakpoints:
 * - Mobile (<768px): Hidden (drawer managed by parent layout)
 * - Desktop (>1024px): Always visible sidebar
 *
 * Features:
 * - Smooth transitions between breakpoints
 * - Collapsible sections with animation
 * - Active state indication
 * - WCAG 2.1 AA accessibility compliance
 * - Optimized re-renders with React.memo
 */
export function ResponsiveSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['Practice'])
  )

  const handleToggleExpanded = (title: string) => {
    const newSet = new Set(expandedSections)
    if (newSet.has(title)) {
      newSet.delete(title)
    } else {
      newSet.add(title)
    }
    setExpandedSections(newSet)
  }

  // Memoize values to prevent unnecessary re-renders
  const sidebarProps = useMemo(
    () => ({
      isCollapsed,
      expandedSections,
      onToggleExpanded: handleToggleExpanded,
      pathname,
    }),
    [isCollapsed, expandedSections, pathname]
  )

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile/tablet, shown on lg+) */}
      <div className="hidden lg:block">
        <DesktopSidebar {...sidebarProps} />
      </div>
    </>
  )
}

/**
 * Mobile sidebar drawer content component (to be used with Sheet)
 */
export { MobileSidebarContent }

export default ResponsiveSidebar
