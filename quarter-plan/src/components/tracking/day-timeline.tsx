'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Clock, Timer, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { Task, TimeEntry } from '@/types/database'

interface TimeEntryWithTask extends TimeEntry {
  task: Task
}

interface DayTimelineProps {
  entries: TimeEntryWithTask[]
  maxVisibleHours?: number
}

export function DayTimeline({ entries, maxVisibleHours = 10 }: DayTimelineProps) {
  const [selectedEntry, setSelectedEntry] = useState<TimeEntryWithTask | null>(null)
  const router = useRouter()

  const timedEntries = entries.filter(e => e.started_at && e.ended_at)
  const untimedEntries = entries.filter(e => !e.started_at || !e.ended_at)

  if (timedEntries.length === 0 && untimedEntries.length === 0) return null

  let minHour = 24
  let maxHour = 0

  for (const entry of timedEntries) {
    const start = new Date(entry.started_at!)
    const end = new Date(entry.ended_at!)
    minHour = Math.min(minHour, start.getHours())
    maxHour = Math.max(maxHour, end.getHours() + (end.getMinutes() > 0 ? 1 : 0))
  }

  if (timedEntries.length > 0) {
    minHour = Math.max(0, minHour - 1)
    maxHour = Math.min(24, maxHour + 1)
  } else {
    minHour = 8
    maxHour = 18
  }

  const totalHours = maxHour - minHour
  const hourHeight = 40
  const timelineHeight = totalHours * hourHeight
  const visibleHeight = Math.min(timelineHeight, maxVisibleHours * hourHeight)

  const hours = Array.from({ length: totalHours + 1 }, (_, i) => minHour + i)

  const getPosition = (isoStr: string) => {
    const d = new Date(isoStr)
    const hourDecimal = d.getHours() + d.getMinutes() / 60
    return ((hourDecimal - minHour) / totalHours) * timelineHeight
  }

  const fmtDuration = (min: number) => {
    const h = Math.floor(min / 60)
    const m = min % 60
    if (h === 0) return `${m}m`
    if (m === 0) return `${h}h`
    return `${h}h${m}m`
  }

  const fmtDurationCN = (min: number) => {
    const h = Math.floor(min / 60)
    const m = min % 60
    if (h === 0) return `${m}分钟`
    if (m === 0) return `${h}小时`
    return `${h}小时${m}分钟`
  }

  const fmtTime = (isoStr: string) => {
    const d = new Date(isoStr)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  const handleDelete = async (entryId: string) => {
    if (!confirm('确定要删除这条记录吗？')) return
    const supabase = createClient()
    await supabase.from('time_entries').delete().eq('id', entryId)
    setSelectedEntry(null)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      {/* Scrollable timeline */}
      {timedEntries.length > 0 && (
        <div
          className="overflow-y-auto rounded-md border border-muted"
          style={{ maxHeight: visibleHeight }}
        >
          <div className="relative" style={{ height: timelineHeight }}>
            {hours.map(hour => {
              const top = ((hour - minHour) / totalHours) * timelineHeight
              return (
                <div key={hour} className="absolute left-0 right-0" style={{ top }}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground/60 tabular-nums w-8 text-right shrink-0">
                      {String(hour).padStart(2, '0')}:00
                    </span>
                    <div className="flex-1 border-t border-dashed border-muted-foreground/15" />
                  </div>
                </div>
              )
            })}

            {timedEntries.map(entry => {
              const top = getPosition(entry.started_at!)
              const bottom = getPosition(entry.ended_at!)
              const height = Math.max(bottom - top, 16)

              return (
                <button
                  type="button"
                  key={entry.id}
                  className="absolute left-10 right-1 rounded-md px-2 py-0.5 overflow-hidden flex items-center gap-1.5 border border-white/10 cursor-pointer hover:brightness-110 active:brightness-90 transition-all text-left"
                  style={{
                    top,
                    height,
                    backgroundColor: entry.task.color + '30',
                    borderLeftWidth: 3,
                    borderLeftColor: entry.task.color,
                  }}
                  onClick={() => setSelectedEntry(entry)}
                >
                  <span className="text-[11px] font-medium truncate">
                    {entry.task.name}
                  </span>
                  {height >= 28 && (
                    <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                      {fmtTime(entry.started_at!)}-{fmtTime(entry.ended_at!)}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Untimed entries (clickable too) */}
      {untimedEntries.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] text-muted-foreground/60">未指定时间段</span>
          {untimedEntries.map(entry => (
            <button
              type="button"
              key={entry.id}
              className="w-full flex items-center gap-2 text-xs px-2 py-1.5 rounded-md cursor-pointer hover:brightness-110 active:brightness-90 transition-all text-left"
              style={{
                backgroundColor: entry.task.color + '20',
                borderLeft: `3px solid ${entry.task.color}`,
              }}
              onClick={() => setSelectedEntry(entry)}
            >
              <span className="truncate font-medium">{entry.task.name}</span>
              <span className="text-muted-foreground shrink-0 tabular-nums">{fmtDuration(entry.duration_minutes)}</span>
            </button>
          ))}
        </div>
      )}

      {/* Entry detail dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={(open) => { if (!open) setSelectedEntry(null) }}>
        {selectedEntry && (
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: selectedEntry.task.color }}
                />
                {selectedEntry.task.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-xs text-muted-foreground mb-0.5">日期</span>
                  <span>{format(new Date(selectedEntry.date + 'T00:00:00'), 'M月d日 EEEE', { locale: zhCN })}</span>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground mb-0.5">时长</span>
                  <span className="font-medium">{fmtDurationCN(selectedEntry.duration_minutes)}</span>
                </div>
                {selectedEntry.started_at && selectedEntry.ended_at && (
                  <div className="col-span-2">
                    <span className="block text-xs text-muted-foreground mb-0.5">时间段</span>
                    <span className="tabular-nums">
                      {fmtTime(selectedEntry.started_at)} - {fmtTime(selectedEntry.ended_at)}
                    </span>
                  </div>
                )}
                <div>
                  <span className="block text-xs text-muted-foreground mb-0.5">记录类型</span>
                  <span className="flex items-center gap-1">
                    {selectedEntry.entry_type === 'timer' ? (
                      <><Timer className="h-3.5 w-3.5" /> 计时器</>
                    ) : (
                      <><Clock className="h-3.5 w-3.5" /> 手动</>
                    )}
                  </span>
                </div>
              </div>

              {selectedEntry.notes && (
                <div>
                  <span className="block text-xs text-muted-foreground mb-0.5">备注</span>
                  <p className="text-muted-foreground">{selectedEntry.notes}</p>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(selectedEntry.id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  删除记录
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
