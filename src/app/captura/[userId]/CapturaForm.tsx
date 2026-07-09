'use client'

import { useState } from 'react'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface Props {
  userId: string
}

export default function CapturaForm({ userId }: Props) {
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    nombre: '',
    empresa: '',
    cargo: '',
    whatsapp: '',
    email: '',
    urgencia: '',
    como_encontro: '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/captura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, ...form }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al enviar. Intenta de nuevo.')
        return
      }
      setEnviado(true)
    } catch {
      setError('Sin conexión. Verifica tu internet e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (enviado) {
    return (
      <div style={{ minHeight: '100dvh', background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#1A4A44', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={36} color="white" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-jakarta)', fontSize: 26, fontWeight: 800, color: '#1A4A44', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
            ¡Listo!
          </h1>
          <p style={{ fontSize: 17, color: '#374151', lineHeight: 1.6, margin: '0 0 8px' }}>
            Te contactamos pronto.
          </p>
          <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
            Ya tenemos tus datos. En breve recibirás noticias.
          </p>
        </div>
      </div>
    )
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px 14px',
    borderRadius: 10,
    border: '1.5px solid #d1d5db',
    fontSize: 15,
    fontFamily: 'var(--font-inter), system-ui, sans-serif',
    background: 'white',
    color: '#111827',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
  }

  const fieldStyle: React.CSSProperties = { marginBottom: 16 }

  return (
    <div style={{ minHeight: '100dvh', background: '#F5F0E8', padding: '0 0 48px' }}>
      {/* Header */}
      <div style={{ background: '#1A4A44', padding: '20px 20px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: 22, fontWeight: 800, color: 'white', margin: '0 0 2px', letterSpacing: '-0.4px' }}>
          CBC™
        </p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
          Cierre Bajo Control
        </p>
      </div>

      <div style={{ maxWidth: 440, margin: '0 auto', padding: '28px 16px 0' }}>
        <h1 style={{ fontFamily: 'var(--font-jakarta)', fontSize: 22, fontWeight: 800, color: '#1A4A44', margin: '0 0 6px', letterSpacing: '-0.4px' }}>
          Déjame tus datos
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px', lineHeight: 1.5 }}>
          Nos ponemos en contacto contigo en menos de 24 horas.
        </p>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
            <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 16, padding: '24px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>

          <div style={fieldStyle}>
            <label style={labelStyle}>Nombre completo <span style={{ color: '#ef4444' }}>*</span></label>
            <input style={inputStyle} type="text" placeholder="Ana García"
              value={form.nombre} onChange={e => set('nombre', e.target.value)} required autoComplete="name" />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Empresa <span style={{ color: '#ef4444' }}>*</span></label>
            <input style={inputStyle} type="text" placeholder="Distribuidora López S.A."
              value={form.empresa} onChange={e => set('empresa', e.target.value)} required autoComplete="organization" />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Cargo <span style={{ color: '#9ca3af', fontWeight: 400 }}>(opcional)</span></label>
            <input style={inputStyle} type="text" placeholder="Gerente Comercial"
              value={form.cargo} onChange={e => set('cargo', e.target.value)} autoComplete="organization-title" />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>WhatsApp con código de país <span style={{ color: '#ef4444' }}>*</span></label>
            <input style={inputStyle} type="tel" placeholder="+52 55 1234 5678"
              value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} required autoComplete="tel" />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Email <span style={{ color: '#9ca3af', fontWeight: 400 }}>(opcional)</span></label>
            <input style={inputStyle} type="email" placeholder="ana@empresa.com"
              value={form.email} onChange={e => set('email', e.target.value)} autoComplete="email" />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>¿En qué momento estás? <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { value: 'listo', label: '🔴 Listo para comprar', sub: 'Necesito una solución ahora' },
                { value: 'explorando', label: '🟡 Explorando opciones', sub: 'Estoy evaluando qué me conviene' },
                { value: 'curiosidad', label: '🟢 Solo curiosidad', sub: 'Quiero entender qué es esto' },
              ].map(opt => (
                <label key={opt.value} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                  border: `1.5px solid ${form.urgencia === opt.value ? '#1A4A44' : '#e5e7eb'}`,
                  background: form.urgencia === opt.value ? '#F0F7F6' : 'white',
                }}>
                  <input type="radio" name="urgencia" value={opt.value}
                    checked={form.urgencia === opt.value}
                    onChange={() => set('urgencia', opt.value)}
                    required style={{ accentColor: '#1A4A44', width: 16, height: 16, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>{opt.label}</p>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{opt.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div style={{ ...fieldStyle, marginBottom: 24 }}>
            <label style={labelStyle}>¿Cómo me encontraste? <span style={{ color: '#9ca3af', fontWeight: 400 }}>(opcional)</span></label>
            <input style={inputStyle} type="text" placeholder="En el evento, por Instagram, me recomendaron..."
              value={form.como_encontro} onChange={e => set('como_encontro', e.target.value)} />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '15px', borderRadius: 12,
            background: loading ? '#9ca3af' : '#1A4A44',
            color: 'white', fontSize: 15, fontWeight: 700,
            fontFamily: 'var(--font-jakarta)', border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '-0.1px',
          }}>
            {loading ? 'Enviando...' : 'Enviar mis datos →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 16, lineHeight: 1.5 }}>
          Tus datos no se venden ni se comparten.<br />
          CBC™ · Cierre Bajo Control
        </p>
      </div>
    </div>
  )
}
