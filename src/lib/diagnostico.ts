// Shared types, question data, and scoring logic for the diagnostic flow

export interface Selecciones {
  q1val: number | null
  q1label: string
  q2: number | null
  q2lost: number
  q3: number | null
  q4: number | null
  q5: number | null
}

export const COMISION_OPTS = [
  { label: 'Menos de $500 USD', val: 300 },
  { label: 'Entre $500 y $2.000 USD', val: 1250 },
  { label: 'Entre $2.000 y $5.000 USD', val: 3500 },
  { label: 'Más de $5.000 USD', val: 7500 },
]
export const Q2_OPTS = [
  { label: 'Ninguno o casi ninguno', pts: 25, lost: 0.5 },
  { label: '2 o 3 prospectos', pts: 15, lost: 2.5 },
  { label: '4 a 6 prospectos', pts: 5, lost: 5 },
  { label: '7 o más', pts: 0, lost: 8 },
]
export const Q3_OPTS = [
  { label: 'Sí, claro y lo uso todos los días', pts: 25 },
  { label: 'Uso Excel o WhatsApp', pts: 10 },
  { label: 'Lo llevo en la cabeza', pts: 0 },
]
export const Q4_OPTS = [
  { label: 'Sí, la tengo calculada', pts: 25 },
  { label: 'Aproximadamente', pts: 12 },
  { label: 'No la tengo calculada', pts: 0 },
]
export const Q5_OPTS = [
  { label: '5 minutos o menos', pts: 25 },
  { label: 'Entre 5 y 20 minutos', pts: 12 },
  { label: 'Más de 20 minutos', pts: 0 },
]

export const FORTALEZAS: Record<string, string> = {
  seguimiento: 'Tu proceso de seguimiento funciona — eso ya te pone por encima del 70% de los vendedores B2B.',
  priorizacion: 'Identificas quién necesita atención antes de que se enfríe — eso se traduce en menos ventas perdidas.',
  preparacion: 'Preparas tus mensajes antes de enviarlos — y eso se nota en la tasa de respuesta.',
  reporte: 'Conoces tus números de cierre — eso te hace más persuasivo ante tu director.',
}
export const DEBILIDADES: Record<string, string> = {
  seguimiento: 'Sin un sistema claro, los prospectos se enfrían sin que te des cuenta — y cuando reaccionas, ya eligieron a alguien más.',
  priorizacion: 'Contactas a quien recuerdas, no a quien más urge — y eso tiene un costo invisible en comisiones cada mes.',
  preparacion: 'Tus mensajes de seguimiento tardan demasiado o suenan genéricos — y eso reduce tu tasa de respuesta directamente.',
  reporte: 'Sin datos claros de tu tasa de cierre, tomas decisiones a ciegas — y eso te debilita frente a tu director.',
}
export const CUELLO_TEXTO: Record<string, string> = {
  seguimiento: 'Tienes el talento para cerrar — pero si los prospectos se enfrían antes de que actúes, nunca llegas al cierre.',
  priorizacion: 'Sin orden de urgencia, atiendes a quien recuerdas, no a quien más necesita tu llamada hoy.',
  preparacion: 'Tardas demasiado en armar cada mensaje y eso te quita tiempo real de venta.',
  reporte: 'No sabes exactamente cómo vas — y eso debilita tu posición ante tu director y ante ti mismo.',
}
export const RECOMENDACIONES: Record<string, string[]> = {
  seguimiento: ['Registra cada prospecto el mismo día que lo conoces, antes de apagar el teléfono.', 'Programa los seguimientos días 1, 3 y 7 — no cuando te acuerdes.', 'Usa mensajes pre-redactados con el contexto del prospecto, no de memoria.'],
  priorizacion: ['Prioriza por días sin contacto, no por afinidad o recencia.', 'Define 3 contactos urgentes cada mañana antes de revisar el teléfono.', 'Los rojos primero — siempre. Un prospecto en rojo es dinero que se está yendo.'],
  preparacion: ['Antes de escribir, revisa las notas del prospecto. 60 segundos de contexto = 3x más respuestas.', 'Ten plantillas base por tipo de seguimiento (día 1, día 3, día 7) y personaliza solo 2 líneas.', 'Si tardas más de 5 minutos en redactar un mensaje, algo en tu proceso está roto.'],
  reporte: ['Calcula tu tasa de cierre hoy: cierres del mes ÷ prospectos contactados × 100.', 'Actualiza el estado de tus prospectos al menos 2 veces por semana.', 'Ten los números listos antes de que alguien te los pida — eso cambia tu posición completamente.'],
}

