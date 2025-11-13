'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import {
  IconBook,
  IconBook2,
  IconChartBar,
  IconChevronDown,
  IconFileCheck,
  IconHeadphones,
  IconLayoutDashboard,
  IconMessage,
  IconMicrophone,
  IconPencil,
  IconRobot,
  IconSchool,
  IconSparkles,
  IconTemplate,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/pte/dashboard', icon: IconLayoutDashboard },
  { name: 'Practice', href: '/pte/academic/practice', icon: IconBook },
  {
    name: 'Section Tests',
    href: '/pte/academic/practice/section-tests',
    icon: IconBook,
  },
  {
    name: 'Speaking',
    href: '/pte/academic/practice/speaking',
    icon: IconMicrophone,
  },
  { name: 'Writing', href: '/pte/academic/practice/writing', icon: IconPencil },
  { name: 'Reading', href: '/pte/academic/practice/reading', icon: IconBook },
  {
    name: 'Listening',
    href: '/pte/academic/practice/listening',
    icon: IconHeadphones,
  },
  {
    name: 'Question Bank',
    href: '/pte/practice/section-tests/question-bank',
    icon: IconBook2,
  },
  {
    name: 'Mock Tests',
    href: '/pte/mock-tests',
    icon: IconFileCheck,
    children: [
      { name: 'Full Tests', href: '/pte/mock-tests/full-tests' },
      { name: 'Section Tests', href: '/pte/mock-tests/section-tests' },
      { name: 'Test History', href: '/pte/mock-tests/history' },
    ],
  },
  { name: 'Templates', href: '/pte/templates', icon: IconTemplate },
  { name: 'Study Center', href: '/pte/study-center', icon: IconSchool },
  { name: 'Smart Prep', href: '/pte/smart-prep', icon: IconSparkles },
  { name: 'Score Breakdown', href: '/pte/score-breakdown', icon: IconChartBar },
  { name: 'AI Coach', href: '/pte/ai-coach', icon: IconRobot },
  { name: 'Vocab Books', href: '/pte/vocab-books', icon: IconBook2 },
  { name: 'Shadowing', href: '/pte/shadowing', icon: IconHeadphones },
  { name: 'OnePTE MP3', href: '/pte/mp3', icon: IconHeadphones },
  { name: 'Support', href: '/pte/support', icon: IconMessage },
]

export function Sidebar() {
  const pathname = usePathname()
  const [openMockTests, setOpenMockTests] = useState(false)

  return (
    <aside className="fixed top-0 left-0 z-40 h-screen w-64 border-r bg-white transition-transform">
      <div className="flex h-full flex-col overflow-y-auto px-4 py-5">
        {/* Logo */}
        <div className="mb-6 flex items-center px-3">
          <Link href="/pte/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
              <span className="font-bold text-white">P</span>
            </div>
            <span className="text-md font-bold text-gray-800">{`Pedagogist's PTE`}</span>
          </Link>
        </div>

        {/* Exam Type */}
        <div className="mb-6 px-3">
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Exam Type
          </h3>
          <ToggleGroup.Root
            type="single"
            defaultValue="academic"
            className="grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1"
          >
            <ToggleGroup.Item
              value="academic"
              className="rounded-md px-2 py-1 text-sm font-medium text-gray-700 data-[state=on]:bg-white data-[state=on]:shadow"
            >
              Academic
            </ToggleGroup.Item>
            <ToggleGroup.Item
              value="core"
              className="rounded-md px-2 py-1 text-sm font-medium text-gray-700 data-[state=on]:bg-white data-[state=on]:shadow"
            >
              Core
            </ToggleGroup.Item>
          </ToggleGroup.Root>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + '/')
            const Icon = item.icon

            if (item.children) {
              return (
                <div key={item.name}>
                  <button
                    onClick={() => setOpenMockTests(!openMockTests)}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </div>
                    <IconChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform',
                        openMockTests && 'rotate-180'
                      )}
                    />
                  </button>
                  {openMockTests && (
                    <div className="mt-1 ml-8 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={cn(
                            'block rounded-lg px-3 py-2 text-sm transition-colors',
                            pathname === child.href
                              ? 'font-medium text-blue-600'
                              : 'text-gray-500 hover:text-gray-800'
                          )}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
