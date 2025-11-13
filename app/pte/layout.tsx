'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  BookOpen,
  Bot,
  FileCheck,
  Headphones,
  LayoutDashboard,
  Mic,
  PenSquare,
  Settings,
  Users,
} from 'lucide-react'
import { Header } from '@/components/pte/header'
import { ResponsiveSidebar } from '@/components/pte/responsive-sidebar'
import { SidebarMenuItem } from '@/components/pte/sidebar-menu-item'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

// Navigation structure for mobile drawer
const navigationItems = [
  {
    section: 'Dashboard',
    items: [
      {
        title: 'Dashboard',
        href: '/pte/dashboard',
        icon: <LayoutDashboard className="h-5 w-5" />,
      },
    ],
  },
  {
    section: 'Practice',
    items: [
      {
        title: 'Practice',
        href: '/pte/academic/practice',
        icon: <BookOpen className="h-5 w-5" />,
      },
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
  {
    section: 'Resources',
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
    section: 'Community',
    items: [
      {
        title: 'Community',
        href: '/pte/community',
        icon: <Users className="h-5 w-5" />,
      },
    ],
  },
  {
    section: 'Settings',
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

export default function PteLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen)
  }

  return (
    <div className="bg-background flex min-h-screen w-full flex-col">
      {/* Desktop Sidebar - always visible on lg+ */}
      <div className="hidden lg:block">
        <ResponsiveSidebar />
      </div>

      {/* Main content area with proper spacing */}
      <div className="flex flex-1 flex-col">
        {/* Header with mobile toggle */}
        <Header onMenuClick={toggleMobileDrawer} />

        {/* Mobile drawer for navigation */}
        <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
          <SheetContent side="left" className="bg-sidebar w-64 p-0 lg:hidden">
            <SheetHeader className="border-sidebar-border border-b px-4 py-4">
              <SheetTitle className="flex items-center gap-2">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg">
                  <span className="font-bold">P</span>
                </div>
                <span className="text-sidebar-foreground">PTE Academy</span>
              </SheetTitle>
            </SheetHeader>
            <nav
              className="space-y-6 px-3 py-4"
              onClick={() => setMobileDrawerOpen(false)}
            >
              {navigationItems.map((group) => (
                <div key={group.section} className="space-y-1">
                  <h3 className="text-sidebar-foreground/60 mb-2 px-3 text-xs font-semibold tracking-wider uppercase">
                    {group.section}
                  </h3>
                  {group.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname?.startsWith(item.href + '/')
                    return (
                      <SidebarMenuItem
                        key={item.href}
                        title={item.title}
                        href={item.href}
                        icon={item.icon}
                        isActive={isActive}
                        isCollapsed={false}
                      />
                    )
                  })}
                </div>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Main content with desktop sidebar offset */}
        <main className="flex-1 transition-all duration-300 lg:pl-64">
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
