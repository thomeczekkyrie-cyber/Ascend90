import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { customerId } = req.body
  if (!customerId) return res.status(400).json({ error: 'Missing customerId' })
  try {
    const subscriptions = await stripe.subscriptions.list({ customer: customerId, limit: 1 })
    if (!subscriptions.data.length) return res.json({ subscription: null })
    res.json({ subscription: subscriptions.data[0] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
