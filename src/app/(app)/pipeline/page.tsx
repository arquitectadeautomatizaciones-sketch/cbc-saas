'use client'

import { useEffect, useState } from 'react'
import type { Prospecto, EstadoProspecto } from '@/lib/types'
import Semaforo from '@/components/Semaforo'

const COLUMNAS: { estado: EstadoProspecto; label: string; color: string }[] = [
  { estado: 'prospecto', label: 'Prospectos', color: '#6366f1' },
  { estado: 'contactado', label: 'Contactados', color: '#3b82f6' },
  { estado: 'propuesta_enviada', label: 'Propuesta', color: '#f59e0b' },
  { estado: 'en_negociacion', label: 'Negociación', color: '#8b5cf6' },
  { estado: 'cerrado_ganado', label: 'Ganados ✓', color: '#10b981' },
]

export default function PipelinePage() {
  const [prospectos, setProspectos] = useState<Prospecto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/prospectos')
      .then((r) => r.json())
      .then((data) => { setProspectos(data); setLoading(false) })
  }, [])

  const porEstado = (estado: EstadoProspecto) =>
    prospectos.filter((p) => p.estado === estado)

  const valorTotal = (estado: EstadoProspecto) =>
    prospectos
      .filter((p) => p.estado === estado)
      .reduce((sum, p) => sum + (p.valor_estimado ?? 0), 0)

  if (loading) return <div className="text-center py-20 text-gray-400">Cargando pipeline...</div>

  return (
    <div className="max-w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#1A4A44' }}>Pipeline</h1>
        <p className="text-gray-500 text-sm mt-1">Vista kanban de tu embudo de ventas</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNAS.map(({ estado, label, color }) => {
          const items = porEstado(estado)
          const valor = valorTotal(estado)
          return (
            <div key={estado} className="flex-shrink-0 w-72">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="font-semibold text-sm text-gray-700">{label}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {items.length}
                  </span>
                </div>
                {valor > 0 && (
                  <span className="text-xs text-gray-500">${valor.toLocaleString()}</span>
                )}
              </div>

              <div className="space-y-2">
                {items.map((p) => (
                  <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <p className="font-medium text-sm text-gray-900 truncate">{p.nombre}</p>
                    {p.empresa && <p className="text-xs text-gray-500 mt-0.5 truncate">{p.empresa}</p>}
                    <div className="flex items-center justify-between mt-3">
                      <Semaforo color={p.semaforo} dias={p.dias_sin_contacto} size="sm" />
                      {p.valor_estimado && (
                        <span className="text-xs font-medium text-gray-500">
                          ${p.valor_estimado.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {p.proximo_paso && (
                      <p className="text-xs text-gray-400 mt-2 truncate">→ {p.proximo_paso}</p>
                    )}
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-xs text-gray-400">
                    Sin prospectos
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
