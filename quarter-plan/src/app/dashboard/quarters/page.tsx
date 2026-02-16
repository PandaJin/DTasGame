import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar } from 'lucide-react'
import Link from 'next/link'
import { QuarterActions } from '@/components/quarter/quarter-actions'

export default async function QuartersPage() {
  const supabase = await createClient()

  const { data: quarters } = await supabase
    .from('quarters')
    .select(`
      *,
      tasks:tasks(count)
    `)
    .order('start_date', { ascending: false })

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">季度管理</h1>
          <p className="text-muted-foreground">管理你的季度计划和任务</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/quarters/new">
            <Plus className="mr-2 h-4 w-4" />
            新建季度
          </Link>
        </Button>
      </div>

      {quarters && quarters.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quarters.map((quarter) => (
            <Card key={quarter.id} className={quarter.is_active ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {quarter.name}
                  </CardTitle>
                  {quarter.is_active && (
                    <Badge>活跃</Badge>
                  )}
                </div>
                <CardDescription>
                  {formatDate(quarter.start_date)} - {formatDate(quarter.end_date)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {quarter.tasks?.[0]?.count || 0} 个任务
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/quarters/${quarter.id}`}>
                        查看详情
                      </Link>
                    </Button>
                    <QuarterActions quarter={quarter} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">还没有季度计划</h3>
            <p className="text-muted-foreground mb-4">
              创建你的第一个季度计划，开始追踪重要任务的时间投入
            </p>
            <Button asChild>
              <Link href="/dashboard/quarters/new">
                <Plus className="mr-2 h-4 w-4" />
                新建季度
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
