'use client'

import { useEffect } from 'react'
import { useTimerStore } from '@/stores/timer-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Play, Pause, Square } from 'lucide-react'
import type { Task } from '@/types/database'

interface TimerWidgetProps {
  tasks: Task[]
  onSave: (taskId: string, durationMinutes: number) => Promise<void>
}

export function TimerWidget({ tasks, onSave }: TimerWidgetProps) {
  const {
    isRunning,
    isPaused,
    taskId,
    taskName,
    elapsedSeconds,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    tick,
  } = useTimerStore()

  // 每秒更新
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

  const handleStart = (selectedTaskId: string) => {
    const task = tasks.find(t => t.id === selectedTaskId)
    if (task) {
      startTimer(selectedTaskId, task.name)
    }
  }

  const handleStop = async () => {
    const result = stopTimer()
    if (result && result.duration > 0) {
      const minutes = Math.ceil(result.duration / 60)
      await onSave(result.taskId, minutes)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-lg">计时器</span>
          {isRunning && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              {isPaused ? '已暂停' : '计时中'}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 计时显示 */}
        <div className="text-center">
          <div className="text-5xl font-mono font-bold tracking-wider">
            {formatTime(elapsedSeconds)}
          </div>
          {taskName && (
            <p className="mt-2 text-muted-foreground">{taskName}</p>
          )}
        </div>

        {/* 任务选择 */}
        {!isRunning && (
          <Select onValueChange={handleStart}>
            <SelectTrigger>
              <SelectValue placeholder="选择任务开始计时" />
            </SelectTrigger>
            <SelectContent>
              {tasks.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  <span className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: task.color }}
                    />
                    P{task.priority} - {task.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* 控制按钮 */}
        {isRunning && (
          <div className="flex gap-3 justify-center">
            {isPaused ? (
              <Button onClick={resumeTimer} className="gap-2">
                <Play className="h-4 w-4" />
                继续
              </Button>
            ) : (
              <Button variant="outline" onClick={pauseTimer} className="gap-2">
                <Pause className="h-4 w-4" />
                暂停
              </Button>
            )}
            <Button variant="destructive" onClick={handleStop} className="gap-2">
              <Square className="h-4 w-4" />
              停止并保存
            </Button>
          </div>
        )}

        {tasks.length === 0 && (
          <p className="text-center text-muted-foreground text-sm">
            请先创建任务才能开始计时
          </p>
        )}
      </CardContent>
    </Card>
  )
}
