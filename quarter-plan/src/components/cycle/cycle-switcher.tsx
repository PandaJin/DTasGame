'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, MoreHorizontal, Check, Trash2, Square, Archive, ArchiveRestore } from 'lucide-react'
import type { Cycle } from '@/types/database'

interface CycleSwitcherProps {
  cycles: Cycle[]
  currentCycleId: string | null
}

export function CycleSwitcher({ cycles, currentCycleId }: CycleSwitcherProps) {
  const router = useRouter()
  const currentCycle = cycles.find(c => c.id === currentCycleId) || null

  const handleSwitch = (cycleId: string) => {
    router.push(`/dashboard/cycles?id=${cycleId}`)
  }

  return (
    <div className="flex items-center gap-2">
      {cycles.length > 0 ? (
        <Select value={currentCycleId || ''} onValueChange={handleSwitch}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择周期" />
          </SelectTrigger>
          <SelectContent>
            {cycles.map(cycle => (
              <SelectItem key={cycle.id} value={cycle.id}>
                <span className="flex items-center gap-2">
                  {cycle.name}
                  {cycle.is_active && <span className="text-xs text-primary">(活跃)</span>}
                  {cycle.is_archived && <span className="text-xs text-muted-foreground">(归档)</span>}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      <NewCycleButton />

      {currentCycle && (
        <CycleManageMenu cycle={currentCycle} />
      )}
    </div>
  )
}

function NewCycleButton() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAutoFill = () => {
    const now = new Date()
    const quarter = Math.ceil((now.getMonth() + 1) / 3)
    const year = now.getFullYear()
    setName(`${year} Q${quarter}`)

    const startMonth = (quarter - 1) * 3
    const start = new Date(year, startMonth, 1)
    const end = new Date(year, startMonth + 3, 0)
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (new Date(endDate) <= new Date(startDate)) {
      setError('结束日期必须晚于开始日期')
      setLoading(false)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('请先登录'); setLoading(false); return }

      const { data: newCycle, error: insertError } = await supabase
        .from('cycles')
        .insert({
          user_id: user.id,
          name,
          start_date: startDate,
          end_date: endDate,
          is_active: isActive,
        })
        .select()
        .single()

      if (insertError) {
        setError(insertError.message)
      } else {
        setOpen(false)
        setName(''); setStartDate(''); setEndDate('')
        router.push(`/dashboard/cycles?id=${newCycle.id}`)
        router.refresh()
      }
    } catch {
      setError('创建失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button size="icon" variant="outline" onClick={() => setOpen(true)} title="创建新周期">
        <Plus className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>创建新周期</DialogTitle>
              <DialogDescription>
                设置周期的基本信息
                <Button type="button" variant="link" className="ml-2 p-0 h-auto" onClick={handleAutoFill}>
                  自动填充当前季度
                </Button>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label>周期名称</Label>
                <Input
                  placeholder="例如：2026 Q1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>开始日期</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>结束日期</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="newCycleIsActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="newCycleIsActive" className="text-sm font-normal">设为活跃周期</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>取消</Button>
              <Button type="submit" disabled={loading}>
                {loading ? '创建中...' : '创建'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

function CycleManageMenu({ cycle }: { cycle: Cycle }) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSetActive = async () => {
    setLoading(true)
    await supabase
      .from('cycles')
      .update({ is_active: true, is_archived: false })
      .eq('id', cycle.id)
    router.refresh()
    setLoading(false)
  }

  const handleDeactivate = async () => {
    setLoading(true)
    await supabase
      .from('cycles')
      .update({ is_active: false })
      .eq('id', cycle.id)
    router.refresh()
    setLoading(false)
  }

  const handleArchive = async () => {
    setLoading(true)
    await supabase
      .from('cycles')
      .update({ is_archived: true, is_active: false })
      .eq('id', cycle.id)
    router.push('/dashboard/cycles')
    router.refresh()
    setLoading(false)
  }

  const handleUnarchive = async () => {
    setLoading(true)
    await supabase
      .from('cycles')
      .update({ is_archived: false })
      .eq('id', cycle.id)
    router.refresh()
    setLoading(false)
  }

  const handleDelete = async () => {
    setLoading(true)
    await supabase
      .from('cycles')
      .delete()
      .eq('id', cycle.id)
    setDeleteOpen(false)
    router.push('/dashboard/cycles')
    router.refresh()
    setLoading(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!cycle.is_active && !cycle.is_archived && (
            <DropdownMenuItem onClick={handleSetActive} disabled={loading}>
              <Check className="mr-2 h-4 w-4" />
              设为活跃
            </DropdownMenuItem>
          )}
          {cycle.is_active && (
            <DropdownMenuItem onClick={handleDeactivate} disabled={loading}>
              <Square className="mr-2 h-4 w-4" />
              结束周期
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {!cycle.is_archived ? (
            <DropdownMenuItem onClick={handleArchive} disabled={loading}>
              <Archive className="mr-2 h-4 w-4" />
              归档
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={handleUnarchive} disabled={loading}>
              <ArchiveRestore className="mr-2 h-4 w-4" />
              取消归档
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除周期「{cycle.name}」吗？这将同时删除所有相关的周期任务关联。此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? '删除中...' : '确认删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
