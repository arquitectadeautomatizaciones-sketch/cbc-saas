'use client'

import { useState, useEffect, useRef } from 'react'

// ── Brand ────────────────────────────────────────────────
const VERDE = '#1A4A44'
const TEAL = '#4ECDC4'

// ── Types ────────────────────────────────────────────────
type Paso = 'form' | 'resultados' | 'desbloqueado'

interface Selecciones {
  q1val: number | null   // comision promedio (context)
  q1label: string        // for display
  q2: number | null      // pts: prospectos perdidos
  q2lost: number         // estimated lost prospects/month
  q3: number | null      // pts: sistema de seguimiento
  q4: number | null      // pts: sabe tasa de cierre
  q5: number | null      // pts: tiempo preparar mensaje
}

// ── Questions config ─────────────────────────────────────
const COMISION_OPTS = [
  { label: 'Menos de $500 USD', val: 300, lost_factor: 300 },
  { label: 'Entre $500 y $2.000 USD', val: 1250, lost_factor: 1250 },
  { label: 'Entre $2.000 y $5.000 USD', val: 3500, lost_factor: 3500 },
  { label: 'Más de $5.000 USD', val: 7500, lost_factor: 7500 },
]

const Q2_OPTS = [
  { label: 'Ninguno o casi ninguno', pts: 25, lost: 0.5 },
  { label: '2 o 3 prospectos', pts: 15, lost: 2.5 },
  { label: '4 a 6 prospectos', pts: 5, lost: 5 },
  { label: '7 o más', pts: 0, lost: 8 },
]

const Q3_OPTS = [
  { label: 'Sí, claro y lo uso todos los días', pts: 25 },
  { label: 'Uso Excel o WhatsApp', pts: 10 },
  { label: 'Lo llevo en la cabeza', pts: 0 },
]

const Q4_OPTS = [
  { label: 'Sí, la tengo calculada', pts: 25 },
  { label: 'Aproximadamente', pts: 12 },
  { label: 'No la tengo calculada', pts: 0 },
]

const Q5_OPTS = [
  { label: '5 minutos o menos', pts: 25 },
  { label: 'Entre 5 y 20 minutos', pts: 12 },
  { label: 'Más de 20 minutos', pts: 0 },
]

