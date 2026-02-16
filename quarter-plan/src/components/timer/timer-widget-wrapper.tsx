'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TimerWidget } from './timer-widget'
import type { Task } from '@/types/database'

interface TimerWidgetWrapperProps {
  tasks: Task[]
}

export function TimerWidgetWrapper({ tasks }: TimerWidgetWrapperProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSave = async (taskId: string, durationMinutes: number) => {
    const today = new Date().toISOString().split('T')[0]

    await supabase.from('time_entries').insert({
      task_id: taskId,
      date: today,
      duration_minutes: durationMinutes,
      entry_type: 'timer',
      started_at: new Date(Date.now() - durationMinutes * 60 * 1000).toISOString(),
      ended_at: new Date().toISOString(),
    })

    router.refresh()
  }

  return <TimerWidget tasks={tasks} onSave={handleSave} />
}
