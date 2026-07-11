'use client'

import { useState, useEffect, useRef } from 'react'
import {
  type Selecciones,
  calcular, calcular90dias,
  COMISION_OPTS, Q2_OPTS, Q3_OPTS, Q4_OPTS, Q5_OPTS,
} from '@/lib/diagnostico'

const VERDE = '#1A4A44'
const TEAL = '#4ECDC4'
const AMARILLO = '#f5c400'

// ── Gauge ─────────────────────────────────────────────────
function GaugeSVG({ score, color }: { score: number; color: string }) {
  const [anim, setAnim] = useState(0)
  useEffect(() => { const t = setTimeout(() => setAnim(score), 150); return () => clearTimeout(t) }, [score])
  const rotation = (anim / 100) * 180 - 90
  return (
    <div style={{ textAlign: 'center' }}>
      <svg viewBox="0 0 200 110" width="220" height="115" style={{ overflow: 'visible', display: 'block', margin: '0 auto' }}>
        <path d="M 22 95 A 78 78 0 0 0 178 95" fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round" />
        <path d="M 22 95 A 78 78 0 0 0 76 21"  fill="none" stroke="#ef4444" strokeWidth="14" strokeLinecap="butt" opacity="0.5" />
        <path d="M 76 21 A 78 78 0 0 0 135 26" fill="none" stroke="#f59e0b" strokeWidth="14" strokeLinecap="butt" opacity="0.5" />
        <path d="M 135 26 A 78 78 0 0 0 178 95" fill="none" stroke="#10b981" strokeWidth="14" strokeLinecap="butt" opacity="0.5" />
        <text x="16"  y="110" textAnchor="middle" fontSize="8" fill="#9ca3af">0</text>
        <text x="100" y="12"  textAnchor="middle" fontSize="8" fill="#9ca3af">50</text>
        <text x="184" y="110" textAnchor="middle" fontSize="8" fill="#9ca3af">100</text>
        <g style={{ transformOrigin: '100px 95px', transform: `rotate(${rotation}deg)`, transition: 'transform 1.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <line x1="100" y1="95" x2="100" y2="23" stroke={VERDE} strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="100,17 97,28 103,28" fill={VERDE} />
        </g>
        <circle cx="100" cy="95" r="9" fill={VERDE} />
        <circle cx="100" cy="95" r="4" fill="white" />
      </svg>
      <div style={{ marginTop: 4 }}>
        <div style={{ fontSize: 52, fontWeight: 900, color: VERDE, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>/100</div>
        <div style={{ fontSize: 14, fontWeight: 700, color, marginTop: 6 }}>
          {score < 40 ? 'Sistema en riesgo' : score < 65 ? 'Hay margen de mejora' : 'Sistema sólido'}
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
        <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: c }}>{score}/10</span>
      </div>
      <div style={{ background: '#f3f4f6', borderRadius: 6, height: 7, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 6, background: c, width: `${w * 10}%`, transition: `width 1s cubic-bezier(0.34,1.56,0.64,1) ${delay * 0.001}s` }} />
      </div>
    </div>
  )
}

// ── Opcion ────────────────────────────────────────────────
function Opcion({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{
      display: 'block', width: '100%', textAlign: 'left', padding: '14px 48px 14px 16px',
      borderRadius: 10,
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

// ── Page ──────────────────────────────────────────────────
type Fase = 'form' | 'cargando' | 'resultado' | 'desbloqueado'

export default function DiagnosticoPage() {
  const [fase, setFase] = useState<Fase>('form')
  const [pasoForm, setPasoForm] = useState(0)   // 0 = nombre, 1-5 = preguntas
  const [nombre, setNombre] = useState('')
  const [sel, setSel] = useState<Selecciones>({ q1val: null, q1label: '', q2: null, q2lost: 0, q3: null, q4: null, q5: null })
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [msgIdx, setMsgIdx] = useState(0)
  const cardRef    = useRef<HTMLDivElement>(null)
  const resultRef  = useRef<HTMLDivElement>(null)

  const nombreTrimmed = nombre.trim()

  // ── ¿Puede avanzar? ───────────────────────────────────
  function puedeAvanzar() {
    if (pasoForm === 0) return nombreTrimmed.length >= 2
    if (pasoForm === 1) return sel.q1val !== null
    if (pasoForm === 2) return sel.q2   !== null
    if (pasoForm === 3) return sel.q3   !== null
    if (pasoForm === 4) return sel.q4   !== null
    if (pasoForm === 5) return sel.q5   !== null
    return false
  }

  // ── Avanzar formulario ────────────────────────────────
  function avanzar() {
    if (!puedeAvanzar()) return
    if (pasoForm < 5) {
      setPasoForm(p => p + 1)
      setTimeout(() => cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60)
      return
    }
    // Último paso → iniciar diagnóstico
    setFase('cargando')
    let i = 0
    const iv = setInterval(() => { i++; setMsgIdx(Math.min(i, 3)) }, 900)
    setTimeout(() => {
      clearInterval(iv)
      setFase('resultado')
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    }, 3800)
  }

  // ── Desbloquear email ─────────────────────────────────
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
        sub_scores: r.sub,
        cuello_de_botella: r.cuello,
        respuestas: sel,
      }),
    })
    setGuardando(false)
    setFase('desbloqueado')
  }

  const r = (fase === 'resultado' || fase === 'desbloqueado') ? calcular(sel) : null
  const bgImg = 'url(/bg-diagnostico.jpg)'

  // ── Barra de progreso ─────────────────────────────────
  // pasoForm 0-5 → "Pregunta 1 de 6" … "Pregunta 6 de 6"
  const progreso = pasoForm + 1
  const progressBar = (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Pregunta {progreso} de 6
        </span>
        <span style={{ fontSize: 12, fontWeight: 800, color: TEAL }}>{Math.round((progreso / 6) * 100)}%</span>
      </div>
      <div style={{ background: '#e5e7eb', borderRadius: 100, height: 5 }}>
        <div style={{ width: `${(progreso / 6) * 100}%`, height: '100%', background: TEAL, borderRadius: 100, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )

  const card = (children: React.ReactNode) => (
    <div ref={cardRef} style={{
      background: 'white', borderRadius: 20, padding: '28px 24px',
      boxShadow: '0 12px 48px rgba(0,0,0,0.32)', maxWidth: 560, margin: '0 auto',
    }}>
      {children}
    </div>
  )

  const nextBtn = (label: string) => (
    <button onClick={avanzar} disabled={!puedeAvanzar()} style={{
      display: 'block', width: '100%', marginTop: 18, padding: '15px 24px', borderRadius: 12,
      border: 'none',
      background: puedeAvanzar() ? TEAL : '#d1d5db',
      color: puedeAvanzar() ? VERDE : '#9ca3af',
      fontSize: 16, fontWeight: 800, cursor: puedeAvanzar() ? 'pointer' : 'not-allowed',
      transition: 'background 0.2s, color 0.2s',
    }}>{label}</button>
  )

  // ── MENSAJES SPINNER ──────────────────────────────────
  const MSGS = [
    `Analizando las respuestas de ${nombreTrimmed}…`,
    'Calculando pérdida mensual estimada…',
    'Identificando tu cuello de botella principal…',
    'Preparando tu diagnóstico personalizado…',
  ]

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'system-ui,-apple-system,sans-serif', backgroundImage: `linear-gradient(rgba(7,26,23,0.75),rgba(7,26,23,0.82)), ${bgImg}`, backgroundSize: 'cover', backgroundPosition: 'center top', backgroundAttachment: 'fixed' }}>
      <style>{`
        :root { color-scheme: light; }
        * { box-sizing: border-box; }
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:none; } }
      `}</style>

      {/* Logo */}
      <div style={{ padding: '20px 24px', textAlign: 'center' }}>
        <span style={{ fontWeight: 900, fontSize: 22, color: 'white', letterSpacing: '-0.02em' }}>CBC™</span>
      </div>

      {/* Cinta de alerta */}
      <div>
        <div style={{ height: 28, backgroundImage: 'repeating-linear-gradient(135deg,#f5c400 0px,#f5c400 16px,#111 16px,#111 32px)' }} />
        <div style={{ background: '#111', padding: '16px 24px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 'clamp(15px,2.2vw,20px)', fontWeight: 800, color: '#ef4444', lineHeight: 1.35, letterSpacing: '-0.01em' }}>
            🚨 2 minutos. Te voy a decir la verdad de quién te roba tus comisiones — la que nadie más te ha dicho.
          </p>
        </div>
        <div style={{ height: 28, backgroundImage: 'repeating-linear-gradient(135deg,#f5c400 0px,#f5c400 16px,#111 16px,#111 32px)' }} />
      </div>

      {/* Headline */}
      <div style={{ textAlign: 'center', padding: '36px 24px 28px', maxWidth: 680, margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 14px', fontSize: 'clamp(26px,5.5vw,54px)', fontWeight: 900, color: 'white', lineHeight: 1.06, letterSpacing: '-0.025em' }}>
          ¿Qué va a pasar en 90 días<br />
          <span style={{ color: AMARILLO }}>si no cambias nada?</span>
        </h1>
        <p style={{ margin: 0, fontSize: 'clamp(14px,1.8vw,17px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
          Responde con lo que es real, no con lo que quisieras que fuera. Nadie más tiene acceso a estas respuestas. No te traiciones.
        </p>
      </div>

      {/* Contexto de la auditoría */}
      {fase === 'form' && (
        <div style={{ padding: '0 24px 28px', maxWidth: 560, margin: '0 auto' }}>
          {/* Bloque de contexto */}
          <div style={{ background: 'rgba(78,205,196,0.08)', border: '1px solid rgba(78,205,196,0.28)', borderRadius: 16, padding: '24px' }}>
            <p style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800, color: 'white', lineHeight: 1.35 }}>
              Esta auditoría es sobre TU dinero — no sobre técnica de ventas.
            </p>
            <p style={{ margin: '0 0 14px', fontSize: 16, color: 'rgba(255,255,255,0.82)', lineHeight: 1.75 }}>
              Buscas prospectos. Presentas propuestas. Trabajas duro.<br />
              Y aun así, gran parte de esa comisión se te escapa — no por falta de talento, sino por seguimiento que nunca llegó a tiempo.
            </p>
            <p style={{ margin: '0 0 14px', fontSize: 16, color: 'rgba(255,255,255,0.82)', lineHeight: 1.75 }}>
              No es tu culpa. Entre CRM, pipeline, reportes al jefe... lo que realmente te paga el mes se pierde de vista.
            </p>
            <p style={{ margin: '0 0 14px', fontSize: 16, color: 'rgba(255,255,255,0.82)', lineHeight: 1.75 }}>
              Sé honesto en tus respuestas. Nadie más las va a ver.
            </p>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TEAL, lineHeight: 1.6 }}>
              No te voy a cobrar nada. Solo quiero abrirte los ojos.
            </p>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          FORMULARIO
      ════════════════════════════════════════ */}
      {fase === 'form' && (
        <div style={{ padding: '0 16px 64px' }}>

          {/* Pregunta 0 — Nombre */}
          {pasoForm === 0 && card(
            <>
              {progressBar}
              <p style={{ margin: '0 0 6px', fontSize: 19, fontWeight: 800, color: VERDE, lineHeight: 1.25 }}>¿Cómo te llamas?</p>
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
                  fontSize: 16, outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit',
                }}
              />
              {nextBtn('Continuar →')}
            </>
          )}

          {/* Preguntas 1-5 */}
          {pasoForm >= 1 && card(
            <>
              {progressBar}

              {pasoForm === 1 && <>
                <p style={{ margin: '0 0 4px', fontSize: 19, fontWeight: 800, color: VERDE, lineHeight: 1.3 }}>¿Cuánto es tu comisión promedio por venta cerrada?</p>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280' }}>Nos ayuda a calcular cuánto estás dejando en la mesa.</p>
                {COMISION_OPTS.map(o => <Opcion key={o.val} label={o.label} selected={sel.q1val === o.val} onClick={() => setSel(s => ({ ...s, q1val: o.val, q1label: o.label }))} />)}
              </>}

              {pasoForm === 2 && <>
                <p style={{ margin: '0 0 4px', fontSize: 19, fontWeight: 800, color: VERDE, lineHeight: 1.3 }}>¿Cuántos prospectos pierdes al mes por no hacer seguimiento a tiempo?</p>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280' }}>Prospectos que tuvieron interés real pero se enfriaron.</p>
                {Q2_OPTS.map(o => <Opcion key={o.pts} label={o.label} selected={sel.q2 === o.pts} onClick={() => setSel(s => ({ ...s, q2: o.pts, q2lost: o.lost }))} />)}
              </>}

              {pasoForm === 3 && <>
                <p style={{ margin: '0 0 4px', fontSize: 19, fontWeight: 800, color: VERDE, lineHeight: 1.3 }}>¿Tienes un sistema de seguimiento activo?</p>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280' }}>Algo que uses consistentemente, no "cuando me acuerdo".</p>
                {Q3_OPTS.map(o => <Opcion key={o.pts} label={o.label} selected={sel.q3 === o.pts} onClick={() => setSel(s => ({ ...s, q3: o.pts }))} />)}
              </>}

              {pasoForm === 4 && <>
                <p style={{ margin: '0 0 4px', fontSize: 19, fontWeight: 800, color: VERDE, lineHeight: 1.3 }}>¿Sabes cuál es tu tasa de cierre actual?</p>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280' }}>El % de prospectos que se convierten en clientes.</p>
                {Q4_OPTS.map(o => <Opcion key={o.pts} label={o.label} selected={sel.q4 === o.pts} onClick={() => setSel(s => ({ ...s, q4: o.pts }))} />)}
              </>}

              {pasoForm === 5 && <>
                <p style={{ margin: '0 0 4px', fontSize: 19, fontWeight: 800, color: VERDE, lineHeight: 1.3 }}>¿Cuánto tardas en preparar un mensaje de seguimiento?</p>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280' }}>Desde que decides escribir hasta que lo envías.</p>
                {Q5_OPTS.map(o => <Opcion key={o.pts} label={o.label} selected={sel.q5 === o.pts} onClick={() => setSel(s => ({ ...s, q5: o.pts }))} />)}
              </>}

              {nextBtn(pasoForm < 5 ? 'Siguiente →' : `Ver mi diagnóstico →`)}
            </>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════
          SPINNER / CARGA
      ════════════════════════════════════════ */}
      {fase === 'cargando' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px 80px' }}>
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <div style={{ width: 64, height: 64, margin: '0 auto 28px', border: `5px solid ${TEAL}30`, borderTopColor: TEAL, borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
            <p style={{ margin: '0 0 8px', fontWeight: 800, fontSize: 20, color: 'white' }}>
              Analizando el pipeline de {nombreTrimmed}
            </p>
            <p style={{ margin: '0 0 6px', fontSize: 15, color: 'rgba(255,255,255,0.5)', animation: 'pulse 1.8s ease-in-out infinite', minHeight: 24 }}>
              {MSGS[msgIdx]}
            </p>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>
              Estamos procesando tus respuestas reales…<br />Esto puede tardar unos segundos. No cierres esta ventana.
            </p>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          RESULTADO
      ════════════════════════════════════════ */}
      {(fase === 'resultado' || fase === 'desbloqueado') && r && (
        <div ref={resultRef} style={{ padding: '0 16px 80px', animation: 'fadeUp 0.5s ease both' }}>
          <div style={{ maxWidth: 580, margin: '0 auto' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', padding: '32px 0 20px' }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>
                El diagnóstico de {nombreTrimmed}
              </p>
              <h2 style={{ margin: 0, fontSize: 'clamp(22px,4vw,36px)', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>
                EL DIAGNÓSTICO DE {nombreTrimmed.toUpperCase()}
              </h2>
            </div>

            {/* Gauge */}
            <div style={{ background: 'white', borderRadius: 20, padding: '28px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', marginBottom: 14 }}>
              <GaugeSVG score={r.total} color={r.nivelColor} />
              <div style={{ marginTop: 20, borderTop: '1px solid #f3f4f6', paddingTop: 18 }}>
                <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Por categoría</p>
                <SubBar label="Seguimiento" score={r.sub.seguimiento} delay={0}   />
                <SubBar label="Priorización" score={r.sub.priorizacion} delay={100} />
                <SubBar label="Preparación"  score={r.sub.preparacion}  delay={200} />
                <SubBar label="Reporte"      score={r.sub.reporte}      delay={300} />
              </div>
            </div>

            {/* Cuello de botella */}
            <div style={{ background: `${r.nivelColor}15`, border: `2px solid ${r.nivelColor}45`, borderRadius: 14, padding: '16px 18px', marginBottom: 14 }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: r.nivelColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {nombreTrimmed}, tu cuello de botella hoy es: {r.cuelloLabel}
              </p>
              <p style={{ margin: 0, fontSize: 14, color: VERDE, fontWeight: 600, lineHeight: 1.55 }}>{r.cuelloTexto}</p>
            </div>

            {/* 90 días */}
            <div style={{ background: '#111827', borderRadius: 14, padding: '18px 18px', marginBottom: 14 }}>
              <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: AMARILLO, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                ⚠ Lo que pasa en 90 días si {nombreTrimmed} no cambia nada
              </p>
              {calcular90dias(sel, r.perdidaMensual).map((linea, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: i < 2 ? 10 : 0 }}>
                  <span style={{ color: AMARILLO, flexShrink: 0, marginTop: 2 }}>→</span>
                  <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>{linea}</p>
                </div>
              ))}
            </div>

            {/* Dos columnas: fortalezas / fricciones */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              {/* Fortalezas */}
              <div style={{ background: 'white', borderRadius: 14, padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }}>
                <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Lo que {nombreTrimmed} ya hace bien
                </p>
                {r.fortalezas.slice(0, 2).map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                    <span style={{ color: '#10b981', fontSize: 14, marginTop: 1 }}>✓</span>
                    <p style={{ margin: 0, fontSize: 12, color: '#374151', lineHeight: 1.55 }}>{f.texto}</p>
                  </div>
                ))}
                {r.fortalezas.length > 2 && (
                  <p style={{ margin: '6px 0 0', fontSize: 11, color: '#9ca3af', fontStyle: 'italic' }}>
                    +{r.fortalezas.length - 2} más en el reporte completo
                  </p>
                )}
              </div>
              {/* Fricciones */}
              <div style={{ background: 'white', borderRadius: 14, padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }}>
                <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Dónde se le van las comisiones a {nombreTrimmed}
                </p>
                {r.debilidades.slice(0, 2).map((d, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                    <span style={{ color: '#ef4444', fontSize: 14, marginTop: 1 }}>✗</span>
                    <p style={{ margin: 0, fontSize: 12, color: '#374151', lineHeight: 1.55 }}>{d.texto}</p>
                  </div>
                ))}
                {r.debilidades.length > 2 && (
                  <p style={{ margin: '6px 0 0', fontSize: 11, color: '#9ca3af', fontStyle: 'italic' }}>
                    +{r.debilidades.length - 2} más en el reporte completo
                  </p>
                )}
              </div>
            </div>

            {/* Maxwell */}
            <div style={{ borderLeft: `4px solid ${AMARILLO}`, background: '#fffbeb', borderRadius: '0 12px 12px 0', padding: '14px 18px', marginBottom: 14 }}>
              <p style={{ margin: '0 0 5px', fontSize: 14, color: '#374151', lineHeight: 1.6, fontStyle: 'italic' }}>
                "Si llevas 10 años haciendo lo mismo, no tienes 10 años de experiencia. Tienes 1 año repetido 10 veces."
              </p>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#92400e' }}>— Atribuido a John C. Maxwell</p>
            </div>

            {/* ── PAYWALL ── */}
            {fase === 'resultado' && (
              <div style={{ background: VERDE, borderRadius: 18, padding: '28px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 30, marginBottom: 8 }}>🔒</div>
                <h3 style={{ margin: '0 0 8px', fontWeight: 800, fontSize: 21, color: 'white', lineHeight: 1.3 }}>
                  Desbloquea el reporte completo de {nombreTrimmed}
                </h3>
                <p style={{ margin: '0 0 20px', fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
                  Incluye las {r.debilidades.length - 2} áreas de mejora restantes, 3 acciones concretas para esta semana y el camino exacto para cerrar más con lo que ya tienes.
                </p>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError('') }}
                  onKeyDown={e => e.key === 'Enter' && desbloquear()}
                  style={{ display: 'block', width: '100%', padding: '14px', borderRadius: 10, border: emailError ? '2px solid #fca5a5' : '2px solid transparent', fontSize: 15, marginBottom: emailError ? 6 : 12, outline: 'none', fontFamily: 'inherit' }}
                />
                {emailError && <p style={{ color: '#fca5a5', fontSize: 12, margin: '0 0 10px', textAlign: 'left' }}>{emailError}</p>}
                <button
                  onClick={desbloquear}
                  disabled={guardando}
                  style={{ display: 'block', width: '100%', padding: '15px', borderRadius: 10, border: 'none', background: TEAL, color: VERDE, fontWeight: 800, fontSize: 16, cursor: guardando ? 'not-allowed' : 'pointer' }}
                >
                  {guardando ? 'Guardando...' : 'Desbloquear mi reporte →'}
                </button>
                <p style={{ margin: '10px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                  Sin tarjeta. Sin pago. Solo tu reporte.
                </p>
              </div>
            )}

            {/* ── GRACIAS (desbloqueado) ── */}
            {fase === 'desbloqueado' && (
              <div style={{ background: 'white', borderRadius: 18, padding: '32px 28px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.2)', animation: 'fadeUp 0.5s ease both' }}>
                <div style={{ fontSize: 40, marginBottom: 14 }}>✅</div>
                <h3 style={{ margin: '0 0 10px', fontWeight: 800, fontSize: 22, color: VERDE }}>
                  Gracias {nombreTrimmed} — revisa tu email en los próximos minutos.
                </h3>
                <p style={{ margin: 0, fontSize: 15, color: '#6b7280', lineHeight: 1.65 }}>
                  Te enviamos el reporte completo con tus resultados y los próximos pasos recomendados para tu pipeline.
                </p>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  )
}