// ── Score logic ──────────────────────────────────────────
function calcular(s: Selecciones) {
  const q2 = s.q2 ?? 0
  const q3 = s.q3 ?? 0
  const q4 = s.q4 ?? 0
  const q5 = s.q5 ?? 0
  const total = q2 + q3 + q4 + q5  // /100

  const seguimiento = Math.min(10, Math.round(((q2 + q3) / 50) * 10))
  const priorizacion = Math.min(10, Math.round(((q2 + q5) / 50) * 10))
  const preparacion = Math.min(10, Math.round(((q3 + q5) / 50) * 10))
  const reporte = Math.min(10, Math.round((q4 / 25) * 10))

  const sub = { seguimiento, priorizacion, preparacion, reporte }

  const entries = Object.entries(sub) as [string, number][]
  const sorted = [...entries].sort((a, b) => a[1] - b[1])
  const cuello = sorted[0][0]

  const perdidaMensual = Math.round(s.q2lost * (s.q1val ?? 0))

  const FORTALEZAS: Record<string, string> = {
    seguimiento: 'Tu proceso de seguimiento funciona — eso ya te pone por encima del 70% de los vendedores B2B.',
    priorizacion: 'Identificas quién necesita atención antes de que se enfríe — eso se traduce en menos ventas perdidas.',
    preparacion: 'Preparas tus mensajes antes de enviarlos — y eso se nota en la tasa de respuesta.',
    reporte: 'Conoces tus números de cierre — eso te hace más persuasivo ante tu director.',
  }

  const DEBILIDADES: Record<string, string> = {
    seguimiento: 'Sin un sistema claro, los prospectos se enfrían sin que te des cuenta — y cuando reaccionas, ya eligieron a alguien más.',
    priorizacion: 'Contactas a quien recuerdas, no a quien más urge — y eso tiene un costo invisible en comisiones cada mes.',
    preparacion: 'Tus mensajes de seguimiento tardan demasiado o suenan genéricos — y eso reduce tu tasa de respuesta directamente.',
    reporte: 'Sin datos claros de tu tasa de cierre, tomas decisiones a ciegas — y eso te debilita frente a tu director.',
  }

  const CUELLO_TEXTO: Record<string, string> = {
    seguimiento: 'Tu cuello de botella hoy es el seguimiento. Tienes el talento para cerrar, pero si los prospectos se enfrían antes de que actúes, nunca llegas al cierre.',
    priorizacion: 'Tu cuello de botella es la priorización. Sin orden de urgencia, atiendes a quien recuerdas — no a quien más necesita tu llamada hoy.',
    preparacion: 'Tu cuello de botella es la preparación. Tardas demasiado en armar cada mensaje y eso te quita tiempo real de venta.',
    reporte: 'Tu cuello de botella es el reporting. No sabes exactamente cómo vas — y eso debilita tu posición ante tu director y ante ti mismo.',
  }

  const RECOMENDACIONES: Record<string, string[]> = {
    seguimiento: [
      'Registra cada prospecto el mismo día que lo conoces, antes de apagar el teléfono.',
      'Programa los seguimientos días 1, 3 y 7 — no cuando te acuerdes.',
      'Usa mensajes pre-redactados con el contexto del prospecto, no de memoria.',
    ],
    priorizacion: [
      'Prioriza por días sin contacto, no por afinidad o recencia.',
      'Define 3 contactos urgentes cada mañana antes de revisar el teléfono.',
      'Los rojos primero — siempre. Un prospecto en rojo es dinero que se está yendo.',
    ],
    preparacion: [
      'Antes de escribir, revisa las notas del prospecto. 60 segundos de contexto = 3x más respuestas.',
      'Ten plantillas base por tipo de seguimiento (día 1, día 3, día 7) y personaliza solo 2 líneas.',
      'Si tardas más de 5 minutos en redactar un mensaje, algo en tu proceso está roto.',
    ],
    reporte: [
      'Calcula tu tasa de cierre hoy: cierres del mes ÷ prospectos contactados × 100.',
      'Actualiza el estado de tus prospectos al menos 2 veces por semana.',
      'Ten los números listos antes de que alguien te los pida — eso cambia tu posición completamente.',
    ],
  }

  const fortalezas = Object.entries(FORTALEZAS)
    .map(([k, v]) => ({ cat: k, texto: v, score: sub[k as keyof typeof sub] }))
    .sort((a, b) => b.score - a.score)

  const debilidades = Object.entries(DEBILIDADES)
    .map(([k, v]) => ({ cat: k, texto: v, score: sub[k as keyof typeof sub] }))
    .sort((a, b) => a.score - b.score)

  return {
    total,
    sub,
    cuello,
    cuelloTexto: CUELLO_TEXTO[cuello],
    perdidaMensual,
    fortalezas,
    debilidades,
    recomendaciones: RECOMENDACIONES[cuello],
    nivel: total < 40 ? 'Sistema en riesgo' : total < 65 ? 'Hay margen de mejora' : 'Sistema sólido',
    nivelColor: total < 40 ? '#ef4444' : total < 65 ? '#f59e0b' : '#10b981',
  }
}

