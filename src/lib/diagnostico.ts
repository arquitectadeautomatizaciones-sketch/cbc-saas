// Shared types, question data, and scoring logic for the diagnostic flow

export interface Selecciones {
  v1: number | null     // comisión por venta (Q1)
  v2: number | null     // prospectos >7 días sin seguimiento (Q2)
  q3: boolean | null    // tiene protocolo para "lo pienso" (Q3)
  q4: boolean | null    // sabe su tasa de cierre exacta (Q4)
  sueno: string | null  // casa/viaje/estudios/deuda/carro/libertad (Q5)
}

export const SUENO_DATA: Record<string, string[]> = {
  casa: [
    'Esa casa o ese arreglo lleva esperando mientras tus prospectos se enfrían solos.',
    'Con las comisiones recuperadas en 90 días, esa decisión ya no espera más.',
    'No es que no lo merezcas. Es que el proceso actual no está diseñado para llevarte ahí.',
  ],
  viaje: [
    'Esas vacaciones siguen en "algún día" mientras gestionas manualmente lo que un sistema haría solo.',
    'Con lo que recuperas cada mes, ese viaje deja de ser un sueño y se convierte en fecha en el calendario.',
    'Seguir igual no es una opción — es una decisión consciente de quedarte donde estás.',
  ],
  estudios: [
    'Los estudios — tuyos o de tus hijos — no esperan para siempre. El tiempo tampoco.',
    'El sistema que te falta te cuesta comisiones que podrían ir directo a esa inversión.',
    'Esto no es motivación. Son matemáticas que duelen porque son reales.',
  ],
  deuda: [
    'La deuda crece en silencio mientras tus prospectos se enfrían sin seguimiento.',
    'Estás trabajando duro para pagar intereses — cuando el problema real es lo que se escapa cada mes.',
    'Las comisiones recuperadas al año son más que suficientes para eliminar eso de tu vida.',
  ],
  carro: [
    'El carro lleva esperando mientras tus leads desaparecen sin que nadie los reactive.',
    'No es un problema de ingresos — es un problema de sistema que retiene lo que ya deberías tener.',
    'Las comisiones de 90 días cambian esa conversación completamente.',
  ],
  libertad: [
    'El tiempo libre sin culpa no llega gestionando todo manualmente, tú solo, todos los días.',
    'Cada tarea repetitiva que haces tú es tiempo que no estás cerrando — ni viviendo.',
    'Un sistema trabaja cuando tú no puedes. Sin eso, siempre dependerás de tu presencia.',
  ],
}

export const FORTALEZAS: Record<string, string> = {
  seguimiento: 'Tienes pocos prospectos sin seguimiento — eso ya te pone por encima del 70% de los vendedores B2B.',
  priorizacion: 'Tu nivel de prospectos activos muestra que tienes el pipeline bajo control.',
  preparacion: 'Tener un protocolo para el "lo pienso" es una ventaja real — la mayoría improvisa y pierde ahí.',
  reporte: 'Conoces tu tasa de cierre — eso te hace más persuasivo ante tu director y más consciente de tu proceso.',
}

export const DEBILIDADES: Record<string, string> = {
  seguimiento: 'Tienes prospectos que llevan más de 7 días sin contacto. Cada día que pasa, la probabilidad de cerrar cae un 10%.',
  priorizacion: 'Con varios prospectos sin seguimiento, estás atendiendo a quien recuerdas — no a quien más urge.',
  preparacion: 'Improvisar ante el "lo pienso" te cuesta ventas. Sin un protocolo, cada objeción es una moneda al aire.',
  reporte: 'Sin saber tu tasa de cierre real, no puedes mejorar lo que no ves — y tomas decisiones a ciegas.',
}

export const CUELLO_TEXTO: Record<string, string> = {
  seguimiento: 'Tienes el talento para cerrar — pero si los prospectos se enfrían antes de que actúes, nunca llegas al cierre.',
  priorizacion: 'Sin orden de urgencia, atiendes a quien recuerdas, no a quien más necesita tu llamada hoy.',
  preparacion: 'Cada "lo pienso" sin protocolo es una venta que le das a tu competencia sin pelear.',
  reporte: 'No sabes exactamente cómo vas — y eso debilita tu posición ante tu director y ante ti mismo.',
}

