'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { addWeeks, differenceInWeeks, format, isAfter, isBefore, subWeeks } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Task {
  id: string
  name: string
  priority: number
  estimated_hours: number
  color: string
}

interface TimeEntry {
  task_id: string
  date: string
  duration_minutes: number
}

interface ProgressPredictionProps {
  tasks: Task[]
  timeEntries: TimeEntry[]
  quarterEnd: Date
}

export function ProgressPrediction({ tasks, timeEntries, quarterEnd }: ProgressPredictionProps) {
  const calculatePrediction = (task: Task) => {
    const taskEntries = timeEntries.filter(e => e.task_id === task.id)
    const totalMinutes = taskEntries.reduce((sum, e) => sum + e.duration_minutes, 0)
    const loggedHours = totalMinutes / 60
    const progress = Math.min(100, (loggedHours / task.estimated_hours) * 100)

    const now = new Date()
    const fourWeeksAgo = subWeeks(now, 4)

    const recentEntries = taskEntries.filter(e => {
      const date = new Date(e.date)
      return isAfter(date, fourWeeksAgo) && isBefore(date, now)
    })

    const recentMinutes = recentEntries.reduce((sum, e) => sum + e.duration_minutes, 0)
    const recentHours = recentMinutes / 60
    const weeklyVelocity = recentHours / 4

    const remainingHours = Math.max(0, task.estimated_hours - loggedHours)
    let predictedDate: Date | null = null
    let weeksToComplete = 0

    if (weeklyVelocity > 0) {
      weeksToComplete = remainingHours / weeklyVelocity
      predictedDate = addWeeks(now, weeksToComplete)
    }

    const canComplete = predictedDate && isBefore(predictedDate, quarterEnd)
    const weeksRemaining = differenceInWeeks(quarterEnd, now)
    const requiredWeeklyHours = weeksRemaining > 0 ? remainingHours / weeksRemaining : remainingHours

    return {
      loggedHours,
      progress,
      weeklyVelocity,
      predictedDate,
      canComplete,
      requiredWeeklyHours,
      remainingHours,
    }
  }

  const predictions = tasks
    .map(task => ({
      task,
      ...calculatePrediction(task),
    }))
    .sort((a, b) => a.task.priority - b.task.priority)

  const getStatusBadge = (prediction: ReturnType<typeof calculatePrediction>) => {
    if (prediction.progress >= 100) {
      return { label: '已完成', variant: 'default' as const, icon: '✅' }
    }
    if (prediction.canComplete) {
      return { label: '可完成', variant: 'success' as const, icon: '🎯' }
    }
    if (prediction.weeklyVelocity > 0) {
      return { label: '需加速', variant: 'warning' as const, icon: '⚠️' }
    }
    return { label: '无数据', variant: 'secondary' as const, icon: '📊' }
  }

  return (
    <Card>
      <CardHeader className="pb-2 md:pb-4">
        <CardTitle className="text-sm md:text-base">进度预测</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 md:space-y-4">
          {predictions.map(({ task, ...prediction }) => {
            const status = getStatusBadge(prediction)

            return (
              <div key={task.id} className="p-3 md:p-4 border rounded-lg space-y-2.5 md:space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: task.color }}
                    />
                    <span className="font-medium text-sm truncate">{task.name}</span>
                    <Badge variant="outline" className="text-xs shrink-0">P{task.priority}</Badge>
                  </div>
                  <Badge variant={status.variant} className="shrink-0 text-xs">
                    {status.icon} {status.label}
                  </Badge>
                </div>

                <div>
                  <div className="flex justify-between text-xs md:text-sm mb-1">
                    <span className="tabular-nums">
                      {prediction.loggedHours.toFixed(1)}h / {task.estimated_hours}h
                    </span>
                    <span className="tabular-nums">{Math.round(prediction.progress)}%</span>
                  </div>
                  <Progress value={prediction.progress} className="h-1.5 md:h-2" />
                </div>

                <div className="grid grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                  <div>
                    <span className="text-muted-foreground">周均速度：</span>
                    <span className="font-medium">
                      {prediction.weeklyVelocity > 0
                        ? `${prediction.weeklyVelocity.toFixed(1)}h/周`
                        : '暂无'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">预计完成：</span>
                    <span className="font-medium">
                      {prediction.predictedDate
                        ? format(prediction.predictedDate, 'M/d', { locale: zhCN })
                        : '无法预测'}
                    </span>
                  </div>
                  {!prediction.canComplete && prediction.remainingHours > 0 && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">需每周：</span>
                      <span className="font-medium text-orange-500">
                        {prediction.requiredWeeklyHours.toFixed(1)}h 才能按时完成
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {predictions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              暂无任务数据
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
