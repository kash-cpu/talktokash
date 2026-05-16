/**
 * Paystack inline checkout helper.
 *
 * SECURITY NOTE
 * -------------
 * The browser-side Paystack popup gives us a `reference` after a "successful"
 * transaction. A determined attacker could fake the callback in DevTools, so
 * the ONLY trustworthy verification is server-side, calling:
 *   GET https://api.paystack.co/transaction/verify/:reference
 * with your SECRET key (never expose the secret key in the browser).
 *
 * In this MVP we:
 *   1) Use the Paystack inline checkout for a real card / transfer charge.
 *   2) Mark the booking as `awaiting_verification` until you (or your
 *      Supabase Edge Function `verify-payment`) confirm the reference is
 *      genuinely successful — then it becomes `confirmed`.
 *
 * Set up your Edge Function (see supabase/functions/verify-payment) and call
 * it from `verifyPaystackReference()` below. Until that is deployed we keep
 * status = awaiting_verification so nothing is auto-confirmed.
 */

export interface PaystackResult {
  reference: string;
  status: "success" | "closed";
}

export function payWithPaystack(opts: {
  email: string;
  amountNaira: number;
  metadata?: Record<string, unknown>;
}): Promise<PaystackResult> {
  return new Promise((resolve, reject) => {
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      reject(
        new Error(
          "Paystack public key missing. Add VITE_PAYSTACK_PUBLIC_KEY to your .env"
        )
      );
      return;
    }
    if (!window.PaystackPop) {
      reject(new Error("Paystack script not loaded. Check your network."));
      return;
    }
    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: opts.email,
      amount: opts.amountNaira * 100, // Paystack expects kobo
      currency: "NGN",
      metadata: opts.metadata,
      callback: (resp) => resolve({ reference: resp.reference, status: "success" }),
      onClose: () => resolve({ reference: "", status: "closed" }),
    });
    handler.openIframe();
  });
}

/**
 * Calls a Supabase Edge Function (or any backend) that verifies the reference
 * against Paystack using the SECRET key. Returns true only on real success.
 */
export async function verifyPaystackReference(reference: string): Promise<boolean> {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anon || !reference) return false;

  // Abort if the function takes longer than 20s so the UI never hangs.
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 20_000);

  try {
    const res = await fetch(`${url}/functions/v1/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anon,
        Authorization: `Bearer ${anon}`,
      },
      body: JSON.stringify({ reference }),
      signal: ctl.signal,
    });
    if (!res.ok) {
      console.warn("[paystack] verify HTTP error", res.status);
      return false;
    }
    const json = (await res.json()) as { verified: boolean };
    return Boolean(json.verified);
  } catch (e) {
    console.warn("[paystack] verify call failed", e);
    return false;
  } finally {
    clearTimeout(timer);
  }
}
