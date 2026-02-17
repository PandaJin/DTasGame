'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e']
const RECOMMENDED_DISTRIBUTION: Record<number, number> = { 1: 40, 2: 30, 3: 20, 4: 10 }

interface Task {
  id: string
  name: string
  priority: number
  estimated_hours: number
}

interface TimeEntry {
  task_id: string
  duration_minutes: number
}

interface PriorityAnalysisProps {
  tasks: Task[]
  timeEntries: TimeEntry[]
}

export function PriorityAnalysis({ tasks, timeEntries }: PriorityAnalysisProps) {
  const calculateDistribution = () => {
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 }
    let totalMinutes = 0

    tasks.forEach(task => {
      const taskEntries = timeEntries.filter(e => e.task_id === task.id)
      const taskMinutes = taskEntries.reduce((sum, e) => sum + e.duration_minutes, 0)
      distribution[task.priority] += taskMinutes
      totalMinutes += taskMinutes
    })

    const percentages: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 }
    if (totalMinutes > 0) {
      for (const p of [1, 2, 3, 4]) {
        percentages[p] = Math.round((distribution[p] / totalMinutes) * 100)
      }
    }

    return { distribution, percentages, totalMinutes }
  }

  const generateInsights = (actual: Record<number, number>) => {
    const insights: Array<{ type: 'warning' | 'success' | 'info'; message: string }> = []

    if (actual[1] < RECOMMENDED_DISTRIBUTION[1] - 10) {
      const p1Tasks = tasks.filter(t => t.priority === 1)
      if (p1Tasks.length > 0) {
        insights.push({
          type: 'warning',
          message: `P1任务时间投入仅占 ${actual[1]}%，远低于建议的 ${RECOMMENDED_DISTRIBUTION[1]}%，建议增加投入`
        })
      }
    }

    if (actual[3] + actual[4] > 40) {
      insights.push({
        type: 'warning',
        message: `P3/P4任务占用了 ${actual[3] + actual[4]}% 的时间，建议将时间转移到更高优先级任务`
      })
    }

    if (actual[1] >= RECOMMENDED_DISTRIBUTION[1] - 5 && actual[1] <= RECOMMENDED_DISTRIBUTION[1] + 5) {
      insights.push({
        type: 'success',
        message: 'P1任务时间分配合理，保持良好的工作重心'
      })
    }

    if (insights.length === 0) {
      insights.push({
        type: 'info',
        message: '继续记录时间，系统将为你提供更准确的分析建议'
      })
    }

    return insights
  }

  const { percentages, totalMinutes } = calculateDistribution()
  const insights = generateInsights(percentages)

  const pieData = [
    { name: 'P1', value: percentages[1], color: COLORS[0] },
    { name: 'P2', value: percentages[2], color: COLORS[1] },
    { name: 'P3', value: percentages[3], color: COLORS[2] },
    { name: 'P4', value: percentages[4], color: COLORS[3] },
  ].filter(d => d.value > 0)

  const comparisonData = [
    { priority: 'P1', actual: percentages[1], recommended: RECOMMENDED_DISTRIBUTION[1] },
    { priority: 'P2', actual: percentages[2], recommended: RECOMMENDED_DISTRIBUTION[2] },
    { priority: 'P3', actual: percentages[3], recommended: RECOMMENDED_DISTRIBUTION[3] },
    { priority: 'P4', actual: percentages[4], recommended: RECOMMENDED_DISTRIBUTION[4] },
  ]

  return (
    <div className="grid gap-3 md:gap-6 grid-cols-1 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-sm md:text-base">时间分布</CardTitle>
        </CardHeader>
        <CardContent className="px-2 md:px-6">
          {totalMinutes > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={{ strokeWidth: 1 }}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              暂无数据
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-sm md:text-base">优先级分析</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {comparisonData.map(item => (
              <div key={item.priority} className="space-y-1">
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="font-medium">{item.priority}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {item.actual}% / 建议{item.recommended}%
                  </span>
                </div>
                <div className="h-1.5 md:h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${item.actual}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-sm md:text-base">洞察与建议</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {insights.map((insight, i) => (
            <Alert key={i} variant={insight.type === 'warning' ? 'destructive' : 'default'}>
              <AlertDescription className="text-xs md:text-sm">{insight.message}</AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
