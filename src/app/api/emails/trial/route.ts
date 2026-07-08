import { NextRequest, NextResponse } from 'next/server'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { supabaseAdmin } from '@/lib/supabase/admin'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.arquitectadeautomatizaciones.com'

// Called by n8n every morning to send trial day-1, day-5 and day-7 emails
// Authorization: Bearer CBC_API_SECRET
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CBC_API_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const hoy = now.toISOString().split('T')[0]

  // Día 1: trial_started_at = ayer (llevan exactamente 1 día)
  const ayerFecha = new Date(now)
  ayerFecha.setDate(ayerFecha.getDate() - 1)
  const ayer = ayerFecha.toISOString().split('T')[0]

  // Día 5: trial_ends_at = pasado mañana (quedan 2 días)
  const dia5Fecha = new Date(now)
  dia5Fecha.setDate(dia5Fecha.getDate() + 2)
  const dia5 = dia5Fecha.toISOString().split('T')[0]

  // Día 7: trial_ends_at = mañana (último día)
  const dia7Fecha = new Date(now)
  dia7Fecha.setDate(dia7Fecha.getDate() + 1)
  const dia7 = dia7Fecha.toISOString().split('T')[0]

  const [{ data: usuariosDia1 }, { data: usuariosDia5 }, { data: usuariosDia7 }] = await Promise.all([
    supabaseAdmin
      .from('users')
      .select('email, nombre, sofia_proactive_sent')
      .eq('estado_suscripcion', 'trial')
      .gte('trial_started_at', `${ayer}T00:00:00`)
      .lte('trial_started_at', `${ayer}T23:59:59`),
    supabaseAdmin
      .from('users')
      .select('email, nombre, sofia_proactive_sent')
      .eq('estado_suscripcion', 'trial')
      .gte('trial_ends_at', `${dia5}T00:00:00`)
      .lte('trial_ends_at', `${dia5}T23:59:59`),
    supabaseAdmin
      .from('users')
      .select('email, nombre, sofia_proactive_sent')
      .eq('estado_suscripcion', 'trial')
      .gte('trial_ends_at', `${dia7}T00:00:00`)
      .lte('trial_ends_at', `${dia7}T23:59:59`),
  ])

  const enviados: string[] = []

  for (const u of usuariosDia1 ?? []) {
    if (u.sofia_proactive_sent?.dia_1) continue
    await resend.emails.send({
      from: FROM_EMAIL,
      to: u.email,
      subject: `${u.nombre.split(' ')[0]}, ¿ya sabes a quién llamar hoy?`,
      html: emailDia1(u.nombre.split(' ')[0]),
    })
    await supabaseAdmin
      .from('users')
      .update({ sofia_proactive_sent: { ...u.sofia_proactive_sent, dia_1: true } })
      .eq('email', u.email)
    enviados.push(`dia1:${u.email}`)
  }

  for (const u of usuariosDia5 ?? []) {
    if (u.sofia_proactive_sent?.dia_5) continue
    await resend.emails.send({
      from: FROM_EMAIL,
      to: u.email,
      subject: '⏰ Te quedan 2 días de prueba en CBC',
      html: emailDia5(u.nombre.split(' ')[0]),
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
      html: emailDia7(u.nombre.split(' ')[0]),
    })
    await supabaseAdmin
      .from('users')
      .update({ sofia_proactive_sent: { ...u.sofia_proactive_sent, dia_7: true } })
      .eq('email', u.email)
    enviados.push(`dia7:${u.email}`)
  }

  return NextResponse.json({ enviados, fecha: hoy })
}

