'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
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
import { MoreHorizontal, Archive, ArchiveRestore, Trash2 } from 'lucide-react'
import type { Task } from '@/types/database'

export function TaskActions({ task }: { task: Task }) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleArchive = async () => {
    setLoading(true)
    await supabase
      .from('tasks')
      .update({ is_archived: true })
      .eq('id', task.id)
    router.refresh()
    setLoading(false)
  }

  const handleUnarchive = async () => {
    setLoading(true)
    await supabase
      .from('tasks')
      .update({ is_archived: false })
      .eq('id', task.id)
    router.refresh()
    setLoading(false)
  }

  const handleDelete = async () => {
    setLoading(true)
    await supabase.from('tasks').delete().eq('id', task.id)
    setDeleteOpen(false)
    router.push('/dashboard/tasks')
    router.refresh()
    setLoading(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="min-h-[36px] min-w-[36px]">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!task.is_archived ? (
            <DropdownMenuItem onClick={handleArchive} disabled={loading}>
              <Archive className="mr-2 h-4 w-4" />
              归档任务
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
            删除任务
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除任务「{task.name}」吗？这将同时删除所有相关的时间记录和周期关联。此操作无法撤销。
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
