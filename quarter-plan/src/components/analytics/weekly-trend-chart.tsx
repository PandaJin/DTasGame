'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { startOfWeek, endOfWeek, eachWeekOfInterval, format, isWithinInterval } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Task {
  id: string
  name: string
  color: string
  weekly_target_hours: number
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
      <CardHeader>
        <CardTitle>每周趋势</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                label={{ value: '小时', angle: -90, position: 'insideLeft' }}
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
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
                activeDot={{ r: 6 }}
              />
              <ReferenceLine
                y={weeklyTarget}
                stroke="#94a3b8"
                strokeDasharray="5 5"
                label={{ value: '目标', position: 'right', fontSize: 12 }}
              />
              {currentWeekIndex >= 0 && (
                <ReferenceLine
                  x={`W${currentWeekIndex + 1}`}
                  stroke="#22c55e"
                  strokeDasharray="3 3"
                  label={{ value: '本周', position: 'top', fontSize: 12 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            暂无数据
          </div>
        )}
      </CardContent>
    </Card>
  )
}
