'use client'

import { useState, useEffect, useCallback } from 'react'
import { Copy, Check, CalendarCheck, Loader2 } from 'lucide-react'

const VERDE = '#1A4A44'

interface Seguimiento {
  id: string
  tipo: 'dia_1' | 'dia_3' | 'dia_7'
  fecha_envio: string
  mensaje_generado: string
  estado: 'pendiente' | 'enviado' | 'cancelado'
  enviado_at: string | null
  prospecto_id: string
  prospectos: { nombre: string; empresa: string | null } | null
}

const TIPO_LABEL: Record<string, string> = {
  dia_1: 'Día 1', dia_3: 'Día 3', dia_7: 'Día 7',
}

const TIPO_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  dia_1: { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd' },
  dia_3: { bg: '#fdf4ff', text: '#7e22ce', border: '#e9d5ff' },
  dia_7: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
}

type Filtro = 'todos' | 'pendiente' | 'enviado'

function formatFecha(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function SeguimientosPage() {
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [expandido, setExpandido] = useState<string | null>(null)
  const [copiado, setCopiado] = useState<string | null>(null)
  const [marcando, setMarcando] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/seguimientos?todos=1')
      const data = await res.json()
      setSeguimientos(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const filtrados = seguimientos.filter(s => {
    if (filtro === 'todos') return true
    return s.estado === filtro
  })

  function copiar(id: string, texto: string) {
    navigator.clipboard.writeText(texto)
    setCopiado(id)
    setTimeout(() => setCopiado(null), 2000)
  }

  async function marcarEnviado(id: string) {
    setMarcando(id)
    try {
      const res = await fetch(`/api/seguimientos/${id}`, { method: 'PATCH' })
      if (res.ok) {
        setSeguimientos(prev =>
          prev.map(s => s.id === id ? { ...s, estado: 'enviado', enviado_at: new Date().toISOString() } : s)
        )
      }
    } finally {
      setMarcando(null)
    }
  }

  const counts = {
    todos: seguimientos.length,
    pendiente: seguimientos.filter(s => s.estado === 'pendiente').length,
    enviado: seguimientos.filter(s => s.estado === 'enviado').length,
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#F0F7F6' }}>
            <CalendarCheck size={18} style={{ color: VERDE }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: VERDE, fontFamily: 'var(--font-jakarta)' }}>
            Seguimientos
          </h1>
        </div>
        <p className="text-gray-500 text-sm mt-1 ml-12">
          Mensajes del sistema para los días 1, 3 y 7 después de enviar una propuesta.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-5">
        {(['todos', 'pendiente', 'enviado'] as Filtro[]).map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            style={{
              background: filtro === f ? VERDE : '#f3f4f6',
              color: filtro === f ? 'white' : '#6b7280',
            }}
          >
            {f === 'todos' ? 'Todos' : f === 'pendiente' ? 'Pendientes' : 'Enviados'}
            <span
              className="text-xs px-1.5 py-0.5 rounded-full font-bold"
              style={{
                background: filtro === f ? 'rgba(255,255,255,0.25)' : '#e5e7eb',
                color: filtro === f ? 'white' : '#6b7280',
              }}
            >
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Cargando seguimientos...</span>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-16">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: '#F5F0E8' }}
          >
            <CalendarCheck size={28} style={{ color: VERDE }} />
          </div>
          <p className="text-sm font-semibold text-gray-600">
            {filtro === 'todos' ? 'Sin seguimientos generados aún' : `Sin seguimientos ${filtro === 'pendiente' ? 'pendientes' : 'enviados'}`}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Se generan automáticamente cuando envías una propuesta
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtrados.map(s => {
            const tc = TIPO_COLOR[s.tipo] ?? TIPO_COLOR.dia_1
            const isExp = expandido === s.id
            const nombre = s.prospectos?.nombre ?? 'Prospecto'
            const empresa = s.prospectos?.empresa

            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl border shadow-sm overflow-hidden"
                style={{ borderColor: s.estado === 'enviado' ? '#e5e7eb' : tc.border }}
              >
                {/* Header de la card */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Badge tipo */}
                      <span
                        className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg"
                        style={{ background: tc.bg, color: tc.text }}
                      >
                        {TIPO_LABEL[s.tipo]}
                      </span>

                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{nombre}</p>
                        {empresa && <p className="text-xs text-gray-400 truncate">{empresa}</p>}
                        <p className="text-xs text-gray-400 mt-0.5">{formatFecha(s.fecha_envio)}</p>
                      </div>
                    </div>

                    {/* Badge estado */}
                    <span
                      className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={
                        s.estado === 'enviado'
                          ? { background: '#dcfce7', color: '#16a34a' }
                          : { background: '#fef9c3', color: '#a16207' }
                      }
                    >
                      {s.estado === 'enviado' ? '✓ Enviado' : 'Pendiente'}
                    </span>
                  </div>

                  {/* Mensaje preview / expandible */}
                  <div className="mt-3">
                    <p
                      className="text-sm text-gray-700 leading-relaxed"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: isExp ? undefined : 2,
                        WebkitBoxOrient: 'vertical' as const,
                        overflow: isExp ? 'visible' : 'hidden',
                        whiteSpace: isExp ? 'pre-wrap' : undefined,
                      } as React.CSSProperties}
                    >
                      {s.mensaje_generado}
                    </p>
                    <button
                      onClick={() => setExpandido(isExp ? null : s.id)}
                      className="text-xs font-semibold mt-1 transition-colors"
                      style={{ color: VERDE }}
                    >
                      {isExp ? 'Ver menos' : 'Ver completo'}
                    </button>
                  </div>
                </div>

                {/* Acciones */}
                <div
                  className="px-4 py-3 flex items-center gap-2 border-t"
                  style={{ borderColor: '#f3f4f6', background: '#fafafa' }}
                >
                  <button
                    onClick={() => copiar(s.id, s.mensaje_generado)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    style={{
                      background: copiado === s.id ? '#10b981' : '#e5e7eb',
                      color: copiado === s.id ? 'white' : '#374151',
                    }}
                  >
                    {copiado === s.id ? <Check size={12} /> : <Copy size={12} />}
                    {copiado === s.id ? 'Copiado' : 'Copiar mensaje'}
                  </button>

                  {s.estado === 'pendiente' && (
                    <button
                      onClick={() => marcarEnviado(s.id)}
                      disabled={marcando === s.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity"
                      style={{
                        background: marcando === s.id ? '#9ca3af' : VERDE,
                        cursor: marcando === s.id ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {marcando === s.id
                        ? <Loader2 size={12} className="animate-spin" />
                        : <CalendarCheck size={12} />
                      }
                      Marcar como enviado
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
