import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { PriorityAnalysis } from '@/components/analytics/priority-analysis'
import { WeeklyTrendChart } from '@/components/analytics/weekly-trend-chart'
import { ProgressPrediction } from '@/components/analytics/progress-prediction'

export default async function AnalyticsPage() {
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
        <h2 className="text-2xl font-bold">暂无活跃季度</h2>
        <p className="text-muted-foreground text-center max-w-md">
          请先创建或激活一个季度计划，才能查看数据分析
        </p>
        <Button asChild>
          <Link href="/dashboard/quarters">
            <ArrowLeft className="mr-2 h-4 w-4" />
            管理季度
          </Link>
        </Button>
      </div>
    )
  }

  // 获取季度的任务
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('quarter_id', activeQuarter.id)
    .eq('is_archived', false)
    .order('priority')

  // 获取所有时间记录
  const { data: timeEntries } = await supabase
    .from('time_entries')
    .select('*')
    .in('task_id', tasks?.map(t => t.id) || [])

  const quarterStart = new Date(activeQuarter.start_date)
  const quarterEnd = new Date(activeQuarter.end_date)

  // 计算总投入时间
  const totalMinutes = timeEntries?.reduce((sum, e) => sum + e.duration_minutes, 0) || 0
  const totalHours = totalMinutes / 60

  // 计算总预估时间
  const totalEstimated = tasks?.reduce((sum, t) => sum + t.estimated_hours, 0) || 0

  // 计算整体进度
  const overallProgress = totalEstimated > 0 ? (totalHours / totalEstimated) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">数据分析</h1>
          <p className="text-muted-foreground">{activeQuarter.name}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回仪表板
          </Link>
        </Button>
      </div>

      {/* 概览统计 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>总投入时间</CardDescription>
            <CardTitle className="text-3xl">{totalHours.toFixed(1)}h</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>总预估时间</CardDescription>
            <CardTitle className="text-3xl">{totalEstimated}h</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>整体进度</CardDescription>
            <CardTitle className="text-3xl">{Math.round(overallProgress)}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>任务数量</CardDescription>
            <CardTitle className="text-3xl">{tasks?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 优先级分析 */}
      <PriorityAnalysis
        tasks={tasks || []}
        timeEntries={timeEntries || []}
      />

      {/* 每周趋势 */}
      <WeeklyTrendChart
        tasks={tasks || []}
        timeEntries={timeEntries || []}
        quarterStart={quarterStart}
        quarterEnd={quarterEnd}
      />

      {/* 进度预测 */}
      <ProgressPrediction
        tasks={tasks || []}
        timeEntries={timeEntries || []}
        quarterEnd={quarterEnd}
      />
    </div>
  )
}
