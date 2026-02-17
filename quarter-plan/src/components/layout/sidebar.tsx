'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  ListTodo,
  CalendarDays,
  Calendar,
  User,
  LogOut,
  Timer,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { TimerPanel } from '@/components/timer/timer-panel'
import { useTimerStore } from '@/stores/timer-store'

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

interface SidebarProps {
  className?: string
  onNavClick?: () => void
}

export function Sidebar({ className, onNavClick }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [timerPanelOpen, setTimerPanelOpen] = useState(false)
  const { isRunning } = useTimerStore()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleNavClick = () => {
    onNavClick?.()
  }

  return (
    <div className={cn('flex flex-col w-64 border-r bg-card', className)}>
      <div className="p-6">
        <h1 className="text-xl font-bold">CyclePlan</h1>
        <p className="text-xs text-muted-foreground mt-0.5">周期计划管理</p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive && "stroke-[2.5px]")} />
              {item.title}
            </Link>
          )
        })}

        {/* Timer entry */}
        <button
          onClick={() => { handleNavClick(); setTimerPanelOpen(true) }}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
            isRunning
              ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Timer className="h-4 w-4" />
          {isRunning ? '计时中...' : '开始计时'}
        </button>
      </nav>

      <div className="p-3 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          退出登录
        </Button>
      </div>

      <TimerPanel open={timerPanelOpen} onOpenChange={setTimerPanelOpen} />
    </div>
  )
}
