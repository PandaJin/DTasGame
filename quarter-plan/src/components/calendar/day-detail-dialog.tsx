'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ActivityRings, RingLegend } from './activity-rings'
import type { Task, TimeEntry } from '@/types/database'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface DayDetailDialogProps {
  date: string // yyyy-MM-dd
  tasks: Task[]
  dayEntries: TimeEntry[]
  highPriorityProgress: number
  dailyCompletionProgress: number
  absoluteTimeProgress: number
  highPriorityMinutes: number
  totalMinutes: number
  highPriorityDailyTarget: number // minutes
  dailyTarget: number // minutes
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DayDetailDialog({
  date,
  tasks,
  dayEntries,
  highPriorityProgress,
  dailyCompletionProgress,
  absoluteTimeProgress,
  highPriorityMinutes,
  totalMinutes,
  highPriorityDailyTarget,
  dailyTarget,
  open,
  onOpenChange,
}: DayDetailDialogProps) {
  const dateObj = new Date(date + 'T00:00:00')
  const dateLabel = format(dateObj, 'M月d日 EEEE', { locale: zhCN })

  // Group entries by task
  const taskMap = new Map(tasks.map(t => [t.id, t]))
  const taskMinutes = new Map<string, number>()
  for (const entry of dayEntries) {
    taskMinutes.set(
      entry.task_id,
      (taskMinutes.get(entry.task_id) || 0) + entry.duration_minutes
    )
  }

  const taskBreakdown = Array.from(taskMinutes.entries())
    .map(([taskId, minutes]) => ({
      task: taskMap.get(taskId),
      minutes,
    }))
    .filter(item => item.task)
    .sort((a, b) => b.minutes - a.minutes)

  const fmt = (min: number) => {
    const h = Math.floor(min / 60)
    const m = Math.round(min % 60)
    if (h === 0) return `${m}分钟`
    if (m === 0) return `${h}小时`
    return `${h}h${m}m`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{dateLabel}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          <ActivityRings
            highPriorityProgress={highPriorityProgress}
            dailyCompletionProgress={dailyCompletionProgress}
            absoluteTimeProgress={absoluteTimeProgress}
            size={120}
          />
        </div>

        <RingLegend
          highPriorityMinutes={highPriorityMinutes}
          highPriorityTarget={highPriorityDailyTarget}
          totalMinutes={totalMinutes}
          dailyTarget={dailyTarget}
        />

        {taskBreakdown.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">时间分配</h4>
            <div className="space-y-2">
              {taskBreakdown.map(({ task, minutes }) => (
                <div key={task!.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: task!.color }}
                    />
                    <span>{task!.name}</span>
                    <span className="text-xs text-muted-foreground">P{task!.priority}</span>
                  </div>
                  <span className="font-medium">{fmt(minutes)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {taskBreakdown.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            当日无记录
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
