'use client'

import { useState, useEffect, useRef } from 'react'
import {
  type Selecciones,
  calcular, calcular90dias,
  SUENO_DATA,
} from '@/lib/diagnostico'

const VERDE = '#1A4A44'
const TEAL = '#4ECDC4'
const AMARILLO = '#f5c400'
const ROJO = '#ef4444'

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

// ── TogBtn (binary choice) ────────────────────────────────
function TogBtn({ label, selected, variant, onClick }: { label: string; selected: boolean; variant: 'yes' | 'no'; onClick: () => void }) {
  const selColor = variant === 'yes' ? '#10b981' : ROJO
  const selBg    = variant === 'yes' ? '#f0fdf4' : '#fef2f2'
  return (
    <button type="button" onClick={onClick} style={{
      flex: 1, padding: '16px 12px', borderRadius: 12,
      border: selected ? `2px solid ${selColor}` : '2px solid #e5e7eb',
      background: selected ? selBg : 'white',
      color: selected ? selColor : '#6b7280',
      fontWeight: selected ? 700 : 500, fontSize: 14,
      cursor: 'pointer', transition: 'all 0.15s', lineHeight: 1.4, textAlign: 'center',
    }}>
      {label}
    </button>
  )
}

// ── DreamBtn ──────────────────────────────────────────────
function DreamBtn({ icon, label, selected, onClick }: { icon: string; label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '14px',
      borderRadius: 12,
      border: selected ? `2px solid ${AMARILLO}` : '2px solid #e5e7eb',
      background: selected ? '#fffbeb' : 'white',
      color: selected ? '#92400e' : '#6b7280',
      fontWeight: selected ? 700 : 500, fontSize: 14,
      cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
    }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────
type Fase = 'form' | 'cargando' | 'resultado' | 'desbloqueado'

export default function DiagnosticoPage() {
  const [fase, setFase] = useState<Fase>('form')
  const [pasoForm, setPasoForm] = useState(0)   // 0 = nombre, 1-5 = preguntas
  const [nombre, setNombre] = useState('')
  const [sel, setSel] = useState<Selecciones>({ v1: null, v2: null, q3: null, q4: null, sueno: null })
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [msgIdx, setMsgIdx] = useState(0)
  const cardRef   = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const nombreTrimmed = nombre.trim()

  // ── ¿Puede avanzar? ───────────────────────────────────
  function puedeAvanzar() {
    if (pasoForm === 0) return nombreTrimmed.length >= 2
    if (pasoForm === 1) return sel.v1 !== null && sel.v1 > 0
    if (pasoForm === 2) return sel.v2 !== null
    if (pasoForm === 3) return sel.q3 !== null
    if (pasoForm === 4) return sel.q4 !== null
    if (pasoForm === 5) return sel.sueno !== null
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
        perdida_mensual: r.perdidaMensual,
        cuello_de_botella: r.cuello,
        respuestas: sel,
      }),
    })
    setGuardando(false)
    setFase('desbloqueado')
  }

  const r = (fase === 'resultado' || fase === 'desbloqueado') ? calcular(sel) : null
  const bgImg = 'url(/bg-diagnostico.jpg)'

  const progreso = pasoForm + 1
  const progressBar = (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
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

  const MSGS = [
    `Analizando las respuestas de ${nombreTrimmed}…`,
    'Calculando pérdida mensual estimada…',
    'Identificando tu cuello de botella principal…',
    'Preparando tu diagnóstico personalizado…',
  ]

  const fmt = (n: number) => '$' + n.toLocaleString('en-US')

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'system-ui,-apple-system,sans-serif', backgroundImage: `linear-gradient(rgba(7,26,23,0.75),rgba(7,26,23,0.82)), ${bgImg}`, backgroundSize: 'cover', backgroundPosition: 'center top', backgroundAttachment: 'fixed' }}>
      <style>{`
        :root { color-scheme: light; }
        * { box-sizing: border-box; }
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:none; } }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      {/* Logo */}
      <div style={{ padding: '20px 24px', textAlign: 'center' }}>
        <span style={{ fontWeight: 900, fontSize: 22, color: 'white', letterSpacing: '-0.02em' }}>CBC™</span>
      </div>

      {/* Cinta de alerta */}
      <div>
        <div style={{ height: 28, backgroundImage: 'repeating-linear-gradient(135deg,#f5c400 0px,#f5c400 16px,#111 16px,#111 32px)' }} />
        <div style={{ background: '#111', padding: '18px 24px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px', fontSize: 'clamp(20px,3.5vw,30px)', fontWeight: 900, color: 'white', letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1 }}>
            ⚠ EN 2 MINUTOS
          </p>
          <p style={{ margin: 0, fontSize: 'clamp(13px,1.8vw,17px)', fontWeight: 700, color: '#ff2c2c', lineHeight: 1.4 }}>
            vas a ver algo que duele: te están robando comisiones cada mes — y hasta ahora lo habías ignorado.
          </p>
        </div>
        <div style={{ height: 28, backgroundImage: 'repeating-linear-gradient(135deg,#f5c400 0px,#f5c400 16px,#111 16px,#111 32px)' }} />
      </div>

      {/* Headline */}
      <div style={{ textAlign: 'center', padding: '36px 24px 28px', maxWidth: 680, margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 14px', fontSize: 'clamp(26px,5.5vw,54px)', fontWeight: 900, color: 'white', lineHeight: 1.06, letterSpacing: '-0.025em' }}>
          Esta auditoría es sobre <span style={{ color: AMARILLO }}>TU dinero</span> —<br />no sobre técnica de ventas.
        </h1>
        <p style={{ margin: 0, fontSize: 'clamp(14px,1.8vw,17px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
          Responde con lo que es real, no con lo que quisieras que fuera. Nadie más tiene acceso a estas respuestas.
        </p>
      </div>

      {/* Bloque de contexto */}
      {fase === 'form' && (
        <div style={{ padding: '0 24px 28px', maxWidth: 560, margin: '0 auto' }}>
          <div style={{ background: 'rgba(78,205,196,0.08)', border: '1px solid rgba(78,205,196,0.28)', borderRadius: 16, padding: '24px' }}>
            <p style={{ margin: '0 0 14px', fontSize: 16, color: 'rgba(255,255,255,0.82)', lineHeight: 1.75 }}>
              Buscas prospectos. Presentas propuestas. Trabajas duro.<br />
              Y aun así, una parte de esa comisión se evapora cada mes — no por falta de talento, sino por seguimiento que llegó tarde o no llegó.
            </p>
            <p style={{ margin: '0 0 14px', fontSize: 16, color: 'rgba(255,255,255,0.82)', lineHeight: 1.75 }}>
              Este diagnóstico te muestra exactamente dónde se está yendo tu dinero.
            </p>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TEAL, lineHeight: 1.6 }}>
              Solo tú ves esto. Sé honesto — el resultado depende de eso.
            </p>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          FORMULARIO
      ════════════════════════════════════════ */}
      {fase === 'form' && (
        <div style={{ padding: '0 16px 64px' }}>

          {/* Paso 0 — Nombre */}
          {pasoForm === 0 && card(
            <>
              {progressBar}
              <p style={{ margin: '0 0 6px', fontSize: 19, fontWeight: 800, color: VERDE, lineHeight: 1.25 }}>¿Listo para comenzar? 👋 Empecemos por tu nombre.</p>
              <p style={{ margin: '0 0 16px', fontSize: 14, color: '#6b7280' }}>Lo usamos para personalizar cada parte de tu diagnóstico — nada más.</p>
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

          {/* Pasos 1-5 */}
          {pasoForm >= 1 && card(
            <>
              {progressBar}

              {/* Q1 — ¿Cuánto vale cada venta? */}
              {pasoForm === 1 && <>
                <p style={{ margin: '0 0 4px', fontSize: 19, fontWeight: 800, color: VERDE, lineHeight: 1.3 }}>¿Cuánto vale cada venta que cierras?</p>
                <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>¿Cuánto dinero entra a tu bolsillo cuando cierras una venta? Pon el número real — comisión, margen, lo que sea que cobras tú.</p>
                <div style={{ display: 'flex', alignItems: 'center', border: `2px solid ${(sel.v1 ?? 0) > 0 ? TEAL : '#e5e7eb'}`, borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                  <span style={{ padding: '14px 14px 14px 16px', fontSize: 22, fontWeight: 700, color: '#9ca3af', background: '#f9fafb', borderRight: '1px solid #e5e7eb' }}>$</span>
                  <input
                    type="number" min={0} placeholder="0" value={sel.v1 ?? ''}
                    onChange={e => { const v = Number(e.target.value); setSel(s => ({ ...s, v1: v > 0 ? v : null })) }}
                    onKeyDown={e => e.key === 'Enter' && avanzar()}
                    autoFocus
                    style={{ flex: 1, padding: '14px 16px', fontSize: 24, fontWeight: 700, color: VERDE, border: 'none', outline: 'none', fontFamily: 'inherit', background: 'white' }}
                  />
                  <span style={{ padding: '14px 16px 14px 0', fontSize: 13, fontWeight: 600, color: '#9ca3af' }}>USD</span>
                </div>
                <p style={{ margin: '8px 0 0', fontSize: 12, color: '#9ca3af' }}>Escribe el número exacto — solo tú lo ves.</p>
              </>}

              {/* Q2 — Prospectos >7 días sin seguimiento */}
              {pasoForm === 2 && <>
                <p style={{ margin: '0 0 4px', fontSize: 19, fontWeight: 800, color: VERDE, lineHeight: 1.3 }}>¿Cuántos prospectos llevan más de 7 días sin seguimiento?</p>
                <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>Los que están en tu lista esperando. Ahora mismo. Sé honesto.</p>
                <div style={{ display: 'flex', alignItems: 'center', border: `2px solid ${sel.v2 !== null ? TEAL : '#e5e7eb'}`, borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                  <span style={{ padding: '14px 14px 14px 16px', fontSize: 18, fontWeight: 700, color: '#9ca3af', background: '#f9fafb', borderRight: '1px solid #e5e7eb' }}>#</span>
                  <input
                    type="number" min={0} placeholder="0" value={sel.v2 ?? ''}
                    onChange={e => { const v = Number(e.target.value); setSel(s => ({ ...s, v2: e.target.value === '' ? null : v >= 0 ? v : 0 })) }}
                    onKeyDown={e => e.key === 'Enter' && avanzar()}
                    autoFocus
                    style={{ flex: 1, padding: '14px 16px', fontSize: 28, fontWeight: 700, color: VERDE, border: 'none', outline: 'none', fontFamily: 'inherit', background: 'white' }}
                  />
                  <span style={{ padding: '14px 16px 14px 0', fontSize: 13, fontWeight: 600, color: '#9ca3af' }}>prospectos</span>
                </div>
                <p style={{ margin: '8px 0 0', fontSize: 12, color: '#9ca3af' }}>Si no recuerdas exactamente, pon el número más honesto que puedas.</p>
              </>}

              {/* Q3 — Protocolo para "lo pienso" */}
              {pasoForm === 3 && <>
                <p style={{ margin: '0 0 4px', fontSize: 19, fontWeight: 800, color: VERDE, lineHeight: 1.3 }}>Cuando un cliente dice "lo pienso" — ¿qué haces?</p>
                <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>Nadie te mira. Di la verdad.</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <TogBtn
                    label="Tengo un protocolo claro y lo ejecuto siempre"
                    selected={sel.q3 === true}
                    variant="yes"
                    onClick={() => setSel(s => ({ ...s, q3: true }))}
                  />
                  <TogBtn
                    label="Improviso y espero que me llamen"
                    selected={sel.q3 === false}
                    variant="no"
                    onClick={() => setSel(s => ({ ...s, q3: false }))}
                  />
                </div>
              </>}

              {/* Q4 — Tasa de cierre */}
              {pasoForm === 4 && <>
                <p style={{ margin: '0 0 4px', fontSize: 19, fontWeight: 800, color: VERDE, lineHeight: 1.3 }}>¿Sabes exactamente cuál es tu tasa de cierre?</p>
                <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>No aproximada. El número real: de cada 10 prospectos, ¿cuántos cierras?</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <TogBtn
                    label="Sí, lo tengo medido y calculado"
                    selected={sel.q4 === true}
                    variant="yes"
                    onClick={() => setSel(s => ({ ...s, q4: true }))}
                  />
                  <TogBtn
                    label="No, nunca lo he calculado"
                    selected={sel.q4 === false}
                    variant="no"
                    onClick={() => setSel(s => ({ ...s, q4: false }))}
                  />
                </div>
              </>}

              {/* Q5 — Sueño */}
              {pasoForm === 5 && <>
                <p style={{ margin: '0 0 4px', fontSize: 19, fontWeight: 800, color: VERDE, lineHeight: 1.3 }}>¿Qué sueño lleva más tiempo esperando?</p>
                <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>El que piensas cuando dices "cuando me vaya mejor..."</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <DreamBtn icon="🏠" label="La casa o el arreglo prometido" selected={sel.sueno === 'casa'} onClick={() => setSel(s => ({ ...s, sueno: 'casa' }))} />
                  <DreamBtn icon="✈️" label="Las vacaciones postergadas" selected={sel.sueno === 'viaje'} onClick={() => setSel(s => ({ ...s, sueno: 'viaje' }))} />
                  <DreamBtn icon="🎓" label="Los estudios tuyos o de tus hijos" selected={sel.sueno === 'estudios'} onClick={() => setSel(s => ({ ...s, sueno: 'estudios' }))} />
                  <DreamBtn icon="💳" label="La deuda que no te deja dormir" selected={sel.sueno === 'deuda'} onClick={() => setSel(s => ({ ...s, sueno: 'deuda' }))} />
                  <DreamBtn icon="🚗" label="El carro que prometiste cambiar" selected={sel.sueno === 'carro'} onClick={() => setSel(s => ({ ...s, sueno: 'carro' }))} />
                  <DreamBtn icon="⏰" label="Tiempo libre sin culpa ni estrés" selected={sel.sueno === 'libertad'} onClick={() => setSel(s => ({ ...s, sueno: 'libertad' }))} />
                </div>
              </>}

              {nextBtn(pasoForm < 5 ? 'Siguiente →' : 'Ver mi diagnóstico →')}
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
              Procesando tus respuestas reales… No cierres esta ventana.
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
              <div style={{
                display: 'inline-block', padding: '5px 16px', borderRadius: 4, marginBottom: 12,
                background: r.rawScore >= 4 ? '#1a0000' : r.rawScore >= 2 ? '#0a0900' : '#001a0a',
                border: `1px solid ${r.nivelColor}`, color: r.nivelColor,
                fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase',
              }}>
                {r.rawScore >= 4 ? '⚠️ Alerta — Acción Urgente' : r.rawScore >= 2 ? 'Vendedor con Frenos' : 'Cerca — Pero Cerca No Paga'}
              </div>
              <h2 style={{ margin: 0, fontSize: 'clamp(22px,4vw,36px)', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>
                EL DIAGNÓSTICO DE {nombreTrimmed.toUpperCase()}
              </h2>
            </div>

            {/* Cajas monetarias */}
            {r.perdidaMensual > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
                <div style={{ background: '#1a0000', border: `1px solid ${ROJO}40`, borderRadius: 14, padding: '16px 12px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1.4 }}>Pierdes<br/>este mes</p>
                  <p style={{ margin: 0, fontSize: 'clamp(20px,4vw,28px)', fontWeight: 900, color: ROJO, lineHeight: 1 }}>{fmt(r.perdidaMensual)}</p>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '16px 12px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1.4 }}>En 90 días<br/>sin cambiar</p>
                  <p style={{ margin: 0, fontSize: 'clamp(20px,4vw,28px)', fontWeight: 900, color: 'white', lineHeight: 1 }}>{fmt(r.perdida90)}</p>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '16px 12px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1.4 }}>En 12 meses<br/>al año</p>
                  <p style={{ margin: 0, fontSize: 'clamp(20px,4vw,28px)', fontWeight: 900, color: 'white', lineHeight: 1 }}>{fmt(r.perdidaAnual)}</p>
                </div>
              </div>
            )}

            {/* Gauge */}
            <div style={{ background: 'white', borderRadius: 20, padding: '28px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', marginBottom: 14 }}>
              <GaugeSVG score={r.total} color={r.nivelColor} />
              <div style={{ marginTop: 20, borderTop: '1px solid #f3f4f6', paddingTop: 18 }}>
                <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Por categoría</p>
                <SubBar label="Seguimiento"  score={r.sub.seguimiento}  delay={0}   />
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
              <p style={{ margin: 0, fontSize: 14, color: 'white', fontWeight: 600, lineHeight: 1.55 }}>{r.cuelloTexto}</p>
            </div>

            {/* 90 días */}
            <div style={{ background: '#111827', borderRadius: 14, padding: '18px', marginBottom: 14 }}>
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

            {/* Fortalezas / Fricciones */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
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
              </div>
              <div style={{ background: 'white', borderRadius: 14, padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }}>
                <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Dónde se le van las comisiones
                </p>
                {r.debilidades.slice(0, 2).map((d, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                    <span style={{ color: '#ef4444', fontSize: 14, marginTop: 1 }}>✗</span>
                    <p style={{ margin: 0, fontSize: 12, color: '#374151', lineHeight: 1.55 }}>{d.texto}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Maxwell — dinámico por puntaje */}
            <div style={{ borderLeft: `4px solid ${AMARILLO}`, background: '#fffbeb', borderRadius: '0 12px 12px 0', padding: '14px 18px', marginBottom: 14 }}>
              <p style={{ margin: '0 0 5px', fontSize: 14, color: '#374151', lineHeight: 1.6, fontStyle: 'italic' }}>
                {r.maxwell}
              </p>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#92400e' }}>— Atribuido a John C. Maxwell</p>
            </div>

            {/* Bloque del sueño */}
            {r.suenoTextos && (
              <div style={{ background: '#0d0000', border: `1px solid ${ROJO}30`, borderRadius: 14, padding: '20px 18px', marginBottom: 14 }}>
                <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, color: ROJO, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Y ese sueño tuyo... el que llevas tiempo postergando
                </p>
                {r.suenoTextos.map((linea, i) => (
                  <p key={i} style={{ margin: i < 2 ? '0 0 10px' : 0, fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.65 }}>
                    {linea}
                  </p>
                ))}
              </div>
            )}

            {/* ── PAYWALL ── */}
            {fase === 'resultado' && (
              <div style={{ background: VERDE, borderRadius: 18, padding: '28px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 30, marginBottom: 8 }}>🔒</div>
                <h3 style={{ margin: '0 0 8px', fontWeight: 800, fontSize: 21, color: 'white', lineHeight: 1.3 }}>
                  Desbloquea el reporte completo de {nombreTrimmed}
                </h3>
                <p style={{ margin: '0 0 20px', fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
                  3 acciones concretas para esta semana y el camino exacto para cerrar más con lo que ya tienes.
                </p>
                <input
                  type="email" placeholder="tu@email.com" value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError('') }}
                  onKeyDown={e => e.key === 'Enter' && desbloquear()}
                  style={{ display: 'block', width: '100%', padding: '14px', borderRadius: 10, border: emailError ? '2px solid #fca5a5' : '2px solid transparent', fontSize: 15, marginBottom: emailError ? 6 : 12, outline: 'none', fontFamily: 'inherit' }}
                />
                {emailError && <p style={{ color: '#fca5a5', fontSize: 12, margin: '0 0 10px', textAlign: 'left' }}>{emailError}</p>}
                <button
                  onClick={desbloquear} disabled={guardando}
                  style={{ display: 'block', width: '100%', padding: '15px', borderRadius: 10, border: 'none', background: TEAL, color: VERDE, fontWeight: 800, fontSize: 16, cursor: guardando ? 'not-allowed' : 'pointer' }}
                >
                  {guardando ? 'Guardando...' : 'Desbloquear mi reporte →'}
                </button>
                <p style={{ margin: '10px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                  Sin tarjeta. Sin pago. Solo tu reporte.
                </p>
              </div>
            )}

            {/* ── GRACIAS ── */}
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
