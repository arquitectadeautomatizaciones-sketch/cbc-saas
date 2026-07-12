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

// ── Labels forenses para E05 ──────────────────────────────
const SUENO_LABELS: Record<string, string> = {
  casa:      'Hay semanas donde trabajo muchísimo y vendo muy poco.',
  viaje:     'Los clientes desaparecen sin una explicación clara.',
  estudios:  'Nunca sé con certeza dónde se perdió una venta.',
  deuda:     'Todo depende de que yo esté encima del proceso.',
  carro:     'Tengo ingresos demasiado variables.',
  libertad:  'Siento que trabajo más de lo que el sistema produce.',
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
      fontFamily: "'Inter', sans-serif",
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
  if (paso <= 1) return [0, 0, 0]
  return getHipValsCurr(paso - 1, sel)
}

// ── Textos de razonamiento — P11 Economía Cognitiva aplicada ─
function getRazTexts(paso: number, sel: Selecciones, nombre: string): [string, string, string] {
  const v1s = sel.v1 ? `$${sel.v1.toLocaleString('en-US')}` : 'el valor registrado'
  const v2   = sel.v2 ?? 0
  const fn   = nombre.split(' ')[0] || nombre

  if (paso === 1) {
    const v1 = sel.v1 ?? 0
    if (v1 >= 3000) return [
      'Primera evidencia incorporada.',
      `Con ${v1s} por operación, la escasez de oportunidades queda descartada como causa principal. Quien trabaja en este nivel tiene acceso. El problema está en otro punto.`,
      'Una hipótesis perdió peso. La investigación se orienta hacia el proceso.',
    ]
    if (v1 >= 1000) return [
      'Primera evidencia incorporada.',
      `Con ${v1s} registrado, el rango de impacto dejó de ser estimación. El análisis tiene ahora un número real.`,
      'Las hipótesis están siendo calibradas con este parámetro.',
    ]
    return [
      'Primera evidencia incorporada.',
      `Con ${v1s} por operación, el volumen de oportunidades necesario es significativo. La investigación evalúa si la escasez de contactos está operando como factor.`,
      'Una hipótesis ganó relevancia.',
    ]
  }
  if (paso === 2) {
    if (v2 >= 5) return [
      'Relacionando con la evidencia anterior...',
      `Con ${v2} operaciones en enfriamiento y un valor de ${v1s}, la escasez de contactos no explica este patrón. Fue descartada.`,
      'Una explicación descartada. La investigación se concentra.',
    ]
    if (v2 >= 2) return [
      'Relacionando con la evidencia anterior...',
      `Al cruzar ${v2} operaciones sin actividad con ${v1s}, el nivel de exposición queda definido. El patrón empieza a ser visible.`,
      'La investigación necesita una evidencia más para confirmar dirección.',
    ]
    return [
      'Evaluando la evidencia...',
      `${v2 === 0 ? 'Ninguna' : v2} operación${v2 === 1 ? '' : 'es'} en enfriamiento con un valor de ${v1s}. Combinación inusual. La investigación evalúa una hipótesis alternativa.`,
      'La dirección del análisis acaba de cambiar.',
    ]
  }
  if (paso === 3) {
    if (sel.q3 === false) return [
      'Recalibración en curso.',
      'Hipótesis confirmada. La ausencia de secuencia en la fase de deliberación identifica el punto exacto donde las operaciones desaparecen.',
      'La investigación tiene ahora un origen específico.',
    ]
    return [
      'Recalculando.',
      `Corrección. La secuencia definida en E03 contradice la lectura anterior. El problema no está en la estructura del proceso — está en otro punto.`,
      'Hipótesis descartada. Nueva dirección confirmada.',
    ]
  }
  if (paso === 4) {
    if (sel.q4 === false) return [
      'Incorporando parámetro de calibración...',
      `Sin métricas de conversión documentadas, la naturaleza de las fugas queda establecida. Hay una brecha que opera en un punto específico y repetible del proceso de ${fn}.`,
      'La hipótesis dominante se confirma.',
    ]
    return [
      'Incorporando parámetro de calibración...',
      'Las métricas documentadas descartan una de las posibles explicaciones. El origen apunta a un punto del proceso que opera fuera del control actual.',
      'El análisis se concentra en la explicación que mejor describe el patrón.',
    ]
  }
  return [
    'Última evidencia registrada.',
    `La investigación está completa, ${fn}. El impacto puede expresarse en términos concretos — calculados con tus propios datos.`,
    'Todas las hipótesis evaluadas. Una sola sobrevive.',
  ]
}

// ── HipotesisBar ──────────────────────────────────────────
function HipotesisBar({ nombre, from: f, to: t, delay }: { nombre: string; from: number; to: number; delay: number }) {
  const [val, setVal] = useState(f)
  useEffect(() => { const id = setTimeout(() => setVal(t), delay); return () => clearTimeout(id) }, [t, delay])
  const estado = t < 12 ? 'Descartada' : t >= 75 ? 'Hipótesis dominante' : t > f ? 'Fortaleciéndose ↑' : t < f ? 'Debilitada ↓' : 'Sin cambios'
  const color  = t < 12 ? '#2a2a2a' : t >= 75 ? '#22C55E' : t > f ? '#f59e0b' : '#e53935'
  const txtCol = t < 12 ? '#2a2a2a' : t >= 75 ? '#22C55E' : t > f ? '#f59e0b' : '#e53935'
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: t < 12 ? '#2a2a2a' : '#444', letterSpacing: '0.06em', textDecoration: t < 12 ? 'line-through' : 'none', textTransform: 'uppercase' }}>{nombre}</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: txtCol, letterSpacing: '0.05em' }}>{estado}</span>
      </div>
      <div style={{ background: '#111', borderRadius: 2, height: 2 }}>
        <div style={{ height: '100%', borderRadius: 2, background: color, width: `${val}%`, transition: 'width 1.6s cubic-bezier(0.25,0.46,0.45,0.94), background 0.8s' }} />
      </div>
    </div>
  )
}

