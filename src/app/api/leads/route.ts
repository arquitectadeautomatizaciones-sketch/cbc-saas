import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend } from '@/lib/resend'

// Extract the email address from the env var (e.g. "CBC <hola@dominio.com>" → "hola@dominio.com")
const _baseFrom = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
const _match = _baseFrom.match(/<(.+)>/)
const _emailAddr = _match ? _match[1] : _baseFrom
const FROM_DIANA = `Diana de CBC™ <${_emailAddr}>`
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.arquitectadeautomatizaciones.com'

export async function POST(req: NextRequest) {
  const { email, nombre, score, sub_scores, cuello_de_botella, respuestas } = await req.json()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }

  const nombreGuardado = (typeof nombre === 'string' && nombre.trim()) ? nombre.trim() : null

  const { error } = await supabaseAdmin
    .from('leads_landing')
    .upsert(
      { email, nombre: nombreGuardado, score, sub_scores, cuello_de_botella, respuestas },
      { onConflict: 'email' },
    )

  if (error) {
    console.error('[leads_landing]', error.message)
  }

  // Fire-and-forget — don't block the user if email fails
  resend.emails
    .send({
      from: FROM_DIANA,
      to: email,
      subject: nombreGuardado ? `${nombreGuardado.split(' ')[0]}, ya sabemos quién es el ladrón 🔍` : 'Ya sabemos quién es el ladrón 🔍',
      html: emailDiagnostico(APP_URL, nombreGuardado),
    })
    .catch((err: unknown) => console.error('[email/diagnostico]', err))

  return NextResponse.json({ ok: true })
}

function emailDiagnostico(appUrl: string, nombre: string | null): string {
  const registerUrl = `${appUrl}/register`
  const saludo = nombre ? `Hola ${nombre},` : 'Hola,'

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Tu diagnóstico de pipeline</title>
</head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:system-ui,-apple-system,sans-serif">
  <span style="display:none;font-size:1px;color:#F5F0E8;max-height:0;max-width:0;opacity:0;overflow:hidden;">hola, esto es lo que encontramos en tus números 👀</span>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E8;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06)">

        <!-- Header -->
        <tr>
          <td style="background:#1A4A44;padding:28px 32px;text-align:center">
            <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px">CBC™</p>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.55);font-size:11px;letter-spacing:0.08em;text-transform:uppercase">Cierre Bajo Control</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 32px 28px">

            <p style="margin:0 0 20px;font-size:17px;color:#111827;line-height:1.65">
              ${saludo}
            </p>

            <p style="margin:0 0 20px;font-size:16px;color:#374151;line-height:1.75">
              Ya viste tu diagnóstico. Ya sabes qué está frenando tus comisiones. 👀
            </p>

            <p style="margin:0 0 20px;font-size:16px;color:#374151;line-height:1.75">
              El problema no es tu talento para vender. Es que estás haciendo
              seguimiento sin el sistema que convierte esos prospectos en cierres.
            </p>

            <p style="margin:0 0 28px;font-size:16px;color:#374151;line-height:1.75">
              Eso es exactamente lo que resuelve CBC™.
            </p>

            <!-- Feature list -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#F5F0E8;border-radius:12px;padding:20px 24px;margin-bottom:28px">
              <tr>
                <td>
                  <p style="margin:0 0 10px;font-size:15px;color:#374151;line-height:1.7">
                    Registra tus prospectos, deja que el semáforo te diga a quién
                    contactar hoy, recibe el mensaje de seguimiento ya redactado,
                    y entra a cada reunión con los datos listos para tu jefe —
                    <strong>todo en un solo lugar.</strong>
                  </p>
                  <p style="margin:0;font-size:15px;color:#374151;line-height:1.7">
                    Sin improvisar. Sin empezar desde cero cada semana.
                  </p>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#6b7280;text-align:center;letter-spacing:0.04em;text-transform:uppercase">
              👇 Empieza a resolverlo hoy
            </p>

            <!-- CTA Button -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:12px 0 32px">
                  <a href="${registerUrl}"
                     style="display:inline-block;background:#4ECDC4;color:#1A4A44;text-decoration:none;font-size:17px;font-weight:700;padding:18px 40px;border-radius:12px;letter-spacing:-0.2px">
                    Probar CBC™ gratis →
                  </a>
                </td>
              </tr>
            </table>

            <!-- Divider -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
              <tr><td style="height:1px;background:#f3f4f6"></td></tr>
            </table>

            <p style="margin:0;font-size:15px;color:#374151;line-height:1.75">
              Tu diagnóstico ya te dijo qué cambiar. CBC™ es el sistema para ejecutarlo.
            </p>

            <p style="margin:20px 0 0;font-size:15px;color:#374151;line-height:1.7">
              Diana · CBC™
            </p>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F5F0E8;padding:20px 32px;text-align:center">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6">
              Cierre Bajo Control™ · $9.90/mes después de tu prueba gratuita<br>
              Recibiste este email porque dejaste tu correo en el diagnóstico de CBC™.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
