'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck,
  FileText,
  Library,
  Sparkles,
  Bot,
  BookMarked,
  Mic,
  Headphones,
  Users,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/pte/dashboard', icon: LayoutDashboard },
  { 
    name: 'Practice', 
    href: '/pte/practice',
    icon: BookOpen,
    children: [
      { name: 'Full Tests', href: '/pte/practice/full-tests' },
      { name: 'Section Tests', href: '/pte/practice/section-tests' },
      { name: 'Test History', href: '/pte/practice/history' },
    ]
  },
  { name: 'Mock Tests', href: '/pte/mock-tests', icon: FileCheck },
  { name: 'Templates', href: '/pte/templates', icon: FileText },
  { name: 'Study Center', href: '/pte/study-center', icon: Library },
  { name: 'Smart Prep', href: '/pte/smart-prep', icon: Sparkles },
  { name: 'AI Coach', href: '/pte/ai-coach', icon: Bot },
  { name: 'Vocab Books', href: '/pte/vocab-books', icon: BookMarked },
  { name: 'Shadowing', href: '/pte/shadowing', icon: Mic },
  { name: 'PTE MP3', href: '/pte/mp3', icon: Headphones },
  { name: 'Community', href: '/pte/community', icon: Users },
  { name: 'Support', href: '/pte/support', icon: HelpCircle },
];
// install remix and tabler icon change my iicons all over  sidebar ad logo form  assents  add sidebar triger use all  componets/ui elements create this responsiveoptimize

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background transition-transform">
      <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
        {/* Logo */}
        <div className="mb-6 flex items-center px-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <span className="text-sm font-bold text-primary-foreground">P</span>
            </div>
            <span className="text-xl font-bold">Pedagogist's PTE</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
                
                {/* Sub-navigation */}
                {item.children && isActive && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          'block rounded-lg px-3 py-2 text-sm transition-colors',
                          pathname === child.href
                            ? 'text-primary font-medium'
                            : 'text-muted-foreground hover:text-accent-foreground'
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* CTA Section */}
        <div className="mt-auto border-t pt-4">
          <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-4">
            <p className="mb-2 text-sm font-semibold">Unlock Premium Access</p>
            <p className="mb-3 text-xs text-muted-foreground">
              Get access to all features and tools to help you succeed
            </p>
            <button className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Go Premium
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
