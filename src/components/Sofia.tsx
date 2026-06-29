'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import type { ContextoSofia } from '@/lib/types'

interface Mensaje {
  rol: 'usuario' | 'sofia'
  contenido: string
}

interface Props {
  userId: string
  contexto: ContextoSofia
}

export default function Sofia({ contexto }: Props) {
  const sessionId = useRef(crypto.randomUUID())
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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

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
        setMensajes((prev) => [
          ...prev,
          { rol: 'sofia', contenido: data.error ?? 'Ocurrió un error. Intenta de nuevo.' },
        ])
        return
      }

      setMensajes((prev) => [...prev, { rol: 'sofia', contenido: data.respuesta }])
    } catch {
      setMensajes((prev) => [
        ...prev,
        { rol: 'sofia', contenido: 'No pude conectarme. Verifica tu conexión.' },
      ])
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col" style={{ height: '480px' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-6 py-4 rounded-t-2xl border-b border-gray-100"
        style={{ backgroundColor: '#1A4A44' }}
      >
        <img
          src="https://assets.cdn.filesafe.space/MgsViYLMmCdJksx9p3va/media/69e8ba57a1636a6c65273241.png"
          alt="Sofía"
          style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', flexShrink: 0 }}
        />
        <div>
          <p className="text-white font-semibold text-sm">Sofía</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {mensajes.map((m, i) => (
          <div key={i} className={`flex ${m.rol === 'usuario' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
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
                <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 8, marginBottom: 0, borderTop: '1px solid #e5e7eb', paddingTop: 6 }}>
                  — Generado con CBC · Cierre Bajo Control™
                </p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm border border-gray-100" style={{ backgroundColor: '#F5F0E8' }}>
              <Loader2 size={16} className="animate-spin text-gray-400" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escríbele a Sofía... (Enter para enviar)"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={enviar}
            disabled={loading || !input.trim()}
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-opacity disabled:opacity-40"
            style={{ backgroundColor: '#4ECDC4' }}
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
