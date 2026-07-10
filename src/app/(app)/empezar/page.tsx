'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Circle } from 'lucide-react'

const VERDE = '#1A4A44'
const TEAL = '#4ECDC4'
const BEIGE = '#F5F0E8'

const STORAGE_KEY = 'cbc_empezar_v1'

const PASOS = [
  {
    num: 1,
    emoji: '👤',
    titulo: 'Crea tu perfil',
    descripcion: 'Ve a Configuración. Escribe tu nombre, sector y meta mensual. El sistema se activa y empieza a trabajar por ti.',
    href: '/configuracion',
    cta: 'Ir a Configuración',
  },
  {
    num: 2,
    emoji: '🎯',
    titulo: 'Carga tus prospectos',
    descripcion: 'En Prospectos agrega cada cliente. Solo nombre, empresa y valor estimado — el semáforo y el dashboard se actualizan solos.',
    href: '/prospectos',
    cta: 'Ir a Prospectos',
  },
  {
    num: 3,
    emoji: '📊',
    titulo: 'Empieza cada día aquí',
    descripcion: 'En el Dashboard tienes tus números clave. En Mi Día Hoy tienes los prospectos más urgentes ordenados — sin parálisis, sin adivinar a quién llamar.',
    href: '/dashboard',
    cta: 'Ver mi Dashboard',
  },
  {
    num: 4,
    emoji: '🧠',
    titulo: 'Conoce a tu cliente antes de llamar',
    descripcion: 'En Perfil DISC llena 6 campos y obtén tu estrategia lista — cómo hablarle, cómo presentar el precio, cómo cerrar.',
    href: '/herramientas/disc',
    cta: 'Abrir Perfil DISC',
  },
  {
    num: 5,
    emoji: '🤖',
    titulo: 'Usa la IA en el momento exacto',
    descripcion: 'En IA en Acción tienes 8 herramientas para cada momento de tu día — investigar, calificar, cuantificar, preparar reuniones y propuestas en minutos.',
    href: '/herramientas/ia-en-accion',
    cta: 'Abrir IA en Acción',
  },
  {
    num: 6,
    emoji: '🛡️',
    titulo: 'Maneja objeciones como crack',
    descripcion: 'En Escudo de Objeciones tienes las 8 objeciones más comunes con respuesta de neuroventas y pregunta de cierre lista para usar.',
    href: '/herramientas/escudo',
    cta: 'Abrir Escudo',
  },
  {
    num: 7,
    emoji: '🔄',
    titulo: 'Haz seguimiento sin excusas',
    descripcion: 'Cuando cambies un prospecto a Propuesta Enviada, el sistema programa los mensajes de seguimiento días 1, 3 y 7 automáticamente. Tú solo copias y envías.',
    href: '/seguimientos',
    cta: 'Ver Seguimientos',
  },
  {
    num: 8,
    emoji: '💬',
    titulo: 'Responde como crack',
    descripcion: 'En la ficha de cada prospecto, cuando el cliente responda, toca "El cliente respondió" — CBC genera la respuesta perfecta con el contexto real.',
    href: '/prospectos',
    cta: 'Ir a Prospectos',
  },
  {
    num: 9,
    emoji: '🏅',
    titulo: 'Celebra cada victoria',
    descripcion: 'En Victorias registra cada logro — grande o pequeño. La evidencia de tu progreso es tu mejor arma contra el síndrome del impostor.',
    href: '/victorias',
    cta: 'Ver Victorias',
  },
  {
    num: 10,
    emoji: '🎧',
    titulo: 'Reprograma tu mente mientras trabajas',
    descripcion: 'En Mi Modo Crack tienes 8 audios de neurociencia y tu ritual del día personalizado. Tu cerebro se reprograma — tú vendes.',
    href: '/herramientas/modo-crack',
    cta: 'Activar Modo Crack',
  },
]

