'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { EstadoProspecto, CanalContacto } from '@/lib/types'

interface Props {
  tieneProspectos: boolean
  tieneConversaciones: boolean
  onChecklistCompleto: () => void
}

interface FormState {
  nombre: string
  empresa: string
  cargo: string
  email: string
  telefono: string
  valor_estimado: string
  estado: EstadoProspecto
  canal_origen: CanalContacto | ''
  proximo_paso: string
  dolor_principal: string
  notas: string
}

const EMPTY_FORM: FormState = {
  nombre: '', empresa: '', cargo: '', email: '', telefono: '',
  valor_estimado: '', estado: 'prospecto', canal_origen: '',
  proximo_paso: '', dolor_principal: '', notas: '',
}

const pasoCompleto = (ok: boolean) => (
  <span className="text-xl flex-shrink-0">{ok ? '✅' : '⭕'}</span>
)

export default function ChecklistActivacion({ tieneProspectos, tieneConversaciones, onChecklistCompleto }: Props) {
  const paso3 = tieneProspectos && tieneConversaciones
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [guardando, setGuardando] = useState(false)
  const router = useRouter()

  async function guardarProspecto(e: React.FormEvent) {
    e.preventDefault()
    setGuardando(true)
    const payload = {
      ...form,
      valor_estimado: form.valor_estimado ? Number(form.valor_estimado) : null,
      canal_origen: form.canal_origen || null,
    }
    const res = await fetch('/api/prospectos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setGuardando(false)
    if (res.ok) {
      setShowModal(false)
      router.refresh()
    }
  }

  function scrollSofia() {
    const el = document.getElementById('sofia-chat')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function marcarCompleto() {
    await fetch('/api/usuarios/checklist-completado', { method: 'POST' })
    onChecklistCompleto()
  }

  if (paso3) {
    marcarCompleto()
    return null
  }

  return (
    <>
      <div
        className="rounded-2xl p-5 mb-8 border-2"
        style={{ backgroundColor: '#F5F0E8', borderColor: '#1A4A44' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🚀</span>
          <h2 className="font-bold text-base" style={{ color: '#1A4A44' }}>
            Activa tu sistema en 3 pasos
          </h2>
        </div>

        <div className="space-y-3">
          {/* Paso 1 */}
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
            {pasoCompleto(tieneProspectos)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Carga tu primer prospecto</p>
              <p className="text-xs text-gray-500 mt-0.5">El semáforo empieza a trabajar al instante</p>
            </div>
            {!tieneProspectos && (
              <button
                onClick={() => setShowModal(true)}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg text-white text-xs font-semibold"
                style={{ backgroundColor: '#1A4A44' }}
              >
                Cargar prospecto
              </button>
            )}
          </div>

          {/* Paso 2 */}
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
            {pasoCompleto(tieneConversaciones)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Habla con Sofía</p>
              <p className="text-xs text-gray-500 mt-0.5">Pregúntale a quién llamar hoy</p>
            </div>
            {!tieneConversaciones && (
              <button
                onClick={scrollSofia}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg text-white text-xs font-semibold"
                style={{ backgroundColor: '#4ECDC4' }}
              >
                Hablar con Sofía
              </button>
            )}
          </div>

          {/* Paso 3 */}
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm opacity-60">
            {pasoCompleto(paso3)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Sistema activado</p>
              <p className="text-xs text-gray-500 mt-0.5">Se completa automáticamente con los pasos anteriores</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal nuevo prospecto */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-bold text-lg" style={{ color: '#1A4A44' }}>Nuevo prospecto</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            <form onSubmit={guardarProspecto} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
                    placeholder="Nombre del prospecto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                  <input
                    value={form.empresa}
                    onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
                    placeholder="Empresa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                  <input
                    value={form.cargo}
                    onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
                    placeholder="Cargo / rol"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
                    placeholder="email@empresa.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
                    placeholder="+57 300 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor estimado ($)</label>
                  <input
                    type="number"
                    value={form.valor_estimado}
                    onChange={(e) => setForm({ ...form, valor_estimado: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
                    placeholder="5000"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
                  style={{ backgroundColor: '#1A4A44' }}
                >
                  {guardando ? 'Guardando...' : 'Crear prospecto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
