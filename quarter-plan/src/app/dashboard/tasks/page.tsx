import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ListTodo, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { AddTaskDialog } from '@/components/task/add-task-dialog'
import { startOfWeek, endOfWeek, format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'

interface TasksPageProps {
  searchParams: Promise<{ filter?: string }>
}

const priorityConfig: Record<number, { label: string; color: string; textColor: string }> = {
  1: { label: 'P1', color: 'bg-red-500', textColor: 'text-red-600' },
  2: { label: 'P2', color: 'bg-orange-500', textColor: 'text-orange-600' },
  3: { label: 'P3', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
  4: { label: 'P4', color: 'bg-green-500', textColor: 'text-green-600' },
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const params = await searchParams
  const filter = params.filter || 'active'
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  let query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('priority')
    .order('sort_order')

  if (filter === 'active') {
    query = query.eq('is_archived', false)
  } else if (filter === 'archived') {
    query = query.eq('is_archived', true)
  }

  const { data: tasks } = await query

  const taskIds = tasks?.map(t => t.id) || []
  const { data: allEntries } = taskIds.length > 0
    ? await supabase
        .from('time_entries')
        .select('task_id, duration_minutes, date')
        .in('task_id', taskIds)
    : { data: [] }

  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  const weekStartStr = format(weekStart, 'yyyy-MM-dd')
  const weekEndStr = format(weekEnd, 'yyyy-MM-dd')

  const tasksWithProgress = tasks?.map(task => {
    const entries = allEntries?.filter(e => e.task_id === task.id) || []
    const totalMinutes = entries.reduce((sum, e) => sum + e.duration_minutes, 0)
    const weekMinutes = entries
      .filter(e => e.date >= weekStartStr && e.date <= weekEndStr)
      .reduce((sum, e) => sum + e.duration_minutes, 0)
    const loggedHours = totalMinutes / 60
    const progress = task.estimated_hours > 0
      ? Math.min(100, (loggedHours / task.estimated_hours) * 100)
      : 0

    return {
      ...task,
      loggedHours,
      progress,
      weekHours: weekMinutes / 60,
    }
  }) || []

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold">任务</h1>
        <AddTaskDialog />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { key: 'active', label: '进行中' },
          { key: 'archived', label: '已归档' },
        ].map(f => (
          <Button
            key={f.key}
            variant={filter === f.key ? 'default' : 'outline'}
            size="sm"
            asChild
          >
            <Link href={`/dashboard/tasks?filter=${f.key}`}>{f.label}</Link>
          </Button>
        ))}
      </div>

      {/* Task list */}
      {tasksWithProgress.length > 0 ? (
        <div className="space-y-2 md:space-y-3">
          {tasksWithProgress.map((task) => {
            const priority = priorityConfig[task.priority]

            return (
              <Link key={task.id} href={`/dashboard/tasks/${task.id}`} className="block group">
                <Card className="transition-all hover:bg-muted/30 active:scale-[0.98] md:active:scale-100">
                  <CardContent className="py-3 md:py-4 px-4 md:px-6">
                    <div className="flex items-center gap-3">
                      {/* Color dot + Priority */}
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: task.color }}
                        />
                        <span className={`text-[10px] font-bold ${priority.textColor}`}>
                          {priority.label}
                        </span>
                      </div>

                      {/* Main content */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm md:text-base truncate">{task.name}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" />
                        </div>

                        <Progress value={task.progress} className="h-1.5 md:h-2" />

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-3">
                            <span>{task.loggedHours.toFixed(1)}h / {task.estimated_hours}h</span>
                            {task.weekHours > 0 && (
                              <span className="text-foreground/70">本周 {task.weekHours.toFixed(1)}h</span>
                            )}
                          </div>
                          <span className="font-medium tabular-nums">{Math.round(task.progress)}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <ListTodo className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {filter === 'archived' ? '没有已归档的任务' : '还没有任务'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {filter === 'active' && '创建你的第一个任务，开始追踪时间投入'}
            </p>
            {filter === 'active' && <AddTaskDialog />}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
