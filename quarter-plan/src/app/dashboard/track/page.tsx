import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TimerWidgetWrapper } from '@/components/timer/timer-widget-wrapper'
import { TimeEntryForm } from '@/components/tracking/time-entry-form'
import { TimeEntryList } from '@/components/tracking/time-entry-list'
import { Calendar } from 'lucide-react'

export default async function TrackPage() {
  const supabase = await createClient()

  // 获取活跃季度
  const { data: activeQuarter } = await supabase
    .from('quarters')
    .select('*')
    .eq('is_active', true)
    .single()

  if (!activeQuarter) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <h2 className="text-xl font-semibold">没有活跃的季度</h2>
        <p className="text-muted-foreground">请先创建并激活一个季度</p>
      </div>
    )
  }

  // 获取任务
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('quarter_id', activeQuarter.id)
    .eq('is_archived', false)
    .order('priority')

  // 获取今日时间记录
  const today = new Date().toISOString().split('T')[0]
  const { data: todayEntries } = await supabase
    .from('time_entries')
    .select('*, task:tasks(*)')
    .in('task_id', tasks?.map(t => t.id) || [])
    .eq('date', today)
    .order('created_at', { ascending: false })

  // 获取本周时间记录
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay() + 1)
  weekStart.setHours(0, 0, 0, 0)

  const { data: weekEntries } = await supabase
    .from('time_entries')
    .select('*, task:tasks(*)')
    .in('task_id', tasks?.map(t => t.id) || [])
    .gte('date', weekStart.toISOString().split('T')[0])
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  // 计算今日和本周总计
  const todayTotal = todayEntries?.reduce((sum, e) => sum + e.duration_minutes, 0) || 0
  const weekTotal = weekEntries?.reduce((sum, e) => sum + e.duration_minutes, 0) || 0

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">时间追踪</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDate(new Date())}
          </p>
        </div>
        <TimeEntryForm tasks={tasks || []} />
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">今日投入</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.floor(todayTotal / 60)}h {todayTotal % 60}m
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">本周投入</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.floor(weekTotal / 60)}h {weekTotal % 60}m
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 计时器 */}
      <TimerWidgetWrapper tasks={tasks || []} />

      {/* 今日记录 */}
      <TimeEntryList
        entries={todayEntries || []}
        title="今日记录"
      />

      {/* 本周记录 */}
      {weekEntries && weekEntries.length > (todayEntries?.length || 0) && (
        <TimeEntryList
          entries={weekEntries.filter(e => e.date !== today) || []}
          title="本周其他记录"
        />
      )}
    </div>
  )
}
