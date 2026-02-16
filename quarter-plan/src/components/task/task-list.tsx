'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Trash2, Clock } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Task } from '@/types/database'

interface TaskWithProgress extends Task {
  loggedHours: number
  progress: number
}

interface TaskListProps {
  tasks: TaskWithProgress[]
}

const priorityConfig: Record<number, { label: string; color: string }> = {
  1: { label: 'P1', color: 'bg-red-500 hover:bg-red-600' },
  2: { label: 'P2', color: 'bg-orange-500 hover:bg-orange-600' },
  3: { label: 'P3', color: 'bg-yellow-500 hover:bg-yellow-600' },
  4: { label: 'P4', color: 'bg-green-500 hover:bg-green-600' },
}

export function TaskList({ tasks }: TaskListProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async (taskId: string) => {
    if (!confirm('确定要删除这个任务吗？所有相关的时间记录也会被删除。')) {
      return
    }

    await supabase.from('tasks').delete().eq('id', taskId)
    router.refresh()
  }

  const handleArchive = async (taskId: string) => {
    await supabase.from('tasks').update({ is_archived: true }).eq('id', taskId)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const priority = priorityConfig[task.priority]

        return (
          <Card key={task.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={priority.color}>{priority.label}</Badge>
                  <CardTitle className="text-base">{task.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleArchive(task.id)}>
                      归档
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(task.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              {task.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {task.description}
                </p>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {task.loggedHours.toFixed(1)}h / {task.estimated_hours}h
                    </span>
                  </div>
                  <span className="font-medium">{Math.round(task.progress)}%</span>
                </div>
                <Progress value={task.progress} className="h-2" />
              </div>

              {task.weekly_target_hours && (
                <p className="text-xs text-muted-foreground mt-2">
                  每周目标: {task.weekly_target_hours}h
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
