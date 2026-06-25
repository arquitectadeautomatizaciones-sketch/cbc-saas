'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Zap } from 'lucide-react'
import { Suspense } from 'react'

function SubscribeContent() {
  const [loading, setLoading] = useState(false)
  const params = useSearchParams()
  const cancelled = params.get('cancelled')

  async function handleCheckout() {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
    else setLoading(false)
  }

  const features = [
    'Pipeline ilimitado de prospectos',
    'Semáforo automático de seguimiento',
    'Sofía — tu asistente de ventas con IA',
    'Historial de conversaciones persistente',
    'Seguimientos día 1, 3 y 7 automáticos',
    'Alertas por Telegram cada mañana',
    'Registro de victorias y métricas',
    'Acceso desde cualquier dispositivo',
  ]

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ backgroundColor: '#1A4A44' }}>
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#1A4A44' }}>
            Activa CBC
          </h1>
          <p className="text-gray-500 mt-1">Tu asistente de ventas, disponible 24/7</p>
        </div>

        {cancelled && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-xl mb-6">
            Cancelaste el pago. Puedes intentarlo cuando quieras.
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-6">
            <span className="text-5xl font-bold" style={{ color: '#1A4A44' }}>$9.90</span>
            <span className="text-gray-400 text-lg">/mes</span>
            <p className="text-sm text-gray-500 mt-1">Cancelas cuando quieras</p>
          </div>

          <ul className="space-y-3 mb-8">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-gray-700">
                <CheckCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#4ECDC4' }} />
                {f}
              </li>
            ))}
          </ul>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white font-bold text-base transition-opacity disabled:opacity-60"
            style={{ backgroundColor: '#1A4A44' }}
          >
            {loading ? 'Redirigiendo a Stripe...' : 'Activar por $9.90/mes →'}
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            Pago seguro con Stripe. No almacenamos tu tarjeta.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SubscribePage() {
  return (
    <Suspense>
      <SubscribeContent />
    </Suspense>
  )
}
