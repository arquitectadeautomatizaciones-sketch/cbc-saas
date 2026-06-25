import { NextRequest, NextResponse } from 'next/server'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Called by n8n every morning to send trial day-5 and day-7 emails
// Authorization: Bearer CBC_API_SECRET
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CBC_API_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const hoy = now.toISOString().split('T')[0]

  // Find users whose trial_ends_at is 2 days away (day 5 of 7)
  const dia5Fecha = new Date(now)
  dia5Fecha.setDate(dia5Fecha.getDate() + 2)
  const dia5 = dia5Fecha.toISOString().split('T')[0]

  // Find users whose trial_ends_at is tomorrow (day 7)
  const dia7Fecha = new Date(now)
  dia7Fecha.setDate(dia7Fecha.getDate() + 1)
  const dia7 = dia7Fecha.toISOString().split('T')[0]

  const { data: usuariosDia5 } = await supabaseAdmin
    .from('users')
    .select('email, nombre, sofia_proactive_sent')
    .eq('estado_suscripcion', 'trial')
    .gte('trial_ends_at', `${dia5}T00:00:00`)
    .lt('trial_ends_at', `${dia5}T23:59:59`)

  const { data: usuariosDia7 } = await supabaseAdmin
    .from('users')
    .select('email, nombre, sofia_proactive_sent')
    .eq('estado_suscripcion', 'trial')
    .gte('trial_ends_at', `${dia7}T00:00:00`)
    .lt('trial_ends_at', `${dia7}T23:59:59`)

  const enviados: string[] = []

  for (const u of usuariosDia5 ?? []) {
    if (u.sofia_proactive_sent?.dia_5) continue
    await resend.emails.send({
      from: FROM_EMAIL,
      to: u.email,
      subject: '⏰ Te quedan 2 días de prueba en CBC',
      html: emailDia5(u.nombre),
    })
    await supabaseAdmin
      .from('users')
      .update({ sofia_proactive_sent: { ...u.sofia_proactive_sent, dia_5: true } })
      .eq('email', u.email)
    enviados.push(`dia5:${u.email}`)
  }

  for (const u of usuariosDia7 ?? []) {
    if (u.sofia_proactive_sent?.dia_7) continue
    await resend.emails.send({
      from: FROM_EMAIL,
      to: u.email,
      subject: '🚨 Tu trial de CBC termina mañana',
      html: emailDia7(u.nombre),
    })
    await supabaseAdmin
      .from('users')
      .update({ sofia_proactive_sent: { ...u.sofia_proactive_sent, dia_7: true } })
      .eq('email', u.email)
    enviados.push(`dia7:${u.email}`)
  }

  return NextResponse.json({ enviados, fecha: hoy })
}

function emailDia5(nombre: string): string {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background: #F5F0E8; padding: 32px; margin: 0;">
  <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px;">
    <div style="background: #1A4A44; color: white; text-align: center; padding: 20px; border-radius: 12px; margin-bottom: 32px;">
      <strong style="font-size: 20px;">CBC™</strong><br>
      <small style="opacity: 0.7;">Cierre Bajo Control</small>
    </div>
    <h2 style="color: #1A4A44; margin-top: 0;">Hola ${nombre} 👋</h2>
    <p style="color: #374151; line-height: 1.6;">
      Tu prueba gratuita termina en <strong>2 días</strong>. Si CBC te está ayudando a cerrar más ventas,
      es el momento de activar tu cuenta antes de que pierdas acceso a tu pipeline y a Sofía.
    </p>
    <p style="color: #374151; line-height: 1.6;">
      Solo <strong>$9.90/mes</strong>. Cancelas cuando quieras.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/subscribe"
         style="background: #4ECDC4; color: #1A4A44; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
        Activar mi cuenta →
      </a>
    </div>
    <p style="color: #9ca3af; font-size: 13px; text-align: center;">
      Si decides no continuar, no hacemos nada. Tu cuenta se cierra sola al terminar el trial.
    </p>
  </div>
</body>
</html>`
}

function emailDia7(nombre: string): string {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background: #F5F0E8; padding: 32px; margin: 0;">
  <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px;">
    <div style="background: #1A4A44; color: white; text-align: center; padding: 20px; border-radius: 12px; margin-bottom: 32px;">
      <strong style="font-size: 20px;">CBC™</strong><br>
      <small style="opacity: 0.7;">Cierre Bajo Control</small>
    </div>
    <h2 style="color: #ef4444; margin-top: 0;">Tu trial termina mañana ⚠️</h2>
    <p style="color: #374151; line-height: 1.6;">
      Hola ${nombre}, mañana se cierra tu acceso a CBC. Tu pipeline, tus prospectos y las conversaciones
      con Sofía quedan guardados — pero no podrás acceder sin una cuenta activa.
    </p>
    <p style="color: #374151; line-height: 1.6;">
      Activa hoy por <strong>$9.90/mes</strong> y sigue sin interrupciones.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/subscribe"
         style="background: #1A4A44; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
        Activar ahora — $9.90/mes →
      </a>
    </div>
  </div>
</body>
</html>`
}
