'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  type Selecciones,
  calcular, calcular90dias,
  SESSION_KEY,
} from '@/lib/diagnostico'

const VERDE = '#1A4A44'
const TEAL = '#4ECDC4'
const BEIGE = '#F5F0E8'
const AMARILLO = '#f5c400'

// ── Sub-components ─────────────────────────────────────────

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

function CalculadoraROI() {
  const [prospectos, setProspectos] = useState(2)
  const [comision, setComision] = useState(500)
  const perdida = prospectos * comision
  const fmt = (n: number) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  return (
    <section style={{ background: VERDE, padding: '80px 24px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: TEAL, textTransform: 'uppercase' }}>¿Vale la pena?</p>
          <h2 style={{ margin: 0, fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, color: 'white', lineHeight: 1.2 }}>
            CBC™ se paga solo<br />con una sola venta.
          </h2>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: '40px 36px' }}>
          <div style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Prospectos perdidos al mes</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <input type="range" min={1} max={20} step={1} value={prospectos} onChange={e => setProspectos(Number(e.target.value))} style={{ flex: 1, accentColor: TEAL, cursor: 'pointer', height: 6 }} />
              <div style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(78,205,196,0.4)', borderRadius: 10, padding: '8px 16px', minWidth: 64, textAlign: 'center' }}>
                <input type="number" min={1} max={99} value={prospectos} onChange={e => setProspectos(Math.max(1, Math.min(99, Number(e.target.value) || 1)))} style={{ background: 'none', border: 'none', color: TEAL, fontWeight: 900, fontSize: 22, width: 48, textAlign: 'center', outline: 'none' }} />
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: 28, color: 'rgba(255,255,255,0.3)', marginBottom: 32, fontWeight: 900 }}>×</div>
          <div style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Comisión promedio por venta (USD)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <input type="range" min={100} max={10000} step={100} value={comision} onChange={e => setComision(Number(e.target.value))} style={{ flex: 1, accentColor: TEAL, cursor: 'pointer', height: 6 }} />
              <div style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(78,205,196,0.4)', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: 700 }}>$</span>
                <input type="number" min={1} max={99999} value={comision} onChange={e => setComision(Math.max(1, Math.min(99999, Number(e.target.value) || 1)))} style={{ background: 'none', border: 'none', color: TEAL, fontWeight: 900, fontSize: 20, width: 72, textAlign: 'center', outline: 'none' }} />
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginBottom: 28 }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Estás dejando en la mesa</p>
            <div style={{ fontSize: 'clamp(44px,8vw,72px)', fontWeight: 900, color: TEAL, lineHeight: 1, letterSpacing: '-0.03em', marginBottom: 8, transition: 'all 0.15s ease' }}>{fmt(perdida)}</div>
            <p style={{ margin: 0, fontSize: 16, color: 'rgba(255,255,255,0.6)' }}>perdidos cada mes por prospectos que se enfrían.</p>
          </div>
        </div>
        <div style={{ marginTop: 20, textAlign: 'center', padding: '16px 24px', background: 'rgba(78,205,196,0.1)', border: '1px solid rgba(78,205,196,0.25)', borderRadius: 14 }}>
          <p style={{ margin: 0, fontSize: 15, color: 'rgba(255,255,255,0.85)', fontWeight: 600, lineHeight: 1.5 }}>
            💡 <strong style={{ color: TEAL }}>CBC™ cuesta $9.90/mes</strong> — menos de lo que pierdes en una sola venta que se enfría.
          </p>
        </div>
      </div>
      <style>{`input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}input[type=number]{-moz-appearance:textfield}`}</style>
    </section>
  )
}

// ── Page ───────────────────────────────────────────────────

