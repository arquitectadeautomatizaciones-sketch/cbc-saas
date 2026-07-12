'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

// ── Paleta ────────────────────────────────────────────────────
const VERDE  = '#1A4A44'
const TEAL   = '#4ECDC4'
const PAPER  = '#F5F0E8'
const PAPERD = '#EDE8DF'
const NEGRO  = '#080808'
const ROJO   = '#e8001d'
const TEXT   = '#2D2D2D'

// ── Tipografía ────────────────────────────────────────────────
const BEBAS = "'Bebas Neue', Impact, sans-serif"
const INTER = "'Inter', system-ui, sans-serif"
const MONO  = "'JetBrains Mono', 'Courier New', monospace"

const SOFIA_IMG = 'https://assets.cdn.filesafe.space/MgsViYLMmCdJksx9p3va/media/69e8ba57a1636a6c65273241.png'

// ── Componente Sofía — bloques narrativos ─────────────────────
function SofiaBloque({ texto, dark = false }: { texto: string; dark?: boolean }) {
  return (
    <div style={{
      borderLeft: `3px solid ${dark ? TEAL : VERDE}`,
      background: dark ? 'rgba(255,255,255,0.06)' : 'white',
      borderRadius: '0 12px 12px 0',
      padding: '20px 24px',
      maxWidth: 600,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <img
          src={SOFIA_IMG}
          alt="Sofía"
          style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', flexShrink: 0 }}
        />
        <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: dark ? TEAL : VERDE, letterSpacing: '0.14em' }}>
          SOFÍA™
        </span>
      </div>
      <p style={{ fontFamily: INTER, fontSize: 15, color: dark ? 'rgba(245,240,232,0.8)' : TEXT, lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>
        "{texto}"
      </p>
    </div>
  )
}

// ── Acordeón FAQ ──────────────────────────────────────────────
function FaqItem({ pregunta, respuesta }: { pregunta: string; respuesta: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid #D8D3C9` }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', textAlign: 'left', padding: '18px 0',
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
        }}
      >
        <span style={{ fontFamily: INTER, fontSize: 15, fontWeight: 600, color: VERDE, lineHeight: 1.4 }}>
          {pregunta}
        </span>
        <span style={{
          fontFamily: MONO, fontSize: 20, color: TEAL, flexShrink: 0,
          transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'none',
          lineHeight: 1,
        }}>+</span>
      </button>
      {open && (
        <p style={{ fontFamily: INTER, fontSize: 14, color: '#555', lineHeight: 1.7, margin: '0 0 18px', paddingRight: 32 }}>
          {respuesta}
        </p>
      )}
    </div>
  )
}

// ── Datos estáticos ───────────────────────────────────────────
const COMPONENTES = [
  {
    label: 'COMPONENTE 01',
    nombre: 'SOFÍA™',
    desc: 'La ejecutiva comercial del protocolo. Revisa tu expediente cada mañana, identifica los casos urgentes del día, redacta los mensajes exactos para cada contacto y te prepara para cada reunión antes de que empiece. No sugiere. Ejecuta.',
  },
  {
    label: 'COMPONENTE 02',
    nombre: 'SISTEMA OPERATIVO COMERCIAL™',
    desc: 'El panel de control de tu pipeline. Semáforo de prioridad en tiempo real, historial completo de cada contacto, seguimientos automáticos en los momentos correctos y alertas cada mañana. Tu proceso de ventas sin fisuras.',
  },
  {
    label: 'COMPONENTE 03',
    nombre: 'GLADIADOR DE VENTAS™',
    desc: 'El arsenal completo para cada situación real: guiones de llamada perfecta, propuestas irrechazables, copiloto de reunión, escudo de objeciones, perfil DISC del cliente y reporte al director. Todo listo antes de que lo necesites.',
  },
  {
    label: 'COMPONENTE 04',
    nombre: 'ACTUALIZACIONES PERMANENTES',
    desc: 'El protocolo evoluciona. Cada mejora, cada nueva herramienta, cada refinamiento del sistema llega a tu acceso sin costo adicional. Lo que funciona hoy, funciona mejor mañana.',
  },
]

