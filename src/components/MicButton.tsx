'use client'

import { useState, useRef } from 'react'
import { Mic, MicOff } from 'lucide-react'

interface Props {
  onResult: (text: string) => void
  append?: boolean
}

// Imported with { ssr: false } everywhere — window is always defined here
export default function MicButton({ onResult }: Props) {
  const [escuchando, setEscuchando] = useState(false)
  const recognitionRef = useRef<any>(null)

  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SR) return null

  function toggle() {
    if (escuchando) {
      recognitionRef.current?.stop()
      setEscuchando(false)
      return
    }
    const rec = new SR()
    rec.lang = navigator.language || 'es-CO'
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.onstart = () => setEscuchando(true)
    rec.onend = () => setEscuchando(false)
    rec.onerror = () => setEscuchando(false)
    rec.onresult = (e: any) => {
      onResult(e.results[0][0].transcript)
    }
    recognitionRef.current = rec
    rec.start()
  }

  return (
    <>
      <style>{`
        @keyframes mic-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
        }
      `}</style>
      <button
        type="button"
        onClick={toggle}
        title={escuchando ? 'Toca para detener' : 'Dictar con voz'}
        style={{
          flexShrink: 0,
          width: 34,
          height: 34,
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: escuchando ? '#ef4444' : '#f3f4f6',
          color: escuchando ? 'white' : '#6b7280',
          animation: escuchando ? 'mic-pulse 1s ease-in-out infinite' : 'none',
        }}
      >
        {escuchando ? <MicOff size={14} /> : <Mic size={14} />}
      </button>
    </>
  )
}
