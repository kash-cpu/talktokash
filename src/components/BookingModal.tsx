import { useEffect, useState } from "react";
import {
  BRAND,
  CATEGORIES,
  CategoryId,
  SESSION_TYPES,
  SessionType,
  formatNaira,
} from "../lib/constants";
import { Slot, googleCalendarLink, humanDate } from "../lib/time";
import Calendar from "./Calendar";
import { Booking } from "../lib/supabase";
import { createBooking, updateBooking } from "../lib/bookings";
import { payWithPaystack, verifyPaystackReference } from "../lib/paystack";

interface Props { open: boolean; onClose: () => void; }

type Step = "category" | "type" | "datetime" | "contact" | "review" | "payment" | "done";
const STEP_ORDER: Step[] = ["category", "type", "datetime", "contact", "review", "payment", "done"];

export default function BookingModal({ open, onClose }: Props) {
  const [step, setStep] = useState<Step>("category");
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [sessionType, setSessionType] = useState<SessionType | null>(null);
  const [when, setWhen] = useState<{ date: Date; slot: Slot } | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStep("category"); setCategory(null); setSessionType(null); setWhen(null);
        setName(""); setEmail(""); setPhone(""); setAgreed(false);
        setBooking(null); setError(null); setSubmitting(false); setVerifying(false);
      }, 150);
      return () => clearTimeout(t);
    }
  }, [open]);

  const price = SESSION_TYPES.find((s) => s.id === sessionType)?.price ?? 0;
  const stepIdx = STEP_ORDER.indexOf(step);

  const canNext = (() => {
    switch (step) {
      case "category": return !!category;
      case "type": return !!sessionType;
      case "datetime": return !!when;
      case "contact": return name.trim().length > 1 && (validEmail(email) || validPhone(phone));
      case "review": return agreed;
      default: return false;
    }
  })();

  function next() {
    const i = STEP_ORDER.indexOf(step);
    if (i < STEP_ORDER.length - 1) setStep(STEP_ORDER[i + 1]);
  }
  function prev() {
    const i = STEP_ORDER.indexOf(step);
    if (i > 0) setStep(STEP_ORDER[i - 1]);
  }

  async function handleConfirmBooking() {
    if (!category || !sessionType || !when) return;
    setSubmitting(true); setError(null);
    try {
      const row: Booking = {
        category, session_type: sessionType, amount: price,
        start_at: when.slot.start.toISOString(), end_at: when.slot.end.toISOString(),
        contact_name: name.trim(),
        contact_email: email.trim() || null,
        contact_phone: phone.trim() || null,
        status: "pending_payment", payment_ref: null,
      };
      const saved = await createBooking(row);
      setBooking(saved);
      setStep("payment");
    } catch (e) {
      setError((e as Error).message || "Could not save booking.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePayOnline() {
    if (!booking || !email) {
      setError("Please provide an email on the previous step to pay online.");
      return;
    }
    setSubmitting(true); setError(null);
    try {
      const result = await payWithPaystack({
        email, amountNaira: price,
        metadata: { booking_id: booking.id, category, sessionType },
      });
      if (result.status === "closed") { setSubmitting(false); return; }
      let updated = await updateBooking(booking.id!, { payment_ref: result.reference, status: "awaiting_verification" });
      setBooking(updated);
      setVerifying(true);
      const ok = await verifyPaystackReference(result.reference);
      if (ok) {
        updated = await updateBooking(booking.id!, { status: "confirmed" });
        setBooking(updated);
      }
      setStep("done");
    } catch (e) {
      setError((e as Error).message || "Payment failed.");
    } finally {
      setSubmitting(false); setVerifying(false);
    }
  }

  async function handleMarkTransferDone() {
    if (!booking) return;
    setSubmitting(true);
    try {
      const updated = await updateBooking(booking.id!, { status: "awaiting_verification" });
      setBooking(updated);
      setStep("done");
    } finally { setSubmitting(false); }
  }

  function copyAccount() {
    navigator.clipboard.writeText(`${BRAND.bankAccount.bank} · ${BRAND.bankAccount.number} · ${BRAND.bankAccount.name}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="border-b border-white/30">
        <div className="container-x h-14 md:h-20 flex items-center justify-between">
          <div className="font-mono text-[11px] md:text-sm uppercase tracking-[0.25em]">
            <span className="text-accent">●</span> Booking / {String(Math.min(stepIdx + 1, 6)).padStart(2, "0")} of 06
          </div>
          <button onClick={onClose} className="font-mono text-xs md:text-sm uppercase tracking-[0.2em] hover:text-accent">
            Close ✕
          </button>
        </div>
        <div className="h-[2px] bg-white/10">
          <div className="h-full bg-accent transition-all duration-300" style={{ width: `${((stepIdx + 1) / STEP_ORDER.length) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="container-x py-10 md:py-20 max-w-4xl mx-auto w-full">
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/50 mb-3">
            Step {String(stepIdx + 1).padStart(2, "0")} / {titleTag(step)}
          </div>
          <h2 className="font-sans font-extrabold text-3xl md:text-5xl leading-[0.95] mb-10 md:mb-14">
            {titleFor(step)}
          </h2>

          {step === "category" && <CategoryStep value={category} onChange={setCategory} />}
          {step === "type" && <TypeStep value={sessionType} onChange={setSessionType} />}
          {step === "datetime" && <Calendar value={when} onChange={setWhen} />}
          {step === "contact" && <ContactStep name={name} email={email} phone={phone} onName={setName} onEmail={setEmail} onPhone={setPhone} />}
          {step === "review" && (
            <ReviewStep category={category!} sessionType={sessionType!} when={when!} name={name} email={email} phone={phone} price={price} agreed={agreed} onAgreed={setAgreed} />
          )}
          {step === "payment" && booking && (
            <PaymentStep booking={booking} price={price} copied={copied} copyAccount={copyAccount}
              onPayOnline={handlePayOnline} onMarkTransfer={handleMarkTransferDone}
              verifying={verifying} submitting={submitting} />
          )}
          {step === "done" && booking && (
            <DoneStep booking={booking} category={category!} sessionType={sessionType!} when={when!} />
          )}

          {error && (
            <div className="mt-6 border border-accent text-accent px-4 py-3 font-mono text-xs uppercase tracking-[0.15em]">
              ! {error}
            </div>
          )}
        </div>
      </div>

      {step !== "done" && step !== "payment" && (
        <div className="border-t border-white/30">
          <div className="container-x max-w-4xl mx-auto w-full py-5 md:py-6 grid grid-cols-2 gap-4">
            <button className="btn-ghost btn-block" disabled={stepIdx === 0 || submitting} onClick={prev}>← Back</button>
            {step === "review" ? (
              <button className="btn-primary btn-block" onClick={handleConfirmBooking} disabled={!canNext || submitting}>
                {submitting ? "Saving..." : "Book session →"}
              </button>
            ) : (
              <button className="btn-primary btn-block" onClick={next} disabled={!canNext}>Continue →</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function titleFor(step: Step) {
  switch (step) {
    case "category": return "What's on your mind?";
    case "type": return "Choose your format.";
    case "datetime": return "Pick a free time.";
    case "contact": return "How can Kash reach you?";
    case "review": return "Review & confirm.";
    case "payment": return "Make payment.";
    case "done": return "You're booked.";
  }
}
function titleTag(step: Step) {
  return { category: "Topic", type: "Format", datetime: "Schedule", contact: "Contact", review: "Review", payment: "Pay", done: "Done" }[step];
}

function CategoryStep({ value, onChange }: { value: CategoryId | null; onChange: (v: CategoryId) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 border border-white/20">
      {CATEGORIES.map((c, i) => {
        const selected = value === c.id;
        const borderTop = i > 0 ? (i >= 2 ? "border-t border-white/20" : "border-t border-white/20 md:border-t-0") : "";
        const borderLeft = i % 2 === 1 ? "md:border-l md:border-white/20" : "";
        return (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className={[
              "text-left p-6 md:p-10 transition-colors",
              borderTop, borderLeft,
              selected ? "bg-accent text-black" : "bg-black text-white hover:bg-white/5",
            ].join(" ")}
          >
            <div className={`font-mono text-[11px] uppercase tracking-[0.25em] mb-4 ${selected ? "text-black/60" : "text-white/40"}`}>
              0{i + 1}
            </div>
            <div className="font-sans font-bold text-xl md:text-2xl">{c.title}</div>
            <div className={`mt-2 text-sm ${selected ? "text-black/70" : "text-white/60"}`}>{c.desc}</div>
          </button>
        );
      })}
    </div>
  );
}

function TypeStep({ value, onChange }: { value: SessionType | null; onChange: (v: SessionType) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 border border-white/20">
      {SESSION_TYPES.map((t, i) => {
        const selected = value === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={[
              "text-left p-6 md:p-10 transition-colors",
              i === 1 ? "border-t md:border-t-0 md:border-l border-white/20" : "",
              selected ? "bg-accent text-black" : "bg-black text-white hover:bg-white/5",
            ].join(" ")}
          >
            <div className={`font-mono text-[11px] uppercase tracking-[0.25em] ${selected ? "text-black/60" : "text-white/40"}`}>
              0{i + 1} / {t.id}
            </div>
            <div className="mt-6 font-sans font-extrabold text-4xl md:text-5xl">{formatNaira(t.price)}</div>
            <div className="mt-1 font-sans font-bold text-lg md:text-xl">{t.title} session</div>
            <div className={`mt-2 text-sm ${selected ? "text-black/70" : "text-white/60"}`}>{t.desc}</div>
            <div className={`mt-4 font-mono text-[11px] uppercase tracking-[0.2em] ${selected ? "text-black/60" : "text-white/40"}`}>30 minutes</div>
          </button>
        );
      })}
    </div>
  );
}

function ContactStep({
  name, email, phone, onName, onEmail, onPhone,
}: { name: string; email: string; phone: string; onName: (v: string) => void; onEmail: (v: string) => void; onPhone: (v: string) => void }) {
  return (
    <div className="border border-white/20 p-6 md:p-10 space-y-6">
      <div>
        <label className="label">Full name</label>
        <input className="field" value={name} onChange={(e) => onName(e.target.value)} placeholder="Aisha Bello" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label">Email</label>
          <input className="field" type="email" value={email} onChange={(e) => onEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label className="label">Phone (WhatsApp)</label>
          <input className="field" type="tel" value={phone} onChange={(e) => onPhone(e.target.value)} placeholder="+234 80 1234 5678" />
        </div>
      </div>
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
        Provide at least one. Used for your Meet link &amp; reminder.
      </p>
    </div>
  );
}

function ReviewStep({
  category, sessionType, when, name, email, phone, price, agreed, onAgreed,
}: {
  category: CategoryId; sessionType: SessionType; when: { date: Date; slot: Slot };
  name: string; email: string; phone: string; price: number; agreed: boolean; onAgreed: (v: boolean) => void;
}) {
  const cat = CATEGORIES.find((c) => c.id === category)!;
  const type = SESSION_TYPES.find((s) => s.id === sessionType)!;
  return (
    <div className="space-y-6">
      <div className="border border-white/20">
        <Row k="Topic" v={cat.title} />
        <Row k="Session" v={`${type.title} · 30 min`} />
        <Row k="Date" v={humanDate(when.date)} />
        <Row k="Time" v={`${when.slot.label} – ${when.slot.end.toTimeString().slice(0, 5)}`} />
        <Row k="Name" v={name} />
        {email && <Row k="Email" v={email} />}
        {phone && <Row k="Phone" v={phone} />}
        <Row k="Total" v={<span className="text-accent font-bold">{formatNaira(price)}</span>} />
      </div>

      <label className="flex items-start gap-4 border border-accent p-5 cursor-pointer">
        <input type="checkbox" checked={agreed} onChange={(e) => onAgreed(e.target.checked)} className="mt-1 w-5 h-5 accent-accent" />
        <span className="text-sm md:text-base leading-relaxed">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent block mb-2">! Disclaimer</span>
          <strong className="text-white">No refunds.</strong>{" "}
          <span className="text-white/70">
            If you miss your scheduled session for any reason, your payment cannot be refunded.
            You'll need to book and pay for a new session. I understand and agree.
          </span>
        </span>
      </label>
    </div>
  );
}

function PaymentStep({
  booking, price, copied, copyAccount, onPayOnline, onMarkTransfer, verifying, submitting,
}: {
  booking: Booking; price: number; copied: boolean; copyAccount: () => void;
  onPayOnline: () => void; onMarkTransfer: () => void; verifying: boolean; submitting: boolean;
}) {
  return (
    <div className="space-y-8">
      <div className="border border-white/20 p-6 md:p-10">
        <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/40">Amount due</div>
        <div className="mt-2 font-sans font-extrabold text-5xl md:text-7xl text-accent">{formatNaira(price)}</div>
        <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
          Ref / <span className="text-white">{booking.id?.slice(0, 8)}</span>
        </div>
      </div>

      <div className="border border-white/20 p-6 md:p-10">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/40 mb-2">Option A</div>
            <h3 className="font-sans font-bold text-xl md:text-2xl">Pay with card / transfer / USSD</h3>
            <p className="mt-2 text-sm text-white/60 max-w-md">
              Auto-verified by Paystack the moment payment clears. Your slot locks instantly.
            </p>
          </div>
          <span className="tag text-accent border-accent shrink-0">Recommended</span>
        </div>
        <button className="btn-primary btn-block" onClick={onPayOnline} disabled={submitting}>
          {submitting ? "Processing..." : verifying ? "Verifying..." : `Pay ${formatNaira(price)} →`}
        </button>
      </div>

      <div className="border border-white/20 p-6 md:p-10">
        <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/40 mb-2">Option B</div>
        <h3 className="font-sans font-bold text-xl md:text-2xl">Bank transfer</h3>
        <p className="mt-2 text-sm text-white/60">
          Send <span className="text-white">{formatNaira(price)}</span> to the account below. Use your booking ID as narration.
        </p>

        <div className="mt-6 border border-white/30 divide-y divide-white/15 font-mono text-sm">
          <KV k="Bank" v={BRAND.bankAccount.bank} />
          <KV k="Account No." v={BRAND.bankAccount.number} />
          <KV k="Account Name" v={BRAND.bankAccount.name} />
          <KV k="Narration" v={booking.id?.slice(0, 8) ?? ""} />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <button className="btn-ghost btn-block" onClick={copyAccount}>
            {copied ? "Copied ✓" : "Copy details"}
          </button>
          <button className="btn-primary btn-block" onClick={onMarkTransfer} disabled={submitting}>
            {submitting ? "..." : "I've paid →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DoneStep({
  booking, category, sessionType, when,
}: { booking: Booking; category: CategoryId; sessionType: SessionType; when: { date: Date; slot: Slot } }) {
  const confirmed = booking.status === "confirmed";
  const cat = CATEGORIES.find((c) => c.id === category)!;
  const type = SESSION_TYPES.find((s) => s.id === sessionType)!;
  const gcal = googleCalendarLink({
    title: `${BRAND.name}. ${type.title} (${cat.title})`,
    details: `Your 30-minute ${type.title.toLowerCase()} with ${BRAND.host}. Booking ID: ${booking.id}.`,
    start: when.slot.start, end: when.slot.end,
  });

  return (
    <div className="border border-white/20 p-8 md:p-16">
      <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent mb-4">
        ● {confirmed ? "Confirmed" : "Received"}
      </div>
      <h3 className="font-sans font-extrabold text-3xl md:text-5xl leading-[0.95]">
        {confirmed ? "Your session is locked in." : "We've got your booking."}
      </h3>
      <p className="mt-6 text-white/65 max-w-lg text-sm md:text-base leading-relaxed">
        {confirmed
          ? `${humanDate(when.date)} at ${when.slot.label}. A Google Meet link will be sent to ${booking.contact_email ?? booking.contact_phone}.`
          : `We're verifying your payment. Once confirmed, you'll get a Meet link by ${booking.contact_email ? "email" : "WhatsApp"}. Don't miss your session, no refunds.`}
      </p>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg">
        <a className="btn-primary btn-block" href={gcal} target="_blank" rel="noreferrer">Add to Calendar →</a>
        <a className="btn-ghost btn-block" href={`mailto:${BRAND.email}?subject=Booking%20${booking.id}`}>Email Kash</a>
      </div>

      <div className="mt-10 font-mono text-[11px] uppercase tracking-[0.25em] text-white/40">
        Booking ID / <span className="text-white">{booking.id}</span>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/15 last:border-b-0">
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">{k}</div>
      <div className="text-right">{v}</div>
    </div>
  );
}
function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between px-4 md:px-6 py-4">
      <span className="text-white/50 uppercase tracking-[0.18em] text-[11px]">{k}</span>
      <span className="text-white">{v}</span>
    </div>
  );
}

function validEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }
function validPhone(v: string) { return /^[\d+\-\s()]{7,}$/.test(v.trim()); }
