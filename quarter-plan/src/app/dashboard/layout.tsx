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
      <div className="flex h-dvh overflow-hidden">
        {/* Desktop sidebar */}
        <Sidebar className="hidden md:flex" />

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <Sidebar
              className="fixed left-0 top-0 h-full z-50 animate-in slide-in-from-left duration-200"
              onNavClick={() => setSidebarOpen(false)}
            />
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-auto p-3 md:p-6 pb-20 md:pb-6 bg-muted/30">
            <div className="max-w-4xl mx-auto">
              {children}
            </div>
          </main>
          {/* Mobile bottom nav */}
          <MobileNav className="md:hidden" />
        </div>
      </div>
    </QueryClientProvider>
  )
}
