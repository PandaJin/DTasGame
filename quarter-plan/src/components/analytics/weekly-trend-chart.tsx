'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { endOfWeek, eachWeekOfInterval, format, isWithinInterval } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Task {
  id: string
  name: string
  color: string
  weekly_target_hours: number | null
}

interface TimeEntry {
  task_id: string
  date: string
  duration_minutes: number
}

interface WeeklyTrendChartProps {
  tasks: Task[]
  timeEntries: TimeEntry[]
  quarterStart: Date
  quarterEnd: Date
}

export function WeeklyTrendChart({ tasks, timeEntries, quarterStart, quarterEnd }: WeeklyTrendChartProps) {
  const weeks = eachWeekOfInterval(
    { start: quarterStart, end: quarterEnd },
    { weekStartsOn: 1 }
  )

  const weeklyTarget = tasks.reduce((sum, t) => sum + (t.weekly_target_hours || 0), 0)

  const chartData = weeks.map((weekStart, index) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })

    const weekEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date)
      return isWithinInterval(entryDate, { start: weekStart, end: weekEnd })
    })

    const totalHours = weekEntries.reduce((sum, e) => sum + e.duration_minutes, 0) / 60

    return {
      week: `W${index + 1}`,
      weekLabel: format(weekStart, 'M/d', { locale: zhCN }),
      actual: Math.round(totalHours * 10) / 10,
      target: weeklyTarget,
    }
  })

  const currentWeekIndex = weeks.findIndex(weekStart => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
    return isWithinInterval(new Date(), { start: weekStart, end: weekEnd })
  })

  return (
    <Card>
      <CardHeader className="pb-2 md:pb-4">
        <CardTitle className="text-sm md:text-base">每周趋势</CardTitle>
      </CardHeader>
      <CardContent className="px-2 md:px-6">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ left: -10, right: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10 }}
                width={35}
              />
              <Tooltip
                formatter={(value, name) => [
                  `${value}h`,
                  name === 'actual' ? '实际投入' : '目标'
                ]}
                labelFormatter={(label) => {
                  const week = chartData.find(d => d.week === label)
                  return week ? `${label} (${week.weekLabel})` : String(label)
                }}
              />
              <Legend
                formatter={(value) => value === 'actual' ? '实际投入' : '目标线'}
                wrapperStyle={{ fontSize: '12px' }}
              />
              <Bar
                dataKey="actual"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
              <ReferenceLine
                y={weeklyTarget}
                stroke="#94a3b8"
                strokeDasharray="5 5"
              />
              {currentWeekIndex >= 0 && (
                <ReferenceLine
                  x={`W${currentWeekIndex + 1}`}
                  stroke="#22c55e"
                  strokeDasharray="3 3"
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
            暂无数据
          </div>
        )}
      </CardContent>
    </Card>
  )
}
