'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff } from 'lucide-react'

interface Props {
  onResult: (text: string) => void
  /** Appends to existing value instead of replacing */
  append?: boolean
}

export default function MicButton({ onResult, append }: Props) {
  const [supported, setSupported] = useState(false)
  const [escuchando, setEscuchando] = useState(false)
  const recognitionRef = useRef<InstanceType<typeof window.SpeechRecognition> | null>(null)

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setSupported(!!SR)
  }, [])

  if (!supported) return null

  function toggle() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

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
      const texto = e.results[0][0].transcript
      onResult(texto)
    }

    recognitionRef.current = rec
    rec.start()
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={escuchando ? 'Toca para detener' : 'Dictar con voz'}
      style={{
        position: 'absolute',
        right: 10,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 28,
        height: 28,
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: escuchando ? '#ef4444' : '#f3f4f6',
        color: escuchando ? 'white' : '#6b7280',
        flexShrink: 0,
        animation: escuchando ? 'mic-pulse 1s ease-in-out infinite' : 'none',
      }}
    >
      <style>{`
        @keyframes mic-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
          50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
        }
      `}</style>
      {escuchando ? <MicOff size={13} /> : <Mic size={13} />}
    </button>
  )
}
