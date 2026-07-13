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
      'Una causa bajó en el análisis. Siguiente pregunta.',
    ]
    if (v1 >= 1000) return [
      'Analizando tu respuesta...',
      `Con ${v1s} por venta, ya tenemos el número real con el que trabajamos. El análisis tiene ahora una base concreta.`,
      'El cálculo se ajustó con este dato. Siguiente pregunta.',
    ]
    return [
      'Analizando tu respuesta...',
      `Con ${v1s} por venta, el volumen de prospectos necesario para llegar a tu meta es alto. Evaluamos si la falta de contactos nuevos está operando como factor.`,
      'Una posible causa ganó relevancia. Siguiente pregunta.',
    ]
  }
  if (paso === 2) {
    if (v2 >= 5) return [
      'Cruzando con tu respuesta anterior...',
      `Con ${v2} prospectos sin seguimiento y comisiones de ${v1s}, la falta de contactos nuevos no explica este patrón. La descartamos.`,
      'Una causa descartada. El análisis se concentra.',
    ]
    if (v2 >= 2) return [
      'Cruzando con tu respuesta anterior...',
      `Al cruzar ${v2} prospectos sin contacto con ${v1s} por venta, el nivel de exposición queda definido. El patrón empieza a ser visible.`,
      'El análisis necesita una respuesta más para confirmar la dirección.',
    ]
    return [
      'Evaluando tu respuesta...',
      `${v2 === 0 ? 'Ningún' : v2} prospecto${v2 === 1 ? '' : 's'} sin seguimiento con comisiones de ${v1s}. Combinación poco común. Evaluamos una causa alternativa.`,
      'La dirección del análisis acaba de cambiar.',
    ]
  }
  if (paso === 3) {
    if (sel.q3 === false) return [
      'Recalculando...',
      'Confirmado. La ausencia de un protocolo claro ante el "lo pienso" es el punto exacto donde las ventas desaparecen. El análisis tiene ahora un origen específico.',
      'Causa principal identificada. Siguiente pregunta.',
    ]
    return [
      'Recalculando...',
      `Corrección. Tener un protocolo para el "lo pienso" descarta esa como la causa principal. El problema está en otro punto del proceso.`,
      'Una causa descartada. Nueva dirección confirmada.',
    ]
  }
  if (paso === 4) {
    if (sel.q4 === false) return [
      'Incorporando último dato...',
      `Sin la tasa de cierre documentada, la naturaleza de las fugas queda establecida. Hay un patrón que opera en un punto específico y repetible del proceso de ${fn}.`,
      'La causa principal se confirma.',
    ]
    return [
      'Incorporando último dato...',
      'Tener la tasa de cierre documentada descarta una de las posibles causas. El origen apunta a un punto del proceso que opera fuera del control actual.',
      'El análisis se concentra en la causa que mejor describe el patrón.',
    ]
  }
  return [
    'Última respuesta registrada.',
    `El análisis está completo, ${fn}. El impacto puede expresarse en términos concretos — calculados con tus propios datos.`,
    'Todas las causas evaluadas. Una sola sobrevive.',
  ]
}

