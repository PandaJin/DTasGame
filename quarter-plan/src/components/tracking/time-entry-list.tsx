'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExpandableEntry } from './expandable-entry'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { TimeEntry, Task } from '@/types/database'

interface TimeEntryWithTask extends TimeEntry {
  task: Task
}

interface TimeEntryListProps {
  entries: TimeEntryWithTask[]
  title?: string
}

export function TimeEntryList({ entries, title = "时间记录" }: TimeEntryListProps) {
  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h === 0) return `${m}分钟`
    if (m === 0) return `${h}小时`
    return `${h}小时${m}分钟`
  }

  const totalMinutes = entries.reduce((sum, e) => sum + e.duration_minutes, 0)

  const groupedByDate = new Map<string, TimeEntryWithTask[]>()
  for (const entry of entries) {
    const dateKey = entry.date
    if (!groupedByDate.has(dateKey)) {
      groupedByDate.set(dateKey, [])
    }
    groupedByDate.get(dateKey)!.push(entry)
  }

  const sortedDates = Array.from(groupedByDate.keys()).sort((a, b) => b.localeCompare(a))

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <Badge variant="secondary">
            总计: {formatDuration(totalMinutes)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length > 0 ? (
          <div className="space-y-4">
            {sortedDates.map((dateKey) => {
              const dayEntries = groupedByDate.get(dateKey)!
              const dayTotal = dayEntries.reduce((sum, e) => sum + e.duration_minutes, 0)
              const dateObj = new Date(dateKey + 'T00:00:00')
              const dateLabel = format(dateObj, 'M月d日 EEEE', { locale: zhCN })

              return (
                <div key={dateKey}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">{dateLabel}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{formatDuration(dayTotal)}</span>
                  </div>
                  <div className="space-y-1.5">
                    {dayEntries.map((entry) => (
                      <ExpandableEntry key={entry.id} entry={entry} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            暂无记录
          </p>
        )}
      </CardContent>
    </Card>
  )
}