export default function EmpezarPage() {
  const [completados, setCompletados] = useState<Set<number>>(new Set())
  const [listo, setListo] = useState(false)

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY)
      if (guardado) setCompletados(new Set(JSON.parse(guardado)))
    } catch {}
    setListo(true)
  }, [])

  function togglePaso(num: number) {
    setCompletados(prev => {
      const next = new Set(prev)
      next.has(num) ? next.delete(num) : next.add(num)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])) } catch {}
      return next
    })
  }

  const totalCompletados = completados.size
  const pct = Math.round((totalCompletados / PASOS.length) * 100)

  return (
    <div className="max-w-2xl mx-auto pb-16">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-3xl">🚀</span>
          <h1 className="text-2xl font-bold" style={{ color: VERDE, fontFamily: 'var(--font-jakarta)' }}>
            Empieza Aquí
          </h1>
        </div>
        <p className="text-gray-500 text-sm mt-1">
          10 pasos para activar tu sistema de ventas en 5 minutos.
        </p>
      </div>

      {/* Barra de progreso */}
      {listo && (
        <div className="mb-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold" style={{ color: VERDE }}>
              Tu progreso
            </p>
            <p className="text-sm font-black" style={{ color: totalCompletados === PASOS.length ? '#16a34a' : VERDE }}>
              {totalCompletados}/{PASOS.length}
            </p>
          </div>
          <div className="w-full rounded-full h-3 mb-2" style={{ background: '#e5e7eb' }}>
            <div
              className="h-3 rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: totalCompletados === PASOS.length
                  ? 'linear-gradient(90deg, #16a34a, #4ade80)'
                  : `linear-gradient(90deg, ${VERDE}, ${TEAL})`,
              }}
            />
          </div>
          <p className="text-xs text-gray-400">
            {totalCompletados === 0
              ? 'Toca cualquier paso para marcarlo como visto.'
              : totalCompletados === PASOS.length
              ? '🎉 Sistema activado. Ya eres un crack con sistema.'
              : `${PASOS.length - totalCompletados} paso${PASOS.length - totalCompletados !== 1 ? 's' : ''} restante${PASOS.length - totalCompletados !== 1 ? 's' : ''}.`
            }
          </p>
        </div>
      )}

      {/* Pasos */}
      <div className="flex flex-col gap-3">
        {PASOS.map(paso => {
          const hecho = completados.has(paso.num)
          return (
            <div
              key={paso.num}
              className="bg-white rounded-2xl border shadow-sm overflow-hidden transition-all"
              style={{ borderColor: hecho ? '#86efac' : '#f3f4f6' }}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Número + check */}
                  <button
                    onClick={() => togglePaso(paso.num)}
                    className="flex-shrink-0 mt-0.5 transition-transform active:scale-95"
                    aria-label={hecho ? 'Marcar como pendiente' : 'Marcar como completado'}
                  >
                    {hecho
                      ? <CheckCircle2 size={24} color="#16a34a" fill="#dcfce7" />
                      : <Circle size={24} color="#d1d5db" />
                    }
                  </button>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-black px-2 py-0.5 rounded-full"
                        style={{ background: hecho ? '#dcfce7' : BEIGE, color: hecho ? '#16a34a' : VERDE }}
                      >
                        {paso.num}
                      </span>
                      <span className="text-base">{paso.emoji}</span>
                      <p
                        className="font-bold text-sm"
                        style={{
                          color: hecho ? '#6b7280' : VERDE,
                          textDecoration: hecho ? 'line-through' : 'none',
                          fontFamily: 'var(--font-jakarta)',
                        }}
                      >
                        {paso.titulo}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed mb-3" style={{ opacity: hecho ? 0.6 : 1 }}>
                      {paso.descripcion}
                    </p>
                    <Link
                      href={paso.href}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-opacity hover:opacity-85"
                      style={{
                        backgroundColor: hecho ? '#f3f4f6' : VERDE,
                        color: hecho ? '#9ca3af' : 'white',
                      }}
                    >
                      {paso.cta} →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      {listo && totalCompletados === PASOS.length && (
        <div
          className="mt-6 rounded-2xl p-6 text-center"
          style={{ background: VERDE }}
        >
          <p className="text-3xl mb-2">🏆</p>
          <p className="font-bold text-lg mb-1" style={{ color: TEAL, fontFamily: 'var(--font-jakarta)' }}>
            Sistema activado.
          </p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Ya tienes todo lo que necesitas para cerrar como un crack. Ahora a ejecutar.
          </p>
        </div>
      )}
    </div>
  )
}
