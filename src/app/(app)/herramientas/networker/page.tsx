'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const VERDE = '#1A4A44'
const TEAL = '#4ECDC4'
const BEIGE = '#F5F0E8'
const JAKARTA = { fontFamily: 'var(--font-jakarta), system-ui, sans-serif' }
const INTER = { fontFamily: 'var(--font-inter), system-ui, sans-serif' }

const DISC_MENSAJES = {
  D: {
    label: 'D — Dominante',
    color: '#ef4444',
    descripcion: 'Mensaje corto, directo, fecha concreta',
    template: '[NOMBRE], fue un gusto. Resuelvo [DOLOR] para empresas como la tuya — en concreto [RESULTADO]. ¿El martes o jueves tienes 20 minutos?',
  },
  I: {
    label: 'I — Influyente',
    color: '#f59e0b',
    descripcion: 'Menciona el evento, caso de éxito',
    template: 'Hola [NOMBRE], un gusto haberte conocido en [EVENTO]. Lo que me contaste de [DOLOR] me recordó a [CLIENTE SIMILAR] — lo resolvimos en [TIEMPO]. ¿Hablamos?',
  },
  S: {
    label: 'S — Estable',
    color: '#10b981',
    descripcion: 'Cero urgencia, invita a explorar',
    template: 'Hola [NOMBRE], fue un placer conocerte. Si en algún momento quieres explorar cómo podríamos trabajar juntos, aquí estoy. Sin presión.',
  },
  C: {
    label: 'C — Concienzudo',
    color: '#6366f1',
    descripcion: 'Adjunta info, datos, proceso',
    template: 'Hola [NOMBRE], según lo que me comentaste, te comparto [RECURSO ESPECÍFICO] que responde exactamente a [DOLOR]. El proceso sería: [PASO 1], [PASO 2], [PASO 3]. ¿Te parece?',
  },
}

const STORAGE_KEY = 'cbc_networker_v1'

