import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[webhook] Invalid signature', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        await supabaseAdmin
          .from('users')
          .update({
            estado_suscripcion: 'activa',
            stripe_subscription_id: subscriptionId,
            suscripcion_activa_desde: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId)
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string

        const estado = sub.status === 'active' ? 'activa'
          : sub.status === 'past_due' ? 'suspendida'
          : sub.status === 'canceled' ? 'cancelada'
          : null

        if (estado) {
          await supabaseAdmin
            .from('users')
            .update({
              estado_suscripcion: estado,
              suscripcion_cancela_en: sub.cancel_at
                ? new Date(sub.cancel_at * 1000).toISOString()
                : null,
            })
            .eq('stripe_customer_id', customerId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await supabaseAdmin
          .from('users')
          .update({ estado_suscripcion: 'cancelada', stripe_subscription_id: null })
          .eq('stripe_customer_id', sub.customer as string)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await supabaseAdmin
          .from('users')
          .update({ estado_suscripcion: 'suspendida' })
          .eq('stripe_customer_id', invoice.customer as string)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[webhook] Handler error', err)
    await supabaseAdmin.from('logs_sistema').insert({
      evento: 'stripe_webhook_error',
      payload: { event_type: event.type },
      error: String(err),
    })
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }
}
