'use client'

import { useState } from 'react'
import { FileText, Copy, Check, Loader2, RefreshCw, MessageCircle } from 'lucide-react'

const VERDE = '#1A4A44'
const TEAL = '#4ECDC4'
const BEIGE = '#F5F0E8'

interface Campos {
  nombre: string
  empresa: string
  problema: string
  resultado: string
  inversion: string
}

type Tab = 'completa' | 'whatsapp'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 10,
  border: '1.5px solid #e5e7eb',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'var(--font-inter)',
  color: '#1f2937',
  backgroundColor: 'white',
  transition: 'border-color 150ms',
}

export default function PropuestaPage() {
  const [campos, setCampos] = useState<Campos>({
    nombre: '', empresa: '', problema: '', resultado: '', inversion: '',
  })
  const [generando, setGenerando] = useState(false)
  const [completa, setCompleta] = useState<string | null>(null)
  const [whatsapp, setWhatsapp] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('completa')
  const [copiado, setCopiado] = useState<Tab | null>(null)

  const valido = campos.nombre.trim() && campos.problema.trim() && campos.resultado.trim() && campos.inversion.trim()

  function set(key: keyof Campos, value: string) {
    setCampos(prev => ({ ...prev, [key]: value }))
  }

  async function generar() {
    if (!valido) return
    setGenerando(true)
    setError(null)
    setCompleta(null)
    setWhatsapp(null)
    try {
      const res = await fetch('/api/herramientas/propuesta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campos),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error generando la propuesta.'); return }
      setCompleta(data.completa)
      setWhatsapp(data.whatsapp)
      setTab('completa')
    } catch {
      setError('Sin conexión. Intenta de nuevo.')
    } finally {
      setGenerando(false)
    }
  }

  async function copiar(cual: Tab) {
    const texto = cual === 'completa' ? completa : whatsapp
    if (!texto) return
    await navigator.clipboard.writeText(texto)
    setCopiado(cual)
    setTimeout(() => setCopiado(null), 2500)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#F0F7F6' }}>
            <FileText size={18} style={{ color: VERDE }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: VERDE, fontFamily: 'var(--font-jakarta)' }}>
            Propuesta Express™
          </h1>
        </div>
        <p className="text-gray-500 text-sm mt-1 ml-12">
          5 campos. 2 minutos. CBC genera una propuesta con neuroventas lista para enviar — y su versión corta para WhatsApp.
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
          Datos de la reunión
        </p>

        <div className="flex flex-col gap-4">
          {/* Nombre + Empresa */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">👤 Nombre del cliente</label>
              <input
                type="text"
                placeholder="Ej: Carlos Mendoza"
                value={campos.nombre}
                onChange={e => set('nombre', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">🏢 Empresa</label>
              <input
                type="text"
                placeholder="Ej: Distribuidora Norte"
                value={campos.empresa}
                onChange={e => set('empresa', e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Problema */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              ⚠️ Problema principal
              <span className="font-normal text-gray-400 ml-1">— lo que mencionó en la reunión</span>
            </label>
            <textarea
              rows={2}
              placeholder="Ej: Sus vendedores no hacen seguimiento y pierde clientes a la competencia."
              value={campos.problema}
              onChange={e => set('problema', e.target.value)}
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>

          {/* Resultado */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              🎯 Resultado que busca
            </label>
            <textarea
              rows={2}
              placeholder="Ej: Aumentar el cierre del equipo de 3 a 8 ventas al mes en 90 días."
              value={campos.resultado}
              onChange={e => set('resultado', e.target.value)}
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>

          {/* Inversión */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">💰 Inversión estimada</label>
            <input
              type="text"
              placeholder="Ej: $2,400 USD / mes o $1,500 USD pago único"
              value={campos.inversion}
              onChange={e => set('inversion', e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Botón */}
        <button
          onClick={generar}
          disabled={!valido || generando}
          className="mt-5 w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold text-white transition-opacity"
          style={{
            backgroundColor: !valido || generando ? '#9ca3af' : VERDE,
            cursor: !valido || generando ? 'not-allowed' : 'pointer',
          }}
        >
          {generando ? (
            <><Loader2 size={16} className="animate-spin" /> Generando propuesta...</>
          ) : (
            <><FileText size={16} /> Generar propuesta</>
          )}
        </button>

        {error && (
          <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
        )}
      </div>

      {/* Output */}
      {(completa || whatsapp) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {([
              { key: 'completa' as Tab, label: 'Propuesta completa', icon: FileText },
              { key: 'whatsapp' as Tab, label: 'Versión WhatsApp', icon: MessageCircle },
            ]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors"
                style={{
                  color: tab === key ? VERDE : '#9ca3af',
                  borderBottom: tab === key ? `2px solid ${VERDE}` : '2px solid transparent',
                  backgroundColor: tab === key ? '#fafafa' : 'white',
                }}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* Contenido del tab activo */}
          <div className="p-5">
            {tab === 'completa' && completa && (
              <>
                <div
                  className="rounded-xl p-4 mb-4 text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ background: BEIGE, color: '#1f2937', fontFamily: 'var(--font-inter)' }}
                >
                  {completa}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => copiar('completa')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-colors"
                    style={{ backgroundColor: copiado === 'completa' ? '#10b981' : VERDE }}
                  >
                    {copiado === 'completa' ? <Check size={14} /> : <Copy size={14} />}
                    {copiado === 'completa' ? 'Copiado' : 'Copiar propuesta'}
                  </button>
                  <button
                    onClick={generar}
                    disabled={generando}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border transition-colors"
                    style={{ borderColor: '#e5e7eb', color: '#6b7280', cursor: generando ? 'not-allowed' : 'pointer' }}
                    title="Regenerar"
                  >
                    <RefreshCw size={14} className={generando ? 'animate-spin' : ''} />
                  </button>
                </div>
              </>
            )}

            {tab === 'whatsapp' && whatsapp && (
              <>
                <div
                  className="rounded-xl p-4 mb-4 text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#1f2937', fontFamily: 'var(--font-inter)' }}
                >
                  {whatsapp}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => copiar('whatsapp')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-colors"
                    style={{ backgroundColor: copiado === 'whatsapp' ? '#10b981' : '#25d366' }}
                  >
                    {copiado === 'whatsapp' ? <Check size={14} /> : <MessageCircle size={14} />}
                    {copiado === 'whatsapp' ? 'Copiado' : 'Copiar para WhatsApp'}
                  </button>
                  <button
                    onClick={generar}
                    disabled={generando}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border transition-colors"
                    style={{ borderColor: '#e5e7eb', color: '#6b7280', cursor: generando ? 'not-allowed' : 'pointer' }}
                    title="Regenerar"
                  >
                    <RefreshCw size={14} className={generando ? 'animate-spin' : ''} />
                  </button>
                </div>
                <p className="text-xs text-gray-400 text-center mt-3">
                  Formateado con negritas de WhatsApp (*texto*)
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {!completa && !whatsapp && !generando && (
        <div className="text-center py-10">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: BEIGE }}
          >
            <FileText size={24} style={{ color: VERDE }} />
          </div>
          <p className="text-sm font-semibold text-gray-600">Llena los 5 campos y genera</p>
          <p className="text-xs text-gray-400 mt-1">
            Obtienes la propuesta completa y su versión para WhatsApp al mismo tiempo
          </p>
        </div>
      )}
    </div>
  )
}
