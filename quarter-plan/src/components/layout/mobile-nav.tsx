'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  ListTodo,
  CalendarDays,
  Calendar,
  User,
} from 'lucide-react'
import { TimerNavButton } from '@/components/timer/timer-nav-button'

const navItems = [
  {
    title: '任务',
    href: '/dashboard/tasks',
    icon: ListTodo,
  },
  {
    title: '本周',
    href: '/dashboard/week',
    icon: CalendarDays,
  },
  {
    title: '周期',
    href: '/dashboard/cycles',
    icon: Calendar,
  },
  {
    title: '我的',
    href: '/dashboard/me',
    icon: User,
  },
]

interface MobileNavProps {
  className?: string
}

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-lg safe-area-bottom',
      className
    )}>
      <div className="flex items-center justify-around h-16">
        {/* Left 2 items */}
        {navItems.slice(0, 2).map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-2 min-w-[60px] min-h-[44px] rounded-lg transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground active:bg-muted'
              )}
            >
              <div className="relative">
                <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
                )}
              </div>
              <span className={cn(
                "text-[10px] mt-0.5",
                isActive && "font-semibold"
              )}>{item.title}</span>
            </Link>
          )
        })}

        {/* Center timer button */}
        <TimerNavButton />

        {/* Right 2 items */}
        {navItems.slice(2).map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-2 min-w-[60px] min-h-[44px] rounded-lg transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground active:bg-muted'
              )}
            >
              <div className="relative">
                <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
                )}
              </div>
              <span className={cn(
                "text-[10px] mt-0.5",
                isActive && "font-semibold"
              )}>{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
