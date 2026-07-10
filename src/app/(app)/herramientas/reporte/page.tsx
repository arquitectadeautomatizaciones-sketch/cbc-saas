'use client'

import { useState } from 'react'
import { BarChart2, Copy, Check, Loader2, RefreshCw } from 'lucide-react'

const VERDE = '#1A4A44'
const TEAL = '#4ECDC4'
const BEIGE = '#F5F0E8'

type Semaforo = 'verde' | 'amarillo' | 'rojo'

interface Metricas {
  total: number
  rojo: number
  amarillo: number
  verde: number
  victorias: number
  pipeline_valor: number
  cerradas: number
  en_propuesta: number
  en_negociacion: number
}

const SEMAFORO_CONFIG = {
  verde: {
    emoji: '🟢',
    label: 'Va bien',
    tono: 'Confianza',
    descripcion: 'Tu pipeline está sano. El reporte transmite resultados y momentum.',
    bg: '#f0fdf4',
    border: '#86efac',
    text: '#16a34a',
  },
  amarillo: {
    emoji: '🟡',
    label: 'Va regular',
    tono: 'Control',
    descripcion: 'Hay pendientes pero estás encima. El reporte muestra claridad y plan.',
    bg: '#fefce8',
    border: '#fde047',
    text: '#ca8a04',
  },
  rojo: {
    emoji: '🔴',
    label: 'Necesita acción',
    tono: 'Acción',
    descripcion: 'El mes está complicado. El reporte muestra responsabilidad y plan de recuperación.',
    bg: '#fef2f2',
    border: '#fca5a5',
    text: '#dc2626',
  },
}

function fmt(n: number, moneda = 'USD') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: moneda, maximumFractionDigits: 0,
  }).format(n)
}

export default function ReportePage() {
  const [generando, setGenerando] = useState(false)
  const [reporte, setReporte] = useState<string | null>(null)
  const [semaforo, setSemaforo] = useState<Semaforo | null>(null)
  const [metricas, setMetricas] = useState<Metricas | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  async function generar() {
    setGenerando(true)
    setError(null)
    setReporte(null)
    setSemaforo(null)
    setMetricas(null)
    try {
      const res = await fetch('/api/herramientas/reporte', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error generando el reporte.'); return }
      setReporte(data.reporte)
      setSemaforo(data.semaforo)
      setMetricas(data.metricas)
    } catch {
      setError('Sin conexión. Intenta de nuevo.')
    } finally {
      setGenerando(false)
    }
  }

  async function copiar() {
    if (!reporte) return
    await navigator.clipboard.writeText(reporte)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  const sc = semaforo ? SEMAFORO_CONFIG[semaforo] : null

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#F0F7F6' }}>
            <BarChart2 size={18} style={{ color: VERDE }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: VERDE, fontFamily: 'var(--font-jakarta)' }}>
            Reporte al Jefe™
          </h1>
        </div>
        <p className="text-gray-500 text-sm mt-1 ml-12">
          Genera en un toque un reporte de tu desempeño para compartir con tu director. Con tus datos reales.
        </p>
      </div>

      {/* Estado vacío / CTA */}
      {!reporte && !generando && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Explicación de semáforos */}
          <div className="p-6 border-b border-gray-50">
            <p className="text-sm font-bold text-gray-700 mb-4">El reporte se adapta a tu situación real</p>
            <div className="flex flex-col gap-3">
              {(Object.entries(SEMAFORO_CONFIG) as [Semaforo, typeof SEMAFORO_CONFIG.verde][]).map(([key, s]) => (
                <div
                  key={key}
                  className="flex items-start gap-3 rounded-xl p-3"
                  style={{ background: s.bg, border: `1px solid ${s.border}` }}
                >
                  <span className="text-lg flex-shrink-0">{s.emoji}</span>
                  <div>
                    <p className="text-sm font-bold" style={{ color: s.text }}>{s.label} — Tono {s.tono}</p>
                    <p className="text-xs mt-0.5" style={{ color: s.text, opacity: 0.8 }}>{s.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            <button
              onClick={generar}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-bold text-white transition-opacity"
              style={{ backgroundColor: VERDE }}
            >
              <BarChart2 size={18} />
              Generar mi reporte
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              Usa los datos actuales de tu pipeline — cada vez que generes será diferente
            </p>
          </div>
        </div>
      )}

      {/* Generando */}
      {generando && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-4">
          <Loader2 size={32} style={{ color: TEAL }} className="animate-spin" />
          <div className="text-center">
            <p className="text-sm font-bold text-gray-700">Analizando tu pipeline...</p>
            <p className="text-xs text-gray-400 mt-1">Claude está generando tu reporte con datos reales</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !generando && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
          <p className="text-sm text-red-600 font-semibold">{error}</p>
          <button onClick={generar} className="mt-3 text-xs text-red-500 underline">Intentar de nuevo</button>
        </div>
      )}

      {/* Resultado */}
      {reporte && sc && metricas && (
        <div className="flex flex-col gap-4">

          {/* Badge de semáforo */}
          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: sc.bg, border: `1.5px solid ${sc.border}` }}
          >
            <span className="text-2xl">{sc.emoji}</span>
            <div>
              <p className="font-bold text-sm" style={{ color: sc.text }}>
                {sc.label} · Tono {sc.tono}
              </p>
              <p className="text-xs mt-0.5" style={{ color: sc.text, opacity: 0.75 }}>
                {sc.descripcion}
              </p>
            </div>
          </div>

          {/* Métricas rápidas */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Activos', value: metricas.total },
              { label: 'Victorias', value: metricas.victorias },
              { label: 'En propuesta', value: metricas.en_propuesta },
            ].map(m => (
              <div key={m.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
                <p className="text-2xl font-bold" style={{ color: VERDE }}>{m.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Semáforo visual */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Estado del pipeline</p>
            <div className="flex gap-2">
              {[
                { label: 'Verde', count: metricas.verde, color: '#22c55e', bg: '#f0fdf4' },
                { label: 'Amarillo', count: metricas.amarillo, color: '#f59e0b', bg: '#fefce8' },
                { label: 'Rojo', count: metricas.rojo, color: '#ef4444', bg: '#fef2f2' },
              ].map(s => (
                <div
                  key={s.label}
                  className="flex-1 rounded-xl p-3 text-center"
                  style={{ background: s.bg }}
                >
                  <p className="text-xl font-bold" style={{ color: s.color }}>{s.count}</p>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: s.color }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reporte generado */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <p className="text-sm font-bold" style={{ color: VERDE }}>Tu reporte</p>
              <span className="text-xs text-gray-400">Listo para WhatsApp o email</span>
            </div>

            <div className="p-5">
              <p
                className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {reporte}
              </p>
            </div>

            <div className="px-5 py-4 border-t border-gray-50 flex gap-3">
              <button
                onClick={copiar}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-colors"
                style={{ backgroundColor: copiado ? '#10b981' : VERDE }}
              >
                {copiado ? <Check size={15} /> : <Copy size={15} />}
                {copiado ? 'Copiado' : 'Copiar reporte'}
              </button>
              <button
                onClick={generar}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border transition-colors"
                style={{ borderColor: '#e5e7eb', color: '#6b7280' }}
                title="Generar otra versión"
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 pb-2">
            ↺ El botón de la derecha genera una nueva versión con los mismos datos
          </p>
        </div>
      )}
    </div>
  )
}