// ── DictamenRow ───────────────────────────────────────────
function DictamenRow({ label, delay }: { label: string; delay: number }) {
  const [done, setDone] = useState(false)
  useEffect(() => { const id = setTimeout(() => setDone(true), delay); return () => clearTimeout(id) }, [delay])
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #141414' }}>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: done ? '#888' : '#2a2a2a', transition: 'color 0.9s ease', letterSpacing: '0.01em' }}>{label}</span>
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
  const H_NAMES = ['Escasez de contactos iniciales', 'Proceso con brechas no visibles', 'Saturación del segmento objetivo']

  return (
    <div style={{ padding: '32px 16px 64px', animation: 'up 0.4s ease' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#333', letterSpacing: '0.14em', marginBottom: 32, textTransform: 'uppercase', animation: 'up 0.3s ease' }}>
          {b0}
        </div>

        {beat >= 1 && (
          <div style={{ background: 'rgba(8,8,8,0.72)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '24px', marginBottom: 14, animation: 'up 0.5s ease' }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: '#B8B8B8', lineHeight: 1.85, margin: 0 }}>{b1}</p>
          </div>
        )}

        {beat >= 2 && (
          <div style={{ background: 'rgba(8,8,8,0.72)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px', marginBottom: 14, animation: 'up 0.5s ease' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>HIPÓTESIS EN EVALUACIÓN</div>
            {H_NAMES.map((n, i) => <HipotesisBar key={i} nombre={n} from={prev[i]} to={curr[i]} delay={i * 300} />)}
          </div>
        )}

        {beat >= 3 && (
          <div style={{ animation: 'up 0.5s ease' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#444', letterSpacing: '0.1em', marginBottom: 24, lineHeight: 1.9, textTransform: 'uppercase' }}>
              {b2}
            </div>
            <button onClick={onContinue} style={{
              display: 'block', width: '100%', padding: '16px 24px', borderRadius: 8, border: 'none',
              background: '#e8001d', color: 'white',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: '0.08em',
              cursor: 'pointer', boxShadow: '0 4px 28px rgba(232,0,29,0.28)',
            }}>
              {paso < 5 ? 'Continuar investigación →' : 'Ver qué encontró la investigación →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── DictamenPreliminar ────────────────────────────────────
function DictamenPreliminar({ r, nombre, onContinue }: { r: ReturnType<typeof calcular>; nombre: string; onContinue: () => void }) {
  const ROJO = '#e8001d'
  const AMARILLO = '#f5c400'

  return (
    <div style={{ padding: '48px 16px 80px', animation: 'fadeUp 0.5s ease both' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>

        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>
          DICTAMEN PRELIMINAR · PENDIENTE DE VALIDACIÓN
        </div>

        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(42px,9vw,72px)', lineHeight: 0.9, color: 'white', margin: '0 0 28px', letterSpacing: '0.01em' }}>
          ALGO SE<br /><span style={{ color: ROJO }}>ESTÁ PERDIENDO.</span><br />LA MAGNITUD<br />AÚN SE VALIDA.
        </h2>

        <div style={{ background: 'rgba(8,8,8,0.72)', backdropFilter: 'blur(10px)', border: '1px solid #1f1f1f', borderRadius: 12, padding: '24px 28px', marginBottom: 20 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>RANGO ESTIMADO · MENSUAL</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(38px,8vw,60px)', color: AMARILLO, letterSpacing: '0.02em', lineHeight: 1 }}>
            {maskRange(r.perdidaMensual)}
          </div>
          <p style={{ fontFamily: "'Inter', sans-serif", margin: '12px 0 0', fontSize: 12, color: '#444', lineHeight: 1.65 }}>
            La cifra exacta se documenta en el expediente. El patrón existe. El punto de fuga está identificado.
          </p>
        </div>

        <div style={{ background: '#0a0800', border: `1px solid rgba(245,196,0,0.1)`, borderRadius: 10, padding: '18px 22px', marginBottom: 32 }}>
          <p style={{ fontFamily: "'Inter', sans-serif", margin: '0 0 10px', fontSize: 13, color: '#666', lineHeight: 1.75 }}>
            La investigación identificó el responsable.
          </p>
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", margin: 0, fontSize: 22, color: 'white', letterSpacing: '0.04em' }}>
            {r.cuelloLabel.toUpperCase()}
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", margin: '8px 0 0', fontSize: 13, color: '#888', lineHeight: 1.65 }}>
            El expediente documenta las hipótesis descartadas y las implicaciones para {nombre.split(' ')[0] || nombre}.
          </p>
        </div>

        <button onClick={onContinue} style={{
          display: 'block', width: '100%', padding: '18px 24px',
          background: ROJO, color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer',
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: '0.1em',
          boxShadow: `0 4px 28px rgba(232,0,29,0.3)`,
        }}>
          VER EL EXPEDIENTE →
        </button>

        <p style={{ fontFamily: "'JetBrains Mono', monospace", margin: '16px 0 0', fontSize: 9, color: '#2a2a2a', letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center' }}>
          Reconstrucción completa del caso · {nombre.split(' ')[0].toUpperCase() || nombre.toUpperCase()}
        </p>

      </div>
    </div>
  )
}

// ── VeredictoReveal ───────────────────────────────────────
function VeredictoReveal({ r, nombre, onContinue }: { r: ReturnType<typeof calcular>; nombre: string; onContinue: () => void }) {
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

        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 40, textAlign: 'center' }}>
          DICTAMEN EMITIDO · CASO {nombre.toUpperCase()}
        </div>

        {beat >= 1 && (
          <div style={{ animation: 'fadeUp 0.5s ease both', marginBottom: 32, textAlign: 'center' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#555', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>
              RESPONSABLE IDENTIFICADO
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(44px,10vw,82px)', lineHeight: 0.92, color: 'white', margin: '0 0 10px', letterSpacing: '0.01em' }}>
              {r.cuelloLabel.toUpperCase()}
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: '#666', lineHeight: 1.7, margin: 0 }}>
              {r.cuelloTexto}
            </p>
          </div>
        )}

        {/* P3: cifras exactas solo en veredicto — primer reveal real */}
        {beat >= 2 && r.perdidaMensual > 0 && (
          <div style={{ animation: 'fadeUp 0.5s ease both', background: 'rgba(8,8,8,0.72)', backdropFilter: 'blur(10px)', border: '1px solid #1f1f1f', borderRadius: 12, padding: '24px', marginBottom: 28 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>CIFRA EXACTA · IMPACTO MENSUAL</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(24px,5vw,38px)', color: ROJO, letterSpacing: '0.02em', lineHeight: 1 }}>{fmt(r.perdidaMensual)}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#444', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>por mes</div>
              </div>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(24px,5vw,38px)', color: AMARILLO, letterSpacing: '0.02em', lineHeight: 1 }}>{fmt(r.perdida90)}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#444', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>en 90 días</div>
              </div>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(24px,5vw,38px)', color: '#555', letterSpacing: '0.02em', lineHeight: 1 }}>{fmt(r.perdidaAnual)}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#444', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>al año</div>
              </div>
            </div>
          </div>
        )}

        {beat >= 3 && r.suenoTextos && (
          <div style={{ animation: 'fadeUp 0.5s ease both', marginBottom: 32 }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: '#888', lineHeight: 1.85, margin: '0 0 8px', fontStyle: 'italic' }}>
              {r.suenoTextos[0]}
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#444', lineHeight: 1.75, margin: 0 }}>
              {r.suenoTextos[1]}
            </p>
          </div>
        )}

        {beat >= 4 && (
          <div style={{ animation: 'fadeUp 0.5s ease both' }}>
            <button onClick={onContinue} style={{
              display: 'block', width: '100%', padding: '18px 24px',
              background: ROJO, color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: '0.1em',
              boxShadow: `0 4px 28px rgba(232,0,29,0.3)`,
            }}>
              RECIBIR EL PLAN DE INTERVENCIÓN →
            </button>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center', marginTop: 14 }}>
              {primerNombre}, el expediente incluye el plan de recuperación personalizado.
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
    setFase('razonando')
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

  const PASO_LABELS = ['', 'Primera evidencia', 'Nueva evidencia incorporada', 'La investigación avanza', 'Patrón en validación', 'Última evidencia necesaria']

  const progressBar = pasoForm > 0 ? (
    <div style={{ marginBottom: 28 }}>
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: ROJO, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          {PASO_LABELS[pasoForm]}
        </span>
      </div>
      <div style={{ background: '#1a1a1a', borderRadius: 100, height: 2 }}>
        <div style={{ width: `${(pasoForm / 5) * 100}%`, height: '100%', background: ROJO, borderRadius: 100, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  ) : null

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
    <button onClick={avanzar} disabled={!puedeAvanzar()} style={{
      display: 'block', width: '100%', maxWidth: 560, margin: '16px auto 0',
      padding: '17px 24px', borderRadius: 8, border: 'none',
      background: puedeAvanzar() ? ROJO : '#1a1a1a',
      color: puedeAvanzar() ? 'white' : '#333',
      fontFamily: "'Barlow Condensed', sans-serif",
      fontSize: 20, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase',
      cursor: puedeAvanzar() ? 'pointer' : 'not-allowed',
      boxShadow: puedeAvanzar() ? `0 4px 28px rgba(232,0,29,0.35)` : 'none',
      transition: 'background 0.2s, box-shadow 0.2s',
    }}>{label}</button>
  )

  const MSGS = [
    'Contrastando patrones comerciales...',
    'Comparando evidencia con casos similares...',
    'Descartando hipótesis alternativas...',
    'Calculando impacto financiero exacto...',
    'Reconstruyendo la secuencia de eventos...',
    'Emitiendo veredicto...',
  ]

  const statusText =
    fase === 'form'
      ? pasoForm === 0 ? 'INVESTIGACIÓN · EN ESPERA'
      : pasoForm === 1 ? 'PRIMERA EVIDENCIA · ANÁLISIS INICIADO'
      : pasoForm === 2 ? 'SEGUNDA EVIDENCIA · HIPÓTESIS EN EVALUACIÓN'
      : pasoForm === 3 ? 'INVESTIGACIÓN AVANZANDO · PATRÓN EMERGENTE'
      : pasoForm === 4 ? 'CUARTA EVIDENCIA · CALIBRACIÓN EN CURSO'
      : 'ÚLTIMA EVIDENCIA · DICTAMEN CASI LISTO'
    : fase === 'razonando'           ? 'EVIDENCIA RECIBIDA · RECALIBRANDO HIPÓTESIS'
    : fase === 'suspense'            ? 'INVESTIGACIÓN COMPLETA · DICTAMEN EN PREPARACIÓN'
    : fase === 'cargando'            ? 'DICTAMEN EN CONSTRUCCIÓN'
    : fase === 'dictamen_preliminar' ? 'DICTAMEN PRELIMINAR · PENDIENTE DE VALIDACIÓN'
    : fase === 'expediente'          ? `EXPEDIENTE ACTIVO · CASO ${nombreTrimmed.toUpperCase()}`
    : fase === 'veredicto'           ? `VEREDICTO FINAL · CASO ${nombreTrimmed.toUpperCase()}`
    : `EXPEDIENTE EMITIDO · CASO ${nombreTrimmed.toUpperCase()}`

  const fmt = (n: number) => '$' + n.toLocaleString('en-US')

  const qTitle = (text: string) => (
    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(26px,5vw,38px)', lineHeight: 1.05, color: 'white', marginBottom: 10, letterSpacing: '0.01em' }}>
      {text}
    </div>
  )
  const qSub = (text: string) => (
    <p style={{ fontFamily: "'Inter', sans-serif", margin: '0 0 24px', fontSize: 13, color: '#666', lineHeight: 1.7 }}>{text}</p>
  )

  const bgMap: Record<number, string> = {
    0: 'url(/bg-q0.jpg)',
    1: 'url(/bg-q1.jpg)',
    2: 'url(/bg-q2.jpg)',
    3: 'url(/bg-q3.jpg)',
    4: 'url(/bg-q4.jpg)',
    5: 'url(/bg-q5.jpg)',
  }
  const bgKey    = fase === 'razonando' ? razonandoPaso : pasoForm
  const bgActual = (fase === 'suspense' || fase === 'dictamen_preliminar') ? 'url(/bg-diagnostico.jpg)' : (bgMap[bgKey] ?? 'url(/bg-diagnostico.jpg)')

  // P4: contenido del expediente personalizado por cuello
  const accionPorCuello: Record<string, { ref: string; texto: string }[]> = {
    seguimiento: [
      { ref: 'ANEXO 01', texto: `Los ${sel.v2 ?? 0} casos en zona de enfriamiento tienen una ventana de reactivación. El expediente documenta la secuencia exacta para cada uno.` },
      { ref: 'ANEXO 02', texto: `El momento crítico: entre el día 7 y el día 14 sin contacto. Ahí es donde una operación de ${sel.v1 ? fmt(sel.v1) : 'ese valor'} pasa de activa a perdida.` },
      { ref: 'ANEXO 03', texto: `La secuencia de reactivación tiene 3 puntos de contacto específicos — calibrados para el patrón observado en el caso ${nombreTrimmed.split(' ')[0] || nombreTrimmed}.` },
      { ref: 'ANEXO 04', texto: `Sin intervención, el acumulado en 90 días supera ${r ? fmt(r.perdida90) : 'lo calculado'}. El expediente establece el momento de corte.` },
    ],
    priorizacion: [
      { ref: 'ANEXO 01', texto: `El problema no es la cantidad de oportunidades. Es que las de mayor valor esperan mientras las de menor valor consumen tiempo de ${nombreTrimmed.split(' ')[0] || nombreTrimmed}.` },
      { ref: 'ANEXO 02', texto: `Con operaciones de ${sel.v1 ? fmt(sel.v1) : 'ese valor'}, una semana de atención mal priorizada equivale a esa cifra perdida sin que nadie lo registre.` },
      { ref: 'ANEXO 03', texto: `El expediente documenta el criterio de priorización exacto: qué señales determinan qué oportunidad va primero — y cuál puede esperar.` },
      { ref: 'ANEXO 04', texto: `Sin un sistema de priorización, el patrón se repite: más esfuerzo, resultado variable. El expediente documenta dónde cortar ese ciclo.` },
    ],
    preparacion: [
      { ref: 'ANEXO 01', texto: `El momento de mayor riesgo es cuando el cliente duda. El expediente documenta qué ocurre exactamente en ese punto en el proceso de ${nombreTrimmed.split(' ')[0] || nombreTrimmed}.` },
      { ref: 'ANEXO 02', texto: `Las 3 objeciones más frecuentes en este tipo de casos representan más del 60% de las operaciones perdidas en la fase de deliberación.` },
      { ref: 'ANEXO 03', texto: `Con operaciones de ${sel.v1 ? fmt(sel.v1) : 'ese valor'}, una objeción sin respuesta preparada es una pérdida predecible — y evitable.` },
      { ref: 'ANEXO 04', texto: `El expediente incluye la reconstrucción exacta de en qué punto entra en juego la falta de preparación en este caso específico.` },
    ],
    reporte: [
      { ref: 'ANEXO 01', texto: `Sin métricas documentadas, el proceso se repite sin corrección. Los ${sel.v2 ?? 0} casos en enfriamiento son evidencia de ese ciclo.` },
      { ref: 'ANEXO 02', texto: `El expediente establece los 3 indicadores mínimos que bastan para detectar dónde se pierde cada operación de ${sel.v1 ? fmt(sel.v1) : 'ese valor'}.` },
      { ref: 'ANEXO 03', texto: `Con visibilidad básica del proceso, el patrón actual se interrumpe en menos de 30 días. El expediente documenta el punto de entrada.` },
      { ref: 'ANEXO 04', texto: `El costo de no medir está calculado. El expediente documenta cómo revertirlo con los datos que ya existen en el caso de ${nombreTrimmed.split(' ')[0] || nombreTrimmed}.` },
    ],
  }

  return (
    <div style={{
      minHeight: '100vh', fontFamily: "'Barlow', sans-serif", color: 'white', overflowX: 'hidden',
      background: NEGRO,
      backgroundImage: (fase === 'form' || fase === 'suspense' || fase === 'razonando' || fase === 'dictamen_preliminar') ? `linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 55%, rgba(0,0,0,0.25) 100%), ${bgActual}` : 'none',
      backgroundSize: 'cover', backgroundPosition: 'center top', backgroundAttachment: 'fixed',
      transition: 'background-image 0.6s ease',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
        @keyframes up      { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blink   { 0%,100% { opacity:1; } 50% { opacity:0; } }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        input::placeholder { color: #333; }
      `}</style>

      {/* Barra superior */}
      <div style={{ borderBottom: '1px solid #1a1a1a', background: 'rgba(8,8,8,0.96)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', maxWidth: 1100, margin: '0 auto' }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: 'white', letterSpacing: '0.12em' }}>CBC™</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#555', letterSpacing: '0.15em', textTransform: 'uppercase', transition: 'color 0.4s' }}>
            {statusText}
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: fase === 'veredicto' || fase === 'accion' || fase === 'desbloqueado' ? '#22C55E' : '#E53935', marginLeft: 8, animation: 'blink 1.4s ease-in-out infinite', verticalAlign: 'middle' }} />
          </span>
        </div>
      </div>

      {/* Hero — solo paso 0 */}
      <section style={{ padding: '60px 24px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden', display: pasoForm === 0 ? 'block' : 'none' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 50% at 50% 0%, rgba(229,57,53,0.07), transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#444', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 32 }}>
            AUDITORÍA FORENSE COMERCIAL · CBC™
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(52px,10vw,96px)', lineHeight: 0.9, color: 'white', margin: '0 0 32px', letterSpacing: '0.02em' }}>
            EXISTE UNA FUGA<br />INVISIBLE EN TU<br /><span style={{ color: ROJO }}>PROCESO.</span>
          </h1>
          <div style={{ textAlign: 'left', maxWidth: 520, margin: '0 auto 36px' }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(14px,2vw,16px)', color: '#B8B8B8', lineHeight: 1.8, margin: '0 0 20px' }}>
              Cada mes, una parte de las comisiones que deberías estar cobrando desaparece antes de llegar a ti. Sin alertas. Sin rastro visible. Sin que nadie lo haya señalado.
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(13px,1.8vw,15px)', color: '#666', lineHeight: 1.7, margin: 0 }}>
              Esta auditoría necesita <strong style={{ color: '#B8B8B8' }}>5 evidencias</strong> para identificar el responsable. Los datos permanecen confidenciales.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', maxWidth: 400, margin: '0 auto' }}>
            <div style={{ height: 1, flex: 1, background: '#222' }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#444', letterSpacing: '0.15em' }}>CASO CONFIDENCIAL</span>
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
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#444', letterSpacing: '0.2em', marginBottom: 20 }}>INICIAR CASO</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(24px,5vw,32px)', lineHeight: 1.1, color: 'white', marginBottom: 10, letterSpacing: '0.01em' }}>
                    Para personalizar el análisis, el sistema necesita identificarte.
                  </div>
                  <p style={{ fontFamily: "'Inter', sans-serif", margin: '0 0 24px', fontSize: 13, color: '#666', lineHeight: 1.7 }}>
                    El informe final llevará tu nombre. Los datos permanecen en este dispositivo.
                  </p>
                  <input
                    type="text" placeholder="Tu nombre" value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && avanzar()}
                    autoFocus
                    style={{ display: 'block', width: '100%', padding: '14px 18px', background: '#0c0c0c', border: `1px solid ${nombreTrimmed.length >= 2 ? ROJO : '#222'}`, borderRadius: 8, color: 'white', fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 600, outline: 'none', transition: 'border-color 0.2s', letterSpacing: '0.02em' }}
                  />
                </>
              )}
              {nextBtn('Iniciar auditoría →')}
            </div>
          )}

          {pasoForm >= 1 && (
            <div style={{ animation: 'up 0.4s ease' }}>
              {card(
                <>
                  {progressBar}

                  {/* E1 */}
                  {pasoForm === 1 && <>
                    {qTitle('La investigación necesita el valor de referencia.')}
                    {qSub('Sin este dato, el análisis es una estimación. Con él, es un cálculo exacto con tus propios números.')}
                    <div style={{ position: 'relative', marginBottom: 8 }}>
                      <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: '#444', pointerEvents: 'none', zIndex: 1 }}>$</span>
                      <input type="number" min={0} placeholder="0" value={sel.v1 ?? ''} onChange={e => { const v = Number(e.target.value); setSel(s => ({ ...s, v1: v > 0 ? v : null })) }} onKeyDown={e => e.key === 'Enter' && avanzar()} autoFocus
                        style={{ width: '100%', background: '#0c0c0c', border: `1px solid ${(sel.v1 ?? 0) > 0 ? ROJO : '#222'}`, borderRadius: 8, padding: '14px 16px 14px 40px', color: 'white', fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 700, outline: 'none', transition: 'border-color 0.2s', letterSpacing: '0.04em' }} />
                    </div>
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", margin: 0, fontSize: 10, color: '#444', letterSpacing: '0.08em' }}>VALOR EN USD · SOLO TÚ TIENES ACCESO A ESTE CAMPO</p>
                  </>}

                  {/* E2 */}
                  {pasoForm === 2 && <>
                    {qTitle('La investigación necesita cuantificar las operaciones en zona de riesgo activo.')}
                    {qSub('Llamamos "zona de enfriamiento" al período de más de 7 días sin contacto. Las operaciones en esta zona no desaparecen de golpe — se enfrían sin señales visibles.')}
                    <div style={{ position: 'relative', marginBottom: 8 }}>
                      <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: '#444', pointerEvents: 'none', zIndex: 1 }}>#</span>
                      <input type="number" min={0} placeholder="0" value={sel.v2 ?? ''} onChange={e => { const v = Number(e.target.value); setSel(s => ({ ...s, v2: e.target.value === '' ? null : v >= 0 ? v : 0 })) }} onKeyDown={e => e.key === 'Enter' && avanzar()} autoFocus
                        style={{ width: '100%', background: '#0c0c0c', border: `1px solid ${sel.v2 !== null ? ROJO : '#222'}`, borderRadius: 8, padding: '14px 16px 14px 40px', color: 'white', fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 700, outline: 'none', transition: 'border-color 0.2s', letterSpacing: '0.04em' }} />
                    </div>
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", margin: 0, fontSize: 10, color: '#444', letterSpacing: '0.08em' }}>NÚMERO DE OPERACIONES · SÉ PRECISO</p>
                  </>}

                  {/* E3 */}
                  {pasoForm === 3 && <>
                    {qTitle('La investigación reconstruye la secuencia de eventos en el proceso comercial.')}
                    {qSub('Existe un momento crítico donde se concentra la mayor parte de las fugas: cuando el cliente entra en fase de deliberación. Lo que sucede en las siguientes 48 horas determina si esa operación avanza o desaparece.')}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <TogBtn label="Tengo una secuencia definida que ejecuto de forma consistente en ese momento" selected={sel.q3 === true}  variant="yes" onClick={() => setSel(s => ({ ...s, q3: true }))} />
                      <TogBtn label="El proceso varía según la situación y el cliente"                              selected={sel.q3 === false} variant="no"  onClick={() => setSel(s => ({ ...s, q3: false }))} />
                    </div>
                  </>}

                  {/* E4 */}
                  {pasoForm === 4 && <>
                    {qTitle('Para que el análisis sea preciso, la investigación necesita calibrar los cálculos.')}
                    {qSub('La tasa de conversión permite distinguir entre dos tipos de fuga que se ven idénticas desde fuera pero tienen causas distintas.')}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <TogBtn label="Tengo esa cifra medida con datos reales y actualizados" selected={sel.q4 === true}  variant="yes" onClick={() => setSel(s => ({ ...s, q4: true }))} />
                      <TogBtn label="No tengo ese dato calculado con precisión"               selected={sel.q4 === false} variant="no"  onClick={() => setSel(s => ({ ...s, q4: false }))} />
                    </div>
                  </>}

                  {/* E5 — P2: forense, sin emojis, consecuencias observables */}
                  {pasoForm === 5 && <>
                    {qTitle('La investigación documenta el patrón de consecuencia predominante.')}
                    {qSub('¿Cuál de estas situaciones ocurre con más frecuencia en tu proceso?')}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <ConseqBtn label="Hay semanas donde trabajo muchísimo y vendo muy poco."     selected={sel.sueno === 'casa'}     onClick={() => setSel(s => ({ ...s, sueno: 'casa' }))} />
                      <ConseqBtn label="Los clientes desaparecen sin una explicación clara."        selected={sel.sueno === 'viaje'}    onClick={() => setSel(s => ({ ...s, sueno: 'viaje' }))} />
                      <ConseqBtn label="Nunca sé con certeza dónde se perdió una venta."            selected={sel.sueno === 'estudios'} onClick={() => setSel(s => ({ ...s, sueno: 'estudios' }))} />
                      <ConseqBtn label="Todo depende de que yo esté encima del proceso."            selected={sel.sueno === 'deuda'}    onClick={() => setSel(s => ({ ...s, sueno: 'deuda' }))} />
                      <ConseqBtn label="Tengo ingresos demasiado variables."                        selected={sel.sueno === 'carro'}    onClick={() => setSel(s => ({ ...s, sueno: 'carro' }))} />
                      <ConseqBtn label="Siento que trabajo más de lo que el sistema produce."       selected={sel.sueno === 'libertad'} onClick={() => setSel(s => ({ ...s, sueno: 'libertad' }))} />
                    </div>
                  </>}
                </>
              )}
              {nextBtn(
                pasoForm === 1 ? 'Incorporar primera evidencia →' :
                pasoForm === 2 ? 'Registrar dato de exposición →' :
                pasoForm === 3 ? 'Confirmar estructura del proceso →' :
                pasoForm === 4 ? 'Calibrar el análisis →' :
                'Completar la investigación →'
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
        <div style={{ padding: '48px 16px 80px', animation: 'fadeUp 0.5s ease both' }}>
          <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 36 }}>
              INVESTIGACIÓN CBC™ · CASO {nombreTrimmed.toUpperCase()}
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(44px,9vw,76px)', lineHeight: 0.94, color: 'white', margin: '0 0 36px', letterSpacing: '0.01em' }}>
              TODA LA<br />EVIDENCIA FUE<br /><span style={{ color: ROJO }}>RECIBIDA.</span>
            </h2>
            <div style={{ maxWidth: 420, margin: '0 auto 40px', textAlign: 'left' }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: '#B8B8B8', lineHeight: 1.85, margin: '0 0 16px' }}>
                Hay un patrón en las respuestas de {nombreTrimmed.split(' ')[0] || nombreTrimmed}.
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: '#666', lineHeight: 1.85, margin: '0 0 16px' }}>
                Es consistente.<br />
                Es identificable.<br />
                Y tiene nombre.
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: '#444', lineHeight: 1.75, margin: 0 }}>
                El mecanismo está identificado. El costo, calculado.
              </p>
            </div>
            <button onClick={lanzarResultado} style={{
              display: 'block', width: '100%', padding: '18px 24px',
              background: ROJO, color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: '0.1em',
              boxShadow: `0 4px 28px rgba(232,0,29,0.3)`,
            }}>
              VER QUÉ ENCONTRÓ LA INVESTIGACIÓN →
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          DICTAMEN EN CONSTRUCCIÓN
      ════════════════════════════════════════ */}
      {fase === 'cargando' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px 80px' }}>
          <div style={{ maxWidth: 480, width: '100%' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 32, textAlign: 'center' }}>
              CONSTRUYENDO DICTAMEN
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px,7vw,58px)', color: 'white', letterSpacing: '0.01em', lineHeight: 0.95, margin: '0 0 40px', textAlign: 'center' }}>
              PROCESANDO<br /><span style={{ color: ROJO }}>TODA LA EVIDENCIA</span>
            </h2>
            <div style={{ background: 'rgba(8,8,8,0.72)', backdropFilter: 'blur(10px)', border: '1px solid #1f1f1f', borderRadius: 12, padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 0 }}>
              <DictamenRow label="Evidencias verificadas" delay={400} />
              <DictamenRow label="Hipótesis contrastadas" delay={900} />
              <DictamenRow label="Patrón identificado" delay={1600} />
              <DictamenRow label="Costo mensual calculado" delay={2400} />
              <DictamenRow label="Dictamen en preparación" delay={3200} />
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          DICTAMEN PRELIMINAR
      ════════════════════════════════════════ */}
      {fase === 'dictamen_preliminar' && r && (
        <DictamenPreliminar r={r} nombre={nombreTrimmed} onContinue={() => { setFase('expediente'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
      )}

      {/* ════════════════════════════════════════
          EXPEDIENTE
      ════════════════════════════════════════ */}
      {fase === 'expediente' && r && (
        <div ref={resultRef} style={{ padding: '48px 16px 80px', animation: 'fadeUp 0.5s ease both' }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>

            <div style={{ marginBottom: 40 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>
                EXPEDIENTE — CASO {nombreTrimmed.toUpperCase()}
              </div>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(38px,8vw,64px)', lineHeight: 0.92, color: 'white', margin: '0 0 16px', letterSpacing: '0.01em' }}>
                RECONSTRUCCIÓN<br /><span style={{ color: ROJO }}>DEL CASO</span>
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: '#555', lineHeight: 1.75, margin: 0 }}>
                Lo que la investigación observó, descartó y concluyó.
              </p>
            </div>

            {/* Sección 1: Evidencia registrada */}
            <div style={{ background: 'rgba(8,8,8,0.72)', backdropFilter: 'blur(10px)', border: '1px solid #1f1f1f', borderRadius: 12, padding: '24px', marginBottom: 12 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>E01 – E05 · EVIDENCIA REGISTRADA</div>
              {[
                { ref: 'E01', label: 'Valor de operación', val: sel.v1 ? fmt(sel.v1) : '—' },
                { ref: 'E02', label: 'Operaciones en zona de enfriamiento', val: `${sel.v2 ?? 0} activas` },
                { ref: 'E03', label: 'Secuencia en fase de deliberación', val: sel.q3 === true ? 'Definida' : sel.q3 === false ? 'Variable' : '—' },
                { ref: 'E04', label: 'Métrica de conversión documentada', val: sel.q4 === true ? 'Sí' : sel.q4 === false ? 'No' : '—' },
                // P2: label forense en lugar de valor crudo
                { ref: 'E05', label: 'Consecuencia predominante', val: sel.sueno ? SUENO_LABELS[sel.sueno] ?? sel.sueno : '—' },
              ].map(({ ref: eRef, label, val }) => (
                <div key={eRef} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 0', borderBottom: '1px solid #141414' }}>
                  <div style={{ flexShrink: 0 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: '#333', letterSpacing: '0.12em', marginRight: 10 }}>{eRef}</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#666' }}>{label}</span>
                  </div>
                  <span style={{ fontFamily: eRef === 'E05' ? "'Inter', sans-serif" : "'JetBrains Mono', monospace", fontSize: eRef === 'E05' ? 11 : 12, color: '#888', letterSpacing: '0.02em', flexShrink: 1, marginLeft: 12, textAlign: 'right', maxWidth: '55%', lineHeight: 1.4 }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Sección 2: Hipótesis evaluadas */}
            <div style={{ background: 'rgba(8,8,8,0.72)', backdropFilter: 'blur(10px)', border: '1px solid #1f1f1f', borderRadius: 12, padding: '24px', marginBottom: 12 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>HIPÓTESIS · ESTADO FINAL</div>
              {(['Escasez de contactos iniciales', 'Proceso con brechas no visibles', 'Saturación del segmento objetivo'] as const).map((h, i) => {
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

            {/* Sección 3: Corrección controlada — P5: ambas ramas */}
            {sel.q3 !== null && (
              <div style={{ background: '#0a0800', border: '1px solid rgba(245,196,0,0.15)', borderRadius: 12, padding: '20px 24px', marginBottom: 12 }}>
                {sel.q3 === true ? (
                  <>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#444', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>CORRECCIÓN REGISTRADA · E03</div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#888', lineHeight: 1.8, margin: '0 0 8px' }}>
                      La evidencia E02 reforzaba una interpretación que señalaba ausencia de estructura como causa principal.
                    </p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#B8B8B8', lineHeight: 1.8, margin: 0 }}>
                      La evidencia E03 obligó a corregir esa lectura. La secuencia definida existe — el problema opera en otro punto. La investigación cambió de dirección en ese momento.
                    </p>
                  </>
                ) : (
                  <>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#444', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>CONFIRMACIÓN REGISTRADA · E03</div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#888', lineHeight: 1.8, margin: '0 0 8px' }}>
                      La evidencia E02 establecía un patrón de exposición.
                    </p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#B8B8B8', lineHeight: 1.8, margin: 0 }}>
                      La evidencia E03 lo confirmó: la variabilidad del proceso es el mecanismo por el que las operaciones desaparecen. La investigación no cambió de dirección — identificó el punto exacto de origen.
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Sección 4: Responsable documentado */}
            <div style={{ background: `${r.nivelColor}10`, border: `1px solid ${r.nivelColor}30`, borderRadius: 12, padding: '22px 24px', marginBottom: 12 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: r.nivelColor, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12, opacity: 0.7 }}>RESPONSABLE DOCUMENTADO</div>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(28px,5vw,38px)', color: 'white', letterSpacing: '0.02em', lineHeight: 1, margin: '0 0 12px' }}>
                {r.cuelloLabel.toUpperCase()}
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.75, margin: '0 0 10px' }}>{r.cuelloTexto}</p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: AMARILLO, lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>
                {{
                  seguimiento: 'No estás perdiendo clientes por tu pitch. Los estás perdiendo porque nadie los vuelve a contactar en el momento justo.',
                  priorizacion: 'No estás perdiendo clientes. Estás dejando esperar demasiado a los clientes correctos — y en ventas, tarde es peor que nunca.',
                  preparacion: 'No estás perdiendo por precio. Estás cediendo ventas porque no tienes una respuesta lista cuando el cliente duda.',
                  reporte: 'No es que estés trabajando mal. Es que sin medir, no puedes identificar exactamente qué parte del proceso te está costando dinero.',
                }[r.cuello]}
              </p>
            </div>

            {/* Sección 5: P3 — rango calibrado, cifra exacta solo en veredicto */}
            {r.perdidaMensual > 0 && (
              <div style={{ background: '#0d0000', border: '1px solid #2a0000', borderRadius: 12, padding: '22px 24px', marginBottom: 12 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>IMPACTO ECONÓMICO · RANGO CALIBRADO</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(28px,6vw,44px)', color: ROJO, letterSpacing: '0.02em', lineHeight: 1, marginBottom: 8 }}>
                  {calibratedRange(r.perdidaMensual)}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: '#333', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>mensual · calculado con las evidencias del caso</div>
                {(sel.v1 ?? 0) > 0 && (
                  <p style={{ fontFamily: "'Inter', sans-serif", margin: 0, fontSize: 12, color: '#444', lineHeight: 1.65 }}>
                    Equivale a ≈ {Math.max(1, Math.round(r.perdida90 / (sel.v1 ?? 1)))} operaciones no realizadas en 90 días si el patrón no cambia.
                  </p>
                )}
                <div style={{ borderTop: '1px solid #1a0000', marginTop: 14, paddingTop: 12 }}>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", margin: 0, fontSize: 9, color: '#2a2a2a', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    La cifra exacta se emite en el veredicto.
                  </p>
                </div>
              </div>
            )}

            {/* Sección 6: Proyección 90 días */}
            <div style={{ background: '#0a0800', border: `1px solid rgba(245,196,0,0.1)`, borderRadius: 12, padding: '22px 24px', marginBottom: 12 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>PROYECCIÓN · 90 DÍAS SIN CAMBIOS</div>
              {calcular90dias(sel, r.perdidaMensual).map((linea, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 10, marginBottom: 10, borderBottom: i < 2 ? '1px solid rgba(245,196,0,0.06)' : 'none' }}>
                  <span style={{ color: ROJO, flexShrink: 0, marginTop: 2, fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>→</span>
                  <p style={{ fontFamily: "'Inter', sans-serif", margin: 0, fontSize: 13, color: '#888', lineHeight: 1.7 }}>{linea}</p>
                </div>
              ))}
            </div>

            {/* CTA hacia veredicto */}
            <div style={{ marginTop: 36 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.16em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 16 }}>
                Toda la evidencia ha sido documentada. El veredicto final está listo.
              </div>
              <button onClick={() => { setFase('veredicto'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} style={{
                display: 'block', width: '100%', padding: '18px 24px',
                background: ROJO, color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer',
                fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: '0.1em',
                boxShadow: `0 4px 28px rgba(232,0,29,0.3)`,
              }}>
                VER EL VEREDICTO FINAL →
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          VEREDICTO FINAL
      ════════════════════════════════════════ */}
      {fase === 'veredicto' && r && (
        <VeredictoReveal r={r} nombre={nombreTrimmed} onContinue={() => { setFase('accion'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
      )}

      {/* ════════════════════════════════════════
          ACCIÓN
      ════════════════════════════════════════ */}
      {(fase === 'accion' || fase === 'desbloqueado') && r && (
        <div style={{ padding: '48px 16px 80px', animation: 'fadeUp 0.5s ease both' }}>
          <div style={{ maxWidth: 500, margin: '0 auto' }}>

            {fase === 'accion' && (
              <>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 32, textAlign: 'center' }}>
                  EXPEDIENTE · ESTADO ACTUAL
                </div>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(38px,8vw,62px)', lineHeight: 0.92, color: 'white', margin: '0 0 24px', letterSpacing: '0.01em' }}>
                  EXPEDIENTE<br /><span style={{ color: ROJO }}>INCOMPLETO.</span>
                </h2>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: '#B8B8B8', lineHeight: 1.85, margin: '0 0 32px' }}>
                  El dictamen emitido es el resumen ejecutivo. Existe una versión extendida con las conclusiones técnicas y el plan de intervención específico para {nombreTrimmed.split(' ')[0] || nombreTrimmed}.
                </p>

                {/* P4: contenido personalizado por cuello */}
                <div style={{ background: 'rgba(8,8,8,0.72)', backdropFilter: 'blur(10px)', border: '1px solid #1f1f1f', borderRadius: 12, padding: '24px', marginBottom: 28 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>EXPEDIENTE COMPLETO · {r.cuello.toUpperCase()}</div>
                  {(accionPorCuello[r.cuello] ?? accionPorCuello['seguimiento']).map(({ ref: aRef, texto }, i) => (
                    <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '12px 0', borderBottom: i < 3 ? '1px solid #141414' : 'none' }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: ROJO, flexShrink: 0, marginTop: 3, letterSpacing: '0.08em' }}>{aRef}</span>
                      <p style={{ fontFamily: "'Inter', sans-serif", margin: 0, fontSize: 13, color: '#888', lineHeight: 1.7 }}>{texto}</p>
                    </div>
                  ))}
                </div>

                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Dirección para envío del expediente
                </div>
                <input
                  type="email" placeholder="correo@dominio.com" value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError('') }}
                  onKeyDown={e => e.key === 'Enter' && desbloquear()}
                  style={{ display: 'block', width: '100%', padding: '14px 18px', borderRadius: 8, background: '#0a0a0a', border: emailError ? `1px solid ${ROJO}` : '1px solid #222', color: 'white', fontSize: 15, marginBottom: emailError ? 6 : 14, outline: 'none', fontFamily: "'Inter', sans-serif", letterSpacing: '0.01em' }}
                />
                {emailError && <p style={{ fontFamily: "'JetBrains Mono', monospace", color: ROJO, fontSize: 10, margin: '0 0 12px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{emailError}</p>}
                <button
                  onClick={desbloquear} disabled={guardando}
                  style={{ display: 'block', width: '100%', padding: '17px', borderRadius: 8, border: 'none', background: '#22C55E', color: '#001a08', fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: '0.08em', cursor: guardando ? 'not-allowed' : 'pointer', boxShadow: `0 4px 28px rgba(34,197,94,0.3)` }}
                >
                  {guardando ? 'EMITIENDO...' : 'INCORPORAR EXPEDIENTE AL CASO →'}
                </button>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", margin: '14px 0 0', fontSize: 9, color: '#2a2a2a', letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center' }}>
                  El expediente solo puede emitirse una vez para este caso.
                </p>
              </>
            )}

            {fase === 'desbloqueado' && (
              <div style={{ textAlign: 'center', animation: 'fadeUp 0.5s ease both' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#22C55E', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 32 }}>
                  EXPEDIENTE EMITIDO
                </div>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", margin: '0 0 20px', fontSize: 'clamp(36px,7vw,56px)', color: 'white', letterSpacing: '0.01em', lineHeight: 0.95 }}>
                  EL CASO<br /><span style={{ color: VERDE_S }}>{nombreTrimmed.split(' ')[0].toUpperCase() || nombreTrimmed.toUpperCase()}</span><br />ESTÁ CERRADO.
                </h3>
                <p style={{ fontFamily: "'Inter', sans-serif", margin: '0 0 12px', fontSize: 15, color: '#888', lineHeight: 1.75 }}>
                  El expediente completo fue enviado. Revisa tu correo.
                </p>
                <p style={{ fontFamily: "'Inter', sans-serif", margin: 0, fontSize: 13, color: '#444', lineHeight: 1.65 }}>
                  Incluye la reconstrucción del caso, el responsable documentado y el plan de intervención para el punto de fuga identificado.
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      <footer style={{ textAlign: 'center', padding: '24px', fontFamily: "'Barlow', sans-serif", fontSize: 12, color: '#333', borderTop: '1px solid #111' }}>
        © 2026 Diana García · Arquitecta de Automatizaciones · <em>Hago fácil lo difícil.</em>
      </footer>
    </div>
  )
}
