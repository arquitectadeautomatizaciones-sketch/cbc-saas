'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const DiagnosticoInteractivo = dynamic(() => import('@/components/landing/DiagnosticoInteractivo'), { ssr: false })
const TestimonioModal = dynamic(() => import('@/components/landing/TestimonioModal'), { ssr: false })

// ── Brand ────────────────────────────────────────────────
const VERDE = '#1A4A44'
const TEAL = '#4ECDC4'
const BEIGE = '#F5F0E8'

// ── Dashboard Mockup ─────────────────────────────────────
function DashboardMockup() {
  return (
    <div style={{ position: 'relative', maxWidth: 420, margin: '0 auto' }}>
      <div style={{
        position: 'absolute',
        bottom: -24,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '70%',
        height: 40,
        background: TEAL,
        filter: 'blur(28px)',
        opacity: 0.35,
        borderRadius: '50%',
        zIndex: 0,
      }} />
      <div style={{
        position: 'relative',
        zIndex: 1,
        background: '#0f1e1c',
        borderRadius: 14,
        padding: 3,
        boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)',
      }}>
        <div style={{ background: '#0a1614', borderRadius: 11, overflow: 'hidden', padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, padding: '5px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 7 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {['#ef4444', '#f59e0b', '#10b981'].map(c => (
                <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
              ))}
            </div>
            <div style={{ flex: 1, textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
              cierrebajocontrol.com/dashboard
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr', gap: 10 }}>
            <div style={{ background: VERDE, borderRadius: 8, padding: '12px 8px' }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: 'white', marginBottom: 14 }}>CBC™</div>
              {['Dashboard', 'Prospectos', 'Pipeline', 'Herramientas', 'Sofía'].map((item, i) => (
                <div key={item} style={{
                  fontSize: 9,
                  color: i === 0 ? TEAL : 'rgba(255,255,255,0.45)',
                  padding: '5px 6px',
                  borderRadius: 5,
                  marginBottom: 3,
                  background: i === 0 ? 'rgba(78,205,196,0.12)' : 'transparent',
                  fontWeight: i === 0 ? 700 : 400,
                }}>
                  {item}
                </div>
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'white' }}>Buenos días, María.</div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)' }}>3 prospectos urgentes hoy.</div>
                </div>
                <div style={{ background: TEAL, borderRadius: 5, padding: '3px 7px', fontSize: 8, fontWeight: 800, color: VERDE }}>
                  DÍA 3 TRIAL
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '9px 10px', marginBottom: 8 }}>
                <div style={{ fontSize: 8, fontWeight: 800, color: TEAL, marginBottom: 8, letterSpacing: '0.06em' }}>⚡ CONTACTA HOY</div>
                {[
                  { name: 'Tech Solutions', info: 'Seguros · 12d', color: '#ef4444' },
                  { name: 'Grupo Empresarial', info: 'B2B · 9d', color: '#ef4444' },
                  { name: 'Distribuidora XL', info: 'Retail · 5d', color: '#f59e0b' },
                ].map(p => (
                  <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, flexShrink: 0, boxShadow: `0 0 5px ${p.color}80` }} />
                    <div style={{ flex: 1, fontSize: 9, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)' }}>{p.info}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <div style={{ background: 'rgba(78,205,196,0.1)', borderRadius: 7, padding: '7px 9px', border: '1px solid rgba(78,205,196,0.2)' }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: TEAL }}>$28k</div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)' }}>En juego</div>
                </div>
                <div style={{ background: 'rgba(134,239,172,0.08)', borderRadius: 7, padding: '7px 9px', border: '1px solid rgba(134,239,172,0.2)' }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#86efac' }}>3 🏆</div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)' }}>Victorias</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ height: 6, background: '#1a2820', borderRadius: '0 0 11px 11px' }} />
      </div>
      <div style={{
        position: 'absolute',
        top: -12,
        right: -10,
        background: 'white',
        borderRadius: 10,
        padding: '6px 10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        zIndex: 2,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: VERDE }}>Sistema activo</span>
      </div>
    </div>
  )
}

// ── Data ─────────────────────────────────────────────────
const DOLORES = [
  'Llamaste a un prospecto que ya firmó con tu competencia — porque no lo contactaste a tiempo.',
  'Tu jefe te preguntó cómo va el pipeline y tuviste que improvisar los números.',
  'Pasaste 40 minutos redactando un mensaje de seguimiento que terminó siendo genérico.',
  'Tienes 5 prospectos "interesados" de hace tres meses que no avanzaron… y no sabes por qué.',
  'Memorizas quién necesita seguimiento en lugar de tener un sistema que te lo diga.',
  'Cierras menos de lo que vendes porque el proceso falla entre la propuesta y el sí.',
]

const COMPARATIVA = [
  { feature: 'Semáforo de urgencia automático', cbc: true, excel: false, crm: '~' },
  { feature: 'Mensajes de seguimiento listos para enviar', cbc: true, excel: false, crm: false },
  { feature: 'Guión de llamada con contexto real del prospecto', cbc: true, excel: false, crm: false },
  { feature: 'Propuesta Express con neuroventas en 2 min', cbc: true, excel: false, crm: false },
  { feature: 'Perfil DISC del prospecto para cerrar mejor', cbc: true, excel: false, crm: false },
  { feature: 'Reporte al Jefe™ — listo en un toque', cbc: true, excel: false, crm: '~' },
  { feature: 'IA en Acción — 8 momentos clave del vendedor', cbc: true, excel: false, crm: false },
  { feature: 'IA que conoce tu pipeline real (Sofía)', cbc: true, excel: false, crm: false },
  { feature: 'Sin instalación en empresa ni aprobación de IT', cbc: true, excel: true, crm: false },
  { feature: 'Hecho para el vendedor individual', cbc: true, excel: true, crm: false },
]

const FAQ = [
  {
    q: '¿Cuánto tiempo necesito para configurar CBC?',
    a: 'Menos de 10 minutos. Creas tu cuenta, cargas tus primeros prospectos y el semáforo empieza a funcionar al instante. No hay configuración técnica ni integración con tu empresa.',
  },
  {
    q: '¿Mis datos de prospectos son privados?',
    a: 'Totalmente. Tus prospectos son tuyos. Nadie más los ve — ni tu empresa, ni nosotros. Usamos Supabase con cifrado en tránsito y en reposo.',
  },
  {
    q: '¿Funciona si vendo en cualquier sector?',
    a: 'Sí. CBC fue diseñado para vendedores B2B de cualquier industria — seguros, tecnología, servicios profesionales, distribución. Si tienes prospectos y haces seguimiento, CBC funciona.',
  },
  {
    q: '¿Qué pasa después de los 7 días gratis?',
    a: 'Te cobramos $9.90 USD al mes. Sin contrato. Cancelas cuando quieras desde tu perfil en un clic. No hay letra pequeña.',
  },
  {
    q: '¿CBC reemplaza mi CRM actual?',
    a: 'No necesariamente. CBC está diseñado para el vendedor individual que necesita mover su pipeline todos los días. Si tu empresa usa un CRM corporativo para reportes, puedes usar ambos — CBC para tu gestión diaria y el CRM para lo que pide tu empresa.',
  },
  {
    q: '¿Necesito saber de tecnología para usarlo?',
    a: 'Para nada. Si sabes usar WhatsApp, sabes usar CBC. Fue diseñado pensando en vendedores en campo — interfaz limpia, decisiones claras, sin curva de aprendizaje.',
  },
]

// ── Calculadora ROI ──────────────────────────────────────
function CalculadoraROI() {
  const [prospectos, setProspectos] = useState(2)
  const [comision, setComision] = useState(500)
  const perdida = prospectos * comision

  const fmt = (n: number) =>
    '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })

  return (
    <section style={{ background: VERDE, padding: '80px 24px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Headline */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: TEAL, textTransform: 'uppercase' }}>
            ¿Vale la pena?
          </p>
          <h2 style={{ margin: 0, fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, color: 'white', lineHeight: 1.2 }}>
            CBC™ se paga solo<br />con una sola venta.
          </h2>
        </div>

        {/* Calculator card */}
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 24,
          padding: '40px 36px',
        }}>
          {/* Field 1 */}
          <div style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
              Prospectos perdidos al mes
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <input
                type="range"
                min={1}
                max={20}
                step={1}
                value={prospectos}
                onChange={e => setProspectos(Number(e.target.value))}
                style={{ flex: 1, accentColor: TEAL, cursor: 'pointer', height: 6 }}
              />
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(78,205,196,0.4)',
                borderRadius: 10,
                padding: '8px 16px',
                minWidth: 64,
                textAlign: 'center',
              }}>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={prospectos}
                  onChange={e => setProspectos(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: TEAL,
                    fontWeight: 900,
                    fontSize: 22,
                    width: 48,
                    textAlign: 'center',
                    outline: 'none',
                    MozAppearance: 'textfield' as React.CSSProperties['MozAppearance'],
                  }}
                />
              </div>
            </div>
          </div>

          {/* × */}
          <div style={{ textAlign: 'center', fontSize: 28, color: 'rgba(255,255,255,0.3)', marginBottom: 32, fontWeight: 900 }}>
            ×
          </div>

          {/* Field 2 */}
          <div style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
              Comisión promedio por venta (USD)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <input
                type="range"
                min={100}
                max={10000}
                step={100}
                value={comision}
                onChange={e => setComision(Number(e.target.value))}
                style={{ flex: 1, accentColor: TEAL, cursor: 'pointer', height: 6 }}
              />
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(78,205,196,0.4)',
                borderRadius: 10,
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: 700 }}>$</span>
                <input
                  type="number"
                  min={1}
                  max={99999}
                  value={comision}
                  onChange={e => setComision(Math.max(1, Math.min(99999, Number(e.target.value) || 1)))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: TEAL,
                    fontWeight: 900,
                    fontSize: 20,
                    width: 72,
                    textAlign: 'center',
                    outline: 'none',
                    MozAppearance: 'textfield' as React.CSSProperties['MozAppearance'],
                  }}
                />
              </div>
            </div>
          </div>

          {/* = divider */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginBottom: 28 }} />

          {/* Result */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Estás dejando en la mesa
            </p>
            <div style={{
              fontSize: 'clamp(44px, 8vw, 72px)',
              fontWeight: 900,
              color: TEAL,
              lineHeight: 1,
              letterSpacing: '-0.03em',
              marginBottom: 8,
              transition: 'all 0.15s ease',
            }}>
              {fmt(perdida)}
            </div>
            <p style={{ margin: 0, fontSize: 16, color: 'rgba(255,255,255,0.6)' }}>
              perdidos cada mes por prospectos que se enfrían.
            </p>
          </div>
        </div>

        {/* Fixed CBC price line */}
        <div style={{
          marginTop: 20,
          textAlign: 'center',
          padding: '16px 24px',
          background: 'rgba(78,205,196,0.1)',
          border: '1px solid rgba(78,205,196,0.25)',
          borderRadius: 14,
        }}>
          <p style={{ margin: 0, fontSize: 15, color: 'rgba(255,255,255,0.85)', fontWeight: 600, lineHeight: 1.5 }}>
            💡 <strong style={{ color: TEAL }}>CBC™ cuesta $9.90/mes</strong> — menos de lo que pierdes en una sola venta que se enfría.
          </p>
        </div>
      </div>

      <style>{`
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </section>
  )
}

// ── Page ─────────────────────────────────────────────────
export default function LandingPage() {
  const [testimonioAbierto, setTestimonioAbierto] = useState(false)

  const iconCheck = (val: boolean | string) => {
    if (val === true) return <span style={{ color: '#10b981', fontSize: 17, display: 'block' }}>✓</span>
    if (val === false) return <span style={{ color: '#d1d5db', fontSize: 17, display: 'block' }}>–</span>
    return <span style={{ color: '#f59e0b', fontSize: 12, fontWeight: 700, display: 'block' }}>A veces</span>
  }

  return (
    <div style={{ fontFamily: 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', background: 'white' }}>
      <style>{`
        * { box-sizing: border-box; }
        a { text-decoration: none; }
        details summary { cursor: pointer; list-style: none; }
        details summary::-webkit-details-marker { display: none; }
        details[open] .fa { transform: rotate(180deg); }
        .fa { transition: transform 0.2s ease; display: inline-block; }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .story-grid { grid-template-columns: 1fr !important; }
          .qs-grid { grid-template-columns: 1fr !important; }
          .paso-grid { grid-template-columns: 1fr !important; }
          .mockup-wrap { display: none !important; }
          table { font-size: 12px !important; }
        }
      `}</style>

      {/* ═══ SCHEMA.ORG JSON-LD ═══ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'CBC™ — Cierre Bajo Control',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          offers: {
            '@type': 'Offer',
            price: '9.90',
            priceCurrency: 'USD',
            priceValidUntil: '2027-01-01',
            availability: 'https://schema.org/InStock',
            description: '7 días gratis, luego $9.90 USD/mes',
          },
          description: 'Copiloto de ventas B2B para vendedores individuales en LATAM. Prioriza prospectos con semáforo automático, genera mensajes de seguimiento, guiones de llamada, propuestas y Reporte al Jefe™ con IA.',
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '5',
            ratingCount: '1',
            bestRating: '5',
          },
          url: 'https://app.arquitectadeautomatizaciones.com',
        }) }}
      />

      {/* ═══ NAV ═══ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(26,74,68,0.97)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <span style={{ fontWeight: 900, fontSize: 20, color: 'white', letterSpacing: '-0.02em' }}>CBC™</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a href="/login" style={{ padding: '8px 16px', color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600 }}>Entrar</a>
            <a href="/empezar" style={{ padding: '9px 18px', borderRadius: 9, background: TEAL, color: VERDE, fontWeight: 800, fontSize: 14 }}>
              Probar gratis →
            </a>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{ background: `linear-gradient(160deg, ${VERDE} 0%, #1f5c55 60%, #243d39 100%)`, padding: '80px 24px 90px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle at 80% 20%, rgba(78,205,196,0.08) 0%, transparent 50%)`, pointerEvents: 'none' }} />
        <div className="hero-grid" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            {/* Powered by Claude badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(78,205,196,0.12)', border: '1px solid rgba(78,205,196,0.3)', borderRadius: 100, padding: '5px 14px', marginBottom: 24 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={TEAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span style={{ fontSize: 12, fontWeight: 700, color: TEAL, letterSpacing: '0.03em' }}>Powered by Claude · Anthropic</span>
            </div>

            <h1 style={{ margin: '0 0 20px', fontSize: 'clamp(30px,4.5vw,52px)', fontWeight: 900, color: 'white', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              Deja de perder ventas<br />
              <span style={{ color: TEAL }}>que ya tenías ganadas.</span>
            </h1>
            <p style={{ margin: '0 0 32px', fontSize: 18, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, maxWidth: 460 }}>
              CBC™ es el copiloto de ventas B2B que sabe exactamente en qué momento está cada prospecto — y genera el mensaje, el guión y el reporte correctos para que cierres más sin improvisar.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
              <a href="/empezar" style={{ display: 'inline-flex', alignItems: 'center', padding: '15px 28px', borderRadius: 12, background: TEAL, color: VERDE, fontWeight: 800, fontSize: 16, boxShadow: `0 8px 32px ${TEAL}40` }}>
                Empezar gratis — 7 días →
              </a>
              <a href="#diagnostico" style={{ display: 'inline-flex', alignItems: 'center', padding: '15px 22px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)', fontWeight: 700, fontSize: 15 }}>
                Ver mi diagnóstico
              </a>
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {['Sin tarjeta de crédito', 'Sin instalación en empresa', '$9.90 USD/mes después'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: TEAL, fontSize: 14 }}>✓</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mockup-wrap" style={{ display: 'flex', justifyContent: 'center' }}>
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ═══ PROBLEMA ═══ */}
      <section style={{ background: BEIGE, padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: '#9ca3af', textTransform: 'uppercase' }}>El problema real</p>
          <h2 style={{ margin: '0 0 16px', fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, color: VERDE, lineHeight: 1.2 }}>
            No pierdes ventas por falta de talento.<br />
            <span style={{ color: '#dc2626' }}>Las pierdes por falta de sistema.</span>
          </h2>
          <p style={{ margin: '0 0 48px', fontSize: 17, color: '#6b7280', lineHeight: 1.6 }}>
            Si alguna de estas frases te suena conocida, ya te está costando comisiones:
          </p>
          <div className="qs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, textAlign: 'left' }}>
            {DOLORES.map((d, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 14, padding: '18px 20px', display: 'flex', gap: 12, alignItems: 'flex-start', border: '1px solid rgba(0,0,0,0.06)' }}>
                <span style={{ color: '#dc2626', fontSize: 18, marginTop: 1, flexShrink: 0 }}>✗</span>
                <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6, fontWeight: 500 }}>{d}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 40, padding: '20px 28px', background: 'white', borderRadius: 16, border: `2px solid ${TEAL}40`, display: 'inline-block', textAlign: 'left' }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: VERDE }}>
              El 73% de los vendedores B2B pierde al menos 3 prospectos calificados al mes por falta de seguimiento sistemático.*
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#9ca3af' }}>* Estudio interno CBC sobre 200 vendedores LATAM, 2024.</p>
          </div>
        </div>
      </section>

      {/* ═══ HISTORIA — DIANA ═══ */}
      <section style={{ background: 'white', padding: '80px 24px' }}>
        <div className="story-grid" style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '260px 1fr', gap: 60, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 180, height: 180, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px', border: `4px solid ${TEAL}`, boxShadow: `0 0 0 8px ${TEAL}20` }}>
              <img
                src="https://arquitectadeautomatizaciones.com/wp-content/uploads/2025/04/diana-garcia-arquitecta-de-automatizaciones.jpg"
                alt="Diana García — fundadora de CBC™, vendedora B2B con 10 años de experiencia en LATAM"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect width='200' height='200' fill='%231A4A44'/><text x='100' y='115' text-anchor='middle' fill='white' font-size='72' font-family='sans-serif'>DG</text></svg>` }}
              />
            </div>
            <p style={{ margin: '0 0 4px', fontWeight: 800, fontSize: 16, color: VERDE }}>Diana García</p>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Fundadora de CBC™</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>10 años en ventas B2B · LATAM</p>
          </div>
          <div>
            <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: TEAL, textTransform: 'uppercase' }}>Por qué existe CBC™</p>
            <h2 style={{ margin: '0 0 20px', fontSize: 'clamp(20px,2.5vw,30px)', fontWeight: 900, color: VERDE, lineHeight: 1.25 }}>
              Por qué construí el sistema que ningún CRM me ofrecía
            </h2>
            <p style={{ margin: '0 0 14px', fontSize: 15, color: '#374151', lineHeight: 1.7 }}>
              Después de 10 años vendiendo en B2B en LATAM, entendí que el problema nunca era el producto ni el precio. Era el caos entre propuesta y firma.
            </p>
            <p style={{ margin: '0 0 14px', fontSize: 15, color: '#374151', lineHeight: 1.7 }}>
              Prospectos que se enfriaban porque no los llamé a tiempo. Mensajes que escribía de cero cada vez. Reportes que inventaba la noche anterior. La sensación de que el mes se me escapaba de las manos sin saber exactamente por qué.
            </p>
            <p style={{ margin: '0 0 20px', fontSize: 15, color: '#374151', lineHeight: 1.7 }}>
              Construí CBC para que ningún vendedor talentoso volviera a perder una venta por falta de sistema — y que gane más con el mismo esfuerzo que ya hace.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: BEIGE, borderRadius: 12, borderLeft: `4px solid ${TEAL}` }}>
              <span style={{ fontSize: 22 }}>📲</span>
              <p style={{ margin: 0, fontSize: 14, color: VERDE, fontWeight: 600 }}>Diana acompaña a cada usuario personalmente en sus primeros 7 días. No empiezas esto solo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CÓMO FUNCIONA ═══ */}
      <section style={{ background: BEIGE, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: '#9ca3af', textTransform: 'uppercase' }}>El mecanismo</p>
            <h2 style={{ margin: '0 0 14px', fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, color: VERDE, lineHeight: 1.2 }}>Tres pasos. Sin curva de aprendizaje.</h2>
            <p style={{ margin: 0, fontSize: 17, color: '#6b7280', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
              Carga tus prospectos, deja que CBC les haga seguimiento y cierra más — con los mismos que ya tienes.
            </p>
          </div>
          <div className="paso-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { n: '01', icon: '📋', titulo: 'Cargas tus prospectos', texto: 'Nombre, empresa, último contacto y notas. En 2 minutos el semáforo ya sabe quién necesita atención hoy — y quién puede esperar.' },
              { n: '02', icon: '⚡', titulo: 'CBC detecta la urgencia', texto: 'Cada prospecto tiene un color: verde (al día), amarillo (4-7 días), rojo (8+ días). CBC te dice exactamente a quién llamar primero y por qué.' },
              { n: '03', icon: '🎯', titulo: 'Actúas con el mensaje correcto', texto: 'Guión de llamada personalizado. Mensaje de seguimiento listo. Propuesta Express. Perfil DISC. Todo generado con IA para ese prospecto específico.' },
            ].map(s => (
              <div key={s.n} style={{ background: 'white', borderRadius: 18, padding: '28px 24px', border: '1px solid rgba(0,0,0,0.07)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 20, right: 20, fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.08)' }}>{s.n}</div>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{s.icon}</div>
                <h3 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 800, color: VERDE }}>{s.titulo}</h3>
                <p style={{ margin: 0, fontSize: 14, color: '#6b7280', lineHeight: 1.65 }}>{s.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PARA QUIÉN ═══ */}
      <section style={{ background: 'white', padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div style={{ background: '#fef2f2', borderRadius: 18, padding: '28px 24px', border: '1.5px solid #fecaca' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18 }}>
              <span style={{ fontSize: 22 }}>🚫</span>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#dc2626' }}>CBC no es para ti si…</h3>
            </div>
            {['Ya tienes un sistema de seguimiento que funciona perfectamente.', 'No tienes prospectos activos y no vendes de forma regular.', 'Buscas un CRM corporativo para que lo administre IT.', 'Necesitas gestionar un equipo de más de 10 vendedores.'].map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <span style={{ color: '#dc2626', flexShrink: 0, marginTop: 2 }}>✗</span>
                <p style={{ margin: 0, fontSize: 14, color: '#7f1d1d', lineHeight: 1.5 }}>{t}</p>
              </div>
            ))}
          </div>
          <div style={{ background: '#f0fdf4', borderRadius: 18, padding: '28px 24px', border: '1.5px solid #bbf7d0' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18 }}>
              <span style={{ fontSize: 22 }}>✅</span>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#15803d' }}>CBC sí es para ti si…</h3>
            </div>
            {['Vendes B2B de forma individual y el seguimiento depende de tu memoria.', 'Sientes que se te escapan oportunidades sin entender por qué.', 'Tardas más de 10 minutos en preparar un mensaje de seguimiento.', 'Tu jefe te pregunta por el pipeline y no tienes los datos listos.', 'Quieres cerrar más sin contratar más gente ni trabajar más horas.'].map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <span style={{ color: '#15803d', flexShrink: 0, marginTop: 2 }}>✓</span>
                <p style={{ margin: 0, fontSize: 14, color: '#14532d', lineHeight: 1.5 }}>{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CINTA DE ALERTA ═══ */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Rayas diagonales amarillo/negro */}
        <div style={{
          height: 28,
          backgroundImage: 'repeating-linear-gradient(135deg, #f5c400 0px, #f5c400 20px, #111111 20px, #111111 40px)',
        }} />
        {/* Texto de urgencia */}
        <div style={{ background: '#111111', padding: '12px 24px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#f5c400', letterSpacing: '0.01em' }}>
            ⚡ En 3 minutos sabes exactamente cuántas comisiones estás perdiendo cada mes
          </p>
        </div>
        {/* Segunda tira de rayas */}
        <div style={{
          height: 28,
          backgroundImage: 'repeating-linear-gradient(135deg, #f5c400 0px, #f5c400 20px, #111111 20px, #111111 40px)',
        }} />
      </div>

      {/* ═══ DIAGNÓSTICO ═══ */}
      <section id="diagnostico" style={{ background: BEIGE, padding: '64px 24px 80px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: TEAL, textTransform: 'uppercase' }}>Diagnóstico gratuito</p>
            <h2 style={{ margin: '0 0 16px', fontSize: 'clamp(26px,4vw,42px)', fontWeight: 900, color: VERDE, lineHeight: 1.15 }}>
              ¿Qué va a pasar en 90 días<br />si no cambias nada?
            </h2>
            <p style={{ margin: '0 0 10px', fontSize: 17, color: '#374151', lineHeight: 1.6, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', fontWeight: 500 }}>
              Responde con lo que es real, no con lo que quisieras que fuera.<br />
              <span style={{ color: '#6b7280', fontSize: 15 }}>Nadie más tiene acceso a estas respuestas. No te traiciones.</span>
            </p>
          </div>
          <DiagnosticoInteractivo />
        </div>
      </section>

      {/* ═══ COMPARATIVA ═══ */}
      <section style={{ background: 'white', padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: '#9ca3af', textTransform: 'uppercase' }}>Comparativa honesta</p>
            <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 900, color: VERDE, lineHeight: 1.2 }}>CBC™ vs Excel/WhatsApp vs CRM corporativo</h2>
            <p style={{ margin: 0, fontSize: 16, color: '#6b7280' }}>Los tres tienen su lugar. Pero solo uno está hecho para el vendedor individual que vende hoy.</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  <th style={{ padding: '14px 18px', textAlign: 'left', background: '#f9fafb', color: '#6b7280', fontWeight: 700, fontSize: 13, border: '1px solid #e5e7eb' }}>Capacidad</th>
                  <th style={{ padding: '14px 18px', textAlign: 'center', background: VERDE, color: 'white', fontWeight: 800, fontSize: 14, border: `1px solid ${VERDE}` }}>CBC™</th>
                  <th style={{ padding: '14px 18px', textAlign: 'center', background: '#f9fafb', color: '#6b7280', fontWeight: 700, fontSize: 13, border: '1px solid #e5e7eb' }}>Excel / WhatsApp</th>
                  <th style={{ padding: '14px 18px', textAlign: 'center', background: '#f9fafb', color: '#6b7280', fontWeight: 700, fontSize: 13, border: '1px solid #e5e7eb' }}>CRM Corporativo</th>
                </tr>
              </thead>
              <tbody>
                {COMPARATIVA.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={{ padding: '12px 18px', color: '#374151', fontWeight: 500, border: '1px solid #e5e7eb' }}>{row.feature}</td>
                    <td style={{ padding: '12px 18px', textAlign: 'center', background: `${VERDE}06`, border: `1px solid ${VERDE}25` }}>{iconCheck(row.cbc)}</td>
                    <td style={{ padding: '12px 18px', textAlign: 'center', border: '1px solid #e5e7eb' }}>{iconCheck(row.excel)}</td>
                    <td style={{ padding: '12px 18px', textAlign: 'center', border: '1px solid #e5e7eb' }}>{iconCheck(row.crm)}</td>
                  </tr>
                ))}
                <tr style={{ background: VERDE }}>
                  <td style={{ padding: '14px 18px', color: 'white', fontWeight: 700, border: 'none' }}>Precio mensual</td>
                  <td style={{ padding: '14px 18px', textAlign: 'center', color: TEAL, fontWeight: 900, fontSize: 16, border: 'none' }}>$9.90 USD</td>
                  <td style={{ padding: '14px 18px', textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 13, border: 'none' }}>$0<br /><span style={{ fontSize: 11 }}>(pero ¿cuánto tiempo cuesta?)</span></td>
                  <td style={{ padding: '14px 18px', textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 13, border: 'none' }}>$50–$500+ USD</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIO ═══ */}
      <section style={{ background: `linear-gradient(160deg, ${VERDE} 0%, #1f5c55 100%)`, padding: '80px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: TEAL, textTransform: 'uppercase' }}>Lo que dicen quienes ya lo usan</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 24, padding: '40px 40px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 56, color: TEAL, lineHeight: 1, marginBottom: 20, fontFamily: 'Georgia,serif' }}>"</div>
            <p style={{ margin: '0 0 28px', fontSize: 'clamp(17px,2.5vw,22px)', color: 'white', lineHeight: 1.65, fontStyle: 'italic' }}>
              Antes vivía persiguiendo mis prospectos en el Excel y olvidando a la mitad. Con CBC™ sé exactamente a quién llamar cada mañana, el sistema me genera el mensaje según el día de seguimiento y hasta el guión si es llamada. Este mes cerré 4 ventas que el mes anterior me habrían dado las buenas noches sin responder. No lo cambio por nada.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, color: VERDE, flexShrink: 0 }}>TP</div>
              <div>
                <p style={{ margin: '0 0 2px', fontWeight: 800, fontSize: 16, color: 'white' }}>Tatiana Panadero</p>
                <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>Vendedora B2B · Sector servicios · Colombia</p>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
                {[...Array(5)].map((_, i) => <span key={i} style={{ color: '#fbbf24', fontSize: 18 }}>★</span>)}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <p style={{ margin: '0 0 14px', fontSize: 15, color: 'rgba(255,255,255,0.6)' }}>¿Ya usas CBC™? Comparte tu experiencia.</p>
            <button onClick={() => setTestimonioAbierto(true)} style={{ padding: '11px 24px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.25)', background: 'transparent', color: 'rgba(255,255,255,0.8)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Dejar mi testimonio →
            </button>
          </div>
        </div>
      </section>

      {/* ═══ CALCULADORA ROI ═══ */}
      <CalculadoraROI />

      {/* ═══ PRECIO ═══ */}
      <section style={{ background: BEIGE, padding: '80px 24px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: '#9ca3af', textTransform: 'uppercase' }}>Precio</p>
          <h2 style={{ margin: '0 0 32px', fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, color: VERDE, lineHeight: 1.2 }}>Un precio. Sin sorpresas.</h2>
          <div style={{ background: 'white', borderRadius: 24, padding: '40px 36px', boxShadow: '0 8px 40px rgba(0,0,0,0.1)', border: `2px solid ${VERDE}` }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 18, color: '#9ca3af', fontWeight: 600 }}>USD</span>
              <span style={{ fontSize: 64, fontWeight: 900, color: VERDE, lineHeight: 1, letterSpacing: '-0.03em' }}>9.90</span>
              <span style={{ fontSize: 18, color: '#9ca3af', fontWeight: 600 }}>/mes</span>
            </div>
            <p style={{ margin: '0 0 28px', fontSize: 15, color: '#6b7280' }}>Todo incluido. Sin niveles. Sin extra por herramientas.</p>
            <div style={{ textAlign: 'left', marginBottom: 28 }}>
              {['Semáforo de prioridad automático', 'Seguimientos programados con IA', 'Guión de llamada personalizado', 'Propuesta Express con neuroventas', 'Perfil DISC del prospecto', 'Reporte al Jefe™ — listo en un toque', 'IA en Acción — 8 momentos clave del vendedor', 'Sofía — tu asistente de ventas 24/7', 'Audios de reprogramación mental'].map((feat, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ color: TEAL, fontSize: 16 }}>✓</span>
                  <span style={{ fontSize: 14, color: '#374151' }}>{feat}</span>
                </div>
              ))}
            </div>
            <a href="/empezar" style={{ display: 'block', width: '100%', padding: '16px', borderRadius: 12, background: VERDE, color: 'white', fontWeight: 800, fontSize: 16, textAlign: 'center', boxShadow: `0 8px 24px ${VERDE}40` }}>
              Empezar mi prueba gratis →
            </a>
            <p style={{ margin: '12px 0 0', fontSize: 13, color: '#9ca3af' }}>7 días gratis. Sin tarjeta. Cancelas cuando quieras.</p>
          </div>
          <p style={{ marginTop: 28, fontSize: 15, color: '#6b7280', lineHeight: 1.6 }}>
            ¿Cuánto vale para ti cerrar una sola venta más al mes?<br />
            <strong style={{ color: VERDE }}>Con recuperar un prospecto ya pagaste un año de CBC.</strong>
          </p>
        </div>
      </section>

      {/* ═══ GARANTÍA ═══ */}
      <section style={{ background: 'white', padding: '60px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ background: '#f0fdf4', borderRadius: 20, padding: '36px 36px', border: '2px solid #bbf7d0', display: 'grid', gridTemplateColumns: '80px 1fr', gap: 24, alignItems: 'center' }}>
            <div style={{ textAlign: 'center', fontSize: 52 }}>🛡️</div>
            <div>
              <h3 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 900, color: VERDE }}>Garantía de 7 días completamente gratis</h3>
              <p style={{ margin: '0 0 10px', fontSize: 15, color: '#374151', lineHeight: 1.65 }}>
                Empieza hoy. Sin tarjeta. Los primeros 7 días son 100% gratis para que compruebes por ti mismo si CBC cambia la manera en que cierras.
              </p>
              <p style={{ margin: 0, fontSize: 14, color: '#15803d', fontWeight: 600 }}>
                Si en 7 días no ves diferencia en tu pipeline — no te cobramos nada. Así de simple.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section style={{ background: BEIGE, padding: '80px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ margin: 0, fontSize: 'clamp(26px,4vw,38px)', fontWeight: 900, color: VERDE }}>Preguntas frecuentes</h2>
          </div>
          {FAQ.map((item, i) => (
            <details key={i} style={{ background: 'white', borderRadius: 14, marginBottom: 10, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
              <summary style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: 15, color: VERDE }}>
                {item.q}
                <span className="fa" style={{ marginLeft: 12, fontSize: 18, color: '#9ca3af', flexShrink: 0 }}>⌄</span>
              </summary>
              <div style={{ padding: '0 22px 18px', fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section style={{ background: `linear-gradient(160deg, ${VERDE} 0%, #243d39 100%)`, padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: TEAL, textTransform: 'uppercase' }}>Empieza hoy</p>
          <h2 style={{ margin: '0 0 16px', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: 'white', lineHeight: 1.15 }}>
            El próximo prospecto que cierres<br />puede ser el que estás perdiendo hoy.
          </h2>
          <p style={{ margin: '0 0 32px', fontSize: 17, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>7 días gratis. Sin tarjeta. Sin burocracia. Diana te acompaña en el primer día.</p>
          <a href="/empezar" style={{ display: 'inline-block', padding: '18px 40px', borderRadius: 14, background: TEAL, color: VERDE, fontWeight: 900, fontSize: 18, boxShadow: `0 12px 40px ${TEAL}40` }}>
            Empezar mi prueba gratis →
          </a>
          <p style={{ margin: '16px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>$9.90 USD/mes después del trial. Cancelas en un clic.</p>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ background: '#0a1614', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <p style={{ margin: '0 0 4px', fontWeight: 900, fontSize: 18, color: 'white' }}>CBC™</p>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Cierre Bajo Control · Hecho en LATAM</p>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[{ label: 'Privacidad', href: '/privacidad' }, { label: 'Términos', href: '/terminos' }, { label: 'Contacto', href: 'mailto:hola@arquitectadeautomatizaciones.com' }].map(l => (
              <a key={l.label} href={l.href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{l.label}</a>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', margin: 0 }}>Powered by Claude · Anthropic · © 2025 CBC™</p>
        </div>
      </footer>

      {testimonioAbierto && <TestimonioModal onClose={() => setTestimonioAbierto(false)} />}
    </div>
  )
}
