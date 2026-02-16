'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Calendar,
  Clock,
  BarChart3,
  Settings,
} from 'lucide-react'

const navItems = [
  {
    title: '概览',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: '季度',
    href: '/dashboard/quarters',
    icon: Calendar,
  },
  {
    title: '追踪',
    href: '/dashboard/track',
    icon: Clock,
  },
  {
    title: '分析',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    title: '设置',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

interface MobileNavProps {
  className?: string
}

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 z-40 border-t bg-card safe-area-bottom',
      className
    )}>
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[64px]',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
