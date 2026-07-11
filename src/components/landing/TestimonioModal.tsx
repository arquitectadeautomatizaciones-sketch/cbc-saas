'use client'

import { useState } from 'react'

const VERDE = '#1A4A44'
const TEAL = '#4ECDC4'

interface Props {
  onClose: () => void
}

export default function TestimonioModal({ onClose }: Props) {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [r1, setR1] = useState('')
  const [r2, setR2] = useState('')
  const [r3, setR3] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  async function enviar() {
    if (!r1.trim()) { setError('La primera respuesta es requerida.'); return }
    setError('')
    setEnviando(true)
    const res = await fetch('/api/testimonios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, empresa, respuesta_1: r1, respuesta_2: r2, respuesta_3: r3 }),
    })
    setEnviando(false)
    if (res.ok) {
      setEnviado(true)
    } else {
      setError('Hubo un error. Intenta de nuevo.')
    }
  }

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div style={{
        background: 'white',
        borderRadius: 20,
        padding: '32px 28px',
        width: '100%',
        maxWidth: 480,
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            fontSize: 22,
            cursor: 'pointer',
            color: '#9ca3af',
            lineHeight: 1,
          }}
        >×</button>

        {enviado ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🙌</div>
            <p style={{ margin: '0 0 8px', fontWeight: 800, fontSize: 20, color: VERDE }}>¡Gracias por compartir tu experiencia!</p>
            <p style={{ margin: '0 0 24px', fontSize: 15, color: '#6b7280', lineHeight: 1.5 }}>Tu testimonio ayuda a otros vendedores a conocer CBC. Lo revisaremos pronto.</p>
            <button
              onClick={onClose}
              style={{ padding: '12px 28px', borderRadius: 10, border: 'none', background: VERDE, color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <p style={{ margin: '0 0 4px', fontWeight: 800, fontSize: 20, color: VERDE }}>Comparte tu experiencia con CBC</p>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#6b7280' }}>3 preguntas rápidas. Tu historia ayuda a otros vendedores.</p>

            {/* Data opcional */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 5 }}>Tu nombre</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="María García" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 5 }}>Empresa / sector</label>
                <input value={empresa} onChange={e => setEmpresa(e.target.value)} placeholder="Seguros / Tecnología" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 5 }}>Email (opcional)</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="para que te contactemos si lo publicamos" style={inputStyle} />
            </div>

            {/* Q1 — required */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: VERDE, marginBottom: 8 }}>
                1. ¿Qué problema tenías antes de usar CBC? *
              </label>
              <textarea
                value={r1}
                onChange={e => setR1(e.target.value)}
                rows={3}
                placeholder="Describelo con tus propias palabras..."
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {/* Q2 */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: VERDE, marginBottom: 8 }}>
                2. ¿Qué cambió en tu proceso de ventas desde que usas CBC?
              </label>
              <textarea
                value={r2}
                onChange={e => setR2(e.target.value)}
                rows={3}
                placeholder="Qué haces diferente ahora..."
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {/* Q3 */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: VERDE, marginBottom: 8 }}>
                3. ¿Qué le dirías a un vendedor que todavía no lo usa?
              </label>
              <textarea
                value={r3}
                onChange={e => setR3(e.target.value)}
                rows={3}
                placeholder="Tu recomendación honesta..."
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {error && <p style={{ color: '#dc2626', fontSize: 13, margin: '0 0 12px' }}>{error}</p>}

            <button
              onClick={enviar}
              disabled={enviando}
              style={{
                display: 'block',
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                border: 'none',
                background: VERDE,
                color: 'white',
                fontWeight: 800,
                fontSize: 15,
                cursor: enviando ? 'not-allowed' : 'pointer',
              }}
            >
              {enviando ? 'Enviando...' : 'Enviar mi testimonio →'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '10px 13px',
  borderRadius: 8,
  border: '2px solid #e5e7eb',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}
