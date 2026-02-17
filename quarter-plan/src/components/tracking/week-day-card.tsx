'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TimeEntryForm } from '@/components/tracking/time-entry-form'
import { ExpandableEntry } from '@/components/tracking/expandable-entry'
import { ChevronDown, FileText, Clock, Timer } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Task, TimeEntry, DailyNote } from '@/types/database'

interface TimeEntryWithTask extends TimeEntry {
  task: Task
}

interface WeekDayCardProps {
  dateStr: string
  dayLabel: string
  dayTotal: number
  dayProgress: number
  dailyTargetMinutes: number
  dayEntries: TimeEntryWithTask[]
  isToday: boolean
  tasks: Task[]
  dailyNote?: DailyNote | null
}

export function WeekDayCard({
  dateStr,
  dayLabel,
  dayTotal,
  dayProgress,
  dailyTargetMinutes,
  dayEntries,
  isToday,
  tasks,
  dailyNote,
}: WeekDayCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [noteContent, setNoteContent] = useState(dailyNote?.content || '')
  const [saving, setSaving] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setNoteContent(dailyNote?.content || '')
  }, [dailyNote?.content])

  const saveNote = useCallback(async (content: string) => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (dailyNote?.id) {
        await supabase
          .from('daily_notes')
          .update({ content, updated_at: new Date().toISOString() })
          .eq('id', dailyNote.id)
      } else {
        await supabase
          .from('daily_notes')
          .upsert({
            user_id: user.id,
            date: dateStr,
            content,
          }, { onConflict: 'user_id,date' })
      }
    } finally {
      setSaving(false)
    }
  }, [dailyNote?.id, dateStr])

  const handleNoteChange = useCallback((value: string) => {
    setNoteContent(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => saveNote(value), 1000)
  }, [saveNote])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const fmtDuration = (min: number) => {
    const totalMin = Math.round(min)
    const h = Math.floor(totalMin / 60)
    const m = totalMin % 60
    if (h === 0) return `${m}m`
    if (m === 0) return `${h}h`
    return `${h}h${m}m`
  }

  const fmtDurationCN = (min: number) => {
    const totalMin = Math.round(min)
    const h = Math.floor(totalMin / 60)
    const m = totalMin % 60
    if (h === 0) return `${m}分钟`
    if (m === 0) return `${h}小时`
    return `${h}小时${m}分钟`
  }

  const taskMinutes = new Map<string, { task: Task; minutes: number }>()
  for (const entry of dayEntries) {
    const existing = taskMinutes.get(entry.task_id)
    if (existing) {
      existing.minutes += entry.duration_minutes
    } else {
      taskMinutes.set(entry.task_id, {
        task: entry.task,
        minutes: entry.duration_minutes,
      })
    }
  }

  const taskList = Array.from(taskMinutes.values()).sort((a, b) => b.minutes - a.minutes)
  const hasNote = !!(dailyNote?.content || noteContent)

  return (
    <>
      <Card className={isToday ? 'ring-2 ring-primary shadow-sm' : 'opacity-90'}>
        <CardContent className="py-2.5 md:py-3 px-3 md:px-4">
          {/* Header: day label + total + add button */}
          <div className="flex items-center justify-between mb-1">
            <button
              type="button"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              onClick={() => setDialogOpen(true)}
            >
              <span className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                {dayLabel}
              </span>
              {isToday && (
                <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                  今天
                </span>
              )}
              {hasNote && (
                <FileText className="w-3 h-3 text-muted-foreground/60" />
              )}
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`text-sm font-bold tabular-nums ${dayTotal > 0 ? '' : 'text-muted-foreground'}`}>
                {dayTotal > 0 ? fmtDuration(dayTotal) : '0m'}
              </span>
              <TimeEntryForm
                tasks={tasks}
                defaultDate={dateStr}
                triggerLabel=""
                compact
              />
            </div>
          </div>

          {/* Task breakdown */}
          {taskList.length > 0 ? (
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              {taskList.map(({ task, minutes }) => (
                <span key={task.id} className="flex items-center gap-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: task.color }}
                  />
                  <span className="truncate max-w-[100px]">{task.name}</span>
                  <span className="tabular-nums">{fmtDuration(minutes)}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/60">暂无记录</p>
          )}
        </CardContent>
      </Card>

      {/* Day detail dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dayLabel}
              {isToday && (
                <Badge variant="default" className="text-xs">今天</Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">总计时长</span>
              <span className="font-semibold">{dayTotal > 0 ? fmtDurationCN(dayTotal) : '无记录'}</span>
            </div>
            {dailyTargetMinutes > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>每日目标</span>
                  <span className="tabular-nums">{fmtDuration(dayTotal)} / {fmtDuration(dailyTargetMinutes)}</span>
                </div>
                <Progress value={dayProgress} className="h-1.5" />
              </div>
            )}
          </div>

          {/* Task breakdown */}
          {taskList.length > 0 && (
            <div className="pt-2 border-t">
              <h4 className="text-sm font-medium mb-2.5">任务分布</h4>
              <div className="space-y-2">
                {taskList.map(({ task, minutes }) => (
                  <div key={task.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: task.color }}
                      />
                      <span className="truncate">{task.name}</span>
                      <Badge variant="outline" className="text-[10px] shrink-0 px-1 py-0">
                        P{task.priority}
                      </Badge>
                    </div>
                    <span className="font-medium tabular-nums shrink-0 ml-2">{fmtDurationCN(minutes)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time entries */}
          {dayEntries.length > 0 && (
            <div className="pt-2 border-t">
              <h4 className="text-sm font-medium mb-2.5">时间记录</h4>
              <div className="space-y-1.5">
                {dayEntries.map(entry => (
                  <ExpandableEntry key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          )}

          {/* Daily note */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                今日备注
              </h4>
              {saving && (
                <span className="text-[10px] text-muted-foreground">保存中...</span>
              )}
            </div>
            <Textarea
              placeholder="写下今天的收获、感悟..."
              value={noteContent}
              onChange={(e) => handleNoteChange(e.target.value)}
              className="min-h-[80px] text-sm resize-none"
              rows={3}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
