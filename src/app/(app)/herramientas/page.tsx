import Link from 'next/link'

const herramientas = [
  {
    icon: '🔥',
    titulo: 'Mi Modo Crack™',
    descripcion: 'Ritual mental personalizado con tus datos reales + 8 audios de reprogramación para entrar al día como vendedor élite.',
    href: '/herramientas/modo-crack',
    cta: 'Activar modo crack',
    nuevo: true,
  },
  {
    icon: '⚡',
    titulo: 'IA en Acción™',
    descripcion: 'El centro de comando del vendedor. 8 momentos reales — investiga prospectos, califica con BANT, neuroventas, calcula el costo de la inacción, maneja crisis y reactiva leads fríos.',
    href: '/herramientas/ia-en-accion',
    cta: 'Abrir centro de comando',
    nuevo: true,
    destacado: true,
  },
  {
    icon: '📝',
    titulo: 'Propuesta Express™',
    descripcion: '5 campos después de la reunión. Una propuesta irrechazable con neuroventas B2B — y su versión para WhatsApp. Todo en 2 minutos.',
    href: '/herramientas/propuesta',
    cta: 'Generar mi propuesta',
  },
  {
    icon: '📊',
    titulo: 'Reporte al Jefe™',
    descripcion: 'Genera en un toque un reporte de tu desempeño para compartir con tu director. Con tus datos reales y tono adaptado al semáforo de tu pipeline.',
    href: '/herramientas/reporte',
    cta: 'Generar mi reporte',
  },
  {
    icon: '📞',
    titulo: 'Mi Llamada Perfecta™',
    descripcion: 'Guión personalizado con IA antes de marcar. Apertura, diagnóstico, propuesta y cierre — listo en segundos.',
    href: '/herramientas/llamada',
    cta: 'Preparar mi llamada',
  },
  {
    icon: '📱',
    titulo: 'QR de Captura Inteligente™',
    descripcion: 'Tu prospecto escanea, llena sus datos y entran solos a tu pipeline. Tú no escribes nada.',
    href: '/herramientas/qr',
    cta: 'Ver mi QR',
  },
  {
    icon: '🧠',
    titulo: 'Perfil DISC del Cliente™',
    descripcion: 'Identifica el perfil de tu prospecto en 2 minutos y obtén la estrategia exacta: cómo hablarle, cómo presentar el precio y cómo cerrar.',
    href: '/herramientas/disc',
    cta: 'Analizar mi prospecto',
    nuevo: true,
  },
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {herramientas.map((h) => (
          <div
            key={h.href}
            className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col"
            style={{ borderColor: (h as any).nuevo ? '#1A4A44' : '#f3f4f6' }}
          >
            {(h as any).nuevo && (
              <span className="self-start text-xs font-bold px-2 py-0.5 rounded-full mb-3"
                style={{ background: '#4ECDC4', color: '#1A4A44' }}>
                NUEVO
              </span>
            )}
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
              style={{ backgroundColor: (h as any).nuevo ? '#4ECDC4' : '#1A4A44', color: (h as any).nuevo ? '#1A4A44' : 'white' }}
            >
              {h.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
