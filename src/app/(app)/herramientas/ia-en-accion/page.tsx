'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Copy, Check, ChevronUp, X } from 'lucide-react'

const VERDE = '#1A4A44'
const TEAL = '#4ECDC4'
const BEIGE = '#F5F0E8'

// ── helpers ──────────────────────────────────────────────────────────
function Copiable({ texto, label = 'Copiar' }: { texto: string; label?: string }) {
  const [ok, setOk] = useState(false)
  async function copiar() {
    await navigator.clipboard.writeText(texto)
    setOk(true)
    setTimeout(() => setOk(false), 2000)
  }
  return (
    <button
      onClick={copiar}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
      style={{ backgroundColor: ok ? '#10b981' : VERDE, color: 'white' }}
    >
      {ok ? <Check size={12} /> : <Copy size={12} />}
      {ok ? 'Copiado' : label}
    </button>
  )
}

function Bloque({ titulo, color, children }: { titulo: string; color: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4" style={{ background: color, border: `1px solid ${color === 'white' ? '#e5e7eb' : 'transparent'}` }}>
      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: VERDE, opacity: 0.7 }}>{titulo}</p>
      {children}
    </div>
  )
}

// ── tipos ─────────────────────────────────────────────────────────────
type CardId = 'contactar' | 'bant' | 'neuro' | 'calc' | 'reunion' | 'comite' | 'crisis' | 'frios'

interface Prospecto {
  id: string
  nombre: string
  empresa: string | null
  dias_sin_contacto: number
}

// ── card config ───────────────────────────────────────────────────────
const CARDS = [
  { id: 'contactar' as CardId, icon: '🔍', titulo: 'Voy a contactar a alguien', sub: 'Investiga, perfila y escribe el mensaje en 3 minutos.', bg: '#F0F7F6' },
  { id: 'bant'      as CardId, icon: '📋', titulo: '¿Este prospecto vale mi tiempo?', sub: 'Calificación BANT en 2 minutos — sin adivinar.', bg: '#FFF8F0' },
  { id: 'neuro'     as CardId, icon: '🧠', titulo: 'Quiero vender con neurociencia', sub: 'Traduce tu producto al cerebro — no a la razón.', bg: '#F5F0FF' },
  { id: 'calc'      as CardId, icon: '💰', titulo: '¿Cuánto le cuesta NO resolver esto?', sub: 'Un número concreto que el cliente no puede ignorar.', bg: '#F0FFF4' },
  { id: 'reunion'   as CardId, icon: '📞', titulo: 'Tengo reunión en 30 minutos', sub: 'Apertura, preguntas y objeciones — listo en 5 minutos.', bg: '#F0F7F6' },
  { id: 'comite'    as CardId, icon: '📊', titulo: 'Tengo que presentar ante un comité', sub: 'Estructura slide por slide para múltiples decisores.', bg: '#FFF0F0' },
  { id: 'crisis'    as CardId, icon: '🚨', titulo: 'Un cliente está molesto', sub: 'Maneja la crisis sin perder la relación ni la cuenta.', bg: '#FFF8F0' },
  { id: 'frios'     as CardId, icon: '🧊', titulo: 'Tengo leads fríos que reactivar', sub: 'Mensajes que reabren conversaciones — sin sonar a seguimiento genérico.', bg: '#F0F8FF' },
]

