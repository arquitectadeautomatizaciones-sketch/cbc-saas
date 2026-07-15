'use client'

import { useState, useEffect, Suspense } from 'react'
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

// ── Textos de sueño ajustados gramaticalmente para el hero ────────────
const SUENO_HERO: Record<string, string> = {
  casa:     'tu casa',
  viaje:    'ese viaje que llevas postergando',
  estudios: 'ese sueño de estudiar que llevas esperando',
  deuda:    'esa deuda que no te deja dormir',
  carro:    'ese carro que prometiste cambiar',
  libertad: 'esa libertad sin culpa ni estrés',
}

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
  const nombreParam = params.get('nombre') ?? ''
  const suenoParam  = params.get('sueno')  ?? ''
  const primerNombre = nombreParam.split(' ')[0] || ''
  const suenoHero = suenoParam ? (SUENO_HERO[suenoParam] ?? 'ese sueño que llevas tiempo postergando') : 'ese sueño que llevas tiempo postergando'

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

          {/* Título personalizado */}
          <h1 className="fu" style={{ fontFamily: BEBAS, fontSize: 'clamp(48px,9vw,88px)', lineHeight: 0.92, margin: '0 0 24px', letterSpacing: '0.02em' }}>
            {primerNombre ? (
              <>
                <span style={{ color: 'white' }}>FELICIDADES, </span>
                <span style={{ color: ROJO }}>{primerNombre.toUpperCase()},</span>
                <br />
                <span style={{ color: 'white' }}>POR TU VALENTÍA.</span>
              </>
            ) : (
              <>
                <span style={{ color: 'white' }}>FELICIDADES</span>
                <br />
                <span style={{ color: 'white' }}>POR TU </span><span style={{ color: ROJO }}>VALENTÍA.</span>
              </>
            )}
          </h1>

          {/* Copy del hero */}
          <div className="fu2" style={{ maxWidth: 560, marginBottom: 36 }}>
            <p style={{ fontFamily: SANS, fontSize: 'clamp(16px,2.2vw,19px)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, margin: '0 0 18px' }}>
              El 99% de los vendedores ni siquiera se toman el tiempo de pensar dónde se quedan las comisiones que nunca llegan a su cuenta.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 'clamp(16px,2.2vw,19px)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, margin: '0 0 18px' }}>
              Pero conocer la verdad no sirve de nada si no cambias la realidad.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 'clamp(16px,2.2vw,19px)', color: 'rgba(255,255,255,0.62)', lineHeight: 1.75, margin: 0, borderLeft: `3px solid ${ROJO}`, paddingLeft: 18 }}>
              En 3 meses, si nada cambia, <span style={{ color: 'rgba(255,255,255,0.90)', fontWeight: 600 }}>{suenoHero}</span> va a seguir siendo solo eso — una ilusión difícil de alcanzar.
            </p>
          </div>

          <div className="fu3" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, marginBottom: 40 }}>
            <CluedoBtn label="YO SOY DE LOS QUE TOMAN ACCIÓN →" onClick={handleCheckout} disabled={loading} full={false} fontSize={18} />
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
          01b — ÉLITE MENTAL
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: '#0d0d0d', padding: '80px 24px' }}>
        <style>{`
          @keyframes bubbleIn {
            from { opacity: 0; transform: scale(0.82) translateY(6px); }
            to   { opacity: 1; transform: scale(1)    translateY(0);   }
          }
          .tbubble {
            background: rgba(255,255,255,0.08);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(255,255,255,0.15);
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            padding: 10px 14px;
            font-family: 'General Sans', system-ui, sans-serif;
            font-size: 13px;
            font-weight: 500;
            color: rgba(255,255,255,0.92);
            text-align: center;
            line-height: 1.4;
            max-width: 148px;
            animation: bubbleIn 0.4s ease both;
          }
          .tdot {
            border-radius: 50%;
            background: rgba(255,255,255,0.12);
            border: 1px solid rgba(255,255,255,0.13);
            flex-shrink: 0;
          }
          /* ── Reloj ── */
          .scene-clock {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-top: 14px;
            opacity: 0;
            animation: bubbleIn 0.4s ease 0.65s both;
          }
          .scene-clock-time {
            font-family: 'JetBrains Mono', monospace;
            font-size: 13px;
            font-weight: 500;
            color: rgba(255,255,255,0.75);
            letter-spacing: 0.06em;
          }
          /* ── Taza de café ── */
          .scene-coffee {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            margin-bottom: 14px;
            opacity: 0;
            animation: bubbleIn 0.4s ease 0.80s both;
          }
          @keyframes steamRise {
            0%   { transform: translateY(0) scaleX(1);   opacity: 0.5; }
            50%  { transform: translateY(-6px) scaleX(1.18); opacity: 0.7; }
            100% { transform: translateY(-12px) scaleX(0.85); opacity: 0; }
          }
          .steam-line {
            stroke: rgba(255,255,255,0.45);
            stroke-linecap: round;
            animation: steamRise 1.8s ease-in-out infinite;
          }
          .steam-line:nth-child(2) { animation-delay: 0.4s; }
          .steam-line:nth-child(3) { animation-delay: 0.8s; }
          /* Grid responsive */
          .elite-grid {
            display: grid;
            grid-template-columns: 1fr 200px 1fr;
            grid-template-rows: 1fr 1fr;
            grid-template-areas: "tl img tr" "bl img br";
            gap: 16px;
            align-items: center;
            justify-items: center;
            max-width: 640px;
            margin: 0 auto 40px;
          }
          .eg-tl  { grid-area: tl;  justify-self: end;   align-self: end;   }
          .eg-tr  { grid-area: tr;  justify-self: start; align-self: end;   }
          .eg-bl  { grid-area: bl;  justify-self: end;   align-self: start; }
          .eg-br  { grid-area: br;  justify-self: start; align-self: start; }
          .eg-img { grid-area: img; width: 100%; }

          @media (max-width: 560px) {
            .elite-grid {
              grid-template-columns: 1fr 1fr !important;
              grid-template-rows: auto auto auto !important;
              grid-template-areas: "tl tr" "img img" "bl br" !important;
              gap: 10px !important;
            }
            .eg-tl  { justify-self: stretch; align-self: auto; }
            .eg-tr  { justify-self: stretch; align-self: auto; }
            .eg-bl  { justify-self: stretch; align-self: auto; }
            .eg-br  { justify-self: stretch; align-self: auto; }
            .eg-img { width: 100%; max-width: 260px; justify-self: center; }
            .tbubble { max-width: 100% !important; font-size: 12px; }
          }
        `}</style>

        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 20 }}>MENTALIDAD DE ÉLITE</div>

          {/* ── Título ── */}
          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(36px,5.5vw,58px)', lineHeight: 0.95, margin: '0 0 24px', letterSpacing: '0.02em' }}>
            <span style={{ color: 'white' }}>SER VENDEDOR ES LA MEJOR PROFESIÓN DEL MUNDO.<br />Y TÚ PERTENECES A SU </span><span style={{ color: ROJO }}>ÉLITE.</span>
          </h2>

          {/* ── Cuerpo ── */}
          <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.88)', lineHeight: 1.8, margin: '0 0 28px', maxWidth: 620 }}>
            Los comerciales de alto nivel no solo se preparan como profesionales. También se preparan mentalmente — porque saben que el entorno pone a prueba algo más que su técnica: pone a prueba su temple.
          </p>

          {/* ── Giro ── */}
          <div style={{ background: '#0d0000', borderLeft: `4px solid ${ROJO}`, borderRadius: '0 10px 10px 0', padding: '20px 24px', maxWidth: 620, marginBottom: 40 }}>
            <div style={{ fontFamily: MONO, fontSize: 9, color: `${ROJO}cc`, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 14 }}>
              LA VERDAD DETRÁS DE LA MENTALIDAD
            </div>
            <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.90)', lineHeight: 1.8, margin: '0 0 14px' }}>
              Esa disciplina mental te distingue del 99% que solo improvisa.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.88)', lineHeight: 1.8, margin: 0 }}>
              Pero incluso la élite necesita algo más que mentalidad — necesita que ningún prospecto se enfríe mientras tú te preparas para ganar.
            </p>
          </div>

          {/* ══ CSS GRID — burbujas en celdas separadas de la imagen ══
               Desktop: [TL] [IMG] [TR]  /  [BL] [IMG] [BR]
               Móvil:   [TL] [TR]  /  [IMG IMG]  /  [BL] [BR]
               La imagen vive en grid-area "img" — solapamiento IMPOSIBLE */}
          <div className="elite-grid">

            {/* TL ─ cola apunta → hacia la imagen (derecha) */}
            <div className="eg-tl">
              <div className="tbubble" style={{ borderRadius: '22px 18px 20px 6px', transform: 'rotate(-2deg)', animationDelay: '0.10s' }}>
                "Hoy soy imparable." 🔥
              </div>
              <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-end', paddingRight: 8, marginTop: 5 }}>
                <div className="tdot" style={{ width: 7, height: 7 }} />
                <div className="tdot" style={{ width: 5, height: 5, marginTop: 1 }} />
                <div className="tdot" style={{ width: 3, height: 3, marginTop: 3 }} />
              </div>
            </div>

            {/* IMG ─ celda propia, ninguna burbuja puede solaparse */}
            <img
              className="eg-img"
              src="/elite-meditacion.jpg"
              alt="Ejecutiva meditando antes de su jornada comercial"
              style={{ display: 'block', borderRadius: 14, objectFit: 'cover', aspectRatio: '9/16', maxHeight: 420 }}
            />

            {/* TR ─ cola apunta → hacia la imagen (izquierda) */}
            <div className="eg-tr">
              {/* Taza de café humeante — esquina superior-derecha */}
              <div className="scene-coffee">
                <svg width="44" height="28" viewBox="0 0 44 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
                  {/* Vapor */}
                  <line className="steam-line" x1="14" y1="-2" x2="12" y2="-10" strokeWidth="1.4" />
                  <line className="steam-line" x1="22" y1="-2" x2="24" y2="-10" strokeWidth="1.4" />
                  <line className="steam-line" x1="30" y1="-2" x2="28" y2="-10" strokeWidth="1.4" />
                  {/* Taza */}
                  <path d="M8 4 H36 L33 24 H11 Z" stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" fill="none" strokeLinejoin="round" />
                  {/* Platillo */}
                  <path d="M4 26 Q22 28 40 26" stroke="rgba(255,255,255,0.4)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                  {/* Asa */}
                  <path d="M36 8 Q46 8 46 16 Q46 24 36 22" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                </svg>
              </div>
              <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-start', paddingLeft: 8, marginBottom: 5 }}>
                <div className="tdot" style={{ width: 3, height: 3, marginTop: 3 }} />
                <div className="tdot" style={{ width: 5, height: 5, marginTop: 1 }} />
                <div className="tdot" style={{ width: 7, height: 7 }} />
              </div>
              <div className="tbubble" style={{ borderRadius: '18px 22px 6px 20px', transform: 'rotate(1.5deg)', animationDelay: '0.25s' }}>
                "El dinero fluye hacia mí." 💰
              </div>
            </div>

            {/* BL ─ cola apunta → hacia la imagen (derecha) */}
            <div className="eg-bl">
              <div className="tbubble" style={{ borderRadius: '20px 6px 22px 18px', transform: 'rotate(2.5deg)', animationDelay: '0.40s' }}>
                "Cierro todos mis negocios." 🤝
              </div>
              <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-end', paddingRight: 8, marginTop: 5 }}>
                <div className="tdot" style={{ width: 7, height: 7 }} />
                <div className="tdot" style={{ width: 5, height: 5, marginTop: 1 }} />
                <div className="tdot" style={{ width: 3, height: 3, marginTop: 3 }} />
              </div>
              {/* Reloj 6:05 AM — esquina inferior-izquierda */}
              <div className="scene-clock" style={{ justifyContent: 'flex-end' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 15.5 14" />
                </svg>
                <span className="scene-clock-time">6:05 AM</span>
              </div>
            </div>

            {/* BR ─ cola apunta → hacia la imagen (izquierda) */}
            <div className="eg-br">
              <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-start', paddingLeft: 8, marginBottom: 5 }}>
                <div className="tdot" style={{ width: 3, height: 3, marginTop: 3 }} />
                <div className="tdot" style={{ width: 5, height: 5, marginTop: 1 }} />
                <div className="tdot" style={{ width: 7, height: 7 }} />
              </div>
              <div className="tbubble" style={{ borderRadius: '6px 20px 18px 22px', transform: 'rotate(-1deg)', animationDelay: '0.55s' }}>
                "Nada me detiene hoy." ⚡
              </div>
            </div>

          </div>
        </div>
      </section>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* ══════════════════════════════════════════════════════
          02b — BRECHA DE EJECUCIÓN
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: '#111', padding: '80px 24px' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600&display=swap');

          .brecha-grid {
            display: grid;
            grid-template-columns: 1fr 1.3fr;
            gap: 48px 52px;
            align-items: start;
            max-width: 900px;
            margin: 0 auto;
          }
          /* ── columna de imágenes: pizarra arriba, laptop abajo ── */
          .brecha-imgs {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .brecha-img-wrap {
            position: relative;
            border-radius: 12px;
            overflow: hidden;
            line-height: 0;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          }
          .brecha-img-wrap img { width: 100%; display: block; border-radius: 12px; }

          /* ── Fix META: overlay cubre MÉTA y el cero extra ── */
          .fix-meta {
            position: absolute;
            top: 3.5%; left: 5%;
            width: 31%; height: 14%;
            background: white;
            display: flex;
            align-items: center;
            padding-left: 3%;
          }
          .fix-meta span {
            font-family: 'Caveat', cursive;
            font-size: clamp(14px, 3.2vw, 34px);
            font-weight: 600;
            color: #1b55b8;
            line-height: 1;
          }
          .fix-zero {
            position: absolute;
            top: 21%; right: 2%;
            width: 9%; height: 15%;
            background: white;
          }

          @media (max-width: 640px) {
            .brecha-grid  { grid-template-columns: 1fr !important; }
            .brecha-imgs  { display: none; }
          }
        `}</style>

        <div className="brecha-grid">

          {/* ── Columna izquierda: texto ── */}
          <div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 20 }}>
              BRECHA DE EJECUCIÓN
            </div>

            <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(38px,5.5vw,60px)', lineHeight: 0.95, margin: '0 0 28px', letterSpacing: '0.02em' }}>
              <span style={{ color: 'white' }}>TU MENTE YA GANÓ.<br />TU AGENDA, </span><span style={{ color: ROJO }}>TODAVÍA NO.</span>
            </h2>

            <p style={{ fontFamily: SANS, fontSize: 'clamp(16px,2vw,19px)', color: 'rgba(255,255,255,0.90)', lineHeight: 1.7, margin: '0 0 24px', fontWeight: 500 }}>
              Porque la realidad no siempre coincide con tu identidad.
            </p>

            <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,1.8vw,17px)', color: 'rgba(255,255,255,0.88)', lineHeight: 1.85, margin: '0 0 32px' }}>
              Notificaciones que no paran. Un CRM que nunca se actualiza solo. Post-its que se acumulan. Y ese reporte del viernes que armas de memoria, con datos de tres sistemas distintos.
            </p>

            <div style={{ borderLeft: `4px solid ${ROJO}`, paddingLeft: 20, paddingTop: 4, paddingBottom: 4 }}>
              <p style={{ fontFamily: SANS, fontSize: 'clamp(16px,2vw,19px)', color: 'rgba(255,255,255,0.92)', lineHeight: 1.6, margin: 0, fontWeight: 600 }}>
                Esto es lo que la mentalidad no resuelve.
              </p>
            </div>
          </div>

          {/* ── Columna derecha: PIZARRA (arriba) + LAPTOP (abajo) ── */}
          <div className="brecha-imgs">

            {/* ══ IMAGEN 1 — Pizarra real con post-its ══ */}
            <div className="brecha-img-wrap">
              <img
                src="/pizarra-ventas.jpg"
                alt="Pizarra de ventas con meta $500.000.000 y post-its escritos a mano"
              />
            </div>

            {/* ══ IMAGEN 2 — Laptop con Excel pipeline ══ */}
            <div className="brecha-img-wrap">
              <img
                src="/laptop-excel.jpg"
                alt="Laptop con Excel pipeline de ventas — celdas de semáforo, mayoría en rojo"
              />
            </div>

          </div>

        </div>
      </section>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* ══════════════════════════════════════════════════════
          02b — ZAPATERO
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: '#111', padding: '100px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>

          {/* Título */}
          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(42px,7vw,72px)', lineHeight: 0.92, margin: '0 0 36px', letterSpacing: '0.02em' }}>
            <span style={{ color: 'white' }}>ZAPATERO A SUS </span>
            <span style={{ color: ROJO }}>ZAPATOS.</span>
          </h2>

          {/* Subtítulo plano */}
          <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.88)', lineHeight: 1.8, margin: '0 0 8px' }}>
            Todos sabemos que tu pasión es vender.
          </p>

          {/* Pregunta retórica 1 — escalón intermedio */}
          <p style={{ fontFamily: SANS, fontSize: 'clamp(20px,3vw,26px)', color: 'rgba(255,255,255,0.95)', lineHeight: 1.4, fontWeight: 600, margin: '32px 0 40px' }}>
            ¿Pero cuántas horas dedicas realmente a vender?
          </p>

          {/* Pregunta retórica 2 — pausa antes del relato */}
          <p style={{ fontFamily: SANS, fontSize: 'clamp(20px,3vw,26px)', color: 'rgba(255,255,255,0.95)', lineHeight: 1.4, fontWeight: 600, margin: '0 0 28px' }}>
            ¿Recuerdas el día que firmaste contrato como comercial?
          </p>

          {/* Párrafo de ilusión */}
          <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.88)', lineHeight: 1.8, margin: '0 0 36px' }}>
            ¡Cuánta ilusión por comenzar! Te imaginabas cumpliendo tu meta, cerrando ventas, comisionando.
          </p>

          {/* Lista acumulativa con opacidad progresiva */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '0 0 36px' }}>
            <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.80)', lineHeight: 1.75, margin: 0 }}>
              Pero con el paso de los días llegó el pipeline.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.84)', lineHeight: 1.75, margin: 0 }}>
              Llegó el CRM.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.88)', lineHeight: 1.75, margin: 0 }}>
              Llegaron los reportes para la reunión con el jefe que muchas veces has tenido que inventar.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.92)', lineHeight: 1.75, margin: 0 }}>
              Llegaron los WhatsApps sin responder, las reuniones para preparar.
            </p>
          </div>

          {/* Pregunta final — pausa antes del golpe */}
          <p style={{ fontFamily: SANS, fontSize: 'clamp(20px,3vw,26px)', color: 'rgba(255,255,255,0.95)', lineHeight: 1.4, fontWeight: 600, margin: '0 0 52px' }}>
            Y entre todo ese ruido, ¿te has preguntado cuántas horas de tu semana te dedicas realmente a vender?
          </p>

          {/* Clímax — frase final en Bebas grande, split de color */}
          <div style={{ borderLeft: `5px solid ${ROJO}`, paddingLeft: 28, background: 'rgba(232,0,29,0.06)', padding: '28px 28px', borderRadius: '0 10px 10px 0' }}>
            <p style={{ fontFamily: BEBAS, fontSize: 'clamp(28px,4.5vw,46px)', lineHeight: 1.05, letterSpacing: '0.02em', margin: 0 }}>
              <span style={{ color: 'rgba(255,255,255,0.90)' }}>PORQUE HAY UNA VERDAD QUE NINGÚN JEFE TE DICE: </span>
              <span style={{ color: ROJO }}>LAS TAREAS ADMINISTRATIVAS NO TE PAGAN LAS CUENTAS.</span>
            </p>
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
          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(38px,6vw,62px)', lineHeight: 0.95, margin: '0 0 32px', letterSpacing: '0.02em' }}>
            <span style={{ color: ROJO }}>TU DIAGNÓSTICO.</span>
          </h2>

          {/* Presentación en primera persona */}
          <div style={{ background: 'rgba(8,8,8,0.65)', backdropFilter: 'blur(12px)', border: `1px solid ${TEAL}22`, borderRadius: 14, padding: '28px 28px 24px', marginBottom: 28, maxWidth: 540 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: `linear-gradient(135deg, ${TEAL}30, ${TEAL}08)`, border: `1.5px solid ${TEAL}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 18 }}>🤝</span>
              </div>
              <div>
                <div style={{ fontFamily: BEBAS, fontSize: 18, color: TEAL, letterSpacing: '0.08em' }}>SOFÍA™</div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.14em' }}>PARTE DEL EQUIPO CBC™</div>
              </div>
            </div>
            <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.90)', lineHeight: 1.8, margin: '0 0 14px', fontStyle: 'italic' }}>
              "Hola, soy Sofía. 👋
            </p>
            <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.82)', lineHeight: 1.8, margin: '0 0 14px' }}>
              Soy parte del equipo de CBC™ — la que revisa tu pipeline cada mañana, te dice exactamente a quién llamar hoy, y te prepara para que entres a cada reunión sabiendo qué decir.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.82)', lineHeight: 1.8, margin: '0 0 14px' }}>
              Ya leí tu diagnóstico. Sé exactamente dónde se te está escapando el dinero. Solo necesito que entres — y lo resolvemos juntos."
            </p>
            <div style={{ paddingTop: 14, borderTop: `1px solid ${TEAL}18` }}>
              <span style={{ fontFamily: MONO, fontSize: 9, color: `${TEAL}70`, letterSpacing: '0.12em' }}>— SOFÍA™ · ASISTENTE COMERCIAL CBC™</span>
            </div>
          </div>

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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <span style={{ color: AMARILLO, fontSize: 14, letterSpacing: '0.05em' }}>★★★★★</span>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em' }}>CASO DOCUMENTADO · 15 MAY 2026</span>
                </div>
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

          {/* CTA "Dejar testimonio" */}
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <a
              href="mailto:hola@arquitectadeautomatizaciones.com?subject=Mi testimonio de CBC™"
              style={{ fontFamily: SANS, fontSize: 14, color: 'rgba(255,255,255,0.42)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 2, transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.42)')}
            >
              ¿Quieres ser el próximo caso documentado? Cuéntanos tu experiencia →
            </a>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start' }}>
            <div style={{ padding: '24px 28px', border: `1px solid rgba(78,205,196,0.22)`, borderRadius: 10, background: 'rgba(78,205,196,0.04)', maxWidth: 560 }}>
              <p style={{ fontFamily: SANS, fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, margin: 0 }}>
                Si no sientes más claridad y más control — cancelas, sin costo, sin preguntas.
              </p>
            </div>

            {/* Sello de garantía */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 18, padding: '16px 22px', border: `2px dashed ${VERDE_S}44`, borderRadius: 12, background: `${VERDE_S}06`, position: 'relative' }}>
              <div style={{ width: 58, height: 58, borderRadius: '50%', border: `2px solid ${VERDE_S}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: `${VERDE_S}0d` }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: BEBAS, fontSize: 11, color: VERDE_S, lineHeight: 1.1, letterSpacing: '0.04em' }}>7</div>
                  <div style={{ fontFamily: MONO, fontSize: 6, color: VERDE_S, lineHeight: 1.1, letterSpacing: '0.06em' }}>DÍAS</div>
                </div>
              </div>
              <div>
                <div style={{ fontFamily: BEBAS, fontSize: 18, color: VERDE_S, letterSpacing: '0.06em', lineHeight: 1.1 }}>GARANTÍA SIN RIESGO</div>
                <div style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, marginTop: 3 }}>7 días gratis · Sin tarjeta · Sin preguntas si cancelas</div>
              </div>
            </div>
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
      <footer style={{ background: '#060606', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '32px 24px', textAlign: 'center' }}>
        {/* Redes sociales */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 20 }}>
          {[
            { href: 'https://www.instagram.com/dianagarcia_automatizanegocios/', label: 'Instagram', color: '#E1306C', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg> },
            { href: 'https://www.tiktok.com/@arquitectautomatizacion', label: 'TikTok', color: '#69C9D0', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg> },
            { href: 'https://www.youtube.com/@ArquitectadeAutomatizaciones', label: 'YouTube', color: '#FF0000', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 1.96C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/></svg> },
            { href: 'https://www.linkedin.com/in/diana-garcia-arquitecta-de-automatizaciones', label: 'LinkedIn', color: '#0A66C2', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg> },
            { href: 'https://www.facebook.com/Arquitectadeautomatizaciones', label: 'Facebook', color: '#1877F2', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
          ].map(({ href, label, color, icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
              title={label}
              style={{ color: 'rgba(255,255,255,0.28)', transition: 'color 0.15s', display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => (e.currentTarget.style.color = color)}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}>
              {icon}
            </a>
          ))}
        </div>
        <p style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.12em', margin: 0 }}>
          © 2026 DIANA GARCÍA · ARQUITECTA DE AUTOMATIZACIONES · HAGO FÁCIL LO DIFÍCIL.
        </p>
      </footer>

      {/* ── Barra de notificación flotante ─────────────────── */}
      <SocialProofToast />

    </div>
  )
}

const TOASTS = [
  '🟢 3 personas viendo esta página ahora',
  '🟢 Alguien empezó su prueba gratis hace unos minutos',
  '🟢 2 comerciales se registraron en la última hora',
]

function SocialProofToast() {
  const [visible, setVisible] = useState(false)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    let showTimer: ReturnType<typeof setTimeout>
    let hideTimer: ReturnType<typeof setTimeout>

    const cycle = (i: number) => {
      const delay = 20000 + Math.random() * 10000
      showTimer = setTimeout(() => {
        setIdx(i % TOASTS.length)
        setVisible(true)
        hideTimer = setTimeout(() => {
          setVisible(false)
          cycle(i + 1)
        }, 4500)
      }, delay)
    }

    cycle(0)
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer) }
  }, [])

  return (
    <div style={{
      position: 'fixed',
      bottom: 28,
      left: 20,
      zIndex: 9999,
      maxWidth: 300,
      background: 'rgba(10,10,10,0.95)',
      border: '1px solid rgba(78,205,196,0.35)',
      borderLeft: '3px solid #4ECDC4',
      borderRadius: 10,
      padding: '12px 16px',
      fontFamily: "'General Sans', system-ui, sans-serif",
      fontSize: 13,
      color: 'rgba(255,255,255,0.90)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      backdropFilter: 'blur(8px)',
      transition: 'opacity 0.45s ease, transform 0.45s ease',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(10px)',
      pointerEvents: 'none',
    }}>
      {TOASTS[idx]}
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
