'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const VERDE = '#1A4A44'
const TEAL = '#4ECDC4'
const BEIGE = '#F5F0E8'
const JAKARTA = { fontFamily: 'var(--font-jakarta), system-ui, sans-serif' }
const INTER = { fontFamily: 'var(--font-inter), system-ui, sans-serif' }

const STORAGE_KEY = 'cbc_copiloto_v1'

type Pantalla = 'config' | 'fases'
type Semaforo = 'verde' | 'amarillo' | 'rojo' | null

interface Config {
  tipoReunion: string
  conoceProducto: string
  urgencia: string
  personas: string
}

const OBJECIONES_SOS = [
  {
    id: 'caro',
    titulo: '"Está muy caro" / "Tengo mejores propuestas"',
    respuesta: '¿Caro comparado con qué? — Pausa. Espera.\n\n"Si el problema te cuesta X/mes, ¿cuánto vale resolverlo en 60 días?" No bajes el precio.',
  },
  {
    id: 'momento',
    titulo: '"No es el momento" / "Lo pienso"',
    respuesta: '"¿Y si esto sigue igual en 3 meses, qué pasa en tu operación?"',
  },
  {
    id: 'jefe',
    titulo: '"Tengo que consultarlo con mi socio/jefe"',
    respuesta: '"¿Qué información necesita para decidir? Yo le preparo algo específico para él."',
  },
  {
    id: 'vueltas',
    titulo: '"La discusión da vueltas"',
    respuesta: '"¿Qué necesitaría pasar para que esto tuviera sentido para ti?"',
  },
  {
    id: 'silencio',
    titulo: '"No responde / evade"',
    respuesta: 'Silencio 5 segundos. Luego: "¿Qué está pasando por tu cabeza ahora?"',
  },
  {
    id: 'competencia',
    titulo: '"La competencia ofrece lo mismo por menos"',
    respuesta: '"¿Qué te ofrece que yo no te esté dando?" Solo responde a ESE punto específico.',
  },
  {
    id: 'presupuesto',
    titulo: '"No tenemos presupuesto"',
    respuesta: '"Si el presupuesto no fuera un factor, ¿esto resolvería tu problema?"',
  },
  {
    id: 'monton',
    titulo: '"Me lanza 5 objeciones de golpe"',
    respuesta: '"De todo lo que dijiste, ¿cuál es la que más te preocupa ahora?"',
  },
]

const FASES_CONFIG = [
  { num: 1, titulo: 'Preparación mental', sub: 'Antes de sentarte' },
  { num: 2, titulo: 'Argumentación', sub: 'Los primeros minutos' },
  { num: 3, titulo: 'Señales', sub: 'Lo que dice y lo que hace' },
  { num: 4, titulo: 'Propuesta', sub: 'Propón tú primero. Siempre.' },
  { num: 5, titulo: 'Reformulación', sub: 'Ajusta sin ceder sin información' },
  { num: 6, titulo: 'Intercambio', sub: 'Si tú… entonces yo' },
  { num: 7, titulo: 'Cierre', sub: 'Ya acordaron. Cierra ahora.' },
  { num: 8, titulo: 'Acuerdo', sub: 'Saliste. Ahora actúa.' },
]

