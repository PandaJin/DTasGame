'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface DailyChartProps {
  data: Array<{ date: string; hours: number }>
}

export function TaskDailyChart({ data }: DailyChartProps) {
  const hasData = data.some(d => d.hours > 0)

  if (!hasData) {
    return (
      <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
        暂无数据
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10 }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10 }}
          width={30}
        />
        <Tooltip
          formatter={(value) => [`${value}h`, '投入']}
        />
        <Bar
          dataKey="hours"
          fill="#3b82f6"
          radius={[2, 2, 0, 0]}
          maxBarSize={12}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
