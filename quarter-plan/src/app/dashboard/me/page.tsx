'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { LogOut, Save, User } from 'lucide-react'

export default function MePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [profile, setProfile] = useState<{
    display_name: string
    settings: { defaultView: string; weekStartDay: number }
  } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

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
    loadData()
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
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-20" />
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-2xl">
      <h1 className="text-xl md:text-2xl font-bold">我的</h1>

      {/* Profile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            个人信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>邮箱</Label>
            <Input value={user?.email || ''} disabled className="h-11 md:h-9" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">显示名称</Label>
            <Input
              id="displayName"
              value={profile?.display_name || ''}
              onChange={(e) => setProfile(prev => prev ? { ...prev, display_name: e.target.value } : null)}
              placeholder="输入你的名称"
              className="h-11 md:h-9"
            />
          </div>
          <div className="space-y-2">
            <Label>每周起始日</Label>
            <Select
              value={String(profile?.settings.weekStartDay || 1)}
              onValueChange={(value) => setProfile(prev =>
                prev ? { ...prev, settings: { ...prev.settings, weekStartDay: parseInt(value) } } : null
              )}
            >
              <SelectTrigger className="h-11 md:h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">周日</SelectItem>
                <SelectItem value="1">周一</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave} disabled={saving} size="sm" className="min-h-[36px]">
            <Save className="mr-2 h-3.5 w-3.5" />
            {saving ? '保存中...' : '保存设置'}
          </Button>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button variant="destructive" onClick={handleSignOut} className="w-full h-11 md:h-9">
        <LogOut className="mr-2 h-4 w-4" />
        退出登录
      </Button>
    </div>
  )
}
