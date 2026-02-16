'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Clock, Menu } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

  return (
    <header className="h-14 md:h-16 border-b bg-card flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold md:hidden">QuarterPlan</h2>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* 计时器状态 */}
        <Button variant="outline" size="sm" className="gap-1 md:gap-2 text-xs md:text-sm">
          <Clock className="h-3 w-3 md:h-4 md:w-4" />
          <span className="font-mono">00:00:00</span>
        </Button>

        {/* 用户信息 - 桌面端显示 */}
        <div className="hidden md:block text-sm text-muted-foreground truncate max-w-[150px]">
          {user?.email}
        </div>
      </div>
    </header>
  )
}
