'use client'

import { useState, useEffect } from 'react'
import { Phone, Copy, Check, Loader2, ChevronDown } from 'lucide-react'

const VERDE = '#1A4A44'
const BEIGE = '#F5F0E8'

interface Prospecto {
  id: string
  nombre: string
  empresa: string | null
  dias_sin_contacto: number
  semaforo: string
}

interface Guion {
  apertura: string
  diagnostico: string
  propuesta: string
  cierre: string
  prospecto: { nombre: string; empresa: string | null }
}

const SECCIONES = [
  {
    key: 'apertura' as const,
    titulo: 'Apertura',
    duracion: '15 seg',
    descripcion: 'Cómo empezar sin sonar a vendedor',
    color: '#1A4A44',
    bg: '#F0F7F6',
    border: '#4ECDC4',
  },
  {
    key: 'diagnostico' as const,
    titulo: 'Diagnóstico',
    duracion: '60 seg',
    descripcion: 'Preguntas específicas para este prospecto',
    color: '#1e40af',
    bg: '#eff6ff',
    border: '#93c5fd',
  },
  {
    key: 'propuesta' as const,
    titulo: 'Propuesta',
    duracion: '30 seg',
    descripcion: 'Conectar su dolor con tu solución',
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#c4b5fd',
  },
  {
    key: 'cierre' as const,
    titulo: 'Cierre',
    duracion: '15 seg',
    descripcion: 'Pedir el siguiente paso concreto',
    color: '#b45309',
    bg: '#fffbeb',
    border: '#fcd34d',
  },
]

const SEMAFORO_COLOR: Record<string, string> = {
  rojo: '#ef4444', amarillo: '#f59e0b', verde: '#10b981',
}

