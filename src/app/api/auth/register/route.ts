import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { addDays } from 'date-fns'

export async function POST(req: NextRequest) {
  try {
    const { nombre, email, password } = await req.json()

    if (!nombre || !email || !password) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    // 1. Create auth user via admin — triggers confirmation email if Supabase SMTP is configured
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { nombre },
    })

    if (authError) {
      const code = (authError as { code?: string }).code
      const msg = authError.message.toLowerCase()
      if (code === 'email_exists' || code === 'user_already_exists' || msg.includes('already')) {
        return NextResponse.json({ error: 'Este email ya está registrado' }, { status: 409 })
      }
      throw authError
    }

    const now = new Date()
    const trialEnd = addDays(now, 7)

    // 2. Create user profile with 7-day trial
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        auth_user_id: authData.user.id,
        nombre,
        email,
        estado_suscripcion: 'trial',
        trial_started_at: now.toISOString(),
        trial_ends_at: trialEnd.toISOString(),
      })
      .select()
      .single()

    if (userError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw userError
    }

    // 3. Generate and send confirmation email via Resend (since admin.createUser doesn't trigger it)
    try {
      const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
        type: 'signup',
        email,
        password,
        options: { data: { nombre } },
      })

      if (linkData?.properties?.action_link) {
        const { resend } = await import('@/lib/resend')
        const FROM = process.env.RESEND_FROM_EMAIL ?? 'CBC <onboarding@resend.dev>'
        const confirmUrl = linkData.properties.action_link

        await resend.emails.send({
          from: FROM,
          to: email,
          subject: 'Confirma tu cuenta en Cierre Bajo Control™',
          html: emailConfirmacion(nombre, confirmUrl),
        })
      }
    } catch (emailErr) {
      // Non-fatal: user is created, email just didn't send
      console.error('[register] Error al enviar email de confirmación:', emailErr)
    }

    return NextResponse.json({ user }, { status: 201 })
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

function emailConfirmacion(nombre: string, confirmUrl: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#F5F0E8;font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F0E8;padding:48px 16px">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:20px;overflow:hidden">

          <tr>
            <td style="background-color:#1A4A44;padding:32px;text-align:center">
              <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px">CBC™</p>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.55);font-size:11px;letter-spacing:0.1em;text-transform:uppercase">Cierre Bajo Control</p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 36px 32px">
              <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1A4A44;line-height:1.3">
                Hola ${nombre}, un paso más.
              </p>
              <p style="margin:0 0 12px;font-size:16px;color:#374151;line-height:1.7">
                Confirma tu email para activar tu prueba gratuita de 7 días.
              </p>
              <p style="margin:0 0 32px;font-size:16px;color:#374151;line-height:1.7">
                Sin tarjeta de crédito. Sin compromisos.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:32px">
                    <a href="${confirmUrl}"
                       style="display:inline-block;background-color:#1A4A44;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:18px 40px;border-radius:12px">
                      Confirmar mi cuenta
                    </a>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
                <tr><td style="height:1px;background-color:#f3f4f6"></td></tr>
              </table>

              <p style="margin:0 0 8px;font-size:14px;color:#9ca3af;line-height:1.6">
                Si el botón no funciona, copia y pega este enlace:
              </p>
              <p style="margin:0;font-size:13px;color:#4ECDC4;word-break:break-all;line-height:1.5">
                ${confirmUrl}
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color:#F5F0E8;padding:24px 36px;text-align:center">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6">
                Si no creaste una cuenta en CBC, puedes ignorar este email.<br>
                Cierre Bajo Control™ · $9.90/mes después de tu prueba gratuita
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
