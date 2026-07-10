import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/claude'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { nombre, empresa, problema, resultado, inversion } = await req.json()
  if (!nombre || !problema || !resultado || !inversion) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const contexto = `CLIENTE: ${nombre}${empresa ? ` | EMPRESA: ${empresa}` : ''}
DOLOR QUE MENCIONA: ${problema}
LO QUE SUEÑA LOGRAR: ${resultado}
INVERSIÓN: ${inversion}`

  const promptCompleta = `Eres un experto en neuroventas B2B con 20 años cerrando negocios de alto valor en Latinoamérica. Tu especialidad: identificar el dolor real DETRÁS del dolor que el cliente menciona — y convertirlo en una propuesta que cierra sola. Conoces profundamente las técnicas de Jürgen Klaric.

${contexto}

Escribe una propuesta irrechazable de máximo 300 palabras aplicando estas 5 técnicas:
1) DOLOR INVERSO: Abre con el costo exacto en dinero o tiempo que está perdiendo HOY.
2) DOLOR DETRÁS DEL DOLOR: Habla del miedo real que no dice en voz alta. El que lo desvela a las 3 AM.
3) CÓDIGO REPTIL: Hazlo sentir que sin esta solución está en peligro real de quedar atrás de su competencia.
4) ROI EMOCIONAL + FINANCIERO: Muestra cuánto gana en dinero Y cómo se va a SENTIR.
5) URGENCIA REAL: Cierra con una razón genuina para decidir ahora.

REGLAS: Máximo 3 párrafos. Sin frases genéricas. Sin características — solo transformación con números. Tono: directo, cálido, de igual a igual. NUNCA suenes a vendedor.`

  const promptWhatsApp = `Eres un experto en neuroventas B2B para Latinoamérica. Genera un mensaje de WhatsApp de ventas usando los datos del cliente.

${contexto}

ESTRUCTURA INTERNA (no la escribas — solo úsala para guiarte):
1. Gancho: conecta con el dolor en 1-2 líneas, específico y directo
2. Tres resultados concretos con números o métricas, cada uno en su propia línea con ✅
3. Una prueba social: resultado real de cliente similar al sector de ${empresa || 'este cliente'} — 1 línea
4. Inversión: ${inversion} — directa, sin "solo", sin "tan solo", sin disculpas
5. Cierre: "¿Arrancamos esta semana o la siguiente?"

REGLAS CRÍTICAS:
- NO escribas ningún título, encabezado, ni etiqueta de sección (nada de "GANCHO:", "QUÉ INCLUYE:", "INVERSIÓN:", etc.)
- El resultado debe verse como un mensaje real de WhatsApp — fluido, no como un formulario
- Usa *negritas* de WhatsApp donde refuerce el impacto
- Sin introducción tuya antes del mensaje
- Máximo 130 palabras
- Solo el texto del mensaje, nada más`

  try {
    const [resCompleta, resWhatsApp] = await Promise.all([
      anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        messages: [{ role: 'user', content: promptCompleta }],
      }),
      anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        messages: [{ role: 'user', content: promptWhatsApp }],
      }),
    ])

    return NextResponse.json({
      completa: (resCompleta.content[0] as any).text?.trim() ?? '',
      whatsapp: (resWhatsApp.content[0] as any).text?.trim() ?? '',
    })
  } catch {
    return NextResponse.json({ error: 'Error generando la propuesta. Intenta de nuevo.' }, { status: 500 })
  }
}
