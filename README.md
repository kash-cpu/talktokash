# TalkToKash

A futuristic, animated booking site that lets people book private 30‑minute audio or video sessions with **Kash** for relationship, marriage, personal‑growth, and depression conversations.

Built with **Vite + React + TypeScript + Tailwind CSS + Framer Motion**, with **Supabase** as the backend and **Paystack** for verified Naira payments.

---

## ✨ What's inside

- Animated, dark/futuristic landing page (hero, how‑it‑works, pricing, FAQ).
- Multi‑step booking flow:
  1. Topic (Relationship / Marriage / Personal / Depression)
  2. Session type (Audio ₦40,000 — Video ₦50,000)
  3. Date + 30‑minute time slot (calendar shows occupied slots in red)
  4. Contact (email / WhatsApp)
  5. Review with **no‑refund disclaimer**
  6. Payment — **Paystack** (auto‑verified, anti‑scam) or **bank transfer** (manual)
  7. Confirmation screen with **Add to Google Calendar** (auto‑creates a Google Meet link)
- Available time window: **10am – 10pm**, 30‑min slots.
- Double‑booking prevented at the database level (`unique(start_at)`).
- Works without a backend (uses `localStorage`) so you can demo immediately.

---

## 🚀 Quick start (local demo, no backend)

```bash
npm install
npm run dev
```

Visit http://localhost:5173. Bookings will be saved in your browser's `localStorage` and Paystack will be disabled until you set the keys below.

---

## 🔐 Production setup

### 1. Supabase

1. Create a free project at https://supabase.com.
2. In **SQL Editor**, run [`supabase/schema.sql`](supabase/schema.sql).
3. Copy your **Project URL** and **anon key** into `.env`:

```bash
cp .env.example .env
# fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

### 2. Paystack

1. Sign up at https://dashboard.paystack.com (use **Test** mode first).
2. Copy your **Public key** into `.env` as `VITE_PAYSTACK_PUBLIC_KEY`.
3. Deploy the verification Edge Function (this is what prevents scams):

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase secrets set PAYSTACK_SECRET_KEY=sk_test_xxx
supabase functions deploy verify-payment --no-verify-jwt
```

> ⚠️ **Never put `sk_test_*` / `sk_live_*` keys in the frontend.** Only the **public** key (`pk_…`) goes in `.env`. The secret stays inside the Edge Function.

### 3. Build and host

```bash
npm run build
```

The `dist/` folder can be deployed to Vercel, Netlify, Cloudflare Pages, Render, etc.

---

## 🛡️ How we prevent payment scams

There are two payment paths:

1. **Paystack (recommended).** When the user finishes paying, the browser receives a `reference`. The site then calls the `verify-payment` Supabase Edge Function which hits Paystack's official `/transaction/verify` endpoint **with the secret key**. Only a real, successful charge flips the booking to `confirmed`. A user who tampers with DevTools cannot fake this.
2. **Manual bank transfer.** The booking stays `awaiting_verification` until you check your bank statement and confirm the transfer in the Supabase dashboard (set status to `confirmed`). The user is told this clearly.

---

## ⚙️ Customising

- **Branding / account number / email** → [`src/lib/constants.ts`](src/lib/constants.ts)
- **Prices / session length / hours** → same file (`SESSION_TYPES`, `SESSION_MINUTES`, `HOURS_START`, `HOURS_END`)
- **Categories** → `CATEGORIES` in the same file
- **Colours / fonts** → [`tailwind.config.js`](tailwind.config.js)

---

## 📝 Notes

- The "Add to Google Calendar" button uses Google's public template URL — when the host saves the event, Google can auto‑attach a Meet link. For a fully automated Meet flow, integrate Google Calendar API and create the event server‑side after a confirmed payment.
- Email / SMS confirmations are best added as a Supabase Database Webhook → trigger that calls Resend / Twilio when `status` becomes `confirmed`.
