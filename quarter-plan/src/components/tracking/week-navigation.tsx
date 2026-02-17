'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface WeekNavigationProps {
  weekLabel: string
  prevWeek: string
  nextWeek: string
  isCurrentWeek: boolean
}

export function WeekNavigation({ weekLabel, prevWeek, nextWeek, isCurrentWeek }: WeekNavigationProps) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-1 md:gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 md:h-9 md:w-9"
        onClick={() => router.push(`/dashboard/week?week=${prevWeek}`)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-xs md:text-sm font-medium min-w-[110px] md:min-w-[140px] text-center tabular-nums">{weekLabel}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 md:h-9 md:w-9"
        onClick={() => router.push(`/dashboard/week?week=${nextWeek}`)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      {!isCurrentWeek && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => router.push('/dashboard/week')}
        >
          本周
        </Button>
      )}
    </div>
  )
}