export default function ResultadoPage() {
  const router = useRouter()
  const [data, setData] = useState<{ nombre: string; sel: Selecciones } | null>(null)
  const [desbloqueado, setDesbloqueado] = useState(false)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [testimonioAbierto, setTestimonioAbierto] = useState(false)
  const ventaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? sessionStorage.getItem(SESSION_KEY) : null
    if (!raw) { router.replace('/diagnostico'); return }
    try { setData(JSON.parse(raw)) } catch { router.replace('/diagnostico') }
  }, [router])

  if (!data) return (
    <div style={{ minHeight: '100vh', background: '#071a17', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 40, height: 40, border: `4px solid ${TEAL}30`, borderTopColor: TEAL, borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
    </div>
  )

  const { nombre, sel } = data
  const r = calcular(sel)
  const nombrePos = nombre ? `de ${nombre}` : 'de tu pipeline'

  async function desbloquear() {
    if (!email.includes('@')) { setEmailError('Ingresa un email válido.'); return }
    setEmailError('')
    setGuardando(true)
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, nombre: nombre || null, score: r.total, sub_scores: r.sub, cuello_de_botella: r.cuello, respuestas: sel }),
    })
    setGuardando(false)
    setDesbloqueado(true)
    setTimeout(() => ventaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

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
    { q: '¿Cuánto tiempo necesito para configurar CBC?', a: 'Menos de 10 minutos. Creas tu cuenta, cargas tus primeros prospectos y el semáforo empieza a funcionar al instante. No hay configuración técnica ni integración con tu empresa.' },
    { q: '¿Mis datos de prospectos son privados?', a: 'Totalmente. Tus prospectos son tuyos. Nadie más los ve — ni tu empresa, ni nosotros. Usamos Supabase con cifrado en tránsito y en reposo.' },
    { q: '¿Funciona si vendo en cualquier sector?', a: 'Sí. CBC fue diseñado para vendedores B2B de cualquier industria — seguros, tecnología, servicios profesionales, distribución. Si tienes prospectos y haces seguimiento, CBC funciona.' },
    { q: '¿Qué pasa después de los 7 días gratis?', a: 'Te cobramos $9.90 USD al mes. Sin contrato. Cancelas cuando quieras desde tu perfil en un clic. No hay letra pequeña.' },
    { q: '¿CBC reemplaza mi CRM actual?', a: 'No necesariamente. CBC está diseñado para el vendedor individual que necesita mover su pipeline todos los días. Si tu empresa usa un CRM corporativo para reportes, puedes usar ambos — CBC para tu gestión diaria y el CRM para lo que pide tu empresa.' },
    { q: '¿Necesito saber de tecnología para usarlo?', a: 'Para nada. Si sabes usar WhatsApp, sabes usar CBC. Fue diseñado pensando en vendedores en campo — interfaz limpia, decisiones claras, sin curva de aprendizaje.' },
  ]

  const iconCheck = (val: boolean | string) => {
    if (val === true) return <span style={{ color: '#10b981', fontSize: 17, display: 'block' }}>✓</span>
    if (val === false) return <span style={{ color: '#d1d5db', fontSize: 17, display: 'block' }}>–</span>
    return <span style={{ color: '#f59e0b', fontSize: 12, fontWeight: 700, display: 'block' }}>A veces</span>
  }

  return (
    <div style={{ background: 'white', fontFamily: 'system-ui,-apple-system,sans-serif' }}>
      <style>{`*{box-sizing:border-box}a{text-decoration:none}details summary{cursor:pointer;list-style:none}details summary::-webkit-details-marker{display:none}details[open] .fa{transform:rotate(180deg)}.fa{transition:transform 0.2s ease;display:inline-block}@media(max-width:768px){.qs-grid{grid-template-columns:1fr!important}.paso-grid{grid-template-columns:1fr!important}.story-grid{grid-template-columns:1fr!important}table{font-size:12px!important}}`}</style>

      {/* ── NAV minimal ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(26,74,68,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <a href="/diagnostico" style={{ fontWeight: 900, fontSize: 20, color: 'white', letterSpacing: '-0.02em' }}>CBC™</a>
          <a href="/empezar" style={{ padding: '9px 18px', borderRadius: 9, background: TEAL, color: VERDE, fontWeight: 800, fontSize: 14 }}>Probar gratis →</a>
        </div>
      </nav>

      {/* ── DIAGNÓSTICO HEADER ── */}
      <div style={{ background: '#071a17', padding: '48px 24px 40px', textAlign: 'center' }}>
        <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
          El diagnóstico {nombrePos}
        </p>
        <h1 style={{ margin: 0, fontSize: 'clamp(24px,4vw,44px)', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>
          {nombre ? `EL DIAGNÓSTICO DE ${nombre.toUpperCase()}` : 'TU DIAGNÓSTICO'}
        </h1>
      </div>

      {/* ── GAUGE + SUB-SCORES ── */}
      <div style={{ background: BEIGE, padding: '40px 24px' }}>
        <div style={{ maxWidth: 580, margin: '0 auto', background: 'white', borderRadius: 20, padding: '32px 28px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <GaugeSVG score={r.total} color={r.nivelColor} />
          <div style={{ marginTop: 24, borderTop: '1px solid #f3f4f6', paddingTop: 20 }}>
            <p style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Por categoría</p>
            <SubBar label="Seguimiento" score={r.sub.seguimiento} delay={0} />
            <SubBar label="Priorización" score={r.sub.priorizacion} delay={100} />
            <SubBar label="Preparación" score={r.sub.preparacion} delay={200} />
            <SubBar label="Reporte" score={r.sub.reporte} delay={300} />
          </div>
        </div>
      </div>

      {/* ── CUELLO DE BOTELLA ── */}
      <div style={{ background: BEIGE, padding: '0 24px 20px' }}>
        <div style={{ maxWidth: 580, margin: '0 auto', background: `${r.nivelColor}12`, border: `2px solid ${r.nivelColor}40`, borderRadius: 14, padding: '18px 20px' }}>
          <p style={{ margin: '0 0 5px', fontSize: 11, fontWeight: 700, color: r.nivelColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {nombre ? `${nombre}, tu cuello de botella hoy es: ${r.cuelloLabel}` : `Tu cuello de botella: ${r.cuelloLabel}`}
          </p>
          <p style={{ margin: 0, fontSize: 14, color: VERDE, fontWeight: 600, lineHeight: 1.55 }}>{r.cuelloTexto}</p>
        </div>
      </div>

      {/* ── MAXWELL ── */}
      <div style={{ background: BEIGE, padding: '0 24px 20px' }}>
        <div style={{ maxWidth: 580, margin: '0 auto', borderLeft: `4px solid ${AMARILLO}`, background: '#fffbeb', borderRadius: '0 12px 12px 0', padding: '14px 18px' }}>
          <p style={{ margin: '0 0 5px', fontSize: 14, color: '#374151', lineHeight: 1.6, fontStyle: 'italic' }}>"Si llevas 10 años haciendo lo mismo, no tienes 10 años de experiencia. Tienes 1 año repetido 10 veces."</p>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#92400e' }}>— Atribuido a John C. Maxwell</p>
        </div>
      </div>

      {/* ── 90 DÍAS ── */}
      <div style={{ background: BEIGE, padding: '0 24px 20px' }}>
        <div style={{ maxWidth: 580, margin: '0 auto', background: '#111827', borderRadius: 14, padding: '20px' }}>
          <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, color: AMARILLO, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            ⚠ Lo que pasa en 90 días si {nombre || 'no'} no cambia nada
          </p>
          {calcular90dias(sel, r.perdidaMensual).map((linea, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: i < 2 ? 10 : 0 }}>
              <span style={{ color: AMARILLO, flexShrink: 0, marginTop: 2 }}>→</span>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>{linea}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FORTALEZAS (2 visibles) ── */}
      <div style={{ background: BEIGE, padding: '0 24px 20px' }}>
        <div style={{ maxWidth: 580, margin: '0 auto', background: 'white', borderRadius: 14, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Lo que ya haces bien</p>
          {(desbloqueado ? r.fortalezas : r.fortalezas.slice(0, 2)).map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ color: '#10b981', fontSize: 16, marginTop: 1 }}>✓</span>
              <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{f.texto}</p>
            </div>
          ))}
          {!desbloqueado && r.fortalezas.length > 2 && (
            <p style={{ margin: '8px 0 0', fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>+ {r.fortalezas.length - 2} más en el reporte completo</p>
          )}
        </div>
      </div>

      {/* ── FRICCIONES (2 visibles) ── */}
      <div style={{ background: BEIGE, padding: '0 24px 32px' }}>
        <div style={{ maxWidth: 580, margin: '0 auto', background: 'white', borderRadius: 14, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Dónde se te van las comisiones</p>
          {(desbloqueado ? r.debilidades : r.debilidades.slice(0, 2)).map((d, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ color: '#ef4444', fontSize: 16, marginTop: 1 }}>✗</span>
              <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{d.texto}</p>
            </div>
          ))}
          {!desbloqueado && r.debilidades.length > 2 && (
            <p style={{ margin: '8px 0 0', fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>+ {r.debilidades.length - 2} más áreas de fricción en el reporte completo</p>
          )}
        </div>
      </div>

      {/* ── PAYWALL (solo si no desbloqueado) ── */}
      {!desbloqueado && (
        <div style={{ background: VERDE, padding: '48px 24px' }}>
          <div style={{ maxWidth: 540, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🔒</div>
            <h2 style={{ margin: '0 0 8px', fontWeight: 800, fontSize: 24, color: 'white', lineHeight: 1.3 }}>
              Desbloquear el reporte {nombrePos}
            </h2>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
              Incluye las {r.debilidades.length - 2} áreas de mejora restantes, 3 acciones concretas para esta semana, y cómo resolver el cuello de botella de {nombre || 'tu pipeline'} con un sistema — no con más esfuerzo.
            </p>
            <input
              type="email" placeholder="tu@email.com" value={email}
              onChange={e => { setEmail(e.target.value); setEmailError('') }}
              onKeyDown={e => e.key === 'Enter' && desbloquear()}
              style={{ display: 'block', width: '100%', padding: '14px', borderRadius: 10, border: emailError ? '2px solid #fca5a5' : '2px solid transparent', fontSize: 15, marginBottom: emailError ? 6 : 12, outline: 'none', fontFamily: 'inherit' }}
            />
            {emailError && <p style={{ color: '#fca5a5', fontSize: 12, margin: '0 0 10px', textAlign: 'left' }}>{emailError}</p>}
            <button onClick={desbloquear} disabled={guardando} style={{ display: 'block', width: '100%', padding: '15px', borderRadius: 10, border: 'none', background: TEAL, color: VERDE, fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
              {guardando ? 'Guardando...' : 'Desbloquear mi reporte completo →'}
            </button>
            <p style={{ margin: '10px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Sin spam. Solo tu reporte. También recibirás el reporte por email.</p>
          </div>
        </div>
      )}

      {/* ── REPORTE DESBLOQUEADO + TODA LA VENTA ── */}
      {desbloqueado && (
        <div ref={ventaRef}>

          {/* Recomendaciones */}
          <div style={{ background: BEIGE, padding: '48px 24px' }}>
            <div style={{ maxWidth: 580, margin: '0 auto' }}>
              <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Reporte desbloqueado</p>
              <h2 style={{ margin: '0 0 20px', fontSize: 'clamp(20px,3vw,28px)', fontWeight: 900, color: VERDE }}>Lo que deberías cambiar esta semana</h2>
              <div style={{ background: 'white', borderRadius: 14, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                {r.recomendaciones.map((rec, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: i < r.recomendaciones.length - 1 ? 12 : 0 }}>
                    <span style={{ background: VERDE, color: 'white', borderRadius: '50%', width: 22, height: 22, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                    <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transición a la solución */}
          <div style={{ background: '#111827', padding: '56px 24px', textAlign: 'center' }}>
            <div style={{ maxWidth: 620, margin: '0 auto' }}>
              <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: AMARILLO, textTransform: 'uppercase' }}>¿Quieres la solución?</p>
              <h2 style={{ margin: '0 0 16px', fontSize: 'clamp(24px,4vw,40px)', fontWeight: 900, color: 'white', lineHeight: 1.2 }}>
                Ya sabes exactamente qué falla.<br />
                <span style={{ color: TEAL }}>Ahora conoce el sistema que lo resuelve.</span>
              </h2>
              <p style={{ margin: 0, fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>
                Construí CBC porque yo tuve exactamente los mismos problemas que acabas de diagnosticar.
              </p>
            </div>
          </div>

          {/* PROBLEMA */}
          <section style={{ background: BEIGE, padding: '80px 24px' }}>
            <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
              <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: '#9ca3af', textTransform: 'uppercase' }}>El problema real</p>
              <h2 style={{ margin: '0 0 16px', fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, color: VERDE, lineHeight: 1.2 }}>
                No pierdes ventas por falta de talento.<br />
                <span style={{ color: '#dc2626' }}>Las pierdes por falta de sistema.</span>
              </h2>
              <p style={{ margin: '0 0 48px', fontSize: 17, color: '#6b7280', lineHeight: 1.6 }}>Si alguna de estas frases te suena conocida, ya te está costando comisiones:</p>
              <div className="qs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, textAlign: 'left' }}>
                {DOLORES.map((d, i) => (
                  <div key={i} style={{ background: 'white', borderRadius: 14, padding: '18px 20px', display: 'flex', gap: 12, alignItems: 'flex-start', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <span style={{ color: '#dc2626', fontSize: 18, marginTop: 1, flexShrink: 0 }}>✗</span>
                    <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6, fontWeight: 500 }}>{d}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* HISTORIA DIANA */}
          <section style={{ background: 'white', padding: '80px 24px' }}>
            <div className="story-grid" style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '260px 1fr', gap: 60, alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 180, height: 180, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px', border: `4px solid ${TEAL}`, boxShadow: `0 0 0 8px ${TEAL}20` }}>
                  <img
                    src="https://arquitectadeautomatizaciones.com/wp-content/uploads/2025/04/diana-garcia-arquitecta-de-automatizaciones.jpg"
                    alt="Diana García — fundadora de CBC™, vendedora B2B con 20+ años de experiencia en LATAM"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect width='200' height='200' fill='%231A4A44'/><text x='100' y='115' text-anchor='middle' fill='white' font-size='72' font-family='sans-serif'>DG</text></svg>` }}
                  />
                </div>
                <p style={{ margin: '0 0 4px', fontWeight: 800, fontSize: 16, color: VERDE }}>Diana García</p>
                <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Fundadora de CBC™</p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>20+ años en ventas B2B · LATAM</p>
              </div>
              <div>
                <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: TEAL, textTransform: 'uppercase' }}>Por qué existe CBC™</p>
                <h2 style={{ margin: '0 0 20px', fontSize: 'clamp(20px,2.5vw,30px)', fontWeight: 900, color: VERDE, lineHeight: 1.25 }}>Por qué construí el sistema que ningún CRM me ofrecía</h2>
                <p style={{ margin: '0 0 14px', fontSize: 15, color: '#374151', lineHeight: 1.7 }}>Después de 20+ años vendiendo en B2B en LATAM, entendí que el problema nunca era el producto ni el precio. Era el caos entre propuesta y firma.</p>
                <p style={{ margin: '0 0 14px', fontSize: 15, color: '#374151', lineHeight: 1.7 }}>Prospectos que se enfriaban porque no los llamé a tiempo. Mensajes que escribía de cero cada vez. Reportes que inventaba la noche anterior. La sensación de que el mes se me escapaba de las manos sin saber exactamente por qué.</p>
                <p style={{ margin: '0 0 20px', fontSize: 15, color: '#374151', lineHeight: 1.7 }}>Construí CBC para que ningún vendedor talentoso volviera a perder una venta por falta de sistema — y que gane más con el mismo esfuerzo que ya hace.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: BEIGE, borderRadius: 12, borderLeft: `4px solid ${TEAL}` }}>
                  <span style={{ fontSize: 22 }}>📲</span>
                  <p style={{ margin: 0, fontSize: 14, color: VERDE, fontWeight: 600 }}>Diana acompaña a cada usuario personalmente en sus primeros 7 días. No empiezas esto solo.</p>
                </div>
              </div>
            </div>
          </section>

          {/* CÓMO FUNCIONA */}
          <section style={{ background: BEIGE, padding: '80px 24px' }}>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: '#9ca3af', textTransform: 'uppercase' }}>El mecanismo</p>
                <h2 style={{ margin: '0 0 14px', fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, color: VERDE, lineHeight: 1.2 }}>Tres pasos. Sin curva de aprendizaje.</h2>
                <p style={{ margin: 0, fontSize: 17, color: '#6b7280', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>Carga tus prospectos, deja que CBC les haga seguimiento y cierra más — con los mismos que ya tienes.</p>
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

          {/* PARA QUIÉN */}
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

          {/* COMPARATIVA */}
          <section style={{ background: 'white', padding: '0 24px 80px' }}>
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

          {/* TESTIMONIO — pendiente: agregar cita real de Tatiana Panadero */}

          {/* CALCULADORA */}
          <CalculadoraROI />

          {/* PRECIO */}
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
            </div>
          </section>

          {/* GARANTÍA */}
          <section style={{ background: 'white', padding: '60px 24px' }}>
            <div style={{ maxWidth: 680, margin: '0 auto' }}>
              <div style={{ background: '#f0fdf4', borderRadius: 20, padding: '36px', border: '2px solid #bbf7d0', display: 'grid', gridTemplateColumns: '80px 1fr', gap: 24, alignItems: 'center' }}>
                <div style={{ textAlign: 'center', fontSize: 52 }}>🛡️</div>
                <div>
                  <h3 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 900, color: VERDE }}>Garantía de 7 días completamente gratis</h3>
                  <p style={{ margin: '0 0 10px', fontSize: 15, color: '#374151', lineHeight: 1.65 }}>Empieza hoy. Sin tarjeta. Los primeros 7 días son 100% gratis para que compruebes por ti mismo si CBC cambia la manera en que cierras.</p>
                  <p style={{ margin: 0, fontSize: 14, color: '#15803d', fontWeight: 600 }}>Si en 7 días no ves diferencia en tu pipeline — no te cobramos nada. Así de simple.</p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
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

          {/* CTA FINAL */}
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

          {/* FOOTER */}
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

        </div>
      )}

      {/* TestimonioModal lazy */}
      {testimonioAbierto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '32px 28px', maxWidth: 520, width: '100%', position: 'relative' }}>
            <button onClick={() => setTestimonioAbierto(false)} style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9ca3af' }}>✕</button>
            <h3 style={{ margin: '0 0 16px', color: VERDE, fontSize: 20, fontWeight: 800 }}>Comparte tu experiencia con CBC™</h3>
            <p style={{ margin: '0 0 16px', color: '#6b7280', fontSize: 14 }}>Tu testimonio real ayuda a otros vendedores a tomar la decisión.</p>
            <a href="mailto:hola@arquitectadeautomatizaciones.com?subject=Mi testimonio de CBC™" style={{ display: 'block', padding: '14px', borderRadius: 10, background: VERDE, color: 'white', textAlign: 'center', fontWeight: 700, fontSize: 15 }}>
              Enviar mi testimonio por email →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
