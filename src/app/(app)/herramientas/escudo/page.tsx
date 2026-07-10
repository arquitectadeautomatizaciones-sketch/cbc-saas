'use client'

import { useState } from 'react'
import Link from 'next/link'

const VERDE = '#1A4A44'
const TEAL = '#4ECDC4'
const BEIGE = '#F5F0E8'
const JAKARTA = { fontFamily: 'var(--font-jakarta), system-ui, sans-serif' }
const INTER = { fontFamily: 'var(--font-inter), system-ui, sans-serif' }

interface Objecion {
  id: string
  titulo: string
  tags: string[]
  clienteDice: string
  loQueSiente: string
  respuesta: string
  preguntaCierre: string
}

const OBJECIONES: Objecion[] = [
  {
    id: 'caro',
    titulo: 'Es muy caro',
    tags: ['caro', 'precio', 'dinero', 'costoso', 'inversión'],
    clienteDice: '"Es muy caro"',
    loQueSiente: 'Cerebro reptil: miedo a perder. Sin imagen del después, no decide.',
    respuesta: '"Entiendo. Antes de hablar de precio — imagina que este mes recuperas [X] por resolver [DOLOR]. ¿Cuánto vale eso? Ahora compara ese número con la inversión. Cuando el costo de no actuar supera el precio — no es caro. Es el mejor negocio que puedes hacer este trimestre."',
    preguntaCierre: '"Si vieras ese número ahora mismo, ¿el precio seguiría siendo la conversación?"',
  },
  {
    id: 'pensarlo',
    titulo: 'Déjame pensarlo',
    tags: ['pensar', 'pienso', 'tiempo', 'después', 'luego', 'reflexionar'],
    clienteDice: '"Déjame pensarlo"',
    loQueSiente: 'Sin imagen del después el cerebro evita decidir. Hay una duda concreta no dicha.',
    respuesta: '"Claro. Antes de que te vayas — imagina que resuelves [DOLOR] este mes. ¿Cómo se ve tu pipeline en 30 días? Ahora dime: ¿qué parte de eso necesitas pensar? Porque casi siempre hay una duda específica detrás. Dímela y la resolvemos ahora."',
    preguntaCierre: '"¿Es el resultado, el precio, o algo que no te expliqué bien?"',
  },
  {
    id: 'consultar',
    titulo: 'Necesito consultarlo con mi socio/jefe/comité',
    tags: ['jefe', 'socio', 'consultar', 'comité', 'directivo', 'aprobación', 'director'],
    clienteDice: '"Necesito consultarlo con mi socio/jefe/comité"',
    loQueSiente: 'Cerebro límbico: miedo a equivocarse solo. Busca seguridad colectiva.',
    respuesta: '"Por supuesto. Para que esa conversación sea fácil — imagina que llegas con un resumen de una página con los números exactos. Tu jefe ve el ROI, no una duda. ¿Qué necesita ver esa persona para decir sí?"',
    preguntaCierre: '"¿Cuándo es esa conversación? Me coordino para estar disponible."',
  },
  {
    id: 'proveedor',
    titulo: 'Ya tenemos un proveedor',
    tags: ['proveedor', 'ya tenemos', 'otro', 'solución', 'alternativa', 'contrato'],
    clienteDice: '"Ya tenemos un proveedor"',
    loQueSiente: 'Cerebro reptil: cambio es riesgo. No ve el GAP que su proveedor no cubre.',
    respuesta: '"Me alegra saberlo. Imagina por un momento ese dolor que todavía sientes aunque ya tienes proveedor — ese [SITUACIÓN ESPECÍFICA]. Ese es el GAP que no está cubriendo. No vengo a reemplazar lo que funciona. Vengo a cerrar ese hueco."',
    preguntaCierre: '"¿Qué es lo que tu solución actual todavía no resuelve?"',
  },
  {
    id: 'presupuesto',
    titulo: 'No tenemos presupuesto este trimestre',
    tags: ['presupuesto', 'budget', 'plata', 'dinero', 'recursos', 'trimestre', 'financiero'],
    clienteDice: '"No tenemos presupuesto este trimestre"',
    loQueSiente: 'No ve el costo de la inacción. El cerebro no siente urgencia sin imagen del precio de esperar.',
    respuesta: '"Entiendo. Imagina que al final de este trimestre sumas todo lo que perdiste por no resolverlo — leads fríos, tiempo manual, reportes sin datos. ¿Cuánto es ese número? Cuando ese número aparece, el presupuesto también aparece."',
    preguntaCierre: '"Si pudieras ver ese número ahora mismo, ¿cambiaría la conversación?"',
  },
  {
    id: 'competencia',
    titulo: '¿Por qué tú y no la competencia?',
    tags: ['competencia', 'competidor', 'por qué tú', 'diferencia', 'versus', 'comparar'],
    clienteDice: '"¿Por qué tú y no la competencia?"',
    loQueSiente: 'El cerebro ya quiere comprar. Está comparando para justificar. Es una invitación a cerrar.',
    respuesta: '"Buena pregunta. Imagina que ya elegiste — ¿qué resultado necesitas ver en 60 días para saber que tomaste la decisión correcta? Dímelo. Porque trabajo con quienes quieren exactamente eso — y sé si puedo dártelo o no."',
    preguntaCierre: '"¿Qué tendría que ser verdad para que eligieras trabajar conmigo hoy?"',
  },
  {
    id: 'descuento',
    titulo: '¿Puedes hacerme un descuento?',
    tags: ['descuento', 'rebaja', 'precio', 'negociar', 'bajar', 'menos'],
    clienteDice: '"¿Puedes hacerme un descuento?"',
    loQueSiente: 'Quiere sentir que gana. No necesariamente necesita menor precio.',
    respuesta: '"El precio no lo muevo — porque bajarlo le dice a tu cerebro que el resultado tampoco vale tanto. Imagina en cambio que ajustamos el alcance exactamente a tu prioridad real ahora. Empiezas por lo que más duele, ves resultados rápido. Un descuento devalúa. Un ajuste resuelve."',
    preguntaCierre: '"¿Qué parte es la más crítica para ti hoy? Empezamos por ahí."',
  },
  {
    id: 'prioridad',
    titulo: 'Interesante, pero no es prioridad ahora',
    tags: ['prioridad', 'interesante', 'después', 'luego', 'más adelante', 'no es momento'],
    clienteDice: '"Interesante, pero no es prioridad ahora"',
    loQueSiente: 'El dolor no duele suficiente. El cerebro reptil no ve la amenaza — la urgencia no es visible.',
    respuesta: '"Respeto eso. Imagina cómo se ve ese mismo problema en 3 meses sin resolverlo — más leads perdidos, más tiempo manual, más trimestres sin datos reales. Ese es el costo del silencio. No te presiono — pero quiero que decidas con esa imagen sobre la mesa."',
    preguntaCierre: '"¿Cuándo sería el momento — y qué estaría pasando diferente en tu negocio para entonces?"',
  },
]

