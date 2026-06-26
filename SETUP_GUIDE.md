# Ascend90 — Setup & Launch Guide

You have a fully-built React web app. Here's exactly how to get it live and taking payments in under 2 hours.

---

## What you're deploying

- **Frontend**: React + Vite (all pages, auth, free/premium gating)
- **Database + Auth**: Supabase (free tier handles thousands of users)
- **Payments**: Stripe (monthly subscriptions, $8/mo)
- **Hosting**: Vercel (free tier, custom domain ready)

---

## Step 1 — Set up Supabase (15 min)

1. Go to **supabase.com** → Create account → New project
   - Name it `ascend90`, pick a region close to your users (US East or West)
   - Save your database password somewhere safe

2. Once created, go to **Settings → API**
   - Copy your **Project URL** → this is `VITE_SUPABASE_URL`
   - Copy your **anon / public key** → this is `VITE_SUPABASE_ANON_KEY`
   - Copy your **service_role key** (keep this secret) → this is `SUPABASE_SERVICE_ROLE_KEY`

3. Go to **SQL Editor** → paste the entire contents of `supabase_schema.sql` → click Run
   - This creates all your tables, triggers, and security policies in one shot

4. Go to **Authentication → Settings**
   - Under "Site URL" put your Vercel URL (e.g. `https://ascend90.vercel.app`)
   - You can enable email confirmations or turn them off for easier testing

---

## Step 2 — Set up Stripe (20 min)

1. Go to **dashboard.stripe.com** → Create account

2. Go to **Products** → Add product
   - Name: "Ascend90 Premium"
   - Pricing: Recurring, $8/month
   - Save it, then click the price → copy the **Price ID** (starts with `price_`)
   - This is your `STRIPE_PRICE_ID`

3. Go to **Developers → API Keys**
   - Copy **Publishable key** → `VITE_STRIPE_PUBLISHABLE_KEY`
   - Copy **Secret key** → `STRIPE_SECRET_KEY`

4. Go to **Developers → Webhooks** → Add endpoint
   - URL: `https://your-vercel-domain.vercel.app/api/webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.deleted`
     - `customer.subscription.updated`
   - Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

> **Note**: Set up the webhook after you deploy to Vercel so you have your URL.

---

## Step 3 — Deploy to Vercel (10 min)

1. Go to **github.com** → New repository → name it `ascend90` → push the project folder

   ```bash
   cd ascend90
   git init
   git add .
   git commit -m "initial"
   git remote add origin https://github.com/YOUR_USERNAME/ascend90.git
   git push -u origin main
   ```

2. Go to **vercel.com** → New Project → Import your GitHub repo

3. In the Vercel dashboard, go to **Settings → Environment Variables** and add all of these:

   | Key | Value |
   |-----|-------|
   | `VITE_SUPABASE_URL` | from Supabase |
   | `VITE_SUPABASE_ANON_KEY` | from Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | from Supabase |
   | `VITE_STRIPE_PUBLISHABLE_KEY` | from Stripe |
   | `STRIPE_SECRET_KEY` | from Stripe |
   | `STRIPE_PRICE_ID` | from Stripe |
   | `STRIPE_WEBHOOK_SECRET` | from Stripe webhook |
   | `NEXT_PUBLIC_APP_URL` | your Vercel URL |

4. Click **Deploy** — Vercel builds and deploys automatically

5. Go back to Stripe → Webhooks → update the endpoint URL with your real Vercel domain

---

## Step 4 — Test everything (15 min)

1. Visit your live URL → click "Start free" → create an account
2. Confirm you can log in and see the dashboard
3. Go to Account → Upgrade → complete a test payment using Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: any future date
   - CVC: any 3 digits
4. After payment, verify premium features unlock (journal, unlimited habits)
5. Check Supabase → Table Editor → profiles → confirm `is_premium: true`

---

## Step 5 — Custom domain (optional, 10 min)

1. Buy your domain (e.g. `ascend90.com`) — Namecheap or Google Domains
2. In Vercel → Settings → Domains → add your domain
3. Follow Vercel's DNS instructions to point it

---

## Add Stripe npm package

Before deploying, run this in your project folder:

```bash
npm install stripe
```

---

## Pricing strategy recommendations

- **Free plan**: Enough to experience the app, not enough to run a full 90 days without upgrading
- **Monthly**: $8/month (you set this in Stripe)
- **Annual option**: Add a second Stripe price at $59/year — update `STRIPE_PRICE_ID` or offer both
- **Goal**: Get users hooked in week 1, upgrade by week 2

---

## What to do when you launch

1. Post on Instagram/TikTok: "I built an app for people doing 90-day transformations"
2. Target fitness, business, and wellness communities (Reddit r/loseit, r/entrepreneur, Facebook groups)
3. Offer a free month to first 50 users in exchange for honest feedback
4. Ask happy users for testimonials → update the landing page

---

## Revenue math

| Paying users | Monthly revenue |
|-------------|----------------|
| 50 | $400 |
| 100 | $800 |
| 250 | $2,000 |
| 500 | $4,000 |

Stripe takes 2.9% + $0.30 per transaction.

---

## Files overview

```
ascend90/
├── src/
│   ├── pages/          # All 9 app pages
│   ├── lib/            # Supabase, Stripe, DB helpers, utils, auth
│   └── index.css       # Global styles
├── api/
│   ├── create-checkout.js   # Stripe checkout session
│   ├── create-portal.js     # Stripe billing portal
│   └── webhook.js           # Stripe webhook handler
├── supabase_schema.sql  # Paste into Supabase SQL Editor
├── .env.example         # Copy to .env, fill in your keys
├── vercel.json          # Routing config for Vercel
└── SETUP_GUIDE.md       # This file
```

---

Questions? Email: hello@ascend90.com (update this to your real email)
