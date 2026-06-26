import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const sig = req.headers['stripe-signature']
  const chunks = []

  await new Promise((resolve, reject) => {
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', resolve)
    req.on('error', reject)
  })

  const buf = Buffer.concat(chunks)

  let event
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return res.status(400).json({ error: `Webhook error: ${err.message}` })
  }

  const obj = event.data.object
  console.log('Webhook event:', event.type)

  try {
    if (event.type === 'checkout.session.completed') {
      const userId = obj.metadata?.userId
      console.log('Checkout completed for userId:', userId)
      if (userId) {
        const { error } = await supabase.from('profiles').upsert({
          id: userId,
          stripe_customer_id: obj.customer,
          subscription_status: 'active',
          is_premium: true
        })
        if (error) console.error('Supabase error:', error)
      }
    }

    if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
      const status = obj.status
      const isActive = status === 'active' || status === 'trialing'
      await supabase.from('profiles')
        .update({ subscription_status: status, is_premium: isActive })
        .eq('stripe_customer_id', obj.customer)
    }
  } catch (err) {
    console.error('Handler error:', err)
  }

  res.status(200).json({ received: true })
}