export default function EscudoPage() {
  const [busqueda, setBusqueda] = useState('')
  const [expandida, setExpandida] = useState<string | null>(null)
  const [copiado, setCopiado] = useState<string | null>(null)

  const filtradas = OBJECIONES.filter((o) => {
    if (!busqueda.trim()) return true
    const q = busqueda.toLowerCase()
    return (
      o.titulo.toLowerCase().includes(q) ||
      o.tags.some((t) => t.includes(q)) ||
      o.clienteDice.toLowerCase().includes(q)
    )
  })

  async function copiar(texto: string, id: string) {
    await navigator.clipboard.writeText(texto)
    setCopiado(id)
    setTimeout(() => setCopiado(null), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: BEIGE }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px 48px' }}>

        {/* Back */}
        <Link
          href="/herramientas"
          style={{ ...INTER, fontSize: 14, color: VERDE, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}
        >
          ← Volver a herramientas
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ ...JAKARTA, fontSize: 26, fontWeight: 700, color: VERDE, margin: '0 0 6px' }}>
            🛡️ Escudo de Objeciones™
          </h1>
          <p style={{ ...INTER, fontSize: 15, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
            Respuesta exacta para cada objeción. Sin improvisar.
          </p>
        </div>

        {/* Search */}
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder='Escribe "caro", "tiempo", "jefe"…'
          style={{
            ...INTER,
            width: '100%',
            height: 48,
            border: '1.5px solid #e5e7eb',
            borderRadius: 12,
            padding: '0 16px',
            fontSize: 16,
            backgroundColor: 'white',
            outline: 'none',
            boxSizing: 'border-box',
            marginBottom: 20,
          }}
        />

        {filtradas.length === 0 && (
          <p style={{ ...INTER, fontSize: 15, color: '#9ca3af', textAlign: 'center', marginTop: 40 }}>
            No encontré esa objeción. Escríbela completa o prueba con otra palabra.
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtradas.map((o) => {
            const abierta = expandida === o.id
            return (
              <div
                key={o.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 14,
                  border: `1.5px solid ${abierta ? TEAL : '#f3f4f6'}`,
                  overflow: 'hidden',
                  transition: 'border-color 200ms',
                }}
              >
                {/* Trigger */}
                <button
                  onClick={() => setExpandida(abierta ? null : o.id)}
                  style={{
                    ...INTER,
                    width: '100%',
                    textAlign: 'left',
                    padding: '16px 20px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 700, color: VERDE }}>{o.titulo}</span>
                  <span style={{ fontSize: 18, color: TEAL, flexShrink: 0 }}>{abierta ? '−' : '+'}</span>
                </button>

                {abierta && (
                  <div style={{ padding: '0 20px 20px' }}>
                    {/* Lo que dice el cliente */}
                    <div style={{ backgroundColor: '#fef9f0', border: '1px solid #f59e0b', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                      <p style={{ ...INTER, fontSize: 12, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Lo que dice el cliente</p>
                      <p style={{ ...INTER, fontSize: 14, color: '#78350f', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>{o.clienteDice}</p>
                    </div>

                    {/* Lo que siente */}
                    <div style={{ backgroundColor: '#f5f3ff', border: '1px solid #c4b5fd', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                      <p style={{ ...INTER, fontSize: 12, fontWeight: 700, color: '#5b21b6', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>🧠 Lo que siente</p>
                      <p style={{ ...INTER, fontSize: 14, color: '#4c1d95', margin: 0, lineHeight: 1.6 }}>{o.loQueSiente}</p>
                    </div>

                    {/* Tu respuesta */}
                    <div style={{ backgroundColor: VERDE, borderRadius: 10, padding: 16, marginBottom: 12 }}>
                      <p style={{ ...INTER, fontSize: 12, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>✅ Tu respuesta lista</p>
                      <p style={{ ...INTER, fontSize: 15, color: 'white', margin: 0, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{o.respuesta}</p>
                    </div>

                    {/* Pregunta de cierre */}
                    <div style={{ backgroundColor: BEIGE, border: `1.5px solid ${TEAL}`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
                      <p style={{ ...INTER, fontSize: 12, fontWeight: 700, color: VERDE, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>🎯 Pregunta de cierre</p>
                      <p style={{ ...INTER, fontSize: 14, color: '#1f2937', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>{o.preguntaCierre}</p>
                    </div>

                    {/* Copy button */}
                    <button
                      onClick={() => copiar(`${o.respuesta}\n\n${o.preguntaCierre}`, o.id)}
                      style={{
                        ...INTER,
                        width: '100%',
                        height: 44,
                        backgroundColor: copiado === o.id ? TEAL : VERDE,
                        color: 'white',
                        fontSize: 14,
                        fontWeight: 700,
                        border: 'none',
                        borderRadius: 10,
                        cursor: 'pointer',
                        transition: 'background-color 200ms',
                      }}
                    >
                      {copiado === o.id ? '✓ Copiado' : 'Copiar respuesta + cierre'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
