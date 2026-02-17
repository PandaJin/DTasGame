import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar } from 'lucide-react'
import { CycleSwitcher } from '@/components/cycle/cycle-switcher'
import { AddTaskDialog } from '@/components/task/add-task-dialog'
import { AddTaskToCycleDialog } from '@/components/task/add-task-to-cycle-dialog'
import { QuarterCalendar } from '@/components/calendar/quarter-calendar'
import { PriorityAnalysis } from '@/components/analytics/priority-analysis'
import { WeeklyTrendChart } from '@/components/analytics/weekly-trend-chart'
import { TaskProgressList } from '@/components/analytics/task-progress-list'

interface CyclesPageProps {
  searchParams: Promise<{ id?: string; show_archived?: string }>
}

export default async function CyclesPage({ searchParams }: CyclesPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const showArchived = params.show_archived === 'true'

  const { data: allCycles } = await supabase
    .from('cycles')
    .select('*')
    .eq('user_id', user.id)
    .order('start_date', { ascending: false })

  const cycles = allCycles || []
  const visibleCycles = showArchived ? cycles : cycles.filter(c => !c.is_archived)

  // Determine which cycle to display
  let selectedCycleId = params.id
  if (!selectedCycleId || !cycles.find(c => c.id === selectedCycleId)) {
    const activeCycle = cycles.find(c => c.is_active)
    selectedCycleId = activeCycle?.id || visibleCycles[0]?.id || null
  }

  const cycle = selectedCycleId ? cycles.find(c => c.id === selectedCycleId) : null

  // If no cycle exists, show empty state
  if (!cycle) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold">周期</h1>
          <CycleSwitcher cycles={visibleCycles} currentCycleId={null} />
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">还没有周期</h3>
            <p className="text-muted-foreground mb-4">
              点击右上角 + 按钮创建你的第一个周期
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch cycle tasks
  const { data: cycleTasks } = await supabase
    .from('cycle_tasks')
    .select('*, task:tasks(*)')
    .eq('cycle_id', cycle.id)

  const tasks = cycleTasks
    ?.map(ct => ({ ...ct.task, weekly_target_hours: ct.weekly_target_hours ?? ct.task.weekly_target_hours }))
    .filter(t => t && !t.is_archived)
    .sort((a, b) => a.priority - b.priority) || []

  // Also check legacy quarter_id tasks
  const { data: legacyTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('quarter_id', cycle.id)
    .eq('is_archived', false)
    .order('priority')

  const taskIds = new Set(tasks.map(t => t.id))
  const allTasks = [...tasks]
  if (legacyTasks) {
    for (const lt of legacyTasks) {
      if (!taskIds.has(lt.id)) {
        allTasks.push(lt)
        taskIds.add(lt.id)
      }
    }
  }

  // Fetch time entries
  const { data: timeEntries } = allTasks.length > 0
    ? await supabase
        .from('time_entries')
        .select('*')
        .in('task_id', allTasks.map(t => t.id))
    : { data: [] }

  // Calculate progress
  const cycleStart = new Date(cycle.start_date)
  const cycleEnd = new Date(cycle.end_date)
  const now = new Date()
  const totalDays = Math.ceil((cycleEnd.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24))
  const elapsedDays = Math.max(0, Math.ceil((now.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)))
  const remainingDays = Math.max(0, totalDays - elapsedDays)
  const cycleProgress = Math.min(100, (elapsedDays / totalDays) * 100)

  const totalEstimated = allTasks.reduce((sum, t) => sum + t.estimated_hours, 0)
  const totalLoggedMinutes = (timeEntries || []).reduce((sum, e) => sum + e.duration_minutes, 0)
  const totalLogged = totalLoggedMinutes / 60
  const overallProgress = totalEstimated > 0 ? Math.min(100, (totalLogged / totalEstimated) * 100) : 0

  const existingTaskIds = allTasks.map(t => t.id)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header with cycle switcher */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-xl md:text-2xl font-bold truncate">{cycle.name}</h1>
          {cycle.is_active && <Badge>活跃</Badge>}
          {cycle.is_archived && <Badge variant="secondary">已归档</Badge>}
        </div>
        <CycleSwitcher cycles={visibleCycles} currentCycleId={cycle.id} />
      </div>

      {/* Cycle info */}
      <p className="text-sm text-muted-foreground -mt-2">
        {formatDate(cycle.start_date)} - {formatDate(cycle.end_date)}
        {remainingDays > 0 && !cycle.is_archived && ` · 剩余${remainingDays}天`}
      </p>

      {/* Progress bars */}
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">时间进度</span>
            <span className="font-medium tabular-nums">{Math.round(cycleProgress)}%</span>
          </div>
          <Progress value={cycleProgress} className="h-1.5 md:h-2" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              任务进度 · <span className="tabular-nums">{totalLogged.toFixed(1)}h / {totalEstimated.toFixed(1)}h</span>
            </span>
            <span className="font-medium tabular-nums">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-1.5 md:h-2" />
        </div>
      </div>

      {/* Activity calendar */}
      <QuarterCalendar
        quarterStart={cycleStart}
        quarterEnd={cycleEnd}
        tasks={allTasks}
        timeEntries={timeEntries || []}
      />

      {/* Integrated task list + progress prediction */}
      <div>
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-base md:text-lg font-semibold">任务进度</h2>
          <div className="flex gap-2">
            <AddTaskToCycleDialog cycleId={cycle.id} existingTaskIds={existingTaskIds} />
            <AddTaskDialog cycleId={cycle.id} />
          </div>
        </div>

        {allTasks.length > 0 ? (
          <TaskProgressList
            tasks={allTasks}
            timeEntries={timeEntries || []}
            quarterEnd={cycleEnd}
          />
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                还没有任务。添加已有任务或创建新任务开始追踪。
              </p>
              <div className="flex gap-2 justify-center flex-wrap">
                <AddTaskToCycleDialog cycleId={cycle.id} existingTaskIds={existingTaskIds} />
                <AddTaskDialog cycleId={cycle.id} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Analytics (priority + trend only, prediction is merged above) */}
      {allTasks.length > 0 && timeEntries && timeEntries.length > 0 && (
        <div className="space-y-4 md:space-y-6">
          <h2 className="text-base md:text-lg font-semibold">数据分析</h2>

          <PriorityAnalysis tasks={allTasks} timeEntries={timeEntries} />

          <WeeklyTrendChart
            tasks={allTasks}
            timeEntries={timeEntries}
            quarterStart={cycleStart}
            quarterEnd={cycleEnd}
          />
        </div>
      )}
    </div>
  )
}
