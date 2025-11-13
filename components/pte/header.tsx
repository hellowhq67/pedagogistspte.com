'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { Menu, User, X } from 'lucide-react'
import useSWR from 'swr'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOutAction } from '@/lib/auth/actions'
import { User as UserType } from '@/lib/db/schema'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: user, error } = useSWR<UserType>('/api/user', fetcher, {
    onError: (err) => {
      console.error('SWR Error:', err)
    },
    errorRetryCount: 0,
  })

  if (error || !user || (!user.email && !user.name)) {
    return (
      <Button asChild className="rounded-full">
        <Link href="/sign-up">Sign Up</Link>
      </Button>
    )
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="size-9 cursor-pointer">
          <AvatarImage alt={user.name || user.email || 'User'} />
          <AvatarFallback>
            {(user.email || user.name || 'U')
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        <Link href="/pte/profile" className="w-full">
          <DropdownMenuItem className="w-full flex-1 cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </Link>
        <form action={signOutAction} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer">
              <X className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="bg-background sticky top-0 z-30 flex h-14 items-center gap-4 border-b px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Button
        onClick={onMenuClick}
        className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </Button>
      <div className="flex-1" />
      <Suspense
        fallback={
          <div className="h-9 w-24 animate-pulse rounded-full bg-gray-100" />
        }
      >
        <UserMenu />
      </Suspense>
    </header>
  )
}
