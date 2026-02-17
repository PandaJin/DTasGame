'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ActivityRings, calculateDayRings } from './activity-rings'
import { DayDetailDialog } from './day-detail-dialog'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachMonthOfInterval,
  format,
  getDay,
  isToday,
  isBefore,
  isAfter,
  isSameMonth,
} from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Task, TimeEntry } from '@/types/database'

interface QuarterCalendarProps {
  quarterStart: Date
  quarterEnd: Date
  tasks: Task[]
  timeEntries: TimeEntry[]
}

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六']

export function QuarterCalendar({
  quarterStart,
  quarterEnd,
  tasks,
  timeEntries,
}: QuarterCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const months = eachMonthOfInterval({ start: quarterStart, end: quarterEnd })

  // Mobile: track which month is shown
  const [mobileMonthIdx, setMobileMonthIdx] = useState(() => {
    const now = new Date()
    const idx = months.findIndex(m => isSameMonth(m, now))
    return idx >= 0 ? idx : 0
  })

  const weeklyTargetTotal = tasks.reduce((sum, t) => sum + (t.weekly_target_hours || 0), 0)
  const highPriorityWeeklyTarget = tasks
    .filter(t => t.priority <= 2)
    .reduce((sum, t) => sum + (t.weekly_target_hours || 0), 0)

  const ringDataMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof calculateDayRings>>()
    const days = eachDayOfInterval({ start: quarterStart, end: quarterEnd })
    for (const day of days) {
      const dateStr = format(day, 'yyyy-MM-dd')
      map.set(dateStr, calculateDayRings(dateStr, tasks, timeEntries, weeklyTargetTotal, highPriorityWeeklyTarget))
    }
    return map
  }, [quarterStart, quarterEnd, tasks, timeEntries, weeklyTargetTotal, highPriorityWeeklyTarget])

  const selectedRingData = selectedDate ? ringDataMap.get(selectedDate) : null
  const selectedDayEntries = selectedDate
    ? timeEntries.filter(e => e.date === selectedDate)
    : []

  const dailyTarget = (weeklyTargetTotal / 5) * 60
  const highPriorityDailyTarget = (highPriorityWeeklyTarget / 5) * 60

  return (
    <>
      <Card>
        <CardHeader className="pb-2 md:pb-3">
          <CardTitle className="text-base">活动日历</CardTitle>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          {/* Desktop: all months in grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {months.map((monthStart) => (
              <MonthGrid
                key={monthStart.toISOString()}
                monthStart={monthStart}
                quarterStart={quarterStart}
                quarterEnd={quarterEnd}
                ringDataMap={ringDataMap}
                onDayClick={setSelectedDate}
              />
            ))}
          </div>

          {/* Mobile: single month with nav */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={mobileMonthIdx <= 0}
                onClick={() => setMobileMonthIdx(i => Math.max(0, i - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex gap-1">
                {months.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => setMobileMonthIdx(i)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      i === mobileMonthIdx
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {format(m, 'M月')}
                  </button>
                ))}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={mobileMonthIdx >= months.length - 1}
                onClick={() => setMobileMonthIdx(i => Math.min(months.length - 1, i + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {months[mobileMonthIdx] && (
              <MonthGrid
                monthStart={months[mobileMonthIdx]}
                quarterStart={quarterStart}
                quarterEnd={quarterEnd}
                ringDataMap={ringDataMap}
                onDayClick={setSelectedDate}
                large
              />
            )}
          </div>

          {/* Ring legend */}
          <div className="flex items-center justify-center gap-4 md:gap-6 mt-3 md:mt-4 pt-3 md:pt-4 border-t text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FA114F' }} />
              高优先级
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#92E82A' }} />
              每日目标
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#00C7E6' }} />
              工作时长
            </span>
          </div>
        </CardContent>
      </Card>

      {selectedDate && selectedRingData && (
        <DayDetailDialog
          date={selectedDate}
          tasks={tasks}
          dayEntries={selectedDayEntries}
          highPriorityProgress={selectedRingData.highPriorityProgress}
          dailyCompletionProgress={selectedRingData.dailyCompletionProgress}
          absoluteTimeProgress={selectedRingData.absoluteTimeProgress}
          highPriorityMinutes={selectedRingData.highPriorityMinutes}
          totalMinutes={selectedRingData.totalMinutes}
          highPriorityDailyTarget={highPriorityDailyTarget}
          dailyTarget={dailyTarget}
          open={!!selectedDate}
          onOpenChange={(open) => { if (!open) setSelectedDate(null) }}
        />
      )}
    </>
  )
}

// --- Month Grid Sub-component ---

interface MonthGridProps {
  monthStart: Date
  quarterStart: Date
  quarterEnd: Date
  ringDataMap: Map<string, ReturnType<typeof calculateDayRings>>
  onDayClick: (date: string) => void
  large?: boolean
}

function MonthGrid({
  monthStart,
  quarterStart,
  quarterEnd,
  ringDataMap,
  onDayClick,
  large = false,
}: MonthGridProps) {
  const monthEnd = endOfMonth(monthStart)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const firstDayOfWeek = getDay(monthStart)

  const paddingDays = Array.from({ length: firstDayOfWeek }, (_, i) => i)

  const ringSize = large ? 34 : 28
  const strokeWidth = large ? 3 : 2.5

  return (
    <div>
      {!large && (
        <h3 className="text-sm font-medium mb-2 text-center">
          {format(monthStart, 'yyyy年M月', { locale: zhCN })}
        </h3>
      )}

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-center text-xs text-muted-foreground py-1">
            {label}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {paddingDays.map((i) => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}

        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const inQuarter = !isBefore(day, quarterStart) && !isAfter(day, quarterEnd)
          const ringData = ringDataMap.get(dateStr)
          const today = isToday(day)

          return (
            <button
              key={dateStr}
              onClick={() => inQuarter && onDayClick(dateStr)}
              disabled={!inQuarter}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-md p-0.5 transition-colors
                ${inQuarter ? 'hover:bg-muted cursor-pointer active:bg-muted/80' : 'opacity-30 cursor-default'}
                ${today ? 'ring-2 ring-primary ring-offset-1' : ''}
                ${large ? 'min-h-[44px]' : ''}
              `}
            >
              <span className={`text-[10px] leading-none mb-0.5 ${today ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                {format(day, 'd')}
              </span>
              {inQuarter && ringData ? (
                <ActivityRings
                  highPriorityProgress={ringData.highPriorityProgress}
                  dailyCompletionProgress={ringData.dailyCompletionProgress}
                  absoluteTimeProgress={ringData.absoluteTimeProgress}
                  size={ringSize}
                  strokeWidth={strokeWidth}
                />
              ) : (
                <div style={{ width: ringSize, height: ringSize }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
