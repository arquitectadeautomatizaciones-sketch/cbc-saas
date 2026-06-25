'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/lib/types'
import { MessageSquare, CreditCard, Bell } from 'lucide-react'

export default function ConfiguracionPage() {
  const [user, setUser] = useState<Partial<User>>({})
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [telegramStatus, setTelegramStatus] = useState<{ telegram_conectado: boolean } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user: authUser } }) => {
      if (!authUser) return
      const { data } = await supabase
        .from('users')
        .select('nombre, email, sector, tipo_venta, meta_mensual, moneda, estado_suscripcion, telegram_conectado')
        .eq('auth_user_id', authUser.id)
        .single()
      if (data) setUser(data)
      setLoading(false)
    })
    fetch('/api/telegram/connect').then((r) => r.json()).then(setTelegramStatus)
  }, [])

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setGuardando(true)
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return
    await supabase.from('users').update({
      sector: user.sector ?? null,
      tipo_venta: user.tipo_venta ?? null,
      meta_mensual: user.meta_mensual ?? null,
      moneda: user.moneda ?? 'USD',
    }).eq('auth_user_id', authUser.id)
    setGuardando(false)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }

  async function irAStripe() {
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT ?? 'cbc_alertas_bot'

  if (loading) return <div className="text-center py-20 text-gray-400">Cargando...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1A4A44' }}>Configuración</h1>
        <p className="text-gray-500 text-sm mt-1">Tu perfil de vendedor y preferencias</p>
      </div>

      {/* Perfil */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MessageSquare size={18} style={{ color: '#4ECDC4' }} />
          Perfil de vendedor
        </h2>
        <form onSubmit={guardar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
            <input
              value={user.sector ?? ''}
              onChange={(e) => setUser({ ...user, sector: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
              placeholder="Tecnología, salud, servicios..."
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de venta</label>
              <select
                value={user.tipo_venta ?? 'B2B'}
                onChange={(e) => setUser({ ...user, tipo_venta: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white"
              >
                <option>B2B</option>
                <option>B2C</option>
                <option>Mixto</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta mensual</label>
              <div className="flex gap-2">
                <select
                  value={user.moneda ?? 'USD'}
                  onChange={(e) => setUser({ ...user, moneda: e.target.value })}
                  className="px-2 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white"
                >
                  <option>USD</option>
                  <option>MXN</option>
                  <option>COP</option>
                  <option>ARS</option>
                  <option>CLP</option>
                </select>
                <input
                  type="number"
                  value={user.meta_mensual ?? ''}
                  onChange={(e) => setUser({ ...user, meta_mensual: Number(e.target.value) })}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
                  placeholder="10000"
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={guardando}
            className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
            style={{ backgroundColor: '#1A4A44' }}
          >
            {guardado ? '✓ Guardado' : guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>

      {/* Suscripción */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <CreditCard size={18} style={{ color: '#4ECDC4' }} />
          Suscripción
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Estado actual</p>
            <p className="font-semibold mt-0.5" style={{ color: '#1A4A44' }}>
              {user.estado_suscripcion === 'trial' ? '🟡 Trial activo'
                : user.estado_suscripcion === 'activa' ? '🟢 Activa — $9.90/mes'
                : user.estado_suscripcion === 'suspendida' ? '🔴 Suspendida'
                : '⚫ Cancelada'}
            </p>
          </div>
          {user.estado_suscripcion !== 'activa' && (
            <button
              onClick={irAStripe}
              className="px-4 py-2 rounded-xl text-white text-sm font-semibold"
              style={{ backgroundColor: '#4ECDC4', color: '#1A4A44' }}
            >
              Activar $9.90/mes
            </button>
          )}
        </div>
      </div>

      {/* Telegram */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Bell size={18} style={{ color: '#4ECDC4' }} />
          Alertas por Telegram
        </h2>
        {telegramStatus?.telegram_conectado ? (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-3 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Telegram conectado — recibirás alertas cada mañana
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Conecta Telegram para recibir tu resumen diario de prospectos urgentes.
            </p>
            <a
              href={`https://t.me/${botUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
              style={{ backgroundColor: '#1A4A44' }}
            >
              Conectar con Telegram →
            </a>
            <p className="text-xs text-gray-400 mt-2">
              Abre el bot y escribe /start con tu email para vincular tu cuenta.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