export const RECOMENDACIONES: Record<string, string[]> = {
  seguimiento: [
    'Regresa hoy mismo a los prospectos con más de 7 días. Un mensaje simple: "¿Sigues evaluando opciones?" reactiva el 30% de los que parecían fríos.',
    'Programa los seguimientos días 1, 3 y 7 desde el primer contacto — no cuando te acuerdes.',
    'Define un máximo de prospectos "activos" que puedes atender bien. La calidad importa más que la cantidad.',
  ],
  priorizacion: [
    'Prioriza por días sin contacto, no por afinidad o recencia.',
    'Define 3 contactos urgentes cada mañana antes de revisar el teléfono.',
    'Los que llevan más de 7 días primero — siempre. Es dinero que se está yendo.',
  ],
  preparacion: [
    'Escribe HOY tu protocolo para el "lo pienso": qué preguntas haces, cuándo vuelves a llamar, qué envías.',
    'Ten plantillas base para objeciones frecuentes. Personaliza solo 2 líneas por prospecto.',
    'Si tardas más de 5 minutos en responder a una objeción, algo en tu proceso está roto.',
  ],
  reporte: [
    'Calcula tu tasa de cierre hoy: cierres del mes ÷ prospectos contactados × 100.',
    'Actualiza el estado de tus prospectos al menos 2 veces por semana.',
    'Ten los números listos antes de que alguien te los pida — eso cambia tu posición completamente.',
  ],
}

export function calcular(s: Selecciones) {
  const v2 = s.v2 ?? 0

  // Raw score 0-6 (higher = worse) — drives monetary calculation and badge
  let rawScore = 0
  if (v2 >= 5) rawScore += 2; else if (v2 >= 2) rawScore += 1
  if (s.q3 === false) rawScore += 2
  if (s.q4 === false) rawScore += 2

  const tasa = rawScore <= 1 ? 0.15 : rawScore <= 3 ? 0.30 : 0.45
  const perdidaMensual = Math.round((s.v1 ?? 0) * v2 * tasa / 10) * 10

  // Sub-scores 0-10 (higher = better) — drives gauge display
  const v2Score = v2 === 0 ? 10 : v2 <= 4 ? 6 : 2
  const q3Score = s.q3 === true ? 10 : 2
  const q4Score = s.q4 === true ? 10 : 0
  const sub = {
    seguimiento: Math.round((v2Score + q3Score) / 2),
    priorizacion: v2Score,
    preparacion: q3Score,
    reporte: q4Score,
  }
  const total = Math.round((sub.seguimiento + sub.priorizacion + sub.preparacion + sub.reporte) / 40 * 100)
  const cuello = (Object.entries(sub) as [string, number][]).sort((a, b) => a[1] - b[1])[0][0]

  const fortalezas = Object.entries(FORTALEZAS)
    .map(([k, v]) => ({ cat: k, texto: v, score: sub[k as keyof typeof sub] }))
    .sort((a, b) => b.score - a.score)
  const debilidades = Object.entries(DEBILIDADES)
    .map(([k, v]) => ({ cat: k, texto: v, score: sub[k as keyof typeof sub] }))
    .sort((a, b) => a.score - b.score)

  const maxwell = rawScore >= 5
    ? '"Si llevas tiempo haciendo lo mismo y los resultados no cambian, el problema no es el mercado. No son tus clientes. Eres tú — y la forma en que trabajas."'
    : rawScore >= 3
    ? '"Trabajar duro en lo incorrecto no te lleva más lejos. Te deja más cansado en el mismo lugar."'
    : '"El vendedor que mide lo que hace, mejora. El que no lo mide, solo envejece dentro del negocio."'

  return {
    total,
    sub,
    cuello,
    cuelloLabel: cuello.charAt(0).toUpperCase() + cuello.slice(1),
    cuelloTexto: CUELLO_TEXTO[cuello],
    perdidaMensual,
    perdida90: perdidaMensual * 3,
    perdidaAnual: perdidaMensual * 12,
    fortalezas,
    debilidades,
    recomendaciones: RECOMENDACIONES[cuello],
    nivelColor: rawScore <= 1 ? '#10b981' : rawScore <= 3 ? '#f59e0b' : '#ef4444',
    maxwell,
    rawScore,
    suenoTextos: s.sueno ? (SUENO_DATA[s.sueno] ?? SUENO_DATA.libertad) : null,
  }
}

export function calcular90dias(s: Selecciones, perdidaMensual: number): string[] {
  const lineas: string[] = []
  const p90 = perdidaMensual * 3
  if (p90 > 0) lineas.push(`Pierdes $${p90.toLocaleString('en-US')} USD en prospectos que se enfrían solos — sin sistema que los reactive.`)
  if (s.q3 === false)
    lineas.push('Sigues improvisando ante el "lo pienso" — esos leads terminan comprándole a quien sí tiene protocolo.')
  else
    lineas.push('Tu protocolo existe, pero sin alertas automáticas el seguimiento puede llegar tarde. Y tarde en ventas es peor que nunca.')
  if (s.q4 === false)
    lineas.push('No mides tu tasa de cierre. Lo que no se mide, no mejora — y lo que no mejora, se estanca.')
  else
    lineas.push('Conoces tu tasa — ventaja real. Pero sin sistema de priorización, la velocidad de cierre sigue siendo tu freno.')
  if ((s.v2 ?? 0) >= 5) lineas.push(`Tienes ${s.v2} prospectos esperando más de 7 días. Cada día adicional reduce tu probabilidad de cierre un 10%.`)
  return lineas.slice(0, 3)
}

export const SESSION_KEY = 'cbc_diagnostico_v1'
