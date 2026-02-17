import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { TaskDetailEditButton } from './edit-button'
import { TaskDailyChart } from './daily-chart'
import { TimeEntryList } from '@/components/tracking/time-entry-list'
import { subDays, format, eachDayOfInterval } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface TaskDetailPageProps {
  params: Promise<{ id: string }>
}

const priorityConfig: Record<number, { label: string; color: string }> = {
  1: { label: 'P1', color: 'bg-red-500' },
  2: { label: 'P2', color: 'bg-orange-500' },
  3: { label: 'P3', color: 'bg-yellow-500' },
  4: { label: 'P4', color: 'bg-green-500' },
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: task } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single()

  if (!task) notFound()

  const { data: timeEntries } = await supabase
    .from('time_entries')
    .select('*, task:tasks(*)')
    .eq('task_id', id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  const { data: cycleTasks } = await supabase
    .from('cycle_tasks')
    .select('*, cycle:cycles(*)')
    .eq('task_id', id)

  const totalMinutes = timeEntries?.reduce((sum, e) => sum + e.duration_minutes, 0) || 0
  const loggedHours = totalMinutes / 60
  const progress = task.estimated_hours > 0
    ? Math.min(100, (loggedHours / task.estimated_hours) * 100)
    : 0

  const now = new Date()
  const thirtyDaysAgo = subDays(now, 29)
  const days = eachDayOfInterval({ start: thirtyDaysAgo, end: now })

  const dailyData = days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const dayMinutes = timeEntries
      ?.filter(e => e.date === dateStr)
      .reduce((sum, e) => sum + e.duration_minutes, 0) || 0

    return {
      date: format(day, 'M/d', { locale: zhCN }),
      hours: Math.round((dayMinutes / 60) * 10) / 10,
    }
  })

  const priority = priorityConfig[task.priority]

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3 md:gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0 min-h-[44px] min-w-[44px] mt-0.5">
          <Link href="/dashboard/tasks">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: task.color }}
            />
            <h1 className="text-xl md:text-2xl font-bold truncate">{task.name}</h1>
            <TaskDetailEditButton task={task} />
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
            <Badge className={`${priority.color} text-white text-xs`}>{priority.label}</Badge>
            <span>预估 {task.estimated_hours}h</span>
            <span>·</span>
            <span>已投入 {loggedHours.toFixed(1)}h</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2.5 md:h-3" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span className="tabular-nums">{loggedHours.toFixed(1)}h / {task.estimated_hours}h</span>
          <span className="font-medium tabular-nums">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Cycles */}
      {cycleTasks && cycleTasks.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">所属周期:</span>
          {cycleTasks.map((ct: { id: string; cycle: { id: string; name: string } }) => (
            <Link key={ct.id} href={`/dashboard/cycles/${ct.cycle.id}`}>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                {ct.cycle.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Daily chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm md:text-base">每日进展（近30天）</CardTitle>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <TaskDailyChart data={dailyData} />
        </CardContent>
      </Card>

      {/* Time entries */}
      <TimeEntryList entries={timeEntries || []} title="时间记录" />
    </div>
  )
}
