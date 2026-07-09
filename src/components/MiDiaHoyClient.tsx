'use client'

import { useState } from 'react'
import { Phone, X, Copy, Check, ChevronRight } from 'lucide-react'

const VERDE = '#1A4A44'
const CANAL_OPTIONS = [
  { value: 'llamada', label: 'Llamada' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'reunion', label: 'Reunión' },
]

const TIPO_LABEL: Record<string, string> = {
  dia_1: 'Seguimiento día 1',
  dia_3: 'Seguimiento día 3',
  dia_7: 'Seguimiento día 7',
}

interface ProspectoRojo {
  id: string
  nombre: string
  empresa: string | null
  dias_sin_contacto: number
  telefono: string | null
}

interface SeguimientoHoy {
  id: string
  tipo: string
  mensaje_generado: string
  prospecto_id: string
  prospecto_nombre: string
  prospecto_empresa: string | null
}

interface ProspectoAmarillo {
  id: string
  nombre: string
  empresa: string | null
}

interface Props {
  rojos: ProspectoRojo[]
  seguimientos: SeguimientoHoy[]
  amarillos: ProspectoAmarillo[]
}

interface ModalState {
  prospecto_id: string
  nombre: string
  empresa: string | null
  telefono: string | null
}

export default function MiDiaHoyClient({ rojos, seguimientos, amarillos }: Props) {
  const [modal, setModal] = useState<ModalState | null>(null)
  const [canal, setCanal] = useState('llamada')
  const [resultado, setResultado] = useState('')
  const [proximoPaso, setProximoPaso] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [copiado, setCopiado] = useState<string | null>(null)

  const vacio = rojos.length === 0 && seguimientos.length === 0 && amarillos.length === 0

  function abrirModal(p: ProspectoRojo) {
    setModal({ prospecto_id: p.id, nombre: p.nombre, empresa: p.empresa, telefono: p.telefono })
    setCanal('llamada')
    setResultado('')
    setProximoPaso('')
  }

  function cerrarModal() {
    setModal(null)
  }

  async function registrarInteraccion(e: React.FormEvent) {
    e.preventDefault()
    if (!modal) return
    setGuardando(true)
    try {
      await fetch('/api/interacciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospecto_id: modal.prospecto_id,
          canal,
          resultado: resultado || null,
          proximo_paso: proximoPaso || null,
          fecha: new Date().toISOString().split('T')[0],
        }),
      })
      cerrarModal()
    } finally {
      setGuardando(false)
    }
  }

  function copiarMensaje(id: string, texto: string) {
    navigator.clipboard.writeText(texto)
    setCopiado(id)
    setTimeout(() => setCopiado(null), 2000)
  }

  if (vacio) {
    return (
      <div
        className="rounded-2xl border border-gray-100 bg-white px-6 py-5 mb-6 flex items-center gap-3 shadow-sm"
      >
        <span className="text-2xl">✅</span>
        <div>
          <p className="font-semibold text-gray-800 text-sm">Todo al día</p>
          <p className="text-gray-400 text-xs mt-0.5">Sin pendientes para hoy. ¡Buen trabajo!</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm mb-6 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-bold text-base" style={{ color: VERDE }}>
            Mi Día Hoy
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Exactamente qué hacer ahora</p>
        </div>

        {/* LLAMA HOY */}
        {rojos.length > 0 && (
          <div className="px-5 pt-4 pb-3">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              <p className="text-xs font-bold text-red-500 uppercase tracking-wider">Llama hoy</p>
            </div>
            <div className="flex flex-col gap-2">
              {rojos.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ background: '#fff5f5' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{p.nombre}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {p.empresa ?? '—'} · <span className="text-red-400 font-medium">{p.dias_sin_contacto} días sin contacto</span>
                    </p>
                  </div>
                  <button
                    onClick={() => abrirModal(p)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white flex-shrink-0"
                    style={{ background: '#ef4444' }}
                  >
                    <Phone size={11} />
                    Llamar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HAZ SEGUIMIENTO */}
        {seguimientos.length > 0 && (
          <div className="px-5 pt-3 pb-3 border-t border-gray-50">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
              <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Haz seguimiento</p>
            </div>
            <div className="flex flex-col gap-3">
              {seguimientos.map((s) => (
                <div key={s.id} className="rounded-xl border border-amber-100 px-4 py-3" style={{ background: '#fffbeb' }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{s.prospecto_nombre}</p>
                      <p className="text-xs text-amber-600">{TIPO_LABEL[s.tipo] ?? s.tipo}</p>
                    </div>
                    <button
                      onClick={() => copiarMensaje(s.id, s.mensaje_generado)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition-colors"
                      style={{
                        background: copiado === s.id ? '#10b981' : '#f59e0b',
                        color: 'white',
                      }}
                    >
                      {copiado === s.id ? <Check size={11} /> : <Copy size={11} />}
                      {copiado === s.id ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 italic">
                    "{s.mensaje_generado}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ESTA SEMANA */}
        {amarillos.length > 0 && (
          <div className="px-5 pt-3 pb-4 border-t border-gray-50">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
              <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider">Esta semana</p>
            </div>
            <div className="flex flex-col gap-1.5">
              {amarillos.map((p) => (
                <div key={p.id} className="flex items-center gap-2 py-1">
                  <ChevronRight size={13} className="text-gray-300 flex-shrink-0" />
                  <p className="text-sm text-gray-700 truncate">
                    <span className="font-medium">{p.nombre}</span>
                    {p.empresa && <span className="text-gray-400"> · {p.empresa}</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal registrar interacción */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget) cerrarModal() }}
        >
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="font-bold text-gray-900">{modal.nombre}</p>
                {modal.empresa && <p className="text-xs text-gray-400">{modal.empresa}</p>}
              </div>
              <button onClick={cerrarModal} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={registrarInteraccion} className="px-5 py-4 flex flex-col gap-4">
              {/* Canal */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Canal</label>
                <div className="grid grid-cols-4 gap-2">
                  {CANAL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setCanal(opt.value)}
                      className="py-2 rounded-xl text-xs font-semibold border transition-colors"
                      style={{
                        background: canal === opt.value ? VERDE : 'white',
                        color: canal === opt.value ? 'white' : '#374151',
                        borderColor: canal === opt.value ? VERDE : '#e5e7eb',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Teléfono shortcut */}
              {modal.telefono && (
                <a
                  href={`tel:${modal.telefono}`}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: '#ef4444' }}
                >
                  <Phone size={14} />
                  Llamar ahora · {modal.telefono}
                </a>
              )}

              {/* Resultado */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">¿Cómo resultó?</label>
                <textarea
                  value={resultado}
                  onChange={(e) => setResultado(e.target.value)}
                  placeholder="Respondió, dejó mensaje, no contestó..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none outline-none focus:border-gray-400"
                />
              </div>

              {/* Próximo paso */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Próximo paso</label>
                <input
                  type="text"
                  value={proximoPaso}
                  onChange={(e) => setProximoPaso(e.target.value)}
                  placeholder="Llamar el martes, enviar propuesta..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={guardando}
                className="w-full py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: guardando ? '#9ca3af' : VERDE }}
              >
                {guardando ? 'Guardando...' : 'Registrar interacción'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
