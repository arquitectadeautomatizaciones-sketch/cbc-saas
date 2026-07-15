'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MailCheck } from 'lucide-react'

const ROJO  = '#e8001d'
const TEAL  = '#4ECDC4'
const NEGRO = '#080808'
const BEBAS = "'Bebas Neue', Impact, sans-serif"
const SANS  = "'General Sans', system-ui, sans-serif"
const MONO  = "'JetBrains Mono', 'Courier New', monospace"

export default function RegisterPage() {
  const [form, setForm]           = useState({ nombre: '', email: '', password: '' })
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [confirmado, setConfirmado] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res  = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Error al crear la cuenta'); setLoading(false); return }
    setConfirmado(true)
    setLoading(false)
  }

  // ── Email enviado ──────────────────────────────────────────────
  if (confirmado) {
    return (
      <div style={{ minHeight: '100vh', background: NEGRO, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: `${TEAL}20`, border: `2px solid ${TEAL}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <MailCheck size={32} color={TEAL} />
          </div>
          <h1 style={{ fontFamily: BEBAS, fontSize: 40, color: 'white', letterSpacing: '0.04em', margin: '0 0 12px' }}>REVISA TU EMAIL</h1>
          <p style={{ fontFamily: SANS, fontSize: 16, color: 'rgba(255,255,255,0.70)', lineHeight: 1.7, marginBottom: 8 }}>
            Te enviamos un enlace de confirmación a <strong style={{ color: 'white' }}>{form.email}</strong>
          </p>
          <p style={{ fontFamily: SANS, fontSize: 14, color: 'rgba(255,255,255,0.40)', marginBottom: 32 }}>
            Haz clic en el enlace para activar tu cuenta y empezar tu prueba de 7 días.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 24px', textAlign: 'left' }}>
            <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,0.70)', margin: '0 0 8px' }}>¿No te llegó?</p>
            <p style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.40)', margin: '0 0 4px' }}>Revisa tu carpeta de spam o correo no deseado.</p>
            <p style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.40)', margin: 0 }}>El enlace expira en 24 horas.</p>
          </div>
          <p style={{ fontFamily: SANS, fontSize: 14, color: 'rgba(255,255,255,0.35)', marginTop: 24 }}>
            ¿Ya confirmaste?{' '}
            <Link href="/login" style={{ color: TEAL, fontWeight: 600 }}>Inicia sesión</Link>
          </p>
        </div>
      </div>
    )
  }

  // ── Página principal ───────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: NEGRO, fontFamily: SANS }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .reg-block { animation: fadeUp 0.6s ease both; }
        .reg-block:nth-child(2) { animation-delay: 0.1s; }
        .reg-block:nth-child(3) { animation-delay: 0.2s; }
        .reg-block:nth-child(4) { animation-delay: 0.3s; }
        .reg-input:focus { border-color: ${TEAL} !important; outline: none; }
        .reg-input { transition: border-color 0.15s; }
      `}</style>

      {/* Nav mínimo */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: BEBAS, fontSize: 22, color: 'white', letterSpacing: '0.08em' }}>CBC™</span>
        <Link href="/login" style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.14em', textDecoration: 'none' }}>
          YA TENGO CUENTA →
        </Link>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '60px 24px 80px' }}>

        {/* ── 1. BIENVENIDA ── */}
        <div className="reg-block" style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: `${TEAL}99`, letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 16 }}>
            Bienvenido a tu prueba gratuita
          </div>
          <h1 style={{ fontFamily: BEBAS, fontSize: 'clamp(42px, 10vw, 64px)', lineHeight: 0.92, margin: '0 0 20px', letterSpacing: '0.02em' }}>
            <span style={{ color: 'white' }}>EMPIEZA A </span>
            <span style={{ color: ROJO }}>CERRAR MÁS.</span><br />
            <span style={{ color: 'white' }}>HOY.</span>
          </h1>
          <p style={{ fontFamily: SANS, fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, maxWidth: 440, margin: '0 auto' }}>
            CBC™ es la app que devuelve <strong style={{ color: 'white' }}>2 horas al día</strong> al vendedor — para que toda tu energía vaya a lo que genera comisiones.
          </p>
        </div>

        {/* ── 2. QUÉ VAS A TENER ── */}
        <div className="reg-block" style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 20 }}>
            Lo que activas hoy
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: '⚡', title: 'Sofía organiza tu día', desc: 'Te dice a quién llamar primero, cada mañana.' },
              { icon: '📞', title: 'Mi Llamada Perfecta™', desc: 'Guión listo antes de marcar. Nunca más improvisar.' },
              { icon: '📄', title: 'Propuesta Express™', desc: '5 campos → propuesta lista en 2 minutos.' },
              { icon: '🛡️', title: 'Escudo de Objeciones™', desc: 'La respuesta exacta para cada "lo pienso".' },
              { icon: '📊', title: 'Reporte al Jefe™', desc: 'Tu reporte de desempeño, listo con tus datos reales.' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '14px 18px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10,
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 14, color: 'white', marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.50)' }}>{item.desc}</div>
                </div>
                <span style={{ marginLeft: 'auto', color: TEAL, fontSize: 16, flexShrink: 0 }}>✓</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. RESULTADOS ── */}
        <div className="reg-block" style={{ marginBottom: 48 }}>
          <div style={{ background: 'rgba(78,205,196,0.06)', border: `1px solid rgba(78,205,196,0.18)`, borderRadius: 12, padding: '24px 24px' }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: `${TEAL}80`, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 16 }}>En tu primera semana</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { num: '+2H', label: 'libres al día' },
                { num: '10', label: 'herramientas activas' },
                { num: '0', label: 'pesos de riesgo' },
                { num: '7D', label: 'para comprobarlo' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: BEBAS, fontSize: 36, color: i === 2 ? ROJO : TEAL, lineHeight: 1, letterSpacing: '0.02em' }}>{s.num}</div>
                  <div style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.50)', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 4. FORMULARIO ── */}
        <div className="reg-block">
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 20 }}>
            Crea tu cuenta — es gratis
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '32px 28px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.40)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>Tu nombre</label>
                <input
                  type="text" name="nombre" value={form.nombre}
                  onChange={handleChange} required placeholder="Juan Pérez"
                  className="reg-input"
                  style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, padding: '14px 16px', color: 'white', fontFamily: SANS, fontSize: 15 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.40)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>Email</label>
                <input
                  type="email" name="email" value={form.email}
                  onChange={handleChange} required placeholder="tu@email.com"
                  className="reg-input"
                  style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, padding: '14px 16px', color: 'white', fontFamily: SANS, fontSize: 15 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.40)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>Contraseña</label>
                <input
                  type="password" name="password" value={form.password}
                  onChange={handleChange} required minLength={8} placeholder="Mínimo 8 caracteres"
                  className="reg-input"
                  style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, padding: '14px 16px', color: 'white', fontFamily: SANS, fontSize: 15 }}
                />
              </div>

              {error && (
                <div style={{ fontFamily: SANS, fontSize: 13, color: ROJO, background: 'rgba(232,0,29,0.08)', border: `1px solid rgba(232,0,29,0.20)`, borderRadius: 8, padding: '12px 16px' }}>
                  {error}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                style={{
                  background: loading ? 'rgba(255,255,255,0.08)' : 'linear-gradient(180deg, #c8001a 0%, #9a0014 60%, #7a000f 100%)',
                  color: loading ? 'rgba(255,255,255,0.30)' : 'white',
                  fontFamily: BEBAS, fontSize: 20, letterSpacing: '0.10em',
                  padding: '16px 32px', borderRadius: 14,
                  border: '3px solid rgba(255,255,255,0.15)',
                  boxShadow: loading ? 'none' : '0 8px 0 #4a0008, 0 12px 28px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)',
                  textShadow: loading ? 'none' : '0 1px 3px rgba(0,0,0,0.5)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'transform 0.08s ease, box-shadow 0.08s ease',
                  width: '100%',
                }}
                onMouseDown={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(5px)'; e.currentTarget.style.boxShadow = '0 3px 0 #4a0008, 0 5px 12px rgba(0,0,0,0.6)' } }}
                onMouseUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 0 #4a0008, 0 12px 28px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 0 #4a0008, 0 12px 28px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)' }}
              >
                {loading ? 'CREANDO TU CUENTA...' : 'EMPEZAR MIS 7 DÍAS GRATIS →'}
              </button>
            </form>

            <p style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center', marginTop: 18 }}>
              Sin tarjeta · $9.90/mes después del trial · Cancela cuando quieras
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
