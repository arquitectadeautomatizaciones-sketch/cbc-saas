import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resend } from '@/lib/resend'

const FROM_BIENVENIDA = process.env.RESEND_FROM_EMAIL ?? 'CBC <onboarding@resend.dev>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    // Get name from request body or fall back to user metadata
    const body = await req.json().catch(() => ({}))
    const nombre: string = body.nombre ?? user.user_metadata?.nombre ?? 'crack'

    await resend.emails.send({
      from: FROM_BIENVENIDA,
      to: user.email!,
      subject: 'Ya tienes acceso — esto es lo que sigue',
      html: emailBienvenida(nombre, APP_URL),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[emails/bienvenida]', err)
    return NextResponse.json({ error: 'Error al enviar email' }, { status: 500 })
  }
}

function emailBienvenida(nombre: string, appUrl: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:system-ui,-apple-system,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E8;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:white;border-radius:20px;overflow:hidden">

        <!-- Header -->
        <tr>
          <td style="background:#1A4A44;padding:28px 32px;text-align:center">
            <p style="margin:0;color:white;font-size:20px;font-weight:700;letter-spacing:-0.3px">
              CBC™
            </p>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:12px;letter-spacing:0.05em;text-transform:uppercase">
              Cierre Bajo Control
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 32px">
            <p style="margin:0 0 20px;font-size:17px;color:#1f2937;line-height:1.6">
              Hola <strong>${nombre}</strong>, tu sistema está activo.
            </p>

            <p style="margin:0 0 20px;font-size:16px;color:#374151;line-height:1.7">
              Tienes <strong>7 días para vivirlo completo sin costo.</strong>
            </p>

            <p style="margin:0 0 8px;font-size:16px;color:#374151;line-height:1.7">
              El primer paso: carga tus primeros 3 prospectos.
            </p>
            <p style="margin:0 0 28px;font-size:16px;color:#374151;line-height:1.7">
              Con eso el sistema empieza a trabajar por ti.
            </p>

            <!-- CTA Button -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-bottom:28px">
                  <a href="${appUrl}/dashboard"
                     style="display:inline-block;background:#1A4A44;color:white;text-decoration:none;font-size:16px;font-weight:700;padding:16px 36px;border-radius:12px">
                    Ir a mi dashboard
                  </a>
                </td>
              </tr>
            </table>

            <!-- Divider -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
              <tr><td style="height:1px;background:#f3f4f6"></td></tr>
            </table>

            <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.7">
              Cualquier duda — responde este email.<br>
              Nuestro equipo está contigo desde hoy.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F5F0E8;padding:20px 32px;text-align:center">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6">
              Cierre Bajo Control™ · $9.90/mes después de tu prueba gratuita<br>
              <a href="${appUrl}/configuracion" style="color:#4ECDC4;text-decoration:none">
                Gestionar suscripción
              </a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