// ── HipotesisBar ──────────────────────────────────────────
function HipotesisBar({ nombre, from: f, to: t, delay }: { nombre: string; from: number; to: number; delay: number }) {
  const [val, setVal] = useState(f)
  useEffect(() => { const id = setTimeout(() => setVal(t), delay); return () => clearTimeout(id) }, [t, delay])
  const estado = t < 12 ? 'Descartada' : t >= 75 ? 'Causa principal' : t > f ? 'Fortaleciéndose ↑' : t < f ? 'Debilitada ↓' : 'Sin cambios'
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
  const H_NAMES = ['Falta de contactos nuevos', 'Proceso con pasos perdidos', 'Mercado saturado']

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
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>POSIBLES CAUSAS</div>
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
              {paso < 5 ? 'Siguiente pregunta →' : 'Ver mi resultado →'}
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
          ANÁLISIS EN CURSO · CALCULANDO IMPACTO
        </div>

        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(42px,9vw,72px)', lineHeight: 0.9, color: 'white', margin: '0 0 28px', letterSpacing: '0.01em' }}>
          ALGO SE<br /><span style={{ color: ROJO }}>ESTÁ PERDIENDO.</span><br />AHORA CALCULAMOS<br />CUÁNTO.
        </h2>

        <div style={{ background: 'rgba(8,8,8,0.72)', backdropFilter: 'blur(10px)', border: '1px solid #1f1f1f', borderRadius: 12, padding: '24px 28px', marginBottom: 20 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>LO QUE ESTÁS PERDIENDO · POR MES</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(38px,8vw,60px)', color: AMARILLO, letterSpacing: '0.02em', lineHeight: 1 }}>
            {maskRange(r.perdidaMensual)}
          </div>
          <p style={{ fontFamily: "'Inter', sans-serif", margin: '12px 0 0', fontSize: 12, color: '#444', lineHeight: 1.65 }}>
            La cifra exacta aparece en el siguiente paso. Ya encontramos dónde está la fuga.
          </p>
        </div>

        <div style={{ background: '#0a0800', border: `1px solid rgba(245,196,0,0.1)`, borderRadius: 10, padding: '18px 22px', marginBottom: 32 }}>
          <p style={{ fontFamily: "'Inter', sans-serif", margin: '0 0 10px', fontSize: 13, color: '#666', lineHeight: 1.75 }}>
            Encontramos el cuello de botella que está frenando tus comisiones.
          </p>
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", margin: 0, fontSize: 22, color: 'white', letterSpacing: '0.04em' }}>
            {r.cuelloLabel.toUpperCase()}
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", margin: '8px 0 0', fontSize: 13, color: '#888', lineHeight: 1.65 }}>
            El detalle completo de tu diagnóstico incluye las causas descartadas y los pasos concretos para {nombre.split(' ')[0] || nombre}.
          </p>
        </div>

        <button onClick={onContinue} style={{
          display: 'block', width: '100%', padding: '18px 24px',
          background: ROJO, color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer',
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: '0.1em',
          boxShadow: `0 4px 28px rgba(232,0,29,0.3)`,
        }}>
          VER MI RESULTADO COMPLETO →
        </button>

        <p style={{ fontFamily: "'JetBrains Mono', monospace", margin: '16px 0 0', fontSize: 9, color: '#2a2a2a', letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center' }}>
          El detalle completo de tu diagnóstico · {nombre.split(' ')[0].toUpperCase() || nombre.toUpperCase()}
        </p>

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

        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 40, textAlign: 'center' }}>
          RESULTADO FINAL · DIAGNÓSTICO DE {nombre.toUpperCase()}
        </div>

        {beat >= 1 && (
          <div style={{ animation: 'fadeUp 0.5s ease both', marginBottom: 32, textAlign: 'center' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#555', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>
              AQUÍ ESTÁ TU FUGA PRINCIPAL
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(44px,10vw,82px)', lineHeight: 0.92, color: 'white', margin: '0 0 10px', letterSpacing: '0.01em' }}>
              {r.cuelloLabel.toUpperCase()}
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: '#666', lineHeight: 1.7, margin: 0 }}>
              {r.cuelloTexto}
            </p>
          </div>
        )}

        {beat >= 2 && r.perdidaMensual > 0 && (
          <div style={{ animation: 'fadeUp 0.5s ease both', background: 'rgba(8,8,8,0.72)', backdropFilter: 'blur(10px)', border: '1px solid #1f1f1f', borderRadius: 12, padding: '24px', marginBottom: 28 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>CUÁNTO ESTÁS PERDIENDO · POR MES</div>
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
            {r.perdidaMensual > 0 && (sel.v1 ?? 0) > 0 && (
              <p style={{ fontFamily: "'Inter', sans-serif", margin: '14px 0 0', fontSize: 12, color: '#444', lineHeight: 1.65, borderTop: '1px solid #1a0000', paddingTop: 12 }}>
                Hoy dejaste escapar el equivalente a {Math.max(1, Math.round(r.perdida90 / (sel.v1 ?? 1)))} ventas. Si nada cambia, en 90 días habrás dejado escapar {fmt(r.perdida90)} — eso equivale a clientes que ya casi tenías cerrados.
              </p>
            )}
          </div>
        )}

        {beat >= 3 && r.suenoTextos && sel.sueno && (
          <div style={{ animation: 'fadeUp 0.5s ease both', marginBottom: 32 }}>
            <div style={{ background: '#0a0800', border: '1px solid rgba(245,196,0,0.1)', borderRadius: 10, padding: '18px 22px' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#555', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>
                Y ESE SUEÑO TUYO...
              </div>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: AMARILLO, letterSpacing: '0.04em', margin: '0 0 14px' }}>
                {SUENO_LABELS[sel.sueno]?.toUpperCase()}
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#888', lineHeight: 1.8, margin: '0 0 10px' }}>
                No necesita que trabajes más horas. Necesita un sistema que siga vendiendo cuando tú estás con tu familia, durmiendo, o disfrutando de un fin de semana.
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#555', lineHeight: 1.75, margin: 0 }}>
                Cada seguimiento que depende de tu memoria pone un límite al crecimiento de tu negocio.
              </p>
            </div>
          </div>
        )}

        {beat >= 4 && (
          <div style={{ animation: 'fadeUp 0.5s ease both' }}>
            <div style={{ borderLeft: '2px solid #222', paddingLeft: 16, marginBottom: 24 }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#555', lineHeight: 1.8, margin: '0 0 8px', fontStyle: 'italic' }}>
                "Si llevas 10 años haciendo lo mismo, no tienes 10 años de experiencia. Tienes 1 año repetido 10 veces."
              </p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.1em' }}>
                Atribuida a John C. Maxwell
              </p>
            </div>
            {r.fortalezas.length >= 2 && (
              <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 10, padding: '16px 20px', marginBottom: 24 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>LO QUE YA HACES BIEN</div>
                {r.fortalezas.slice(0, 2).map((f, i) => (
                  <p key={i} style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#666', lineHeight: 1.75, margin: i === 0 ? '0 0 8px' : 0 }}>
                    ✓ {f.texto}
                  </p>
                ))}
              </div>
            )}
            <button onClick={onContinue} style={{
              display: 'block', width: '100%', padding: '18px 24px',
              background: ROJO, color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: '0.1em',
              boxShadow: `0 4px 28px rgba(232,0,29,0.3)`,
            }}>
              VER CÓMO RECUPERARLO →
            </button>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center', marginTop: 14 }}>
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

  const PASO_LABELS = ['', 'Pregunta 1 de 5', 'Pregunta 2 de 5', 'Pregunta 3 de 5', 'Pregunta 4 de 5', 'Pregunta 5 de 5']

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
      : pasoForm === 1 ? 'PREGUNTA 1 DE 5 · ANALIZANDO'
      : pasoForm === 2 ? 'PREGUNTA 2 DE 5 · CALCULANDO'
      : pasoForm === 3 ? 'PREGUNTA 3 DE 5 · AVANZANDO'
      : pasoForm === 4 ? 'PREGUNTA 4 DE 5 · CASI LISTO'
      : 'PREGUNTA 5 DE 5 · ÚLTIMA RESPUESTA'
    : fase === 'razonando'           ? 'ANALIZANDO TUS RESPUESTAS...'
    : fase === 'suspense'            ? 'ANÁLISIS COMPLETO · PREPARANDO RESULTADO'
    : fase === 'cargando'            ? 'CALCULANDO TU RESULTADO...'
    : fase === 'dictamen_preliminar' ? 'RESULTADO PRELIMINAR · EN CURSO'
    : fase === 'expediente'          ? `TU DIAGNÓSTICO · ${nombreTrimmed.toUpperCase()}`
    : fase === 'veredicto'           ? `RESULTADO FINAL · ${nombreTrimmed.toUpperCase()}`
    : `DIAGNÓSTICO COMPLETO · ${nombreTrimmed.toUpperCase()}`

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
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: '#888', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 32 }}>
            DIAGNÓSTICO COMERCIAL · CBC™
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(52px,10vw,96px)', lineHeight: 0.9, color: 'white', margin: '0 0 32px', letterSpacing: '0.02em' }}>
            EN 2 MINUTOS<br />SABES QUIÉN TE<br />ESTÁ <span style={{ color: ROJO }}>ROBANDO</span><br />TUS COMISIONES.
          </h1>
          <div style={{ textAlign: 'left', maxWidth: 520, margin: '0 auto 36px' }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(14px,2vw,16px)', color: '#B8B8B8', lineHeight: 1.8, margin: '0 0 20px' }}>
              Existe una fuga. ¿Tienes algún sospechoso en mente?
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(13px,1.8vw,15px)', color: '#666', lineHeight: 1.7, margin: 0 }}>
              Son <strong style={{ color: '#B8B8B8' }}>5 preguntas</strong>. Tus respuestas permanecen confidenciales.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', maxWidth: 400, margin: '0 auto' }}>
            <div style={{ height: 1, flex: 1, background: '#222' }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#444', letterSpacing: '0.15em' }}>SOLO TÚ VES TUS RESPUESTAS</span>
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
                    style={{ display: 'block', width: '100%', padding: '14px 18px', background: '#0c0c0c', border: `1px solid ${nombreTrimmed.length >= 2 ? ROJO : '#222'}`, borderRadius: 8, color: 'white', fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 600, outline: 'none', transition: 'border-color 0.2s', letterSpacing: '0.02em' }}
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
                    {qTitle(`¿Estás listo, ${nombreTrimmed.split(' ')[0] || nombreTrimmed}? Vamos a reunir las pistas.`)}
                    {qSub('¿Cuánto es tu comisión por cada venta que cierras?')}
                    <div style={{ position: 'relative', marginBottom: 8 }}>
                      <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: '#444', pointerEvents: 'none', zIndex: 1 }}>$</span>
                      <input type="number" min={0} placeholder="0" value={sel.v1 ?? ''} onChange={e => { const v = Number(e.target.value); setSel(s => ({ ...s, v1: v > 0 ? v : null })) }} onKeyDown={e => e.key === 'Enter' && avanzar()} autoFocus
                        style={{ width: '100%', background: '#0c0c0c', border: `1px solid ${(sel.v1 ?? 0) > 0 ? ROJO : '#222'}`, borderRadius: 8, padding: '14px 16px 14px 40px', color: 'white', fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 700, outline: 'none', transition: 'border-color 0.2s', letterSpacing: '0.04em' }} />
                    </div>
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", margin: 0, fontSize: 10, color: '#444', letterSpacing: '0.08em' }}>VALOR EN USD · SOLO TÚ VES ESTE CAMPO</p>
                  </>}

                  {/* E2 */}
                  {pasoForm === 2 && <>
                    {qTitle('¿Cuántos prospectos llevan más de 7 días sin seguimiento?')}
                    {qSub('Los que están en tu lista esperando. Ahora mismo. Sé honesto — nadie más va a ver tu respuesta.')}
                    <div style={{ position: 'relative', marginBottom: 8 }}>
                      <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: '#444', pointerEvents: 'none', zIndex: 1 }}>#</span>
                      <input type="number" min={0} placeholder="0" value={sel.v2 ?? ''} onChange={e => { const v = Number(e.target.value); setSel(s => ({ ...s, v2: e.target.value === '' ? null : v >= 0 ? v : 0 })) }} onKeyDown={e => e.key === 'Enter' && avanzar()} autoFocus
                        style={{ width: '100%', background: '#0c0c0c', border: `1px solid ${sel.v2 !== null ? ROJO : '#222'}`, borderRadius: 8, padding: '14px 16px 14px 40px', color: 'white', fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 700, outline: 'none', transition: 'border-color 0.2s', letterSpacing: '0.04em' }} />
                    </div>
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", margin: 0, fontSize: 10, color: '#444', letterSpacing: '0.08em' }}>NÚMERO DE PROSPECTOS · SÉ PRECISO</p>
                  </>}

                  {/* E3 */}
                  {pasoForm === 3 && <>
                    {qTitle("Cuando un cliente te dice 'lo pienso' — ¿qué haces?")}
                    {qSub('Nadie te mira. Di la verdad.')}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <TogBtn label="Tengo un protocolo claro y lo ejecuto siempre" selected={sel.q3 === true}  variant="yes" onClick={() => setSel(s => ({ ...s, q3: true }))} />
                      <TogBtn label="Improviso y espero que me llamen"              selected={sel.q3 === false} variant="no"  onClick={() => setSel(s => ({ ...s, q3: false }))} />
                    </div>
                  </>}

                  {/* E4 */}
                  {pasoForm === 4 && <>
                    {qTitle('¿Sabes exactamente cuál es tu tasa de cierre?')}
                    {qSub('De cada 10 prospectos que atiendes, ¿cuántos terminan comprando? Si no conoces el número exacto, escribe una aproximación — la mayoría de vendedores no conoce su tasa de cierre real.')}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <TogBtn label="Sí, lo tengo medido y calculado"    selected={sel.q4 === true}  variant="yes" onClick={() => setSel(s => ({ ...s, q4: true }))} />
                      <TogBtn label="No, nunca lo he calculado"           selected={sel.q4 === false} variant="no"  onClick={() => setSel(s => ({ ...s, q4: false }))} />
                    </div>
                  </>}

                  {/* E5 */}
                  {pasoForm === 5 && <>
                    {qTitle('Soñar no cuesta nada. Hacerlo realidad sí.')}
                    {qSub('¿Cuál es ese sueño que llevas más tiempo esperando o postergando?')}
                    <p style={{ fontFamily: "'Inter', sans-serif", margin: '-16px 0 16px', fontSize: 12, color: '#444', lineHeight: 1.6, fontStyle: 'italic' }}>
                      El que piensas cuando dices "cuando me vaya mejor..."
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <ConseqBtn label="La casa o el arreglo prometido"        selected={sel.sueno === 'casa'}     onClick={() => setSel(s => ({ ...s, sueno: 'casa' }))} />
                      <ConseqBtn label="Las vacaciones postergadas"             selected={sel.sueno === 'viaje'}    onClick={() => setSel(s => ({ ...s, sueno: 'viaje' }))} />
                      <ConseqBtn label="Los estudios tuyos o de tus hijos"      selected={sel.sueno === 'estudios'} onClick={() => setSel(s => ({ ...s, sueno: 'estudios' }))} />
                      <ConseqBtn label="La deuda que no te deja dormir"         selected={sel.sueno === 'deuda'}    onClick={() => setSel(s => ({ ...s, sueno: 'deuda' }))} />
                      <ConseqBtn label="El carro que prometiste cambiar"        selected={sel.sueno === 'carro'}    onClick={() => setSel(s => ({ ...s, sueno: 'carro' }))} />
                      <ConseqBtn label="Tiempo libre sin culpa ni estrés"       selected={sel.sueno === 'libertad'} onClick={() => setSel(s => ({ ...s, sueno: 'libertad' }))} />
                    </div>
                    {sel.sueno && (
                      <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #1a1a1a' }}>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: '#888', lineHeight: 1.75, margin: '0 0 6px', textAlign: 'center' }}>
                          En menos de 60 segundos vas a saber quién es el verdadero ladrón de tus comisiones...
                        </p>
                        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center', margin: 0 }}>
                          ¿Tienes en mente algún sospechoso?
                        </p>
                      </div>
                    )}
                  </>}
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
        <div style={{ padding: '48px 16px 80px', animation: 'fadeUp 0.5s ease both' }}>
          <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 36 }}>
              DIAGNÓSTICO CBC™ · EN PREPARACIÓN
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(44px,9vw,76px)', lineHeight: 0.94, color: 'white', margin: '0 0 36px', letterSpacing: '0.01em' }}>
              PREPARANDO<br />TU<br /><span style={{ color: ROJO }}>DIAGNÓSTICO...</span>
            </h2>
            <div style={{ maxWidth: 420, margin: '0 auto 40px', textAlign: 'left' }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: '#B8B8B8', lineHeight: 1.85, margin: '0 0 16px' }}>
                Estamos analizando tus respuestas para identificar el mayor responsable de la pérdida de tus comisiones.
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: '#444', lineHeight: 1.75, margin: 0 }}>
                En unos segundos lo descubrirás con tus propios números.
              </p>
            </div>
            <button onClick={lanzarResultado} style={{
              display: 'block', width: '100%', padding: '18px 24px',
              background: ROJO, color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: '0.1em',
              boxShadow: `0 4px 28px rgba(232,0,29,0.3)`,
            }}>
              VER MI DIAGNÓSTICO →
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
                TU DIAGNÓSTICO · {nombreTrimmed.toUpperCase()}
              </div>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(38px,8vw,64px)', lineHeight: 0.92, color: 'white', margin: '0 0 16px', letterSpacing: '0.01em' }}>
                {nombreTrimmed.split(' ')[0] || nombreTrimmed}, ¿QUÉ VA A PASAR<br />EN 90 DÍAS SI NO<br /><span style={{ color: ROJO }}>CAMBIAS NADA?</span>
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: '#555', lineHeight: 1.75, margin: 0 }}>
                Encontramos el cuello de botella que está frenando tus comisiones.
              </p>
            </div>

            {/* Sección 1: Tus respuestas */}
            <div style={{ background: 'rgba(8,8,8,0.72)', backdropFilter: 'blur(10px)', border: '1px solid #1f1f1f', borderRadius: 12, padding: '24px', marginBottom: 12 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>TUS RESPUESTAS</div>
              {[
                { ref: 'E01', label: 'Valor de operación', val: sel.v1 ? fmt(sel.v1) : '—' },
                { ref: 'E02', label: 'Prospectos sin seguimiento +7 días', val: `${sel.v2 ?? 0} activos` },
                { ref: 'E03', label: 'Protocolo ante el "lo pienso"', val: sel.q3 === true ? 'Definido' : sel.q3 === false ? 'Improvisa' : '—' },
                { ref: 'E04', label: 'Tasa de cierre documentada', val: sel.q4 === true ? 'Sí' : sel.q4 === false ? 'No' : '—' },
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

            {/* Sección 2: Causas evaluadas */}
            <div style={{ background: 'rgba(8,8,8,0.72)', backdropFilter: 'blur(10px)', border: '1px solid #1f1f1f', borderRadius: 12, padding: '24px', marginBottom: 12 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>CAUSAS EVALUADAS</div>
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
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#444', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>AJUSTE EN EL ANÁLISIS · PREGUNTA 3</div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#888', lineHeight: 1.8, margin: '0 0 8px' }}>
                      Tu respuesta anterior apuntaba a la falta de protocolo como causa principal.
                    </p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#B8B8B8', lineHeight: 1.8, margin: 0 }}>
                      Pero tener un protocolo claro para el "lo pienso" descarta esa causa. El problema está en otro punto del proceso — el análisis cambió de dirección en ese momento.
                    </p>
                  </>
                ) : (
                  <>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#444', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>CONFIRMACIÓN EN EL ANÁLISIS · PREGUNTA 3</div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#888', lineHeight: 1.8, margin: '0 0 8px' }}>
                      Tus respuestas anteriores mostraban un patrón de prospectos sin contacto.
                    </p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#B8B8B8', lineHeight: 1.8, margin: 0 }}>
                      La pregunta 3 lo confirmó: improvisar ante el "lo pienso" es exactamente donde desaparecen tus ventas. El análisis no cambió de dirección — encontró el punto exacto de origen.
                    </p>
                  </>
                )}
              </div>
            )}

            {/* La buena noticia */}
            <div style={{ background: '#0a1a0a', border: '1px solid rgba(34,197,94,0.12)', borderRadius: 12, padding: '16px 22px', marginBottom: 12 }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: '#4a8a4a', lineHeight: 1.75, margin: 0 }}>
                La buena noticia: no necesitas conseguir más clientes. Solo recuperar mejor los que ya tienes.
              </p>
            </div>

            {/* Sección 4: Tu cuello de botella */}
            <div style={{ background: `${r.nivelColor}10`, border: `1px solid ${r.nivelColor}30`, borderRadius: 12, padding: '22px 24px', marginBottom: 12 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: r.nivelColor, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12, opacity: 0.7 }}>TU CUELLO DE BOTELLA</div>
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

            {/* Sección 5: Lo que estás perdiendo */}
            {r.perdidaMensual > 0 && (
              <div style={{ background: '#0d0000', border: '1px solid #2a0000', borderRadius: 12, padding: '22px 24px', marginBottom: 12 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>LO QUE ESTÁS PERDIENDO · POR MES</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(28px,6vw,44px)', color: ROJO, letterSpacing: '0.02em', lineHeight: 1, marginBottom: 8 }}>
                  {calibratedRange(r.perdidaMensual)}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: '#333', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>mensual · calculado con tus propios datos</div>
                {(sel.v1 ?? 0) > 0 && (
                  <p style={{ fontFamily: "'Inter', sans-serif", margin: 0, fontSize: 12, color: '#444', lineHeight: 1.65 }}>
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
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>ESTO ES LO QUE PASA EN 90 DÍAS SI NO CAMBIAS NADA</div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#666', lineHeight: 1.7, margin: '0 0 14px' }}>
                Estás dejando escapar ventas que ya habías conseguido. Tus clientes no desaparecen — se enfrían.
              </p>
              {calcular90dias(sel, r.perdidaMensual).map((linea, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 10, marginBottom: 10, borderBottom: i < 2 ? '1px solid rgba(245,196,0,0.06)' : 'none' }}>
                  <span style={{ color: ROJO, flexShrink: 0, marginTop: 2, fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>→</span>
                  <p style={{ fontFamily: "'Inter', sans-serif", margin: 0, fontSize: 13, color: '#888', lineHeight: 1.7 }}>{linea}</p>
                </div>
              ))}
            </div>

            {/* CTA hacia resultado final */}
            <div style={{ marginTop: 36 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.16em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 16 }}>
                Tus datos están calculados. El resultado final está listo.
              </div>
              <button onClick={() => { setFase('veredicto'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} style={{
                display: 'block', width: '100%', padding: '18px 24px',
                background: ROJO, color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer',
                fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: '0.1em',
                boxShadow: `0 4px 28px rgba(232,0,29,0.3)`,
              }}>
                VER MI RESULTADO COMPLETO →
              </button>
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
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 32, textAlign: 'center' }}>
                  TU PLAN DE ACCIÓN · {nombreTrimmed.toUpperCase()}
                </div>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(38px,8vw,62px)', lineHeight: 0.92, color: 'white', margin: '0 0 24px', letterSpacing: '0.01em' }}>
                  {nombreTrimmed.split(' ')[0] || nombreTrimmed},<br />DESBLOQUEA TU<br /><span style={{ color: TEAL_R }}>PLAN DE ACCIÓN.</span>
                </h2>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: '#B8B8B8', lineHeight: 1.85, margin: '0 0 20px' }}>
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
                        <p style={{ fontFamily: "'Inter', sans-serif", margin: 0, fontSize: 13, color: '#888', lineHeight: 1.6 }}>{item}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 16 }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#333', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
                      Tu reporte personalizado · {r.cuello}
                    </div>
                    {(accionPorCuello[r.cuello] ?? accionPorCuello['seguimiento']).map(({ ref: aRef, texto }, i) => (
                      <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '10px 0', borderBottom: i < 3 ? '1px solid #141414' : 'none' }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: ROJO, flexShrink: 0, marginTop: 3, letterSpacing: '0.08em' }}>{aRef}</span>
                        <p style={{ fontFamily: "'Inter', sans-serif", margin: 0, fontSize: 13, color: '#888', lineHeight: 1.7 }}>{texto}</p>
                      </div>
                    ))}
                  </div>
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
                  LISTO,<br /><span style={{ color: VERDE_S }}>{nombreTrimmed.split(' ')[0].toUpperCase() || nombreTrimmed.toUpperCase()}.</span>
                </h3>
                <p style={{ fontFamily: "'Inter', sans-serif", margin: '0 0 12px', fontSize: 15, color: '#888', lineHeight: 1.75 }}>
                  Tu plan de acción ya está en camino a tu correo.
                </p>
                <p style={{ fontFamily: "'Inter', sans-serif", margin: 0, fontSize: 13, color: '#444', lineHeight: 1.65 }}>
                  Revísalo en los próximos minutos — ahí están las 3 acciones que más impacto van a tener en tu semana.
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
