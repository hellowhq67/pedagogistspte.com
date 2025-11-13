'use client'

import Link from 'next/link'
import { Bell, Menu, Search, User } from 'lucide-react'
import { ModeToggle } from '../mode-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { UserNav } from '../user-nav'

interface AcademicHeaderProps {
  onMenuClick: () => void
}

export function AcademicHeader({ onMenuClick }: AcademicHeaderProps) {
  return (
    <header className="bg-background sticky top-0 z-40 flex h-16 items-center gap-4 border-b px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <div className="flex-1">
        <div className="relative max-w-md">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search academic resources..."
            className="bg-background w-full appearance-none pl-8 shadow-none md:w-64 lg:w-80"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <ModeToggle />
        <UserNav />
      </div>
    </header>
  )
}
