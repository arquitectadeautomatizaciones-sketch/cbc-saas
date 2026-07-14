'use client'
// v2-fase-c
import { useState, useEffect, useRef } from 'react'
import {
  type Selecciones,
  calcular, calcular90dias,
} from '@/lib/diagnostico'

// ── Paleta V1 ─────────────────────────────────────────────
const ROJO    = '#e8001d'
const AMARILLO = '#f5c400'
const NEGRO   = '#080808'
const DARK    = '#111111'
const DARK2   = '#1a1a1a'
const VERDE_S = '#00C853'
const TEAL_R  = '#4ECDC4'

// ── Labels de sueño para tabla resumen (E05) ─────────────
const SUENO_LABELS: Record<string, string> = {
  casa:      'La casa o el arreglo prometido',
  viaje:     'Las vacaciones postergadas',
  estudios:  'Los estudios tuyos o de tus hijos',
  deuda:     'La deuda que no te deja dormir',
  carro:     'El carro que prometiste cambiar',
  libertad:  'Tiempo libre sin culpa ni estrés',
}

// ── Gauge ─────────────────────────────────────────────────
function GaugeSVG({ score, color }: { score: number; color: string }) {
  const [anim, setAnim] = useState(0)
  useEffect(() => { const t = setTimeout(() => setAnim(score), 150); return () => clearTimeout(t) }, [score])
  const rotation = (anim / 100) * 180 - 90
  return (
    <div style={{ textAlign: 'center' }}>
      <svg viewBox="0 0 200 110" width="220" height="115" style={{ overflow: 'visible', display: 'block', margin: '0 auto' }}>
        <path d="M 22 95 A 78 78 0 0 0 178 95" fill="none" stroke="#333" strokeWidth="14" strokeLinecap="round" />
        <path d="M 22 95 A 78 78 0 0 0 76 21"  fill="none" stroke="#ef4444" strokeWidth="14" strokeLinecap="butt" opacity="0.6" />
        <path d="M 76 21 A 78 78 0 0 0 135 26" fill="none" stroke="#f59e0b" strokeWidth="14" strokeLinecap="butt" opacity="0.6" />
        <path d="M 135 26 A 78 78 0 0 0 178 95" fill="none" stroke="#10b981" strokeWidth="14" strokeLinecap="butt" opacity="0.6" />
        <text x="16"  y="110" textAnchor="middle" fontSize="8" fill="#666">0</text>
        <text x="100" y="12"  textAnchor="middle" fontSize="8" fill="#666">50</text>
        <text x="184" y="110" textAnchor="middle" fontSize="8" fill="#666">100</text>
        <g style={{ transformOrigin: '100px 95px', transform: `rotate(${rotation}deg)`, transition: 'transform 1.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <line x1="100" y1="95" x2="100" y2="23" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="100,17 97,28 103,28" fill="white" />
        </g>
        <circle cx="100" cy="95" r="9" fill={ROJO} />
        <circle cx="100" cy="95" r="4" fill="white" />
      </svg>
      <div style={{ marginTop: 4 }}>
        <div style={{ fontSize: 52, fontWeight: 900, color: 'white', lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>/100</div>
        <div style={{ fontSize: 14, fontWeight: 700, color, marginTop: 6 }}>
          {score < 40 ? 'Tu sistema tiene fugas críticas.' : score < 65 ? 'Buen potencial, pero con fugas importantes.' : 'Tu sistema funciona, pero pierde dinero.'}
        </div>
      </div>
    </div>
  )
}

// ── SubBar ────────────────────────────────────────────────
function SubBar({ label, score, delay = 0 }: { label: string; score: number; delay?: number }) {
  const [w, setW] = useState(0)
  useEffect(() => { const t = setTimeout(() => setW(score), 300 + delay); return () => clearTimeout(t) }, [score, delay])
  const c = score <= 3 ? '#ef4444' : score <= 6 ? '#f59e0b' : '#10b981'
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#ccc' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: c }}>{score}/10</span>
      </div>
      <div style={{ background: '#2a2a2a', borderRadius: 6, height: 7, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 6, background: c, width: `${w * 10}%`, transition: `width 1s cubic-bezier(0.34,1.56,0.64,1) ${delay * 0.001}s` }} />
      </div>
    </div>
  )
}

// ── CluedoBtn — botón 3D estilo tablero ─────────────────
function CluedoBtn({ label, onClick, disabled = false, full = true, fontSize = 20 }: { label: string; onClick: () => void; disabled?: boolean; full?: boolean; fontSize?: number }) {
  const shadow = '0 8px 0 #4a0008, 0 12px 28px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)'
  const shadowPressed = '0 3px 0 #4a0008, 0 5px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12)'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: full ? 'block' : 'inline-block',
        width: full ? '100%' : undefined,
        padding: '18px 32px',
        background: disabled ? '#1a1a1a' : 'linear-gradient(180deg, #c8001a 0%, #9a0014 60%, #7a000f 100%)',
        color: disabled ? 'rgba(255,255,255,0.25)' : 'white',
        border: disabled ? 'none' : '3px solid rgba(255,255,255,0.15)',
        borderRadius: 14,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize, letterSpacing: '0.10em',
        boxShadow: disabled ? 'none' : shadow,
        textShadow: disabled ? 'none' : '0 1px 3px rgba(0,0,0,0.5)',
        transition: 'transform 0.08s ease, box-shadow 0.08s ease',
      }}
      onMouseDown={e => { if (!disabled) { e.currentTarget.style.transform = 'translateY(5px)'; e.currentTarget.style.boxShadow = shadowPressed } }}
      onMouseUp={e => { if (!disabled) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = shadow } }}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = shadow } }}
    >
      {label}
    </button>
  )
}

// ── TogBtn ────────────────────────────────────────────────
function TogBtn({ label, selected, variant, onClick }: { label: string; selected: boolean; variant: 'yes' | 'no'; onClick: () => void }) {
  const selColor = variant === 'yes' ? VERDE_S : ROJO
  const selBg    = variant === 'yes' ? '#001a0a' : '#1a0000'
  return (
    <button type="button" onClick={onClick} style={{
      flex: 1, padding: '16px 12px', borderRadius: 10,
      border: selected ? `1px solid ${selColor}` : '1px solid #2a2a2a',
      background: selected ? selBg : '#0a0a0a',
      color: selected ? selColor : '#666',
      fontFamily: "'Barlow', sans-serif",
      fontWeight: selected ? 700 : 600, fontSize: 14,
      cursor: 'pointer', transition: 'all 0.15s', lineHeight: 1.4, textAlign: 'center',
    }}>
      {label}
    </button>
  )
}

// ── ConseqBtn — botón de consecuencia forense (E05) ───────
function ConseqBtn({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{
      display: 'block', width: '100%', padding: '14px 18px',
      borderRadius: 10,
      border: selected ? `1px solid ${AMARILLO}` : '1px solid #1e1e1e',
      background: selected ? '#0a0900' : '#0a0a0a',
      color: selected ? AMARILLO : '#555',
      fontFamily: "'General Sans', system-ui, sans-serif",
      fontWeight: selected ? 600 : 400, fontSize: 14,
      cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
      lineHeight: 1.5,
    }}>
      {label}
    </button>
  )
}

// ── Hipótesis: valores de confianza por paso ──────────────
// P1: paso=1 diferenciado por v1 — escasez de contactos se debilita cuando el valor es alto
function getHipValsCurr(paso: number, sel: Selecciones): [number, number, number] {
  if (paso === 1) {
    const v1 = sel.v1 ?? 0
    if (v1 >= 3000) return [12, 55, 33]
    if (v1 >= 1000) return [28, 48, 24]
    return [45, 30, 25]
  }
  if (paso === 2) {
    const v2 = sel.v2 ?? 0
    if (v2 >= 5) return [10, 76, 14]
    if (v2 >= 2) return [28, 52, 20]
    return [36, 40, 24]
  }
  if (paso === 3) {
    if (sel.q3 === false) return [8, 86, 6]
    return [18, 40, 55]
  }
  if (paso === 4) {
    if (sel.q4 === false) return [5, 92, 3]
    return [10, 76, 14]
  }
  return [4, 93, 3]
}
function getHipValsPrev(paso: number, sel: Selecciones): [number, number, number] {
  if (paso <= 0) return [0, 0, 0]
  if (paso === 1) return [33, 33, 34]  // prior uniforme antes de cualquier evidencia
  return getHipValsCurr(paso - 1, sel)
}

