import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isToday, addWeeks, subWeeks } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { WeekNavigation } from '@/components/tracking/week-navigation'
import { WeekDayCard } from '@/components/tracking/week-day-card'
import { WeekTaskSummary } from '@/components/tracking/week-task-summary'

interface WeekPageProps {
  searchParams: Promise<{ week?: string }>
}

export default async function WeekPage({ searchParams }: WeekPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const targetDate = params.week ? new Date(params.week + 'T00:00:00') : new Date()
  const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(targetDate, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('priority')

  const weekStartStr = format(weekStart, 'yyyy-MM-dd')
  const weekEndStr = format(weekEnd, 'yyyy-MM-dd')

  const { data: weekEntries } = await supabase
    .from('time_entries')
    .select('*, task:tasks(*)')
    .in('task_id', tasks?.map(t => t.id) || [])
    .gte('date', weekStartStr)
    .lte('date', weekEndStr)
    .order('created_at', { ascending: false })

  const { data: activeCycle } = await supabase
    .from('cycles')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  let cycleTaskTargets: Record<string, number> = {}
  if (activeCycle) {
    const { data: cycleTasks } = await supabase
      .from('cycle_tasks')
      .select('task_id, weekly_target_hours')
      .eq('cycle_id', activeCycle.id)
    if (cycleTasks) {
      cycleTaskTargets = Object.fromEntries(
        cycleTasks
          .filter(ct => ct.weekly_target_hours)
          .map(ct => [ct.task_id, ct.weekly_target_hours])
      )
    }
  }

  const weekTotal = weekEntries?.reduce((sum, e) => sum + e.duration_minutes, 0) || 0

  const weeklyTarget = tasks?.reduce((sum, t) => {
    return sum + (cycleTaskTargets[t.id] || t.weekly_target_hours || 0)
  }, 0) || 0
  const weeklyTargetMinutes = weeklyTarget * 60
  const weekProgress = weeklyTargetMinutes > 0 ? Math.min(100, (weekTotal / weeklyTargetMinutes) * 100) : 0

  const taskWeekMinutes = new Map<string, number>()
  weekEntries?.forEach(e => {
    taskWeekMinutes.set(e.task_id, (taskWeekMinutes.get(e.task_id) || 0) + e.duration_minutes)
  })

  const taskSummary = tasks
    ?.map(task => ({
      task,
      weekMinutes: taskWeekMinutes.get(task.id) || 0,
      weekTarget: (cycleTaskTargets[task.id] || task.weekly_target_hours || 0) * 60,
    }))
    .filter(ts => ts.weekMinutes > 0 || ts.weekTarget > 0)
    .sort((a, b) => b.weekMinutes - a.weekMinutes) || []

  const entriesByDay = new Map<string, typeof weekEntries>()
  for (const day of days) {
    const dateStr = format(day, 'yyyy-MM-dd')
    entriesByDay.set(dateStr, weekEntries?.filter(e => e.date === dateStr) || [])
  }

  const { data: dailyNotes } = await supabase
    .from('daily_notes')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', weekStartStr)
    .lte('date', weekEndStr)

  const notesByDay = new Map(dailyNotes?.map(n => [n.date, n]) || [])

  const dailyTargetMinutes = weeklyTargetMinutes / 5

  const weekLabel = `${format(weekStart, 'M月d日', { locale: zhCN })} - ${format(weekEnd, 'M月d日', { locale: zhCN })}`
  const prevWeek = format(subWeeks(weekStart, 1), 'yyyy-MM-dd')
  const nextWeek = format(addWeeks(weekStart, 1), 'yyyy-MM-dd')
  const isCurrentWeek = days.some(d => isToday(d))

  const fmtDuration = (min: number) => {
    const totalMin = Math.round(min)
    const h = Math.floor(totalMin / 60)
    const m = totalMin % 60
    if (h === 0) return `${m}m`
    if (m === 0) return `${h}h`
    return `${h}h${m}m`
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Week header + navigation */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold">本周</h1>
        <WeekNavigation
          weekLabel={weekLabel}
          prevWeek={prevWeek}
          nextWeek={nextWeek}
          isCurrentWeek={isCurrentWeek}
        />
      </div>

      {/* Week summary - compact card */}
      <div className="rounded-xl border bg-card p-3 md:p-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">本周汇总</span>
          <span className="font-semibold tabular-nums">
            {fmtDuration(weekTotal)}
            {weeklyTarget > 0 && (
              <span className="text-muted-foreground font-normal ml-1">
                / {weeklyTarget.toFixed(1)}h
                <span className="ml-1">{Math.round(weekProgress)}%</span>
              </span>
            )}
          </span>
        </div>
        {weeklyTarget > 0 && <Progress value={weekProgress} className="h-1.5" />}
      </div>

      {/* Collapsible weekly task summary */}
      {taskSummary.length > 0 && (
        <WeekTaskSummary taskSummary={taskSummary} />
      )}

      {/* 7 day cards */}
      <div className="space-y-1.5 md:space-y-2">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayEntries = entriesByDay.get(dateStr) || []
          const dayTotal = dayEntries.reduce((sum, e) => sum + e.duration_minutes, 0)
          const dayProgress = dailyTargetMinutes > 0 ? Math.min(100, (dayTotal / dailyTargetMinutes) * 100) : 0
          const today = isToday(day)
          const dayLabel = format(day, 'EEEE M/d', { locale: zhCN })

          return (
            <WeekDayCard
              key={dateStr}
              dateStr={dateStr}
              dayLabel={dayLabel}
              dayTotal={dayTotal}
              dayProgress={dayProgress}
              dailyTargetMinutes={dailyTargetMinutes}
              dayEntries={dayEntries}
              isToday={today}
              tasks={tasks || []}
              dailyNote={notesByDay.get(dateStr) || null}
            />
          )
        })}
      </div>
    </div>
  )
}
