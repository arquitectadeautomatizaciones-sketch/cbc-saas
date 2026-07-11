'use client'

import { useState, useEffect, useRef } from 'react'

const VERDE = '#1A4A44'
const TEAL = '#4ECDC4'
const AMARILLO = '#f5c400'

type Paso = 'form' | 'cargando' | 'resultados' | 'desbloqueado'

interface Selecciones {
  q1val: number | null
  q1label: string
  q2: number | null
  q2lost: number
  q3: number | null
  q4: number | null
  q5: number | null
}

const COMISION_OPTS = [
  { label: 'Menos de $500 USD', val: 300 },
  { label: 'Entre $500 y $2.000 USD', val: 1250 },
  { label: 'Entre $2.000 y $5.000 USD', val: 3500 },
  { label: 'Más de $5.000 USD', val: 7500 },
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

function calcular(s: Selecciones) {
  const q2 = s.q2 ?? 0; const q3 = s.q3 ?? 0; const q4 = s.q4 ?? 0; const q5 = s.q5 ?? 0
  const total = q2 + q3 + q4 + q5
  const sub = {
    seguimiento: Math.min(10, Math.round(((q2 + q3) / 50) * 10)),
    priorizacion: Math.min(10, Math.round(((q2 + q5) / 50) * 10)),
    preparacion: Math.min(10, Math.round(((q3 + q5) / 50) * 10)),
    reporte: Math.min(10, Math.round((q4 / 25) * 10)),
  }
  const cuello = (Object.entries(sub) as [string, number][]).sort((a, b) => a[1] - b[1])[0][0]
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
    seguimiento: 'Tienes el talento para cerrar — pero si los prospectos se enfrían antes de que actúes, nunca llegas al cierre.',
    priorizacion: 'Sin orden de urgencia, atiendes a quien recuerdas, no a quien más necesita tu llamada hoy.',
    preparacion: 'Tardas demasiado en armar cada mensaje y eso te quita tiempo real de venta.',
    reporte: 'No sabes exactamente cómo vas — y eso debilita tu posición ante tu director y ante ti mismo.',
  }
  const RECOMENDACIONES: Record<string, string[]> = {
    seguimiento: ['Registra cada prospecto el mismo día que lo conoces, antes de apagar el teléfono.', 'Programa los seguimientos días 1, 3 y 7 — no cuando te acuerdes.', 'Usa mensajes pre-redactados con el contexto del prospecto, no de memoria.'],
    priorizacion: ['Prioriza por días sin contacto, no por afinidad o recencia.', 'Define 3 contactos urgentes cada mañana antes de revisar el teléfono.', 'Los rojos primero — siempre. Un prospecto en rojo es dinero que se está yendo.'],
    preparacion: ['Antes de escribir, revisa las notas del prospecto. 60 segundos de contexto = 3x más respuestas.', 'Ten plantillas base por tipo de seguimiento (día 1, día 3, día 7) y personaliza solo 2 líneas.', 'Si tardas más de 5 minutos en redactar un mensaje, algo en tu proceso está roto.'],
    reporte: ['Calcula tu tasa de cierre hoy: cierres del mes ÷ prospectos contactados × 100.', 'Actualiza el estado de tus prospectos al menos 2 veces por semana.', 'Ten los números listos antes de que alguien te los pida — eso cambia tu posición completamente.'],
  }

  const fortalezas = Object.entries(FORTALEZAS)
    .map(([k, v]) => ({ cat: k, texto: v, score: sub[k as keyof typeof sub] }))
    .sort((a, b) => b.score - a.score)
  const debilidades = Object.entries(DEBILIDADES)
    .map(([k, v]) => ({ cat: k, texto: v, score: sub[k as keyof typeof sub] }))
    .sort((a, b) => a.score - b.score)

  return {
    total, sub, cuello,
    cuelloLabel: cuello.charAt(0).toUpperCase() + cuello.slice(1),
    cuelloTexto: CUELLO_TEXTO[cuello],
    perdidaMensual, fortalezas, debilidades,
    recomendaciones: RECOMENDACIONES[cuello],
    nivelColor: total < 40 ? '#ef4444' : total < 65 ? '#f59e0b' : '#10b981',
  }
}

