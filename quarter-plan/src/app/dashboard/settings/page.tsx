'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { LogOut, Save, User } from 'lucide-react'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [profile, setProfile] = useState<{
    display_name: string
    settings: {
      defaultView: string
      weekStartDay: number
    }
  } | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      setUser({ email: user.email || '' })

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile({
          display_name: profileData.display_name || '',
          settings: profileData.settings || { defaultView: 'week', weekStartDay: 1 }
        })
      }

      setLoading(false)
    }

    loadProfile()
  }, [router, supabase])

  const handleSave = async () => {
    if (!profile) return

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase
        .from('profiles')
        .update({
          display_name: profile.display_name,
          settings: profile.settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
    }

    setSaving(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">设置</h1>
        <p className="text-muted-foreground">管理你的账户和偏好设置</p>
      </div>

      {/* 账户信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            账户信息
          </CardTitle>
          <CardDescription>你的账户基本信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>邮箱</Label>
            <Input value={user?.email || ''} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">显示名称</Label>
            <Input
              id="displayName"
              value={profile?.display_name || ''}
              onChange={(e) => setProfile(prev => prev ? { ...prev, display_name: e.target.value } : null)}
              placeholder="输入你的名称"
            />
          </div>
        </CardContent>
      </Card>

      {/* 偏好设置 */}
      <Card>
        <CardHeader>
          <CardTitle>偏好设置</CardTitle>
          <CardDescription>自定义你的使用体验</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>默认视图</Label>
            <Select
              value={profile?.settings.defaultView || 'week'}
              onValueChange={(value) => setProfile(prev =>
                prev ? { ...prev, settings: { ...prev.settings, defaultView: value } } : null
              )}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">日视图</SelectItem>
                <SelectItem value="week">周视图</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>每周起始日</Label>
            <Select
              value={String(profile?.settings.weekStartDay || 1)}
              onValueChange={(value) => setProfile(prev =>
                prev ? { ...prev, settings: { ...prev.settings, weekStartDay: parseInt(value) } } : null
              )}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">周日</SelectItem>
                <SelectItem value="1">周一</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex justify-between">
        <Button variant="destructive" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          退出登录
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? '保存中...' : '保存设置'}
        </Button>
      </div>
    </div>
  )
}
