'use client'

import { useEffect, useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'

const VERDE = '#1A4A44'
const TEAL = '#4ECDC4'
const BEIGE = '#F5F0E8'

const AUDIOS = [
  {
    num: 1,
    emoji: '🌅',
    cuando: 'Antes de empezar el día',
    para: 'Borra el miedo. Instala el modo vendedor.',
    url: 'https://www.youtube.com/watch?v=95jv4jijt9Y',
  },
  {
    num: 2,
    emoji: '⚡',
    cuando: '20 min antes de una reunión',
    para: 'De nervioso a imparable en 20 minutos.',
    url: 'https://www.youtube.com/watch?v=dppWdBgPogU',
  },
  {
    num: 3,
    emoji: '🎯',
    cuando: 'Mientras haces seguimiento',
    para: 'Dopamina pura. Vendes sin darte cuenta.',
    url: 'https://www.youtube.com/watch?v=foLA6N1S7mI',
  },
  {
    num: 4,
    emoji: '🔮',
    cuando: 'Para cerrar lo imposible',
    para: 'Persuasión magnética activada.',
    url: 'https://www.youtube.com/watch?v=RIwbb1vw1Mc',
  },
  {
    num: 5,
    emoji: '💪',
    cuando: 'Cuando el impostor aparece',
    para: 'Silencia la duda. Activa tu poder.',
    url: 'https://www.youtube.com/watch?v=EqIV4kRNUbQ',
  },
  {
    num: 6,
    emoji: '⚡',
    cuando: 'Para operar al 100%',
    para: 'Sin bloqueos. Sin frenos. Sin límites.',
    url: 'https://www.youtube.com/watch?v=eQhmAzU0wxM',
  },
  {
    num: 7,
    emoji: '🧠',
    cuando: 'Sesión profunda semanal',
    para: 'Instala los patrones de los vendedores élite.',
    url: 'https://www.youtube.com/watch?v=Kn5DrgwoxMM',
  },
  {
    num: 8,
    emoji: '🏆',
    cuando: 'Antes de presentación clave',
    para: 'Entras sabiendo que eres la mejor opción.',
    url: 'https://www.youtube.com/watch?v=IbYurGgVf2M',
  },
]

function youtubeEmbed(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : url
}

interface RitualData {
  ritual: string
  victoriasMes: number
  rojos: number
  amarillos: number
  pipeline: string
}

export default function ModoCrackPage() {
  const [data, setData] = useState<RitualData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function cargar() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/herramientas/modo-crack', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Error cargando el ritual.'); return }
      setData(json)
    } catch {
      setError('Sin conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  return (
    <div className="max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: VERDE, fontFamily: 'var(--font-jakarta)' }}>
          🔥 Mi Modo Crack™
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Prepárate mentalmente. Entra al día como un vendedor élite.
        </p>
      </div>

      {/* ── SECCIÓN 1: Ritual del día ── */}
      <div
        className="rounded-2xl p-6 mb-8 relative overflow-hidden"
        style={{ backgroundColor: VERDE }}
      >
        {/* Decoración de fondo */}
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-5"
          style={{ background: TEAL, transform: 'translate(30%, -30%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-5"
          style={{ background: TEAL, transform: 'translate(-30%, 30%)' }}
        />

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: TEAL }}>
              ✨ Tu ritual de hoy
            </p>
            {!loading && (
              <button
                onClick={cargar}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                style={{ color: VERDE, backgroundColor: TEAL }}
              >
                <RefreshCw size={12} />
                Nuevo ritual
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center gap-3 py-4">
              <Loader2 size={18} className="animate-spin" style={{ color: TEAL }} />
              <p className="text-sm" style={{ color: BEIGE, opacity: 0.7 }}>Preparando tu ritual...</p>
            </div>
          ) : error ? (
            <div>
              <p className="text-sm mb-3" style={{ color: '#fca5a5' }}>{error}</p>
              <button
                onClick={cargar}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ color: VERDE, backgroundColor: TEAL }}
              >
                Reintentar
              </button>
            </div>
          ) : data ? (
            <div>
              <p
                className="text-lg leading-relaxed font-medium mb-5"
                style={{ color: BEIGE, fontFamily: 'var(--font-jakarta)' }}
              >
                {data.ritual}
              </p>
              {/* Mini stats */}
              <div className="flex gap-3 flex-wrap">
                {[
                  { label: 'Rojos hoy', value: data.rojos, color: '#fca5a5' },
                  { label: 'Amarillos', value: data.amarillos, color: '#fde047' },
                  { label: 'Victorias este mes', value: data.victoriasMes, color: TEAL },
                  { label: 'Pipeline', value: data.pipeline, color: '#86efac' },
                ].map(s => (
                  <div
                    key={s.label}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: s.color }}
                  >
                    {s.value} {s.label}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* ── SECCIÓN 2: Los 8 audios ── */}
      <div className="mb-4">
        <h2 className="text-lg font-bold mb-1" style={{ color: VERDE, fontFamily: 'var(--font-jakarta)' }}>
          🎧 Los 8 audios de reprogramación
        </h2>
        <p className="text-sm text-gray-500">Elige el que necesitas ahora mismo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AUDIOS.map(a => (
          <div
            key={a.num}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            {/* Card header */}
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{a.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: TEAL }}>
                    {a.cuando}
                  </p>
                  <p className="text-sm font-semibold leading-snug" style={{ color: VERDE }}>
                    {a.para}
                  </p>
                </div>
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                  style={{ background: BEIGE, color: VERDE }}
                >
                  {a.num}
                </span>
              </div>
            </div>

            {/* YouTube player */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={youtubeEmbed(a.url)}
                title={`Audio ${a.num} — ${a.cuando}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                style={{ border: 'none' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
