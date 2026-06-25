'use client'

import { useEffect, useState } from 'react'
import type { Victoria, TipoVictoria } from '@/lib/types'
import { Trophy, Plus, X } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const TIPO_LABELS: Record<TipoVictoria, string> = {
  venta_cerrada: '💰 Venta cerrada',
  reunion_lograda: '📅 Reunión lograda',
  propuesta_enviada: '📄 Propuesta enviada',
  cliente_reactivado: '♻️ Cliente reactivado',
  objecion_superada: '🥊 Objeción superada',
}

const TIPO_OPTIONS: TipoVictoria[] = [
  'venta_cerrada', 'reunion_lograda', 'propuesta_enviada', 'cliente_reactivado', 'objecion_superada',
]

export default function VictoriasPage() {
  const [victorias, setVictorias] = useState<Victoria[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ tipo: 'venta_cerrada' as TipoVictoria, descripcion: '', valor: '' })
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    fetch('/api/victorias')
      .then((r) => r.json())
      .then((d) => { setVictorias(d); setLoading(false) })
  }, [])

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setGuardando(true)
    const res = await fetch('/api/victorias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, valor: form.valor ? Number(form.valor) : null }),
    })
    if (res.ok) {
      const nueva = await res.json()
      setVictorias((prev) => [nueva, ...prev])
      setShowModal(false)
      setForm({ tipo: 'venta_cerrada', descripcion: '', valor: '' })
    }
    setGuardando(false)
  }

  const totalValor = victorias.reduce((sum, v) => sum + (v.valor ?? 0), 0)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1A4A44' }}>Victorias</h1>
          <p className="text-gray-500 text-sm mt-1">
            {victorias.length} victorias · ${totalValor.toLocaleString()} generados
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ backgroundColor: '#1A4A44' }}
        >
          <Plus size={16} /> Registrar victoria
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Cargando...</div>
      ) : victorias.length === 0 ? (
        <div className="text-center py-20">
          <Trophy size={48} className="mx-auto mb-4 text-gray-200" />
          <p className="text-gray-400">Tu primera victoria está por llegar 💪</p>
        </div>
      ) : (
        <div className="space-y-3">
          {victorias.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start justify-between gap-4 shadow-sm">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-800">{TIPO_LABELS[v.tipo]}</span>
                </div>
                {v.descripcion && (
                  <p className="text-sm text-gray-500 truncate">{v.descripcion}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {format(new Date(v.fecha), "d 'de' MMMM, yyyy", { locale: es })}
                </p>
              </div>
              {v.valor && (
                <div className="flex-shrink-0 text-right">
                  <span
                    className="text-base font-bold"
                    style={{ color: '#1A4A44' }}
                  >
                    ${v.valor.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-bold text-lg" style={{ color: '#1A4A44' }}>Registrar victoria</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400"><X size={20} /></button>
            </div>
            <form onSubmit={guardar} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoVictoria })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white"
                >
                  {TIPO_OPTIONS.map((t) => (
                    <option key={t} value={t}>{TIPO_LABELS[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
                  placeholder="¿Qué lograste?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor ($)</label>
                <input
                  type="number"
                  value={form.valor}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
                  placeholder="Valor económico si aplica"
                />
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
                  {guardando ? 'Guardando...' : '¡Registrar!'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