function emailBase(contenido: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:-apple-system,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:40px auto;padding:0 16px 40px;">
    <div style="background:#1A4A44;border-radius:14px 14px 0 0;padding:20px 32px;display:flex;align-items:center;justify-content:space-between;">
      <div>
        <span style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-0.5px;">CBC™</span><br>
        <span style="color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:0.06em;text-transform:uppercase;">Cierre Bajo Control</span>
      </div>
    </div>
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 14px 14px;padding:40px 36px 36px;">
      ${contenido}
    </div>
    <p style="text-align:center;margin-top:20px;font-size:11px;color:#9ca3af;line-height:1.6;">
      CBC · Cierre Bajo Control™<br>
      Recibiste este email porque estás en tu período de prueba gratuito.
    </p>
  </div>
</body>
</html>`
}

function emailDia1(nombre: string): string {
  return emailBase(`
    <p style="font-size:22px;font-weight:700;color:#1A4A44;margin:0 0 6px;letter-spacing:-0.3px;">${nombre}, ¿ya sabes a quién llamar hoy?</p>
    <p style="font-size:15px;color:#6b7280;margin:0 0 28px;">Ya estás dentro de CBC.</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 28px;">
    <p style="font-size:15px;color:#1f2937;line-height:1.75;margin:0 0 20px;">Una sola cosa para hacer ahora: <strong style="color:#1A4A44;">carga tu primer prospecto.</strong></p>
    <p style="font-size:15px;color:#1f2937;line-height:1.75;margin:0 0 20px;">No tienes que configurar nada más. Solo eso.</p>
    <p style="font-size:15px;color:#1f2937;line-height:1.75;margin:0 0 20px;">Cuando lo hagas, Sofía te dice exactamente qué hacer con él — cuándo llamar, qué decirle y cómo no perder ese lead en el silencio.</p>
    <p style="font-size:15px;color:#1f2937;line-height:1.75;margin:0 0 32px;">Eso es todo. Un prospecto. Ahora.</p>
    <div style="text-align:center;margin:0 0 32px;">
      <a href="${SITE_URL}/prospectos"
         style="display:inline-block;background:#1A4A44;color:#fff;font-size:15px;font-weight:700;padding:15px 34px;border-radius:12px;text-decoration:none;letter-spacing:-0.1px;">
        Ir a CBC →
      </a>
    </div>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 20px;">
    <p style="font-size:14px;color:#6b7280;line-height:1.6;margin:0;">
      Hago fácil lo difícil.<br>
      <strong style="color:#1A4A44;font-size:15px;">Diana</strong>
    </p>
  `)
}

function emailDia5(nombre: string): string {
  return emailBase(`
    <h2 style="color:#1A4A44;margin:0 0 20px;font-size:20px;">Hola ${nombre} 👋</h2>
    <p style="color:#374151;line-height:1.7;margin:0 0 16px;font-size:15px;">
      Tu prueba gratuita termina en <strong>2 días</strong>. Si CBC te está ayudando a cerrar más ventas,
      es el momento de activar tu cuenta antes de que pierdas acceso a tu pipeline y a Sofía.
    </p>
    <p style="color:#374151;line-height:1.7;margin:0 0 32px;font-size:15px;">
      Solo <strong>$9.90/mes</strong>. Cancelas cuando quieras.
    </p>
    <div style="text-align:center;margin:0 0 32px;">
      <a href="${SITE_URL}/subscribe"
         style="display:inline-block;background:#4ECDC4;color:#1A4A44;font-size:15px;font-weight:700;padding:15px 34px;border-radius:12px;text-decoration:none;">
        Activar mi cuenta →
      </a>
    </div>
    <p style="color:#9ca3af;font-size:13px;text-align:center;margin:0;">
      Si decides no continuar, no hacemos nada. Tu cuenta se cierra sola al terminar el trial.
    </p>
  `)
}

function emailDia7(nombre: string): string {
  return emailBase(`
    <h2 style="color:#ef4444;margin:0 0 20px;font-size:20px;">Tu trial termina mañana ⚠️</h2>
    <p style="color:#374151;line-height:1.7;margin:0 0 16px;font-size:15px;">
      Hola ${nombre}, mañana se cierra tu acceso a CBC. Tu pipeline, tus prospectos y las conversaciones
      con Sofía quedan guardados — pero no podrás acceder sin una cuenta activa.
    </p>
    <p style="color:#374151;line-height:1.7;margin:0 0 32px;font-size:15px;">
      Activa hoy por <strong>$9.90/mes</strong> y sigue sin interrupciones.
    </p>
    <div style="text-align:center;">
      <a href="${SITE_URL}/subscribe"
         style="display:inline-block;background:#1A4A44;color:#fff;font-size:15px;font-weight:700;padding:15px 34px;border-radius:12px;text-decoration:none;">
        Activar ahora — $9.90/mes →
      </a>
    </div>
  `)
}
