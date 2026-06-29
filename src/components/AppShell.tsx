'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import TrialBanner from '@/components/TrialBanner'

interface AppShellProps {
  children: React.ReactNode
  trialEndsAt?: string | null
  showBanner?: boolean
}

export default function AppShell({ children, trialEndsAt, showBanner }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop — siempre visible */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Sidebar móvil — controlado por estado */}
      <div className="md:hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header móvil con hamburguesa */}
        <div
          className="md:hidden flex items-center px-4 py-4 border-b border-gray-100 sticky top-0 z-20 bg-white"
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>
          <span className="ml-3 font-bold text-base" style={{ color: '#1A4A44' }}>CBC™</span>
        </div>

        {showBanner && <TrialBanner trialEndsAt={trialEndsAt ?? null} />}
        <div className="flex-1 p-4 md:p-8">{children}</div>
      </main>
    </div>
  )
}
