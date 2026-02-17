'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTimerStore } from '@/stores/timer-store'
import { TimerNotesDialog } from './timer-notes-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Pause, Square, Play } from 'lucide-react'
import { toast } from 'sonner'
import type { Task } from '@/types/database'

interface TimerPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const priorityConfig: Record<number, string> = {
  1: 'P1',
  2: 'P2',
  3: 'P3',
  4: 'P4',
}

export function TimerPanel({ open, onOpenChange }: TimerPanelProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [notesDialog, setNotesDialog] = useState<{
    open: boolean
    taskId: string
    taskName: string
    durationSeconds: number
  } | null>(null)

  const {
    isRunning,
    isPaused,
    taskName,
    taskColor,
    elapsedSeconds,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    tick,
  } = useTimerStore()

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!open) return
    const loadTasks = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('priority')
      if (data) setTasks(data)
    }
    loadTasks()
  }, [open, supabase])

  useEffect(() => {
    if (!isRunning || isPaused) return
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [isRunning, isPaused, tick])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleStart = (task: Task) => {
    startTimer(task.id, task.name, task.color)
    onOpenChange(false)
  }

  const handleStop = () => {
    const result = stopTimer()
    if (result && result.duration > 0) {
      setNotesDialog({
        open: true,
        taskId: result.taskId,
        taskName: result.taskName,
        durationSeconds: result.duration,
      })
      onOpenChange(false)
    }
  }

  const handleSaveWithNotes = useCallback(async (notes: string | null) => {
    if (!notesDialog) return
    const today = new Date().toISOString().split('T')[0]
    const durationMinutes = Math.ceil(notesDialog.durationSeconds / 60)

    await supabase.from('time_entries').insert({
      task_id: notesDialog.taskId,
      date: today,
      duration_minutes: durationMinutes,
      entry_type: 'timer',
      started_at: new Date(Date.now() - notesDialog.durationSeconds * 1000).toISOString(),
      ended_at: new Date().toISOString(),
      notes,
    })

    setNotesDialog(null)
    toast.success('记录已保存')
    router.refresh()
  }, [notesDialog, supabase, router])

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm">
          {isRunning ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isPaused ? 'bg-yellow-400' : 'bg-green-400 animate-ping'}`} />
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isPaused ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  </span>
                  <span className="truncate">{taskName}</span>
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center py-8 md:py-6">
                <span className="text-5xl md:text-4xl font-mono font-bold tabular-nums tracking-wider">
                  {formatTime(elapsedSeconds)}
                </span>
              </div>
              <div className="flex gap-3">
                {isPaused ? (
                  <Button onClick={resumeTimer} className="flex-1 gap-2 h-12 md:h-10 text-base md:text-sm">
                    <Play className="h-5 w-5 md:h-4 md:w-4" />
                    继续
                  </Button>
                ) : (
                  <Button variant="outline" onClick={pauseTimer} className="flex-1 gap-2 h-12 md:h-10 text-base md:text-sm">
                    <Pause className="h-5 w-5 md:h-4 md:w-4" />
                    暂停
                  </Button>
                )}
                <Button variant="destructive" onClick={handleStop} className="flex-1 gap-2 h-12 md:h-10 text-base md:text-sm">
                  <Square className="h-5 w-5 md:h-4 md:w-4" />
                  停止保存
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>选择任务开始计时</DialogTitle>
              </DialogHeader>
              <div className="space-y-1 max-h-[60vh] overflow-auto -mx-1 px-1">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => handleStart(task)}
                      className="w-full flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-lg text-sm hover:bg-muted active:bg-muted/80 transition-colors text-left group min-h-[44px]"
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: task.color }}
                      />
                      <span className="flex-1 truncate">{task.name}</span>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {priorityConfig[task.priority]}
                      </Badge>
                      <Play className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground text-sm py-8">
                    请先创建任务才能开始计时
                  </p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {notesDialog && (
        <TimerNotesDialog
          open={notesDialog.open}
          onOpenChange={(open) => {
            if (!open) handleSaveWithNotes(null)
          }}
          taskName={notesDialog.taskName}
          durationSeconds={notesDialog.durationSeconds}
          onSave={handleSaveWithNotes}
        />
      )}
    </>
  )
}
