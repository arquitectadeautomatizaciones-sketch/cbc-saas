import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/claude'

type TipoMensaje =
  | 'primer_mensaje'
  | 'post_reunion'
  | 'seguimiento_1'
  | 'seguimiento_2'
  | 'ultimo_intento'
  | 'bienvenida'
  | 'dejar_puerta'

function detectarTipo(prospecto: {
  ultimo_contacto: string | null
  estado: string
  dias_sin_contacto: number
}, interacciones: { canal: string; fecha: string }[]): TipoMensaje {
  if (prospecto.estado === 'cerrado_ganado') return 'bienvenida'
  if (prospecto.estado === 'cerrado_perdido') return 'dejar_puerta'
  if (!prospecto.ultimo_contacto) return 'primer_mensaje'

  // Check for reunion in the last 2 hours
  const dosHorasAtras = new Date(Date.now() - 2 * 60 * 60 * 1000)
  const reunionReciente = interacciones.some(
    (i) => i.canal === 'reunion' && new Date(i.fecha) >= dosHorasAtras
  )
  if (reunionReciente) return 'post_reunion'

  const dias = prospecto.dias_sin_contacto
  if (dias >= 1 && dias <= 3) return 'seguimiento_1'
  if (dias >= 4 && dias <= 7) return 'seguimiento_2'
  if (dias >= 8) return 'ultimo_intento'

  return 'primer_mensaje'
}

const TIPO_LABEL: Record<TipoMensaje, string> = {
  primer_mensaje:  '✍️ Primer mensaje',
  post_reunion:    '📝 Email post-reunión',
  seguimiento_1:   '🔄 Seguimiento 1',
  seguimiento_2:   '🔄 Seguimiento 2',
  ultimo_intento:  '🚪 Último intento',
  bienvenida:      '🎉 Email de bienvenida',
  dejar_puerta:    '🤝 Dejar la puerta abierta',
}

function buildPrompt(tipo: TipoMensaje, p: {
  nombre: string
  empresa: string | null
  cargo: string | null
  dolor_principal: string | null
  perfil_disc: string | null
  estado: string
  dias_sin_contacto: number
  notas: string | null
  proximo_paso: string | null
}, interacciones: { fecha: string; canal: string; resultado: string | null }[]): string {
  const historial = interacciones
    .slice(0, 5)
    .map((i) => `- ${new Date(i.fecha).toLocaleDateString('es-MX')}: ${i.canal}${i.resultado ? ` — ${i.resultado}` : ''}`)
    .join('\n') || 'Sin interacciones registradas.'

  const contexto = `PROSPECTO: ${p.nombre}${p.empresa ? ` | ${p.empresa}` : ''}${p.cargo ? ` | ${p.cargo}` : ''}
DOLOR PRINCIPAL: ${p.dolor_principal || 'No registrado'}
PERFIL DISC: ${p.perfil_disc || 'No detectado'}
ESTADO: ${p.estado}
DÍAS SIN CONTACTO: ${p.dias_sin_contacto}
PRÓXIMO PASO REGISTRADO: ${p.proximo_paso || 'Ninguno'}
NOTAS: ${p.notas || 'Ninguna'}
HISTORIAL RECIENTE:
${historial}`

  const instrucciones: Record<TipoMensaje, string> = {
    primer_mensaje: `Nunca hemos hablado. Escribe el PRIMER mensaje de contacto. Tono: directo, cálido, sin sonar a spam. Enfócate en el dolor que registramos. Sin presentación genérica — abre con algo específico a su situación. Máximo 80 palabras.`,
    post_reunion: `Acabamos de tener una reunión (hace menos de 2 horas). Escribe un email post-reunión que: (1) agradezca el tiempo, (2) resuma el problema principal que mencionó en sus propias palabras, (3) deje claro el siguiente paso acordado. Tono profesional y cálido. Máximo 120 palabras.`,
    seguimiento_1: `Han pasado 1-3 días sin respuesta después del primer contacto. Escribe un seguimiento corto que: agregue valor (insight o pregunta relevante a su dolor), no suene a "¿recibiste mi mensaje?". Sin ser insistente. Máximo 60 palabras.`,
    seguimiento_2: `Han pasado 4-7 días sin respuesta. Segundo seguimiento. Cambia el ángulo — menciona algo nuevo: un resultado de cliente similar, una pregunta diferente, o señala el costo de no actuar. Sin mencionar que es el segundo intento. Máximo 70 palabras.`,
    ultimo_intento: `Más de 8 días sin respuesta. Escribe un mensaje de último intento tipo "break-up email". Directo, sin presión, deja la puerta abierta. La estructura clásica: entiendo que quizás cambió algo, si no es el momento lo respeto, aquí quedo si cambia. Máximo 60 palabras.`,
    bienvenida: `El prospecto acaba de cerrar — ya es cliente. Escribe un email de bienvenida cálido que: celebre la decisión, confirme el primer paso concreto, haga sentir que tomó la decisión correcta. Tono: entusiasta pero profesional. Máximo 100 palabras.`,
    dejar_puerta: `El prospecto no cerró. Escribe un mensaje para dejar la puerta abierta sin resentimiento. Que sepa que la relación sigue, que puede volver cuando esté listo, y que lo recuerdas por su dolor específico. Sin drama, sin insistencia. Máximo 70 palabras.`,
  }

  return `Eres un experto en comunicación B2B para Latinoamérica. Escribe exactamente el mensaje indicado — texto listo para enviar, sin corchetes, sin instrucciones, sin placeholder, sin introducción tuya.

CONTEXTO DEL PROSPECTO:
${contexto}

TIPO DE MENSAJE: ${TIPO_LABEL[tipo]}
INSTRUCCIÓN: ${instrucciones[tipo]}

REGLAS:
- Escribe SOLO el texto del mensaje — nada antes, nada después
- Sin "[nombre]" ni "[empresa]" — usa los datos reales
- Sin títulos ni encabezados
- Tono conversacional, de igual a igual
- Usa *negritas* de WhatsApp solo si el canal es WhatsApp/informal; email: texto plano`

}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { prospecto_id, tipo_forzado } = await req.json()
  if (!prospecto_id) return NextResponse.json({ error: 'Falta prospecto_id' }, { status: 400 })

  // Fetch prospect + interactions
  const { data: prospecto, error } = await supabase
    .from('prospectos')
    .select('*, interacciones(*)')
    .eq('id', prospecto_id)
    .single()

  if (error || !prospecto) return NextResponse.json({ error: 'Prospecto no encontrado' }, { status: 404 })

  const interacciones = (prospecto.interacciones ?? []).sort(
    (a: { fecha: string }, b: { fecha: string }) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  )

  const tipo: TipoMensaje = tipo_forzado ?? detectarTipo(prospecto, interacciones)

  const prompt = buildPrompt(tipo, prospecto, interacciones)

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })

    const mensaje = (message.content[0] as { text: string }).text?.trim() ?? ''
    return NextResponse.json({ mensaje, tipo, tipo_label: TIPO_LABEL[tipo] })
  } catch {
    return NextResponse.json({ error: 'Error generando el mensaje. Intenta de nuevo.' }, { status: 500 })
  }
}
