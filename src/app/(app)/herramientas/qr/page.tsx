'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download, RefreshCw, Copy, Check } from 'lucide-react'

const SITE_URL = 'https://app.arquitectadeautomatizaciones.com'

const FRASES = [
  { emoji: '📱', texto: 'Escanea y te contacto hoy mismo', sub: 'Para redes sociales y presentaciones' },
  { emoji: '⚡', texto: 'Sin papel. Tus datos llegan directo.', sub: 'Para eventos y ferias' },
  { emoji: '🎯', texto: 'Escanea — te llamo en menos de 24h', sub: 'Para tarjetas y material impreso' },
  { emoji: '🤝', texto: 'Deja tus datos en 30 segundos', sub: 'Para stands y reuniones grupales' },
]

interface ProspectoQR {
  id: string
  nombre: string
  empresa: string | null
  cargo: string | null
  telefono: string | null
  semaforo: 'verde' | 'amarillo' | 'rojo'
  created_at: string
}

const SEMAFORO_COLOR = { rojo: '#ef4444', amarillo: '#f59e0b', verde: '#10b981' }
const SEMAFORO_LABEL = { rojo: 'Listo para comprar', amarillo: 'Explorando', verde: 'Curiosidad' }

export default function QRCaptura() {
  const [userId, setUserId] = useState<string | null>(null)
  const [prospectos, setProspectos] = useState<ProspectoQR[]>([])
  const [loading, setLoading] = useState(true)
  const [copiado, setCopiado] = useState(false)
  const svgRef = useRef<HTMLDivElement>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/prospectos/qr')
      const data = await res.json()
      if (res.ok) {
        setUserId(data.userId)
        setProspectos(data.prospectos)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const capturaUrl = userId ? `${SITE_URL}/captura/${userId}` : ''

  function copiarLink() {
    if (!capturaUrl) return
    navigator.clipboard.writeText(capturaUrl)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  function descargarQR() {
    if (!svgRef.current || !userId) return
    const svgEl = svgRef.current.querySelector('svg')
    if (!svgEl) return

    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!

    const svgData = new XMLSerializer().serializeToString(svgEl)
    const img = new Image()
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, size, size)
      ctx.drawImage(img, 0, 0, size, size)
      URL.revokeObjectURL(url)
      const link = document.createElement('a')
      link.download = 'CBC-QR-captura.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    img.src = url
  }

  function formatFecha(iso: string) {
    return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#1A4A44', fontFamily: 'var(--font-jakarta)' }}>
          QR de Captura Inteligente™
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Tu prospecto escanea, llena sus datos y llegan directo a tu pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel QR */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-base mb-4" style={{ color: '#1A4A44' }}>Tu QR personal</h2>

          {!userId ? (
            <div className="flex items-center justify-center h-48">
              <RefreshCw size={24} className="animate-spin text-gray-300" />
            </div>
          ) : (
            <>
              {/* QR centrado con fondo beige */}
              <div
                ref={svgRef}
                className="flex items-center justify-center rounded-xl p-6 mb-4"
                style={{ background: '#F5F0E8' }}
              >
                <QRCodeSVG
                  value={capturaUrl}
                  size={200}
                  bgColor="#F5F0E8"
                  fgColor="#1A4A44"
                  level="M"
                  marginSize={1}
                />
              </div>

              {/* URL del link */}
              <div className="flex items-center gap-2 mb-4">
                <p className="flex-1 text-xs text-gray-400 truncate font-mono bg-gray-50 rounded-lg px-3 py-2">
                  {capturaUrl}
                </p>
                <button
                  onClick={copiarLink}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                  style={{ background: copiado ? '#10b981' : '#F5F0E8', color: copiado ? 'white' : '#1A4A44' }}
                >
                  {copiado ? <Check size={13} /> : <Copy size={13} />}
                  {copiado ? 'Copiado' : 'Copiar'}
                </button>
              </div>

              {/* Botón descargar */}
              <button
                onClick={descargarQR}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: '#1A4A44' }}
              >
                <Download size={15} />
                Descargar QR como PNG
              </button>
            </>
          )}
        </div>

        {/* Panel frases */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-base mb-4" style={{ color: '#1A4A44' }}>Cómo pedirles que escaneen</h2>
          <div className="space-y-3">
            {FRASES.map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: '#F5F0E8' }}
              >
                <span className="text-xl flex-shrink-0 mt-0.5">{f.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">"{f.texto}"</p>
                  <p className="text-xs text-gray-400 mt-0.5">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de prospectos capturados */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-base" style={{ color: '#1A4A44' }}>
            Prospectos capturados por QR
            {prospectos.length > 0 && (
              <span className="ml-2 text-xs font-normal text-gray-400">({prospectos.length})</span>
            )}
          </h2>
          <button
            onClick={cargar}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <RefreshCw size={20} className="animate-spin text-gray-300" />
          </div>
        ) : prospectos.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">📱</p>
            <p className="text-sm font-semibold text-gray-600">Aún no hay escaneos</p>
            <p className="text-xs text-gray-400 mt-1">Cuando alguien escanee tu QR aparecerá aquí en segundos.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {prospectos.map(p => (
              <div key={p.id} className="flex items-center gap-4 py-3">
                {/* Semaforo dot */}
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: SEMAFORO_COLOR[p.semaforo] }}
                  title={SEMAFORO_LABEL[p.semaforo]}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.nombre}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {[p.cargo, p.empresa].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-medium" style={{ color: SEMAFORO_COLOR[p.semaforo] }}>
                    {SEMAFORO_LABEL[p.semaforo]}
                  </p>
                  <p className="text-xs text-gray-300 mt-0.5">{formatFecha(p.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