// ── Gauge SVG ─────────────────────────────────────────────
function GaugeSVG({ score, color }: { score: number; color: string }) {
  const [anim, setAnim] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setAnim(score), 120)
    return () => clearTimeout(t)
  }, [score])

  const rotation = (anim / 100) * 180 - 90

  return (
    <div style={{ textAlign: 'center' }}>
      <svg viewBox="0 0 200 110" width="220" height="115" style={{ overflow: 'visible', display: 'block', margin: '0 auto' }}>
        <defs>
          <linearGradient id="gaugeBg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
            <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <path d="M 22 95 A 78 78 0 0 0 178 95" fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round" />

        {/* Colored zones */}
        <path d="M 22 95 A 78 78 0 0 0 76 21" fill="none" stroke="#ef4444" strokeWidth="14" strokeLinecap="butt" opacity="0.5" />
        <path d="M 76 21 A 78 78 0 0 0 135 26" fill="none" stroke="#f59e0b" strokeWidth="14" strokeLinecap="butt" opacity="0.5" />
        <path d="M 135 26 A 78 78 0 0 0 178 95" fill="none" stroke="#10b981" strokeWidth="14" strokeLinecap="butt" opacity="0.5" />

        {/* Zone labels */}
        <text x="16" y="110" textAnchor="middle" fontSize="8" fill="#9ca3af">0</text>
        <text x="100" y="12" textAnchor="middle" fontSize="8" fill="#9ca3af">50</text>
        <text x="184" y="110" textAnchor="middle" fontSize="8" fill="#9ca3af">100</text>

        {/* Needle */}
        <g
          style={{
            transformOrigin: '100px 95px',
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <line x1="100" y1="95" x2="100" y2="23" stroke={VERDE} strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="100,17 97,28 103,28" fill={VERDE} />
        </g>

        {/* Center cap */}
        <circle cx="100" cy="95" r="9" fill={VERDE} />
        <circle cx="100" cy="95" r="4" fill="white" />
      </svg>

      <div style={{ marginTop: 4, textAlign: 'center' }}>
        <div style={{ fontSize: 52, fontWeight: 900, color: VERDE, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>/100</div>
        <div style={{ fontSize: 14, fontWeight: 700, color, marginTop: 6, letterSpacing: '0.01em' }}>{score < 40 ? 'Sistema en riesgo' : score < 65 ? 'Hay margen de mejora' : 'Sistema sólido'}</div>
      </div>
    </div>
  )
}

// ── Sub-score bar ─────────────────────────────────────────
function SubBar({ label, score, delay = 0 }: { label: string; score: number; delay?: number }) {
  const [w, setW] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setW(score), 300 + delay)
    return () => clearTimeout(t)
  }, [score, delay])

  const c = score <= 3 ? '#ef4444' : score <= 6 ? '#f59e0b' : '#10b981'
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: c }}>{score}/10</span>
      </div>
      <div style={{ background: '#f3f4f6', borderRadius: 6, height: 7, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 6, background: c, width: `${w * 10}%`, transition: `width 1s cubic-bezier(0.34,1.56,0.64,1) ${delay * 0.001}s` }} />
      </div>
    </div>
  )
}

// ── Option button ─────────────────────────────────────────
function Opcion({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '12px 16px',
        borderRadius: 10,
        border: selected ? `2px solid ${TEAL}` : '2px solid #e5e7eb',
        background: selected ? `${TEAL}15` : 'white',
        color: selected ? VERDE : '#374151',
        fontWeight: selected ? 700 : 500,
        fontSize: 14,
        cursor: 'pointer',
        marginBottom: 8,
        transition: 'all 0.15s',
        position: 'relative',
      }}
    >
      <span style={{
        position: 'absolute',
        right: 14,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 18,
        height: 18,
        borderRadius: '50%',
        border: selected ? `none` : `2px solid #d1d5db`,
        background: selected ? TEAL : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        color: 'white',
        flexShrink: 0,
      }}>
        {selected ? '✓' : ''}
      </span>
      {label}
    </button>
  )
}

