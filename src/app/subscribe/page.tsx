'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

// ── Paleta ─────────────────────────────────────────────────────────────
const VERDE  = '#1A4A44'
const TEAL   = '#4ECDC4'
const ROJO   = '#e8001d'
const NEGRO  = '#080808'
const PAPER  = '#F5F0E8'
const PAPERD = '#EDE8DF'
const TEXT   = '#1a1a1a'

// ── Tipografía ──────────────────────────────────────────────────────────
const BEBAS  = "'Bebas Neue', Impact, sans-serif"
const SANS   = "'General Sans', system-ui, sans-serif"
const MONO   = "'JetBrains Mono', 'Courier New', monospace"
const SCRIPT = "'Alex Brush', cursive"

// ── Assets ─────────────────────────────────────────────────────────────
const TATIANA_PHOTO = 'https://assets.cdn.filesafe.space/MgsViYLMmCdJksx9p3va/media/6a13da46fe2210f89e7033ce.jpeg'
const SOFIA_PHOTO   = 'https://assets.cdn.filesafe.space/MgsViYLMmCdJksx9p3va/media/69e8ba57a1636a6c65273241.png'

// ── Íconos SVG de línea (un ícono por herramienta) ────────────────────
function Icon({ d, size = 22 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

const TOOL_ICONS: { id: string; icon: React.ReactNode }[] = [
  { id: 'ia',        icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4M7 8l3 3-3 3M13 14h4"/></svg> },
  { id: 'reporte',   icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg> },
  { id: 'llamada',   icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> },
  { id: 'propuesta', icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><polyline points="9,15 11,17 15,13"/></svg> },
  { id: 'disc',      icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg> },
  { id: 'escudo',    icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { id: 'qr',        icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3"/></svg> },
  { id: 'copiloto',  icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="22"/><line x1="2" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="22" y2="12"/></svg> },
  { id: 'networker', icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> },
  { id: 'crack',     icon: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg> },
]

// ── Componente FAQ ──────────────────────────────────────────────────────
function FaqItem({ pregunta, respuesta }: { pregunta: string; respuesta: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: '100%', textAlign: 'left', padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}
      >
        <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.90)', lineHeight: 1.4 }}>{pregunta}</span>
        <span style={{ fontFamily: MONO, fontSize: 18, color: TEAL, flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'none', lineHeight: 1 }}>+</span>
      </button>
      {open && (
        <p style={{ fontFamily: SANS, fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, margin: '0 0 20px', paddingRight: 32 }}>
          {respuesta}
        </p>
      )}
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────────────
function SubscribeContent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const params = useSearchParams()
  const cancelled = params.get('cancelled')

  async function handleCheckout() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'No se pudo iniciar el proceso. Intenta de nuevo.')
        setLoading(false)
      }
    } catch {
      setError('Error de conexión. Verifica tu internet e intenta de nuevo.')
      setLoading(false)
    }
  }

  function BtnCTA({ label = 'PROBAR CBC™ GRATIS →', full = false }: { label?: string; full?: boolean }) {
    const shadow = '0 8px 0 #4a0008, 0 12px 28px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)'
    const shadowPressed = '0 3px 0 #4a0008, 0 5px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12)'
    return (
      <button
        onClick={handleCheckout}
        disabled={loading}
        style={{
          background: loading ? '#1a1a1a' : 'linear-gradient(180deg, #c8001a 0%, #9a0014 60%, #7a000f 100%)',
          color: loading ? 'rgba(255,255,255,0.25)' : 'white',
          fontFamily: BEBAS, fontSize: 20,
          padding: '18px 40px',
          border: loading ? 'none' : '3px solid rgba(255,255,255,0.15)',
          borderRadius: 14,
          cursor: loading ? 'wait' : 'pointer',
          display: full ? 'block' : 'inline-block',
          width: full ? '100%' : undefined,
          boxShadow: loading ? 'none' : shadow,
          textShadow: loading ? 'none' : '0 1px 3px rgba(0,0,0,0.5)',
          letterSpacing: '0.10em',
          transition: 'transform 0.08s ease, box-shadow 0.08s ease',
        }}
        onMouseDown={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(5px)'; e.currentTarget.style.boxShadow = shadowPressed }}}
        onMouseUp={e => { if (!loading) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = shadow }}}
        onMouseLeave={e => { if (!loading) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = shadow }}}
      >
        {loading ? 'INICIANDO...' : label}
      </button>
    )
  }

  return (
    <div style={{ fontFamily: SANS, overflowX: 'hidden', background: NEGRO }}>

      {/* ── Fuentes ─────────────────────────────────────────────── */}
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        .fade-up { animation: fadeUp 0.6s ease both; }
        .fade-up-2 { animation: fadeUp 0.6s 0.12s ease both; }
        .fade-up-3 { animation: fadeUp 0.6s 0.24s ease both; }
      `}</style>

      {/* ════════════════════════════════════════════════════════════
          NAV
      ════════════════════════════════════════════════════════════ */}
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: BEBAS, fontSize: 20, color: 'white', letterSpacing: '0.08em' }}>CBC™</span>
          <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em' }}>CIERRE BAJO CONTROL</span>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════════
          SECCIÓN 01 — HERO
      ════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 24px 72px', position: 'relative', overflow: 'hidden', backgroundImage: "linear-gradient(to right, rgba(8,8,8,0.94) 0%, rgba(8,8,8,0.78) 55%, rgba(8,8,8,0.30) 100%), url('/bg-detective.jpg')", backgroundSize: 'cover', backgroundPosition: '78% 18%', backgroundAttachment: 'fixed' }}>
        {/* Gradiente de profundidad */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(78,205,196,0.04), transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative' }}>

          {/* Label superior */}
          <div className="fade-up" style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 36 }}>
            SISTEMA DE VENTAS B2B · LATAM
          </div>

          {/* H1 principal */}
          <h1 className="fade-up" style={{ fontFamily: BEBAS, fontSize: 'clamp(52px,10vw,96px)', lineHeight: 0.92, color: 'white', margin: '0 0 8px', letterSpacing: '0.02em' }}>
            CIERRE BAJO<br />CONTROL™
          </h1>

          {/* Tagline con Alex Brush */}
          <p className="fade-up-2" style={{ fontFamily: SANS, fontSize: 'clamp(18px,3vw,22px)', color: 'rgba(255,255,255,0.88)', lineHeight: 1.5, margin: '20px 0 36px', maxWidth: 540 }}>
            El sistema que trabaja mientras tú{' '}
            <span style={{ fontFamily: BEBAS, color: TEAL, fontSize: 'clamp(28px,4.5vw,38px)', letterSpacing: '0.06em', display: 'inline-block', verticalAlign: 'middle' }}>VENDES.</span>
          </p>

          {/* Descripción — Sofía */}
          <div className="fade-up-3" style={{ marginBottom: 40 }}>
            {/* Avatar + nombre */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <img src={SOFIA_PHOTO} alt="Sofía" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', flexShrink: 0, border: `1.5px solid ${TEAL}` }} />
              <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: TEAL, letterSpacing: '0.16em' }}>SOFÍA™ · ASISTENTE DE IA</span>
            </div>
            <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.88)', lineHeight: 1.75, margin: 0, maxWidth: 540, borderLeft: `2px solid rgba(78,205,196,0.3)`, paddingLeft: 18 }}>
              Sofía organiza tu día, prepara tus llamadas y te avisa antes de que pierdas una venta. Tú solo cierras.
            </p>
          </div>

          {/* CTA */}
          <div className="fade-up-3" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
            <BtnCTA />
            {cancelled && (
              <p style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
                Cancelaste el proceso. Puedes iniciarlo cuando quieras.
              </p>
            )}
            {error && (
              <p style={{ fontFamily: SANS, fontSize: 13, color: ROJO, margin: 0 }}>{error}</p>
            )}
            <p style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.40)', margin: 0, letterSpacing: '0.08em' }}>
              $9.90/mes · 7 días gratis · Cancela cuando quieras
            </p>
          </div>

          {/* Badge PWA */}
          <div style={{ marginTop: 48, display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 16px', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.50)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
            <span style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.50)' }}>
              Se instala en tu celular como app real — igual que cualquier app que ya uses
            </span>
          </div>
        </div>
      </section>

      {/* ── Separador ── */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* ════════════════════════════════════════════════════════════
          SECCIÓN 02 — DOLOR
      ════════════════════════════════════════════════════════════ */}
      <section style={{ background: NEGRO, padding: '80px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.22em', marginBottom: 24 }}>
            EL PROBLEMA
          </div>

          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(38px,6vw,60px)', color: 'white', lineHeight: 1, margin: '0 0 48px', letterSpacing: '0.02em' }}>
            EL DÍA QUE NUNCA<br />TERMINA COMO DEBERÍA.
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              'Miras la lista 30 minutos. Empiezas por quien recordabas — no por quien más cerca estaba de comprar.',
              'Tu jefe pide el reporte del viernes. Buscas datos en tres sistemas distintos. Armas algo que suena bien. Pero tú sabes que es a medias.',
              'Enviaste la propuesta el martes. Ya es jueves. No sabes si llamar, escribir o esperar. El silencio te paraliza.',
            ].map((txt, i) => (
              <div key={i} style={{ display: 'flex', gap: 20, padding: '28px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', alignItems: 'flex-start' }}>
                <span style={{ fontFamily: MONO, fontSize: 11, color: ROJO, fontWeight: 700, flexShrink: 0, marginTop: 3, letterSpacing: '0.1em' }}>0{i + 1}</span>
                <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.88)', lineHeight: 1.75, margin: 0 }}>{txt}</p>
              </div>
            ))}
          </div>

          <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, margin: '36px 0 0', paddingLeft: 0 }}>
            Y mientras tanto — ese prospecto se está enfriando. Sin que nadie te avise.
          </p>
        </div>
      </section>

      {/* ── Separador ── */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* ════════════════════════════════════════════════════════════
          SECCIÓN 03 — QUÉ ES
      ════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#0d0d0d', padding: '80px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.22em', marginBottom: 24 }}>
            QUÉ ES CBC™
          </div>

          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(38px,6vw,60px)', color: 'white', lineHeight: 1, margin: '0 0 32px', letterSpacing: '0.02em' }}>
            NO ES MAGIA.<br />NO CIERRA POR TI.
          </h2>

          <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.88)', lineHeight: 1.8, margin: '0 0 20px', maxWidth: 580 }}>
            CBC™ no reemplaza tu talento ni tu conversación.
          </p>
          <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.88)', lineHeight: 1.8, margin: '0 0 20px', maxWidth: 580 }}>
            Es una app con IA — Sofía — que hace las tareas repetitivas que hoy te roban 2 horas al día, para que toda tu energía vaya donde realmente se generan las comisiones: en el cierre.
          </p>
          <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.72)', lineHeight: 1.8, margin: 0, maxWidth: 580 }}>
            Se instala en tu celular como una app real. Solo necesitas internet.
          </p>
        </div>
      </section>

      {/* ── Separador ── */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* ════════════════════════════════════════════════════════════
          SECCIÓN 04 — COMPARACIÓN CRM
      ════════════════════════════════════════════════════════════ */}
      <section style={{ background: NEGRO, padding: '80px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.22em', marginBottom: 24 }}>
            CBC™ VS. TU CRM ACTUAL
          </div>

          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(32px,5vw,52px)', color: 'white', lineHeight: 1.05, margin: '0 0 8px', letterSpacing: '0.02em' }}>
            "YA TENGO CRM."
          </h2>
          <h3 style={{ fontFamily: BEBAS, fontSize: 'clamp(24px,4vw,38px)', color: 'rgba(255,255,255,0.50)', lineHeight: 1.05, margin: '0 0 36px', letterSpacing: '0.02em', fontWeight: 400 }}>
            BIEN. PERO TU CRM NO HACE ESTO:
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
            {[
              'No te dice a quién llamar hoy',
              'No prepara tu llamada',
              'No te avisa que ese prospecto lleva 7 días sin respuesta',
              'No redacta tu propuesta',
              'No calcula cuánto te cuesta cada día sin actuar',
            ].map((txt, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 18px', background: 'rgba(232,0,29,0.04)', border: '1px solid rgba(232,0,29,0.12)', borderRadius: 8 }}>
                <span style={{ fontFamily: MONO, fontSize: 13, color: 'rgba(232,0,29,0.6)', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✗</span>
                <span style={{ fontFamily: SANS, fontSize: 'clamp(14px,1.8vw,16px)', color: 'rgba(255,255,255,0.72)', lineHeight: 1.5 }}>{txt}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: '24px 26px', background: `rgba(26,74,68,0.25)`, border: `1px solid rgba(78,205,196,0.2)`, borderRadius: 10 }}>
            <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.88)', lineHeight: 1.7, margin: '0 0 8px' }}>
              Tu CRM sabe todo. Y no cierra nada.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: TEAL, lineHeight: 1.7, margin: 0, fontWeight: 600 }}>
              CBC™ decide, prepara y avisa. Tú solo cierras.
            </p>
          </div>
        </div>
      </section>

      {/* ── Separador ── */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* ════════════════════════════════════════════════════════════
          SECCIÓN 05 — LAS 10 HERRAMIENTAS
      ════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#0d0d0d', padding: '80px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.22em', marginBottom: 24 }}>
            10 HERRAMIENTAS
          </div>

          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(38px,6vw,60px)', color: 'white', lineHeight: 1, margin: '0 0 8px', letterSpacing: '0.02em' }}>
            TODO LO QUE
          </h2>
          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(38px,6vw,60px)', color: 'white', lineHeight: 1, margin: '0 0 48px', letterSpacing: '0.02em' }}>
            <span style={{ fontFamily: BEBAS, color: TEAL, fontSize: 'clamp(52px,8.5vw,80px)', letterSpacing: '0.06em', display: 'inline-block', verticalAlign: 'middle' }}>SOFÍA</span>{' '}HACE POR TI:
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
            {[
              { icon: TOOL_ICONS[0].icon, nombre: 'IA en Acción™',                desc: 'Investiga prospectos, prepara reuniones, calcula qué te cuesta no actuar, reactiva leads fríos. 8 situaciones, resueltas en segundos.' },
              { icon: TOOL_ICONS[1].icon, nombre: 'Reporte al Jefe™',             desc: 'Tu reporte de desempeño, listo con tus datos reales.' },
              { icon: TOOL_ICONS[2].icon, nombre: 'Mi Llamada Perfecta™',         desc: 'Guión personalizado: apertura, diagnóstico, propuesta, cierre.' },
              { icon: TOOL_ICONS[3].icon, nombre: 'Propuesta Express™',           desc: '5 campos → propuesta lista + versión WhatsApp en 2 minutos.' },
              { icon: TOOL_ICONS[4].icon, nombre: 'Perfil DISC del Cliente™',     desc: 'Sabe cómo hablarle a cada prospecto antes de que levantes el teléfono.' },
              { icon: TOOL_ICONS[5].icon, nombre: 'Escudo de Objeciones™',        desc: 'La respuesta exacta para cada objeción, en segundos.' },
              { icon: TOOL_ICONS[6].icon, nombre: 'QR de Captura Inteligente™',   desc: 'El prospecto escanea, entra solo a tu sistema.' },
              { icon: TOOL_ICONS[7].icon, nombre: 'Copiloto de Reunión™',         desc: 'GPS de negociación, fase a fase, en vivo.' },
              { icon: TOOL_ICONS[8].icon, nombre: 'Networker Élite™',             desc: 'Convierte contactos de eventos en leads reales.' },
              { icon: TOOL_ICONS[9].icon, nombre: 'Mi Modo Crack™',               desc: 'Tu ritual mental diario, antes de la primera llamada.' },
            ].map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '22px 20px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
                <div style={{ color: TEAL, flexShrink: 0, marginTop: 2 }}>{h.icon}</div>
                <div>
                  <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.90)', marginBottom: 4 }}>{h.nombre}</div>
                  <div style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{h.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Separador ── */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* ════════════════════════════════════════════════════════════
          SECCIÓN 06 — SOFÍA
      ════════════════════════════════════════════════════════════ */}
      <section style={{ background: VERDE, padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 30% 50%, rgba(78,205,196,0.08), transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative' }}>

          <div style={{ fontFamily: MONO, fontSize: 11, color: `${TEAL}80`, letterSpacing: '0.22em', marginBottom: 24 }}>
            SOFÍA™
          </div>

          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(38px,6vw,60px)', color: PAPER, lineHeight: 1, margin: '0 0 32px', letterSpacing: '0.02em' }}>
            SOFÍA YA LEYÓ<br />TU DIAGNÓSTICO.
          </h2>

          <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(245,240,232,0.88)', lineHeight: 1.8, margin: '0 0 20px', maxWidth: 560 }}>
            Sabe exactamente dónde se te escapan las comisiones — y calibra cada recomendación a tu caso específico, no a un genérico.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560 }}>
            {[
              'Cada mañana te dice a quién llamar.',
              'Cada seguimiento, ya redactado.',
              'Cada semana, tu reporte, listo.',
            ].map((txt, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ color: TEAL, fontFamily: MONO, fontSize: 14, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>→</span>
                <span style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(245,240,232,0.88)', lineHeight: 1.6 }}>{txt}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Separador ── */}
      <div style={{ height: 1, background: 'rgba(0,0,0,0.15)' }} />

      {/* ════════════════════════════════════════════════════════════
          SECCIÓN 07 — TESTIMONIO TATIANA
      ════════════════════════════════════════════════════════════ */}
      <section style={{ background: PAPER, padding: '80px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          <div style={{ fontFamily: MONO, fontSize: 11, color: '#888', letterSpacing: '0.22em', marginBottom: 24 }}>
            CASO DOCUMENTADO · MAYO 2026
          </div>

          <div style={{ background: 'white', borderRadius: 10, borderLeft: `4px solid ${VERDE}`, padding: '36px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
              <img
                src={TATIANA_PHOTO}
                alt="Tatiana Panadero"
                style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', flexShrink: 0 }}
              />
              <div>
                <div style={{ fontFamily: SANS, fontWeight: 700, color: VERDE, fontSize: 15 }}>Tatiana Panadero</div>
                <div style={{ fontFamily: SANS, fontSize: 13, color: '#888', marginTop: 2 }}>Ejecutiva Comercial Senior · Bogotá, Colombia</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: '#bbb', letterSpacing: '0.1em', marginTop: 4 }}>CASO DOCUMENTADO · 15 MAY 2026</div>
              </div>
            </div>

            <blockquote style={{ fontFamily: SANS, fontSize: 16, color: TEXT, lineHeight: 1.8, margin: '0 0 24px', padding: 0, borderLeft: 'none', fontStyle: 'italic' }}>
              "Está buenísimo, de verdad está genial. El semáforo, el script para reportar al jefe… tal cual.{' '}
              <strong style={{ fontStyle: 'normal' }}>
                Eso es sencillo, corto, y es lo que de verdad le importa a los directores a nivel de números.
              </strong>
              <br /><br />
              Imagínate que tuve una reunión con mi nueva directora y tal cual manejé el speech. Donde son interesantes los números,
              usé la plantilla… eso me sirvió mucho, me fue súper bien en la reunión.
              <br /><br />
              <strong style={{ fontStyle: 'normal' }}>
                Si voy bien digo tal cosa, si voy regular digo tal cosa, si voy mal digo tal cosa. Concreto.
              </strong>{' '}
              Era exactamente lo que ella quería escuchar."
            </blockquote>

            <div style={{ paddingTop: 16, borderTop: '1px solid #EDE8DF' }}>
              <span style={{ fontFamily: MONO, fontSize: 10, color: '#bbb', letterSpacing: '0.12em' }}>
                TESTIMONIO DOCUMENTADO · 15 MAY 2026 · BOGOTÁ, COLOMBIA
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Separador ── */}
      <div style={{ height: 1, background: '#D8D3C9' }} />

      {/* ════════════════════════════════════════════════════════════
          SECCIÓN 08 — PRECIO
      ════════════════════════════════════════════════════════════ */}
      <section style={{ background: PAPERD, padding: '80px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          <div style={{ fontFamily: MONO, fontSize: 11, color: '#888', letterSpacing: '0.22em', marginBottom: 24 }}>
            PRECIO
          </div>

          <div style={{ background: 'white', borderRadius: 12, padding: '48px 40px', maxWidth: 480, margin: '0 auto', textAlign: 'center', boxShadow: '0 2px 24px rgba(0,0,0,0.06)' }}>

            <div style={{ fontFamily: BEBAS, fontSize: 80, color: VERDE, lineHeight: 1, marginBottom: 4, letterSpacing: '-0.01em' }}>
              <span style={{ fontFamily: MONO, fontSize: 28, verticalAlign: 'super', lineHeight: 1 }}>$</span>9.90
            </div>
            <div style={{ fontFamily: SANS, fontSize: 15, color: '#888', marginBottom: 28 }}>USD al mes · Menos que un café al día</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
              {['7 días gratis — sin tarjeta hasta que decidas', 'Cancela cuando quieras — sin preguntas', 'Sin planes escondidos. Sin letra pequeña.'].map((f, i) => (
                <div key={i} style={{ fontFamily: SANS, fontSize: 15, color: TEXT, display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: 'left' }}>
                  <span style={{ color: TEAL, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>+</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <BtnCTA label="Probar CBC™ gratis →" full />

            <p style={{ fontFamily: SANS, fontSize: 12, color: '#bbb', margin: '16px 0 0' }}>
              Pago seguro con Stripe. No almacenamos tu tarjeta.
            </p>
          </div>
        </div>
      </section>

      {/* ── Separador ── */}
      <div style={{ height: 1, background: '#D8D3C9' }} />

      {/* ════════════════════════════════════════════════════════════
          SECCIÓN 09 — TRIAL / GARANTÍA
      ════════════════════════════════════════════════════════════ */}
      <section style={{ background: NEGRO, padding: '80px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.22em', marginBottom: 24 }}>
            7 DÍAS PARA PROBARLO DE VERDAD
          </div>

          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(38px,6vw,60px)', color: 'white', lineHeight: 1, margin: '0 0 32px', letterSpacing: '0.02em' }}>
            SIN RIESGO REAL.
          </h2>

          <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.88)', lineHeight: 1.8, margin: '0 0 32px', maxWidth: 560 }}>
            Carga tus prospectos. Deja que Sofía te diga a quién llamar. Prepara una llamada real con Mi Llamada Perfecta™.
          </p>

          <div style={{ padding: '28px 30px', border: `1px solid rgba(78,205,196,0.25)`, borderRadius: 10, background: 'rgba(78,205,196,0.04)' }}>
            <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.88)', lineHeight: 1.75, margin: 0 }}>
              Si no sientes más claridad y más control — cancelas, sin costo, sin preguntas.
            </p>
          </div>
        </div>
      </section>

      {/* ── Separador ── */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* ════════════════════════════════════════════════════════════
          SECCIÓN 10 — FAQ
      ════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#0d0d0d', padding: '80px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.22em', marginBottom: 24 }}>
            PREGUNTAS FRECUENTES
          </div>

          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(38px,6vw,60px)', color: 'white', lineHeight: 1, margin: '0 0 40px', letterSpacing: '0.02em' }}>
            PREGUNTAS DEL CASO.
          </h2>

          <div>
            {[
              { p: '¿Qué es exactamente CBC™?',          r: 'Una app con IA — Sofía — que organiza tu proceso comercial: a quién llamar, qué decirle, cómo prepararte, y qué reportarle a tu jefe.' },
              { p: '¿Necesito instalar algo?',            r: 'Se añade a tu celular como una app — igual que cualquier app que ya uses. No necesitas App Store.' },
              { p: '¿Cuánto cuesta?',                     r: '$9.90/mes. Sin planes escondidos, sin letra pequeña. 7 días gratis para probarlo.' },
              { p: '¿Necesito saber de tecnología o IA?', r: 'No. Si puedes usar WhatsApp, puedes usar CBC™.' },
            ].map((faq, i) => (
              <FaqItem key={i} pregunta={faq.p} respuesta={faq.r} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Separador ── */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* ════════════════════════════════════════════════════════════
          SECCIÓN 11 — CTA FINAL
      ════════════════════════════════════════════════════════════ */}
      <section style={{ background: NEGRO, padding: '96px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(78,205,196,0.05), transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>

          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(42px,7vw,72px)', color: 'white', lineHeight: 0.95, margin: '0 0 8px', letterSpacing: '0.02em' }}>
            TIENES DOS OPCIONES.
          </h2>
          <h3 style={{ fontFamily: BEBAS, fontSize: 'clamp(22px,4vw,38px)', color: 'rgba(255,255,255,0.38)', lineHeight: 1, margin: '0 0 40px', letterSpacing: '0.02em', fontWeight: 400 }}>
            SIGUES IMPROVISANDO — O DEJAS QUE{' '}
            <span style={{ fontFamily: BEBAS, color: TEAL, fontSize: 'clamp(30px,5.5vw,52px)', letterSpacing: '0.06em', display: 'inline-block', verticalAlign: 'middle' }}>SOFÍA</span>{' '}TRABAJE POR TI.
          </h3>

          <BtnCTA label="Probar CBC™ gratis — 7 días →" />

          <p style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.30)', margin: '20px 0 0', letterSpacing: '0.08em' }}>
            $9.90/MES · SIN TARJETA LOS PRIMEROS 7 DÍAS · CANCELA CUANDO QUIERAS
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#060606', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.20)', letterSpacing: '0.12em', margin: 0 }}>
          © 2026 DIANA GARCÍA · ARQUITECTA DE AUTOMATIZACIONES · HAGO FÁCIL LO DIFÍCIL.
        </p>
      </footer>

    </div>
  )
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<div style={{ background: '#080808', minHeight: '100vh' }} />}>
      <SubscribeContent />
    </Suspense>
  )
}