export default function LlamadaPage() {
  const [prospectos, setProspectos] = useState<Prospecto[]>([])
  const [loadingProspectos, setLoadingProspectos] = useState(true)
  const [prospectoId, setProspectoId] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [generando, setGenerando] = useState(false)
  const [guion, setGuion] = useState<Guion | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiado, setCopiado] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/prospectos')
      .then(r => r.json())
      .then(data => {
        const activos = (data as Prospecto[]).filter(
          p => p.semaforo === 'rojo' || p.semaforo === 'amarillo' || p.semaforo === 'verde'
        )
        setProspectos(activos)
      })
      .finally(() => setLoadingProspectos(false))
  }, [])

  const filtrados = prospectos.filter(p => {
    const q = busqueda.toLowerCase()
    return p.nombre.toLowerCase().includes(q) || (p.empresa ?? '').toLowerCase().includes(q)
  })

  const seleccionado = prospectos.find(p => p.id === prospectoId)

  async function preparar() {
    if (!prospectoId) return
    setGenerando(true)
    setGuion(null)
    setError(null)
    try {
      const res = await fetch('/api/herramientas/llamada', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospecto_id: prospectoId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error generando el guión.'); return }
      setGuion(data)
    } catch {
      setError('Sin conexión. Intenta de nuevo.')
    } finally {
      setGenerando(false)
    }
  }

  function copiar(key: string, texto: string) {
    navigator.clipboard.writeText(texto)
    setCopiado(key)
    setTimeout(() => setCopiado(null), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#F0F7F6' }}>
            <Phone size={18} style={{ color: VERDE }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: VERDE, fontFamily: 'var(--font-jakarta)' }}>
            Mi Llamada Perfecta™
          </h1>
        </div>
        <p className="text-gray-500 text-sm mt-1 ml-12">
          Selecciona el prospecto, el tipo de llamada y CBC genera el guión completo con tu información real — apertura, preguntas, objeciones y cierre.
        </p>
      </div>

      {/* Selector de prospecto */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          ¿A quién vas a llamar?
        </label>

        {loadingProspectos ? (
          <div className="h-12 rounded-xl bg-gray-50 animate-pulse" />
        ) : (
          <div className="relative">
            {/* Selected display / trigger */}
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-colors"
              style={{
                borderColor: dropdownOpen ? VERDE : '#e5e7eb',
                background: seleccionado ? BEIGE : 'white',
              }}
            >
              {seleccionado ? (
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: SEMAFORO_COLOR[seleccionado.semaforo] ?? '#6b7280' }}
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{seleccionado.nombre}</p>
                    {seleccionado.empresa && (
                      <p className="text-xs text-gray-400 truncate">{seleccionado.empresa}</p>
                    )}
                  </div>
                </div>
              ) : (
                <span className="text-gray-400 text-sm">Selecciona un prospecto...</span>
              )}
              <ChevronDown
                size={16}
                className="flex-shrink-0 text-gray-400 transition-transform"
                style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}
              />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                <div className="p-2 border-b border-gray-100">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Buscar por nombre o empresa..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-gray-400"
                  />
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {filtrados.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Sin resultados</p>
                  ) : (
                    filtrados.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setProspectoId(p.id)
                          setBusqueda('')
                          setDropdownOpen(false)
                          setGuion(null)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors"
                      >
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: SEMAFORO_COLOR[p.semaforo] ?? '#6b7280' }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{p.nombre}</p>
                          {p.empresa && <p className="text-xs text-gray-400 truncate">{p.empresa}</p>}
                        </div>
                        <span className="text-xs text-gray-300 flex-shrink-0">{p.dias_sin_contacto}d</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={preparar}
          disabled={!prospectoId || generando}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-opacity"
          style={{
            background: !prospectoId || generando ? '#9ca3af' : VERDE,
            cursor: !prospectoId || generando ? 'not-allowed' : 'pointer',
          }}
        >
          {generando ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Preparando tu guión...
            </>
          ) : (
            <>
              <Phone size={16} />
              Preparar mi llamada
            </>
          )}
        </button>

        {error && (
          <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
        )}
      </div>

      {/* Guión generado */}
      {guion && (
        <div className="flex flex-col gap-4">
          {/* Nombre del prospecto */}
          <div className="flex items-center gap-2 px-1">
            <Phone size={14} style={{ color: VERDE }} />
            <p className="text-sm font-semibold" style={{ color: VERDE }}>
              Guión para {guion.prospecto.nombre}
              {guion.prospecto.empresa && (
                <span className="font-normal text-gray-400"> · {guion.prospecto.empresa}</span>
              )}
            </p>
          </div>

          {SECCIONES.map((s) => (
            <div
              key={s.key}
              className="rounded-2xl border p-5"
              style={{ background: s.bg, borderColor: s.border }}
            >
              {/* Section header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold" style={{ color: s.color }}>{s.titulo}</span>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: s.border, color: s.color }}
                    >
                      {s.duracion}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: s.color, opacity: 0.7 }}>{s.descripcion}</p>
                </div>
                <button
                  onClick={() => copiar(s.key, guion[s.key])}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition-colors"
                  style={{
                    background: copiado === s.key ? '#10b981' : s.border,
                    color: copiado === s.key ? 'white' : s.color,
                  }}
                >
                  {copiado === s.key ? <Check size={12} /> : <Copy size={12} />}
                  {copiado === s.key ? 'Copiado' : 'Copiar'}
                </button>
              </div>

              {/* Script text */}
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {guion[s.key]}
              </p>
            </div>
          ))}

          {/* Regenerar */}
          <button
            onClick={preparar}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors text-center py-2"
          >
            ↺ Generar otra versión
          </button>
        </div>
      )}

      {/* Estado vacío inicial */}
      {!guion && !generando && (
        <div className="text-center py-12">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: BEIGE }}
          >
            <Phone size={28} style={{ color: VERDE }} />
          </div>
          <p className="text-sm font-semibold text-gray-600">Selecciona un prospecto</p>
          <p className="text-xs text-gray-400 mt-1">
            Claude preparará un guión personalizado con su historial y dolor registrado
          </p>
        </div>
      )}
    </div>
  )
}
