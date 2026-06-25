'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ─── Shared style tokens ────────────────────────────────────────
const JAKARTA = { fontFamily: 'var(--font-jakarta), system-ui, sans-serif' }
const INTER   = { fontFamily: 'var(--font-inter), system-ui, sans-serif' }
const VERDE   = '#1A4A44'
const TEAL    = '#4ECDC4'
const BEIGE   = '#F5F0E8'

// ─── Progress dots ───────────────────────────────────────────────
function Dots({ paso }: { paso: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-5">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className="w-2.5 h-2.5 rounded-full transition-colors duration-300"
          style={{ backgroundColor: n <= paso ? TEAL : '#d1d5db' }}
        />
      ))}
    </div>
  )
}

// ─── Slide wrapper ───────────────────────────────────────────────
function Slide({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div
      style={{
        transition: 'opacity 400ms ease-in-out, transform 400ms ease-in-out',
        opacity: active ? 1 : 0,
        transform: active ? 'translateX(0)' : 'translateX(48px)',
        pointerEvents: active ? 'auto' : 'none',
        position: active ? 'relative' : 'absolute',
        top: 0, left: 0, right: 0,
        width: '100%',
      }}
    >
      {children}
    </div>
  )
}

// ─── PASO 1 — Bienvenida ─────────────────────────────────────────
function Paso1({ onNext }: { onNext: () => void }) {
  const puntos = [
    { icon: '💰', text: 'Sabes exactamente cuánta plata tienes en juego hoy' },
    { icon: '🔴', text: 'Ves quién se está enfriando — antes de perderlo' },
    { icon: '💬', text: 'El mensaje exacto para cada prospecto — listo para enviar' },
    { icon: '🤝', text: 'Entras a cada reunión sabiendo qué decir para cerrar' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Dots paso={1} />

      {/* Título */}
      <h1 style={{ ...JAKARTA, fontSize: 26, fontWeight: 700, color: VERDE, lineHeight: 1.25, marginBottom: 8, marginTop: 0 }}>
        Tomaste la decisión correcta.
      </h1>

      {/* Subtítulo teal */}
      <p style={{ ...INTER, fontSize: 16, color: TEAL, lineHeight: 1.5, marginBottom: 12, marginTop: 0 }}>
        En los próximos días lo vas a comprobar con números reales.
      </p>

      {/* Párrafo */}
      <p style={{ ...INTER, fontSize: 15, color: '#374151', lineHeight: 1.65, marginBottom: 14, marginTop: 0 }}>
        CBC no es una promesa. Es un sistema que te muestra exactamente cuántos prospectos tienes en riesgo, cuánto dinero hay en tu pipeline y qué hacer hoy para no perder ninguno.
      </p>

      {/* Recuadro 4 puntos */}
      <div style={{ backgroundColor: BEIGE, borderRadius: 14, padding: '14px 16px', marginBottom: 12 }}>
        {puntos.map(({ icon, text }) => (
          <div key={text} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
            <span style={{ fontSize: 17, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{icon}</span>
            <p style={{ ...INTER, fontSize: 15, color: '#1f2937', margin: 0, lineHeight: 1.55 }}>{text}</p>
          </div>
        ))}
      </div>

      {/* Tagline pequeño */}
      <p style={{ ...INTER, fontSize: 13, color: '#9ca3af', textAlign: 'center', lineHeight: 1.5, marginBottom: 14, marginTop: 0 }}>
        Los cracks de ventas no adivinan. Tienen sistema. Bienvenido al equipo.
      </p>

      {/* CTA */}
      <button
        onClick={onNext}
        style={{
          ...INTER,
          width: '100%',
          height: 52,
          backgroundColor: VERDE,
          color: 'white',
          fontSize: 17,
          fontWeight: 700,
          border: 'none',
          borderRadius: 14,
          cursor: 'pointer',
          marginTop: 'auto',
        }}
      >
        Empecemos
      </button>
    </div>
  )
}

// ─── PASO 2 — Perfil ─────────────────────────────────────────────
interface Perfil {
  sector: string
  tipo_venta: string
  meta_mensual: string
  moneda: string
  prospectos_iniciales: string
}

interface Errores {
  sector?: string
  meta_mensual?: string
  prospectos_iniciales?: string
}

function Paso2({ onNext }: { onNext: (d: Perfil) => Promise<void> }) {
  const [form, setForm] = useState<Perfil>({
    sector: '', tipo_venta: 'B2B', meta_mensual: '', moneda: 'USD', prospectos_iniciales: '',
  })
  const [errores, setErrores] = useState<Errores>({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Errores = {}
    if (!form.sector.trim())              errs.sector = 'Necesitamos tu sector para personalizar tus mensajes'
    if (!form.meta_mensual.trim())        errs.meta_mensual = 'Necesitamos este dato para mostrarte cuánto estás dejando de ganar'
    if (!form.prospectos_iniciales.trim()) errs.prospectos_iniciales = 'Este número activa tu semáforo desde el primer día'
    if (Object.keys(errs).length) { setErrores(errs); return }
    setErrores({})
    setLoading(true)
    await onNext(form)
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    ...INTER,
    width: '100%',
    height: 48,
    border: '1.5px solid #e5e7eb',
    borderRadius: 10,
    padding: '0 14px',
    fontSize: 16,
    color: '#1f2937',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: 'white',
  }

  const labelStyle: React.CSSProperties = {
    ...INTER,
    fontSize: 15,
    fontWeight: 700,
    color: '#374151',
    display: 'block',
    marginBottom: 6,
  }

  const errorStyle: React.CSSProperties = {
    ...INTER,
    fontSize: 13,
    color: '#dc2626',
    marginTop: 4,
    lineHeight: 1.4,
  }

  return (
    <div>
      <Dots paso={2} />

      <h1 style={{ ...JAKARTA, fontSize: 24, fontWeight: 700, color: VERDE, marginBottom: 6, lineHeight: 1.3 }}>
        Personaliza tu sistema
      </h1>
      <p style={{ ...INTER, fontSize: 16, color: '#6b7280', lineHeight: 1.6, marginBottom: 14 }}>
        El sistema trabaja con tus datos reales —<br />no con promedios genéricos.
      </p>

      {/* Aviso */}
      <div style={{
        backgroundColor: '#FEF3C7',
        border: '1px solid #F59E0B',
        borderRadius: 8,
        padding: 12,
        marginBottom: 18,
      }}>
        <p style={{ ...INTER, fontSize: 14, color: '#92400E', margin: 0, lineHeight: 1.5 }}>
          ⚡ Completa todos los campos para que el sistema funcione desde el primer día.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Campo 1 — Sector */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>¿En qué sector vendes?</label>
          <input
            style={{ ...inputStyle, borderColor: errores.sector ? '#dc2626' : '#e5e7eb' }}
            placeholder="Ej: tecnología, salud, servicios financieros..."
            value={form.sector}
            onChange={(e) => setForm({ ...form, sector: e.target.value })}
          />
          {errores.sector && <p style={errorStyle}>{errores.sector}</p>}
        </div>

        {/* Campo 2 — Tipo de venta */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Tipo de venta</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['B2B', 'B2C', 'Mixto'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, tipo_venta: t })}
                style={{
                  ...INTER,
                  flex: 1,
                  height: 44,
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  border: '1.5px solid',
                  cursor: 'pointer',
                  transition: 'all 200ms',
                  backgroundColor: form.tipo_venta === t ? VERDE : 'white',
                  color: form.tipo_venta === t ? 'white' : '#374151',
                  borderColor: form.tipo_venta === t ? VERDE : '#e5e7eb',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Campo 3 — Valor de venta */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>¿Cuánto vale una venta tuya?</label>
          <p style={{ ...INTER, fontSize: 13, color: '#9ca3af', margin: '0 0 6px', lineHeight: 1.4 }}>
            Tu comisión o margen promedio por cierre
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={form.moneda}
              onChange={(e) => setForm({ ...form, moneda: e.target.value })}
              style={{
                ...INTER,
                height: 48,
                border: '1.5px solid #e5e7eb',
                borderRadius: 10,
                padding: '0 10px',
                fontSize: 15,
                color: '#1f2937',
                backgroundColor: 'white',
                outline: 'none',
              }}
            >
              {['USD', 'COP', 'MXN', 'PEN', 'ARS'].map((m) => <option key={m}>{m}</option>)}
            </select>
            <input
              type="number"
              style={{
                ...inputStyle,
                flex: 1,
                borderColor: errores.meta_mensual ? '#dc2626' : '#e5e7eb',
              }}
              placeholder="500"
              value={form.meta_mensual}
              onChange={(e) => setForm({ ...form, meta_mensual: e.target.value })}
            />
          </div>
          {errores.meta_mensual && <p style={errorStyle}>{errores.meta_mensual}</p>}
        </div>

        {/* Campo 4 — Prospectos activos */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>¿Cuántos prospectos activos tienes ahora?</label>
          <input
            type="number"
            style={{
              ...inputStyle,
              borderColor: errores.prospectos_iniciales ? '#dc2626' : '#e5e7eb',
            }}
            placeholder="10"
            value={form.prospectos_iniciales}
            onChange={(e) => setForm({ ...form, prospectos_iniciales: e.target.value })}
          />
          {errores.prospectos_iniciales && <p style={errorStyle}>{errores.prospectos_iniciales}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            ...INTER,
            width: '100%',
            height: 56,
            backgroundColor: VERDE,
            color: 'white',
            fontSize: 17,
            fontWeight: 700,
            border: 'none',
            borderRadius: 14,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Activando...' : 'Listo, activa mi sistema'}
        </button>

        <p style={{ ...INTER, fontSize: 13, color: '#9ca3af', textAlign: 'center', marginTop: 10 }}>
          Puedes cambiar esto después en configuración.
        </p>
      </form>
    </div>
  )
}

// ─── PASO 3 — Kit completo ───────────────────────────────────────
function Paso3({ onFinish }: { onFinish: () => void }) {
  const zonas = [
    { nombre: 'CENTRO DE MANDO', items: ['Alerta Telegram 7 AM — tus 3 leads del día', 'Dashboard con semáforo en tiempo real'] },
    { nombre: 'SEGUIMIENTO',     items: ['Sabes quién se enfría antes de perderlo', 'Tu celular es tu oficina — gestiona todo desde ahí'] },
    { nombre: 'ESTRATEGIA',      items: ['Conoces el perfil de tu prospecto antes de hablarle', 'Propuesta lista en 4 campos — la IA la escribe'] },
    { nombre: 'EJECUCIÓN',       items: ['Mensaje exacto para cada situación', 'Seguimiento automático días 1, 3 y 7'] },
    { nombre: 'MENTALIDAD',      items: ['Guión de llamada por prospecto', 'Registro automático de victorias'] },
  ]

  const aceleradores = [
    { icon: '⚡', title: 'Networker Élite™',            lines: ['En cada evento sabes en segundos si vale la pena invertir tiempo en ese contacto', 'Sin internet · Todo entra directo a tu sistema'] },
    { icon: '📲', title: 'QR de Captura Inteligente™',  lines: ['El prospecto escanea · Tú no escribes nada', 'Datos directo al sistema en segundos'] },
    { icon: '🤝', title: 'Copiloto de Reunión™',        lines: ['8 fases de negociación · Botón SOS', 'Sin internet · Perfil del prospecto cargado'] },
  ]

  const automatico = [
    { icon: '📅', text: 'Seguimiento días 1, 3 y 7 — mensaje listo para enviar' },
    { icon: '🚦', text: 'Semáforo automático — sin tocar nada' },
    { icon: '📊', text: 'Dashboard — se actualiza solo' },
  ]

  const eyebrow = (text: string, color: string): React.CSSProperties => ({
    ...INTER,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color,
    marginBottom: 12,
  })

  return (
    <div>
      <Dots paso={3} />

      <h1 style={{ ...JAKARTA, fontSize: 24, fontWeight: 700, color: VERDE, marginBottom: 6, lineHeight: 1.3 }}>
        Tu sistema está listo.
      </h1>
      <p style={{ ...INTER, fontSize: 16, color: TEAL, lineHeight: 1.6, marginBottom: 20 }}>
        Esto es todo lo que tienes desde hoy.
      </p>

      {/* Sección 1 — Núcleo */}
      <div style={{ backgroundColor: 'white', borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <p style={eyebrow('16 MÓDULOS · 5 ZONAS', TEAL)}>16 MÓDULOS · 5 ZONAS</p>
        {zonas.map((z) => (
          <div key={z.nombre} style={{ marginBottom: 14 }}>
            <p style={{ ...INTER, fontSize: 15, fontWeight: 700, color: VERDE, margin: '0 0 4px' }}>{z.nombre}</p>
            {z.items.map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 2 }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: TEAL, flexShrink: 0, marginTop: 7 }} />
                <p style={{ ...INTER, fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>{item}</p>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ height: 1, backgroundColor: '#f3f4f6', marginBottom: 16 }} />

      {/* Sección 2 — Aceleradores */}
      <div style={{ backgroundColor: BEIGE, borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <p style={eyebrow('3 ACELERADORES DE CAMPO', VERDE)}>3 ACELERADORES DE CAMPO</p>
        {aceleradores.map((a) => (
          <div
            key={a.title}
            style={{
              backgroundColor: 'white',
              borderLeft: `3px solid ${TEAL}`,
              borderRadius: 8,
              padding: 14,
              marginBottom: 10,
            }}
          >
            <p style={{ ...INTER, fontSize: 15, fontWeight: 700, color: '#1f2937', margin: '0 0 4px' }}>
              {a.icon} {a.title}
            </p>
            {a.lines.map((l) => (
              <p key={l} style={{ ...INTER, fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>{l}</p>
            ))}
          </div>
        ))}
      </div>

      <div style={{ height: 1, backgroundColor: '#f3f4f6', marginBottom: 16 }} />

      {/* Sección 3 — Automático */}
      <div style={{ backgroundColor: 'white', borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <p style={eyebrow('EL SISTEMA TRABAJA POR TI', TEAL)}>EL SISTEMA TRABAJA POR TI</p>
        {automatico.map(({ icon, text }) => (
          <div key={text} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
            <p style={{ ...INTER, fontSize: 15, color: '#374151', margin: 0, lineHeight: 1.5 }}>{text}</p>
          </div>
        ))}
      </div>

      {/* Bloque final */}
      <div style={{
        backgroundColor: VERDE,
        borderRadius: 16,
        padding: 28,
        textAlign: 'center',
        marginBottom: 8,
      }}>
        <p style={{ ...JAKARTA, fontSize: 22, fontWeight: 700, color: 'white', margin: '0 0 8px', lineHeight: 1.3 }}>
          Todo esto por $9.90 al mes.
        </p>
        <p style={{ ...INTER, fontSize: 15, color: 'rgba(255,255,255,0.7)', margin: '0 0 20px', lineHeight: 1.6 }}>
          Menos de lo que cuesta un almuerzo.
        </p>
        <button
          onClick={onFinish}
          style={{
            ...INTER,
            width: '100%',
            height: 56,
            backgroundColor: TEAL,
            color: VERDE,
            fontSize: 17,
            fontWeight: 700,
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
          }}
        >
          Ir a mi dashboard
        </button>
        <p style={{ ...INTER, fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 10 }}>
          Disfruta tu prueba gratis de 7 días · Después solo $9.90/mes
        </p>
      </div>
    </div>
  )
}

// ─── Root ────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter()
  const [paso, setPaso] = useState(1)

  async function handlePerfil(data: Perfil) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Save profile data — onboarding_completado stays false until step 3
      await supabase.from('users').update({
        sector:       data.sector || null,
        tipo_venta:   data.tipo_venta || null,
        meta_mensual: data.meta_mensual ? Number(data.meta_mensual) : null,
        moneda:       data.moneda,
        sofia_proactive_sent: { prospectos_iniciales: Number(data.prospectos_iniciales) },
      }).eq('auth_user_id', user.id)
    }
    setPaso(3)
  }

  async function handleFinish() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Only mark complete when user explicitly clicks "Ir a mi dashboard"
      await supabase.from('users')
        .update({ onboarding_completado: true })
        .eq('auth_user_id', user.id)
    }
    fetch('/api/emails/bienvenida', { method: 'POST' }).catch(() => null)
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: BEIGE, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px 40px' }}>
      {/* Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
        <div style={{
          width: 40, height: 40,
          backgroundColor: VERDE,
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 4,
        }}>
          <span style={{ ...JAKARTA, color: 'white', fontSize: 16, fontWeight: 700 }}>C</span>
        </div>
        <span style={{ ...JAKARTA, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', color: VERDE }}>CBC™</span>
      </div>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: 440,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        boxShadow: '0 1px 8px rgba(0,0,0,0.07)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Slide active={paso === 1}><Paso1 onNext={() => setPaso(2)} /></Slide>
        <Slide active={paso === 2}><Paso2 onNext={handlePerfil} /></Slide>
        <Slide active={paso === 3}><Paso3 onFinish={handleFinish} /></Slide>
      </div>
    </div>
  )
}
