'use client'

import { useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Task } from '@/types/database'

interface TaskSummaryItem {
  task: Task
  weekMinutes: number
  weekTarget: number
}

interface WeekTaskSummaryProps {
  taskSummary: TaskSummaryItem[]
}

export function WeekTaskSummary({ taskSummary }: WeekTaskSummaryProps) {
  const fmtDuration = (min: number) => {
    const totalMin = Math.round(min)
    const h = Math.floor(totalMin / 60)
    const m = totalMin % 60
    if (h === 0) return `${m}m`
    if (m === 0) return `${h}h`
    return `${h}h${m}m`
  }
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 md:p-4 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors min-h-[44px]"
      >
        <span>周小结 · {taskSummary.length} 个任务</span>
        {expanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {expanded && (
        <div className="px-3 md:px-4 pb-3 md:pb-4 space-y-2">
          {taskSummary.map(({ task, weekMinutes, weekTarget }) => {
            const taskProgress = weekTarget > 0 ? Math.min(100, (weekMinutes / weekTarget) * 100) : 0

            return (
              <div key={task.id} className="flex items-center gap-2 text-sm">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: task.color }}
                />
                <span className="truncate flex-1 text-muted-foreground">{task.name}</span>
                <span className="font-medium shrink-0 tabular-nums">{fmtDuration(weekMinutes)}</span>
                {weekTarget > 0 && (
                  <>
                    <div className="w-12 md:w-16 shrink-0">
                      <Progress value={taskProgress} className="h-1" />
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                      / {fmtDuration(weekTarget)}
                    </span>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
