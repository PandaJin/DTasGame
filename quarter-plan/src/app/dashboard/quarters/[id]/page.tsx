import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Plus, Calendar } from 'lucide-react'
import Link from 'next/link'
import { TaskList } from '@/components/task/task-list'
import { AddTaskDialog } from '@/components/task/add-task-dialog'

interface QuarterDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function QuarterDetailPage({ params }: QuarterDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: quarter } = await supabase
    .from('quarters')
    .select('*')
    .eq('id', id)
    .single()

  if (!quarter) {
    notFound()
  }

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('quarter_id', id)
    .eq('is_archived', false)
    .order('priority')
    .order('sort_order')

  // 获取时间记录
  const { data: timeEntries } = await supabase
    .from('time_entries')
    .select('*')
    .in('task_id', tasks?.map(t => t.id) || [])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // 计算季度进度
  const quarterStart = new Date(quarter.start_date)
  const quarterEnd = new Date(quarter.end_date)
  const now = new Date()
  const totalDays = Math.ceil((quarterEnd.getTime() - quarterStart.getTime()) / (1000 * 60 * 60 * 24))
  const elapsedDays = Math.max(0, Math.ceil((now.getTime() - quarterStart.getTime()) / (1000 * 60 * 60 * 24)))
  const remainingDays = Math.max(0, totalDays - elapsedDays)
  const quarterProgress = Math.min(100, (elapsedDays / totalDays) * 100)

  // 计算每个任务的进度
  const tasksWithProgress = tasks?.map(task => {
    const entries = timeEntries?.filter(e => e.task_id === task.id) || []
    const totalMinutes = entries.reduce((sum, e) => sum + e.duration_minutes, 0)
    const loggedHours = totalMinutes / 60
    const progress = Math.min(100, (loggedHours / task.estimated_hours) * 100)

    return {
      ...task,
      loggedHours,
      progress,
    }
  }) || []

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/quarters">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{quarter.name}</h1>
            {quarter.is_active && <Badge>活跃</Badge>}
          </div>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDate(quarter.start_date)} - {formatDate(quarter.end_date)}
          </p>
        </div>
      </div>

      {/* 季度进度卡片 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">季度进度</CardTitle>
          <CardDescription>剩余 {remainingDays} 天</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={quarterProgress} className="flex-1" />
            <span className="text-sm font-medium w-12 text-right">
              {Math.round(quarterProgress)}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 任务列表 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">任务列表</h2>
          <AddTaskDialog quarterId={quarter.id} />
        </div>

        {tasksWithProgress.length > 0 ? (
          <TaskList tasks={tasksWithProgress} />
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                还没有任务。添加你的第一个任务开始追踪。
              </p>
              <AddTaskDialog quarterId={quarter.id} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