// ── Textos de razonamiento ────────────────────────────────
function getRazTexts(paso: number, sel: Selecciones, nombre: string): [string, string, string] {
  const v1s = sel.v1 ? `$${sel.v1.toLocaleString('en-US')}` : 'el valor que ingresaste'
  const v2   = sel.v2 ?? 0
  const fn   = nombre.split(' ')[0] || nombre

  if (paso === 1) {
    const v1 = sel.v1 ?? 0
    if (v1 >= 3000) return [
      'Analizando tu respuesta...',
      `Con ${v1s} por venta, la falta de contactos nuevos queda descartada como la causa principal. Quien trabaja en este nivel tiene acceso a prospectos. El problema está en otro punto del proceso.`,
      'Una pista eliminada. El caso se estrecha.',
    ]
    if (v1 >= 1000) return [
      'Analizando tu respuesta...',
      `Con ${v1s} por venta, ya tenemos el número real con el que trabajamos. El análisis tiene ahora una base concreta.`,
      'El análisis tiene base. Siguiente pista.',
    ]
    return [
      'Analizando tu respuesta...',
      `Con ${v1s} por venta, el volumen de prospectos necesario para llegar a tu meta es alto. Evaluamos si la falta de contactos nuevos está operando como factor.`,
      'Un sospechoso gana terreno. Siguiente pregunta.',
    ]
  }
  if (paso === 2) {
    if (v2 >= 5) return [
      'Cruzando con tu respuesta anterior...',
      `Con ${v2} prospectos sin seguimiento y comisiones de ${v1s}, la falta de contactos nuevos no explica este patrón. La descartamos.`,
      'El volumen no era el problema. Un sospechoso menos.',
    ]
    if (v2 >= 2) return [
      'Cruzando con tu respuesta anterior...',
      `Al cruzar ${v2} prospectos sin contacto con ${v1s} por venta, el nivel de exposición queda definido. El patrón empieza a ser visible.`,
      'El rastro se hace visible. Siguiente pregunta.',
    ]
    return [
      'Evaluando tu respuesta...',
      `${v2 === 0 ? 'Ningún' : v2} prospecto${v2 === 1 ? '' : 's'} sin seguimiento con comisiones de ${v1s}. Combinación poco común. Evaluamos una causa alternativa.`,
      'La dirección acaba de cambiar.',
    ]
  }
  if (paso === 3) {
    if (sel.q3 === false) return [
      'Recalculando...',
      'Confirmado. La ausencia de un protocolo claro ante el "lo pienso" es el punto exacto donde las ventas desaparecen. El análisis tiene ahora un origen específico.',
      'El sospechoso principal se activa.',
    ]
    return [
      'Recalculando...',
      `Corrección. Tener un protocolo para el "lo pienso" descarta esa como la causa principal. El problema está en otro punto del proceso.`,
      'Una pista eliminada. Nueva dirección confirmada.',
    ]
  }
  if (paso === 4) {
    if (sel.q4 === false) return [
      'Incorporando último dato...',
      `Sin la tasa de cierre documentada, la naturaleza de las fugas queda establecida. Hay un patrón que opera en un punto específico y repetible del proceso de ${fn}.`,
      'El culpable se confirma.',
    ]
    return [
      'Incorporando último dato...',
      'Tener la tasa de cierre documentada descarta una de las posibles causas. El origen apunta a un punto del proceso que opera fuera del control actual.',
      'Una pista más eliminada. Queda uno.',
    ]
  }
  return [
    'Última respuesta registrada.',
    `El análisis está completo, ${fn}. El impacto puede expresarse en términos concretos — calculados con tus propios datos.`,
    'Todas las pistas evaluadas. Un solo culpable.',
  ]
}

// ── Colores fijos por causa (sistema Cluedo) ─────────────
const CAUSA_COLORS = ['#e8001d', '#f5c400', '#00C853'] as const

// ── CausaCard — caja estilo Cluedo con sello y glow ──────
function CausaCard({ nombre, colorIdx, from: f, to: t, delay }: {
  nombre: string; colorIdx: 0 | 1 | 2; from: number; to: number; delay: number
}) {
  const [active, setActive] = useState(false)
  useEffect(() => { const id = setTimeout(() => setActive(true), delay); return () => clearTimeout(id) }, [delay])

  const color       = CAUSA_COLORS[colorIdx]
  const descartada  = t < 12
  const fortalecida = t >= 75 || (t > f && t >= 50)

  const bgAlpha     = descartada ? '0.04' : fortalecida ? '0.12' : '0.07'
  const borderColor = descartada ? `${color}44` : fortalecida ? color : `${color}88`
  const glowShadow  = fortalecida && active
    ? `0 0 18px 3px ${color}59, 0 0 6px 1px ${color}44, inset 0 0 8px ${color}26`
    : 'none'

  // texto legibilidad: siempre ≥ 88%
  const textOpacity = descartada ? 0.45 : 1

  return (
    <div style={{
      position: 'relative',
      border: `1.5px solid ${borderColor}`,
      borderRadius: 10,
      padding: '14px 16px',
      background: `rgba(${colorIdx === 0 ? '232,0,29' : colorIdx === 1 ? '245,196,0' : '0,200,83'},${bgAlpha})`,
      boxShadow: active ? glowShadow : 'none',
      transition: 'box-shadow 0.4s ease, opacity 0.4s ease',
      opacity: active && descartada ? 0.48 : 1,
      overflow: 'hidden',
    }}>
      {/* Dot de color */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: color,
          boxShadow: fortalecida && active ? `0 0 6px 2px ${color}88` : 'none',
          flexShrink: 0,
        }} />
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: fortalecida && active ? color : `rgba(255,255,255,0.65)`,
          transition: 'color 0.4s',
        }}>
          {descartada ? 'DESCARTADA' : fortalecida ? 'CAUSA PRINCIPAL ↑' : 'EN ANÁLISIS'}
        </span>
      </div>

      <span style={{
        fontFamily: "'General Sans', system-ui, sans-serif",
        fontSize: fortalecida && active ? 15 : 14,
        fontWeight: fortalecida && active ? 600 : 400,
        color: `rgba(255,255,255,${textOpacity})`,
        lineHeight: 1.4,
        transition: 'font-size 0.3s, font-weight 0.3s, color 0.4s',
        display: 'block',
      }}>
        {nombre}
      </span>

      {/* Sello DESCARTADA */}
      {descartada && active && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 22, letterSpacing: '0.18em',
            color: color,
            border: `2.5px solid ${color}`,
            borderRadius: 4,
            padding: '2px 10px',
            transform: 'rotate(-18deg)',
            opacity: 0.82,
            animation: 'stampIn 0.28s cubic-bezier(0.25,0.46,0.45,0.94) both',
            textShadow: `0 0 8px ${color}66`,
          }}>
            DESCARTADA
          </div>
        </div>
      )}
    </div>
  )
}

// ── DictamenRow ───────────────────────────────────────────
function DictamenRow({ label, delay }: { label: string; delay: number }) {
  const [done, setDone] = useState(false)
  useEffect(() => { const id = setTimeout(() => setDone(true), delay); return () => clearTimeout(id) }, [delay])
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #141414' }}>
      <span style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontSize: 14, color: done ? '#888' : '#2a2a2a', transition: 'color 0.9s ease', letterSpacing: '0.01em' }}>{label}</span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: done ? '#22C55E' : '#1a1a1a', transition: 'color 0.9s ease', letterSpacing: '0.1em', minWidth: 28, textAlign: 'right' }}>
        {done ? '✔' : '···'}
      </span>
    </div>
  )
}

