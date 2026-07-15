'use client'

import { useState, useEffect, useRef } from 'react'

const SOFIA_PHOTO = 'https://assets.cdn.filesafe.space/MgsViYLMmCdJksx9p3va/media/69e8ba57a1636a6c65273241.png'
const TEAL = '#4ECDC4'
const ROJO = '#e8001d'

interface Msg { role: 'user' | 'assistant'; content: string }

const SALUDO = `¡Hola! 👋 Soy Sofía, del equipo de CBC™. Qué bueno que estás acá explorando esto — significa que algo en tu proceso comercial te está inquietando.

Cuéntame, ¿cuántas horas a la semana sientes que pierdes en tareas que no te generan comisión directa?`

export default function SofiaLandingChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [shown, setShown] = useState(false)
  const [pulse, setPulse] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-open after 5 seconds
  useEffect(() => {
    const t = setTimeout(() => {
      setShown(true)
      setPulse(true)
      setTimeout(() => setPulse(false), 4000)
    }, 5000)
    return () => clearTimeout(t)
  }, [])

  // Add greeting when chat opens for first time
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', content: SALUDO }])
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    const newMsgs: Msg[] = [...messages, { role: 'user', content: text }]
    setMessages(newMsgs)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/sofia-landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Perdón, algo falló. ¿Me escribes de nuevo?' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Ups, se fue la conexión un momento. ¿Intentamos de nuevo?' }])
    } finally {
      setLoading(false)
    }
  }

  if (!shown) return null

  return (
    <>
      <style>{`
        @keyframes sofiaSlideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes sofiaPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(78,205,196,0.6); } 50% { box-shadow: 0 0 0 12px rgba(78,205,196,0); } }
        @keyframes sofiaDot { 0%,80%,100% { opacity:0.2; transform:scale(0.8); } 40% { opacity:1; transform:scale(1); } }
        .sofia-bubble { animation: sofiaSlideUp 0.35s ease; }
        .sofia-pulse { animation: sofiaPulse 1.4s ease-in-out infinite; }
        .sofia-dot { display:inline-block; width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,0.7); animation:sofiaDot 1.2s ease-in-out infinite; }
        .sofia-dot:nth-child(2) { animation-delay:0.2s; }
        .sofia-dot:nth-child(3) { animation-delay:0.4s; }
        .sofia-msg { max-width:82%; padding:10px 14px; border-radius:18px; font-size:14px; line-height:1.55; word-break:break-word; }
        .sofia-scroll::-webkit-scrollbar { width:4px; }
        .sofia-scroll::-webkit-scrollbar-track { background:transparent; }
        .sofia-scroll::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.12); border-radius:2px; }
      `}</style>

      {/* Botón flotante */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className={pulse ? 'sofia-pulse' : ''}
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 10000,
            width: 60, height: 60, borderRadius: '50%', border: `2px solid ${TEAL}`,
            padding: 0, cursor: 'pointer', overflow: 'hidden',
            background: '#111',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          aria-label="Hablar con Sofía"
        >
          <img src={SOFIA_PHOTO} alt="Sofía" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {/* Punto verde online */}
          <span style={{
            position: 'absolute', bottom: 3, right: 3,
            width: 12, height: 12, borderRadius: '50%',
            background: '#22c55e', border: '2px solid #111',
          }} />
        </button>
      )}

      {/* Ventana de chat */}
      {open && (
        <div
          className="sofia-bubble"
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 10000,
            width: 'min(380px, calc(100vw - 32px))',
            height: 'min(560px, calc(100vh - 48px))',
            background: '#0d0d0d',
            border: `1px solid rgba(78,205,196,0.25)`,
            borderRadius: 16,
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 12px 48px rgba(0,0,0,0.7)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            background: '#111',
            borderBottom: `1px solid rgba(78,205,196,0.18)`,
            padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            flexShrink: 0,
          }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img src={SOFIA_PHOTO} alt="Sofía" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${TEAL}` }} />
              <span style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: '#22c55e', border: '2px solid #111' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontWeight: 700, fontSize: 14, color: 'white' }}>Sofía · CBC™</div>
              <div style={{ fontFamily: "'General Sans', system-ui, sans-serif", fontSize: 11, color: TEAL, opacity: 0.85 }}>Ejecutiva Comercial · En línea</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.40)', fontSize: 20, lineHeight: 1, padding: 4 }}
              aria-label="Cerrar"
            >×</button>
          </div>

          {/* Mensajes */}
          <div
            className="sofia-scroll"
            style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
                {m.role === 'assistant' && (
                  <img src={SOFIA_PHOTO} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, alignSelf: 'flex-end' }} />
                )}
                <div
                  className="sofia-msg"
                  style={{
                    background: m.role === 'user' ? '#1a1a1a' : 'rgba(78,205,196,0.10)',
                    border: m.role === 'user' ? '1px solid rgba(255,255,255,0.08)' : `1px solid rgba(78,205,196,0.18)`,
                    color: 'rgba(255,255,255,0.92)',
                    fontFamily: "'General Sans', system-ui, sans-serif",
                    borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                <img src={SOFIA_PHOTO} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                <div className="sofia-msg" style={{ background: 'rgba(78,205,196,0.10)', border: `1px solid rgba(78,205,196,0.18)`, display: 'flex', gap: 5, alignItems: 'center', padding: '12px 16px' }}>
                  <span className="sofia-dot" /><span className="sofia-dot" /><span className="sofia-dot" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* CTA trial */}
          <div style={{ padding: '0 14px 8px', flexShrink: 0 }}>
            <a
              href="/register"
              style={{
                display: 'block', textAlign: 'center',
                background: 'linear-gradient(180deg, #c8001a 0%, #9a0014 60%, #7a000f 100%)',
                color: 'white',
                fontFamily: "'Bebas Neue', Impact, sans-serif",
                fontSize: 15, letterSpacing: '0.10em',
                padding: '12px 16px', borderRadius: 14,
                textDecoration: 'none',
                border: '3px solid rgba(255,255,255,0.15)',
                boxShadow: '0 6px 0 #4a0008, 0 10px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
                textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                transition: 'transform 0.08s ease, box-shadow 0.08s ease',
              }}
              onMouseDown={e => { e.currentTarget.style.transform = 'translateY(4px)'; e.currentTarget.style.boxShadow = '0 2px 0 #4a0008, 0 4px 8px rgba(0,0,0,0.5)' }}
              onMouseUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 0 #4a0008, 0 10px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 0 #4a0008, 0 10px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)' }}
            >
              PROBAR 7 DÍAS GRATIS — SIN TARJETA
            </a>
          </div>

          {/* Input */}
          <div style={{
            padding: '8px 14px 14px', flexShrink: 0,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', gap: 8, alignItems: 'center',
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Escribe tu mensaje..."
              style={{
                flex: 1, background: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 24, padding: '10px 16px',
                color: 'rgba(255,255,255,0.90)',
                fontFamily: "'General Sans', system-ui, sans-serif",
                fontSize: 14, outline: 'none',
              }}
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                background: input.trim() ? TEAL : 'rgba(255,255,255,0.08)',
                border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
              }}
              aria-label="Enviar"
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke={input.trim() ? '#111' : 'rgba(255,255,255,0.3)'} strokeWidth="2" strokeLinecap="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={input.trim() ? '#111' : 'rgba(255,255,255,0.3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