// ── page ──────────────────────────────────────────────────────────────
export default function IaEnAccionPage() {
  const router = useRouter()
  const [activa, setActiva] = useState<CardId | null>(null)

  function toggle(id: CardId) {
    if (id === 'reunion') { router.push('/herramientas/llamada'); return }
    setActiva(prev => prev === id ? null : id)
  }

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: VERDE, fontFamily: 'var(--font-jakarta)' }}>🧠 IA en Acción</h1>
        <p className="text-gray-500 text-sm mt-1">Selecciona el momento en que estás ahora mismo.</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CARDS.map(card => (
          <div key={card.id}>
            {/* Tarjeta */}
            <button
              onClick={() => toggle(card.id)}
              className="w-full text-left rounded-2xl p-5 transition-all border"
              style={{
                backgroundColor: activa === card.id ? VERDE : card.bg,
                borderColor: activa === card.id ? VERDE : 'transparent',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-3xl mb-2">{card.icon}</p>
                  <p className="font-bold text-base" style={{ color: activa === card.id ? 'white' : VERDE, fontFamily: 'var(--font-jakarta)' }}>
                    {card.titulo}
                  </p>
                  <p className="text-sm mt-1" style={{ color: activa === card.id ? 'rgba(255,255,255,0.75)' : '#6b7280' }}>
                    {card.sub}
                  </p>
                </div>
                {activa === card.id && <ChevronUp size={18} color="white" className="flex-shrink-0 mt-1" />}
              </div>
            </button>

            {/* Panel expandido */}
            {activa === card.id && (
              <div className="mt-2 rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden">
                <CardPanel id={card.id} onClose={() => setActiva(null)} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── panel dispatcher ──────────────────────────────────────────────────
function CardPanel({ id, onClose }: { id: CardId; onClose: () => void }) {
  switch (id) {
    case 'contactar': return <PanelContactar onClose={onClose} />
    case 'bant':      return <PanelBANT onClose={onClose} />
    case 'neuro':     return <PanelNeuro onClose={onClose} />
    case 'calc':      return <PanelCalc onClose={onClose} />
    case 'comite':    return <PanelComite onClose={onClose} />
    case 'crisis':    return <PanelCrisis onClose={onClose} />
    case 'frios':     return <PanelFrios onClose={onClose} />
    default:          return null
  }
}

// ─────────────────────────────────────────────────────────────────────
// PANEL 1 — CONTACTAR
// ─────────────────────────────────────────────────────────────────────
function PanelContactar({ onClose }: { onClose: () => void }) {
  const [nombre, setNombre] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ perfil_cargo: string; dolores_tipicos: string[]; frases_apertura: string[] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function generar() {
    if (!nombre.trim()) return
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch('/api/herramientas/ia-en-accion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'contactar', nombre, empresa }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setResult(data)
    } catch { setError('Sin conexión.') }
    finally { setLoading(false) }
  }

  return (
    <div className="p-5">
      <PanelHeader titulo="🔍 Investigar prospecto" onClose={onClose} />
      {!result ? (
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Nombre del prospecto *</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Carlos Méndez"
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: '#e5e7eb' }} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Empresa</label>
            <input value={empresa} onChange={e => setEmpresa(e.target.value)} placeholder="Ej: Grupo Comercial ABC"
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: '#e5e7eb' }} />
          </div>
          <BtnGenerar onClick={generar} loading={loading} disabled={!nombre.trim()} />
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Bloque titulo="Perfil del cargo" color="#F0F7F6">
            <p className="text-sm text-gray-700 leading-relaxed">{result.perfil_cargo}</p>
          </Bloque>
          <Bloque titulo="Dolores típicos" color="#FFF8F0">
            <ol className="flex flex-col gap-1.5">
              {result.dolores_tipicos.map((d, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="font-bold" style={{ color: TEAL }}>{i + 1}.</span> {d}
                </li>
              ))}
            </ol>
          </Bloque>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">3 frases de apertura listas</p>
            <div className="flex flex-col gap-2">
              {result.frases_apertura.map((f, i) => (
                <div key={i} className="rounded-xl p-3 flex items-start justify-between gap-3"
                  style={{ background: '#F0F7F6', border: '1px solid #d1fae5' }}>
                  <p className="text-sm text-gray-700 leading-relaxed flex-1">{f}</p>
                  <Copiable texto={f} label="Copiar" />
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => setResult(null)} className="text-xs text-gray-400 hover:text-gray-600 text-center">↺ Nuevo prospecto</button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// PANEL 2 — BANT
// ─────────────────────────────────────────────────────────────────────
const BANT_PREGUNTAS = [
  { key: 'decisor', label: '¿Es el decisor?', opciones: [
    { label: 'Sí, decide solo', pts: 30 },
    { label: 'Influenciador directo', pts: 15 },
    { label: 'No lo sé', pts: 5 },
  ]},
  { key: 'presupuesto', label: '¿Tiene presupuesto?', opciones: [
    { label: 'Confirmado', pts: 30 },
    { label: 'Probable', pts: 15 },
    { label: 'No lo sé', pts: 5 },
  ]},
  { key: 'urgencia', label: '¿Hay urgencia real?', opciones: [
    { label: 'Tiene deadline concreto', pts: 25 },
    { label: 'Lo está evaluando', pts: 12 },
    { label: 'Sin urgencia', pts: 0 },
  ]},
  { key: 'fit', label: '¿Encaja con lo que vendo?', opciones: [
    { label: 'Encaje perfecto', pts: 15 },
    { label: 'Parcial', pts: 8 },
    { label: 'No encaja', pts: 0 },
  ]},
]

function PanelBANT({ onClose }: { onClose: () => void }) {
  const [respuestas, setRespuestas] = useState<Record<string, number>>({})
  const [mostrar, setMostrar] = useState(false)

  const total = Object.values(respuestas).reduce((a, b) => a + b, 0)
  const completo = Object.keys(respuestas).length === 4

  const { color, label, explicacion } = total >= 80
    ? { color: '#16a34a', label: '✅ Vale la pena — avanza', explicacion: 'Este prospecto tiene los ingredientes para cerrar. Invierte tiempo y priorízalo en tu pipeline.' }
    : total >= 50
    ? { color: '#f59e0b', label: '⚠️ Avanza con cautela', explicacion: 'Hay potencial pero hay incertidumbre. Confirma las variables que no sabes antes de invertir más tiempo.' }
    : { color: '#ef4444', label: '🚫 No inviertas más tiempo', explicacion: 'No tiene los criterios mínimos para cerrar ahora. Ponlo en pausa o trabaja en calificarlo mejor primero.' }

  return (
    <div className="p-5">
      <PanelHeader titulo="📋 Calificación BANT" onClose={onClose} />
      <div className="flex flex-col gap-4">
        {BANT_PREGUNTAS.map(p => (
          <div key={p.key}>
            <p className="text-sm font-bold text-gray-700 mb-2">{p.label}</p>
            <div className="flex flex-col gap-1.5">
              {p.opciones.map(op => (
                <button key={op.label} onClick={() => { setRespuestas(r => ({ ...r, [p.key]: op.pts })); setMostrar(false) }}
                  className="text-left px-3 py-2.5 rounded-xl text-sm font-medium border transition-all"
                  style={{
                    backgroundColor: respuestas[p.key] === op.pts ? VERDE : 'white',
                    color: respuestas[p.key] === op.pts ? 'white' : '#374151',
                    borderColor: respuestas[p.key] === op.pts ? VERDE : '#e5e7eb',
                  }}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        {completo && !mostrar && (
          <button onClick={() => setMostrar(true)}
            className="w-full py-3 rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: VERDE }}>
            Ver mi score
          </button>
        )}

        {mostrar && completo && (
          <div className="rounded-2xl p-4 text-center" style={{ background: color + '15', border: `2px solid ${color}` }}>
            <p className="text-4xl font-black mb-1" style={{ color }}>{total}</p>
            <p className="text-sm font-bold mb-2" style={{ color }}>{label}</p>
            <p className="text-sm text-gray-600 leading-relaxed">{explicacion}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// PANEL 3 — NEUROVENTAS
// ─────────────────────────────────────────────────────────────────────
const NEURO_BLOQUES = [
  { key: 'supervivencia', emoji: '🔴', titulo: 'Supervivencia', bg: '#fff1f2', border: '#fca5a5', color: '#dc2626' },
  { key: 'control',       emoji: '🟡', titulo: 'Control',       bg: '#fefce8', border: '#fde047', color: '#ca8a04' },
  { key: 'placer',        emoji: '🟢', titulo: 'Placer',        bg: '#f0fdf4', border: '#86efac', color: '#16a34a' },
  { key: 'pertenencia',   emoji: '🔵', titulo: 'Pertenencia',   bg: '#eff6ff', border: '#93c5fd', color: '#1d4ed8' },
]

function PanelNeuro({ onClose }: { onClose: () => void }) {
  const [producto, setProducto] = useState('')
  const [tipoCliente, setTipoCliente] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Record<string, string> | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function generar() {
    if (!producto.trim()) return
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch('/api/herramientas/ia-en-accion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'neuroventas', producto, tipo_cliente: tipoCliente }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setResult(data)
    } catch { setError('Sin conexión.') }
    finally { setLoading(false) }
  }

  return (
    <div className="p-5">
      <PanelHeader titulo="🧠 Vender con neurociencia" onClose={onClose} />
      {!result ? (
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">¿Qué hace tu producto o servicio? *</label>
            <textarea value={producto} onChange={e => setProducto(e.target.value)} rows={3}
              placeholder="Ej: Un CRM de ventas que ayuda a vendedores B2B a dar seguimiento automático a sus prospectos..."
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none" style={{ borderColor: '#e5e7eb' }} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Tipo de cliente</label>
            <input value={tipoCliente} onChange={e => setTipoCliente(e.target.value)}
              placeholder="Ej: Director Comercial de empresa mediana, 10-50 vendedores"
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: '#e5e7eb' }} />
          </div>
          <BtnGenerar onClick={generar} loading={loading} disabled={!producto.trim()} label="Traducir al cerebro" />
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {NEURO_BLOQUES.map(b => (
            <div key={b.key} className="rounded-xl p-4" style={{ background: b.bg, border: `1px solid ${b.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: b.color }}>{b.emoji} {b.titulo}</p>
                <Copiable texto={result[b.key] ?? ''} />
              </div>
              <p className="text-sm leading-relaxed" style={{ color: b.color }}>{result[b.key]}</p>
            </div>
          ))}
          <button onClick={() => setResult(null)} className="text-xs text-gray-400 hover:text-gray-600 text-center">↺ Nuevo producto</button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// PANEL 4 — CALCULADORA
// ─────────────────────────────────────────────────────────────────────
function PanelCalc({ onClose }: { onClose: () => void }) {
  const [leads, setLeads] = useState('')
  const [valorVenta, setValorVenta] = useState('')
  const [horas, setHoras] = useState('')
  const [valorHora, setValorHora] = useState('')
  const [moneda, setMoneda] = useState('$')
  const [mostrar, setMostrar] = useState(false)

  const l = parseFloat(leads) || 0
  const v = parseFloat(valorVenta) || 0
  const h = parseFloat(horas) || 0
  const vh = parseFloat(valorHora) || 0

  const perdidaLeadsMes = l * 4 * v * 0.1
  const perdidaTiempoMes = h * 4 * vh
  const totalMes = perdidaLeadsMes + perdidaTiempoMes
  const totalAnio = totalMes * 12
  const ahorroCBC = totalAnio * 0.6

  const valido = l > 0 || h > 0

  function fmt(n: number) { return moneda + n.toLocaleString('es-MX', { maximumFractionDigits: 0 }) }

  const textoParaCopiar = `Costo de la inacción:
💸 Leads fríos al mes: ${fmt(perdidaLeadsMes)}
⏰ Tiempo perdido al mes: ${fmt(perdidaTiempoMes)} (${h * 4} horas)
📅 Pérdida total al año: ${fmt(totalAnio)}
✅ Ahorro potencial: ${fmt(ahorroCBC)} al año`

  return (
    <div className="p-5">
      <PanelHeader titulo="💰 Calculadora de inacción" onClose={onClose} />
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Leads que pierde / semana</label>
            <input type="number" value={leads} onChange={e => { setLeads(e.target.value); setMostrar(false) }} placeholder="5"
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: '#e5e7eb' }} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Valor promedio por venta</label>
            <input type="number" value={valorVenta} onChange={e => { setValorVenta(e.target.value); setMostrar(false) }} placeholder="5000"
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: '#e5e7eb' }} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Horas manuales / semana</label>
            <input type="number" value={horas} onChange={e => { setHoras(e.target.value); setMostrar(false) }} placeholder="8"
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: '#e5e7eb' }} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Valor de tu hora</label>
            <input type="number" value={valorHora} onChange={e => { setValorHora(e.target.value); setMostrar(false) }} placeholder="50"
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: '#e5e7eb' }} />
          </div>
        </div>

        <div className="flex gap-2">
          {['$', 'USD', 'MXN', 'COP', 'ARS'].map(m => (
            <button key={m} onClick={() => setMoneda(m)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
              style={{ backgroundColor: moneda === m ? VERDE : 'white', color: moneda === m ? 'white' : '#374151', borderColor: moneda === m ? VERDE : '#e5e7eb' }}>
              {m}
            </button>
          ))}
        </div>

        {!mostrar && (
          <button onClick={() => setMostrar(true)} disabled={!valido}
            className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
            style={{ backgroundColor: VERDE }}>
            Calcular el costo real
          </button>
        )}

        {mostrar && valido && (
          <div className="flex flex-col gap-2">
            {[
              { icon: '💸', label: 'Leads fríos al mes', valor: perdidaLeadsMes, bg: '#fff1f2' },
              { icon: '⏰', label: `Tiempo perdido al mes (${h > 0 ? h * 4 : 0} horas)`, valor: perdidaTiempoMes, bg: '#fefce8' },
              { icon: '📅', label: 'Pérdida total al año', valor: totalAnio, bg: '#fff7ed', bold: true },
              { icon: '✅', label: 'Ahorro potencial con CBC', valor: ahorroCBC, bg: '#f0fdf4', green: true },
            ].map(r => (
              <div key={r.label} className="rounded-xl px-4 py-3 flex items-center justify-between"
                style={{ background: r.bg }}>
                <p className="text-sm" style={{ color: r.green ? '#16a34a' : '#374151', fontWeight: r.bold || r.green ? 700 : 400 }}>
                  {r.icon} {r.label}
                </p>
                <p className="font-black text-base" style={{ color: r.green ? '#16a34a' : VERDE }}>
                  {fmt(r.valor)}
                </p>
              </div>
            ))}
            <Copiable texto={textoParaCopiar} label="Copiar estos números" />
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// PANEL 6 — COMITÉ
// ─────────────────────────────────────────────────────────────────────
function PanelComite({ onClose }: { onClose: () => void }) {
  const [empresa, setEmpresa] = useState('')
  const [problema, setProblema] = useState('')
  const [roles, setRoles] = useState('')
  const [objeciones, setObjeciones] = useState('')
  const [diferenciadores, setDiferenciadores] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    slides: { numero: number; titulo: string; objetivo: string; copy: string; nota_orador: string }[]
    como_cerrar: string
    objeciones_anticipadas: { objecion: string; respuesta: string }[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [slideActivo, setSlideActivo] = useState<number | null>(null)

  async function generar() {
    if (!empresa.trim() || !problema.trim()) return
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch('/api/herramientas/ia-en-accion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'comite', empresa, problema, roles, objeciones, diferenciadores }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setResult(data)
    } catch { setError('Sin conexión.') }
    finally { setLoading(false) }
  }

  return (
    <div className="p-5">
      <PanelHeader titulo="📊 Presentación ante comité" onClose={onClose} />
      {!result ? (
        <div className="flex flex-col gap-3">
          {[
            { label: 'Empresa del cliente *', val: empresa, set: setEmpresa, ph: 'Ej: Grupo Industrial XYZ' },
            { label: 'Problema a resolver *', val: problema, set: setProblema, ph: 'Ej: Su equipo pierde 40% de leads por falta de seguimiento...' },
            { label: 'Quiénes estarán en la sala', val: roles, set: setRoles, ph: 'Ej: Director Comercial, CFO, CEO' },
            { label: 'Objeciones que anticipa', val: objeciones, set: setObjeciones, ph: 'Ej: precio alto, ya tienen CRM, no es prioridad ahora' },
            { label: '3 diferenciadores vs competencia', val: diferenciadores, set: setDiferenciadores, ph: 'Ej: onboarding en 48h, soporte en español 24/7, integración con WhatsApp' },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">{f.label}</label>
              <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: '#e5e7eb' }} />
            </div>
          ))}
          <BtnGenerar onClick={generar} loading={loading} disabled={!empresa.trim() || !problema.trim()} label="Generar estructura" />
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estructura — {result.slides?.length ?? 0} slides</p>
          <div className="flex flex-col gap-2">
            {(result.slides ?? []).map(s => (
              <div key={s.numero} className="rounded-xl border border-gray-100 overflow-hidden">
                <button onClick={() => setSlideActivo(slideActivo === s.numero ? null : s.numero)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                  style={{ background: slideActivo === s.numero ? VERDE : '#fafafa' }}>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                      style={{ background: TEAL, color: VERDE }}>{s.numero}</span>
                    <span className="text-sm font-bold" style={{ color: slideActivo === s.numero ? 'white' : VERDE }}>{s.titulo}</span>
                  </div>
                  {slideActivo === s.numero && <ChevronUp size={14} color="white" />}
                </button>
                {slideActivo === s.numero && (
                  <div className="p-4 flex flex-col gap-3">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">Objetivo</p>
                      <p className="text-sm text-gray-600">{s.objetivo}</p>
                    </div>
                    <div className="rounded-lg p-3" style={{ background: '#F0F7F6' }}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-xs font-bold text-gray-400 uppercase">Copy del slide</p>
                        <Copiable texto={s.copy} />
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{s.copy}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">Nota del orador</p>
                      <p className="text-sm text-gray-500 italic">{s.nota_orador}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {result.como_cerrar && (
            <Bloque titulo="Cómo cerrar ante este comité" color="#F0F7F6">
              <p className="text-sm text-gray-700 leading-relaxed">{result.como_cerrar}</p>
            </Bloque>
          )}
          {(result.objeciones_anticipadas ?? []).length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Objeciones anticipadas</p>
              <div className="flex flex-col gap-2">
                {result.objeciones_anticipadas.map((o, i) => (
                  <div key={i} className="rounded-xl p-3" style={{ background: '#FFF8F0', border: '1px solid #fed7aa' }}>
                    <p className="text-xs font-bold text-orange-700 mb-1">"{o.objecion}"</p>
                    <p className="text-sm text-gray-700">{o.respuesta}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <button onClick={() => setResult(null)} className="text-xs text-gray-400 hover:text-gray-600 text-center">↺ Nueva presentación</button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// PANEL 7 — CRISIS
// ─────────────────────────────────────────────────────────────────────
function PanelCrisis({ onClose }: { onClose: () => void }) {
  const [quePaso, setQuePaso] = useState('')
  const [mensajeCliente, setMensajeCliente] = useState('')
  const [objetivo, setObjetivo] = useState('salvar la relación')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ lo_que_siente: string; no_respondas: string; respuesta_exacta: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function generar() {
    if (!quePaso.trim() || !mensajeCliente.trim()) return
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch('/api/herramientas/ia-en-accion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'crisis', que_paso: quePaso, mensaje_cliente: mensajeCliente, objetivo }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setResult(data)
    } catch { setError('Sin conexión.') }
    finally { setLoading(false) }
  }

  return (
    <div className="p-5">
      <PanelHeader titulo="🚨 Cliente molesto" onClose={onClose} />
      {!result ? (
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">¿Qué pasó exactamente? *</label>
            <textarea value={quePaso} onChange={e => setQuePaso(e.target.value)} rows={2} placeholder="Ej: Entregamos tarde, el cliente esperaba onboarding el lunes y lo hicimos el jueves..."
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none" style={{ borderColor: '#e5e7eb' }} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">¿Qué dijo el cliente? (pega el mensaje exacto) *</label>
            <textarea value={mensajeCliente} onChange={e => setMensajeCliente(e.target.value)} rows={3} placeholder="Pega aquí el mensaje o correo exacto del cliente..."
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none" style={{ borderColor: '#e5e7eb' }} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">¿Qué quieres lograr?</label>
            <div className="flex flex-col gap-1.5">
              {['salvar la relación', 'recuperar la venta', 'cerrar con dignidad'].map(op => (
                <button key={op} onClick={() => setObjetivo(op)}
                  className="text-left px-3 py-2.5 rounded-xl text-sm font-medium border transition-all capitalize"
                  style={{ backgroundColor: objetivo === op ? VERDE : 'white', color: objetivo === op ? 'white' : '#374151', borderColor: objetivo === op ? VERDE : '#e5e7eb' }}>
                  {op.charAt(0).toUpperCase() + op.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <BtnGenerar onClick={generar} loading={loading} disabled={!quePaso.trim() || !mensajeCliente.trim()} label="Generar respuesta" />
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl p-4" style={{ background: '#f5f3ff', border: '1px solid #c4b5fd' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#5b21b6' }}>🧠 Lo que realmente siente</p>
            <p className="text-sm leading-relaxed" style={{ color: '#4c1d95' }}>{result.lo_que_siente}</p>
          </div>
          <div className="rounded-xl p-4" style={{ background: '#fff1f2', border: '1px solid #fca5a5' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#dc2626' }}>🚫 No respondas esto</p>
            <p className="text-sm leading-relaxed text-red-700">{result.no_respondas}</p>
          </div>
          <div className="rounded-xl p-4" style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#16a34a' }}>✅ Tu respuesta exacta</p>
              <Copiable texto={result.respuesta_exacta} />
            </div>
            <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">{result.respuesta_exacta}</p>
          </div>
          <button onClick={() => setResult(null)} className="text-xs text-gray-400 hover:text-gray-600 text-center">↺ Nueva crisis</button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// PANEL 8 — LEADS FRÍOS
// ─────────────────────────────────────────────────────────────────────
function PanelFrios({ onClose }: { onClose: () => void }) {
  const [prospectos, setProspectos] = useState<Prospecto[]>([])
  const [seleccionado, setSeleccionado] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [loadingProspectos, setLoadingProspectos] = useState(true)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/prospectos')
      .then(r => r.json())
      .then((data: Prospecto[]) => {
        const frios = data.filter(p => p.dias_sin_contacto >= 30)
          .sort((a, b) => b.dias_sin_contacto - a.dias_sin_contacto)
        setProspectos(frios)
      })
      .finally(() => setLoadingProspectos(false))
  }, [])

  async function generar() {
    if (!seleccionado) return
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch('/api/herramientas/ia-en-accion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'reactivar', prospecto_id: seleccionado }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setResult(data.mensaje)
    } catch { setError('Sin conexión.') }
    finally { setLoading(false) }
  }

  return (
    <div className="p-5">
      <PanelHeader titulo="🧊 Reactivar leads fríos" onClose={onClose} />
      {loadingProspectos ? (
        <div className="flex items-center justify-center py-6 gap-2 text-sm text-gray-400">
          <Loader2 size={16} className="animate-spin" /> Cargando prospectos...
        </div>
      ) : prospectos.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-gray-500">🎉 No tienes leads fríos.</p>
          <p className="text-xs text-gray-400 mt-1">Todos tus prospectos tienen menos de 30 días sin contacto.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-gray-500">{prospectos.length} prospecto{prospectos.length !== 1 ? 's' : ''} sin contacto en 30+ días</p>
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
            {prospectos.map(p => (
              <button key={p.id} onClick={() => { setSeleccionado(p.id); setResult(null) }}
                className="text-left px-3 py-2.5 rounded-xl border transition-all"
                style={{
                  backgroundColor: seleccionado === p.id ? VERDE : 'white',
                  color: seleccionado === p.id ? 'white' : '#374151',
                  borderColor: seleccionado === p.id ? VERDE : '#e5e7eb',
                }}>
                <span className="text-sm font-semibold">{p.nombre}</span>
                {p.empresa && <span className="text-xs opacity-70 ml-2">{p.empresa}</span>}
                <span className="text-xs ml-2 opacity-60">· {p.dias_sin_contacto} días</span>
              </button>
            ))}
          </div>
          {seleccionado && !result && (
            <BtnGenerar onClick={generar} loading={loading} disabled={false} label="Generar mensaje de reactivación" />
          )}
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          {result && (
            <div className="flex flex-col gap-3">
              <div className="rounded-xl p-4" style={{ background: '#F0F7F6', border: '1px solid #d1fae5' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: VERDE }}>Mensaje de reactivación</p>
                  <Copiable texto={result} />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{result}</p>
              </div>
              <button onClick={() => generar()}
                className="text-xs text-gray-400 hover:text-gray-600 text-center">↺ Otra versión</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── shared components ─────────────────────────────────────────────────
function PanelHeader({ titulo, onClose }: { titulo: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
      <p className="font-bold text-sm" style={{ color: VERDE }}>{titulo}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
    </div>
  )
}

function BtnGenerar({ onClick, loading, disabled, label = 'Generar' }: {
  onClick: () => void; loading: boolean; disabled: boolean; label?: string
}) {
  return (
    <button onClick={onClick} disabled={disabled || loading}
      className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity hover:opacity-90"
      style={{ backgroundColor: VERDE }}>
      {loading ? <><Loader2 size={15} className="animate-spin" /> Generando...</> : label}
    </button>
  )
}
