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
  respuesta: string
  porQue: string
}

const OBJECIONES: Objecion[] = [
  {
    id: 'caro',
    titulo: 'Está muy caro',
    tags: ['caro', 'precio', 'dinero', 'costoso', 'inversión'],
    clienteDice: '"Está muy caro" / "Tengo mejores propuestas"',
    respuesta: '¿Caro comparado con qué? — Pausa. Espera su respuesta.\n\n"Si el problema te cuesta X por mes, ¿cuánto vale resolverlo en 60 días?" No bajes el precio.',
    porQue: 'La pausa es una herramienta de neuroventas. El silencio incomoda al cliente y lo lleva a justificar, revelando el ancla de precio real. Reencuadrar el costo en el costo del problema elimina la comparación directa de precios.',
  },
  {
    id: 'momento',
    titulo: 'No es el momento',
    tags: ['momento', 'tiempo', 'después', 'pienso', 'luego', 'consulto'],
    clienteDice: '"No es el momento" / "Lo pienso" / "Déjame consultarlo"',
    respuesta: '"¿Y si esto sigue igual en 3 meses, qué pasa en tu operación?"',
    porQue: 'Proyectar el dolor al futuro activa la aversión a la pérdida — el motor de decisión más poderoso. No estás empujando. Estás ayudando al cliente a visualizar las consecuencias de no actuar.',
  },
  {
    id: 'jefe',
    titulo: 'Tengo que consultarlo',
    tags: ['jefe', 'socio', 'consultar', 'directivo', 'aprobación', 'director'],
    clienteDice: '"Tengo que consultarlo con mi socio/jefe"',
    respuesta: '"¿Qué información necesita para decidir? Yo le preparo algo específico para él."',
    porQue: 'Esta respuesta convierte al gatekeeper en un aliado. En lugar de esperar una respuesta vaga, tomas el control del siguiente paso y entras indirectamente en la reunión de decisión.',
  },
  {
    id: 'vueltas',
    titulo: 'La discusión da vueltas',
    tags: ['vueltas', 'loop', 'circular', 'mismo', 'repetir', 'bloqueado'],
    clienteDice: 'La conversación regresa siempre al mismo punto sin avanzar',
    respuesta: '"¿Qué necesitaría pasar para que esto tuviera sentido para ti?"',
    porQue: 'Cuando el cliente da vueltas es porque hay una objeción real no dicha. Esta pregunta lo invita a revelarla sin presión. Una vez que sabes el obstáculo real, puedes resolverlo.',
  },
  {
    id: 'silencio',
    titulo: 'No responde / evade',
    tags: ['silencio', 'evade', 'evasivo', 'esquiva', 'no responde', 'distante'],
    clienteDice: 'El cliente esquiva, cambia el tema o guarda silencio incómodo',
    respuesta: 'Silencio 5 segundos. Luego: "¿Qué está pasando por tu cabeza ahora?"',
    porQue: 'El silencio estratégico rompe el patrón. La pregunta abre un espacio seguro para que el cliente exprese lo que realmente piensa. La mayoría de vendedores hablan en este momento — ese es el error.',
  },
  {
    id: 'competencia',
    titulo: 'La competencia da lo mismo',
    tags: ['competencia', 'competidor', 'mismo', 'igual', 'alternativa', 'otro proveedor'],
    clienteDice: '"La competencia ofrece lo mismo por menos"',
    respuesta: '"¿Qué te ofrece que yo no te esté dando?" Solo responde a ESE punto específico.',
    porQue: 'No defiendes tu propuesta de forma genérica — atacas el punto exacto de comparación. Esto acota la conversación y evita que el cliente siga acumulando objeciones. La especificidad gana.',
  },
  {
    id: 'presupuesto',
    titulo: 'No tenemos presupuesto',
    tags: ['presupuesto', 'budget', 'plata', 'dinero', 'recursos', 'financiero'],
    clienteDice: '"No tenemos presupuesto para esto"',
    respuesta: '"Si el presupuesto no fuera un factor, ¿esto resolvería tu problema?"',
    porQue: 'Esta pregunta separa el problema del presupuesto. Si el cliente dice que sí resolvería su problema, el presupuesto se convierte en un obstáculo a resolver juntos — no en un rechazo definitivo.',
  },
  {
    id: 'montón',
    titulo: 'Me lanza 5 objeciones de golpe',
    tags: ['montón', 'varias', 'muchas', 'lista', 'conjunto', 'bombardeo'],
    clienteDice: 'El cliente dispara múltiples objeciones a la vez sin orden',
    respuesta: '"De todo lo que dijiste, ¿cuál es la que más te preocupa ahora?"',
    porQue: 'Múltiples objeciones de golpe suelen ser una cortina de humo. Al elegir la principal, el cliente revela la real. Además, resolver una bien vale más que responder cinco a medias.',
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
                    <div style={{ backgroundColor: '#fef9f0', border: '1px solid #f59e0b', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                      <p style={{ ...INTER, fontSize: 12, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>El cliente dice</p>
                      <p style={{ ...INTER, fontSize: 14, color: '#78350f', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>{o.clienteDice}</p>
                    </div>

                    {/* Respuesta */}
                    <div style={{ backgroundColor: VERDE, borderRadius: 10, padding: 16, marginBottom: 14 }}>
                      <p style={{ ...INTER, fontSize: 12, fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Tu respuesta exacta</p>
                      <p style={{ ...INTER, fontSize: 15, color: 'white', margin: 0, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{o.respuesta}</p>
                    </div>

                    {/* Por qué funciona */}
                    <div style={{ backgroundColor: BEIGE, borderLeft: `3px solid ${TEAL}`, borderRadius: 8, padding: 14, marginBottom: 16 }}>
                      <p style={{ ...INTER, fontSize: 12, fontWeight: 700, color: VERDE, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Por qué funciona</p>
                      <p style={{ ...INTER, fontSize: 14, color: '#374151', margin: 0, lineHeight: 1.6 }}>{o.porQue}</p>
                    </div>

                    {/* Copy button */}
                    <button
                      onClick={() => copiar(o.respuesta, o.id)}
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
                      {copiado === o.id ? '✓ Copiado' : 'Copiar respuesta'}
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
