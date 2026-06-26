export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key'
export const PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID || 'price_your_id'

export async function createCheckoutSession(userId, email) {
  const res = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, email, priceId: PRICE_ID })
  })
  const data = await res.json()
  return data
}

export async function createPortalSession(customerId) {
  const res = await fetch('/api/create-portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerId })
  })
  const data = await res.json()
  return data
}
