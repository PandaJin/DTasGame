'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen overflow-hidden">
        {/* 桌面端侧边栏 */}
        <Sidebar className="hidden md:flex" />

        {/* 移动端侧边栏遮罩 */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <Sidebar
              className="fixed left-0 top-0 h-full z-50"
              onNavClick={() => setSidebarOpen(false)}
            />
          </div>
        )}

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6 bg-muted/30">
            {children}
          </main>
          {/* 移动端底部导航 */}
          <MobileNav className="md:hidden" />
        </div>
      </div>
    </QueryClientProvider>
  )
}