export function calcular(s: Selecciones) {
  const q2 = s.q2 ?? 0; const q3 = s.q3 ?? 0; const q4 = s.q4 ?? 0; const q5 = s.q5 ?? 0
  const total = q2 + q3 + q4 + q5
  const sub = {
    seguimiento: Math.min(10, Math.round(((q2 + q3) / 50) * 10)),
    priorizacion: Math.min(10, Math.round(((q2 + q5) / 50) * 10)),
    preparacion: Math.min(10, Math.round(((q3 + q5) / 50) * 10)),
    reporte: Math.min(10, Math.round((q4 / 25) * 10)),
  }
  const cuello = (Object.entries(sub) as [string, number][]).sort((a, b) => a[1] - b[1])[0][0]
  const perdidaMensual = Math.round(s.q2lost * (s.q1val ?? 0))

  const fortalezas = Object.entries(FORTALEZAS)
    .map(([k, v]) => ({ cat: k, texto: v, score: sub[k as keyof typeof sub] }))
    .sort((a, b) => b.score - a.score)
  const debilidades = Object.entries(DEBILIDADES)
    .map(([k, v]) => ({ cat: k, texto: v, score: sub[k as keyof typeof sub] }))
    .sort((a, b) => a.score - b.score)

  return {
    total, sub, cuello,
    cuelloLabel: cuello.charAt(0).toUpperCase() + cuello.slice(1),
    cuelloTexto: CUELLO_TEXTO[cuello],
    perdidaMensual, fortalezas, debilidades,
    recomendaciones: RECOMENDACIONES[cuello],
    nivelColor: total < 40 ? '#ef4444' : total < 65 ? '#f59e0b' : '#10b981',
  }
}

export function calcular90dias(s: Selecciones, perdidaMensual: number): string[] {
  const lineas: string[] = []
  const p90 = perdidaMensual * 3
  if (p90 > 0) lineas.push(`Pierdes $${p90.toLocaleString('en-US')} USD en prospectos que se enfrían solos — sin sistema que los reactive.`)
  if ((s.q3 ?? 25) === 0) lineas.push('Sigues improvisando ante el "lo pienso" — esos leads terminan comprándole a quien sí hace seguimiento.')
  else if ((s.q3 ?? 25) < 25) lineas.push('Tu seguimiento en Excel o WhatsApp sigue perdiendo contexto — y cada vez que lo buscas, pierdes tiempo que otros usan para cerrar.')
  if ((s.q4 ?? 25) === 0) lineas.push('No mides tu tasa de cierre. Lo que no se mide, no mejora — y lo que no mejora, se estanca.')
  else if ((s.q4 ?? 25) < 25) lineas.push('Tu tasa de cierre sigue siendo una estimación. Sin el número exacto, no puedes mejorar lo que no ves.')
  if ((s.q5 ?? 25) === 0) lineas.push('Cada mensaje de seguimiento te sigue costando más de 20 minutos — tiempo que podrías usar en nuevos prospectos.')
  if (lineas.length < 3) lineas.push('Tus prospectos sin respuesta siguen acumulándose — hasta que eligen a tu competencia.')
  return lineas.slice(0, 3)
}

export const SESSION_KEY = 'cbc_diagnostico_v1'