// ── Main component ────────────────────────────────────────
export default function DiagnosticoInteractivo() {
  const [paso, setPaso] = useState<Paso>('form')
  const [sel, setSel] = useState<Selecciones>({
    q1val: null, q1label: '', q2: null, q2lost: 0, q3: null, q4: null, q5: null,
  })
  const [email, setEmail] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [emailError, setEmailError] = useState('')
  const resultRef = useRef<HTMLDivElement>(null)

  const listo = sel.q1val !== null && sel.q2 !== null && sel.q3 !== null && sel.q4 !== null && sel.q5 !== null

  function verDiagnostico() {
    if (!listo) return
    setPaso('resultados')
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  async function desbloquear() {
    if (!email.includes('@')) {
      setEmailError('Ingresa un email válido para ver tu reporte.')
      return
    }
    setEmailError('')
    setGuardando(true)
    const r = calcular(sel)
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        score: r.total,
        sub_scores: r.sub,
        cuello_de_botella: r.cuello,
        respuestas: sel,
      }),
    })
    setGuardando(false)
    setPaso('desbloqueado')
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  const r = paso !== 'form' ? calcular(sel) : null

  return (
    <div id="diagnostico" style={{ maxWidth: 720, margin: '0 auto', padding: '0 16px' }}>

      {/* ── FORM ─────────────────────────────────────── */}
      {paso === 'form' && (
        <div>
          {/* Progress */}
          <div style={{ marginBottom: 32 }}>
            {[
              { n: 1, q: '¿Cuánto es tu comisión promedio por venta?', sub: 'Esto nos ayuda a calcular cuánto estás dejando en la mesa.', opts: COMISION_OPTS, field: 'q1' as const },
            ].map(() => null)}
          </div>

          {/* Q1 */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ background: VERDE, color: 'white', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>1</span>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: VERDE }}>¿Cuánto es tu comisión promedio por venta cerrada?</p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>Nos ayuda a calcular cuánto estás dejando en la mesa.</p>
              </div>
            </div>
            {COMISION_OPTS.map(o => (
              <Opcion key={o.val} label={o.label} selected={sel.q1val === o.val} onClick={() => setSel(s => ({ ...s, q1val: o.val, q1label: o.label }))} />
            ))}
          </div>

          {/* Q2 */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ background: VERDE, color: 'white', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>2</span>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: VERDE }}>¿Cuántos prospectos pierdes al mes por no hacer seguimiento a tiempo?</p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>Prospectos que tuvieron interés real pero se enfriaron.</p>
              </div>
            </div>
            {Q2_OPTS.map(o => (
              <Opcion key={o.pts} label={o.label} selected={sel.q2 === o.pts} onClick={() => setSel(s => ({ ...s, q2: o.pts, q2lost: o.lost }))} />
            ))}
          </div>

          {/* Q3 */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ background: VERDE, color: 'white', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>3</span>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: VERDE }}>¿Tienes un sistema de seguimiento activo?</p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>Algo que uses consistentemente, no "cuando me acuerdo".</p>
              </div>
            </div>
            {Q3_OPTS.map(o => (
              <Opcion key={o.pts} label={o.label} selected={sel.q3 === o.pts} onClick={() => setSel(s => ({ ...s, q3: o.pts }))} />
            ))}
          </div>

          {/* Q4 */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ background: VERDE, color: 'white', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>4</span>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: VERDE }}>¿Sabes cuál es tu tasa de cierre actual?</p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>El % de prospectos que se convierten en clientes.</p>
              </div>
            </div>
            {Q4_OPTS.map(o => (
              <Opcion key={o.pts} label={o.label} selected={sel.q4 === o.pts} onClick={() => setSel(s => ({ ...s, q4: o.pts }))} />
            ))}
          </div>

          {/* Q5 */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ background: VERDE, color: 'white', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>5</span>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: VERDE }}>¿Cuánto tardas en preparar un mensaje de seguimiento?</p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>Desde que decides escribir hasta que lo envías.</p>
              </div>
            </div>
            {Q5_OPTS.map(o => (
              <Opcion key={o.pts} label={o.label} selected={sel.q5 === o.pts} onClick={() => setSel(s => ({ ...s, q5: o.pts }))} />
            ))}
          </div>

          <button
            onClick={verDiagnostico}
            disabled={!listo}
            style={{
              display: 'block',
              width: '100%',
              padding: '16px 24px',
              borderRadius: 12,
              border: 'none',
              background: listo ? VERDE : '#d1d5db',
              color: 'white',
              fontSize: 16,
              fontWeight: 800,
              cursor: listo ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              letterSpacing: '0.01em',
            }}
          >
            {listo ? 'Ver mi diagnóstico →' : 'Responde todas las preguntas para continuar'}
          </button>
        </div>
      )}

      {/* ── RESULTS ──────────────────────────────────── */}
      {paso !== 'form' && r && (
        <div ref={resultRef}>
          {/* Score + gauge */}
          <div style={{
            background: 'white',
            borderRadius: 20,
            padding: '32px 28px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            marginBottom: 20,
          }}>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: '#9ca3af', textTransform: 'uppercase' }}>Tu diagnóstico de ventas</span>
            </div>

            <GaugeSVG score={r.total} color={r.nivelColor} />

            {/* Sub-scores */}
            <div style={{ marginTop: 28, borderTop: '1px solid #f3f4f6', paddingTop: 24 }}>
              <p style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Por categoría</p>
              <SubBar label="Seguimiento" score={r.sub.seguimiento} delay={0} />
              <SubBar label="Priorización" score={r.sub.priorizacion} delay={100} />
              <SubBar label="Preparación" score={r.sub.preparacion} delay={200} />
              <SubBar label="Reporte" score={r.sub.reporte} delay={300} />
            </div>
          </div>

          {/* Cuello de botella */}
          <div style={{
            background: `${r.nivelColor}12`,
            border: `2px solid ${r.nivelColor}40`,
            borderRadius: 16,
            padding: '20px 22px',
            marginBottom: 20,
          }}>
            <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: r.nivelColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tu cuello de botella hoy</p>
            <p style={{ margin: 0, fontSize: 15, color: VERDE, fontWeight: 600, lineHeight: 1.5 }}>{r.cuelloTexto}</p>
          </div>

          {/* ROI loss */}
          {r.perdidaMensual > 0 && (
            <div style={{
              background: '#fef2f2',
              border: '2px solid #fecaca',
              borderRadius: 16,
              padding: '18px 22px',
              marginBottom: 20,
              display: 'flex',
              gap: 14,
              alignItems: 'center',
            }}>
              <span style={{ fontSize: 28 }}>💸</span>
              <div>
                <p style={{ margin: '0 0 3px', fontSize: 13, fontWeight: 700, color: '#dc2626' }}>Costo mensual estimado de no tener sistema</p>
                <p style={{ margin: 0, fontSize: 15, color: '#7f1d1d', fontWeight: 600 }}>
                  Estás dejando aprox. <strong>${r.perdidaMensual.toLocaleString('es-MX')} USD</strong> en la mesa cada mes por prospectos que se enfrían antes de que actúes.
                </p>
              </div>
            </div>
          )}

          {/* Lo que ya haces bien — 1 visible */}
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: '24px 22px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            marginBottom: 20,
          }}>
            <p style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Lo que ya haces bien</p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: paso === 'desbloqueado' ? 12 : 0 }}>
              <span style={{ color: '#10b981', fontSize: 18, marginTop: 1 }}>✓</span>
              <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{r.fortalezas[0]?.texto}</p>
            </div>

            {paso === 'desbloqueado' && r.fortalezas.slice(1).map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ color: '#10b981', fontSize: 18, marginTop: 1 }}>✓</span>
                <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{f.texto}</p>
              </div>
            ))}
          </div>

          {/* Dónde se te van las comisiones — 1 visible */}
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: '24px 22px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            marginBottom: 20,
          }}>
            <p style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Dónde se te van las comisiones</p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: paso === 'desbloqueado' ? 12 : 0 }}>
              <span style={{ color: '#ef4444', fontSize: 18, marginTop: 1 }}>✗</span>
              <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{r.debilidades[0]?.texto}</p>
            </div>

            {paso === 'desbloqueado' && r.debilidades.slice(1).map((d, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ color: '#ef4444', fontSize: 18, marginTop: 1 }}>✗</span>
                <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{d.texto}</p>
              </div>
            ))}
          </div>

          {/* PAYWALL */}
          {paso === 'resultados' && (
            <div style={{
              background: VERDE,
              borderRadius: 20,
              padding: '28px 24px',
              textAlign: 'center',
              marginBottom: 20,
            }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🔒</div>
              <p style={{ margin: '0 0 6px', fontWeight: 800, fontSize: 20, color: 'white' }}>Ver tu reporte completo gratis</p>
              <p style={{ margin: '0 0 20px', fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                Incluye las {r.debilidades.length - 1} áreas de mejora restantes, 3 acciones concretas para esta semana y cómo CBC las resuelve por ti.
              </p>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailError('') }}
                onKeyDown={e => e.key === 'Enter' && desbloquear()}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '13px 16px',
                  borderRadius: 10,
                  border: emailError ? '2px solid #fca5a5' : '2px solid transparent',
                  fontSize: 15,
                  marginBottom: emailError ? 6 : 12,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {emailError && <p style={{ color: '#fca5a5', fontSize: 13, margin: '0 0 10px', textAlign: 'left' }}>{emailError}</p>}
              <button
                onClick={desbloquear}
                disabled={guardando}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '14px',
                  borderRadius: 10,
                  border: 'none',
                  background: TEAL,
                  color: VERDE,
                  fontWeight: 800,
                  fontSize: 16,
                  cursor: 'pointer',
                }}
              >
                {guardando ? 'Guardando...' : 'Desbloquear mi reporte completo →'}
              </button>
              <p style={{ margin: '10px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Sin spam. Solo tu reporte.</p>
            </div>
          )}

          {/* UNLOCKED content */}
          {paso === 'desbloqueado' && (
            <>
              <div style={{
                background: 'white',
                borderRadius: 16,
                padding: '24px 22px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                marginBottom: 20,
              }}>
                <p style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Lo que deberías cambiar esta semana</p>
                {r.recomendaciones.map((rec, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                    <span style={{
                      background: VERDE,
                      color: 'white',
                      borderRadius: '50%',
                      width: 22,
                      height: 22,
                      fontSize: 11,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 1,
                    }}>{i + 1}</span>
                    <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{rec}</p>
                  </div>
                ))}
              </div>

              <div style={{
                background: `linear-gradient(135deg, ${VERDE} 0%, #2d6b62 100%)`,
                borderRadius: 20,
                padding: '32px 24px',
                textAlign: 'center',
              }}>
                <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: TEAL, textTransform: 'uppercase' }}>Hecho especialmente para ti</p>
                <p style={{ margin: '0 0 10px', fontWeight: 800, fontSize: 22, color: 'white', lineHeight: 1.3 }}>CBC resuelve exactamente lo que acabas de diagnosticar</p>
                <p style={{ margin: '0 0 24px', fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
                  Semáforo automático, seguimientos programados, mensajes personalizados y reporte listo en un toque.
                  7 días gratis. Sin tarjeta.
                </p>
                <a
                  href="/empezar"
                  style={{
                    display: 'inline-block',
                    padding: '15px 32px',
                    borderRadius: 12,
                    background: TEAL,
                    color: VERDE,
                    fontWeight: 800,
                    fontSize: 16,
                    textDecoration: 'none',
                    letterSpacing: '0.01em',
                  }}
                >
                  Empezar mi prueba gratis →
                </a>
                <p style={{ margin: '12px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>$9.90 USD/mes después del trial. Cancelas cuando quieras.</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
