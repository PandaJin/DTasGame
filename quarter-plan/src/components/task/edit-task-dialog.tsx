'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Task } from '@/types/database'

interface EditTaskDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TASK_COLORS = [
  { value: '#3B82F6', label: '蓝色' },
  { value: '#EF4444', label: '红色' },
  { value: '#F97316', label: '橙色' },
  { value: '#EAB308', label: '黄色' },
  { value: '#22C55E', label: '绿色' },
  { value: '#8B5CF6', label: '紫色' },
  { value: '#EC4899', label: '粉色' },
  { value: '#6B7280', label: '灰色' },
]

export function EditTaskDialog({ task, open, onOpenChange }: EditTaskDialogProps) {
  const [name, setName] = useState(task.name)
  const [description, setDescription] = useState(task.description || '')
  const [priority, setPriority] = useState<string>(String(task.priority))
  const [estimatedHours, setEstimatedHours] = useState(String(task.estimated_hours))
  const [color, setColor] = useState(task.color)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          name,
          description: description || null,
          priority: parseInt(priority),
          estimated_hours: parseFloat(estimatedHours),
          color,
        })
        .eq('id', task.id)

      if (!error) {
        onOpenChange(false)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>编辑任务</DialogTitle>
            <DialogDescription>
              修改任务的详细信息
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">任务名称</Label>
              <Input
                id="edit-name"
                placeholder="例如：完成项目A的MVP"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 md:h-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">描述（可选）</Label>
              <Textarea
                id="edit-description"
                placeholder="任务的详细描述"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-priority">优先级</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="h-11 md:h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">P1 - 最高</SelectItem>
                    <SelectItem value="2">P2 - 高</SelectItem>
                    <SelectItem value="3">P3 - 中</SelectItem>
                    <SelectItem value="4">P4 - 低</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-estimatedHours">预估时间（小时）</Label>
                <Input
                  id="edit-estimatedHours"
                  type="number"
                  min="1"
                  step="0.5"
                  placeholder="例如：100"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  required
                  className="h-11 md:h-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>颜色</Label>
              <div className="flex gap-2.5 flex-wrap">
                {TASK_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`w-9 h-9 md:w-8 md:h-8 rounded-full border-2 transition-transform active:scale-90 ${
                      color === c.value ? 'border-foreground scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.value }}
                    onClick={() => setColor(c.value)}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-11 md:h-9">
              取消
            </Button>
            <Button type="submit" disabled={loading} className="h-11 md:h-9">
              {loading ? '保存中...' : '保存修改'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
