'use client'

import { useEffect, useState, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import type { Prospecto, EstadoProspecto } from '@/lib/types'
import Semaforo from '@/components/Semaforo'

const COLUMNAS: { estado: EstadoProspecto; label: string; color: string; emoji: string }[] = [
  { estado: 'prospecto',       label: 'Prospectos',  color: '#6366f1', emoji: '📋' },
  { estado: 'contactado',      label: 'Contactados', color: '#3b82f6', emoji: '📞' },
  { estado: 'propuesta_enviada', label: 'Propuesta', color: '#f59e0b', emoji: '📄' },
  { estado: 'en_negociacion',  label: 'Negociación', color: '#8b5cf6', emoji: '🤝' },
  { estado: 'cerrado_ganado',  label: 'Ganados ✓',  color: '#10b981', emoji: '🏆' },
]

interface ModalConfirm {
  prospecto: Prospecto
  estadoDestino: EstadoProspecto
}

interface MenuMobile {
  prospecto: Prospecto
}

export default function PipelinePage() {
  const [prospectos, setProspectos] = useState<Prospecto[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<ModalConfirm | null>(null)
  const [menuMobile, setMenuMobile] = useState<MenuMobile | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch(window.matchMedia('(hover: none)').matches)
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

  const actualizarEstado = useCallback(async (
    prospectoId: string,
    estadoNuevo: EstadoProspecto,
    estadoAnterior: EstadoProspecto
  ) => {
    setProspectos((prev) =>
      prev.map((p) => p.id === prospectoId ? { ...p, estado: estadoNuevo } : p)
    )
    try {
      const res = await fetch(`/api/prospectos/${prospectoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: estadoNuevo }),
      })
      if (!res.ok) throw new Error('Error al guardar')
    } catch {
      setProspectos((prev) =>
        prev.map((p) => p.id === prospectoId ? { ...p, estado: estadoAnterior } : p)
      )
    }
  }, [])

  const moverProspecto = useCallback((prospecto: Prospecto, estadoNuevo: EstadoProspecto) => {
    if (estadoNuevo === prospecto.estado) return
    if (estadoNuevo === 'cerrado_ganado') {
      setModal({ prospecto, estadoDestino: estadoNuevo })
      return
    }
    actualizarEstado(prospecto.id, estadoNuevo, prospecto.estado)
  }, [actualizarEstado])

  const onDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId) return
    const estadoNuevo = destination.droppableId as EstadoProspecto
    const prospecto = prospectos.find((p) => p.id === draggableId)
    if (!prospecto) return
    moverProspecto(prospecto, estadoNuevo)
  }, [prospectos, moverProspecto])

  const confirmarCierre = async () => {
    if (!modal) return
    setGuardando(true)
    await actualizarEstado(modal.prospecto.id, modal.estadoDestino, modal.prospecto.estado)
    setGuardando(false)
    setModal(null)
    setMenuMobile(null)
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Cargando pipeline...</div>

  return (
    <>
      <div className="max-w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#1A4A44' }}>Pipeline</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isTouch ? 'Toca una tarjeta para moverla de columna' : 'Arrastra las tarjetas para actualizar el estado'}
          </p>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
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

                  <Droppable droppableId={estado}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="space-y-2 min-h-[80px] rounded-xl transition-colors"
                        style={{
                          backgroundColor: snapshot.isDraggingOver ? `${color}14` : 'transparent',
                          padding: snapshot.isDraggingOver ? '8px' : '0',
                        }}
                      >
                        {items.map((p, index) => (
                          <Draggable key={p.id} draggableId={p.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm select-none"
                                style={{
                                  ...provided.draggableProps.style,
                                  boxShadow: snapshot.isDragging
                                    ? '0 8px 24px rgba(0,0,0,0.12)'
                                    : '0 1px 3px rgba(0,0,0,0.06)',
                                  opacity: snapshot.isDragging ? 0.95 : 1,
                                  cursor: snapshot.isDragging ? 'grabbing' : (isTouch ? 'pointer' : 'grab'),
                                }}
                                onClick={() => {
                                  if (isTouch) setMenuMobile({ prospecto: p })
                                }}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <p className="font-medium text-sm text-gray-900 truncate">{p.nombre}</p>
                                  {isTouch && (
                                    <span className="text-gray-300 text-xs flex-shrink-0 mt-0.5">Mover →</span>
                                  )}
                                </div>
                                {p.empresa && (
                                  <p className="text-xs text-gray-500 mt-0.5 truncate">{p.empresa}</p>
                                )}
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
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {items.length === 0 && !snapshot.isDraggingOver && (
                          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-xs text-gray-400">
                            Sin prospectos
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Menú mobile — bottom sheet para mover tarjeta */}
      {menuMobile && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={() => setMenuMobile(null)}
        >
          <div
            className="w-full bg-white rounded-t-2xl p-5 pb-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Mover a</p>
            <p className="font-bold text-gray-900 mb-4 truncate">{menuMobile.prospecto.nombre}</p>
            <div className="space-y-2">
              {COLUMNAS.filter((c) => c.estado !== menuMobile.prospecto.estado).map(({ estado, label, color, emoji }) => (
                <button
                  key={estado}
                  onClick={() => {
                    moverProspecto(menuMobile.prospecto, estado)
                    if (estado !== 'cerrado_ganado') setMenuMobile(null)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-opacity active:opacity-70"
                  style={{ backgroundColor: `${color}12`, border: `1px solid ${color}30` }}
                >
                  <span className="text-lg">{emoji}</span>
                  <span className="font-medium text-sm text-gray-800">{label}</span>
                  <span className="ml-auto text-gray-400 text-sm">→</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setMenuMobile(null)}
              className="w-full mt-3 py-3 rounded-xl text-sm text-gray-500 border border-gray-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal confirmación cerrado ganado */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={() => !guardando && setModal(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-3xl mb-4 text-center">🏆</div>
            <h2 className="text-lg font-bold text-center" style={{ color: '#1A4A44' }}>
              ¿Confirmás que cerraste esta venta?
            </h2>
            <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: '#F5F0E8' }}>
              <p className="font-semibold text-gray-900">{modal.prospecto.nombre}</p>
              {modal.prospecto.empresa && (
                <p className="text-sm text-gray-500">{modal.prospecto.empresa}</p>
              )}
              {modal.prospecto.valor_estimado && (
                <p className="text-lg font-bold mt-2" style={{ color: '#10b981' }}>
                  ${modal.prospecto.valor_estimado.toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setModal(null)}
                disabled={guardando}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarCierre}
                disabled={guardando}
                className="flex-1 py-3 rounded-xl text-white text-sm font-bold disabled:opacity-40"
                style={{ backgroundColor: '#10b981' }}
              >
                {guardando ? 'Guardando...' : 'Sí, cerré la venta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