function calcular90dias(s: Selecciones, perdidaMensual: number): string[] {
  const lineas: string[] = []
  const p90 = perdidaMensual * 3
  if (p90 > 0) lineas.push(`Pierdes $${p90.toLocaleString('en-US')} USD en prospectos que se enfrían solos — sin sistema que los reactive.`)
  if ((s.q3 ?? 25) === 0) lineas.push('Sigues improvisando ante el "lo pienso" — esos leads terminan comprándole a quien sí hace seguimiento.')
  else if ((s.q3 ?? 25) < 25) lineas.push('Tu seguimiento en Excel o WhatsApp sigue perdiendo contexto — y cada vez que lo buscas, pierdes tiempo que otros usan para cerrar.')
  if ((s.q4 ?? 25) === 0) lineas.push('No mides tu tasa de cierre. Lo que no se mide, no mejora — y lo que no mejora, se estanca.')
  else if ((s.q4 ?? 25) < 25) lineas.push('Tu tasa de cierre sigue siendo una estimación. Sin el número exacto, no puedes mejorar lo que no ves.')
  if ((s.q5 ?? 25) === 0) lineas.push('Cada mensaje de seguimiento te sigue costando más de 20 minutos — tiempo que podrías usar en nuevos prospectos.')
  if (lineas.length < 3) lineas.push('Tus prospectos sin respuesta siguen acumulándose — hasta que eligen a tu competencia.')
  return lineas.slice(0, 3)
}

