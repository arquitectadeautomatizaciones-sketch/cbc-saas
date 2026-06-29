'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, X, AlertCircle, Calendar, Clock } from 'lucide-react'

interface Notificacion {
  id: string
  tipo: 'semaforo_rojo' | 'seguimiento_hoy' | 'trial_expira'
  mensaje: string
  leida: boolean
  prospecto_id: string | null
  created_at: string
}

const TIPO_CONFIG = {
  semaforo_rojo: { icon: AlertCircle, color: '#ef4444', label: '🔴' },
  seguimiento_hoy: { icon: Calendar, color: '#f59e0b', label: '📅' },
  trial_expira: { icon: Clock, color: '#8b5cf6', label: '⏳' },
}

function tiempoRelativo(fecha: string): string {
  const diff = Date.now() - new Date(fecha).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'ahora mismo'
  if (min < 60) return `hace ${min} min`
  const hrs = Math.floor(min / 60)
  if (hrs < 24) return `hace ${hrs}h`
  const dias = Math.floor(hrs / 24)
  return `hace ${dias}d`
}

export default function Notificaciones() {
  const [notifs, setNotifs] = useState<Notificacion[]>([])
  const [open, setOpen] = useState(false)
  const [marcando, setMarcando] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch('/api/notificaciones')
      if (!res.ok) return
      const data = await res.json()
      setNotifs(data)
    } catch {
      // silencioso — no interrumpe la UI
    }
  }, [])

  useEffect(() => {
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifs])

  // Cierra al hacer click fuera del panel
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  async function marcarLeidas() {
    setMarcando(true)
    try {
      await fetch('/api/notificaciones/leer', { method: 'PATCH' })
      setNotifs([])
      setOpen(false)
    } finally {
      setMarcando(false)
    }
  }

  function handleNotifClick(n: Notificacion) {
    if (n.prospecto_id) {
      router.push('/prospectos')
    }
    setOpen(false)
  }

  const count = notifs.length

  return (
    <div className="relative" ref={panelRef}>
      {/* Botón campana */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
        aria-label={`Notificaciones${count > 0 ? ` — ${count} sin leer` : ''}`}
      >
        <Bell size={20} />
        {count > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: '#ef4444', fontSize: 10, padding: '0 4px' }}
          >
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {open && (
        <>
          {/* Overlay móvil */}
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setOpen(false)}
          />

          <div
            className="absolute right-0 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            style={{
              width: 'min(360px, calc(100vw - 32px))',
              top: 'calc(100% + 8px)',
              maxHeight: '80vh',
            }}
          >
            {/* Header del panel */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="font-bold text-sm text-gray-900">
                Notificaciones {count > 0 && <span className="text-gray-400 font-normal">({count})</span>}
              </span>
              <div className="flex items-center gap-2">
                {count > 0 && (
                  <button
                    onClick={marcarLeidas}
                    disabled={marcando}
                    className="text-xs font-medium disabled:opacity-40 transition-opacity"
                    style={{ color: '#1A4A44' }}
                  >
                    {marcando ? 'Marcando...' : 'Marcar todas leídas'}
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Lista */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 56px)' }}>
              {notifs.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-2xl mb-2">✅</p>
                  <p className="text-sm text-gray-500">Todo al día</p>
                  <p className="text-xs text-gray-400 mt-1">No hay notificaciones pendientes</p>
                </div>
              ) : (
                notifs.map((n) => {
                  const cfg = TIPO_CONFIG[n.tipo]
                  const clickable = !!n.prospecto_id
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleNotifClick(n)}
                      className="w-full text-left flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 transition-colors"
                      style={{ cursor: clickable ? 'pointer' : 'default' }}
                      onMouseEnter={(e) => { if (clickable) (e.currentTarget as HTMLElement).style.backgroundColor = '#f9fafb' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '' }}
                    >
                      <span className="text-lg flex-shrink-0 mt-0.5">{cfg.label}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 leading-snug">{n.mensaje}</p>
                        <p className="text-xs text-gray-400 mt-1">{tiempoRelativo(n.created_at)}</p>
                      </div>
                      {clickable && (
                        <span className="text-xs text-gray-300 flex-shrink-0 mt-1">→</span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
