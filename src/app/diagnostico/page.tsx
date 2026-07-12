'use client'

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
const VERDE_S = '#00C853'   // solo para toggle "sí"
const TEAL_R  = '#4ECDC4'   // solo para paywall/unlock

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

// ── DreamBtn ──────────────────────────────────────────────
function DreamBtn({ icon, label, selected, onClick }: { icon: string; label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '14px',
      borderRadius: 10,
      border: selected ? `1px solid ${AMARILLO}` : '1px solid #2a2a2a',
      background: selected ? '#0a0900' : '#0a0a0a',
      color: selected ? AMARILLO : '#666',
      fontFamily: "'Barlow', sans-serif",
      fontWeight: selected ? 700 : 600, fontSize: 13,
      cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
    }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────
type Fase = 'form' | 'cargando' | 'resultado' | 'desbloqueado'

export default function DiagnosticoPage() {
  const [fase, setFase] = useState<Fase>('form')
  const [pasoForm, setPasoForm] = useState(0)
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

  const progreso = pasoForm + 1
  const progressBar = (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, fontWeight: 800, color: ROJO, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {Math.round((progreso / 6) * 100)}%
        </span>
      </div>
      <div style={{ background: '#2a2a2a', borderRadius: 100, height: 3 }}>
        <div style={{ width: `${(progreso / 6) * 100}%`, height: '100%', background: ROJO, borderRadius: 100, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )

  const card = (children: React.ReactNode) => (
    <div ref={cardRef} style={{
      background: DARK,
      border: '1px solid #222',
      borderRadius: 14,
      padding: '32px 26px',
      maxWidth: 560,
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
    `Analizando las respuestas de ${nombreTrimmed}…`,
    'Calculando pérdida mensual estimada…',
    'Identificando tu cuello de botella principal…',
    'Preparando tu diagnóstico personalizado…',
  ]

  const fmt = (n: number) => '$' + n.toLocaleString('en-US')

  const qTitle = (text: string) => (
    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(28px,6vw,42px)', lineHeight: 1, color: 'white', marginBottom: 8, letterSpacing: '0.01em' }}>
      {text}
    </div>
  )
  const qSub = (text: string) => (
    <p style={{ fontFamily: "'Barlow', sans-serif", margin: '0 0 24px', fontSize: 13, color: '#aaa', lineHeight: 1.65 }}>{text}</p>
  )

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Barlow', sans-serif", background: NEGRO, color: 'white', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500;600;700&display=swap');
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
        @keyframes up      { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        input::placeholder { color: #2a2a2a; }
      `}</style>

      {/* Logo */}
      <div style={{ padding: '20px 24px', textAlign: 'center' }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 24, color: 'white', letterSpacing: '0.06em' }}>CBC™</span>
      </div>

      {/* Cinta policial */}
      <div style={{ height: 10, background: 'repeating-linear-gradient(-45deg,#f5c400 0,#f5c400 16px,#000 16px,#000 32px)' }} />
      <div style={{ background: '#0a0a0a', borderTop: `2px solid ${AMARILLO}`, borderBottom: `2px solid ${AMARILLO}`, textAlign: 'center', padding: '9px 20px' }}>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'white' }}>
          ⚡ En 3 minutos sabes exactamente cuánto dinero estás regalando cada mes
        </span>
      </div>
      <div style={{ height: 10, background: 'repeating-linear-gradient(-45deg,#f5c400 0,#f5c400 16px,#000 16px,#000 32px)' }} />

      {/* Hero */}
      <section style={{ padding: '52px 24px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,0,29,0.1), transparent 65%)`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'inline-block', background: ROJO, color: 'white', fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', padding: '5px 16px', borderRadius: 2, marginBottom: 22 }}>
            Diagnóstico con tus números reales
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(52px,10vw,96px)', lineHeight: 0.92, color: 'white', margin: '0 0 14px', letterSpacing: '0.01em' }}>
            ¿Qué va a pasar<br />en <span style={{ color: ROJO }}>90 días</span><br />si no cambias nada?
          </h1>
          <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 'clamp(14px,2vw,17px)', color: '#aaa', lineHeight: 1.7, margin: '0 0 24px' }}>
            Responde con lo que es real, no con lo que quisieras que fuera.<br />Nadie más tiene acceso a estas respuestas. No te traiciones.
          </p>
          {/* Maxwell pill */}
          <div style={{ display: 'inline-block', background: DARK, border: '1px solid #2a2a2a', borderLeft: `3px solid ${AMARILLO}`, borderRadius: '0 8px 8px 0', padding: '14px 20px', textAlign: 'left', maxWidth: 560 }}>
            <p style={{ fontFamily: "'Barlow', sans-serif", margin: '0 0 4px', fontSize: 13, color: AMARILLO, fontWeight: 700, lineHeight: 1.7 }}>
              "Si llevas 10 años haciendo lo mismo, no tienes 10 años de experiencia. Tienes 1 año repetido 10 veces."
            </p>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 10, color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase' }}>— John C. Maxwell</span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FORMULARIO
      ════════════════════════════════════════ */}
      {fase === 'form' && (
        <div style={{ padding: '0 16px 64px' }}>

          {/* Paso 0 — Nombre */}
          {pasoForm === 0 && (
            <div style={{ animation: 'up 0.3s ease' }}>
              {card(
                <>
                  {progressBar}
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(28px,6vw,38px)', lineHeight: 1, color: 'white', marginBottom: 8 }}>
                    ¿Listo para comenzar?
                  </div>
                  <p style={{ fontFamily: "'Barlow', sans-serif", margin: '0 0 20px', fontSize: 13, color: '#aaa', lineHeight: 1.65 }}>
                    Empecemos por tu nombre — lo usamos para personalizar tu diagnóstico.
                  </p>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && avanzar()}
                    autoFocus
                    style={{
                      display: 'block', width: '100%', padding: '16px',
                      background: '#0a0a0a', border: `1px solid ${nombreTrimmed.length >= 2 ? ROJO : '#2a2a2a'}`,
                      borderRadius: 10, color: 'white',
                      fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: '0.04em',
                      outline: 'none', transition: 'border-color 0.2s',
                    }}
                  />
                </>
              )}
              {nextBtn('Continuar →')}
            </div>
          )}

          {/* Pasos 1-5 */}
          {pasoForm >= 1 && (
            <div style={{ animation: 'up 0.3s ease' }}>
              {card(
                <>
                  {progressBar}
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: ROJO, marginBottom: 12 }}>
                    0{pasoForm} / 05
                  </div>

                  {/* Q1 */}
                  {pasoForm === 1 && <>
                    {qTitle('¿Cuánto vale cada venta que cierras?')}
                    {qSub('¿Cuánto entra a tu bolsillo cuando cierras? Comisión, margen, lo que cobras tú.')}
                    <div style={{ position: 'relative', marginBottom: 8 }}>
                      <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: AMARILLO, pointerEvents: 'none', zIndex: 1 }}>$</span>
                      <input
                        type="number" min={0} placeholder="500" value={sel.v1 ?? ''}
                        onChange={e => { const v = Number(e.target.value); setSel(s => ({ ...s, v1: v > 0 ? v : null })) }}
                        onKeyDown={e => e.key === 'Enter' && avanzar()}
                        autoFocus
                        style={{ width: '100%', background: '#0a0a0a', border: `1px solid ${(sel.v1 ?? 0) > 0 ? ROJO : '#2a2a2a'}`, borderRadius: 10, padding: '16px 16px 16px 42px', color: 'white', fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: '0.04em', outline: 'none', transition: 'border-color 0.2s' }}
                      />
                    </div>
                    <p style={{ fontFamily: "'Barlow', sans-serif", margin: 0, fontSize: 11, color: '#555' }}>Escribe el número exacto — solo tú lo ves.</p>
                  </>}

                  {/* Q2 */}
                  {pasoForm === 2 && <>
                    {qTitle('¿Cuántos prospectos llevan más de 7 días sin seguimiento?')}
                    {qSub('Los que están en tu lista esperando. Ahora mismo. Sé honesto.')}
                    <div style={{ position: 'relative', marginBottom: 8 }}>
                      <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: AMARILLO, pointerEvents: 'none', zIndex: 1 }}>#</span>
                      <input
                        type="number" min={0} placeholder="5" value={sel.v2 ?? ''}
                        onChange={e => { const v = Number(e.target.value); setSel(s => ({ ...s, v2: e.target.value === '' ? null : v >= 0 ? v : 0 })) }}
                        onKeyDown={e => e.key === 'Enter' && avanzar()}
                        autoFocus
                        style={{ width: '100%', background: '#0a0a0a', border: `1px solid ${sel.v2 !== null ? ROJO : '#2a2a2a'}`, borderRadius: 10, padding: '16px 16px 16px 42px', color: 'white', fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: '0.04em', outline: 'none', transition: 'border-color 0.2s' }}
                      />
                    </div>
                    <p style={{ fontFamily: "'Barlow', sans-serif", margin: 0, fontSize: 11, color: '#555' }}>Si no recuerdas exactamente, pon el número más honesto.</p>
                  </>}

                  {/* Q3 */}
                  {pasoForm === 3 && <>
                    {qTitle('Cuando un cliente dice "lo pienso" — ¿qué haces?')}
                    {qSub('Nadie te mira. Di la verdad.')}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <TogBtn label="Tengo un protocolo claro y lo ejecuto siempre" selected={sel.q3 === true}  variant="yes" onClick={() => setSel(s => ({ ...s, q3: true }))} />
                      <TogBtn label="Improviso y espero que me llamen"               selected={sel.q3 === false} variant="no"  onClick={() => setSel(s => ({ ...s, q3: false }))} />
                    </div>
                  </>}

                  {/* Q4 */}
                  {pasoForm === 4 && <>
                    {qTitle('¿Sabes exactamente cuál es tu tasa de cierre?')}
                    {qSub('No aproximada. El número real: de cada 10 prospectos, ¿cuántos cierras?')}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <TogBtn label="Sí, lo tengo medido y calculado" selected={sel.q4 === true}  variant="yes" onClick={() => setSel(s => ({ ...s, q4: true }))} />
                      <TogBtn label="No, nunca lo he calculado"        selected={sel.q4 === false} variant="no"  onClick={() => setSel(s => ({ ...s, q4: false }))} />
                    </div>
                  </>}

                  {/* Q5 */}
                  {pasoForm === 5 && <>
                    {qTitle('¿Qué sueño lleva más tiempo esperando?')}
                    {qSub('El que piensas cuando dices "cuando me vaya mejor..."')}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <DreamBtn icon="🏠" label="La casa o el arreglo prometido"    selected={sel.sueno === 'casa'}     onClick={() => setSel(s => ({ ...s, sueno: 'casa' }))} />
                      <DreamBtn icon="✈️" label="Las vacaciones postergadas"         selected={sel.sueno === 'viaje'}    onClick={() => setSel(s => ({ ...s, sueno: 'viaje' }))} />
                      <DreamBtn icon="🎓" label="Los estudios tuyos o de tus hijos" selected={sel.sueno === 'estudios'} onClick={() => setSel(s => ({ ...s, sueno: 'estudios' }))} />
                      <DreamBtn icon="💳" label="La deuda que no te deja dormir"    selected={sel.sueno === 'deuda'}    onClick={() => setSel(s => ({ ...s, sueno: 'deuda' }))} />
                      <DreamBtn icon="🚗" label="El carro que prometiste cambiar"   selected={sel.sueno === 'carro'}    onClick={() => setSel(s => ({ ...s, sueno: 'carro' }))} />
                      <DreamBtn icon="⏰" label="Tiempo libre sin culpa ni estrés"  selected={sel.sueno === 'libertad'} onClick={() => setSel(s => ({ ...s, sueno: 'libertad' }))} />
                    </div>
                  </>}
                </>
              )}
              {nextBtn(pasoForm < 5 ? 'Siguiente →' : '→ Ver mi diagnóstico ahora')}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════
          SPINNER
      ════════════════════════════════════════ */}
      {fase === 'cargando' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px 80px' }}>
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <div style={{ width: 64, height: 64, margin: '0 auto 28px', border: `5px solid ${ROJO}30`, borderTopColor: ROJO, borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", margin: '0 0 8px', fontSize: 28, letterSpacing: '0.03em', color: 'white' }}>
              Analizando el pipeline de {nombreTrimmed}
            </p>
            <p style={{ fontFamily: "'Barlow', sans-serif", margin: '0 0 6px', fontSize: 15, color: '#555', animation: 'pulse 1.8s ease-in-out infinite', minHeight: 24 }}>
              {MSGS[msgIdx]}
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
                display: 'inline-block', padding: '6px 18px', borderRadius: 4, marginBottom: 16,
                background: r.rawScore >= 4 ? '#1a0000' : r.rawScore >= 2 ? '#0a0900' : '#001a0a',
                border: `1px solid ${r.nivelColor}`, color: r.nivelColor,
                fontFamily: "'Barlow', sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase',
              }}>
                {r.rawScore >= 4 ? '⚠️ Alerta — Acción Urgente' : r.rawScore >= 2 ? 'Vendedor con Frenos' : 'Cerca — Pero Cerca No Paga'}
              </div>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", margin: 0, fontSize: 'clamp(32px,6vw,52px)', color: 'white', letterSpacing: '0.01em', lineHeight: 0.95 }}>
                El diagnóstico<br />de {nombreTrimmed}
              </h2>
            </div>

            {/* Cajas monetarias */}
            {r.perdidaMensual > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
                {[
                  { label: 'Pierdes\neste mes', val: fmt(r.perdidaMensual), hl: true },
                  { label: 'En 90 días\nsin cambiar', val: fmt(r.perdida90), hl: false },
                  { label: 'En 12 meses\nal año',    val: fmt(r.perdidaAnual), hl: false },
                ].map((b, i) => (
                  <div key={i} style={{ background: b.hl ? '#0d0000' : DARK2, border: `1px solid ${b.hl ? '#3a0000' : '#333'}`, borderRadius: 12, padding: '18px 12px', textAlign: 'center' }}>
                    <p style={{ fontFamily: "'Barlow', sans-serif", margin: '0 0 8px', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa', lineHeight: 1.4 }}>
                      {b.label.split('\n').map((l, j) => <span key={j}>{l}{j === 0 ? <br /> : ''}</span>)}
                    </p>
                    <p style={{ fontFamily: "'Bebas Neue', sans-serif", margin: 0, fontSize: 'clamp(22px,5vw,32px)', color: b.hl ? ROJO : 'white', lineHeight: 1 }}>{b.val}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Gauge */}
            <div style={{ background: DARK, border: '1px solid #222', borderRadius: 14, padding: '28px 24px', marginBottom: 14 }}>
              <GaugeSVG score={r.total} color={r.nivelColor} />
              <div style={{ marginTop: 20, borderTop: '1px solid #2a2a2a', paddingTop: 18 }}>
                <p style={{ fontFamily: "'Barlow', sans-serif", margin: '0 0 12px', fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Por categoría</p>
                <SubBar label="Seguimiento"  score={r.sub.seguimiento}  delay={0}   />
                <SubBar label="Priorización" score={r.sub.priorizacion} delay={100} />
                <SubBar label="Preparación"  score={r.sub.preparacion}  delay={200} />
                <SubBar label="Reporte"      score={r.sub.reporte}      delay={300} />
              </div>
            </div>

            {/* Cuello */}
            <div style={{ background: `${r.nivelColor}15`, border: `1px solid ${r.nivelColor}40`, borderRadius: 12, padding: '16px 18px', marginBottom: 14 }}>
              <p style={{ fontFamily: "'Barlow', sans-serif", margin: '0 0 4px', fontSize: 10, fontWeight: 800, color: r.nivelColor, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {nombreTrimmed}, tu cuello de botella hoy es: {r.cuelloLabel}
              </p>
              <p style={{ fontFamily: "'Barlow', sans-serif", margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 600, lineHeight: 1.55 }}>{r.cuelloTexto}</p>
            </div>

            {/* 90 días */}
            <div style={{ background: '#0a0900', border: `1px solid rgba(245,196,0,0.15)`, borderRadius: 14, padding: '18px', marginBottom: 14 }}>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", margin: '0 0 14px', fontSize: 22, color: AMARILLO, letterSpacing: '0.01em' }}>
                Lo que pasa en 90 días si {nombreTrimmed} no cambia nada:
              </p>
              {calcular90dias(sel, r.perdidaMensual).map((linea, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: i < 2 ? 10 : 0, borderBottom: i < 2 ? `1px solid rgba(245,196,0,0.08)` : 'none', paddingBottom: i < 2 ? 10 : 0 }}>
                  <span style={{ color: AMARILLO, flexShrink: 0, marginTop: 2, fontSize: 14 }}>→</span>
                  <p style={{ fontFamily: "'Barlow', sans-serif", margin: 0, fontSize: 14, color: '#ccc', lineHeight: 1.65 }}>{linea}</p>
                </div>
              ))}
            </div>

            {/* Fortalezas / Fricciones */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div style={{ background: DARK, border: '1px solid #222', borderRadius: 12, padding: '16px' }}>
                <p style={{ fontFamily: "'Barlow', sans-serif", margin: '0 0 10px', fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lo que ya haces bien</p>
                {r.fortalezas.slice(0, 2).map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                    <span style={{ color: VERDE_S, fontSize: 14, marginTop: 1 }}>✓</span>
                    <p style={{ fontFamily: "'Barlow', sans-serif", margin: 0, fontSize: 12, color: '#aaa', lineHeight: 1.55 }}>{f.texto}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: DARK, border: '1px solid #222', borderRadius: 12, padding: '16px' }}>
                <p style={{ fontFamily: "'Barlow', sans-serif", margin: '0 0 10px', fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dónde se van las comisiones</p>
                {r.debilidades.slice(0, 2).map((d, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                    <span style={{ color: ROJO, fontSize: 14, marginTop: 1 }}>✗</span>
                    <p style={{ fontFamily: "'Barlow', sans-serif", margin: 0, fontSize: 12, color: '#aaa', lineHeight: 1.55 }}>{d.texto}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sueño */}
            {r.suenoTextos && (
              <div style={{ background: '#0a0900', border: `1px solid rgba(245,196,0,0.2)`, borderRadius: 14, padding: '20px 18px', marginBottom: 14 }}>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", margin: '0 0 4px', fontSize: 24, color: AMARILLO, letterSpacing: '0.01em' }}>Y ese sueño tuyo...</p>
                <p style={{ fontFamily: "'Barlow', sans-serif", margin: '0 0 16px', fontSize: 11, color: 'rgba(245,196,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>El que llevas tiempo postergando</p>
                {r.suenoTextos.map((linea, i) => (
                  <p key={i} style={{ fontFamily: "'Barlow', sans-serif", margin: i < 2 ? '0 0 10px' : 0, fontSize: 14, color: '#ccc', lineHeight: 1.65, borderBottom: i < 2 ? `1px solid rgba(245,196,0,0.08)` : 'none', paddingBottom: i < 2 ? 10 : 0 }}>
                    {linea}
                  </p>
                ))}
              </div>
            )}

            {/* Maxwell dinámico */}
            <div style={{ background: DARK, borderLeft: `4px solid ${AMARILLO}`, borderRadius: '0 12px 12px 0', padding: '20px 22px', marginBottom: 14 }}>
              <p style={{ fontFamily: "'Barlow', sans-serif", margin: '0 0 8px', fontSize: 15, color: 'white', lineHeight: 1.75, fontStyle: 'italic' }}>
                {r.maxwell}
              </p>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 10, color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase' }}>— John C. Maxwell · Principio del Crecimiento Intencional</span>
            </div>

            {/* Paywall */}
            {fase === 'resultado' && (
              <div style={{ background: '#0a1200', border: `2px solid ${VERDE_S}30`, borderRadius: 14, padding: '28px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 30, marginBottom: 10 }}>🔒</div>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", margin: '0 0 8px', fontSize: 28, color: 'white', letterSpacing: '0.01em', lineHeight: 1 }}>
                  Desbloquea el reporte completo de {nombreTrimmed}
                </h3>
                <p style={{ fontFamily: "'Barlow', sans-serif", margin: '0 0 20px', fontSize: 14, color: '#aaa', lineHeight: 1.6 }}>
                  3 acciones concretas para esta semana y el camino exacto para cerrar más con lo que ya tienes.
                </p>
                <input
                  type="email" placeholder="tu@email.com" value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError('') }}
                  onKeyDown={e => e.key === 'Enter' && desbloquear()}
                  style={{ display: 'block', width: '100%', padding: '14px', borderRadius: 10, background: '#0a0a0a', border: emailError ? `1px solid ${ROJO}` : '1px solid #2a2a2a', color: 'white', fontSize: 15, marginBottom: emailError ? 6 : 12, outline: 'none', fontFamily: "'Barlow', sans-serif" }}
                />
                {emailError && <p style={{ fontFamily: "'Barlow', sans-serif", color: ROJO, fontSize: 12, margin: '0 0 10px', textAlign: 'left' }}>{emailError}</p>}
                <button
                  onClick={desbloquear} disabled={guardando}
                  style={{ display: 'block', width: '100%', padding: '16px', borderRadius: 8, border: 'none', background: VERDE_S, color: '#001a0a', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 20, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: guardando ? 'not-allowed' : 'pointer', boxShadow: `0 4px 28px rgba(0,200,83,0.3)` }}
                >
                  {guardando ? 'Guardando...' : 'Desbloquear mi reporte →'}
                </button>
                <p style={{ fontFamily: "'Barlow', sans-serif", margin: '10px 0 0', fontSize: 11, color: '#444' }}>
                  Sin spam. Solo tu reporte.
                </p>
              </div>
            )}

            {/* Gracias */}
            {fase === 'desbloqueado' && (
              <div style={{ background: DARK, border: `1px solid ${VERDE_S}40`, borderRadius: 14, padding: '32px 28px', textAlign: 'center', animation: 'fadeUp 0.5s ease both' }}>
                <div style={{ fontSize: 40, marginBottom: 14 }}>✅</div>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", margin: '0 0 10px', fontSize: 28, color: VERDE_S, letterSpacing: '0.01em' }}>
                  Gracias {nombreTrimmed} — revisa tu email.
                </h3>
                <p style={{ fontFamily: "'Barlow', sans-serif", margin: 0, fontSize: 15, color: '#aaa', lineHeight: 1.65 }}>
                  Te enviamos el reporte completo con tus resultados y los próximos pasos para tu pipeline.
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      <footer style={{ textAlign: 'center', padding: '24px', fontFamily: "'Barlow', sans-serif", fontSize: 12, color: '#aaa', borderTop: '1px solid #1a1a1a' }}>
        © 2026 Diana García · Arquitecta de Automatizaciones · <em>Hago fácil lo difícil.</em>
      </footer>
    </div>
  )
}
