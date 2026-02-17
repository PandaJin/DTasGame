'use client'

import { useState, useEffect } from 'react'
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
import { Plus, Check } from 'lucide-react'
import type { Task } from '@/types/database'

interface AddTaskToCycleDialogProps {
  cycleId: string
  existingTaskIds: string[]
}

export function AddTaskToCycleDialog({ cycleId, existingTaskIds }: AddTaskToCycleDialogProps) {
  const [open, setOpen] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [weeklyTarget, setWeeklyTarget] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!open) return
    const loadTasks = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('priority')
      if (data) {
        setTasks(data.filter(t => !existingTaskIds.includes(t.id)))
      }
    }
    loadTasks()
  }, [open, supabase, existingTaskIds])

  const handleAdd = async () => {
    if (!selectedTaskId) return
    setLoading(true)

    try {
      await supabase.from('cycle_tasks').insert({
        cycle_id: cycleId,
        task_id: selectedTaskId,
        weekly_target_hours: weeklyTarget ? parseFloat(weeklyTarget) : null,
      })
      setOpen(false)
      setSelectedTaskId(null)
      setWeeklyTarget('')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="min-h-[36px]">
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          <span className="hidden sm:inline">从已有任务添加</span>
          <span className="sm:hidden">已有任务</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加任务到周期</DialogTitle>
          <DialogDescription>选择一个已有的任务添加到此周期</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {tasks.length > 0 ? (
            <div className="space-y-1 max-h-[50vh] overflow-auto -mx-1 px-1">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-lg text-sm transition-colors text-left min-h-[44px] ${
                    selectedTaskId === task.id
                      ? 'bg-primary/10 ring-1 ring-primary'
                      : 'hover:bg-muted active:bg-muted/80'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: task.color }}
                  />
                  <span className="flex-1 truncate">{task.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">P{task.priority}</span>
                  {selectedTaskId === task.id && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-sm py-6">
              没有可添加的任务
            </p>
          )}

          {selectedTaskId && (
            <div className="space-y-2">
              <Label>每周目标时间（小时，可选）</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                placeholder="例如：5"
                value={weeklyTarget}
                onChange={(e) => setWeeklyTarget(e.target.value)}
                className="h-11 md:h-9"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="h-11 md:h-9">取消</Button>
          <Button onClick={handleAdd} disabled={loading || !selectedTaskId} className="h-11 md:h-9">
            {loading ? '添加中...' : '添加'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
