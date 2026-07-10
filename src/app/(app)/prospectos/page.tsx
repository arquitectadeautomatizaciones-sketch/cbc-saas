'use client'

import { useEffect, useState } from 'react'
import ProspectoCard from '@/components/ProspectoCard'
import type { Prospecto, EstadoProspecto, CanalContacto } from '@/lib/types'
import { Plus, X, Search, Download, Copy, Check, Loader2, RefreshCw, MessageSquare, Send } from 'lucide-react'

const VERDE = '#1A4A44'
const TEAL = '#4ECDC4'

const ESTADO_OPTIONS: EstadoProspecto[] = [
  'prospecto', 'contactado', 'propuesta_enviada', 'en_negociacion',
  'cerrado_ganado', 'cerrado_perdido', 'en_pausa',
]

const CANAL_OPTIONS: CanalContacto[] = [
  'whatsapp', 'email', 'llamada', 'linkedin', 'reunion', 'otro',
]

const ESTADO_LABELS: Record<EstadoProspecto, string> = {
  prospecto: 'Prospecto',
  contactado: 'Contactado',
  propuesta_enviada: 'Propuesta enviada',
  en_negociacion: 'En negociación',
  cerrado_ganado: 'Cerrado ganado',
  cerrado_perdido: 'Cerrado perdido',
  en_pausa: 'En pausa',
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

export default function ProspectosPage() {
  const [prospectos, setProspectos] = useState<Prospecto[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<Prospecto | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [guardando, setGuardando] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState<EstadoProspecto | 'todos'>('todos')

  // Mensaje del Momento
  const [mensajeGenerando, setMensajeGenerando] = useState(false)
  const [mensajeTexto, setMensajeTexto] = useState<string | null>(null)
  const [mensajeTipoLabel, setMensajeTipoLabel] = useState<string | null>(null)
  const [mensajeCopiado, setMensajeCopiado] = useState(false)
  const [mensajeRegistrando, setMensajeRegistrando] = useState(false)
  const [mensajeRegistrado, setMensajeRegistrado] = useState(false)
  const [mensajeError, setMensajeError] = useState<string | null>(null)
  // El cliente respondió
  const [modoRespondio, setModoRespondio] = useState(false)
  const [loQueDijo, setLoQueDijo] = useState('')

  // Detector del tipo de botón sin llamar a Claude
  function detectarBotonLabel(p: Prospecto): string {
    if (p.estado === 'cerrado_ganado') return '🎉 Email de bienvenida'
    if (p.estado === 'cerrado_perdido') return '🤝 Dejar la puerta abierta'
    if (!p.ultimo_contacto) return '✍️ Escribir primer mensaje'
    const dias = p.dias_sin_contacto ?? 0
    if (dias >= 1 && dias <= 3) return '🔄 Seguimiento 1'
    if (dias >= 4 && dias <= 7) return '🔄 Seguimiento 2'
    if (dias >= 8) return '🚪 Último intento o liberación'
    return '✍️ Escribir primer mensaje'
  }

  async function generarMensaje(p: Prospecto | null, opts?: { tipo_forzado?: string; lo_que_dijo?: string }) {
    if (!p) return
    setMensajeGenerando(true)
    setMensajeTexto(null)
    setMensajeError(null)
    setMensajeRegistrado(false)
    try {
      const res = await fetch('/api/herramientas/mensaje-momento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospecto_id: p.id, ...opts }),
      })
      const data = await res.json()
      if (!res.ok) { setMensajeError(data.error ?? 'Error generando el mensaje.'); return }
      setMensajeTexto(data.mensaje)
      setMensajeTipoLabel(data.tipo_label)
    } catch {
      setMensajeError('Sin conexión. Intenta de nuevo.')
    } finally {
      setMensajeGenerando(false)
    }
  }

  async function copiarMensaje() {
    if (!mensajeTexto) return
    await navigator.clipboard.writeText(mensajeTexto)
    setMensajeCopiado(true)
    setTimeout(() => setMensajeCopiado(false), 2500)
  }

  async function registrarEnviado(p: Prospecto | null) {
    if (!p || !mensajeTexto) return
    setMensajeRegistrando(true)
    try {
      await fetch('/api/interacciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospecto_id: p.id,
          fecha: new Date().toISOString(),
          canal: 'otro',
          resultado: mensajeTipoLabel ?? 'Mensaje enviado',
          mensaje_enviado: mensajeTexto,
        }),
      })
      setMensajeRegistrado(true)
    } catch {
      // silent
    } finally {
      setMensajeRegistrando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    const res = await fetch('/api/prospectos')
    if (res.ok) setProspectos(await res.json())
    setLoading(false)
  }

  function resetMensaje() {
    setMensajeTexto(null)
    setMensajeTipoLabel(null)
    setMensajeError(null)
    setMensajeRegistrado(false)
    setMensajeCopiado(false)
    setModoRespondio(false)
    setLoQueDijo('')
  }

  function abrirNuevo() {
    setEditando(null)
    setForm(EMPTY_FORM)
    resetMensaje()
    setShowModal(true)
  }

  function abrirEditar(p: Prospecto) {
    setEditando(p)
    resetMensaje()
    setForm({
      nombre: p.nombre,
      empresa: p.empresa ?? '',
      cargo: p.cargo ?? '',
      email: p.email ?? '',
      telefono: p.telefono ?? '',
      valor_estimado: p.valor_estimado?.toString() ?? '',
      estado: p.estado,
      canal_origen: p.canal_origen ?? '',
      proximo_paso: p.proximo_paso ?? '',
      dolor_principal: p.dolor_principal ?? '',
      notas: p.notas ?? '',
    })
    setShowModal(true)
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setGuardando(true)

    const payload = {
      ...form,
      valor_estimado: form.valor_estimado ? Number(form.valor_estimado) : null,
      canal_origen: form.canal_origen || null,
    }

    const url = editando ? `/api/prospectos/${editando.id}` : '/api/prospectos'
    const method = editando ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      await cargar()
      setShowModal(false)
    }
    setGuardando(false)
  }

  function exportarCSV() {
    const fechaHoy = new Date().toISOString().split('T')[0]
    const headers = [
      'Nombre', 'Empresa', 'Cargo', 'Sector', 'Email', 'Teléfono',
      'Estado', 'Semáforo', 'Días sin contacto', 'Valor estimado',
      'Último contacto', 'Próximo paso', 'Notas',
    ]

    const escapar = (v: string | number | null | undefined) => {
      if (v === null || v === undefined) return ''
      const s = String(v)
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return '"' + s.replace(/"/g, '""') + '"'
      }
      return s
    }

    const filas = filtrados.map((p) => [
      escapar(p.nombre),
      escapar(p.empresa),
      escapar(p.cargo),
      escapar(p.sector),
      escapar(p.email),
      escapar(p.telefono),
      escapar(ESTADO_LABELS[p.estado] ?? p.estado),
      escapar(p.semaforo),
      escapar(p.dias_sin_contacto),
      escapar(p.valor_estimado),
      escapar(p.ultimo_contacto),
      escapar(p.proximo_paso),
      escapar(p.notas),
    ].join(','))

    const csv = [headers.join(','), ...filas].join('\n')
    // BOM UTF-8 para que Excel abra tildes y ñ correctamente
    const bom = '﻿'
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prospectos-CBC-${fechaHoy}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar este prospecto y su historial?')) return
    await fetch(`/api/prospectos/${id}`, { method: 'DELETE' })
    await cargar()
  }

  const filtrados = prospectos.filter((p) => {
    const matchBusqueda =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.empresa ?? '').toLowerCase().includes(busqueda.toLowerCase())
    const matchEstado = filtroEstado === 'todos' || p.estado === filtroEstado
    return matchBusqueda && matchEstado
  })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1A4A44' }}>Prospectos</h1>
          <p className="text-gray-500 text-sm mt-1">{prospectos.length} en total</p>
        </div>
        <div className="flex items-center gap-2">
          {filtrados.length > 0 && (
            <button
              onClick={exportarCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
          )}
          <button
            onClick={abrirNuevo}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#1A4A44' }}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nuevo prospecto</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o empresa..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
          />
        </div>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as EstadoProspecto | 'todos')}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white"
        >
          <option value="todos">Todos los estados</option>
          {ESTADO_OPTIONS.map((e) => (
            <option key={e} value={e}>{ESTADO_LABELS[e]}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Cargando...</div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 mb-4">No hay prospectos aún</p>
          <button
            onClick={abrirNuevo}
            className="px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ backgroundColor: '#4ECDC4' }}
          >
            Agregar tu primer prospecto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map((p) => (
            <div key={p.id} className="relative group">
              <ProspectoCard prospecto={p} onClick={() => abrirEditar(p)} />
              <button
                onClick={() => eliminar(p.id)}
                className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-red-50 text-red-400 items-center justify-center hidden group-hover:flex hover:bg-red-100 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-bold text-lg" style={{ color: '#1A4A44' }}>
                {editando ? 'Editar prospecto' : 'Nuevo prospecto'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={guardar} className="p-6 space-y-4">
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
                    placeholder="+52 55 1234 5678"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={form.estado}
                    onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoProspecto })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white"
                  >
                    {ESTADO_OPTIONS.map((e) => (
                      <option key={e} value={e}>{ESTADO_LABELS[e]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Canal origen</label>
                  <select
                    value={form.canal_origen}
                    onChange={(e) => setForm({ ...form, canal_origen: e.target.value as CanalContacto | '' })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white"
                  >
                    <option value="">Sin especificar</option>
                    {CANAL_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Próximo paso</label>
                  <input
                    value={form.proximo_paso}
                    onChange={(e) => setForm({ ...form, proximo_paso: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
                    placeholder="¿Qué toca hacer?"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dolor principal</label>
                  <input
                    value={form.dolor_principal}
                    onChange={(e) => setForm({ ...form, dolor_principal: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
                    placeholder="En palabras del prospecto..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                  <textarea
                    value={form.notas}
                    onChange={(e) => setForm({ ...form, notas: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none resize-none"
                    placeholder="Notas internas..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
                  style={{ backgroundColor: VERDE }}
                >
                  {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear prospecto'}
                </button>
              </div>
            </form>

            {/* ── Mensaje del Momento ── */}
            {editando && (
              <div className="mx-6 mb-6">
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ border: '1.5px solid #e5e7eb', background: '#fafafa' }}
                >
                  <div
                    className="px-4 py-3 flex items-center gap-2"
                    style={{ background: '#F0F7F6', borderBottom: '1px solid #e5e7eb' }}
                  >
                    <MessageSquare size={15} style={{ color: VERDE }} />
                    <p className="text-sm font-bold" style={{ color: VERDE }}>
                      ✉️ Mensaje sugerido para ahora
                    </p>
                  </div>

                  <div className="p-4">
                    {!mensajeTexto && !mensajeGenerando && (
                      <div className="flex flex-col gap-2">
                        {/* Botón contextual automático */}
                        {!modoRespondio && (
                          <button
                            onClick={() => generarMensaje(editando)}
                            className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                            style={{ backgroundColor: VERDE }}
                          >
                            <Send size={15} />
                            {detectarBotonLabel(editando)}
                          </button>
                        )}

                        {/* El cliente respondió */}
                        {!modoRespondio ? (
                          <button
                            onClick={() => setModoRespondio(true)}
                            className="w-full py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                          >
                            💬 El cliente respondió
                          </button>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <p className="text-xs font-bold text-gray-500">¿Qué dijo exactamente?</p>
                            <input
                              autoFocus
                              value={loQueDijo}
                              onChange={(e) => setLoQueDijo(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && loQueDijo.trim()) {
                                  generarMensaje(editando, { tipo_forzado: 'cliente_respondio', lo_que_dijo: loQueDijo.trim() })
                                }
                              }}
                              placeholder="Ej: dijo que lo revisará / preguntó por el precio / dijo que no es el momento..."
                              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                              style={{ borderColor: TEAL }}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setModoRespondio(false); setLoQueDijo('') }}
                                className="px-3 py-2 rounded-xl text-xs font-medium border border-gray-200 text-gray-500 hover:bg-gray-50"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => loQueDijo.trim() && generarMensaje(editando, { tipo_forzado: 'cliente_respondio', lo_que_dijo: loQueDijo.trim() })}
                                disabled={!loQueDijo.trim()}
                                className="flex-1 py-2 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-1.5 disabled:opacity-50"
                                style={{ backgroundColor: VERDE }}
                              >
                                <Send size={13} />
                                Generar respuesta
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {mensajeGenerando && (
                      <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-500">
                        <Loader2 size={16} className="animate-spin" style={{ color: TEAL }} />
                        Generando mensaje...
                      </div>
                    )}

                    {mensajeError && (
                      <p className="text-sm text-red-500 text-center py-2">{mensajeError}</p>
                    )}

                    {mensajeTexto && (
                      <div className="flex flex-col gap-3">
                        {mensajeTipoLabel && (
                          <p className="text-xs font-bold" style={{ color: TEAL }}>
                            {mensajeTipoLabel}
                          </p>
                        )}
                        <div
                          className="rounded-xl p-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap"
                          style={{ background: 'white', border: '1px solid #e5e7eb' }}
                        >
                          {mensajeTexto}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={copiarMensaje}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white transition-colors"
                            style={{ backgroundColor: mensajeCopiado ? '#10b981' : VERDE }}
                          >
                            {mensajeCopiado ? <Check size={13} /> : <Copy size={13} />}
                            {mensajeCopiado ? 'Copiado' : 'Copiar'}
                          </button>
                          <button
                            onClick={() => {
                              if (mensajeTipoLabel === '💬 Respuesta al cliente' && loQueDijo) {
                                generarMensaje(editando, { tipo_forzado: 'cliente_respondio', lo_que_dijo: loQueDijo })
                              } else {
                                generarMensaje(editando)
                              }
                            }}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            <RefreshCw size={13} />
                            Otra versión
                          </button>
                          <button
                            onClick={() => registrarEnviado(editando)}
                            disabled={mensajeRegistrando || mensajeRegistrado}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-60"
                            style={{
                              backgroundColor: mensajeRegistrado ? '#10b981' : TEAL,
                              color: mensajeRegistrado ? 'white' : VERDE,
                            }}
                          >
                            {mensajeRegistrando
                              ? <Loader2 size={13} className="animate-spin" />
                              : mensajeRegistrado
                              ? <Check size={13} />
                              : <Send size={13} />
                            }
                            {mensajeRegistrado ? 'Registrado' : mensajeRegistrando ? 'Registrando...' : 'Registrar enviado'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
