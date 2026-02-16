'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Timer, Edit2, Trash2 } from 'lucide-react'
import type { TimeEntry, Task } from '@/types/database'

interface TimeEntryWithTask extends TimeEntry {
  task: Task
}

interface TimeEntryListProps {
  entries: TimeEntryWithTask[]
  title?: string
}

export function TimeEntryList({ entries, title = "时间记录" }: TimeEntryListProps) {
  const router = useRouter()
  const supabase = createClient()

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h === 0) return `${m}分钟`
    if (m === 0) return `${h}小时`
    return `${h}小时${m}分钟`
  }

  const handleDelete = async (entryId: string) => {
    if (!confirm('确定要删除这条记录吗？')) return

    await supabase.from('time_entries').delete().eq('id', entryId)
    router.refresh()
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
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.task.color }}
                  />
                  <div>
                    <p className="font-medium text-sm">{entry.task.name}</p>
                    {entry.notes && (
                      <p className="text-xs text-muted-foreground">{entry.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    {entry.entry_type === 'timer' ? (
                      <Timer className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-medium">
                      {formatDuration(entry.duration_minutes)}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(entry.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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
