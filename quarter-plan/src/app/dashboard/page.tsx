import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, ArrowRight, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 获取活跃季度
  const { data: activeQuarter } = await supabase
    .from('quarters')
    .select('*')
    .eq('is_active', true)
    .single()

  // 如果没有活跃季度
  if (!activeQuarter) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <h2 className="text-2xl font-bold">欢迎使用 QuarterPlan</h2>
        <p className="text-muted-foreground text-center max-w-md">
          开始创建你的第一个季度计划，设置重要任务并追踪时间投入
        </p>
        <Button asChild>
          <Link href="/dashboard/quarters">
            <Plus className="mr-2 h-4 w-4" />
            创建季度计划
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

  // 获取时间记录
  const { data: timeEntries } = await supabase
    .from('time_entries')
    .select('*')
    .in('task_id', tasks?.map(t => t.id) || [])

  // 计算进度
  const calculateTaskProgress = (taskId: string, estimatedHours: number) => {
    const entries = timeEntries?.filter(e => e.task_id === taskId) || []
    const totalMinutes = entries.reduce((sum, e) => sum + e.duration_minutes, 0)
    const loggedHours = totalMinutes / 60
    const progress = Math.min(100, (loggedHours / estimatedHours) * 100)
    return { loggedHours, progress }
  }

  // 计算本周投入
  const getThisWeekHours = (taskId: string) => {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() + 1) // 周一
    weekStart.setHours(0, 0, 0, 0)

    const entries = timeEntries?.filter(e =>
      e.task_id === taskId && new Date(e.date) >= weekStart
    ) || []

    return entries.reduce((sum, e) => sum + e.duration_minutes, 0) / 60
  }

  // 计算季度整体进度
  const quarterStart = new Date(activeQuarter.start_date)
  const quarterEnd = new Date(activeQuarter.end_date)
  const now = new Date()
  const totalDays = Math.ceil((quarterEnd.getTime() - quarterStart.getTime()) / (1000 * 60 * 60 * 24))
  const elapsedDays = Math.ceil((now.getTime() - quarterStart.getTime()) / (1000 * 60 * 60 * 24))
  const remainingDays = Math.max(0, totalDays - elapsedDays)
  const quarterProgress = Math.min(100, (elapsedDays / totalDays) * 100)

  // 计算本周总投入
  const thisWeekTotal = tasks?.reduce((sum, task) => sum + getThisWeekHours(task.id), 0) || 0
  const weeklyTarget = tasks?.reduce((sum, task) => sum + (task.weekly_target_hours || 0), 0) || 0

  const getStatusBadge = (progress: number, expectedProgress: number) => {
    const diff = progress - expectedProgress
    if (diff >= 10) return { label: '超前', variant: 'default' as const, icon: '🚀' }
    if (diff >= -5) return { label: '正常', variant: 'success' as const, icon: '✅' }
    if (diff >= -15) return { label: '有风险', variant: 'warning' as const, icon: '⚠️' }
    return { label: '落后', variant: 'destructive' as const, icon: '❌' }
  }

  const priorityColors: Record<number, string> = {
    1: 'bg-red-500',
    2: 'bg-orange-500',
    3: 'bg-yellow-500',
    4: 'bg-green-500',
  }

  return (
    <div className="space-y-6">
      {/* 季度进度 */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{activeQuarter.name} 进度概览</CardTitle>
              <CardDescription>剩余 {remainingDays} 天</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/quarters">
                管理季度 <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={quarterProgress} className="flex-1" />
            <span className="text-sm font-medium">{Math.round(quarterProgress)}%</span>
          </div>
        </CardContent>
      </Card>

      {/* 本周概览 */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>本周概览</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/track">
                查看详情 <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>已投入 {thisWeekTotal.toFixed(1)}h / 目标 {weeklyTarget.toFixed(1)}h</span>
              <span>{weeklyTarget > 0 ? Math.round((thisWeekTotal / weeklyTarget) * 100) : 0}%</span>
            </div>
            <Progress value={weeklyTarget > 0 ? (thisWeekTotal / weeklyTarget) * 100 : 0} />
          </div>
        </CardContent>
      </Card>

      {/* 任务进度 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">任务进度</h3>
          <Button size="sm" asChild>
            <Link href="/dashboard/quarters">
              <Plus className="mr-2 h-4 w-4" />
              添加任务
            </Link>
          </Button>
        </div>

        {tasks && tasks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => {
              const { loggedHours, progress } = calculateTaskProgress(task.id, task.estimated_hours)
              const thisWeek = getThisWeekHours(task.id)
              const status = getStatusBadge(progress, quarterProgress)

              return (
                <Card key={task.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base truncate">{task.name}</CardTitle>
                      <Badge variant="outline" className={priorityColors[task.priority]}>
                        P{task.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{loggedHours.toFixed(1)}h / {task.estimated_hours}h</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        本周: {thisWeek.toFixed(1)}h
                      </span>
                      <Badge variant={status.variant}>
                        {status.icon} {status.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              还没有任务。点击上方按钮添加你的第一个任务。
            </CardContent>
          </Card>
        )}
      </div>

      {/* 优先级提醒 */}
      {tasks && tasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">优先级提醒</h3>
          <div className="space-y-2">
            {tasks
              .filter(task => {
                const { progress } = calculateTaskProgress(task.id, task.estimated_hours)
                return progress < quarterProgress - 10 && task.priority <= 2
              })
              .map(task => (
                <Alert key={task.id} variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    P{task.priority}任务「{task.name}」进度落后，建议增加时间投入
                  </AlertDescription>
                </Alert>
              ))}
            {tasks.filter(task => {
              const { progress } = calculateTaskProgress(task.id, task.estimated_hours)
              return progress < quarterProgress - 10 && task.priority <= 2
            }).length === 0 && (
              <Alert>
                <AlertDescription>
                  ✅ 所有高优先级任务进度正常，继续保持！
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
