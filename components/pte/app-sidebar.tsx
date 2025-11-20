'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Menu, X, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { pteNavigation, NavItem } from '@/config/pte-navigation'

interface SidebarMenuItemProps {
    item: NavItem
    isMobile?: boolean
    onNavigate?: () => void
    isCollapsed?: boolean
}

function SidebarMenuItem({
    item,
    isMobile = false,
    onNavigate,
    isCollapsed = false,
}: SidebarMenuItemProps) {
    const pathname = usePathname()
    const [isExpanded, setIsExpanded] = useState(false)
    const isActive =
        pathname === item.href || pathname?.startsWith(item.href + '/')

    // Auto-expand if child is active
    useEffect(() => {
        if (item.children) {
            const hasActiveChild = item.children.some(
                (child) =>
                    pathname === child.href || pathname?.startsWith(child.href + '/')
            )
            if (hasActiveChild) {
                setIsExpanded(true)
            }
        }
    }, [pathname, item.children])

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (item.children) {
            setIsExpanded(!isExpanded)
        }
    }

    const Icon = item.icon

    const baseClasses = cn(
        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-out relative overflow-hidden',
        'hover:bg-primary/5 hover:text-primary',
        isActive
            ? 'bg-primary/10 text-primary shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        isCollapsed && 'justify-center px-2',
        'w-full'
    )

    if (item.children) {
        return (
            <div className="space-y-1">
                <button
                    onClick={handleToggle}
                    className={cn(baseClasses, 'justify-between')}
                    aria-expanded={isExpanded}
                >
                    <div
                        className={cn(
                            'flex items-center gap-3',
                            isCollapsed && 'justify-center w-full'
                        )}
                    >
                        <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                        {!isCollapsed && <span>{item.title}</span>}
                    </div>
                    {!isCollapsed && (
                        <ChevronDown
                            className={cn(
                                'h-4 w-4 transition-transform duration-300 text-muted-foreground/70',
                                isExpanded && 'rotate-180'
                            )}
                        />
                    )}
                    {/* Active Indicator Line */}
                    {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-primary" />
                    )}
                </button>

                {isExpanded && !isCollapsed && (
                    <div className="mt-1 space-y-1 pl-4 animate-in slide-in-from-top-2 duration-200">
                        {item.children.map((child) => (
                            <SidebarMenuItem
                                key={child.href}
                                item={child}
                                isMobile={isMobile}
                                onNavigate={onNavigate}
                            />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <Link
            href={item.href}
            onClick={onNavigate}
            className={baseClasses}
        >
            <div
                className={cn(
                    'flex items-center gap-3',
                    isCollapsed && 'justify-center w-full'
                )}
            >
                <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                {!isCollapsed && (
                    <div className="flex flex-1 items-center justify-between">
                        <span>{item.title}</span>
                        {item.badge && (
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                {item.badge}
                            </span>
                        )}
                    </div>
                )}
            </div>
            {/* Active Indicator Line */}
            {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-primary" />
            )}
        </Link>
    )
}

interface PremiumSidebarProps {
    isCollapsed?: boolean
    onToggleCollapse?: () => void
    mobileOpen?: boolean
    setMobileOpen?: (open: boolean) => void
}

export function PremiumSidebar({
    isCollapsed = false,
    onToggleCollapse,
    mobileOpen = false,
    setMobileOpen,
}: PremiumSidebarProps) {
    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    'fixed top-0 left-0 z-40 h-screen border-r bg-background/80 backdrop-blur-xl transition-all duration-300 ease-out hidden lg:flex flex-col',
                    isCollapsed ? 'w-20' : 'w-72'
                )}
            >
                {/* Header */}
                <div className="flex h-20 items-center justify-between px-6 border-b border-border/40">
                    <Link
                        href="/pte/dashboard"
                        className={cn(
                            'flex items-center gap-3 transition-all duration-300',
                            isCollapsed && 'justify-center w-full'
                        )}
                    >
                        <div className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex h-10 w-10 items-center justify-center rounded-xl shadow-lg shadow-primary/20">
                            <span className="font-bold text-lg">P</span>
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col">
                                <span className="font-bold text-lg tracking-tight">
                                    PTE Academy
                                </span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                                    Learning Platform
                                </span>
                            </div>
                        )}
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden lg:flex h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={onToggleCollapse}
                    >
                        {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronDown className="h-4 w-4 rotate-90" />}
                    </Button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
                    <div className="space-y-8">
                        {pteNavigation.map((section) => (
                            <div key={section.title}>
                                {!isCollapsed && (
                                    <h3 className="mb-3 px-4 text-xs font-bold tracking-wider text-muted-foreground/50 uppercase">
                                        {section.title}
                                    </h3>
                                )}
                                <div className="space-y-1">
                                    {section.items.map((item) => (
                                        <SidebarMenuItem
                                            key={item.href}
                                            item={item}
                                            isCollapsed={isCollapsed}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border/40">
                    {!isCollapsed ? (
                        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-4 border border-primary/10">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Bot className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">AI Assistant</p>
                                    <p className="text-xs text-muted-foreground">Always here to help</p>
                                </div>
                            </div>
                            <Button size="sm" className="w-full shadow-lg shadow-primary/20">
                                Ask Question
                            </Button>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary"
                            >
                                <Bot className="h-5 w-5" />
                            </Button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Mobile Sheet */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetContent side="left" className="w-80 p-0 bg-background/95 backdrop-blur-xl">
                    <SheetHeader className="p-6 border-b text-left">
                        <SheetTitle className="flex items-center gap-3">
                            <div className="bg-primary text-primary-foreground h-10 w-10 rounded-xl flex items-center justify-center">
                                <span className="font-bold text-lg">P</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-lg">PTE Academy</span>
                                <span className="text-xs text-muted-foreground font-normal">Mobile Navigation</span>
                            </div>
                        </SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto py-6 px-4">
                        <div className="space-y-8">
                            {pteNavigation.map((section) => (
                                <div key={section.title}>
                                    <h3 className="mb-3 px-4 text-xs font-bold tracking-wider text-muted-foreground/50 uppercase">
                                        {section.title}
                                    </h3>
                                    <div className="space-y-1">
                                        {section.items.map((item) => (
                                            <SidebarMenuItem
                                                key={item.href}
                                                item={item}
                                                isMobile={true}
                                                onNavigate={() => setMobileOpen?.(false)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    )
}
