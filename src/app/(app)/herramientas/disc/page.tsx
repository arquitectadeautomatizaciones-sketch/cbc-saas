'use client'

import { useState } from 'react'
import { Users, Copy, Check, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

const VERDE = '#1A4A44'
const TEAL = '#4ECDC4'
const BEIGE = '#F5F0E8'

// ── DISC config ───────────────────────────────────────────────────
const DISC_COLOR = {
  D: { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626', badge: '#ef4444', emoji: '🔴' },
  I: { bg: '#fefce8', border: '#fde047', text: '#ca8a04', badge: '#f59e0b', emoji: '🟡' },
  S: { bg: '#f0fdf4', border: '#86efac', text: '#16a34a', badge: '#22c55e', emoji: '🟢' },
  C: { bg: '#eff6ff', border: '#93c5fd', text: '#1d4ed8', badge: '#3b82f6', emoji: '🔵' },
}

type DiscKey = 'D' | 'I' | 'S' | 'C'

// ── Detector rápido ───────────────────────────────────────────────
const RITMO_OPS = [
  { value: 'activo', label: '⚡ Habla rápido, va al grano', tag: 'ACTIVO' },
  { value: 'receptivo', label: '🐢 Habla pausado, reflexivo', tag: 'RECEPTIVO' },
]
const INTERACCION_OPS = [
  { value: 'cuestionador', label: '❄️ Frío, cuestionador, pide datos', tag: 'CUESTIONADOR' },
  { value: 'abierto', label: '☀️ Cálido, amigable, sonríe', tag: 'ABIERTO' },
]
const DETECTOR: Record<string, Record<string, { disc: DiscKey; label: string }>> = {
  activo:    { cuestionador: { disc: 'D', label: 'D — El Dominante' },    abierto: { disc: 'I', label: 'I — El Influyente' } },
  receptivo: { abierto:      { disc: 'S', label: 'S — El Estable' },      cuestionador: { disc: 'C', label: 'C — El Concienzudo' } },
}

// ── Opciones de selectores ─────────────────────────────────────────
const COMO_HABLA_OPS = [
  'Directo y al grano — va por resultados',
  'Entusiasta y sociable — habla de todo',
  'Analítico y detallista — pide documentos',
  'Pausado y reflexivo — escucha más que habla',
]
const QUE_PREGUNTAS_OPS = [
  '¿Cuánto cuesta? y ¿cuándo arrancamos?',
  '¿Quién más lo usa? y casos de éxito',
  '¿Cómo funciona exactamente? — proceso técnico',
  '¿Qué garantías hay? y ¿qué pasa si no funciona?',
]
const COMO_DECIDE_OPS = [
  'Solo y rápido — no necesita aprobación',
  'Se deja llevar por la emoción — decide cuando siente confianza',
  'Necesita consultar con el equipo',
  'Analiza todo antes de decidir — necesita tiempo',
]
const PREOCUPACION_OPS = [
  'El precio — siente que es mucho dinero',
  'Que no funcione como prometen',
  'Qué pensará su jefe o equipo',
  'Tomar la decisión equivocada',
]
const ETAPA_OPS = [
  'primer contacto',
  'presentación',
  'propuesta enviada',
  'en negociación',
]

// ── Guía estática DISC ─────────────────────────────────────────────
interface GuiaDisc {
  disc: DiscKey
  nombre: string
  reconoces: string
  mueve: string
  hablarle: string
  precio: string
  cerrar: string
  error: string
  frase: string
}

const GUIA: GuiaDisc[] = [
  {
    disc: 'D', nombre: 'El Dominante',
    reconoces: 'Habla rápido, interrumpe, pregunta solo por resultados y precio. No tiene tiempo para rodeos.',
    mueve: 'El poder, el control y ganar. Quiere ser el primero, el mejor, el que tomó la decisión correcta.',
    hablarle: 'Sé directo. Sin introducción larga. "Resuelve X en Y tiempo." Deja que él sienta que controla.',
    precio: 'Da el precio de frente, sin disculpas. Presenta como inversión con ROI claro. Sin descuentos automáticos — lo pierdes.',
    cerrar: '"¿Lo arrancamos el lunes o el miércoles?" Dos opciones, ambas tuyas. Nunca preguntes si quiere.',
    error: 'Ser lento, rodear el tema o mostrar inseguridad. Te descarta en segundos.',
    frase: '"Esto te pone delante de tu competencia en 90 días. ¿Cuándo arrancamos?"',
  },
  {
    disc: 'I', nombre: 'El Influyente',
    reconoces: 'Cálido, te da confianza rápido, habla de todo menos del negocio. Le encanta contar historias.',
    mueve: 'El reconocimiento, las relaciones y ser visto como innovador. Quiere que lo admiren.',
    hablarle: 'Conecta primero como persona. Usa historias de clientes similares. Hazlo sentir que es parte de algo especial.',
    precio: 'Presenta el precio como "lo que hacen los que ya van adelante". Enfócate en cómo lo hará ver ante su equipo.',
    cerrar: '"Varios de mis clientes en tu sector ya están usando esto — y hablan muy bien. ¿Te sumo?"',
    error: 'Bombardearlo con datos, reportes y lógica fría. Se desconecta si no hay emoción.',
    frase: '"Esto te va a hacer quedar muy bien con tu equipo. ¿Lo probamos?"',
  },
  {
    disc: 'S', nombre: 'El Estable',
    reconoces: 'Escucha más que habla, no presiona, pregunta por garantías y por cómo afecta a su equipo.',
    mueve: 'La seguridad, la estabilidad y no dañar las relaciones. Quiere que todos estén cómodos con la decisión.',
    hablarle: 'Ve despacio. No presiones. Muéstrale que lo acompañas en el proceso. La confianza va antes que el negocio.',
    precio: 'Presenta el precio con garantías claras y casos de éxito. Que sepa que no está solo si algo sale mal.',
    cerrar: '"¿Qué necesitas para sentirte tranquilo con esta decisión?" Cierra cuando él lo pida, no antes.',
    error: 'Presionarlo o apurar la decisión. Se cierra y no vuelve.',
    frase: '"Muchos en tu misma situación tomaron este paso — y están muy tranquilos con el resultado."',
  },
  {
    disc: 'C', nombre: 'El Concienzudo',
    reconoces: 'Frío, analítico, llega con preguntas específicas. Pide documentos, casos, detalles del proceso.',
    mueve: 'La exactitud, la calidad y tomar la decisión técnicamente correcta. Miedo al error.',
    hablarle: 'Dale datos, no promesas. Prepara documentación. Responde preguntas técnicas con precisión. No improvises.',
    precio: 'Justifica cada componente del precio. ROI con números reales. Comparativas si las tienes.',
    cerrar: '"¿Hay algún dato adicional que necesites para terminar de evaluar?" Cierra cuando él haya completado su análisis.',
    error: 'Ser vago, prometer sin evidencia o apurar la decisión. Te pierde la confianza para siempre.',
    frase: '"Aquí está el desglose completo del proceso y los resultados de clientes similares. ¿Lo revisamos juntos?"',
  },
]

// ── Output blocks config ───────────────────────────────────────────
const BLOQUES = [
  { key: 'perfil_explicacion', titulo: 'Perfil detectado', icon: '🎯' },
  { key: 'como_hablarle',      titulo: 'Cómo hablarle',   icon: '💬', isList: true },
  { key: 'como_precio',        titulo: 'Cómo presentar el precio', icon: '💰' },
  { key: 'como_cerrar',        titulo: 'Cómo cerrar',     icon: '🔒' },
  { key: 'error_fatal',        titulo: 'Error fatal ⚠️',  icon: '🚫' },
  { key: 'frase_activa',       titulo: 'Frase que lo activa', icon: '⚡' },
] as const

interface Estrategia {
  perfil_disc: DiscKey
  perfil_nombre: string
  perfil_explicacion: string
  como_hablarle: string[]
  como_precio: string
  como_cerrar: string
  error_fatal: string
  frase_activa: string
}

// ─────────────────────────────────────────────────────────────────
export default function DiscPage() {
  // Detector rápido
  const [ritmo, setRitmo] = useState<string | null>(null)
  const [interaccion, setInteraccion] = useState<string | null>(null)

  // Formulario
  const [nombre, setNombre] = useState('')
  const [cargo, setCargo] = useState('')
  const [comoHabla, setComoHabla] = useState('')
  const [quePreguntas, setQuePreguntas] = useState('')
  const [comoDecide, setComoDecide] = useState('')
  const [mayorPreocupacion, setMayorPreocupacion] = useState('')
  const [etapa, setEtapa] = useState('')

  // Output
  const [generando, setGenerando] = useState(false)
  const [estrategia, setEstrategia] = useState<Estrategia | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  // Guía colapsable
  const [guiaAbierta, setGuiaAbierta] = useState<DiscKey | null>(null)

  const detectorResult = ritmo && interaccion ? DETECTOR[ritmo]?.[interaccion] : null
  const valido = nombre.trim() && comoHabla && quePreguntas && comoDecide && mayorPreocupacion && etapa

  async function generar() {
    if (!valido) return
    setGenerando(true)
    setError(null)
    setEstrategia(null)
    try {
      const res = await fetch('/api/herramientas/disc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, cargo, como_habla: comoHabla, que_preguntas: quePreguntas, como_decide: comoDecide, mayor_preocupacion: mayorPreocupacion, etapa }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error generando la estrategia.'); return }
      setEstrategia(data)
    } catch {
      setError('Sin conexión. Intenta de nuevo.')
    } finally {
      setGenerando(false)
    }
  }

  async function copiarEstrategia() {
    if (!estrategia) return
    const texto = [
      `Perfil DISC: ${estrategia.perfil_disc} — ${estrategia.perfil_nombre}`,
      `\n${estrategia.perfil_explicacion}`,
      `\n\nCómo hablarle:\n${estrategia.como_hablarle.map((c, i) => `${i + 1}. ${c}`).join('\n')}`,
      `\n\nCómo presentar el precio:\n${estrategia.como_precio}`,
      `\n\nCómo cerrar:\n${estrategia.como_cerrar}`,
      `\n\nError fatal:\n${estrategia.error_fatal}`,
      `\n\nFrase que lo activa:\n"${estrategia.frase_activa}"`,
    ].join('')
    await navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  const selectBtn = (value: string, current: string, setter: (v: string) => void) => (
    <button
      key={value}
      type="button"
      onClick={() => setter(current === value ? '' : value)}
      className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold border transition-all"
      style={{
        backgroundColor: current === value ? VERDE : 'white',
        color: current === value ? 'white' : '#374151',
        borderColor: current === value ? VERDE : '#e5e7eb',
      }}
    >
      {value}
    </button>
  )

  return (
    <div className="max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#F0F7F6' }}>
            <Users size={18} style={{ color: VERDE }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: VERDE, fontFamily: 'var(--font-jakarta)' }}>
            Perfil DISC del Cliente™
          </h1>
        </div>
        <p className="text-gray-500 text-sm mt-1 ml-12">
          Llena 6 campos sobre tu prospecto y CBC te dice exactamente cómo hablarle, cómo presentar el precio y cómo cerrar — según su perfil de personalidad.
        </p>
      </div>

      {/* ── SECCIÓN 1: Detector rápido ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <p className="text-sm font-bold mb-4" style={{ color: VERDE }}>🔍 Identifica el perfil en 2 minutos</p>

        <div className="flex flex-col gap-5">
          {/* Ritmo */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">¿Cómo es su ritmo?</p>
            <div className="flex flex-col gap-2">
              {RITMO_OPS.map(op => (
                <button
                  key={op.value}
                  type="button"
                  onClick={() => setRitmo(ritmo === op.value ? null : op.value)}
                  className="text-left px-4 py-3 rounded-xl text-sm font-semibold border transition-all"
                  style={{
                    backgroundColor: ritmo === op.value ? VERDE : 'white',
                    color: ritmo === op.value ? 'white' : '#374151',
                    borderColor: ritmo === op.value ? VERDE : '#e5e7eb',
                  }}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interacción */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">¿Cómo interactúa?</p>
            <div className="flex flex-col gap-2">
              {INTERACCION_OPS.map(op => (
                <button
                  key={op.value}
                  type="button"
                  onClick={() => setInteraccion(interaccion === op.value ? null : op.value)}
                  className="text-left px-4 py-3 rounded-xl text-sm font-semibold border transition-all"
                  style={{
                    backgroundColor: interaccion === op.value ? VERDE : 'white',
                    color: interaccion === op.value ? 'white' : '#374151',
                    borderColor: interaccion === op.value ? VERDE : '#e5e7eb',
                  }}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resultado detector */}
          {detectorResult && (() => {
            const c = DISC_COLOR[detectorResult.disc]
            return (
              <div
                className="rounded-xl p-4 flex items-center gap-3"
                style={{ background: c.bg, border: `1.5px solid ${c.border}` }}
              >
                <span className="text-2xl">{c.emoji}</span>
                <div>
                  <p className="font-bold text-base" style={{ color: c.text }}>
                    {detectorResult.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: c.text, opacity: 0.75 }}>
                    Perfil probable — completa la ficha para la estrategia exacta
                  </p>
                </div>
              </div>
            )
          })()}
        </div>
      </div>

      {/* ── SECCIÓN 2: Ficha del prospecto ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <p className="text-sm font-bold mb-4" style={{ color: VERDE }}>📋 Ficha del prospecto</p>

        <div className="flex flex-col gap-5">
          {/* Nombre + Cargo */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 mb-1.5">👤 Nombre</label>
              <input
                type="text"
                placeholder="Ej: Laura García"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#e5e7eb' }}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 mb-1.5">💼 Cargo</label>
              <input
                type="text"
                placeholder="Ej: Gerente Comercial"
                value={cargo}
                onChange={e => setCargo(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#e5e7eb' }}
              />
            </div>
          </div>

          {/* Cómo habla */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">🗣️ ¿Cómo habla o escribe?</label>
            <div className="flex flex-col gap-2">
              {COMO_HABLA_OPS.map(op => selectBtn(op, comoHabla, setComoHabla))}
            </div>
          </div>

          {/* Qué preguntas */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">❓ ¿Qué preguntas hace?</label>
            <div className="flex flex-col gap-2">
              {QUE_PREGUNTAS_OPS.map(op => selectBtn(op, quePreguntas, setQuePreguntas))}
            </div>
          </div>

          {/* Cómo decide */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">⚡ ¿Cómo toma decisiones?</label>
            <div className="flex flex-col gap-2">
              {COMO_DECIDE_OPS.map(op => selectBtn(op, comoDecide, setComoDecide))}
            </div>
          </div>

          {/* Mayor preocupación */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">😰 Su mayor preocupación</label>
            <div className="flex flex-col gap-2">
              {PREOCUPACION_OPS.map(op => selectBtn(op, mayorPreocupacion, setMayorPreocupacion))}
            </div>
          </div>

          {/* Etapa */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">📍 Etapa actual</label>
            <div className="grid grid-cols-2 gap-2">
              {ETAPA_OPS.map(op => (
                <button
                  key={op}
                  type="button"
                  onClick={() => setEtapa(etapa === op ? '' : op)}
                  className="text-center px-3 py-3 rounded-xl text-sm font-semibold border transition-all capitalize"
                  style={{
                    backgroundColor: etapa === op ? VERDE : 'white',
                    color: etapa === op ? 'white' : '#374151',
                    borderColor: etapa === op ? VERDE : '#e5e7eb',
                  }}
                >
                  {op.charAt(0).toUpperCase() + op.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={generar}
          disabled={!valido || generando}
          className="mt-5 w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold text-white transition-opacity"
          style={{
            backgroundColor: !valido || generando ? '#9ca3af' : VERDE,
            cursor: !valido || generando ? 'not-allowed' : 'pointer',
          }}
        >
          {generando
            ? <><Loader2 size={16} className="animate-spin" /> Analizando perfil...</>
            : <><Users size={16} /> Generar estrategia DISC</>
          }
        </button>

        {error && <p className="mt-3 text-sm text-red-500 text-center">{error}</p>}
      </div>

      {/* ── SECCIÓN 3: Output ── */}
      {estrategia && (() => {
        const c = DISC_COLOR[estrategia.perfil_disc]
        return (
          <div className="flex flex-col gap-4 mb-4">
            {/* Badge perfil */}
            <div
              className="rounded-2xl p-4 flex items-center justify-between"
              style={{ background: c.bg, border: `1.5px solid ${c.border}` }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{c.emoji}</span>
                <div>
                  <p className="font-bold text-base" style={{ color: c.text }}>
                    Perfil {estrategia.perfil_disc} — {estrategia.perfil_nombre}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: c.text, opacity: 0.75 }}>
                    {estrategia.perfil_explicacion}
                  </p>
                </div>
              </div>
            </div>

            {/* Bloques */}
            {BLOQUES.slice(1).map(b => {
              const valor = estrategia[b.key as keyof Estrategia]
              return (
                <div key={b.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-sm font-bold" style={{ color: VERDE }}>
                      {b.icon} {b.titulo}
                    </p>
                  </div>
                  <div className="px-4 py-4">
                    {Array.isArray(valor) ? (
                      <ol className="flex flex-col gap-2">
                        {valor.map((item: string, i: number) => (
                          <li key={i} className="flex gap-3 text-sm text-gray-700">
                            <span
                              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                              style={{ backgroundColor: c.badge }}
                            >
                              {i + 1}
                            </span>
                            {item}
                          </li>
                        ))}
                      </ol>
                    ) : b.key === 'frase_activa' ? (
                      <p
                        className="text-sm leading-relaxed italic font-medium"
                        style={{
                          color: c.text,
                          background: c.bg,
                          border: `1px solid ${c.border}`,
                          borderRadius: 10,
                          padding: '10px 14px',
                        }}
                      >
                        "{valor as string}"
                      </p>
                    ) : b.key === 'error_fatal' ? (
                      <p
                        className="text-sm leading-relaxed"
                        style={{
                          color: '#dc2626',
                          background: '#fef2f2',
                          border: '1px solid #fca5a5',
                          borderRadius: 10,
                          padding: '10px 14px',
                        }}
                      >
                        {valor as string}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-700 leading-relaxed">{valor as string}</p>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Botón copiar */}
            <button
              onClick={copiarEstrategia}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-colors"
              style={{ backgroundColor: copiado ? '#10b981' : VERDE }}
            >
              {copiado ? <Check size={15} /> : <Copy size={15} />}
              {copiado ? 'Copiado' : 'Copiar estrategia completa'}
            </button>
          </div>
        )
      })()}

      {/* ── SECCIÓN 4: Guía rápida DISC ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <p className="text-sm font-bold" style={{ color: VERDE }}>📚 Guía rápida DISC</p>
          <p className="text-xs text-gray-400 mt-0.5">Referencia rápida por perfil — toca para expandir</p>
        </div>

        {GUIA.map((g) => {
          const c = DISC_COLOR[g.disc]
          const abierta = guiaAbierta === g.disc
          return (
            <div key={g.disc} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <button
                onClick={() => setGuiaAbierta(abierta ? null : g.disc)}
                className="w-full flex items-center justify-between px-5 py-4 transition-colors"
                style={{ background: abierta ? c.bg : 'white' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{c.emoji}</span>
                  <span className="text-sm font-bold" style={{ color: abierta ? c.text : '#1f2937' }}>
                    {g.disc} — {g.nombre}
                  </span>
                </div>
                {abierta
                  ? <ChevronUp size={16} color={c.text} />
                  : <ChevronDown size={16} color="#9ca3af" />
                }
              </button>

              {abierta && (
                <div className="px-5 pb-5" style={{ background: c.bg }}>
                  {[
                    { label: '🔍 Cómo lo reconoces', value: g.reconoces },
                    { label: '💡 Qué lo mueve', value: g.mueve },
                    { label: '💬 Cómo hablarle', value: g.hablarle },
                    { label: '💰 Cómo presentar el precio', value: g.precio },
                    { label: '🔒 Cómo cerrar', value: g.cerrar },
                    { label: '🚫 Error fatal', value: g.error },
                    { label: '⚡ Frase que lo activa', value: g.frase },
                  ].map(({ label, value }) => (
                    <div key={label} className="mb-3 last:mb-0">
                      <p className="text-xs font-bold mb-1" style={{ color: c.text }}>{label}</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
