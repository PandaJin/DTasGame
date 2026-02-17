'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface TimerNotesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskName: string
  durationSeconds: number
  onSave: (notes: string | null) => void
}

export function TimerNotesDialog({
  open,
  onOpenChange,
  taskName,
  durationSeconds,
  onSave,
}: TimerNotesDialogProps) {
  const [notes, setNotes] = useState('')

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h === 0) return `${m}分钟`
    if (m === 0) return `${h}小时`
    return `${h}小时${m}分钟`
  }

  const handleSave = () => {
    onSave(notes.trim() || null)
    setNotes('')
  }

  const handleSkip = () => {
    onSave(null)
    setNotes('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>记录保存</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            <span className="font-medium text-foreground">{taskName}</span>
            <span>·</span>
            <span className="tabular-nums">{formatDuration(durationSeconds)}</span>
          </div>
          <Textarea
            placeholder="这段时间做了什么...（可选）"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleSkip} className="h-11 md:h-9">
            跳过
          </Button>
          <Button onClick={handleSave} className="h-11 md:h-9">
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
