'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { EditTaskDialog } from '@/components/task/edit-task-dialog'
import type { Task } from '@/types/database'

export function TaskDetailEditButton({ task }: { task: Task }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <EditTaskDialog task={task} open={open} onOpenChange={setOpen} />
    </>
  )
}
