'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ChevronDown } from 'lucide-react'
import { addWeeks, differenceInWeeks, format, isAfter, isBefore, subWeeks } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import Link from 'next/link'

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

interface TaskProgressListProps {
  tasks: Task[]
  timeEntries: TimeEntry[]
  quarterEnd: Date
}

const priorityConfig: Record<number, { label: string; color: string }> = {
  1: { label: 'P1', color: 'bg-red-500' },
  2: { label: 'P2', color: 'bg-orange-500' },
  3: { label: 'P3', color: 'bg-yellow-500' },
  4: { label: 'P4', color: 'bg-green-500' },
}

function calculatePrediction(task: Task, timeEntries: TimeEntry[], quarterEnd: Date) {
  const taskEntries = timeEntries.filter(e => e.task_id === task.id)
  const totalMinutes = taskEntries.reduce((sum, e) => sum + e.duration_minutes, 0)
  const loggedHours = totalMinutes / 60
  const progress = task.estimated_hours > 0
    ? Math.min(100, (loggedHours / task.estimated_hours) * 100)
    : 0

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

  if (weeklyVelocity > 0) {
    const weeksToComplete = remainingHours / weeklyVelocity
    predictedDate = addWeeks(now, weeksToComplete)
  }

  const canComplete = predictedDate && isBefore(predictedDate, quarterEnd)
  const weeksRemaining = differenceInWeeks(quarterEnd, now)
  const requiredWeeklyHours = weeksRemaining > 0 ? remainingHours / weeksRemaining : remainingHours

  let status: 'completed' | 'on_track' | 'at_risk' | 'no_data'
  if (progress >= 100) status = 'completed'
  else if (canComplete) status = 'on_track'
  else if (weeklyVelocity > 0) status = 'at_risk'
  else status = 'no_data'

  return {
    loggedHours,
    progress,
    weeklyVelocity,
    predictedDate,
    canComplete,
    requiredWeeklyHours,
    remainingHours,
    status,
  }
}

const statusConfig = {
  completed: { label: '已完成', icon: '✅', variant: 'default' as const },
  on_track: { label: '可完成', icon: '🎯', variant: 'default' as const },
  at_risk: { label: '需加速', icon: '⚠️', variant: 'destructive' as const },
  no_data: { label: '无数据', icon: '📊', variant: 'secondary' as const },
}

function TaskProgressCard({
  task,
  timeEntries,
  quarterEnd,
}: {
  task: Task
  timeEntries: TimeEntry[]
  quarterEnd: Date
}) {
  const [expanded, setExpanded] = useState(false)
  const prediction = calculatePrediction(task, timeEntries, quarterEnd)
  const priority = priorityConfig[task.priority]
  const status = statusConfig[prediction.status]

  return (
    <Card className="hover:bg-muted/30 transition-all">
      <CardContent className="py-2.5 md:py-3 px-3 md:px-4">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/tasks/${task.id}`} className="flex items-center gap-3 flex-1 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: task.color }}
            />
            <span className="font-medium text-sm truncate">{task.name}</span>
          </Link>
          <Badge className={`${priority.color} text-white text-xs shrink-0`}>{priority.label}</Badge>
          <Badge variant={status.variant} className="shrink-0 text-xs">
            {status.icon} {status.label}
          </Badge>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-muted rounded shrink-0"
          >
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${expanded ? '' : '-rotate-90'}`} />
          </button>
        </div>

        <div className="mt-1.5 ml-5.5">
          <div className="flex justify-between text-xs mb-1">
            <span className="tabular-nums text-muted-foreground">
              {prediction.loggedHours.toFixed(1)}h / {task.estimated_hours}h
            </span>
            <span className="tabular-nums font-medium">{Math.round(prediction.progress)}%</span>
          </div>
          <Progress value={prediction.progress} className="h-1 md:h-1.5" />
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-xs md:text-sm">
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
        )}
      </CardContent>
    </Card>
  )
}

export function TaskProgressList({ tasks, timeEntries, quarterEnd }: TaskProgressListProps) {
  const sortedTasks = [...tasks].sort((a, b) => a.priority - b.priority)

  if (sortedTasks.length === 0) {
    return null
  }

  return (
    <div className="space-y-1.5 md:space-y-2">
      {sortedTasks.map(task => (
        <TaskProgressCard
          key={task.id}
          task={task}
          timeEntries={timeEntries}
          quarterEnd={quarterEnd}
        />
      ))}
    </div>
  )
}
