import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { anthropic, SOFIA_MODEL } from '@/lib/claude'

// Called by n8n every morning at 8am
// Authorization: Bearer CBC_API_SECRET
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CBC_API_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const hoy = new Date().toISOString().split('T')[0]

  // Fetch all pending follow-ups due today or earlier
  const { data: seguimientos, error } = await supabaseAdmin
    .from('seguimientos_programados')
    .select(`
      id,
      tipo,
      prospecto_id,
      user_id,
      prospectos (
        nombre,
        empresa,
        email,
        sector,
        notas
      ),
      users (
        nombre,
        email
      )
    `)
    .eq('estado', 'pendiente')
    .lte('fecha_envio', hoy)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!seguimientos || seguimientos.length === 0) {
    return NextResponse.json({ enviados: 0, detalle: [] })
  }

  const enviados: string[] = []
  const errores: string[] = []

  for (const seg of seguimientos) {
    const prospecto = seg.prospectos as {
      nombre: string; empresa: string; email: string | null
      sector: string | null; notas: string | null
    } | null
    const vendedor = seg.users as { nombre: string; email: string } | null

    if (!prospecto?.email) {
      errores.push(`${seg.id}: prospecto sin email`)
      continue
    }

    try {
      // Generate personalized message with Claude
      const mensaje = await generarMensaje({
        tipo: seg.tipo as 'dia_1' | 'dia_3' | 'dia_7',
        prospectoNombre: prospecto.nombre,
        empresa: prospecto.empresa,
        sector: prospecto.sector ?? '',
        notas: prospecto.notas ?? '',
        vendedorNombre: vendedor?.nombre ?? 'El equipo',
      })

      const asunto = asuntoPorTipo(seg.tipo, prospecto.nombre)

      await resend.emails.send({
        from: FROM_EMAIL,
        to: prospecto.email,
        subject: asunto,
        html: emailSeguimiento(mensaje, prospecto.nombre),
      })

      // Mark as sent
      await supabaseAdmin
        .from('seguimientos_programados')
        .update({ estado: 'enviado', enviado_at: new Date().toISOString() })
        .eq('id', seg.id)

      enviados.push(`${seg.id}:${seg.tipo}:${prospecto.email}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errores.push(`${seg.id}: ${msg}`)
    }
  }

  return NextResponse.json({
    enviados: enviados.length,
    detalle: enviados,
    errores,
    fecha: hoy,
  })
}

async function generarMensaje(params: {
  tipo: 'dia_1' | 'dia_3' | 'dia_7'
  prospectoNombre: string
  empresa: string
  sector: string
  notas: string
  vendedorNombre: string
}): Promise<string> {
  const contextoTipo = {
    dia_1: 'Han pasado 24 horas desde que enviaste la propuesta. El objetivo es confirmar que llegó y abrir una conversación natural.',
    dia_3: 'Han pasado 3 días. El objetivo es agregar valor o resolver una duda que puede estar frenando la decisión.',
    dia_7: 'Han pasado 7 días. El objetivo es generar urgencia genuina y mover la decisión — sin presionar, con contexto.',
  }[params.tipo]

  const prompt = `Eres un vendedor B2B experto en LATAM. Escribe un mensaje de seguimiento post-propuesta para enviar por email.

Datos del prospecto:
- Nombre: ${params.prospectoNombre}
- Empresa: ${params.empresa}
- Sector: ${params.sector || 'no especificado'}
- Notas del vendedor: ${params.notas || 'ninguna'}

Vendedor que firma: ${params.vendedorNombre}

Contexto del seguimiento: ${contextoTipo}

Reglas:
- Máximo 4 líneas de texto
- Tono directo, cálido, humano — nada de "espero que se encuentre bien"
- No suenas a plantilla
- Termina con UNA pregunta concreta o una propuesta de siguiente paso
- Sin asunto (solo el cuerpo del mensaje)
- Sin firmas elaboradas — solo el nombre del vendedor al final

Escribe solo el cuerpo del mensaje, sin explicaciones adicionales.`

  const response = await anthropic.messages.create({
    model: SOFIA_MODEL,
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  })

  return response.content[0].type === 'text' ? response.content[0].text.trim() : ''
}

function asuntoPorTipo(tipo: string, nombre: string): string {
  const asuntos: Record<string, string> = {
    dia_1: `${nombre}, ¿te llegó la propuesta?`,
    dia_3: `Una idea para ${nombre}`,
    dia_7: `${nombre} — ¿cerramos esta semana?`,
  }
  return asuntos[tipo] ?? `Seguimiento para ${nombre}`
}

function emailSeguimiento(cuerpo: string, nombre: string): string {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://cierrebajocontrol.com'
  const lineas = cuerpo.split('\n').filter(Boolean)

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:system-ui,-apple-system,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E8;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:white;border-radius:20px;overflow:hidden">

        <tr>
          <td style="background:#1A4A44;padding:24px 32px;text-align:center">
            <p style="margin:0;color:white;font-size:18px;font-weight:700">CBC™</p>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:11px;letter-spacing:0.05em;text-transform:uppercase">Cierre Bajo Control</p>
          </td>
        </tr>

        <tr>
          <td style="padding:36px 32px">
            ${lineas.map(linea =>
              `<p style="margin:0 0 16px;font-size:16px;color:#374151;line-height:1.7">${linea}</p>`
            ).join('\n            ')}
          </td>
        </tr>

        <tr>
          <td style="background:#F5F0E8;padding:16px 32px;text-align:center">
            <p style="margin:0;font-size:11px;color:#9ca3af">
              <a href="${APP_URL}/configuracion" style="color:#4ECDC4;text-decoration:none">Gestionar notificaciones</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
