'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    ChevronDown,
    BookOpen,
    Headphones,
    Mic,
    FileText,
    User,
    Settings,
    BarChart3,
    Menu,
    X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const megaMenuSections = [
    {
        title: 'Speaking',
        icon: Mic,
        items: [
            { name: 'Read Aloud', href: '/pte/academic/practice/speaking/read-aloud' },
            { name: 'Repeat Sentence', href: '/pte/academic/practice/speaking/repeat-sentence' },
            { name: 'Describe Image', href: '/pte/academic/practice/speaking/describe-image' },
            { name: 'Re-tell Lecture', href: '/pte/academic/practice/speaking/retell-lecture' },
            { name: 'Answer Short Question', href: '/pte/academic/practice/speaking/answer-short-question' },
        ],
    },
    {
        title: 'Writing',
        icon: FileText,
        items: [
            { name: 'Summarize Written Text', href: '/pte/academic/practice/writing/w_summarize_text' },
            { name: 'Write Essay', href: '/pte/academic/practice/writing/w_essay' },
        ],
    },
    {
        title: 'Reading',
        icon: BookOpen,
        items: [
            { name: 'Multiple Choice (Single)', href: '/pte/academic/practice/reading/r_mcq_single' },
            { name: 'Multiple Choice (Multiple)', href: '/pte/academic/practice/reading/r_mcq_multiple' },
            { name: 'Reorder Paragraphs', href: '/pte/academic/practice/reading/r_reorder_paragraphs' },
            { name: 'Fill in the Blanks', href: '/pte/academic/practice/reading/r_fib' },
        ],
    },
    {
        title: 'Listening',
        icon: Headphones,
        items: [
            { name: 'Summarize Spoken Text', href: '/pte/academic/practice/listening/l_summarize_text' },
            { name: 'Multiple Choice (Multiple)', href: '/pte/academic/practice/listening/l_mcq_multiple' },
            { name: 'Fill in the Blanks', href: '/pte/academic/practice/listening/l_fib' },
            { name: 'Write from Dictation', href: '/pte/academic/practice/listening/l_write_from_dictation' },
        ],
    },
]

export function EnterpriseNavbar() {
    const [showMegaMenu, setShowMegaMenu] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const pathname = usePathname()

    return (
        <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/pte/dashboard" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                            <span className="text-lg font-bold text-white">P</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">
                            Pedagogist's PTE
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden items-center gap-6 md:flex">
                        <Link
                            href="/pte/dashboard"
                            className={cn(
                                'text-sm font-medium transition-colors hover:text-blue-600',
                                pathname === '/pte/dashboard'
                                    ? 'text-blue-600'
                                    : 'text-gray-700'
                            )}
                        >
                            Dashboard
                        </Link>

                        {/* Practice Mega Menu */}
                        <div
                            className="relative"
                            onMouseEnter={() => setShowMegaMenu(true)}
                            onMouseLeave={() => setShowMegaMenu(false)}
                        >
                            <button
                                className={cn(
                                    'flex items-center gap-1 text-sm font-medium transition-colors hover:text-blue-600',
                                    pathname.includes('/practice')
                                        ? 'text-blue-600'
                                        : 'text-gray-700'
                                )}
                            >
                                Practice
                                <ChevronDown className="h-4 w-4" />
                            </button>

                            {/* Mega Menu Dropdown */}
                            {showMegaMenu && (
                                <div className="absolute left-0 top-full mt-2 w-screen max-w-4xl -translate-x-1/3 rounded-lg border border-gray-200 bg-white shadow-xl">
                                    <div className="grid grid-cols-4 gap-6 p-6">
                                        {megaMenuSections.map((section) => (
                                            <div key={section.title}>
                                                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                                                    <section.icon className="h-4 w-4 text-blue-600" />
                                                    {section.title}
                                                </div>
                                                <ul className="space-y-2">
                                                    {section.items.map((item) => (
                                                        <li key={item.href}>
                                                            <Link
                                                                href={item.href}
                                                                className="block rounded-md px-2 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-blue-600"
                                                            >
                                                                {item.name}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-gray-100 bg-gray-50 p-4">
                                        <Link
                                            href="/pte/mock-tests"
                                            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                                        >
                                            <BarChart3 className="h-4 w-4" />
                                            View All Mock Tests →
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link
                            href="/pte/analytics"
                            className={cn(
                                'text-sm font-medium transition-colors hover:text-blue-600',
                                pathname === '/pte/analytics'
                                    ? 'text-blue-600'
                                    : 'text-gray-700'
                            )}
                        >
                            Analytics
                        </Link>

                        <Link
                            href="/pte/profile"
                            className={cn(
                                'text-sm font-medium transition-colors hover:text-blue-600',
                                pathname === '/pte/profile'
                                    ? 'text-blue-600'
                                    : 'text-gray-700'
                            )}
                        >
                            Profile
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden"
                    >
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="border-t border-gray-200 py-4 md:hidden">
                        <div className="space-y-2">
                            <Link
                                href="/pte/dashboard"
                                className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Dashboard
                            </Link>
                            {megaMenuSections.map((section) => (
                                <div key={section.title} className="px-3 py-2">
                                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                                        <section.icon className="h-4 w-4" />
                                        {section.title}
                                    </div>
                                    <ul className="ml-6 space-y-1">
                                        {section.items.map((item) => (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    className="block py-1 text-sm text-gray-600"
                                                >
                                                    {item.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
