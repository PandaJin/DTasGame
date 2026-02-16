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

interface AddTaskDialogProps {
  quarterId: string
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

export function AddTaskDialog({ quarterId }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<string>('1')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [color, setColor] = useState('#3B82F6')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 获取季度信息以计算每周目标
      const { data: quarter } = await supabase
        .from('quarters')
        .select('start_date, end_date')
        .eq('id', quarterId)
        .single()

      let weeklyTarget = null
      if (quarter) {
        const start = new Date(quarter.start_date)
        const end = new Date(quarter.end_date)
        const totalWeeks = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7))
        weeklyTarget = parseFloat(estimatedHours) / totalWeeks
      }

      const { error } = await supabase.from('tasks').insert({
        quarter_id: quarterId,
        name,
        description: description || null,
        priority: parseInt(priority),
        estimated_hours: parseFloat(estimatedHours),
        weekly_target_hours: weeklyTarget,
        color,
      })

      if (!error) {
        setOpen(false)
        setName('')
        setDescription('')
        setPriority('1')
        setEstimatedHours('')
        setColor('#3B82F6')
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          添加任务
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>添加新任务</DialogTitle>
            <DialogDescription>
              为这个季度添加一个新的任务目标
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">任务名称</Label>
              <Input
                id="name"
                placeholder="例如：完成项目A的MVP"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">描述（可选）</Label>
              <Input
                id="description"
                placeholder="任务的详细描述"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">优先级</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
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
                <Label htmlFor="estimatedHours">预估总时间（小时）</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  min="1"
                  step="0.5"
                  placeholder="例如：100"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>颜色</Label>
              <div className="flex gap-2 flex-wrap">
                {TASK_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      color === c.value ? 'border-foreground' : 'border-transparent'
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '添加中...' : '添加任务'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
