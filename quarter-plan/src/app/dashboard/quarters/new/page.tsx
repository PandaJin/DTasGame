'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewQuarterPage() {
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // 自动生成季度名称
  const generateQuarterName = () => {
    const now = new Date()
    const quarter = Math.ceil((now.getMonth() + 1) / 3)
    return `${now.getFullYear()} Q${quarter}`
  }

  // 自动生成季度日期
  const generateQuarterDates = () => {
    const now = new Date()
    const quarter = Math.ceil((now.getMonth() + 1) / 3)
    const year = now.getFullYear()

    const startMonth = (quarter - 1) * 3
    const start = new Date(year, startMonth, 1)
    const end = new Date(year, startMonth + 3, 0)

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    }
  }

  const handleAutoFill = () => {
    setName(generateQuarterName())
    const dates = generateQuarterDates()
    setStartDate(dates.start)
    setEndDate(dates.end)
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
      if (!user) {
        setError('请先登录')
        setLoading(false)
        return
      }

      const { error: insertError } = await supabase
        .from('quarters')
        .insert({
          user_id: user.id,
          name,
          start_date: startDate,
          end_date: endDate,
          is_active: isActive,
        })

      if (insertError) {
        setError(insertError.message)
      } else {
        router.push('/dashboard/quarters')
        router.refresh()
      }
    } catch {
      setError('创建失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/quarters">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">新建季度</h1>
          <p className="text-muted-foreground">创建一个新的季度计划</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>季度信息</CardTitle>
          <CardDescription>
            设置季度的基本信息
            <Button
              type="button"
              variant="link"
              className="ml-2 p-0 h-auto"
              onClick={handleAutoFill}
            >
              自动填充当前季度
            </Button>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">季度名称</Label>
              <Input
                id="name"
                placeholder="例如：2024 Q1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">开始日期</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">结束日期</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isActive" className="text-sm font-normal">
                设为活跃季度
              </Label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? '创建中...' : '创建季度'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/quarters">取消</Link>
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