const TIMELINE = [
  { hora: '07:00',   accion: 'El protocolo emite la lista de casos urgentes del día.' },
  { hora: '07:15',   accion: 'Los mensajes de intervención están redactados y listos para enviar.' },
  { hora: '08:30',   accion: 'Sabes exactamente a quién llamar, en qué orden, y qué decirle.' },
  { hora: 'CONTACTO', accion: 'Cada interacción actualiza el estado del caso en tiempo real.' },
  { hora: 'CIERRE',  accion: 'El reporte de la jornada está listo antes de que lo pidan.' },
  { hora: 'SEMANA 1', accion: 'El patrón de pérdida empieza a interrumpirse con datos reales.' },
]

const CRITERIOS_SI = [
  'Trabajas en ventas B2B con ciclos de más de una reunión',
  'Tienes prospectos activos que requieren seguimiento real',
  'Tu ingreso depende del cierre de cuentas gestionadas',
  'El problema está en el proceso, no en los prospectos',
  'Quieres claridad diaria sobre a quién llamar y qué decirle',
]

const CRITERIOS_NO = [
  'Vendes productos de bajo costo sin proceso de seguimiento',
  'Tu operación es 100% inbound sin gestión activa de pipeline',
  'Buscas resultados sin usar el sistema durante la prueba',
  'Necesitas generar volumen masivo de contactos en frío desde cero',
]

const FAQS = [
  {
    pregunta: '¿El protocolo funciona para mi cuello específico?',
    respuesta: 'Sí. El Sistema Operativo Comercial™ interviene sobre los tres cuellos más comunes en ventas B2B: escasez de contactos, pérdida en el seguimiento y cierre incompleto. En los primeros días, Sofía™ calibra su intervención exactamente al caso que identificó tu diagnóstico.',
  },
  {
    pregunta: '¿Sofía™ sabe qué identifiqué en el diagnóstico?',
    respuesta: 'Sofía™ conoce todos los patrones del protocolo CBC™. En los primeros minutos de tu acceso, te preguntará sobre tu situación actual para calibrar la intervención a tu caso específico sin necesidad de que repitas el proceso.',
  },
  {
    pregunta: '¿Qué pasa si cancelo antes de los 7 días?',
    respuesta: 'Cancelas sin cargo. No se te cobra nada durante el período de prueba. Si cancelas antes del día 7, tu acceso continúa hasta el final del período y no se genera ningún cobro.',
  },
  {
    pregunta: '¿Cuánto tiempo al día necesita el protocolo?',
    respuesta: '10 a 20 minutos al inicio del día. El sistema genera tu lista de casos urgentes, los mensajes listos para enviar y tu punto de partida de la jornada. El resto es ejecutar, no decidir.',
  },
  {
    pregunta: '¿Necesito configurar algo o ya viene listo?',
    respuesta: 'El protocolo guía el proceso de activación. En los primeros 15 minutos, Sofía™ te acompaña para cargar tus primeros prospectos y calibrar el semáforo a tu ciclo de ventas real.',
  },
  {
    pregunta: '¿Puedo pausar si salgo de viaje?',
    respuesta: 'La suscripción es mensual y se cancela cuando quieras. No existe "pausa" como función, pero puedes cancelar antes del próximo ciclo y reactivar cuando vuelvas, sin perder tu historial.',
  },
]

