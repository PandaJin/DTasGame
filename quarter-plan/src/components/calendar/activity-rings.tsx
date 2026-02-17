'use client'

import type { Task, TimeEntry } from '@/types/database'

// --- Ring Data Types ---

export interface DayRingData {
  highPriorityProgress: number  // 0-1+
  dailyCompletionProgress: number  // 0-1+
  absoluteTimeProgress: number  // 0-1+
  totalMinutes: number
  highPriorityMinutes: number
}

// --- Ring Calculation ---

export function calculateDayRings(
  date: string,
  tasks: Task[],
  timeEntries: TimeEntry[],
  weeklyTargetTotal: number,
  highPriorityWeeklyTarget: number,
): DayRingData {
  const dayEntries = timeEntries.filter(e => e.date === date)
  const totalMinutes = dayEntries.reduce((sum, e) => sum + e.duration_minutes, 0)

  // High-priority (P1+P2)
  const highPriorityTaskIds = new Set(
    tasks.filter(t => t.priority <= 2).map(t => t.id)
  )
  const highPriorityMinutes = dayEntries
    .filter(e => highPriorityTaskIds.has(e.task_id))
    .reduce((sum, e) => sum + e.duration_minutes, 0)

  const highPriorityDailyTarget = (highPriorityWeeklyTarget / 5) * 60 // minutes
  const highPriorityProgress = highPriorityDailyTarget > 0
    ? highPriorityMinutes / highPriorityDailyTarget
    : 0

  // Daily completion
  const dailyTargetMinutes = (weeklyTargetTotal / 5) * 60
  const dailyCompletionProgress = dailyTargetMinutes > 0
    ? totalMinutes / dailyTargetMinutes
    : 0

  // Absolute time (full = 8h = 480min)
  const absoluteTimeProgress = totalMinutes / 480

  return {
    highPriorityProgress,
    dailyCompletionProgress,
    absoluteTimeProgress,
    totalMinutes,
    highPriorityMinutes,
  }
}

// --- Ring Colors ---

const RING_COLORS = {
  outer: { main: '#FA114F', bg: 'rgba(250, 17, 79, 0.2)' },
  middle: { main: '#92E82A', bg: 'rgba(146, 232, 42, 0.2)' },
  inner: { main: '#00C7E6', bg: 'rgba(0, 199, 230, 0.2)' },
}

// --- ActivityRings Component ---

interface ActivityRingsProps {
  highPriorityProgress: number
  dailyCompletionProgress: number
  absoluteTimeProgress: number
  size?: number
  strokeWidth?: number
}

export function ActivityRings({
  highPriorityProgress,
  dailyCompletionProgress,
  absoluteTimeProgress,
  size = 36,
  strokeWidth = 3,
}: ActivityRingsProps) {
  const rings = [
    { radius: 15, progress: highPriorityProgress, ...RING_COLORS.outer },
    { radius: 11, progress: dailyCompletionProgress, ...RING_COLORS.middle },
    { radius: 7, progress: absoluteTimeProgress, ...RING_COLORS.inner },
  ]

  return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      {rings.map((ring, i) => {
        const circumference = 2 * Math.PI * ring.radius
        const clampedProgress = Math.min(1, Math.max(0, ring.progress))
        const dashoffset = circumference * (1 - clampedProgress)

        return (
          <g key={i}>
            <circle
              cx="18" cy="18" r={ring.radius}
              fill="none"
              stroke={ring.bg}
              strokeWidth={strokeWidth}
            />
            {clampedProgress > 0 && (
              <circle
                cx="18" cy="18" r={ring.radius}
                fill="none"
                stroke={ring.main}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={dashoffset}
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}

// --- Ring Legend (for day detail dialog) ---

interface RingLegendProps {
  highPriorityMinutes: number
  highPriorityTarget: number
  totalMinutes: number
  dailyTarget: number
}

export function RingLegend({
  highPriorityMinutes,
  highPriorityTarget,
  totalMinutes,
  dailyTarget,
}: RingLegendProps) {
  const fmt = (min: number) => {
    const h = Math.floor(min / 60)
    const m = Math.round(min % 60)
    if (h === 0) return `${m}分钟`
    if (m === 0) return `${h}小时`
    return `${h}h${m}m`
  }

  const items = [
    {
      color: RING_COLORS.outer.main,
      label: '高优先级',
      value: `${fmt(highPriorityMinutes)} / ${fmt(highPriorityTarget)}`,
    },
    {
      color: RING_COLORS.middle.main,
      label: '每日目标',
      value: `${fmt(totalMinutes)} / ${fmt(dailyTarget)}`,
    },
    {
      color: RING_COLORS.inner.main,
      label: '工作时长',
      value: `${fmt(totalMinutes)} / 8小时`,
    },
  ]

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">{item.label}</span>
          </div>
          <span className="font-medium">{item.value}</span>
        </div>
      ))}
    </div>
  )
}
