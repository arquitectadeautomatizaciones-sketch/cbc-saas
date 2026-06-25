'use client'

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
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/prospectos', label: 'Prospectos', icon: Users },
  { href: '/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/herramientas', label: 'Herramientas', icon: Wrench },
  { href: '/victorias', label: 'Victorias', icon: Trophy },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className="w-60 flex-shrink-0 flex flex-col h-screen sticky top-0"
      style={{ backgroundColor: '#1A4A44' }}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <span className="text-white font-bold text-lg tracking-tight">CBC™</span>
        <p className="text-white/50 text-xs mt-0.5">Cierre Bajo Control</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              style={active ? { backgroundColor: '#4ECDC4', color: '#1A4A44' } : {}}
            >
              <Icon size={18} />
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
  )
}
