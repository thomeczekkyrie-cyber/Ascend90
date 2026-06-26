import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { customerId } = req.body
  if (!customerId) return res.status(400).json({ error: 'Missing customerId' })
  try {
    const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: 'active', limit: 1 })
    if (!subscriptions.data.length) return res.status(404).json({ error: 'No active subscription found' })
    const updated = await stripe.subscriptions.update(subscriptions.data[0].id, { cancel_at_period_end: true })
    res.json({ success: true, subscription: updated })
  } catch (err) {
    console.error('Cancel error:', err)
    res.status(500).json({ error: err.message })
  }
}
