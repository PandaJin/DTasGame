'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { useTimerStore } from '@/stores/timer-store'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()
  const { isRunning, isPaused, elapsedSeconds, taskColor, tick } = useTimerStore()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

  useEffect(() => {
    if (!isRunning || isPaused) return
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [isRunning, isPaused, tick])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const formatTimeCompact = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <header className="h-14 md:h-16 border-b bg-card/95 backdrop-blur-sm flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden min-h-[44px] min-w-[44px]"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-bold md:hidden">CyclePlan</h2>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Timer status - compact on mobile, full on desktop */}
        {isRunning && (
          <div className="flex items-center gap-1.5 md:gap-2 text-sm px-2.5 py-1 rounded-full bg-muted/80">
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isPaused ? 'bg-yellow-400' : 'bg-green-400 animate-ping'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isPaused ? 'bg-yellow-500' : 'bg-green-500'}`} />
            </span>
            {/* Mobile: compact time */}
            <span className="font-mono text-xs tabular-nums md:hidden">{formatTimeCompact(elapsedSeconds)}</span>
            {/* Desktop: full time */}
            <span className="font-mono text-xs tabular-nums hidden md:inline">{formatTime(elapsedSeconds)}</span>
          </div>
        )}

        {/* User info - desktop only */}
        <div className="hidden md:block text-sm text-muted-foreground truncate max-w-[150px]">
          {user?.email}
        </div>
      </div>
    </header>
  )
}