export default function CopilotoPage() {
  const [pantalla, setPantalla] = useState<Pantalla>('config')
  const [fase, setFase] = useState(1)
  const [semaforo, setSemaforo] = useState<Semaforo>(null)
  const [sosAbierto, setSosAbierto] = useState(false)
  const [objecionSeleccionada, setObjecionSeleccionada] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [config, setConfig] = useState<Config>({
    tipoReunion: '',
    conoceProducto: '',
    urgencia: '',
    personas: '',
  })

  // Persist state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const d = JSON.parse(saved)
        if (d.pantalla === 'fases') {
          setPantalla('fases')
          setFase(d.fase ?? 1)
          setConfig(d.config ?? config)
        }
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ pantalla, fase, config }))
    } catch {}
  }, [pantalla, fase, config])

  function iniciar() {
    if (!config.tipoReunion || !config.conoceProducto || !config.urgencia || !config.personas) return
    setPantalla('fases')
    setFase(1)
  }

  function resetear() {
    setPantalla('config')
    setFase(1)
    setSemaforo(null)
    setSosAbierto(false)
    setObjecionSeleccionada(null)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }

  const selectStyle = (value: string, optionValue: string): React.CSSProperties => ({
    ...INTER,
    flex: 1,
    padding: '10px 14px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    border: '1.5px solid',
    cursor: 'pointer',
    textAlign: 'left',
    backgroundColor: value === optionValue ? VERDE : 'white',
    color: value === optionValue ? 'white' : '#374151',
    borderColor: value === optionValue ? VERDE : '#e5e7eb',
    transition: 'all 150ms',
  })

  const btnPrimario: React.CSSProperties = {
    ...INTER,
    width: '100%',
    height: 52,
    backgroundColor: VERDE,
    color: 'white',
    fontSize: 16,
    fontWeight: 700,
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
  }

  const alerta = (color: string, texto: string) => (
    <div style={{ backgroundColor: color + '18', border: `1.5px solid ${color}`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
      <p style={{ ...INTER, fontSize: 15, color, margin: 0, fontWeight: 700, lineHeight: 1.5 }}>{texto}</p>
    </div>
  )

  const recuadro = (children: React.ReactNode, bg = VERDE) => (
    <div style={{ backgroundColor: bg, borderRadius: 12, padding: 20, marginBottom: 16 }}>
      {children}
    </div>
  )

  // ─── CONFIGURACIÓN ──────────────────────────────────────────────
  if (pantalla === 'config') {
    const configValid = config.tipoReunion && config.conoceProducto && config.urgencia && config.personas

    const grupos: { label: string; key: keyof Config; opciones: string[] }[] = [
      {
        label: 'Tipo de reunión',
        key: 'tipoReunion',
        opciones: ['Primera vez', 'Seguimiento', 'Renegociación', 'Ya habló con competencia', 'Después de demo'],
      },
      {
        label: 'El cliente conoce tu producto',
        key: 'conoceProducto',
        opciones: ['No — viene en frío', 'Sí — le enviaste info', 'Sí — ya tuvo demo'],
      },
      {
        label: 'Urgencia detectada',
        key: 'urgencia',
        opciones: ['No se sabe', 'Sí tiene deadline', 'No — solo explorando'],
      },
      {
        label: 'Personas del cliente',
        key: 'personas',
        opciones: ['1 solo', '2 personas', '3 o más — comité'],
      },
    ]

    return (
      <div style={{ minHeight: '100vh', backgroundColor: BEIGE }}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px 60px' }}>
          <Link href="/herramientas" style={{ ...INTER, fontSize: 14, color: VERDE, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
            ← Volver a herramientas
          </Link>

          <h1 style={{ ...JAKARTA, fontSize: 26, fontWeight: 700, color: VERDE, margin: '0 0 6px' }}>🤝 Copiloto de Reunión™</h1>
          <p style={{ ...INTER, fontSize: 15, color: '#6b7280', margin: '0 0 28px' }}>Configura en 30 segundos. Luego entramos fase a fase.</p>

          <div style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 22 }}>
            {grupos.map(({ label, key, opciones }) => (
              <div key={key}>
                <p style={{ ...INTER, fontSize: 14, fontWeight: 700, color: '#374151', margin: '0 0 10px' }}>{label}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {opciones.map((op) => (
                    <button key={op} onClick={() => setConfig({ ...config, [key]: op })} style={selectStyle(config[key], op)}>
                      {op}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <button onClick={iniciar} disabled={!configValid} style={{ ...btnPrimario, opacity: configValid ? 1 : 0.45, cursor: configValid ? 'pointer' : 'not-allowed' }}>
              Entrar a la reunión
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── FASES ──────────────────────────────────────────────────────
  const objecionActiva = OBJECIONES_SOS.find((o) => o.id === objecionSeleccionada)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: BEIGE, paddingBottom: 80 }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px 0' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <Link href="/herramientas" style={{ ...INTER, fontSize: 14, color: VERDE, textDecoration: 'none' }}>← Herramientas</Link>
          <button onClick={resetear} style={{ ...INTER, fontSize: 13, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}>
            Nueva reunión
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
          {FASES_CONFIG.map((f) => (
            <div
              key={f.num}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                backgroundColor: f.num < fase ? VERDE : f.num === fase ? TEAL : '#e5e7eb',
                transition: 'background-color 300ms',
              }}
            />
          ))}
        </div>

        <p style={{ ...INTER, fontSize: 12, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>
          Fase {fase} de 8
        </p>
        <h1 style={{ ...JAKARTA, fontSize: 22, fontWeight: 700, color: VERDE, margin: '0 0 4px' }}>
          {FASES_CONFIG[fase - 1].titulo}
        </h1>
        <p style={{ ...INTER, fontSize: 14, color: '#6b7280', margin: '0 0 20px' }}>
          {FASES_CONFIG[fase - 1].sub}
        </p>

        {/* ── FASE 1 ── */}
        {fase === 1 && (
          <>
            {recuadro(
              <>
                <p style={{ ...INTER, fontSize: 12, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Declaración de apertura</p>
                <p style={{ ...INTER, fontSize: 16, color: 'white', margin: 0, lineHeight: 1.7, fontStyle: 'italic' }}>
                  "Gracias por el espacio. Vine porque creo que podemos resolver [DOLOR]. Me gustaría entender mejor tu situación y ver si hay un camino juntos."
                </p>
              </>
            )}
            <div style={{ backgroundColor: 'white', borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <p style={{ ...INTER, fontSize: 15, fontWeight: 700, color: '#1f2937', margin: '0 0 8px' }}>Mentalidad de entrada</p>
              <p style={{ ...INTER, fontSize: 15, color: '#374151', margin: 0, lineHeight: 1.7 }}>
                No viniste a cerrar. Viniste a entender. El cierre es consecuencia — no objetivo.
              </p>
            </div>
            <button onClick={() => setFase(2)} style={btnPrimario}>Ya entré — siguiente</button>
          </>
        )}

        {/* ── FASE 2 ── */}
        {fase === 2 && (
          <>
            {recuadro(
              <>
                <p style={{ ...INTER, fontSize: 12, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Pregunta clave</p>
                <p style={{ ...INTER, fontSize: 16, color: 'white', margin: 0, lineHeight: 1.7, fontStyle: 'italic' }}>
                  "De todo lo que tienes sobre la mesa hoy, ¿qué es lo que más te está quitando el sueño en tu operación comercial?"
                </p>
              </>
            )}

            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Si responde vago', resp: '"¿Eso ya te está costando tiempo, dinero o los dos?"' },
                { label: 'Si responde concreto', resp: '"¿Y si eso sigue igual en 3 meses, qué pasa en tu negocio?"' },
              ].map((c) => (
                <div key={c.label} style={{ flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 16, border: '1px solid #f3f4f6' }}>
                  <p style={{ ...INTER, fontSize: 13, fontWeight: 700, color: TEAL, margin: '0 0 6px' }}>{c.label}</p>
                  <p style={{ ...INTER, fontSize: 14, color: '#374151', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>{c.resp}</p>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <p style={{ ...INTER, fontSize: 14, fontWeight: 700, color: '#374151', margin: '0 0 10px' }}>¿Cómo va la conversación?</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {([['verde', '🟢 Va bien'], ['amarillo', '🟡 Tenso'], ['rojo', '🔴 Bloqueado']] as const).map(([val, label]) => (
                  <button key={val} onClick={() => setSemaforo(val)} style={{ ...INTER, flex: 1, height: 40, borderRadius: 10, fontSize: 13, fontWeight: 600, border: '1.5px solid', cursor: 'pointer', backgroundColor: semaforo === val ? (val === 'verde' ? '#22c55e' : val === 'amarillo' ? '#f59e0b' : '#ef4444') : 'white', color: semaforo === val ? 'white' : '#374151', borderColor: semaforo === val ? (val === 'verde' ? '#22c55e' : val === 'amarillo' ? '#f59e0b' : '#ef4444') : '#e5e7eb' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => setFase(3)} style={btnPrimario}>Tengo la info — siguiente</button>
          </>
        )}

        {/* ── FASE 3 ── */}
        {fase === 3 && (
          <>
            <div style={{ backgroundColor: 'white', borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <p style={{ ...INTER, fontSize: 14, fontWeight: 700, color: VERDE, margin: '0 0 12px' }}>Señales verbales</p>
              {[
                { dice: '"Sería complicado…"', accion: 'HAY MARGEN. Refuerza valor.' },
                { dice: '"Tendríamos que ver cómo…"', accion: 'Está calculando. Ayúdalo a imaginar la solución.' },
                { dice: '"Lo de siempre es el precio…"', accion: 'Quiere negociar. Pon más variables antes de hablar de precio.' },
              ].map((s) => (
                <div key={s.dice} style={{ borderBottom: '1px solid #f3f4f6', padding: '10px 0' }}>
                  <p style={{ ...INTER, fontSize: 14, fontStyle: 'italic', color: '#374151', margin: '0 0 4px' }}>{s.dice}</p>
                  <p style={{ ...INTER, fontSize: 13, fontWeight: 700, color: TEAL, margin: 0 }}>→ {s.accion}</p>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <p style={{ ...INTER, fontSize: 14, fontWeight: 700, color: VERDE, margin: '0 0 12px' }}>Señales no verbales</p>
              {[
                { senal: 'Se inclina hacia adelante', accion: 'Interés real. Profundiza.' },
                { senal: 'Cruza brazos', accion: 'Cambia el ángulo. Pregunta sobre él.' },
                { senal: 'Mira el reloj', accion: 'Resume y pregunta qué le preocupa.' },
              ].map((s) => (
                <div key={s.senal} style={{ borderBottom: '1px solid #f3f4f6', padding: '10px 0' }}>
                  <p style={{ ...INTER, fontSize: 14, color: '#374151', margin: '0 0 4px' }}>{s.senal}</p>
                  <p style={{ ...INTER, fontSize: 13, fontWeight: 700, color: TEAL, margin: 0 }}>→ {s.accion}</p>
                </div>
              ))}
            </div>

            {alerta('#ef4444', 'NUNCA castigues una señal con un argumento. Respóndela con una pregunta.')}
            <button onClick={() => setFase(4)} style={btnPrimario}>Entendí las señales — siguiente</button>
          </>
        )}

        {/* ── FASE 4 ── */}
        {fase === 4 && (
          <>
            {alerta(TEAL, 'Quien propone primero ancla la negociación.')}

            <div style={{ backgroundColor: 'white', borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <p style={{ ...INTER, fontSize: 14, fontWeight: 700, color: VERDE, margin: '0 0 12px' }}>Estructura en 4 pasos</p>
              {['Recapitula el dolor', 'Propuesta completa (precio + plazos + condiciones)', 'Por qué es justa', 'Invita a responder'].map((paso, i) => (
                <div key={paso} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: i < 3 ? '1px solid #f3f4f6' : 'none' }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ ...INTER, fontSize: 12, fontWeight: 700, color: 'white' }}>{i + 1}</span>
                  </span>
                  <p style={{ ...INTER, fontSize: 14, color: '#374151', margin: 0 }}>{paso}</p>
                </div>
              ))}
            </div>

            {recuadro(
              <>
                <p style={{ ...INTER, fontSize: 12, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Frase exacta</p>
                <p style={{ ...INTER, fontSize: 15, color: 'white', margin: 0, lineHeight: 1.7, fontStyle: 'italic' }}>
                  "Según lo que me contaste, el problema es [X]. Lo que te propongo es [SOLUCIÓN + PRECIO + CONDICIONES]. Esto funciona porque [RAZÓN]. ¿Qué te parece?"
                </p>
              </>
            )}

            <p style={{ ...INTER, fontSize: 14, fontWeight: 700, color: '#374151', margin: '0 0 10px' }}>¿Cómo respondió el cliente?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => setFase(7)} style={{ ...btnPrimario, backgroundColor: '#22c55e', height: 48 }}>✅ La aceptó → ir al cierre</button>
              <button onClick={() => setFase(5)} style={{ ...btnPrimario, backgroundColor: '#f59e0b', height: 48 }}>🔄 Quiere ajustes → reformular</button>
              <button onClick={() => setSosAbierto(true)} style={{ ...btnPrimario, backgroundColor: '#ef4444', height: 48 }}>❌ La rechazó → abrir SOS</button>
            </div>
          </>
        )}

        {/* ── FASE 5 ── */}
        {fase === 5 && (
          <>
            {recuadro(
              <>
                <p style={{ ...INTER, fontSize: 12, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Pregunta clave</p>
                <p style={{ ...INTER, fontSize: 16, color: 'white', margin: 0, lineHeight: 1.7, fontStyle: 'italic' }}>
                  "De todo lo que te propuse, ¿cuál es el punto exacto que no te convence? ¿Bajo qué condición sí te funcionaría?"
                </p>
              </>
            )}

            <div style={{ backgroundColor: 'white', borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <p style={{ ...INTER, fontSize: 14, fontWeight: 700, color: VERDE, margin: '0 0 8px' }}>Contrapropuesta refleja</p>
              <p style={{ ...INTER, fontSize: 14, color: '#374151', margin: '0 0 12px', lineHeight: 1.6 }}>
                Si te ponen una condición absurda — pon una igual de absurda para que vuelvan a negociar.
              </p>
              <div style={{ backgroundColor: BEIGE, borderLeft: `3px solid ${TEAL}`, borderRadius: 8, padding: 12 }}>
                <p style={{ ...INTER, fontSize: 14, color: '#374151', margin: 0, fontStyle: 'italic' }}>
                  "¿40% de descuento? Entonces el contrato es por 3 años y pago en 7 días."
                </p>
              </div>
            </div>

            <button onClick={() => setFase(6)} style={btnPrimario}>Ajustamos — siguiente</button>
          </>
        )}

        {/* ── FASE 6 ── */}
        {fase === 6 && (
          <>
            {alerta('#ef4444', 'NUNCA des nada gratis. Si cedes algo — pide algo a cambio. Siempre.')}

            {recuadro(
              <>
                <p style={{ ...INTER, fontSize: 12, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Fórmula</p>
                <p style={{ ...INTER, fontSize: 16, color: 'white', margin: 0, lineHeight: 1.7, fontStyle: 'italic' }}>
                  "Podría aceptar [LO QUE PIDEN]… pero entonces necesitaría que tú [LO QUE TÚ QUIERES]."
                </p>
              </>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { si: 'Piden descuento', entonces: 'Contrato por 12 meses en lugar de 6' },
                { si: 'Piden más tiempo', entonces: 'Precio de hoy solo aplica hasta esa fecha' },
                { si: 'Piden más servicios', entonces: 'Me presentas 2 contactos de tu red' },
              ].map((e) => (
                <div key={e.si} style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, border: '1px solid #f3f4f6' }}>
                  <p style={{ ...INTER, fontSize: 13, color: '#9ca3af', margin: '0 0 4px' }}>Si piden</p>
                  <p style={{ ...INTER, fontSize: 14, fontWeight: 700, color: '#374151', margin: '0 0 8px' }}>{e.si}</p>
                  <p style={{ ...INTER, fontSize: 13, color: '#9ca3af', margin: '0 0 4px' }}>Entonces pides</p>
                  <p style={{ ...INTER, fontSize: 14, fontWeight: 700, color: VERDE, margin: 0 }}>{e.entonces}</p>
                </div>
              ))}
            </div>

            <button onClick={() => setFase(7)} style={btnPrimario}>Intercambiamos — siguiente</button>
          </>
        )}

        {/* ── FASE 7 ── */}
        {fase === 7 && (
          <>
            {alerta('#22c55e', 'Cuando hablen de detalles pequeños (quién firma, cuenta de pago) → cierra ya.')}

            {recuadro(
              <>
                <p style={{ ...INTER, fontSize: 12, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Frase de cierre</p>
                <p style={{ ...INTER, fontSize: 16, color: 'white', margin: 0, lineHeight: 1.7, fontStyle: 'italic' }}>
                  "Entonces tenemos claro: [ACUERDO 1], [ACUERDO 2] y [ACUERDO 3]. ¿Lo firmamos esta semana y arrancamos el lunes?"
                </p>
              </>
            )}

            <div style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <p style={{ ...INTER, fontSize: 14, color: '#374151', margin: 0, lineHeight: 1.6 }}>
                Aquí sí puedes dar una concesión pequeña sin pedir nada — solo aquí. Es el caramelito del cierre.
              </p>
            </div>

            <button onClick={() => setFase(8)} style={{ ...btnPrimario, backgroundColor: '#22c55e' }}>Cerró — finalizar</button>
          </>
        )}

        {/* ── FASE 8 ── */}
        {fase === 8 && (
          <>
            <div style={{ backgroundColor: '#22c55e' + '18', border: '2px solid #22c55e', borderRadius: 14, padding: 20, textAlign: 'center', marginBottom: 20 }}>
              <p style={{ ...JAKARTA, fontSize: 20, fontWeight: 700, color: '#16a34a', margin: '0 0 4px' }}>¡Lo cerraste!</p>
              <p style={{ ...INTER, fontSize: 14, color: '#15803d', margin: 0 }}>Ahora los siguientes 2 pasos en las próximas 2 horas.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <Link href="/prospectos" style={{ backgroundColor: 'white', borderRadius: 14, padding: 20, border: '1px solid #f3f4f6', textDecoration: 'none', display: 'block' }}>
                <p style={{ ...INTER, fontSize: 14, fontWeight: 700, color: VERDE, margin: '0 0 4px' }}>1. Actualiza el prospecto en CBC</p>
                <p style={{ ...INTER, fontSize: 13, color: '#9ca3af', margin: 0 }}>Toca para ir a prospectos →</p>
              </Link>

              <div style={{ backgroundColor: 'white', borderRadius: 14, padding: 20, border: '1px solid #f3f4f6' }}>
                <p style={{ ...INTER, fontSize: 14, fontWeight: 700, color: VERDE, margin: '0 0 12px' }}>2. Envía el recap hoy</p>
                <div style={{ backgroundColor: BEIGE, borderRadius: 10, padding: 14, marginBottom: 12 }}>
                  <p style={{ ...INTER, fontSize: 14, color: '#374151', margin: 0, lineHeight: 1.7, fontStyle: 'italic' }}>
                    "[NOMBRE], fue un gusto. Según lo que conversamos: [ACUERDO 1], [ACUERDO 2]. El próximo paso es [ACCIÓN] el [FECHA]. Cualquier duda, aquí estoy."
                  </p>
                </div>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText('[NOMBRE], fue un gusto. Según lo que conversamos: [ACUERDO 1], [ACUERDO 2]. El próximo paso es [ACCIÓN] el [FECHA]. Cualquier duda, aquí estoy.')
                    setCopiado(true)
                    setTimeout(() => setCopiado(false), 2000)
                  }}
                  style={{ ...INTER, width: '100%', height: 40, backgroundColor: copiado ? TEAL : VERDE, color: 'white', fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 10, cursor: 'pointer' }}
                >
                  {copiado ? '✓ Copiado' : 'Copiar plantilla'}
                </button>
              </div>
            </div>

            <button onClick={resetear} style={btnPrimario}>Nueva reunión</button>
          </>
        )}
      </div>

      {/* ── BOTÓN SOS FIJO ── */}
      {pantalla === 'fases' && fase < 8 && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}>
          <button
            onClick={() => { setSosAbierto(true); setObjecionSeleccionada(null) }}
            style={{ ...JAKARTA, backgroundColor: '#ef4444', color: 'white', fontSize: 15, fontWeight: 700, border: 'none', borderRadius: 50, padding: '14px 28px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(239,68,68,0.4)' }}
          >
            🆘 SOS — Objeción
          </button>
        </div>
      )}

      {/* ── MODAL SOS ── */}
      {sosAbierto && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => { setSosAbierto(false); setObjecionSeleccionada(null) }}
        >
          <div
            style={{ backgroundColor: 'white', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', width: '100%', maxWidth: 520, maxHeight: '85vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {!objecionSeleccionada ? (
              <>
                <p style={{ ...JAKARTA, fontSize: 18, fontWeight: 700, color: VERDE, margin: '0 0 4px' }}>🆘 Módulo SOS</p>
                <p style={{ ...INTER, fontSize: 14, color: '#6b7280', margin: '0 0 20px' }}>¿Qué está diciendo el cliente?</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {OBJECIONES_SOS.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setObjecionSeleccionada(o.id)}
                      style={{ ...INTER, textAlign: 'left', padding: '14px 16px', backgroundColor: BEIGE, border: '1.5px solid #f3f4f6', borderRadius: 12, fontSize: 14, color: '#1f2937', cursor: 'pointer', fontWeight: 600 }}
                    >
                      {o.titulo}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <button onClick={() => setObjecionSeleccionada(null)} style={{ ...INTER, fontSize: 14, color: VERDE, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: 0 }}>
                  ← Volver a objeciones
                </button>
                <p style={{ ...INTER, fontSize: 13, fontStyle: 'italic', color: '#6b7280', margin: '0 0 16px' }}>{objecionActiva?.titulo}</p>
                <div style={{ backgroundColor: VERDE, borderRadius: 12, padding: 20, marginBottom: 20 }}>
                  <p style={{ ...INTER, fontSize: 15, color: 'white', margin: 0, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{objecionActiva?.respuesta}</p>
                </div>
                <button
                  onClick={() => { setSosAbierto(false); setObjecionSeleccionada(null) }}
                  style={{ ...btnPrimario, height: 48 }}
                >
                  Aplicar y volver a la fase
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
