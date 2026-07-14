'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CluedoBtn } from '@/components/CluedoBtn'

// ── Paleta ─────────────────────────────────────────────────────────────
const ROJO   = '#e8001d'
const NEGRO  = '#080808'
const TEAL   = '#4ECDC4'
const VERDE_S = '#00C853'
const AMARILLO = '#F5C400'

// ── Tipografía ──────────────────────────────────────────────────────────
const BEBAS = "'Bebas Neue', Impact, sans-serif"
const SANS  = "'General Sans', system-ui, sans-serif"
const MONO  = "'JetBrains Mono', 'Courier New', monospace"

// ── Assets ─────────────────────────────────────────────────────────────
const TATIANA_PHOTO = 'https://assets.cdn.filesafe.space/MgsViYLMmCdJksx9p3va/media/6a13da46fe2210f89e7033ce.jpeg'

// ── Colores por herramienta (sospechosos Cluedo) ─────────────────────
const TOOL_COLORS = [
  '#4ECDC4', // 1 IA en Acción™ — teal
  '#F5C400', // 2 Reporte al Jefe™ — amarillo
  '#00C853', // 3 Mi Llamada Perfecta™ — verde
  '#4A90D9', // 4 Propuesta Express™ — azul acero
  '#9B59B6', // 5 Perfil DISC del Cliente™ — púrpura
  '#e8001d', // 6 Escudo de Objeciones™ — rojo
  '#FF6B35', // 7 QR de Captura Inteligente™ — naranja
  '#00B4D8', // 8 Copiloto de Reunión™ — cian
  '#D4A843', // 9 Networker Élite™ — dorado
  'rgba(255,255,255,0.88)', // 10 Mi Modo Crack™ — blanco suave
]

// ── Íconos SVG ────────────────────────────────────────────────────────
const TOOL_ICONS = [
  <svg key="ia"        width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4M7 8l3 3-3 3M13 14h4"/></svg>,
  <svg key="reporte"   width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  <svg key="llamada"   width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  <svg key="propuesta" width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><polyline points="9,15 11,17 15,13"/></svg>,
  <svg key="disc"      width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>,
  <svg key="escudo"    width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  <svg key="qr"        width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3"/></svg>,
  <svg key="copiloto"  width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="22"/><line x1="2" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="22" y2="12"/></svg>,
  <svg key="networker" width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  <svg key="crack"     width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>,
]

