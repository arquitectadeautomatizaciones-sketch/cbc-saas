import Link from 'next/link'

const herramientas = [
  {
    icon: '🤝',
    titulo: 'Copiloto de Reunión™',
    descripcion: 'Tu GPS de negociación fase a fase. Actívalo 30 segundos antes de entrar.',
    href: '/herramientas/copiloto',
    cta: 'Abrir copiloto',
  },
  {
    icon: '⚡',
    titulo: 'Networker Élite™',
    descripcion: 'Convierte eventos en pipeline real. Score, fases y mensajes DISC listos.',
    href: '/herramientas/networker',
    cta: 'Abrir networker',
  },
  {
    icon: '🛡️',
    titulo: 'Escudo de Objeciones™',
    descripcion: 'Respuesta exacta para cada objeción en segundos. Sin improvisar.',
    href: '/herramientas/escudo',
    cta: 'Abrir escudo',
  },
]

export default function HerramientasPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#1A4A44', fontFamily: 'var(--font-jakarta)' }}>
          Herramientas
        </h1>
        <p className="text-gray-500 text-sm mt-1">Recursos para cerrar más ventas — sin improvisar.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {herramientas.map((h) => (
          <div
            key={h.href}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col"
          >
            <div className="text-4xl mb-4">{h.icon}</div>
            <h2
              className="text-lg font-bold mb-2"
              style={{ color: '#1A4A44', fontFamily: 'var(--font-jakarta)' }}
            >
              {h.titulo}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed flex-1">{h.descripcion}</p>
            <Link
              href={h.href}
              className="mt-5 block text-center py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#1A4A44' }}
            >
              {h.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
