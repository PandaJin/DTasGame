'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight, Clock, Timer, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { TimeEntry, Task } from '@/types/database'

interface TimeEntryWithTask extends TimeEntry {
  task: Task
}

interface ExpandableEntryProps {
  entry: TimeEntryWithTask
  showDate?: boolean
}

export function ExpandableEntry({ entry, showDate = false }: ExpandableEntryProps) {
  const [expanded, setExpanded] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h === 0) return `${m}分钟`
    if (m === 0) return `${h}小时`
    return `${h}小时${m}分钟`
  }

  const formatDateTime = (isoStr: string | null) => {
    if (!isoStr) return null
    const d = new Date(isoStr)
    return format(d, 'M月d日 HH:mm', { locale: zhCN })
  }

  const formatTimeOnly = (isoStr: string | null) => {
    if (!isoStr) return null
    const d = new Date(isoStr)
    return format(d, 'HH:mm')
  }

  const formatDateShort = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    return format(d, 'M/d', { locale: zhCN })
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这条记录吗？')) return
    await supabase.from('time_entries').delete().eq('id', entry.id)
    router.refresh()
  }

  return (
    <div className="rounded-lg bg-muted/50 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/80 active:bg-muted transition-colors min-h-[44px]"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          )}
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: entry.task.color }}
          />
          <span className="font-medium text-sm truncate">{entry.task.name}</span>
          {showDate && (
            <span className="text-xs text-muted-foreground shrink-0">{formatDateShort(entry.date)}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {entry.started_at && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatTimeOnly(entry.started_at)}
            </span>
          )}
          {entry.entry_type === 'timer' ? (
            <Timer className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span className="text-sm font-medium tabular-nums">{formatDuration(entry.duration_minutes)}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-0 space-y-2 border-t border-muted">
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-2">
            <div>
              <span className="block text-muted-foreground/70">日期</span>
              <span>{format(new Date(entry.date + 'T00:00:00'), 'M月d日 EEEE', { locale: zhCN })}</span>
            </div>
            <div>
              <span className="block text-muted-foreground/70">记录类型</span>
              <span>{entry.entry_type === 'timer' ? '计时器' : '手动'}</span>
            </div>
            {entry.started_at && entry.ended_at && (
              <div className="col-span-2">
                <span className="block text-muted-foreground/70">时间段</span>
                <span className="tabular-nums">
                  {formatDateTime(entry.started_at)} - {formatTimeOnly(entry.ended_at)}
                </span>
              </div>
            )}
          </div>
          {entry.notes && (
            <div className="text-xs">
              <span className="text-muted-foreground/70">备注：</span>
              <span className="text-muted-foreground">{entry.notes}</span>
            </div>
          )}
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground hover:text-destructive min-h-[32px]"
              onClick={handleDelete}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              删除
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
