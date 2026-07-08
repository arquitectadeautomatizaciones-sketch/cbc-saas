'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, X } from 'lucide-react'
import type { ContextoSofia } from '@/lib/types'

interface Mensaje {
  rol: 'usuario' | 'sofia'
  contenido: string
}

interface Props {
  userId: string
  contexto: ContextoSofia
}

const SOFIA_IMG = 'https://assets.cdn.filesafe.space/MgsViYLMmCdJksx9p3va/media/69e8ba57a1636a6c65273241.png'

export default function Sofia({ contexto }: Props) {
  const sessionId = useRef(crypto.randomUUID())
  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      rol: 'sofia',
      contenido: `Hola ${contexto.nombre ?? 'Diana'}, bienvenida al equipo.\nVeo que acabas de activar tu sistema.\nEl primer paso es cargar tus primeros prospectos — con eso el semáforo empieza a trabajar por ti.\n¿Cuántos prospectos tienes activos ahora mismo?`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (abierto) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, abierto])

  useEffect(() => {
    const handler = () => setAbierto(true)
    window.addEventListener('abrir-sofia', handler)
    return () => window.removeEventListener('abrir-sofia', handler)
  }, [])

  async function enviar() {
    const texto = input.trim()
    if (!texto || loading) return
    setInput('')
    setMensajes((prev) => [...prev, { rol: 'usuario', contenido: texto }])
    setLoading(true)
    try {
      const res = await fetch('/api/support-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: texto, session_id: sessionId.current }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMensajes((prev) => [...prev, { rol: 'sofia', contenido: data.error ?? 'Ocurrió un error. Intenta de nuevo.' }])
        return
      }
      setMensajes((prev) => [...prev, { rol: 'sofia', contenido: data.respuesta }])
    } catch {
      setMensajes((prev) => [...prev, { rol: 'sofia', contenido: 'No pude conectarme. Verifica tu conexión.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  return (
    <>
      <style>{`
        .sofia-widget {
          position: fixed;
          z-index: 50;
          display: flex;
          flex-direction: column;
          background: white;
          box-shadow: 0 20px 60px rgba(0,0,0,0.18);
          /* Móvil: pantalla completa */
          inset: 0;
          border-radius: 0;
        }
        @media (min-width: 768px) {
          .sofia-widget {
            /* Desktop: ventana flotante */
            inset: auto;
            bottom: 88px;
            right: 24px;
            width: 380px;
            height: 500px;
            border-radius: 20px;
          }
        }
        .sofia-header {
          border-radius: 0;
        }
        @media (min-width: 768px) {
          .sofia-header {
            border-radius: 20px 20px 0 0;
          }
          .sofia-input-area {
            border-radius: 0 0 20px 20px;
          }
        }
      `}</style>

      {/* Overlay móvil */}
      {abierto && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-black/40"
          onClick={() => setAbierto(false)}
        />
      )}

      {/* Ventana del chat */}
      {abierto && (
        <div className="sofia-widget">
          {/* Header */}
          <div
            className="sofia-header flex items-center gap-3 px-5 py-4 flex-shrink-0"
            style={{ backgroundColor: '#1A4A44' }}
          >
            <img
              src={SOFIA_IMG}
              alt="Sofía"
              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', flexShrink: 0 }}
            />
            <div className="flex-1">
              <p className="text-white font-semibold text-sm leading-none">Sofía</p>
              <p className="text-white/50 text-xs mt-0.5">Tu asistente de ventas</p>
            </div>
            <button
              onClick={() => setAbierto(false)}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Cerrar Sofía"
            >
              <X size={18} />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ backgroundColor: '#fafafa' }}>
            {mensajes.map((m, i) => (
              <div key={i} className={`flex ${m.rol === 'usuario' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    m.rol === 'usuario'
                      ? 'text-white rounded-tr-sm'
                      : 'text-gray-800 rounded-tl-sm border border-gray-100'
                  }`}
                  style={
                    m.rol === 'usuario'
                      ? { backgroundColor: '#1A4A44' }
                      : { backgroundColor: '#F5F0E8' }
                  }
                >
                  {m.contenido}
                  {m.rol === 'sofia' && i > 0 && (
                    <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 6, marginBottom: 0, borderTop: '1px solid #e5e7eb', paddingTop: 5 }}>
                      — Generado con CBC · Cierre Bajo Control™
                    </p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm border border-gray-100" style={{ backgroundColor: '#F5F0E8' }}>
                  <Loader2 size={14} className="animate-spin text-gray-400" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="sofia-input-area px-3 py-3 border-t border-gray-100 flex-shrink-0 bg-white">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escríbele a Sofía..."
                rows={1}
                className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none"
                style={{ maxHeight: '100px' }}
              />
              <button
                onClick={enviar}
                disabled={loading || !input.trim()}
                className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-opacity disabled:opacity-40"
                style={{ backgroundColor: '#4ECDC4' }}
              >
                <Send size={14} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botón launcher — siempre visible */}
      <button
        onClick={() => setAbierto((v) => !v)}
        className="fixed z-40 flex items-center justify-center shadow-xl transition-transform hover:scale-105 active:scale-95"
        style={{
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: '#1A4A44',
          border: '3px solid white',
        }}
        aria-label={abierto ? 'Cerrar Sofía' : 'Hablar con Sofía'}
      >
        {abierto ? (
          <X size={20} className="text-white" />
        ) : (
          <img
            src={SOFIA_IMG}
            alt="Sofía"
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top' }}
          />
        )}
      </button>
    </>
  )
}
