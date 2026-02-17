'use client'

import { useEffect, useState } from 'react'
import { useTimerStore } from '@/stores/timer-store'
import { TimerPanel } from './timer-panel'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TimerNavButton() {
  const [panelOpen, setPanelOpen] = useState(false)
  const { isRunning, isPaused, elapsedSeconds, tick } = useTimerStore()

  // Tick
  useEffect(() => {
    if (!isRunning || isPaused) return
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [isRunning, isPaused, tick])

  const formatCompact = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}`
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <>
      <button
        onClick={() => setPanelOpen(true)}
        className={cn(
          'relative flex flex-col items-center justify-center -mt-5 z-10',
          'w-14 h-14 rounded-full shadow-lg transition-all',
          isRunning
            ? 'bg-primary text-primary-foreground'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        )}
      >
        {isRunning ? (
          <>
            {/* Pulse animation */}
            <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
            <span className="text-xs font-mono font-bold tabular-nums">
              {formatCompact(elapsedSeconds)}
            </span>
          </>
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </button>

      <TimerPanel open={panelOpen} onOpenChange={setPanelOpen} />
    </>
  )
}