// ── Sub-components ────────────────────────────────────────
function GaugeSVG({ score, color }: { score: number; color: string }) {
  const [anim, setAnim] = useState(0)
  useEffect(() => { const t = setTimeout(() => setAnim(score), 120); return () => clearTimeout(t) }, [score])
  const rotation = (anim / 100) * 180 - 90
  return (
    <div style={{ textAlign: 'center' }}>
      <svg viewBox="0 0 200 110" width="220" height="115" style={{ overflow: 'visible', display: 'block', margin: '0 auto' }}>
        <path d="M 22 95 A 78 78 0 0 0 178 95" fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round" />
        <path d="M 22 95 A 78 78 0 0 0 76 21" fill="none" stroke="#ef4444" strokeWidth="14" strokeLinecap="butt" opacity="0.5" />
        <path d="M 76 21 A 78 78 0 0 0 135 26" fill="none" stroke="#f59e0b" strokeWidth="14" strokeLinecap="butt" opacity="0.5" />
        <path d="M 135 26 A 78 78 0 0 0 178 95" fill="none" stroke="#10b981" strokeWidth="14" strokeLinecap="butt" opacity="0.5" />
        <text x="16" y="110" textAnchor="middle" fontSize="8" fill="#9ca3af">0</text>
        <text x="100" y="12" textAnchor="middle" fontSize="8" fill="#9ca3af">50</text>
        <text x="184" y="110" textAnchor="middle" fontSize="8" fill="#9ca3af">100</text>
        <g style={{ transformOrigin: '100px 95px', transform: `rotate(${rotation}deg)`, transition: 'transform 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
          <line x1="100" y1="95" x2="100" y2="23" stroke={VERDE} strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="100,17 97,28 103,28" fill={VERDE} />
        </g>
        <circle cx="100" cy="95" r="9" fill={VERDE} /><circle cx="100" cy="95" r="4" fill="white" />
      </svg>
      <div style={{ marginTop: 4 }}>
        <div style={{ fontSize: 52, fontWeight: 900, color: VERDE, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>/100</div>
        <div style={{ fontSize: 14, fontWeight: 700, color, marginTop: 6 }}>{score < 40 ? 'Sistema en riesgo' : score < 65 ? 'Hay margen de mejora' : 'Sistema sólido'}</div>
      </div>
    </div>
  )
}

function SubBar({ label, score, delay = 0 }: { label: string; score: number; delay?: number }) {
  const [w, setW] = useState(0)
  useEffect(() => { const t = setTimeout(() => setW(score), 300 + delay); return () => clearTimeout(t) }, [score, delay])
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

function ProgressBar({ step }: { step: number }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Pregunta {step} de 5
        </span>
        <span style={{ fontSize: 12, fontWeight: 800, color: TEAL }}>{Math.round((step / 5) * 100)}%</span>
      </div>
      <div style={{ background: '#e5e7eb', borderRadius: 100, height: 5 }}>
        <div style={{ width: `${(step / 5) * 100}%`, height: '100%', background: TEAL, borderRadius: 100, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

function Opcion({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{
      display: 'block', width: '100%', textAlign: 'left', padding: '13px 16px', borderRadius: 10,
      border: selected ? `2px solid ${TEAL}` : '2px solid #e5e7eb',
      background: selected ? `${TEAL}18` : 'white',
      color: selected ? VERDE : '#374151',
      fontWeight: selected ? 700 : 500, fontSize: 15,
      cursor: 'pointer', marginBottom: 8, transition: 'all 0.15s', position: 'relative',
    }}>
      <span style={{
        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
        width: 20, height: 20, borderRadius: '50%',
        border: selected ? 'none' : '2px solid #d1d5db',
        background: selected ? TEAL : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, color: 'white', flexShrink: 0,
      }}>{selected ? '✓' : ''}</span>
      {label}
    </button>
  )
}

function PantallaCarga({ nombre }: { nombre: string }) {
  const [msg, setMsg] = useState(0)
  const msgs = [`Analizando las respuestas de ${nombre || 'tu pipeline'}…`, 'Calculando pérdida mensual estimada…', 'Identificando tu cuello de botella principal…', 'Preparando tu diagnóstico personalizado…']
  useEffect(() => { const iv = setInterval(() => setMsg(m => Math.min(m + 1, msgs.length - 1)), 900); return () => clearInterval(iv) }, [])
  return (
    <div style={{ textAlign: 'center', padding: '52px 24px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      <div style={{ width: 60, height: 60, margin: '0 auto 24px', border: `5px solid ${TEAL}30`, borderTopColor: TEAL, borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
      <p style={{ margin: '0 0 8px', fontWeight: 800, fontSize: 18, color: VERDE }}>Calculando tu diagnóstico</p>
      <p style={{ margin: 0, fontSize: 14, color: '#6b7280', animation: 'pulse 1.8s ease-in-out infinite', minHeight: 22 }}>{msgs[msg]}</p>
      <p style={{ margin: '14px 0 0', fontSize: 12, color: '#9ca3af' }}>No cierres esta ventana.</p>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────
export default function DiagnosticoInteractivo() {
  const [paso, setPaso] = useState<Paso>('form')
  const [pasoForm, setPasoForm] = useState(0)  // 0=nombre, 1-5=preguntas
  const [nombre, setNombre] = useState('')
  const [sel, setSel] = useState<Selecciones>({ q1val: null, q1label: '', q2: null, q2lost: 0, q3: null, q4: null, q5: null })
  const [email, setEmail] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [emailError, setEmailError] = useState('')
  const resultRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  function puedeAvanzar(): boolean {
    if (pasoForm === 0) return nombre.trim().length >= 2
    if (pasoForm === 1) return sel.q1val !== null
    if (pasoForm === 2) return sel.q2 !== null
    if (pasoForm === 3) return sel.q3 !== null
    if (pasoForm === 4) return sel.q4 !== null
    if (pasoForm === 5) return sel.q5 !== null
    return false
  }

  function avanzar() {
    if (!puedeAvanzar()) return
    if (pasoForm < 5) {
      setPasoForm(p => p + 1)
      setTimeout(() => cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60)
    } else {
      iniciarDiagnostico()
    }
  }

  function iniciarDiagnostico() {
    setPaso('cargando')
    setTimeout(() => {
      setPaso('resultados')
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    }, 3600)
  }

  async function desbloquear() {
    if (!email.includes('@')) { setEmailError('Ingresa un email válido.'); return }
    setEmailError('')
    setGuardando(true)
    const r = calcular(sel)
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, nombre: nombre.trim() || null, score: r.total, sub_scores: r.sub, cuello_de_botella: r.cuello, respuestas: sel }),
    })
    setGuardando(false)
    setPaso('desbloqueado')
  }

  const nombreTrimmed = nombre.trim()
  const nombrePos = nombreTrimmed ? `de ${nombreTrimmed}` : 'de tu pipeline'
  const r = paso === 'resultados' || paso === 'desbloqueado' ? calcular(sel) : null

  const card = (children: React.ReactNode) => (
    <div ref={cardRef} style={{ background: 'white', borderRadius: 20, padding: '32px 28px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', maxWidth: 620, margin: '0 auto' }}>
      {children}
    </div>
  )

  const nextBtn = (label: string, disabled: boolean) => (
    <button onClick={avanzar} disabled={disabled} style={{
      display: 'block', width: '100%', marginTop: 20, padding: '15px 24px', borderRadius: 12,
      border: 'none', background: disabled ? '#d1d5db' : VERDE, color: 'white',
      fontSize: 16, fontWeight: 800, cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
    }}>{label}</button>
  )

  return (
    <div id="diagnostico" style={{ maxWidth: 660, margin: '0 auto', padding: '0 20px' }}>

      {/* ── FORM ─────────────────────────────────────── */}
      {paso === 'form' && (
        <>
          {/* Step 0 — Nombre */}
          {pasoForm === 0 && card(
            <>
              <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Antes de empezar</p>
              <p style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 800, color: VERDE, lineHeight: 1.25 }}>¿Cómo te llamas?</p>
              <p style={{ margin: '0 0 16px', fontSize: 14, color: '#6b7280' }}>Usamos tu nombre para personalizar cada parte de tu diagnóstico.</p>
              <input
                type="text"
                placeholder="Tu nombre o como te dicen en el trabajo"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && avanzar()}
                autoFocus
                style={{
                  display: 'block', width: '100%', padding: '14px 16px', borderRadius: 12,
                  border: `2px solid ${nombreTrimmed.length >= 2 ? TEAL : '#e5e7eb'}`,
                  fontSize: 16, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                  fontFamily: 'inherit',
                }}
              />
              {nextBtn('Continuar →', nombreTrimmed.length < 2)}
            </>
          )}

          {/* Steps 1-5 — Preguntas */}
          {pasoForm >= 1 && card(
            <>
              <ProgressBar step={pasoForm} />

              {pasoForm === 1 && <>
                <p style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: VERDE }}>¿Cuánto es tu comisión promedio por venta cerrada?</p>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280' }}>Nos ayuda a calcular cuánto estás dejando en la mesa.</p>
                {COMISION_OPTS.map(o => <Opcion key={o.val} label={o.label} selected={sel.q1val === o.val} onClick={() => setSel(s => ({ ...s, q1val: o.val, q1label: o.label }))} />)}
              </>}

              {pasoForm === 2 && <>
                <p style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: VERDE }}>¿Cuántos prospectos pierdes al mes por no hacer seguimiento a tiempo?</p>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280' }}>Prospectos que tuvieron interés real pero se enfriaron.</p>
                {Q2_OPTS.map(o => <Opcion key={o.pts} label={o.label} selected={sel.q2 === o.pts} onClick={() => setSel(s => ({ ...s, q2: o.pts, q2lost: o.lost }))} />)}
              </>}

              {pasoForm === 3 && <>
                <p style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: VERDE }}>¿Tienes un sistema de seguimiento activo?</p>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280' }}>Algo que uses consistentemente, no "cuando me acuerdo".</p>
                {Q3_OPTS.map(o => <Opcion key={o.pts} label={o.label} selected={sel.q3 === o.pts} onClick={() => setSel(s => ({ ...s, q3: o.pts }))} />)}
              </>}

              {pasoForm === 4 && <>
                <p style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: VERDE }}>¿Sabes cuál es tu tasa de cierre actual?</p>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280' }}>El % de prospectos que se convierten en clientes.</p>
                {Q4_OPTS.map(o => <Opcion key={o.pts} label={o.label} selected={sel.q4 === o.pts} onClick={() => setSel(s => ({ ...s, q4: o.pts }))} />)}
              </>}

              {pasoForm === 5 && <>
                <p style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: VERDE }}>¿Cuánto tardas en preparar un mensaje de seguimiento?</p>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280' }}>Desde que decides escribir hasta que lo envías.</p>
                {Q5_OPTS.map(o => <Opcion key={o.pts} label={o.label} selected={sel.q5 === o.pts} onClick={() => setSel(s => ({ ...s, q5: o.pts }))} />)}
              </>}

              {nextBtn(
                pasoForm < 5 ? 'Siguiente →' : (nombreTrimmed ? `Ver el diagnóstico de ${nombreTrimmed} →` : 'Ver mi diagnóstico →'),
                !puedeAvanzar()
              )}
            </>
          )}
        </>
      )}

      {/* ── LOADING ───────────────────────────────────── */}
      {paso === 'cargando' && (
        <div ref={resultRef}>
          {card(<PantallaCarga nombre={nombreTrimmed} />)}
        </div>
      )}

      {/* ── RESULTS ──────────────────────────────────── */}
      {(paso === 'resultados' || paso === 'desbloqueado') && r && (
        <div ref={resultRef}>

          {/* Gauge */}
          <div style={{ background: 'white', borderRadius: 20, padding: '32px 28px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginBottom: 16 }}>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#9ca3af', textTransform: 'uppercase' }}>El diagnóstico {nombrePos}</span>
            </div>
            <GaugeSVG score={r.total} color={r.nivelColor} />
            <div style={{ marginTop: 24, borderTop: '1px solid #f3f4f6', paddingTop: 20 }}>
              <p style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Por categoría</p>
              <SubBar label="Seguimiento" score={r.sub.seguimiento} delay={0} />
              <SubBar label="Priorización" score={r.sub.priorizacion} delay={100} />
              <SubBar label="Preparación" score={r.sub.preparacion} delay={200} />
              <SubBar label="Reporte" score={r.sub.reporte} delay={300} />
            </div>
          </div>

          {/* Cuello */}
          <div style={{ background: `${r.nivelColor}12`, border: `2px solid ${r.nivelColor}40`, borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
            <p style={{ margin: '0 0 5px', fontSize: 11, fontWeight: 700, color: r.nivelColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {nombreTrimmed ? `${nombreTrimmed}, tu cuello de botella hoy es: ${r.cuelloLabel}` : `Tu cuello de botella: ${r.cuelloLabel}`}
            </p>
            <p style={{ margin: 0, fontSize: 14, color: VERDE, fontWeight: 600, lineHeight: 1.55 }}>{r.cuelloTexto}</p>
          </div>

          {/* Maxwell */}
          <div style={{ borderLeft: `4px solid ${AMARILLO}`, background: '#fffbeb', borderRadius: '0 12px 12px 0', padding: '14px 18px', marginBottom: 16 }}>
            <p style={{ margin: '0 0 5px', fontSize: 14, color: '#374151', lineHeight: 1.6, fontStyle: 'italic' }}>"Si llevas 10 años haciendo lo mismo, no tienes 10 años de experiencia. Tienes 1 año repetido 10 veces."</p>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#92400e' }}>— Atribuido a John C. Maxwell</p>
          </div>

          {/* ROI mensual */}
          {r.perdidaMensual > 0 && (
            <div style={{ background: '#fef2f2', border: '2px solid #fecaca', borderRadius: 14, padding: '16px 20px', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 26, flexShrink: 0 }}>💸</span>
              <div>
                <p style={{ margin: '0 0 3px', fontSize: 12, fontWeight: 700, color: '#dc2626' }}>Costo mensual estimado</p>
                <p style={{ margin: 0, fontSize: 14, color: '#7f1d1d', fontWeight: 600 }}>Estás dejando aprox. <strong>${r.perdidaMensual.toLocaleString('en-US')} USD</strong> en la mesa cada mes por prospectos que se enfrían.</p>
              </div>
            </div>
          )}

          {/* 90 días */}
          <div style={{ background: '#111827', borderRadius: 14, padding: '20px 20px', marginBottom: 16 }}>
            <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, color: AMARILLO, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              ⚠ Lo que pasa en 90 días si {nombreTrimmed || 'no'} no cambia nada
            </p>
            {calcular90dias(sel, r.perdidaMensual).map((linea, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: i < 2 ? 10 : 0 }}>
                <span style={{ color: AMARILLO, flexShrink: 0, marginTop: 2 }}>→</span>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>{linea}</p>
              </div>
            ))}
          </div>

          {/* Fortalezas */}
          <div style={{ background: 'white', borderRadius: 14, padding: '20px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 16 }}>
            <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Lo que ya haces bien</p>
            {(paso === 'desbloqueado' ? r.fortalezas : r.fortalezas.slice(0, 1)).map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ color: '#10b981', fontSize: 16, marginTop: 1 }}>✓</span>
                <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{f.texto}</p>
              </div>
            ))}
          </div>

          {/* Fricciones */}
          <div style={{ background: 'white', borderRadius: 14, padding: '20px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 16 }}>
            <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Dónde se te van las comisiones</p>
            {(paso === 'desbloqueado' ? r.debilidades : r.debilidades.slice(0, 1)).map((d, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ color: '#ef4444', fontSize: 16, marginTop: 1 }}>✗</span>
                <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{d.texto}</p>
              </div>
            ))}
          </div>

          {/* PAYWALL */}
          {paso === 'resultados' && (
            <div style={{ background: VERDE, borderRadius: 18, padding: '28px 24px', textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>🔒</div>
              <p style={{ margin: '0 0 6px', fontWeight: 800, fontSize: 19, color: 'white' }}>Desbloquear el reporte {nombrePos}</p>
              <p style={{ margin: '0 0 18px', fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                Incluye las {r.debilidades.length - 1} áreas de mejora restantes, 3 acciones concretas para esta semana y cómo CBC las resuelve por ti.
              </p>
              <input type="email" placeholder="tu@email.com" value={email}
                onChange={e => { setEmail(e.target.value); setEmailError('') }}
                onKeyDown={e => e.key === 'Enter' && desbloquear()}
                style={{ display: 'block', width: '100%', padding: '13px 14px', borderRadius: 10, border: emailError ? '2px solid #fca5a5' : '2px solid transparent', fontSize: 15, marginBottom: emailError ? 6 : 10, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
              {emailError && <p style={{ color: '#fca5a5', fontSize: 12, margin: '0 0 8px', textAlign: 'left' }}>{emailError}</p>}
              <button onClick={desbloquear} disabled={guardando}
                style={{ display: 'block', width: '100%', padding: '14px', borderRadius: 10, border: 'none', background: TEAL, color: VERDE, fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
                {guardando ? 'Guardando...' : 'Desbloquear mi reporte completo →'}
              </button>
              <p style={{ margin: '8px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Sin spam. Solo tu reporte.</p>
            </div>
          )}

          {/* DESBLOQUEADO */}
          {paso === 'desbloqueado' && (
            <>
              <div style={{ background: 'white', borderRadius: 14, padding: '20px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 16 }}>
                <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Lo que deberías cambiar esta semana</p>
                {r.recomendaciones.map((rec, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                    <span style={{ background: VERDE, color: 'white', borderRadius: '50%', width: 20, height: 20, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                    <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{rec}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: `linear-gradient(135deg, ${VERDE} 0%, #2d6b62 100%)`, borderRadius: 18, padding: '28px 24px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: TEAL, textTransform: 'uppercase' }}>{nombreTrimmed ? `Hecho para ${nombreTrimmed}` : 'Hecho para ti'}</p>
                <p style={{ margin: '0 0 8px', fontWeight: 800, fontSize: 20, color: 'white', lineHeight: 1.3 }}>CBC resuelve exactamente lo que acabas de diagnosticar</p>
                <p style={{ margin: '0 0 20px', fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>Semáforo automático, seguimientos programados, mensajes listos y Reporte al Jefe™. 7 días gratis. Sin tarjeta.</p>
                <a href="/empezar" style={{ display: 'inline-block', padding: '14px 30px', borderRadius: 12, background: TEAL, color: VERDE, fontWeight: 800, fontSize: 16, textDecoration: 'none' }}>
                  Empezar mi prueba gratis →
                </a>
                <p style={{ margin: '10px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>$9.90 USD/mes después del trial. Cancelas cuando quieras.</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