function getInitialState() {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export default function NetworkerPage() {
  const [tab, setTab] = useState<'antes' | 'evento' | 'captura' | 'despues'>('antes')

  // Tab Antes
  const [evento, setEvento] = useState({ tipo: '', organizador: '', sectores: '', temas: '' })
  const [perfil, setPerfil] = useState({ cargo: '', sector: '', dolor: '', urgencia: '' })
  const [pitch, setPitch] = useState({ cliente: '', dolor: '', sinQue: '' })
  const [meta, setMeta] = useState({ leads: '', reuniones: '' })

  // Tab Evento — score
  const [criterios, setCriterios] = useState({ decisor: false, dolor: false, pregunto: false, urgencia: false })

  // Tab Captura
  const [prospecto, setProspecto] = useState({
    nombre: '', empresa: '', canal: 'WhatsApp', dolorPalabras: '', promesa: '', score: '', disc: 'D' as keyof typeof DISC_MENSAJES,
  })
  const [copiado, setCopiado] = useState(false)

  // Persist to localStorage
  useEffect(() => {
    const saved = getInitialState()
    if (saved) {
      if (saved.perfil) setPerfil(saved.perfil)
      if (saved.pitch) setPitch(saved.pitch)
      if (saved.meta) setMeta(saved.meta)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ perfil, pitch, meta }))
    } catch {}
  }, [perfil, pitch, meta])

  const score =
    (criterios.decisor ? 30 : 0) +
    (criterios.dolor ? 25 : 0) +
    (criterios.pregunto ? 25 : 0) +
    (criterios.urgencia ? 20 : 0)

  const semaforoScore = score >= 70 ? { color: '#22c55e', label: 'CALIENTE', sub: 'Contactar en 2 horas' } :
    score >= 40 ? { color: '#f59e0b', label: 'TIBIO', sub: 'Contactar en 24 horas' } :
    { color: '#ef4444', label: 'FRÍO', sub: 'Contactar en 3 días' }

  async function copiarMensaje() {
    const template = DISC_MENSAJES[prospecto.disc].template
    await navigator.clipboard.writeText(template)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const tabs: { id: typeof tab; label: string }[] = [
    { id: 'antes', label: 'Antes' },
    { id: 'evento', label: 'Evento' },
    { id: 'captura', label: 'Captura' },
    { id: 'despues', label: 'Después' },
  ]

  const inputStyle: React.CSSProperties = {
    ...INTER,
    width: '100%',
    border: '1.5px solid #e5e7eb',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 15,
    backgroundColor: 'white',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#1f2937',
  }
  const labelStyle: React.CSSProperties = {
    ...INTER, fontSize: 14, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6,
  }
  const sectionTitle = (t: string) => (
    <p style={{ ...INTER, fontSize: 12, fontWeight: 700, color: VERDE, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>{t}</p>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: BEIGE }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px 60px' }}>

        <Link href="/herramientas" style={{ ...INTER, fontSize: 14, color: VERDE, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          ← Volver a herramientas
        </Link>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ ...JAKARTA, fontSize: 26, fontWeight: 700, color: VERDE, margin: '0 0 6px' }}>⚡ Networker Élite™</h1>
          <p style={{ ...INTER, fontSize: 15, color: '#6b7280', margin: 0 }}>Convierte eventos en pipeline real.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', backgroundColor: 'white', borderRadius: 12, padding: 4, marginBottom: 24, border: '1px solid #f3f4f6' }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                ...INTER,
                flex: 1,
                height: 36,
                borderRadius: 9,
                fontSize: 14,
                fontWeight: tab === t.id ? 700 : 500,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: tab === t.id ? VERDE : 'transparent',
                color: tab === t.id ? 'white' : '#6b7280',
                transition: 'all 200ms',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB ANTES ── */}
        {tab === 'antes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ backgroundColor: 'white', borderRadius: 14, padding: 20 }}>
              {sectionTitle('El evento de hoy')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { key: 'tipo', label: '¿De qué es el evento?' },
                  { key: 'organizador', label: '¿Quién organiza?' },
                  { key: 'sectores', label: '¿Qué empresas o sectores van?' },
                  { key: 'temas', label: '¿Qué temas se tratan?' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <input
                      style={inputStyle}
                      value={evento[key as keyof typeof evento]}
                      onChange={(e) => setEvento({ ...evento, [key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: 14, padding: 20 }}>
              {sectionTitle('Mi perfil de lead ideal (se guarda)')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { key: 'cargo', label: 'Cargo/Rol que toma decisiones' },
                  { key: 'sector', label: 'Sector/industria' },
                  { key: 'dolor', label: 'Dolor que resuelvo' },
                  { key: 'urgencia', label: 'Señal de urgencia' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <input
                      style={inputStyle}
                      value={perfil[key as keyof typeof perfil]}
                      onChange={(e) => setPerfil({ ...perfil, [key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: 14, padding: 20 }}>
              {sectionTitle('Mi pitch de apertura')}
              <p style={{ ...INTER, fontSize: 13, color: '#9ca3af', margin: '0 0 14px' }}>Fórmula: "Ayudo a [___] a resolver [___] — sin [___]"</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { key: 'cliente', label: 'Ayudo a...' },
                  { key: 'dolor', label: 'a resolver...' },
                  { key: 'sinQue', label: 'sin...' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <input style={inputStyle} value={pitch[key as keyof typeof pitch]} onChange={(e) => setPitch({ ...pitch, [key]: e.target.value })} />
                  </div>
                ))}
              </div>
              {pitch.cliente && pitch.dolor && pitch.sinQue && (
                <div style={{ backgroundColor: VERDE, borderRadius: 10, padding: 14, marginTop: 14 }}>
                  <p style={{ ...INTER, fontSize: 15, color: 'white', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>
                    "Ayudo a {pitch.cliente} a resolver {pitch.dolor} — sin {pitch.sinQue}"
                  </p>
                </div>
              )}
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: 14, padding: 20 }}>
              {sectionTitle('Mi meta de hoy')}
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Leads calificados</label>
                  <input type="number" style={inputStyle} value={meta.leads} onChange={(e) => setMeta({ ...meta, leads: e.target.value })} placeholder="8" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Reuniones a agendar</label>
                  <input type="number" style={inputStyle} value={meta.reuniones} onChange={(e) => setMeta({ ...meta, reuniones: e.target.value })} placeholder="3" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB EVENTO ── */}
        {tab === 'evento' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ backgroundColor: 'white', borderRadius: 14, padding: 20 }}>
              {sectionTitle('Score de calificación')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {[
                  { key: 'decisor', label: 'Es decisor o influenciador directo', pts: '+30 pts' },
                  { key: 'dolor', label: 'Mencionó un dolor específico', pts: '+25 pts' },
                  { key: 'pregunto', label: 'Preguntó por soluciones o proveedores', pts: '+25 pts' },
                  { key: 'urgencia', label: 'Tiene urgencia o timeline definido', pts: '+20 pts' },
                ].map(({ key, label, pts }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={criterios[key as keyof typeof criterios]}
                      onChange={(e) => setCriterios({ ...criterios, [key]: e.target.checked })}
                      style={{ width: 18, height: 18, accentColor: VERDE, cursor: 'pointer' }}
                    />
                    <span style={{ ...INTER, fontSize: 15, color: '#1f2937', flex: 1 }}>{label}</span>
                    <span style={{ ...INTER, fontSize: 13, fontWeight: 700, color: TEAL }}>{pts}</span>
                  </label>
                ))}
              </div>

              <div style={{ backgroundColor: semaforoScore.color + '18', border: `2px solid ${semaforoScore.color}`, borderRadius: 12, padding: 20, textAlign: 'center' }}>
                <p style={{ ...JAKARTA, fontSize: 36, fontWeight: 700, color: semaforoScore.color, margin: '0 0 4px' }}>{score} pts</p>
                <p style={{ ...JAKARTA, fontSize: 18, fontWeight: 700, color: semaforoScore.color, margin: '0 0 4px' }}>{semaforoScore.label}</p>
                <p style={{ ...INTER, fontSize: 14, color: '#6b7280', margin: 0 }}>{semaforoScore.sub}</p>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: 14, padding: 20 }}>
              {sectionTitle('Las 4 fases del evento')}
              {[
                {
                  num: 1, titulo: 'Apertura (30 seg)',
                  scripts: ['"¿Qué te trajo hasta aquí hoy?"', '"¿A qué te dedicas y qué es lo más interesante de tu trabajo?"'],
                },
                {
                  num: 2, titulo: 'Diagnóstico (60 seg)',
                  scripts: ['"¿Cuál es el problema que más te está quitando el sueño?"', '"¿Eso ya te está costando tiempo, dinero o los dos?"', '"¿Y si eso sigue igual en 3 meses, qué pasa?"'],
                },
                {
                  num: 3, titulo: 'Puente natural',
                  scripts: ['"¿Te queda mejor el martes o el jueves para hablar 20 minutos?"', '"Te mando algo concreto hoy — ¿por WhatsApp o LinkedIn?"'],
                },
                {
                  num: 4, titulo: 'Cierre elegante (sin fit)',
                  scripts: ['"No creo que seamos el match perfecto ahora — pero me quedo con tu contacto. ¿Conectamos?"'],
                },
              ].map((f) => (
                <div key={f.num} style={{ marginBottom: 16 }}>
                  <p style={{ ...INTER, fontSize: 14, fontWeight: 700, color: VERDE, margin: '0 0 8px' }}>Fase {f.num} — {f.titulo}</p>
                  {f.scripts.map((s, i) => (
                    <div key={i} style={{ backgroundColor: BEIGE, borderLeft: `3px solid ${TEAL}`, borderRadius: 8, padding: 12, marginBottom: 8 }}>
                      <p style={{ ...INTER, fontSize: 14, color: '#374151', margin: 0, fontStyle: 'italic' }}>{s}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB CAPTURA ── */}
        {tab === 'captura' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ backgroundColor: 'white', borderRadius: 14, padding: 20 }}>
              {sectionTitle('Datos del prospecto')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Nombre completo</label>
                  <input style={inputStyle} value={prospecto.nombre} onChange={(e) => setProspecto({ ...prospecto, nombre: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Empresa / Cargo</label>
                  <input style={inputStyle} value={prospecto.empresa} onChange={(e) => setProspecto({ ...prospecto, empresa: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Canal preferido</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['WhatsApp', 'LinkedIn', 'Email'].map((c) => (
                      <button key={c} type="button" onClick={() => setProspecto({ ...prospecto, canal: c })} style={{ ...INTER, flex: 1, height: 40, borderRadius: 10, fontSize: 14, fontWeight: 600, border: '1.5px solid', cursor: 'pointer', backgroundColor: prospecto.canal === c ? VERDE : 'white', color: prospecto.canal === c ? 'white' : '#374151', borderColor: prospecto.canal === c ? VERDE : '#e5e7eb' }}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Dolor que mencionó — EN SUS PALABRAS</label>
                  <textarea style={{ ...inputStyle, height: 80, resize: 'none', padding: '10px 14px' } as React.CSSProperties} value={prospecto.dolorPalabras} onChange={(e) => setProspecto({ ...prospecto, dolorPalabras: e.target.value })} />
                  <p style={{ ...INTER, fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>Este campo es el más importante. Sin esto el mensaje post-evento suena genérico.</p>
                </div>
                <div>
                  <label style={labelStyle}>¿Qué prometiste enviarle?</label>
                  <input style={inputStyle} value={prospecto.promesa} onChange={(e) => setProspecto({ ...prospecto, promesa: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Nivel de interés (score del tab Evento)</label>
                  <input type="number" style={inputStyle} value={prospecto.score} onChange={(e) => setProspecto({ ...prospecto, score: e.target.value })} placeholder="0-100" />
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: 14, padding: 20 }}>
              {sectionTitle('Perfil DISC detectado')}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {(Object.keys(DISC_MENSAJES) as Array<keyof typeof DISC_MENSAJES>).map((d) => (
                  <button key={d} onClick={() => setProspecto({ ...prospecto, disc: d })} style={{ ...INTER, flex: 1, height: 44, borderRadius: 10, fontSize: 15, fontWeight: 700, border: '2px solid', cursor: 'pointer', backgroundColor: prospecto.disc === d ? DISC_MENSAJES[d].color : 'white', color: prospecto.disc === d ? 'white' : '#374151', borderColor: prospecto.disc === d ? DISC_MENSAJES[d].color : '#e5e7eb' }}>
                    {d}
                  </button>
                ))}
              </div>
              <div style={{ backgroundColor: DISC_MENSAJES[prospecto.disc].color + '15', border: `1.5px solid ${DISC_MENSAJES[prospecto.disc].color}`, borderRadius: 12, padding: 16, marginBottom: 14 }}>
                <p style={{ ...INTER, fontSize: 13, fontWeight: 700, color: DISC_MENSAJES[prospecto.disc].color, margin: '0 0 4px' }}>{DISC_MENSAJES[prospecto.disc].label}</p>
                <p style={{ ...INTER, fontSize: 13, color: '#6b7280', margin: '0 0 12px' }}>{DISC_MENSAJES[prospecto.disc].descripcion}</p>
                <p style={{ ...INTER, fontSize: 14, color: '#1f2937', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>{DISC_MENSAJES[prospecto.disc].template}</p>
              </div>
              <button onClick={copiarMensaje} style={{ ...INTER, width: '100%', height: 44, backgroundColor: copiado ? TEAL : VERDE, color: 'white', fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 10, cursor: 'pointer' }}>
                {copiado ? '✓ Copiado' : 'Copiar mensaje'}
              </button>
            </div>
          </div>
        )}

        {/* ── TAB DESPUÉS ── */}
        {tab === 'despues' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ backgroundColor: VERDE, borderRadius: 14, padding: 24, textAlign: 'center' }}>
              <p style={{ ...JAKARTA, fontSize: 18, fontWeight: 700, color: 'white', margin: '0 0 8px' }}>Regla de oro</p>
              <p style={{ ...INTER, fontSize: 16, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.7, fontStyle: 'italic' }}>
                "El lead más caliente no es el que más interés mostró. Es el que primero recibe tu mensaje después."
              </p>
            </div>

            {[
              { num: 1, titulo: 'Capturaste en el evento', desc: 'Ya tienes los datos. El dolor en sus palabras exactas es tu arma.' },
              { num: 2, titulo: 'Primeras 2 horas: carga los calientes primero', desc: 'Entra a CBC y carga primero los 70+ pts. El semáforo empieza a correr desde ya.' },
              { num: 3, titulo: 'Dispara el mensaje DISC personalizado', desc: 'Usa el template del tab Captura. Personaliza con el dolor exacto que mencionó.' },
              { num: 4, titulo: 'El sistema toma el control', desc: 'El semáforo está activo. CBC te dice cuándo hacer el siguiente toque.' },
            ].map((paso) => (
              <div key={paso.num} style={{ backgroundColor: 'white', borderRadius: 14, padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ ...JAKARTA, fontSize: 16, fontWeight: 700, color: 'white' }}>{paso.num}</span>
                </div>
                <div>
                  <p style={{ ...INTER, fontSize: 15, fontWeight: 700, color: VERDE, margin: '0 0 4px' }}>{paso.titulo}</p>
                  <p style={{ ...INTER, fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>{paso.desc}</p>
                </div>
              </div>
            ))}

            <Link href="/prospectos" style={{ ...INTER, display: 'block', textAlign: 'center', backgroundColor: VERDE, color: 'white', textDecoration: 'none', padding: '14px 0', borderRadius: 12, fontSize: 15, fontWeight: 700, marginTop: 8 }}>
              Ir a cargar prospectos →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