// ── RazonamientoPanel ─────────────────────────────────────
function RazonamientoPanel({ paso, sel, nombre, onContinue }: {
  paso: number; sel: Selecciones; nombre: string; onContinue: () => void
}) {
  const [beat, setBeat] = useState(0)
  useEffect(() => {
    const t1 = setTimeout(() => setBeat(1), 500)
    const t2 = setTimeout(() => setBeat(2), 1700)
    const t3 = setTimeout(() => setBeat(3), 3200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const [b0, b1, b2] = getRazTexts(paso, sel, nombre)
  const prev = getHipValsPrev(paso, sel)
  const curr = getHipValsCurr(paso, sel)
  const H_NAMES = ['Falta de contactos nuevos', 'Proceso con pasos perdidos', 'Mercado saturado']

  return (
    <div style={{ padding: '32px 16px 64px', animation: 'up 0.4s ease' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.14em', marginBottom: 32, textTransform: 'uppercase', animation: 'up 0.3s ease' }}>
          {b0}
        </div>

        {beat >= 1 && (
          <div style={{ background: 'rgba(8,8,8,0.72)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '24px', marginBottom: 14, animation: 'up 0.5s ease' }}>
            <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.88)', lineHeight: 1.85, margin: 0 }}>{b1}</p>
          </div>
        )}

        {beat >= 2 && (
          <div style={{ background: 'rgba(8,8,8,0.72)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px', marginBottom: 14, animation: 'up 0.5s ease' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>SOSPECHOSOS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {H_NAMES.map((n, i) => (
                <CausaCard key={i} nombre={n} colorIdx={i as 0|1|2} from={prev[i]} to={curr[i]} delay={300 + i * 280} />
              ))}
            </div>
          </div>
        )}

        {beat >= 3 && (
          <div style={{ animation: 'up 0.5s ease' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.1em', marginBottom: 24, lineHeight: 1.9, textTransform: 'uppercase' }}>
              {b2}
            </div>
            <CluedoBtn label={paso < 5 ? 'Siguiente pregunta →' : 'Ver mi resultado →'} onClick={onContinue} fontSize={18} />
          </div>
        )}
      </div>
    </div>
  )
}

// ── DictamenPreliminar ────────────────────────────────────
function DictamenPreliminar({ r, nombre, sel, onContinue }: {
  r: ReturnType<typeof calcular>; nombre: string; sel: Selecciones; onContinue: () => void
}) {
  const [detalleAbierto, setDetalleAbierto] = useState(false)
  const [glowOn, setGlowOn] = useState(false)
  useEffect(() => { const t = setTimeout(() => setGlowOn(true), 300); return () => clearTimeout(t) }, [])

  const primerNombre = nombre.split(' ')[0] || nombre
  const score        = r.total
  const esRojo       = score < 40
  const esAmarillo   = score >= 40 && score <= 70
  const esVerde      = score > 70
  const semColor     = esRojo ? '#e8001d' : esAmarillo ? '#f5c400' : '#00C853'
  const semColor2    = esRojo ? '#e8001d44' : esAmarillo ? '#f5c40044' : '#00C85344'
  const palabra      = esRojo ? 'Crítico.' : esAmarillo ? 'Ajustable.' : 'Sólido.'
  const lineaTalento = esRojo ? 'No es falta de talento. Es falta de sistema.' : esAmarillo ? 'Tienes talento. Te falta sistema.' : 'Tu talento ya casi tiene el sistema que necesita.'
  const fmt          = (n: number) => '$' + n.toLocaleString('en-US')

  const glow = (c: string) => glowOn
    ? `0 0 24px ${c}99, 0 0 48px ${c}55, 0 0 8px ${c}dd`
    : 'none'

  const parrafo = esRojo
    ? 'No es un problema de esfuerzo — es un punto específico del proceso donde las ventas se pierden antes de que puedas cerrarlas. Con el sistema correcto, eso se corrige.'
    : esAmarillo
    ? 'Tu proceso tiene base sólida, pero hay una fuga activa que drena comisiones de forma silenciosa. Un ajuste puntual cambia el resultado.'
    : 'Tu sistema funciona mejor que el 70% de los vendedores B2B. Aún así, hay una fuga específica que te está costando dinero sin que lo notes.'

  const bullets90 = calcular90dias(sel, r.perdidaMensual)

  // Causas Cluedo para el detalle
  const H_NAMES   = ['Falta de contactos nuevos', 'Proceso con pasos perdidos', 'Mercado saturado']
  const hipFinal  = getHipValsCurr(5, sel)
  const hipAntes  = getHipValsPrev(5, sel)

  return (
    <div style={{ padding: '32px 16px 80px', animation: 'fadeUp 0.5s ease both' }}>
      <div style={{ maxWidth: 460, margin: '0 auto' }}>

        {/* ── 1. SEMÁFORO ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
          <div style={{
            background: 'rgba(10,10,10,0.92)', border: '2px solid #2a2a2a', borderRadius: 64,
            padding: '16px 12px', display: 'inline-flex', flexDirection: 'column', gap: 12,
            boxShadow: '0 12px 48px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: esRojo ? '#e8001d' : '#1c0000', border: esRojo ? '2px solid rgba(255,255,255,0.12)' : '1px solid #2a0000', transition: 'background 0.6s', ...(esRojo && glowOn ? { '--sem-c': '#e8001d88', '--sem-c2': '#e8001d33', animation: 'semPulse 2.4s ease-in-out infinite' } as React.CSSProperties : { boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8)' }) }} />
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: esAmarillo ? '#f5c400' : '#1a1200', border: esAmarillo ? '2px solid rgba(255,255,255,0.12)' : '1px solid #2a2000', transition: 'background 0.6s', ...(esAmarillo && glowOn ? { '--sem-c': '#f5c40088', '--sem-c2': '#f5c40033', animation: 'semPulse 2.4s ease-in-out infinite' } as React.CSSProperties : { boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8)' }) }} />
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: esVerde ? '#00C853' : '#001808', border: esVerde ? '2px solid rgba(255,255,255,0.12)' : '1px solid #002010', transition: 'background 0.6s', ...(esVerde && glowOn ? { '--sem-c': '#00C85388', '--sem-c2': '#00C85333', animation: 'semPulse 2.4s ease-in-out infinite' } as React.CSSProperties : { boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8)' }) }} />
          </div>
        </div>

        {/* ── 2. PALABRA DE IMPACTO ── */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(52px,13vw,76px)',
            color: semColor, lineHeight: 1, display: 'block', letterSpacing: '0.04em',
            filter: glowOn ? `drop-shadow(0 0 24px ${semColor}66)` : 'none',
            transition: 'filter 0.8s ease',
          }}>
            {palabra}
          </span>
        </div>

        {/* ── 3. TRES LÍNEAS DIRECTAS ── */}
        <div style={{
          background: 'rgba(8,8,8,0.88)', backdropFilter: 'blur(12px)',
          border: `1px solid ${semColor}33`, borderRadius: 14,
          padding: '22px 24px', marginBottom: 20,
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          {/* Línea consecuencia */}
          <p style={{
            fontFamily: "'General Sans', system-ui, sans-serif",
            fontSize: 'clamp(15px,3.5vw,17px)',
            color: 'rgba(255,255,255,0.90)',
            lineHeight: 1.5, margin: 0,
          }}>
            {lineaTalento}
          </p>

          {/* Cifra mensual — sin ocultar */}
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(42px,10vw,64px)',
            color: semColor, letterSpacing: '0.02em', lineHeight: 1,
            filter: glowOn ? `drop-shadow(0 0 16px ${semColor}55)` : 'none',
            transition: 'filter 0.8s ease',
          }}>
            {r.perdidaMensual > 0 ? `${fmt(r.perdidaMensual)}/mes` : 'CALCULANDO...'}
          </div>

          {/* Cuello de botella */}
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 'clamp(11px,2.5vw,13px)',
            color: 'rgba(255,255,255,0.88)',
            letterSpacing: '0.06em', lineHeight: 1.5, margin: 0,
          }}>
            Tu cuello de botella:{' '}
            <span style={{ color: semColor, fontWeight: 700 }}>{r.cuelloLabel.toLowerCase()}</span>.
          </p>
        </div>

        {/* ── 4. CTA PRINCIPAL ── */}
        <CluedoBtn label="VER EL PLAN COMPLETO →" onClick={onContinue} />

        {/* ── 5. LINK DISCRETO EXPANDIR ── */}
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <button
            onClick={() => setDetalleAbierto(d => !d)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, color: 'rgba(255,255,255,0.55)',
              letterSpacing: '0.08em', textDecoration: 'underline',
              textUnderlineOffset: 3,
              padding: '8px 0',
            }}
          >
            {detalleAbierto ? 'Ocultar detalle ↑' : 'Ver el detalle completo de mi diagnóstico ↓'}
          </button>
        </div>

        {/* ── SECCIÓN EXPANDIBLE ── */}
        {detalleAbierto && (
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeUp 0.35s ease both' }}>

            {/* Bloque: Por qué — contexto */}
            <div style={{ background: 'rgba(8,8,8,0.80)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 22px' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>LA BUENA NOTICIA</div>
              <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, margin: 0 }}>
                {parrafo}
              </p>
            </div>

            {/* Bloque: Lo que pasa en 90 días */}
            {bullets90.length > 0 && (
              <div style={{ background: 'rgba(8,8,8,0.80)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 22px' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>AJUSTE EN EL ANÁLISIS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {bullets90.map((b, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: semColor, flexShrink: 0, marginTop: 2, letterSpacing: '0.08em' }}>0{i + 1}</span>
                      <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.82)', lineHeight: 1.65, margin: 0 }}>{b}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bloque: Causas evaluadas (Cluedo) */}
            <div style={{ background: 'rgba(8,8,8,0.80)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 22px' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>CAUSAS EVALUADAS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {H_NAMES.map((n, i) => (
                  <CausaCard key={i} nombre={n} colorIdx={i as 0|1|2} from={hipAntes[i]} to={hipFinal[i]} delay={i * 200} />
                ))}
              </div>
            </div>

            {/* Bloque: Tu proceso por área */}
            <div style={{ background: 'rgba(8,8,8,0.80)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 22px' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>TUS RESPUESTAS · PROCESO POR ÁREA</div>
              <SubBar label="Seguimiento" score={r.sub.seguimiento} delay={0} />
              <SubBar label="Priorización" score={r.sub.priorizacion} delay={100} />
              <SubBar label="Preparación de cierre" score={r.sub.preparacion} delay={200} />
              <SubBar label="Visibilidad del proceso" score={r.sub.reporte} delay={300} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 14, marginTop: 10 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Salud general</span>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: semColor, letterSpacing: '0.04em', lineHeight: 1 }}>{r.total}/100</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

// ── VeredictoReveal ───────────────────────────────────────
function VeredictoReveal({ r, nombre, sel, onContinue }: { r: ReturnType<typeof calcular>; nombre: string; sel: Selecciones; onContinue: () => void }) {
  const [beat, setBeat] = useState(0)
  useEffect(() => {
    const t1 = setTimeout(() => setBeat(1), 600)
    const t2 = setTimeout(() => setBeat(2), 1800)
    const t3 = setTimeout(() => setBeat(3), 3200)
    const t4 = setTimeout(() => setBeat(4), 4600)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [])

  const primerNombre = nombre.split(' ')[0] || nombre
  const fmt = (n: number) => '$' + n.toLocaleString('en-US')

  return (
    <div style={{ padding: '48px 16px 64px', animation: 'fadeUp 0.5s ease both' }}>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>

        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 40, textAlign: 'center' }}>
          RESULTADO FINAL · DIAGNÓSTICO DE {nombre.toUpperCase()}
        </div>

        {beat >= 1 && (
          <div style={{ animation: 'fadeUp 0.5s ease both', marginBottom: 32, textAlign: 'center' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>
              AQUÍ ESTÁ TU FUGA PRINCIPAL
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(44px,10vw,82px)', lineHeight: 0.92, color: 'white', margin: '0 0 10px', letterSpacing: '0.01em' }}>
              {r.cuelloLabel.toUpperCase()}
            </h2>
            <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, margin: 0 }}>
              {r.cuelloTexto}
            </p>
          </div>
        )}

        {beat >= 2 && r.perdidaMensual > 0 && (
          <div style={{ animation: 'fadeUp 0.5s ease both', background: 'rgba(8,8,8,0.72)', backdropFilter: 'blur(10px)', border: '1px solid #1f1f1f', borderRadius: 12, padding: '24px', marginBottom: 28 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>CUÁNTO ESTÁS PERDIENDO · POR MES</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(24px,5vw,38px)', color: ROJO, letterSpacing: '0.02em', lineHeight: 1 }}>{fmt(r.perdidaMensual)}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>por mes</div>
              </div>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(24px,5vw,38px)', color: AMARILLO, letterSpacing: '0.02em', lineHeight: 1 }}>{fmt(r.perdida90)}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>en 90 días</div>
              </div>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(24px,5vw,38px)', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.02em', lineHeight: 1 }}>{fmt(r.perdidaAnual)}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>al año</div>
              </div>
            </div>
            {r.perdidaMensual > 0 && (sel.v1 ?? 0) > 0 && (
              <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", margin: '14px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, borderTop: '1px solid #1a0000', paddingTop: 12 }}>
                Hoy dejaste escapar el equivalente a {Math.max(1, Math.round(r.perdida90 / (sel.v1 ?? 1)))} ventas. Si nada cambia, en 90 días habrás dejado escapar {fmt(r.perdida90)} — eso equivale a clientes que ya casi tenías cerrados.
              </p>
            )}
          </div>
        )}

        {beat >= 3 && r.suenoTextos && sel.sueno && (
          <div style={{ animation: 'fadeUp 0.5s ease both', marginBottom: 32 }}>
            <div style={{ background: '#0a0800', border: '1px solid rgba(245,196,0,0.1)', borderRadius: 10, padding: '18px 22px' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>
                Y ESE SUEÑO TUYO...
              </div>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: AMARILLO, letterSpacing: '0.04em', margin: '0 0 14px' }}>
                {SUENO_LABELS[sel.sueno]?.toUpperCase()}
              </p>
              <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 1.8, margin: '0 0 10px' }}>
                No necesita que trabajes más horas. Necesita un sistema que siga vendiendo cuando tú estás con tu familia, durmiendo, o disfrutando de un fin de semana.
              </p>
              <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, margin: 0 }}>
                Cada seguimiento que depende de tu memoria pone un límite al crecimiento de tu negocio.
              </p>
            </div>
          </div>
        )}

        {beat >= 4 && (
          <div style={{ animation: 'fadeUp 0.5s ease both' }}>
            <div style={{ borderLeft: '2px solid #222', paddingLeft: 16, marginBottom: 24 }}>
              <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 1.8, margin: '0 0 8px', fontStyle: 'italic' }}>
                "Si llevas 10 años haciendo lo mismo, no tienes 10 años de experiencia. Tienes 1 año repetido 10 veces."
              </p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.1em' }}>
                Atribuida a John C. Maxwell
              </p>
            </div>
            {r.fortalezas.length >= 2 && (
              <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 10, padding: '16px 20px', marginBottom: 24 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>LO QUE YA HACES BIEN</div>
                {r.fortalezas.slice(0, 2).map((f, i) => (
                  <p key={i} style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, margin: i === 0 ? '0 0 8px' : 0 }}>
                    – {f.texto}
                  </p>
                ))}
              </div>
            )}
            <CluedoBtn label="VER CÓMO RECUPERARLO →" onClick={onContinue} />
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center', marginTop: 14 }}>
              {primerNombre}, tu reporte incluye los pasos concretos para recuperar ese dinero.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}

// ── Máscara económica para dictamen preliminar ────────────
function maskAmount(n: number): string {
  if (n <= 0)    return '$X,XXX'
  if (n >= 10000) return '$XX,XXX'
  if (n >= 1000)  return '$X,XXX'
  if (n >= 100)   return '$XXX'
  return '$XX'
}
function maskRange(perdida: number): string {
  const lo = maskAmount(perdida)
  const hi = maskAmount(Math.round(perdida * 2.4))
  return `${lo} — ${hi}`
}

// P3: rango calibrado para expediente — magnitud visible, cifra no exacta
function calibratedRange(perdida: number): string {
  if (perdida <= 0) return 'Pendiente de cálculo'
  const f = (n: number) => '$' + Math.round(n).toLocaleString('en-US')
  const lo = Math.floor(perdida * 0.75 / 1000) * 1000
  const hi = Math.ceil(perdida * 1.35 / 1000) * 1000
  return `${f(lo)} — ${f(hi)}`
}

// ── Page ──────────────────────────────────────────────────
type Fase = 'form' | 'razonando' | 'suspense' | 'cargando' | 'dictamen_preliminar' | 'expediente' | 'veredicto' | 'accion' | 'desbloqueado'

export default function DiagnosticoPage() {
  const [fase, setFase] = useState<Fase>('form')
  const [pasoForm, setPasoForm] = useState(0)
  const [razonandoPaso, setRazonandoPaso] = useState(0)
  const [nombre, setNombre] = useState('')
  const [sel, setSel] = useState<Selecciones>({ v1: null, v2: null, q3: null, q4: null, sueno: null })
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [msgIdx, setMsgIdx] = useState(0)
  const cardRef   = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const nombreTrimmed = nombre.trim()

  function puedeAvanzar() {
    if (pasoForm === 0) return nombreTrimmed.length >= 2
    if (pasoForm === 1) return sel.v1 !== null && sel.v1 > 0
    if (pasoForm === 2) return sel.v2 !== null
    if (pasoForm === 3) return sel.q3 !== null
    if (pasoForm === 4) return sel.q4 !== null
    if (pasoForm === 5) return sel.sueno !== null
    return false
  }

  function avanzar() {
    if (fase === 'razonando') {
      if (razonandoPaso < 5) {
        setPasoForm(razonandoPaso + 1)
        setFase('form')
        setTimeout(() => cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80)
      } else {
        setFase('suspense')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return
    }
    if (!puedeAvanzar()) return
    if (pasoForm === 0) {
      setPasoForm(1)
      setTimeout(() => cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60)
      return
    }
    setRazonandoPaso(pasoForm)
    // Panel de razonamiento eliminado — ir directo a siguiente pregunta o resultado
    if (pasoForm < 5) {
      setPasoForm(pasoForm + 1)
      setTimeout(() => cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60)
    } else {
      setFase('suspense')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  async function desbloquear() {
    if (!email.includes('@')) { setEmailError('Ingresa un email válido.'); return }
    setEmailError('')
    setGuardando(true)
    const r = calcular(sel)
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        nombre: nombreTrimmed || null,
        score: r.total,
        perdida_mensual: r.perdidaMensual,
        cuello_de_botella: r.cuello,
        respuestas: sel,
      }),
    })
    setGuardando(false)
    setFase('desbloqueado')
  }

  function lanzarResultado() {
    setFase('cargando')
    let i = 0
    const iv = setInterval(() => { i++; setMsgIdx(Math.min(i, 5)) }, 700)
    setTimeout(() => {
      clearInterval(iv)
      setFase('dictamen_preliminar')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 4200)
  }

  const r = (fase === 'dictamen_preliminar' || fase === 'expediente' || fase === 'veredicto' || fase === 'accion' || fase === 'desbloqueado') ? calcular(sel) : null

  const progressBar = (
    <div style={{ marginBottom: 28 }}>
      <div style={{ background: '#1a1a1a', borderRadius: 100, height: 2 }}>
        {pasoForm > 0 && (
          <div style={{ width: `${(pasoForm / 5) * 100}%`, height: '100%', background: ROJO, borderRadius: 100, transition: 'width 0.6s ease' }} />
        )}
      </div>
    </div>
  )

  const card = (children: React.ReactNode) => (
    <div ref={cardRef} style={{
      background: 'rgba(8,8,8,0.72)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14,
      padding: '32px 26px',
      maxWidth: 480,
      margin: '0 auto',
    }}>
      {children}
    </div>
  )

  const nextBtn = (label: string) => (
    <div style={{ maxWidth: 560, margin: '16px auto 0' }}>
      <CluedoBtn label={label} onClick={avanzar} disabled={!puedeAvanzar()} />
    </div>
  )

  const MSGS = [
    'Analizando tus respuestas...',
    'Comparando con casos similares...',
    'Identificando la causa principal...',
    'Calculando el impacto financiero exacto...',
    'Preparando tu reporte personalizado...',
    'Calculando el resultado...',
  ]

  const statusText =
    fase === 'form'
      ? pasoForm === 0 ? 'DIAGNÓSTICO · EN ESPERA'
      : pasoForm === 1 ? 'IDENTIFICANDO LA FUGA'
      : pasoForm === 2 ? 'CALCULANDO PÉRDIDAS'
      : pasoForm === 3 ? 'CONFIRMANDO PATRÓN'
      : pasoForm === 4 ? 'ÚLTIMA VERIFICACIÓN'
      : 'ANÁLISIS COMPLETO'
    : fase === 'razonando'           ? 'ANALIZANDO TUS RESPUESTAS...'
    : fase === 'suspense'            ? 'ANÁLISIS COMPLETO · PREPARANDO RESULTADO'
    : fase === 'cargando'            ? 'CALCULANDO TU RESULTADO...'
    : fase === 'dictamen_preliminar' ? 'RESULTADO PRELIMINAR · EN CURSO'
    : fase === 'expediente'          ? `TU DIAGNÓSTICO · ${nombreTrimmed.toUpperCase()}`
    : fase === 'veredicto'           ? `RESULTADO FINAL · ${nombreTrimmed.toUpperCase()}`
    : `DIAGNÓSTICO COMPLETO · ${nombreTrimmed.toUpperCase()}`

  const fmt = (n: number) => '$' + n.toLocaleString('en-US')

  const qTitle = (text: string) => (
    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(26px,5vw,38px)', lineHeight: 1.05, color: ROJO, marginBottom: 10, letterSpacing: '0.01em', textAlign: 'center' }}>
      {text}
    </div>
  )
  const qSub = (text: string) => (
    <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", margin: '0 0 24px', fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 1.75 }}>{text}</p>
  )

  // Todas las pantallas del diagnóstico usan la misma imagen — fragmentos distintos por posición
  const bgMap: Record<number, string> = {
    0: 'url(/bg-detective.jpg)',
    1: 'url(/bg-detective.jpg)',
    2: 'url(/bg-detective.jpg)',
    3: 'url(/bg-detective.jpg)',
    4: 'url(/bg-detective.jpg)',
    5: 'url(/bg-detective.jpg)',
  }
  // Cada pantalla "corta" un fragmento distinto de la imagen (atmósfera, no el detective en primer plano)
  const bgPosMap: Record<number, string> = {
    0: 'center 4%',   // cielo nocturno / niebla superior
    1: '78% 18%',     // zona de letreros de neón (derecha alta)
    2: 'center 88%',  // adoquines mojados / suelo con reflejos
    3: '22% 42%',     // sombra azul lateral izquierda
    4: '74% 38%',     // atmósfera media-derecha
    5: 'center 62%',  // escena media — ambiente general
  }
  const bgActual   = 'url(/bg-detective.jpg)'
  const bgPosition = 'center 30%'

  // Contenido personalizado por cuello de botella — Pantalla 9
  const accionPorCuello: Record<string, { ref: string; texto: string }[]> = {
    seguimiento: [
      { ref: '01', texto: `Los ${sel.v2 ?? 0} prospectos sin seguimiento tienen una ventana para reactivarse. Tu plan detalla la secuencia exacta para cada uno.` },
      { ref: '02', texto: `El momento crítico: entre el día 7 y el día 14 sin contacto. Ahí es donde una venta de ${sel.v1 ? fmt(sel.v1) : 'ese valor'} pasa de posible a perdida.` },
      { ref: '03', texto: `La secuencia de reactivación tiene 3 puntos de contacto específicos — diseñados para el patrón que encontramos en el diagnóstico de ${nombreTrimmed.split(' ')[0] || nombreTrimmed}.` },
      { ref: '04', texto: `Sin acción, el acumulado en 90 días supera ${r ? fmt(r.perdida90) : 'lo calculado'}. Tu plan establece el momento de corte.` },
    ],
    priorizacion: [
      { ref: '01', texto: `El problema no es la cantidad de prospectos. Es que los de mayor valor esperan mientras los de menor valor consumen tu tiempo, ${nombreTrimmed.split(' ')[0] || nombreTrimmed}.` },
      { ref: '02', texto: `Con comisiones de ${sel.v1 ? fmt(sel.v1) : 'ese valor'}, una semana de atención mal priorizada equivale a esa cifra perdida sin que nadie lo note.` },
      { ref: '03', texto: `Tu plan documenta el criterio de priorización exacto: qué señales determinan qué prospecto va primero — y cuál puede esperar sin riesgo.` },
      { ref: '04', texto: `Sin un orden claro, el ciclo se repite: más esfuerzo, resultado variable. Tu plan documenta dónde cortar ese ciclo esta semana.` },
    ],
    preparacion: [
      { ref: '01', texto: `El momento de mayor riesgo es cuando el cliente duda. Tu plan documenta qué decir exactamente en ese punto del proceso de ${nombreTrimmed.split(' ')[0] || nombreTrimmed}.` },
      { ref: '02', texto: `Las 3 objeciones más frecuentes en tu tipo de venta representan más del 60% de las ventas perdidas en la fase de decisión.` },
      { ref: '03', texto: `Con comisiones de ${sel.v1 ? fmt(sel.v1) : 'ese valor'}, una objeción sin respuesta preparada es una pérdida predecible — y evitable desde hoy.` },
      { ref: '04', texto: `Tu plan incluye exactamente en qué punto entra en juego la falta de preparación y cómo corregirlo en los próximos 7 días.` },
    ],
    reporte: [
      { ref: '01', texto: `Sin números claros, el proceso se repite sin corrección. Los ${sel.v2 ?? 0} prospectos sin seguimiento son el resultado de ese ciclo.` },
      { ref: '02', texto: `Tu plan establece los 3 indicadores mínimos que bastan para detectar dónde se pierde cada venta de ${sel.v1 ? fmt(sel.v1) : 'ese valor'}.` },
      { ref: '03', texto: `Con visibilidad básica del proceso, el patrón actual se interrumpe en menos de 30 días. Tu plan documenta el punto de entrada.` },
      { ref: '04', texto: `El costo de no medir está calculado. Tu plan documenta cómo revertirlo con los datos que ya tienes, ${nombreTrimmed.split(' ')[0] || nombreTrimmed}.` },
    ],
  }

  return (
    <div
      style={{
      minHeight: '100vh', fontFamily: "'General Sans', system-ui, sans-serif", color: 'white', overflowX: 'hidden',
      background: NEGRO,
      backgroundImage: fase === 'suspense' ? 'none' : fase === 'dictamen_preliminar' ? `linear-gradient(rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.75) 100%), ${bgActual}` : (fase === 'form' || fase === 'razonando') ? `linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 55%, rgba(0,0,0,0.25) 100%), ${bgActual}` : 'none',
      backgroundSize: 'cover', backgroundPosition: bgPosition,
      transition: 'background-image 0.6s ease',
    }}>
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;600;700&family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;700&display=swap');
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
        @keyframes up      { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes stampIn { from { opacity:0; transform:rotate(-25deg) scale(1.4); } to { opacity:0.82; transform:rotate(-18deg) scale(1); } }
        @keyframes blink   { 0%,100% { opacity:1; } 50% { opacity:0; } }
        @keyframes ticker  { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes iconPulse { 0%,100% { opacity:0.9; } 50% { opacity:0.4; } }
        @keyframes semPulse  { 0%,100% { box-shadow: 0 0 18px 6px var(--sem-c), 0 0 40px 12px var(--sem-c2); } 50% { box-shadow: 0 0 6px 2px var(--sem-c), 0 0 14px 4px var(--sem-c2); } }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        input::placeholder { color: #333; }
      `}</style>

      {/* Header completo sticky — hazard + cinta + nav */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50 }}>

        {/* Franja precaución amarillo/negro */}
        <div style={{ height: 4, background: 'repeating-linear-gradient(-45deg, #F5C400 0px, #F5C400 5px, #080808 5px, #080808 10px)' }} />

        {/* Cinta animada roja */}
        <div style={{ overflow: 'hidden', background: ROJO, height: 28, display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', animation: 'ticker 18s linear infinite', whiteSpace: 'nowrap', willChange: 'transform' }}>
            {[...Array(2)].map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                {['BUSCANDO AL LADRÓN', '¿QUIÉN TE ESTÁ ROBANDO?', 'EL SOSPECHOSO ESTÁ CERCA', 'CADA RESPUESTA ES UNA PISTA', '2 MINUTOS PARA DESCUBRIRLO'].map((item, j) => (
                  <span key={j} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '0 28px', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: 'white', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                    <span style={{ animation: 'iconPulse 2.2s ease-in-out infinite', animationDelay: `${j * 0.5}s` }}>⚡</span>
                    {item}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Franja precaución inferior */}
        <div style={{ height: 4, background: 'repeating-linear-gradient(-45deg, #F5C400 0px, #F5C400 5px, #080808 5px, #080808 10px)' }} />

        {/* Barra de navegación */}
        <div style={{ borderBottom: '1px solid #1a1a1a', background: 'rgba(8,8,8,0.96)', backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', maxWidth: 1100, margin: '0 auto' }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: 'white', letterSpacing: '0.12em' }}>CBC™</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.15em', textTransform: 'uppercase', transition: 'color 0.4s' }}>
            {statusText}
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: fase === 'veredicto' || fase === 'accion' || fase === 'desbloqueado' ? '#22C55E' : '#E53935', marginLeft: 8, animation: 'blink 1.4s ease-in-out infinite', verticalAlign: 'middle' }} />
          </span>
        </div>
        </div>
      </div>

      {/* Hero — solo paso 0 */}
      <section style={{ padding: '60px 24px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden', display: pasoForm === 0 ? 'block' : 'none' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 50% at 50% 0%, rgba(229,57,53,0.07), transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: '#888', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 32 }}>
            DIAGNÓSTICO COMERCIAL · CBC™
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(52px,10vw,96px)', lineHeight: 0.9, color: 'white', margin: '0 0 48px', letterSpacing: '0.02em', overflow: 'visible' }}>
            EN 2 MINUTOS<br />SABES QUIÉN TE<br />ESTÁ <span style={{ color: ROJO }}>ROBANDO</span><br />TUS COMISIONES.
          </h1>
          <div style={{ textAlign: 'left', maxWidth: 520, margin: '0 auto 36px' }}>
            <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.90)', lineHeight: 1.8, margin: '0 0 20px' }}>
              Existe una fuga. <span style={{ color: '#F5C400', fontWeight: 700 }}>¿Tienes algún sospechoso en mente?</span>
            </p>
          </div>
          <div style={{ maxWidth: 520, margin: '0 auto 8px' }}>
            {progressBar}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', maxWidth: 400, margin: '0 auto' }}>
            <div style={{ height: 1, flex: 1, background: '#222' }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.15em' }}>SOLO TÚ VES TUS RESPUESTAS</span>
            <div style={{ height: 1, flex: 1, background: '#222' }} />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FORMULARIO
      ════════════════════════════════════════ */}
      {fase === 'form' && (
        <div style={{ padding: '0 16px 64px' }}>

          {pasoForm === 0 && (
            <div style={{ animation: 'up 0.4s ease' }}>
              {card(
                <>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(24px,5vw,32px)', lineHeight: 1.1, color: 'white', marginBottom: 10, letterSpacing: '0.01em' }}>
                    ¿Cómo te llamas?
                  </div>
                  <input
                    type="text" placeholder="Tu nombre" value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && avanzar()}
                    autoFocus
                    style={{ display: 'block', width: '100%', padding: '14px 18px', background: '#0c0c0c', border: `1px solid ${nombreTrimmed.length >= 2 ? ROJO : '#222'}`, borderRadius: 8, color: 'white', fontFamily: "'General Sans', system-ui, sans-serif", fontSize: 16, fontWeight: 600, outline: 'none', transition: 'border-color 0.2s', letterSpacing: '0.02em' }}
                  />
                </>
              )}
              {nextBtn('Continuar →')}
            </div>
          )}

          {pasoForm >= 1 && (
            <div style={{ animation: 'up 0.4s ease' }}>
              {card(
                <>
                  {progressBar}

                  {/* E1 */}
                  {pasoForm === 1 && <>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(26px,5vw,38px)', lineHeight: 1.05, marginBottom: 10, letterSpacing: '0.01em', textAlign: 'center' }}>
                      <span style={{ color: 'white' }}>{nombreTrimmed.split(' ')[0] || nombreTrimmed}, </span>
                      <span style={{ color: ROJO }}>¿Estás list@ para identificar al ladrón de tus comisiones?</span>
                    </div>
                    {qSub('¿Cuánto es tu comisión por cada venta que cierras?')}
                    <div style={{ position: 'relative', marginBottom: 8 }}>
                      <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: 'rgba(255,255,255,0.65)', pointerEvents: 'none', zIndex: 1 }}>$</span>
                      <input type="number" min={0} placeholder="0" value={sel.v1 ?? ''} onChange={e => { const v = Number(e.target.value); setSel(s => ({ ...s, v1: v > 0 ? v : null })) }} onKeyDown={e => e.key === 'Enter' && avanzar()} autoFocus
                        style={{ width: '100%', background: '#0c0c0c', border: `1px solid ${(sel.v1 ?? 0) > 0 ? ROJO : '#222'}`, borderRadius: 8, padding: '14px 16px 14px 40px', color: 'white', fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 700, outline: 'none', transition: 'border-color 0.2s', letterSpacing: '0.04em' }} />
                    </div>
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.08em' }}>VALOR EN USD · SOLO TÚ VES ESTE CAMPO</p>
                  </>}

                  {/* E2 */}
                  {pasoForm === 2 && <>
                    {qTitle('¿Cuántos prospectos llevan más de 7 días sin seguimiento?')}
                    {qSub('Los que están en tu lista esperando. Ahora mismo. Sé honesto — nadie más va a ver tu respuesta.')}
                    <div style={{ position: 'relative', marginBottom: 8 }}>
                      <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: 'rgba(255,255,255,0.65)', pointerEvents: 'none', zIndex: 1 }}>#</span>
                      <input type="number" min={0} placeholder="0" value={sel.v2 ?? ''} onChange={e => { const v = Number(e.target.value); setSel(s => ({ ...s, v2: e.target.value === '' ? null : v >= 0 ? v : 0 })) }} onKeyDown={e => e.key === 'Enter' && avanzar()} autoFocus
                        style={{ width: '100%', background: '#0c0c0c', border: `1px solid ${sel.v2 !== null ? ROJO : '#222'}`, borderRadius: 8, padding: '14px 16px 14px 40px', color: 'white', fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 700, outline: 'none', transition: 'border-color 0.2s', letterSpacing: '0.04em' }} />
                    </div>
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.08em' }}>NÚMERO DE PROSPECTOS · SÉ PRECISO</p>
                  </>}

                  {/* E3 */}
                  {pasoForm === 3 && <>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(26px,5vw,38px)', lineHeight: 1.05, marginBottom: 10, letterSpacing: '0.01em', textAlign: 'center' }}>
                      <span style={{ color: 'white' }}>Cuando un cliente te dice &apos;lo pienso&apos; — </span>
                      <span style={{ color: ROJO }}>¿qué haces?</span>
                    </div>
                    {qSub('Nadie te mira. Di la verdad.')}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <TogBtn label="Tengo un protocolo claro y lo ejecuto siempre" selected={sel.q3 === true}  variant="yes" onClick={() => setSel(s => ({ ...s, q3: true }))} />
                      <TogBtn label="Improviso y espero que me llamen"              selected={sel.q3 === false} variant="no"  onClick={() => setSel(s => ({ ...s, q3: false }))} />
                    </div>
                  </>}

                  {/* E4 */}
                  {pasoForm === 4 && <>
                    {qTitle('¿Sabes exactamente cuál es tu tasa de cierre?')}
                    <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", margin: '0 0 24px', fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 1.75 }}>
                      De cada 10 prospectos que atiendes, ¿cuántos terminan comprando? Si no conoces el número exacto, escribe una aproximación —{' '}
                      <span style={{ color: ROJO, fontWeight: 700 }}>la mayoría de vendedores no conoce su tasa de cierre real.</span>
                    </p>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <TogBtn label="Sí, lo tengo medido y calculado"    selected={sel.q4 === true}  variant="yes" onClick={() => setSel(s => ({ ...s, q4: true }))} />
                      <TogBtn label="No, nunca lo he calculado"           selected={sel.q4 === false} variant="no"  onClick={() => setSel(s => ({ ...s, q4: false }))} />
                    </div>
                  </>}

                  {/* E5 */}
                  {pasoForm === 5 && (() => {
                    const suenoOpts: { key: string; label: string; sub: string; tint: string; border: string; icon: React.ReactNode }[] = [
                      {
                        key: 'casa',
                        label: 'La casa o el arreglo prometido',
                        sub: 'Ese espacio que mereces y que siempre queda para después',
                        tint: 'rgba(245,196,0,0.08)',
                        border: 'rgba(245,196,0,0.50)',
                        icon: (
                          <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 13L14 4l11 9" /><path d="M6 11v11h5v-6h6v6h5V11" />
                          </svg>
                        ),
                      },
                      {
                        key: 'viaje',
                        label: 'Las vacaciones postergadas',
                        sub: '"El año que viene" lleva tres años siendo el año que viene',
                        tint: 'rgba(78,205,196,0.08)',
                        border: 'rgba(78,205,196,0.50)',
                        icon: (
                          <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="14" cy="14" r="10" /><path d="M2 14h24" /><path d="M14 4c-3 4-3 16 0 20M14 4c3 4 3 16 0 20" />
                          </svg>
                        ),
                      },
                      {
                        key: 'estudios',
                        label: 'Los estudios tuyos o de tus hijos',
                        sub: 'La inversión que cambia el rumbo, pero cuesta lo que no tienes',
                        tint: 'rgba(139,92,246,0.08)',
                        border: 'rgba(139,92,246,0.50)',
                        icon: (
                          <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 10l10-6 10 6-10 6-10-6z" /><path d="M4 10v8c0 2 4 4 10 4s10-2 10-4v-8" /><path d="M22 10v6" /><circle cx="22" cy="18" r="1.5" fill="currentColor" stroke="none" />
                          </svg>
                        ),
                      },
                      {
                        key: 'deuda',
                        label: 'La deuda que no te deja dormir',
                        sub: 'Esa presión que convierte cada logro en alivio, no en alegría',
                        tint: 'rgba(232,0,29,0.08)',
                        border: 'rgba(232,0,29,0.50)',
                        icon: (
                          <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="14" cy="14" r="10" /><path d="M14 9v5l3 3" /><path d="M14 19v1" />
                          </svg>
                        ),
                      },
                      {
                        key: 'carro',
                        label: 'El carro que prometiste cambiar',
                        sub: 'Símbolo de lo que das pero que aún no puedes darte a ti mismo',
                        tint: 'rgba(59,130,246,0.08)',
                        border: 'rgba(59,130,246,0.50)',
                        icon: (
                          <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 17H3v-4l3-6h14l3 6v4h-2" /><circle cx="8" cy="18" r="2.5" /><circle cx="20" cy="18" r="2.5" /><path d="M10.5 18h7" /><path d="M6 11h16" />
                          </svg>
                        ),
                      },
                      {
                        key: 'libertad',
                        label: 'Tiempo libre sin culpa ni estrés',
                        sub: 'Poder desconectarte sin que el mundo se caiga — y disfrutarlo',
                        tint: 'rgba(34,197,94,0.08)',
                        border: 'rgba(34,197,94,0.50)',
                        icon: (
                          <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 3C8 3 4 8 4 14s6 10 12 8" /><path d="M20 6l-2 8 6 2" /><circle cx="14" cy="14" r="2" fill="currentColor" stroke="none" />
                          </svg>
                        ),
                      },
                    ]
                    return (
                      <>
                        <div style={{ marginBottom: 18, textAlign: 'center' }}>
                          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.40)', letterSpacing: '0.20em', textTransform: 'uppercase', margin: '0 0 10px' }}>
                            ÚLTIMA PREGUNTA
                          </p>
                          <h2 style={{
                            fontFamily: "'Bebas Neue', sans-serif",
                            fontSize: 'clamp(30px, 7.5vw, 50px)',
                            color: '#F5C400',
                            margin: '0 0 10px',
                            letterSpacing: '0.02em',
                            lineHeight: 1.0,
                            textShadow: '0 0 40px rgba(245,196,0,0.55), 0 0 14px rgba(245,196,0,0.28), 0 2px 6px rgba(0,0,0,0.90)',
                          }}>
                            ¿Cuál es el motivo por el que te levantas cada mañana?
                          </h2>
                          <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontSize: 14, color: ROJO, margin: '0 0 4px', fontStyle: 'italic', fontWeight: 600 }}>
                            Soñar no cuesta nada. Hacerlo realidad sí.
                          </p>
                          <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: '0 0 0' }}>
                            ¿Cuál es ese sueño que llevas más tiempo esperando o postergando?
                          </p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                          {suenoOpts.map(opt => {
                            const isSelected = sel.sueno === opt.key
                            const anySelected = !!sel.sueno
                            const colorFull = opt.border.replace('0.50', '1')
                            return (
                              <button
                                key={opt.key}
                                onClick={() => setSel(s => ({ ...s, sueno: opt.key }))}
                                style={{
                                  background: isSelected ? opt.tint : 'rgba(255,255,255,0.02)',
                                  border: `1.5px solid ${isSelected ? opt.border : 'rgba(255,255,255,0.10)'}`,
                                  borderRadius: 10,
                                  padding: '13px 12px 11px',
                                  textAlign: 'center',
                                  cursor: 'pointer',
                                  opacity: anySelected && !isSelected ? 0.42 : 1,
                                  transform: isSelected ? 'scale(1.025)' : 'scale(1)',
                                  transition: 'all 0.20s ease',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 7,
                                  boxShadow: isSelected ? `0 0 20px ${opt.tint.replace('0.08', '0.40')}` : 'none',
                                }}
                              >
                                <span style={{ color: isSelected ? colorFull : 'rgba(255,255,255,0.45)', display: 'flex' }}>
                                  {opt.icon}
                                </span>
                                <span style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontSize: 11.5, fontWeight: 700, color: ROJO, lineHeight: 1.30, display: 'block' }}>
                                  {opt.label}
                                </span>
                                <span style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontSize: 10, color: 'white', lineHeight: 1.45, display: 'block' }}>
                                  {opt.sub}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                        {sel.sueno && (
                          <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid #1a1a1a', textAlign: 'center' }}>
                            <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, margin: '0 0 4px' }}>
                              En menos de 60 segundos vas a saber quién es el verdadero ladrón de tus comisiones...
                            </p>
                            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.40)', letterSpacing: '0.10em', textTransform: 'uppercase', margin: 0 }}>
                              ¿Tienes en mente algún sospechoso?
                            </p>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </>
              )}
              {nextBtn(
                pasoForm === 5
                  ? `${nombreTrimmed.split(' ')[0] || nombreTrimmed}, ¿estás listo para descubrir la verdad? →`
                  : 'Siguiente →'
              )}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════
          RAZONAMIENTO VISIBLE
      ════════════════════════════════════════ */}
      {fase === 'razonando' && (
        <RazonamientoPanel
          paso={razonandoPaso}
          sel={sel}
          nombre={nombreTrimmed}
          onContinue={avanzar}
        />
      )}

      {/* ════════════════════════════════════════
          SUSPENSE
      ════════════════════════════════════════ */}
      {fase === 'suspense' && (
        <div style={{
          minHeight: 'calc(100vh - 72px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '40px 24px 48px', gap: 32,
          animation: 'fadeUp 0.6s ease both',
        }}>
          {/* Título arriba */}
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(34px,7vw,62px)',
            lineHeight: 1.0,
            color: 'white',
            margin: 0,
            letterSpacing: '0.04em',
            textAlign: 'center',
          }}>
            ¡ENCONTRAMOS AL <span style={{ color: ROJO }}>CULPABLE!</span>
          </h2>

          {/* Imagen completa — contain, sin recortar */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 480 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/bg-detective.jpg"
              alt="Detective"
              style={{
                width: '100%',
                height: '100%',
                maxHeight: 'calc(100vh - 280px)',
                objectFit: 'contain',
                objectPosition: 'center',
                display: 'block',
                borderRadius: 12,
              }}
            />
          </div>

          {/* Botón Cluedo — debajo de la imagen */}
          <button
            onClick={lanzarResultado}
            style={{
              padding: '22px 48px',
              background: 'linear-gradient(180deg, #c8001a 0%, #9a0014 60%, #7a000f 100%)',
              color: 'white',
              border: '3px solid rgba(255,255,255,0.18)',
              borderRadius: 16,
              cursor: 'pointer',
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(20px,4vw,26px)',
              letterSpacing: '0.12em',
              boxShadow: '0 10px 0 #4a0008, 0 14px 32px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.18)',
              transition: 'transform 0.08s ease, box-shadow 0.08s ease',
              textShadow: '0 1px 3px rgba(0,0,0,0.6)',
              userSelect: 'none' as const,
              flexShrink: 0,
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(6px)'; e.currentTarget.style.boxShadow = '0 4px 0 #4a0008, 0 6px 16px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.18)' }}
            onMouseUp={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 0 #4a0008, 0 14px 32px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.18)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 0 #4a0008, 0 14px 32px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.18)' }}
          >
            ¡DESCÚBRELO AHORA! →
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════
          DICTAMEN EN CONSTRUCCIÓN
      ════════════════════════════════════════ */}
      {fase === 'cargando' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px 80px' }}>
          <div style={{ maxWidth: 480, width: '100%' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 32, textAlign: 'center' }}>
              CALCULANDO TU RESULTADO...
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px,7vw,58px)', color: 'white', letterSpacing: '0.01em', lineHeight: 0.95, margin: '0 0 40px', textAlign: 'center' }}>
              ANALIZANDO<br /><span style={{ color: ROJO }}>TUS RESPUESTAS</span>
            </h2>
            <div style={{ background: 'rgba(8,8,8,0.72)', backdropFilter: 'blur(10px)', border: '1px solid #1f1f1f', borderRadius: 12, padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 0 }}>
              <DictamenRow label="Respuestas procesadas" delay={400} />
              <DictamenRow label="Causas comparadas" delay={900} />
              <DictamenRow label="Patrón identificado" delay={1600} />
              <DictamenRow label="Impacto mensual calculado" delay={2400} />
              <DictamenRow label="Resultado en preparación" delay={3200} />
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          DICTAMEN PRELIMINAR
      ════════════════════════════════════════ */}
      {fase === 'dictamen_preliminar' && r && (
        <DictamenPreliminar r={r} nombre={nombreTrimmed} sel={sel} onContinue={() => { setFase('expediente'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
      )}

      {/* ════════════════════════════════════════
          EXPEDIENTE
      ════════════════════════════════════════ */}
      {fase === 'expediente' && r && (
        <div ref={resultRef} style={{ padding: '48px 16px 80px', animation: 'fadeUp 0.5s ease both' }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>

            <div style={{ marginBottom: 40 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>
                TU DIAGNÓSTICO · {nombreTrimmed.toUpperCase()}
              </div>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(38px,8vw,64px)', lineHeight: 0.92, color: 'white', margin: '0 0 16px', letterSpacing: '0.01em' }}>
                {nombreTrimmed.split(' ')[0] || nombreTrimmed}, ¿QUÉ VA A PASAR<br />EN 90 DÍAS SI NO<br /><span style={{ color: ROJO }}>CAMBIAS NADA?</span>
              </h2>
              <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, margin: 0 }}>
                Encontramos el cuello de botella que está frenando tus comisiones.
              </p>
            </div>

            {/* Sección 1: Tus respuestas */}
            <div style={{ background: 'rgba(8,8,8,0.72)', backdropFilter: 'blur(10px)', border: '1px solid #1f1f1f', borderRadius: 12, padding: '24px', marginBottom: 12 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>TUS RESPUESTAS</div>
              {[
                { ref: 'E01', label: 'Valor de operación', val: sel.v1 ? fmt(sel.v1) : '—' },
                { ref: 'E02', label: 'Prospectos sin seguimiento +7 días', val: `${sel.v2 ?? 0} activos` },
                { ref: 'E03', label: 'Protocolo ante el "lo pienso"', val: sel.q3 === true ? 'Definido' : sel.q3 === false ? 'Improvisa' : '—' },
                { ref: 'E04', label: 'Tasa de cierre documentada', val: sel.q4 === true ? 'Sí' : sel.q4 === false ? 'No' : '—' },
                { ref: 'E05', label: 'Consecuencia predominante', val: sel.sueno ? SUENO_LABELS[sel.sueno] ?? sel.sueno : '—' },
              ].map(({ ref: eRef, label, val }) => (
                <div key={eRef} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 0', borderBottom: '1px solid #141414' }}>
                  <div style={{ flexShrink: 0 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.12em', marginRight: 10 }}>{eRef}</span>
                    <span style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.65)' }}>{label}</span>
                  </div>
                  <span style={{ fontFamily: eRef === 'E05' ? "'General Sans', system-ui, sans-serif" : "'JetBrains Mono', monospace", fontSize: eRef === 'E05' ? 13 : 12, color: 'rgba(255,255,255,0.72)', letterSpacing: '0.02em', flexShrink: 1, marginLeft: 12, textAlign: 'right', maxWidth: '55%', lineHeight: 1.4 }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Sección 2: Causas evaluadas */}
            <div style={{ background: 'rgba(8,8,8,0.72)', backdropFilter: 'blur(10px)', border: '1px solid #1f1f1f', borderRadius: 12, padding: '24px', marginBottom: 12 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>CAUSAS EVALUADAS</div>
              {(['Falta de contactos nuevos', 'Proceso con pasos perdidos', 'Mercado saturado'] as const).map((h, i) => {
                const vals = getHipValsCurr(5, sel)
                const v = vals[i]
                const descartada = v < 12
                const dominante = v >= 75
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 2 ? '1px solid #141414' : 'none' }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: descartada ? '#2a2a2a' : '#444', letterSpacing: '0.06em', textDecoration: descartada ? 'line-through' : 'none', textTransform: 'uppercase', flex: 1 }}>{h}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: descartada ? '#2a2a2a' : dominante ? '#22C55E' : '#555', letterSpacing: '0.08em', marginLeft: 12, flexShrink: 0 }}>
                      {descartada ? 'DESCARTADA' : dominante ? 'CONFIRMADA' : 'EVALUADA'}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Sección 3: Corrección controlada — ambas ramas */}
            {sel.q3 !== null && (
              <div style={{ background: '#0a0800', border: '1px solid rgba(245,196,0,0.15)', borderRadius: 12, padding: '20px 24px', marginBottom: 12 }}>
                {sel.q3 === true ? (
                  <>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>AJUSTE EN EL ANÁLISIS · PREGUNTA 3</div>
                    <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, margin: '0 0 8px' }}>
                      Tu respuesta anterior apuntaba a la falta de protocolo como causa principal.
                    </p>
                    <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.88)', lineHeight: 1.8, margin: 0 }}>
                      Pero tener un protocolo claro para el "lo pienso" descarta esa causa. El problema está en otro punto del proceso — el análisis cambió de dirección en ese momento.
                    </p>
                  </>
                ) : (
                  <>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>CONFIRMACIÓN EN EL ANÁLISIS · PREGUNTA 3</div>
                    <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, margin: '0 0 8px' }}>
                      Tus respuestas anteriores mostraban un patrón de prospectos sin contacto.
                    </p>
                    <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.88)', lineHeight: 1.8, margin: 0 }}>
                      La pregunta 3 lo confirmó: improvisar ante el "lo pienso" es exactamente donde desaparecen tus ventas. El análisis no cambió de dirección — encontró el punto exacto de origen.
                    </p>
                  </>
                )}
              </div>
            )}

            {/* La buena noticia */}
            <div style={{ background: '#0a1a0a', border: '1px solid rgba(34,197,94,0.12)', borderRadius: 12, padding: '16px 22px', marginBottom: 12 }}>
              <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontSize: 15, color: '#5cb85c', lineHeight: 1.75, margin: 0 }}>
                La buena noticia: no necesitas conseguir más clientes. Solo recuperar mejor los que ya tienes.
              </p>
            </div>

            {/* Sección 4: Tu cuello de botella */}
            <div style={{ background: `${r.nivelColor}10`, border: `1px solid ${r.nivelColor}30`, borderRadius: 12, padding: '22px 24px', marginBottom: 12 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: r.nivelColor, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12, opacity: 0.7 }}>TU CUELLO DE BOTELLA</div>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(28px,5vw,38px)', color: 'white', letterSpacing: '0.02em', lineHeight: 1, margin: '0 0 12px' }}>
                {r.cuelloLabel.toUpperCase()}
              </p>
              <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.88)', lineHeight: 1.75, margin: '0 0 10px' }}>{r.cuelloTexto}</p>
              <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontSize: 15, color: AMARILLO, lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>
                {{
                  seguimiento: 'No estás perdiendo clientes por tu pitch. Los estás perdiendo porque nadie los vuelve a contactar en el momento justo.',
                  priorizacion: 'No estás perdiendo clientes. Estás dejando esperar demasiado a los clientes correctos — y en ventas, tarde es peor que nunca.',
                  preparacion: 'No estás perdiendo por precio. Estás cediendo ventas porque no tienes una respuesta lista cuando el cliente duda.',
                  reporte: 'No es que estés trabajando mal. Es que sin medir, no puedes identificar exactamente qué parte del proceso te está costando dinero.',
                }[r.cuello]}
              </p>
            </div>

            {/* Sección 5: Lo que estás perdiendo */}
            {r.perdidaMensual > 0 && (
              <div style={{ background: '#0d0000', border: '1px solid #2a0000', borderRadius: 12, padding: '22px 24px', marginBottom: 12 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>LO QUE ESTÁS PERDIENDO · POR MES</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(28px,6vw,44px)', color: ROJO, letterSpacing: '0.02em', lineHeight: 1, marginBottom: 8 }}>
                  {calibratedRange(r.perdidaMensual)}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>mensual · calculado con tus propios datos</div>
                {(sel.v1 ?? 0) > 0 && (
                  <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65 }}>
                    Hoy dejaste escapar el equivalente a {Math.max(1, Math.round(r.perdida90 / (sel.v1 ?? 1)))} ventas. Si nada cambia, en 90 días habrás dejado escapar clientes que ya casi tenías cerrados.
                  </p>
                )}
                <div style={{ borderTop: '1px solid #1a0000', marginTop: 14, paddingTop: 12 }}>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", margin: 0, fontSize: 9, color: '#2a2a2a', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    La cifra exacta aparece en el siguiente paso.
                  </p>
                </div>
              </div>
            )}

            {/* Sección 6: Lo que pasa en 90 días */}
            <div style={{ background: '#0a0800', border: `1px solid rgba(245,196,0,0.1)`, borderRadius: 12, padding: '22px 24px', marginBottom: 12 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>ESTO ES LO QUE PASA EN 90 DÍAS SI NO CAMBIAS NADA</div>
              <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, margin: '0 0 14px' }}>
                Estás dejando escapar ventas que ya habías conseguido. Tus clientes no desaparecen — se enfrían.
              </p>
              {calcular90dias(sel, r.perdidaMensual).map((linea, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 10, marginBottom: 10, borderBottom: i < 2 ? '1px solid rgba(245,196,0,0.06)' : 'none' }}>
                  <span style={{ color: ROJO, flexShrink: 0, marginTop: 2, fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>→</span>
                  <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", margin: 0, fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7 }}>{linea}</p>
                </div>
              ))}
            </div>

            {/* CTA hacia resultado final */}
            <div style={{ marginTop: 36 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.16em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 16 }}>
                Tus datos están calculados. El resultado final está listo.
              </div>
              <CluedoBtn label="VER MI RESULTADO COMPLETO →" onClick={() => { setFase('veredicto'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
            </div>

          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          VEREDICTO FINAL
      ════════════════════════════════════════ */}
      {fase === 'veredicto' && r && (
        <VeredictoReveal r={r} nombre={nombreTrimmed} sel={sel} onContinue={() => { setFase('accion'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
      )}

      {/* ════════════════════════════════════════
          ACCIÓN
      ════════════════════════════════════════ */}
      {(fase === 'accion' || fase === 'desbloqueado') && r && (
        <div style={{ padding: '48px 16px 80px', animation: 'fadeUp 0.5s ease both' }}>
          <div style={{ maxWidth: 500, margin: '0 auto' }}>

            {fase === 'accion' && (
              <>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 32, textAlign: 'center' }}>
                  TU PLAN DE ACCIÓN · {nombreTrimmed.toUpperCase()}
                </div>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(38px,8vw,62px)', lineHeight: 0.92, color: 'white', margin: '0 0 24px', letterSpacing: '0.01em' }}>
                  {nombreTrimmed.split(' ')[0] || nombreTrimmed},<br />DESBLOQUEA TU<br /><span style={{ color: TEAL_R }}>PLAN DE ACCIÓN.</span>
                </h2>
                <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontSize: 15, color: '#B8B8B8', lineHeight: 1.85, margin: '0 0 20px' }}>
                  Recibirás además:
                </p>

                <div style={{ background: 'rgba(8,8,8,0.72)', backdropFilter: 'blur(10px)', border: '1px solid #1f1f1f', borderRadius: 12, padding: '20px 24px', marginBottom: 28 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                    {[
                      'Las 3 acciones que más impacto tendrán esta semana',
                      'Qué automatizar primero',
                      'Cómo recuperar oportunidades perdidas',
                      'Prioridad exacta de ejecución',
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ color: VERDE_S, flexShrink: 0, fontSize: 14 }}>✅</span>
                        <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", margin: 0, fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 1.6 }}>{item}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 16 }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
                      Tu reporte personalizado · {r.cuello}
                    </div>
                    {(accionPorCuello[r.cuello] ?? accionPorCuello['seguimiento']).map(({ ref: aRef, texto }, i) => (
                      <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '10px 0', borderBottom: i < 3 ? '1px solid #141414' : 'none' }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: ROJO, flexShrink: 0, marginTop: 3, letterSpacing: '0.08em' }}>{aRef}</span>
                        <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", margin: 0, fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7 }}>{texto}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <input
                  type="email" placeholder="correo@dominio.com" value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError('') }}
                  onKeyDown={e => e.key === 'Enter' && desbloquear()}
                  style={{ display: 'block', width: '100%', padding: '14px 18px', borderRadius: 8, background: '#0a0a0a', border: emailError ? `1px solid ${ROJO}` : '1px solid #222', color: 'white', fontSize: 15, marginBottom: emailError ? 6 : 14, outline: 'none', fontFamily: "'General Sans', system-ui, sans-serif", letterSpacing: '0.01em' }}
                />
                {emailError && <p style={{ fontFamily: "'JetBrains Mono', monospace", color: ROJO, fontSize: 10, margin: '0 0 12px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{emailError}</p>}
                <button
                  onClick={desbloquear} disabled={guardando}
                  style={{ display: 'block', width: '100%', padding: '17px', borderRadius: 8, border: 'none', background: '#22C55E', color: '#001a08', fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: '0.08em', cursor: guardando ? 'not-allowed' : 'pointer', boxShadow: `0 4px 28px rgba(34,197,94,0.3)` }}
                >
                  {guardando ? 'ENVIANDO...' : 'VER CÓMO RECUPERAR MIS COMISIONES →'}
                </button>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", margin: '14px 0 0', fontSize: 9, color: '#2a2a2a', letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center' }}>
                  Sin spam. Solo tu plan.
                </p>
              </>
            )}

            {fase === 'desbloqueado' && (
              <div style={{ textAlign: 'center', animation: 'fadeUp 0.5s ease both' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#22C55E', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 32 }}>
                  PLAN ENVIADO
                </div>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", margin: '0 0 20px', fontSize: 'clamp(36px,7vw,56px)', color: 'white', letterSpacing: '0.01em', lineHeight: 0.95 }}>
                  LISTO, <span style={{ color: VERDE_S }}>{(nombreTrimmed.split(' ')[0] || nombreTrimmed).toUpperCase()}.</span>
                </h3>
                <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", margin: '0 0 12px', fontSize: 15, color: 'rgba(255,255,255,0.88)', lineHeight: 1.75 }}>
                  Tu plan de acción ya está en camino a tu correo.
                </p>
                <p style={{ fontFamily: "'General Sans', system-ui, sans-serif", margin: 0, fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65 }}>
                  Revísalo en los próximos minutos — ahí están las 3 acciones que más impacto van a tener en tu semana.
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      <footer style={{ textAlign: 'center', padding: '24px', fontFamily: "'Barlow', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.65)', borderTop: '1px solid #111' }}>
        © 2026 Diana García · Arquitecta de Automatizaciones · <em>Hago fácil lo difícil.</em>
      </footer>
    </div>
  )
}
