// Supabase Edge Function: verify-payment
// Deploy with:  supabase functions deploy verify-payment --no-verify-jwt
// Set secret:   supabase secrets set PAYSTACK_SECRET_KEY=sk_live_xxx
//
// This is the ONLY trustworthy way to confirm a Paystack transaction.
// The browser cannot be trusted — it could be tampered with in DevTools.
// We call Paystack with the secret key, and only then mark the booking
// as `confirmed` in the database.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYSTACK_SECRET = Deno.env.get("PAYSTACK_SECRET_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { reference } = await req.json();
    if (!reference) {
      return json({ verified: false, error: "Missing reference" }, 400);
    }
    if (!PAYSTACK_SECRET) {
      return json({ verified: false, error: "Server not configured" }, 500);
    }

    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 15_000);
    let res: Response;
    try {
      res = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
          headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
          signal: ctl.signal,
        }
      );
    } catch (e) {
      return json({ verified: false, error: "Paystack timeout: " + String(e) }, 504);
    } finally {
      clearTimeout(t);
    }
    if (!res.ok) return json({ verified: false }, 200);

    const body = await res.json();
    const ok =
      body?.status === true &&
      body?.data?.status === "success" &&
      typeof body?.data?.amount === "number";

    if (ok) {
      // Find the matching booking and mark confirmed (also enforces amount sanity)
      const supa = createClient(SUPABASE_URL, SERVICE_ROLE);
      const amountNaira = body.data.amount / 100;
      const { data: row } = await supa
        .from("bookings")
        .select("id,amount")
        .eq("payment_ref", reference)
        .maybeSingle();
      if (row && row.amount === amountNaira) {
        await supa
          .from("bookings")
          .update({ status: "confirmed" })
          .eq("id", row.id);
        return json({ verified: true });
      }
      return json({ verified: false, error: "Booking/amount mismatch" });
    }
    return json({ verified: false });
  } catch (e) {
    return json({ verified: false, error: String(e) }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