// ── Página principal ──────────────────────────────────────────
function SubscribeContent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const params = useSearchParams()
  const cancelled = params.get('cancelled')

  async function handleCheckout() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'No se pudo iniciar el proceso. Intenta de nuevo.')
        setLoading(false)
      }
    } catch {
      setError('Error de conexión. Verifica tu internet e intenta de nuevo.')
      setLoading(false)
    }
  }

  function BtnActivar({ label = 'INICIAR INTERVENCIÓN', full = false }: { label?: string; full?: boolean }) {
    return (
      <button
        onClick={handleCheckout}
        disabled={loading}
        style={{
          background: TEAL, color: VERDE,
          fontFamily: BEBAS, fontSize: 21, letterSpacing: '0.04em',
          padding: '20px 48px',
          border: 'none', borderRadius: 4,
          cursor: loading ? 'wait' : 'pointer',
          opacity: loading ? 0.7 : 1,
          display: full ? 'block' : 'inline-block',
          width: full ? '100%' : undefined,
          transition: 'opacity 0.2s',
        }}
      >
        {loading ? 'INICIANDO...' : label}
      </button>
    )
  }

  return (
    <div style={{ fontFamily: INTER, overflowX: 'hidden' }}>

      {/* ── Google Fonts ─────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* ════════════════════════════════════════════════════════
          SECCIÓN 01 — SELLO DE CIERRE
          Estado: CONTINUIDAD · "Sigo dentro del mismo caso"
      ════════════════════════════════════════════════════════ */}
      <section style={{ background: NEGRO, padding: '72px 24px 64px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: `repeating-linear-gradient(90deg, ${ROJO} 0,${ROJO} 22px, transparent 22px, transparent 30px)` }} />

        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: '#444', letterSpacing: '0.15em', marginBottom: 24 }}>
            EXPEDIENTE · ESTADO: CERRADO · FASE ACTIVA: INTERVENCIÓN
          </div>

          <h1 style={{ fontFamily: BEBAS, fontSize: 'clamp(56px, 8vw, 84px)', color: PAPER, lineHeight: 1, margin: '0 0 6px', letterSpacing: '0.02em' }}>
            La investigación
          </h1>
          <h1 style={{ fontFamily: BEBAS, fontSize: 'clamp(56px, 8vw, 84px)', color: ROJO, lineHeight: 1, margin: '0 0 28px', letterSpacing: '0.02em' }}>
            terminó.
          </h1>
          <p style={{ fontFamily: INTER, fontSize: 17, color: '#777', lineHeight: 1.65, maxWidth: 500, margin: '0 0 44px' }}>
            El veredicto fue emitido. El cuello fue identificado.
            Ahora comienza la intervención.
          </p>

          {/* Sofía — primera aparición */}
          <SofiaBloque
            dark
            texto="Revisé tu expediente. El patrón ya está identificado. Déjame mostrarte cómo vamos a intervenirlo."
          />
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4,
          background: `repeating-linear-gradient(90deg, ${ROJO} 0,${ROJO} 22px, transparent 22px, transparent 30px)` }} />
      </section>

      {/* ════════════════════════════════════════════════════════
          SECCIÓN 02 — CONCLUSIÓN DE LA INVESTIGACIÓN
          Estado: COMPRENSIÓN · "Entiendo qué encontró la investigación"
      ════════════════════════════════════════════════════════ */}
      <section style={{ background: PAPER, padding: '80px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: '#888', letterSpacing: '0.15em', marginBottom: 16 }}>
            CONCLUSIÓN DE LA INVESTIGACIÓN
          </div>
          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(38px, 5vw, 56px)', color: VERDE, margin: '0 0 32px', lineHeight: 1.05 }}>
            El análisis produjo un resultado.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 36 }}>
            {[
              { label: 'CUELLO', valor: 'Identificado', color: VERDE },
              { label: 'PÉRDIDA', valor: 'Documentada', color: ROJO },
              { label: 'INTERVENCIÓN', valor: 'Disponible', color: TEAL },
            ].map(item => (
              <div key={item.label} style={{ background: 'white', borderRadius: 8, padding: '20px 22px', borderTop: `3px solid ${item.color}` }}>
                <div style={{ fontFamily: MONO, fontSize: 10, color: '#aaa', letterSpacing: '0.15em', marginBottom: 10 }}>{item.label}</div>
                <div style={{ fontFamily: BEBAS, fontSize: 26, color: item.color }}>{item.valor}</div>
              </div>
            ))}
          </div>

          <p style={{ fontFamily: INTER, fontSize: 17, color: TEXT, lineHeight: 1.75, maxWidth: 580 }}>
            El patrón es conocido. La pérdida está documentada. La intervención específica existe.
          </p>
          <p style={{ fontFamily: INTER, fontSize: 17, color: TEXT, lineHeight: 1.75, maxWidth: 580, marginTop: 16 }}>
            No necesitas seguir investigando. El diagnóstico ya produjo su conclusión.
            Lo que sigue es diferente: es la ejecución.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SECCIÓN 03 — EL PROTOCOLO CBC™
          Estado: CONFIANZA · "Existe un protocolo específico"
      ════════════════════════════════════════════════════════ */}
      <section style={{ background: PAPERD, padding: '80px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: '#888', letterSpacing: '0.15em', marginBottom: 16 }}>
            PROTOCOLO DE INTERVENCIÓN COMERCIAL
          </div>
          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(38px, 5vw, 56px)', color: VERDE, margin: '0 0 16px', lineHeight: 1.05 }}>
            CBC™ no es un sistema más.
          </h2>
          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(28px, 4vw, 42px)', color: TEXT, margin: '0 0 28px', lineHeight: 1.1, fontWeight: 400 }}>
            Es la intervención diseñada para este caso.
          </h2>
          <p style={{ fontFamily: INTER, fontSize: 16, color: '#555', lineHeight: 1.7, maxWidth: 580, marginBottom: 40 }}>
            Construido desde adentro, por una vendedora que lo necesitaba para sí misma antes de necesitarlo para venderlo.
            No es una plataforma genérica. Es un protocolo de intervención con componentes específicos para cada fase del problema.
          </p>

          <div style={{ display: 'grid', gap: 14 }}>
            {COMPONENTES.map(c => (
              <div key={c.label} style={{ background: 'white', borderRadius: 8, padding: '24px 28px', borderLeft: `4px solid ${VERDE}` }}>
                <div style={{ fontFamily: MONO, fontSize: 10, color: '#aaa', letterSpacing: '0.15em', marginBottom: 8 }}>{c.label}</div>
                <div style={{ fontFamily: BEBAS, fontSize: 22, color: VERDE, marginBottom: 10 }}>{c.nombre}</div>
                <p style={{ fontFamily: INTER, fontSize: 14, color: '#555', lineHeight: 1.65, margin: 0 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SECCIÓN 04 — CÓMO OPERA
          Estado: CONTROL · "Sé exactamente qué va a pasar"
      ════════════════════════════════════════════════════════ */}
      <section style={{ background: PAPER, padding: '80px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: '#888', letterSpacing: '0.15em', marginBottom: 16 }}>
            EJECUCIÓN DEL PROTOCOLO
          </div>
          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(38px, 5vw, 56px)', color: VERDE, margin: '0 0 32px', lineHeight: 1.05 }}>
            Cómo opera en un caso real.
          </h2>

          <div style={{ display: 'grid', gap: 10 }}>
            {TIMELINE.map(item => (
              <div key={item.hora} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', background: 'white', borderRadius: 8, padding: '16px 20px' }}>
                <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: VERDE, whiteSpace: 'nowrap', minWidth: 72, paddingTop: 1 }}>
                  {item.hora}
                </span>
                <p style={{ fontFamily: INTER, fontSize: 15, color: TEXT, margin: 0, lineHeight: 1.5 }}>
                  {item.accion}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SECCIÓN 05 — CONFIRMACIÓN EXTERNA (Tatiana Panadero)
          Estado: VALIDACIÓN · "Otra persona ya recorrió este camino"
      ════════════════════════════════════════════════════════ */}
      <section style={{ background: PAPERD, padding: '80px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: '#888', letterSpacing: '0.15em', marginBottom: 16 }}>
            CASO DOCUMENTADO · MAYO 2026
          </div>
          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(38px, 5vw, 56px)', color: VERDE, margin: '0 0 32px', lineHeight: 1.05 }}>
            El protocolo ya produjo resultados.
          </h2>

          {/* Tarjeta Tatiana — arquitectura repetible para futuros testimonios reales */}
          <div style={{ background: 'white', borderRadius: 8, borderLeft: `4px solid ${VERDE}`, padding: '32px 28px', marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
              <img
                src="https://assets.cdn.filesafe.space/MgsViYLMmCdJksx9p3va/media/6a13da46fe2210f89e7033ce.jpeg"
                alt="Tatiana Panadero"
                style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', flexShrink: 0 }}
              />
              <div>
                <div style={{ fontFamily: INTER, fontWeight: 700, color: VERDE, fontSize: 15 }}>Tatiana Panadero</div>
                <div style={{ fontFamily: INTER, fontSize: 13, color: '#888', marginTop: 2 }}>Ejecutiva Comercial Senior · Bogotá, Colombia</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: '#bbb', letterSpacing: '0.1em', marginTop: 4 }}>
                  CASO DOCUMENTADO · 15 MAY 2026
                </div>
              </div>
            </div>

            <blockquote style={{ fontFamily: INTER, fontSize: 16, color: TEXT, lineHeight: 1.8, margin: '0 0 24px', padding: 0, borderLeft: 'none', fontStyle: 'italic' }}>
              "Está buenísimo, de verdad está genial. El semáforo, el script para reportar al jefe… tal cual.{' '}
              <strong style={{ fontStyle: 'normal' }}>
                Eso es sencillo, corto, y es lo que de verdad le importa a los directores a nivel de números.
              </strong>
              <br /><br />
              Imagínate que tuve una reunión con mi nueva directora y tal cual manejé el speech. Donde son interesantes los números,
              usé la plantilla… eso me sirvió mucho, me fue súper bien en la reunión.
              <br /><br />
              <strong style={{ fontStyle: 'normal' }}>
                Si voy bien digo tal cosa, si voy regular digo tal cosa, si voy mal digo tal cosa. Concreto.
              </strong>{' '}
              Era exactamente lo que ella quería escuchar."
            </blockquote>

            <div style={{ paddingTop: 20, borderTop: `1px solid ${PAPERD}` }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: '#aaa', letterSpacing: '0.12em', marginBottom: 10 }}>
                TESTIMONIO POR AUDIO · 15 MAY 2026
              </div>
              <p style={{ fontFamily: INTER, fontSize: 13, color: '#888', margin: '0 0 10px' }}>
                Tatiana comparte su experiencia después de usar CBC™ en una reunión real con su directora.
              </p>
              <audio controls style={{ width: '100%' }}>
                <source src="/audio/tatiana-panadero.mp3" type="audio/mpeg" />
                Tu navegador no soporta audio.
              </audio>
            </div>
          </div>

          {/* Sofía — segunda aparición */}
          <SofiaBloque texto="El seguimiento no falla por falta de esfuerzo. Falla porque nadie recuerda exactamente a quién llamar, cuándo, y qué decirle. El protocolo resuelve exactamente eso." />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SECCIÓN 06 — LA INVESTIGADORA (Origen del Protocolo)
          Estado: VALIDACIÓN DE ORIGEN
      ════════════════════════════════════════════════════════ */}
      <section style={{ background: VERDE, padding: '80px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: `${TEAL}99`, letterSpacing: '0.15em', marginBottom: 16 }}>
            ORIGEN DEL PROTOCOLO
          </div>
          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(38px, 5vw, 56px)', color: PAPER, margin: '0 0 24px', lineHeight: 1.05 }}>
            CBC™ nació de adentro.
          </h2>
          <p style={{ fontFamily: INTER, fontSize: 17, color: 'rgba(245,240,232,0.8)', lineHeight: 1.75, maxWidth: 580 }}>
            Diana García. Más de 20 años en ventas B2B en mercados europeos y latinoamericanos.
            Construyó CBC™ porque lo necesitaba para sí misma antes de necesitarlo para venderlo.
          </p>
          <p style={{ fontFamily: INTER, fontSize: 17, color: 'rgba(245,240,232,0.8)', lineHeight: 1.75, maxWidth: 580, marginTop: 16 }}>
            El problema no era motivación. Era proceso. Cada mes, prospectos que debían haber cerrado
            se perdían en la brecha entre el primer contacto y el seguimiento. El protocolo nació para intervenir exactamente ahí.
          </p>
          <div style={{ marginTop: 36, padding: '22px 26px', background: 'rgba(245,240,232,0.07)', borderRadius: '0 10px 10px 0', borderLeft: `3px solid ${TEAL}` }}>
            <p style={{ fontFamily: INTER, fontSize: 16, color: 'rgba(245,240,232,0.7)', lineHeight: 1.65, margin: '0 0 14px', fontStyle: 'italic' }}>
              "Lo construí para resolver mi propio problema. Si funciona para mí con 20 años de oficio, funciona para cualquier vendedor con prospectos reales y un proceso que mejorar."
            </p>
            <span style={{ fontFamily: MONO, fontSize: 10, color: TEAL, letterSpacing: '0.12em' }}>
              — DIANA GARCÍA · FUNDADORA, CBC™
            </span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SECCIÓN 07 — CRITERIOS DE ACTIVACIÓN
          Estado: SEGURIDAD COGNITIVA · "¿Es mi caso?"
      ════════════════════════════════════════════════════════ */}
      <section style={{ background: PAPER, padding: '80px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: '#888', letterSpacing: '0.15em', marginBottom: 16 }}>
            CRITERIOS DE ACTIVACIÓN
          </div>
          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(38px, 5vw, 56px)', color: VERDE, margin: '0 0 32px', lineHeight: 1.05 }}>
            El protocolo opera sobre casos específicos.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: VERDE, letterSpacing: '0.15em', marginBottom: 14 }}>
                EL PROTOCOLO INTERVIENE CUANDO
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {CRITERIOS_SI.map(c => (
                  <div key={c} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'white', borderRadius: 6, padding: '12px 16px', borderLeft: `3px solid ${VERDE}` }}>
                    <span style={{ fontFamily: MONO, fontSize: 14, color: VERDE, fontWeight: 700, flexShrink: 0, lineHeight: 1.4 }}>+</span>
                    <span style={{ fontFamily: INTER, fontSize: 14, color: TEXT, lineHeight: 1.5 }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: '#aaa', letterSpacing: '0.15em', marginBottom: 14 }}>
                NO ES EL CASO CORRECTO SI
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {CRITERIOS_NO.map(c => (
                  <div key={c} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: PAPERD, borderRadius: 6, padding: '12px 16px' }}>
                    <span style={{ fontFamily: MONO, fontSize: 14, color: '#bbb', fontWeight: 700, flexShrink: 0, lineHeight: 1.4 }}>—</span>
                    <span style={{ fontFamily: INTER, fontSize: 14, color: '#777', lineHeight: 1.5 }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SECCIÓN 08 — CONDICIONES DE ACCESO
          Estado: SEGURIDAD PARA ACTUAR · "El riesgo es mínimo"
      ════════════════════════════════════════════════════════ */}
      <section style={{ background: PAPERD, padding: '80px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: '#888', letterSpacing: '0.15em', marginBottom: 32 }}>
            CONDICIONES DE ACCESO
          </div>

          {/* Sofía — aparición antes del precio */}
          <div style={{ marginBottom: 40 }}>
            <SofiaBloque texto="Ya viste cuánto dinero está escapando cada mes. Ahora voy a mostrarte exactamente cómo dejamos de perderlo." />
          </div>

          {/* Tarjeta de precio */}
          <div style={{ background: 'white', borderRadius: 12, padding: '40px 36px', maxWidth: 460, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: '#aaa', letterSpacing: '0.15em', marginBottom: 24 }}>
              ACCESO AL PROTOCOLO
            </div>

            <div style={{ fontFamily: BEBAS, fontSize: 76, color: VERDE, lineHeight: 1, marginBottom: 4 }}>
              $9.90
            </div>
            <div style={{ fontFamily: INTER, fontSize: 15, color: '#aaa', marginBottom: 12 }}>
              USD / mes
            </div>

            <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: VERDE, padding: '7px 14px', background: `${VERDE}12`, borderRadius: 3, display: 'inline-block', marginBottom: 28, letterSpacing: '0.1em' }}>
              PRIMEROS 7 DÍAS SIN CARGO
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
              {['Cancelas cuando quieras', 'Sin permanencia mínima', 'Sin tarjeta hasta el día 8'].map(f => (
                <div key={f} style={{ fontFamily: INTER, fontSize: 14, color: TEXT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ color: TEAL, fontWeight: 700 }}>+</span> {f}
                </div>
              ))}
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              style={{
                width: '100%', background: TEAL, color: VERDE,
                fontFamily: BEBAS, fontSize: 22, letterSpacing: '0.04em',
                padding: '20px', border: 'none', borderRadius: 4,
                cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
                display: 'block', marginBottom: 16, transition: 'opacity 0.2s',
              }}
            >
              {loading ? 'INICIANDO...' : 'INICIAR INTERVENCIÓN'}
            </button>

            {cancelled && (
              <div style={{ background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: 6, padding: '12px 16px', fontSize: 13, color: '#6D4C41', marginBottom: 16 }}>
                Cancelaste el proceso. Puedes iniciarlo cuando quieras.
              </div>
            )}
            {error && (
              <div style={{ background: '#FFF5F5', border: `1px solid ${ROJO}40`, borderRadius: 6, padding: '12px 16px', fontSize: 13, color: ROJO, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <p style={{ fontFamily: INTER, fontSize: 12, color: '#bbb', margin: 0 }}>
              Pago seguro con Stripe. No almacenamos tu tarjeta.
            </p>
          </div>

          {/* Contexto del precio */}
          <p style={{ fontFamily: INTER, fontSize: 14, color: '#777', textAlign: 'center', marginTop: 28, lineHeight: 1.65, maxWidth: 480, margin: '28px auto 0' }}>
            <strong style={{ color: TEXT }}>Con recuperar una sola comisión, el protocolo se paga muchas veces.</strong><br />
            $9.90 USD al mes. Menos que un café al día.<br />
            Una intervención exitosa cubre meses completos del acceso.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SECCIÓN 09 — GARANTÍA
          Estado: ELIMINACIÓN DE FRICCIÓN
      ════════════════════════════════════════════════════════ */}
      <section style={{ background: PAPER, padding: '80px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: '#888', letterSpacing: '0.15em', marginBottom: 16 }}>
            GARANTÍA DEL PROTOCOLO
          </div>
          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(38px, 5vw, 56px)', color: VERDE, margin: '0 0 24px', lineHeight: 1.05 }}>
            Sin riesgo real.
          </h2>
          <div style={{ background: 'white', borderRadius: 8, padding: '32px 28px', borderLeft: `4px solid ${TEAL}` }}>
            <p style={{ fontFamily: INTER, fontSize: 16, color: TEXT, lineHeight: 1.7, margin: '0 0 24px' }}>
              Si usas el protocolo durante 7 días y no produce claridad sobre tu proceso de ventas, devuelvo el acceso sin preguntas.
            </p>
            <div style={{ fontFamily: MONO, fontSize: 10, color: '#aaa', letterSpacing: '0.15em', marginBottom: 14 }}>
              CONDICIONES DE USO
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Haber cargado al menos 3 prospectos reales al sistema',
                'Haber completado el proceso de activación con Sofía™',
                'Haber usado el protocolo durante los 7 días del período de prueba',
              ].map((c, i) => (
                <div key={c} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontFamily: INTER, fontSize: 14, color: '#555' }}>
                  <span style={{ fontFamily: MONO, color: VERDE, fontWeight: 700, flexShrink: 0 }}>0{i + 1}</span>
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SECCIÓN 10 — PREGUNTAS DEL CASO (FAQ)
          Estado: ELIMINACIÓN DE OBJECIONES RESIDUALES
      ════════════════════════════════════════════════════════ */}
      <section style={{ background: PAPERD, padding: '80px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: '#888', letterSpacing: '0.15em', marginBottom: 16 }}>
            PREGUNTAS DEL CASO
          </div>
          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(38px, 5vw, 56px)', color: VERDE, margin: '0 0 36px', lineHeight: 1.05 }}>
            Lo que necesitas saber antes de activar.
          </h2>
          <div style={{ background: 'white', borderRadius: 8, padding: '8px 28px' }}>
            {FAQS.map(f => <FaqItem key={f.pregunta} {...f} />)}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SECCIÓN 11 — CIERRE
          Estado: DECISIÓN · "La siguiente acción es la consecuencia natural"
      ════════════════════════════════════════════════════════ */}
      <section style={{ background: NEGRO, padding: '80px 24px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: `repeating-linear-gradient(90deg, ${ROJO} 0,${ROJO} 22px, transparent 22px, transparent 30px)` }} />

        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: '#444', letterSpacing: '0.15em', marginBottom: 16 }}>
            CIERRE DEL EXPEDIENTE
          </div>
          <h2 style={{ fontFamily: BEBAS, fontSize: 'clamp(42px, 6vw, 64px)', color: PAPER, margin: '0 0 36px', lineHeight: 1.05 }}>
            El expediente tiene dos finales posibles.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 48 }}>
            <div style={{ background: '#0f0f0f', borderRadius: 8, padding: '28px 24px', borderTop: `3px solid ${ROJO}` }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: '#333', letterSpacing: '0.15em', marginBottom: 12 }}>FINAL A</div>
              <div style={{ fontFamily: BEBAS, fontSize: 24, color: '#3a3a3a', marginBottom: 12 }}>SIN INTERVENCIÓN</div>
              <p style={{ fontFamily: INTER, fontSize: 14, color: '#444', lineHeight: 1.65, margin: 0 }}>
                El expediente se cierra. El patrón continúa. El mes que viene: los mismos prospectos, el mismo cuello, la misma pérdida.
              </p>
            </div>
            <div style={{ background: '#080e0d', borderRadius: 8, padding: '28px 24px', borderTop: `3px solid ${TEAL}` }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: '#333', letterSpacing: '0.15em', marginBottom: 12 }}>FINAL B</div>
              <div style={{ fontFamily: BEBAS, fontSize: 24, color: TEAL, marginBottom: 12 }}>PROTOCOLO ACTIVADO</div>
              <p style={{ fontFamily: INTER, fontSize: 14, color: '#666', lineHeight: 1.65, margin: 0 }}>
                La intervención comienza. El protocolo opera. La investigación produce resultados reales.
              </p>
            </div>
          </div>

          {/* Sofía — tercera aparición */}
          <div style={{ marginBottom: 44 }}>
            <SofiaBloque
              dark
              texto="Cuando actives el protocolo, empiezo a trabajar contigo desde el primer día. Ya conozco el caso. Solo falta que abras el expediente."
            />
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleCheckout}
              disabled={loading}
              style={{
                background: TEAL, color: VERDE,
                fontFamily: BEBAS, fontSize: 22, letterSpacing: '0.04em',
                padding: '22px 56px', border: 'none', borderRadius: 4,
                cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
                display: 'inline-block', marginBottom: 16, transition: 'opacity 0.2s',
              }}
            >
              {loading ? 'INICIANDO...' : 'ACTIVAR EL PROTOCOLO DE INTERVENCIÓN'}
            </button>
            <div style={{ fontFamily: MONO, fontSize: 11, color: '#444', letterSpacing: '0.1em' }}>
              7 DÍAS SIN CARGO · $9.90 USD / MES · CANCELA CUANDO QUIERAS
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4,
          background: `repeating-linear-gradient(90deg, ${ROJO} 0,${ROJO} 22px, transparent 22px, transparent 30px)` }} />
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <section style={{ background: '#050505', padding: '40px 24px', borderTop: '1px solid #111' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img
              src="https://assets.cdn.filesafe.space/MgsViYLMmCdJksx9p3va/media/6a53d554708c41d4df3bf7b2.png"
              alt="Diana García · Arquitecta de Automatizaciones"
              style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontFamily: BEBAS, fontSize: 20, color: PAPER, letterSpacing: '0.05em' }}>CBC™</div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: '#333', letterSpacing: '0.1em' }}>CIERRE BAJO CONTROL™</div>
            </div>
          </div>
          <a
            href="https://wa.me/351925340092"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: MONO, fontSize: 11, color: '#444', letterSpacing: '0.1em', textDecoration: 'none' }}
          >
            WHATSAPP
          </a>
          <p style={{ fontFamily: MONO, fontSize: 10, color: '#222', letterSpacing: '0.08em', margin: 0 }}>
            © 2026 CBC™ · CIERRE BAJO CONTROL™
          </p>
        </div>
      </section>

    </div>
  )
}

export default function SubscribePage() {
  return (
    <Suspense>
      <SubscribeContent />
    </Suspense>
  )
}