// ── FAQ ───────────────────────────────────────────────────────────────
function FaqItem({ pregunta, respuesta }: { pregunta: string; respuesta: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <button onClick={() => setOpen(v => !v)} style={{ width: '100%', textAlign: 'left', padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
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

// ── Página ────────────────────────────────────────────────────────────
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

  const herramientas = [
    { nombre: 'IA en Acción™',               desc: 'Investiga prospectos, prepara reuniones, calcula qué te cuesta no actuar, reactiva leads fríos. 8 situaciones, resueltas en segundos.' },
    { nombre: 'Reporte al Jefe™',             desc: 'Tu reporte de desempeño, listo con tus datos reales. Sin buscar nada.' },
    { nombre: 'Mi Llamada Perfecta™',         desc: 'Guión personalizado: apertura, diagnóstico, propuesta, cierre. Antes de marcar.' },
    { nombre: 'Propuesta Express™',           desc: '5 campos → propuesta lista + versión WhatsApp en 2 minutos.' },
    { nombre: 'Perfil DISC del Cliente™',     desc: 'Sabe cómo hablarle a cada prospecto antes de que levantes el teléfono.' },
    { nombre: 'Escudo de Objeciones™',        desc: 'La respuesta exacta para cada objeción, en segundos. No más improvisar.' },
    { nombre: 'QR de Captura Inteligente™',   desc: 'El prospecto escanea, entra solo a tu sistema. Sin formularios.' },
    { nombre: 'Copiloto de Reunión™',         desc: 'GPS de negociación, fase a fase, en vivo. Nunca más pierdes el hilo.' },
    { nombre: 'Networker Élite™',             desc: 'Convierte contactos de eventos en leads reales, en 48 horas.' },
    { nombre: 'Mi Modo Crack™',               desc: 'Tu ritual mental diario, antes de la primera llamada. Enfoque total.' },
  ]

  return (
    <div style={{ fontFamily: SANS, overflowX: 'hidden', background: NEGRO }}>

      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .fu  { animation: fadeUp 0.6s ease both; }
        .fu2 { animation: fadeUp 0.6s 0.12s ease both; }
        .fu3 { animation: fadeUp 0.6s 0.24s ease both; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px', position: 'sticky', top: 0, zIndex: 50, background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: BEBAS, fontSize: 20, color: 'white', letterSpacing: '0.08em' }}>CBC™</span>
          <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.18em' }}>CIERRE BAJO CONTROL</span>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════
          01 — HERO
      ══════════════════════════════════════════════════════ */}
      <section style={{
        padding: '88px 24px 80px',
        position: 'relative', overflow: 'hidden',
        backgroundImage: "linear-gradient(to right, rgba(8,8,8,0.96) 0%, rgba(8,8,8,0.82) 50%, rgba(8,8,8,0.35) 100%), url('/hero-detective-2.jpg')",
        backgroundSize: 'cover', backgroundPosition: 'center 20%',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(232,0,29,0.06), transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
          <div className="fu" style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 28 }}>
            CASO RESUELTO · SIGUIENTE PASO
          </div>

          <h1 className="fu" style={{ fontFamily: BEBAS, fontSize: 'clamp(52px,10vw,96px)', lineHeight: 0.92, margin: '0 0 4px', letterSpacing: '0.02em' }}>
            <span style={{ color: 'white' }}>EL SISTEMA QUE </span><span style={{ color: ROJO }}>CIERRA</span>
          </h1>
          <h1 className="fu" style={{ fontFamily: BEBAS, fontSize: 'clamp(52px,10vw,96px)', lineHeight: 0.92, margin: '0 0 28px', letterSpacing: '0.02em', color: 'white' }}>
            LO QUE TÚ ENCUENTRAS.
          </h1>

          <p className="fu2" style={{ fontFamily: SANS, fontSize: 'clamp(16px,2.5vw,19px)', color: 'rgba(255,255,255,0.82)', lineHeight: 1.7, margin: '0 0 36px', maxWidth: 520 }}>
            Ya sabes dónde está la fuga. Sofía se encarga de taparla — y de que no vuelva a abrirse.
          </p>

          <div className="fu3" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, marginBottom: 40 }}>
            <CluedoBtn label="PROBAR CBC™ GRATIS — 7 DÍAS →" onClick={handleCheckout} disabled={loading} full={false} />
            {cancelled && <p style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.50)', margin: 0 }}>Cancelaste el proceso. Puedes iniciarlo cuando quieras.</p>}
            {error && <p style={{ fontFamily: SANS, fontSize: 13, color: ROJO, margin: 0 }}>{error}</p>}
            <p style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.35)', margin: 0, letterSpacing: '0.1em' }}>
              $9.90/MES · 7 DÍAS GRATIS · CANCELA CUANDO QUIERAS
            </p>
          </div>

          {/* Badge PWA */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 16px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.40)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            <span style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Se instala en tu celular como app real</span>
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* ══════════════════════════════════════════════════════
          02 — DOLOR
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: NEGRO, padding: '80px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 20 }}>EL PROBLEMA</div>
          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(38px,6vw,62px)', lineHeight: 0.95, margin: '0 0 8px', letterSpacing: '0.02em' }}>
            <span style={{ color: 'white' }}>EL DÍA QUE NUNCA</span>
          </h2>
          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(38px,6vw,62px)', lineHeight: 0.95, margin: '0 0 44px', letterSpacing: '0.02em' }}>
            <span style={{ color: ROJO }}>TERMINA</span><span style={{ color: 'white' }}> COMO DEBERÍA.</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              'Miras la lista 30 minutos. Empiezas por quien recordabas — no por quien más cerca estaba de comprar.',
              'Tu jefe pide el reporte del viernes. Buscas datos en tres sistemas distintos. Armas algo que suena bien. Pero tú sabes que es a medias.',
              'Enviaste la propuesta el martes. Ya es jueves. No sabes si llamar, escribir o esperar. El silencio te paraliza.',
            ].map((txt, i) => (
              <div key={i} style={{ display: 'flex', gap: 20, padding: '28px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', alignItems: 'flex-start' }}>
                <span style={{ fontFamily: MONO, fontSize: 10, color: ROJO, fontWeight: 700, flexShrink: 0, marginTop: 4, letterSpacing: '0.1em' }}>0{i + 1}</span>
                <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, margin: 0 }}>{txt}</p>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, margin: '32px 0 0' }}>
            Y mientras tanto — ese prospecto se está enfriando. Sin que nadie te avise.
          </p>
        </div>
      </section>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* ══════════════════════════════════════════════════════
          03 — QUÉ ES
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: '#0d0d0d', padding: '80px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 20 }}>QUÉ ES CBC™</div>
          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(38px,6vw,62px)', lineHeight: 0.95, margin: '0 0 4px', letterSpacing: '0.02em' }}>
            <span style={{ color: 'white' }}>NO ES MAGIA.</span>
          </h2>
          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(38px,6vw,62px)', lineHeight: 0.95, margin: '0 0 32px', letterSpacing: '0.02em' }}>
            <span style={{ color: ROJO }}>NO CIERRA</span><span style={{ color: 'white' }}> POR TI.</span>
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, margin: '0 0 18px', maxWidth: 580 }}>
            CBC™ no reemplaza tu talento ni tu conversación.
          </p>
          <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, margin: '0 0 18px', maxWidth: 580 }}>
            Es una app con IA — Sofía — que hace las tareas repetitivas que hoy te roban 2 horas al día, para que toda tu energía vaya donde realmente se generan las comisiones: en el cierre.
          </p>
          <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, margin: 0, maxWidth: 580 }}>
            Se instala en tu celular como una app real. Solo necesitas internet.
          </p>
        </div>
      </section>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* ══════════════════════════════════════════════════════
          04 — VS CRM
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: NEGRO, padding: '80px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 20 }}>CBC™ VS. TU CRM ACTUAL</div>
          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(32px,5vw,54px)', lineHeight: 1, margin: '0 0 4px', letterSpacing: '0.02em', color: 'white' }}>"YA TENGO CRM."</h2>
          <h3 style={{ fontFamily: BEBAS, fontSize: 'clamp(22px,3.5vw,38px)', color: 'rgba(255,255,255,0.38)', lineHeight: 1, margin: '0 0 36px', letterSpacing: '0.02em', fontWeight: 400 }}>BIEN. PERO TU CRM NO HACE ESTO:</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
            {[
              'No te dice a quién llamar hoy',
              'No prepara tu llamada',
              'No te avisa que ese prospecto lleva 7 días sin respuesta',
              'No redacta tu propuesta',
              'No calcula cuánto te cuesta cada día sin actuar',
            ].map((txt, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 18px', background: 'rgba(232,0,29,0.04)', border: '1px solid rgba(232,0,29,0.10)', borderRadius: 8 }}>
                <span style={{ fontFamily: MONO, fontSize: 13, color: 'rgba(232,0,29,0.55)', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✗</span>
                <span style={{ fontFamily: SANS, fontSize: 'clamp(14px,1.8vw,16px)', color: 'rgba(255,255,255,0.72)', lineHeight: 1.5 }}>{txt}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: '22px 26px', background: 'rgba(78,205,196,0.05)', border: '1px solid rgba(78,205,196,0.18)', borderRadius: 10 }}>
            <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, margin: '0 0 6px' }}>Tu CRM sabe todo. Y no cierra nada.</p>
            <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: TEAL, lineHeight: 1.7, margin: 0, fontWeight: 600 }}>CBC™ decide, prepara y avisa. Tú solo cierras.</p>
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* ══════════════════════════════════════════════════════
          05 — 10 HERRAMIENTAS
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: '#0d0d0d', padding: '80px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 20 }}>10 HERRAMIENTAS</div>
          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(38px,6vw,62px)', lineHeight: 0.95, margin: '0 0 4px', letterSpacing: '0.02em', color: 'white' }}>TODO LO QUE</h2>
          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(38px,6vw,62px)', lineHeight: 0.95, margin: '0 0 44px', letterSpacing: '0.02em' }}>
            <span style={{ color: TEAL }}>SOFÍA</span><span style={{ color: 'white' }}> HACE POR TI:</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 6 }}>
            {herramientas.map((h, i) => {
              const c = TOOL_COLORS[i]
              return (
                <div key={i} style={{
                  display: 'flex', gap: 16, alignItems: 'flex-start',
                  padding: '20px 18px',
                  background: `rgba(8,8,8,0.6)`,
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderLeft: `3px solid ${c}`,
                  borderRadius: 10,
                }}>
                  <div style={{ color: c, flexShrink: 0, marginTop: 2 }}>{TOOL_ICONS[i]}</div>
                  <div>
                    <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: c, marginBottom: 5, letterSpacing: '0.06em' }}>{h.nombre}</div>
                    <div style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.62)', lineHeight: 1.6 }}>{h.desc}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* ══════════════════════════════════════════════════════
          06 — SOFÍA
      ══════════════════════════════════════════════════════ */}
      <section style={{
        padding: '80px 24px', position: 'relative', overflow: 'hidden',
        backgroundImage: "linear-gradient(to right, rgba(8,8,8,0.96) 0%, rgba(8,8,8,0.85) 50%, rgba(8,8,8,0.40) 100%), url('/sofia-shadow.jpg')",
        backgroundSize: 'cover', backgroundPosition: 'center center',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 70% at 70% 50%, rgba(78,205,196,0.06), transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: `${TEAL}70`, letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 20 }}>SOFÍA™ · IA</div>
          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(38px,6vw,62px)', lineHeight: 0.95, margin: '0 0 4px', letterSpacing: '0.02em', color: 'white' }}>SOFÍA YA LEYÓ</h2>
          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(38px,6vw,62px)', lineHeight: 0.95, margin: '0 0 28px', letterSpacing: '0.02em' }}>
            <span style={{ color: ROJO }}>TU DIAGNÓSTICO.</span>
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.82)', lineHeight: 1.8, margin: '0 0 24px', maxWidth: 520 }}>
            Sabe exactamente dónde se te escapan las comisiones — y calibra cada recomendación a tu caso específico, no a un genérico.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 500 }}>
            {['Cada mañana te dice a quién llamar.', 'Cada seguimiento, ya redactado.', 'Cada semana, tu reporte, listo.'].map((txt, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ color: TEAL, fontFamily: MONO, fontSize: 14, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>→</span>
                <span style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>{txt}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* ══════════════════════════════════════════════════════
          07 — TESTIMONIO TATIANA (fondo oscuro #1a1a1a)
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: '#1a1a1a', padding: '80px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 20 }}>CASO DOCUMENTADO · MAYO 2026</div>

          <div style={{ background: '#111', borderRadius: 12, borderLeft: `4px solid ${AMARILLO}`, padding: '32px 28px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -12, right: 20, fontFamily: BEBAS, fontSize: 96, color: AMARILLO, opacity: 0.06, lineHeight: 1, userSelect: 'none' }}>"</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, position: 'relative' }}>
              <img src={TATIANA_PHOTO} alt="Tatiana Panadero" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', flexShrink: 0, border: `2px solid ${AMARILLO}40` }} />
              <div>
                <div style={{ fontFamily: SANS, fontWeight: 700, color: AMARILLO, fontSize: 15 }}>Tatiana Panadero</div>
                <div style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.50)', marginTop: 2 }}>Ejecutiva Comercial Senior · Bogotá, Colombia</div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em', marginTop: 4 }}>CASO DOCUMENTADO · 15 MAY 2026</div>
              </div>
            </div>
            <blockquote style={{ fontFamily: SANS, fontSize: 'clamp(14px,2vw,16px)', color: 'rgba(255,255,255,0.82)', lineHeight: 1.8, margin: '0 0 20px', padding: 0, borderLeft: 'none', fontStyle: 'italic', position: 'relative' }}>
              "Está buenísimo, de verdad está genial. El semáforo, el script para reportar al jefe… tal cual.{' '}
              <strong style={{ fontStyle: 'normal', color: 'white' }}>Eso es sencillo, corto, y es lo que de verdad le importa a los directores a nivel de números.</strong>
              <br /><br />
              Imagínate que tuve una reunión con mi nueva directora y tal cual manejé el speech. Donde son interesantes los números, usé la plantilla… eso me sirvió mucho, me fue súper bien en la reunión.
              <br /><br />
              <strong style={{ fontStyle: 'normal', color: 'white' }}>Si voy bien digo tal cosa, si voy regular digo tal cosa, si voy mal digo tal cosa. Concreto.</strong>{' '}Era exactamente lo que ella quería escuchar."
            </blockquote>
            <div style={{ paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em' }}>TESTIMONIO DOCUMENTADO · 15 MAY 2026 · BOGOTÁ, COLOMBIA</span>
            </div>
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* ══════════════════════════════════════════════════════
          08 — PRECIO (fondo #222)
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: '#222', padding: '80px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 20 }}>PRECIO</div>

          <div style={{ background: '#111', borderRadius: 14, padding: '48px 36px', maxWidth: 480, margin: '0 auto', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>

            {/* Sello CONFIRMADO */}
            <div style={{ position: 'absolute', top: 20, right: 20, fontFamily: MONO, fontSize: 8, color: VERDE_S, border: `1px solid ${VERDE_S}`, borderRadius: 4, padding: '3px 8px', letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.85 }}>
              ● CASO RESUELTO
            </div>

            <div style={{ fontFamily: BEBAS, fontSize: 88, color: 'white', lineHeight: 1, marginBottom: 4, letterSpacing: '-0.01em' }}>
              <span style={{ fontFamily: MONO, fontSize: 28, verticalAlign: 'super', lineHeight: 1, color: 'rgba(255,255,255,0.55)' }}>$</span>9.90
            </div>
            <div style={{ fontFamily: SANS, fontSize: 14, color: 'rgba(255,255,255,0.50)', marginBottom: 28 }}>USD al mes · Menos que un café al día</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32, textAlign: 'left' }}>
              {['7 días gratis — sin tarjeta hasta que decidas', 'Cancela cuando quieras — sin preguntas', 'Sin planes escondidos. Sin letra pequeña.'].map((f, i) => (
                <div key={i} style={{ fontFamily: SANS, fontSize: 15, color: 'rgba(255,255,255,0.82)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ color: VERDE_S, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <CluedoBtn label="PROBAR CBC™ GRATIS →" onClick={handleCheckout} disabled={loading} />
            <p style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.28)', margin: '14px 0 0' }}>Pago seguro con Stripe. No almacenamos tu tarjeta.</p>
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* ══════════════════════════════════════════════════════
          09 — TRIAL / GARANTÍA
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: NEGRO, padding: '80px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 20 }}>7 DÍAS PARA PROBARLO DE VERDAD</div>
          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(38px,6vw,62px)', lineHeight: 0.95, margin: '0 0 4px', letterSpacing: '0.02em' }}>
            <span style={{ color: 'white' }}>SIN </span><span style={{ color: ROJO }}>RIESGO</span><span style={{ color: 'white' }}> REAL.</span>
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.82)', lineHeight: 1.8, margin: '28px 0 28px', maxWidth: 560 }}>
            Carga tus prospectos. Deja que Sofía te diga a quién llamar. Prepara una llamada real con Mi Llamada Perfecta™.
          </p>
          <div style={{ padding: '24px 28px', border: `1px solid rgba(78,205,196,0.22)`, borderRadius: 10, background: 'rgba(78,205,196,0.04)' }}>
            <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, margin: 0 }}>
              Si no sientes más claridad y más control — cancelas, sin costo, sin preguntas.
            </p>
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* ══════════════════════════════════════════════════════
          10 — FAQ
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: '#0d0d0d', padding: '80px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 20 }}>PREGUNTAS FRECUENTES</div>
          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(38px,6vw,62px)', lineHeight: 0.95, margin: '0 0 36px', letterSpacing: '0.02em' }}>
            <span style={{ color: 'white' }}>PREGUNTAS </span><span style={{ color: ROJO }}>DEL CASO.</span>
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

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* ══════════════════════════════════════════════════════
          11 — CTA FINAL
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: NEGRO, padding: '96px 24px 88px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(232,0,29,0.07), transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 24 }}>DECIDE AHORA</div>
          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(42px,7vw,74px)', lineHeight: 0.95, margin: '0 0 8px', letterSpacing: '0.02em', color: 'white' }}>TIENES DOS OPCIONES.</h2>
          <h3 style={{ fontFamily: BEBAS, fontSize: 'clamp(20px,3.5vw,34px)', color: 'rgba(255,255,255,0.32)', lineHeight: 1.1, margin: '0 0 40px', letterSpacing: '0.02em', fontWeight: 400 }}>
            SIGUES IMPROVISANDO — O DEJAS QUE{' '}
            <span style={{ color: TEAL }}>SOFÍA</span>{' '}TRABAJE POR TI.
          </h3>
          <CluedoBtn label="PROBAR CBC™ GRATIS — 7 DÍAS →" onClick={handleCheckout} disabled={loading} full={false} />
          <p style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.25)', margin: '18px 0 0', letterSpacing: '0.1em' }}>
            $9.90/MES · SIN TARJETA LOS PRIMEROS 7 DÍAS · CANCELA CUANDO QUIERAS
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#060606', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.12em', margin: 0 }}>
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
