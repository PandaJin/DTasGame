'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExpandableEntry } from './expandable-entry'
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
          <div className="space-y-2">
            {entries.map((entry) => (
              <ExpandableEntry key={entry.id} entry={entry} />
            ))}
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
