'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import type { Task } from '@/types/database'

interface TimeEntryFormProps {
  tasks: Task[]
  defaultDate?: string
  triggerLabel?: string
  compact?: boolean
}

export function TimeEntryForm({ tasks, defaultDate, triggerLabel, compact }: TimeEntryFormProps) {
  const [open, setOpen] = useState(false)
  const [taskId, setTaskId] = useState('')
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const totalMinutes = (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0)

    if (totalMinutes <= 0) {
      setLoading(false)
      return
    }

    let started_at: string | null = null
    let ended_at: string | null = null

    if (startTime) {
      const startDate = new Date(`${date}T${startTime}:00`)
      started_at = startDate.toISOString()
      const endDate = new Date(startDate.getTime() + totalMinutes * 60 * 1000)
      ended_at = endDate.toISOString()
    }

    try {
      const { error } = await supabase.from('time_entries').insert({
        task_id: taskId,
        date,
        duration_minutes: totalMinutes,
        entry_type: 'manual',
        started_at,
        ended_at,
        notes: notes || null,
      })

      if (!error) {
        setOpen(false)
        setTaskId('')
        setHours('')
        setMinutes('')
        setStartTime('')
        setNotes('')
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {compact ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 min-h-[32px]">
            <Plus className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="sm" className="min-h-[36px]">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            {triggerLabel || '手动添加'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>添加时间记录</DialogTitle>
            <DialogDescription>手动记录你在某个任务上花费的时间</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>任务</Label>
              <Select value={taskId} onValueChange={setTaskId} required>
                <SelectTrigger className="h-11 md:h-9">
                  <SelectValue placeholder="选择任务" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: task.color }}
                        />
                        P{task.priority} - {task.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>日期</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="h-11 md:h-9"
                />
              </div>
              <div className="space-y-2">
                <Label>开始时间<span className="text-muted-foreground font-normal ml-1">（可选）</span></Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-11 md:h-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>时长</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  min="0"
                  placeholder="小时"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-20 h-11 md:h-9"
                />
                <span className="text-sm text-muted-foreground">小时</span>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="分钟"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="w-20 h-11 md:h-9"
                />
                <span className="text-sm text-muted-foreground">分钟</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>备注（可选）</Label>
              <Input
                placeholder="做了什么..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-11 md:h-9"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-11 md:h-9">
              取消
            </Button>
            <Button type="submit" disabled={loading || !taskId} className="h-11 md:h-9">
              {loading ? '添加中...' : '添加'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
