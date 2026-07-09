'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Kanban,
  Wrench,
  Trophy,
  Settings,
  LogOut,
  X,
  QrCode,
  Phone,
  CalendarCheck,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems: { href: string; label: string; icon: React.ElementType; sub?: boolean }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/prospectos', label: 'Prospectos', icon: Users },
  { href: '/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/herramientas', label: 'Herramientas', icon: Wrench },
  { href: '/herramientas/llamada', label: 'Llamada Perfecta', icon: Phone, sub: true },
  { href: '/herramientas/qr', label: 'QR Captura', icon: QrCode, sub: true },
  { href: '/seguimientos', label: 'Seguimientos', icon: CalendarCheck },
  { href: '/victorias', label: 'Victorias', icon: Trophy },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
]

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleNavClick = () => {
    onClose?.()
  }

  return (
    <>
      {/* Overlay móvil */}
      {open !== undefined && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden transition-opacity duration-300"
          style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className="w-60 flex-shrink-0 flex flex-col h-screen sticky top-0 z-40
          md:translate-x-0 md:static md:z-auto
          fixed left-0 top-0 transition-transform duration-300 ease-in-out"
        style={{
          backgroundColor: '#1A4A44',
          transform: open !== undefined
            ? (open ? 'translateX(0)' : 'translateX(-100%)')
            : undefined,
        }}
      >
        {/* Logo + botón cerrar en móvil */}
        <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <span className="text-white font-bold text-lg tracking-tight">CBC™</span>
            <p className="text-white/50 text-xs mt-0.5">Cierre Bajo Control</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon, sub }) => {
            const active = href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                onClick={handleNavClick}
                className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-colors ${
                  sub ? 'py-2 ml-6 px-2' : 'px-3 py-2.5'
                } ${
                  active
                    ? 'text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                style={active ? { backgroundColor: sub ? 'rgba(78,205,196,0.25)' : '#4ECDC4', color: active && sub ? '#4ECDC4' : active ? '#1A4A44' : undefined } : {}}
              >
                <Icon size={sub ? 15 : 18} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 w-full transition-colors"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
