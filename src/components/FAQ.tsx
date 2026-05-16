import { useId, useState } from "react";

const FAQS = [
  { q: "How long is each session?", a: "Every session is exactly 30 minutes. If you'd like to keep talking, book another. It keeps things focused and fair to everyone in the schedule." },
  { q: "Is my conversation confidential?", a: "Absolutely. Nothing leaves the call. No recordings. No notes shared. A safe, judgment-free space." },
  { q: "Are refunds available?", a: "No. Once a session is booked and paid for, it cannot be refunded, including if you miss the call. Please choose a time you can keep." },
  { q: "How does the video session happen?", a: "Once payment is confirmed, you receive a Google Meet link by email and/or WhatsApp. Click it at the booked time and you're in." },
  { q: "What if I just need career or talent guidance?", a: "Pick the Personal Growth topic. Kash has helped many talented people figure out their next move, untangle a stuck career, or pick between options." },
  { q: "How do I know payment is secure?", a: "All payments are processed by Paystack and verified server-side before your slot is locked. Your card details never touch our servers." },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section id="faq" className="section scroll-mt-24" aria-labelledby="faq-title">
      <div className="container-x py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-10 md:gap-x-12">
          <div className="md:col-span-4">
            <div className="eyebrow mb-4">
              <span className="text-accent">●</span> Index / 03
            </div>
            <h2 id="faq-title" className="display text-4xl md:text-6xl lg:text-7xl">FAQ.</h2>
            <p className="mt-6 text-sm md:text-base text-white/60 max-w-xs leading-relaxed">
              Still have a question? <a href="#" className="text-accent link-underline">Email Kash</a>.
            </p>
          </div>

          <div className="md:col-span-8 border-t border-white/20">
            {FAQS.map((f, i) => {
              const isOpen = open === i;
              const panelId = `${baseId}-panel-${i}`;
              const btnId = `${baseId}-btn-${i}`;
              return (
                <div key={i} className="border-b border-white/20">
                  <h3>
                    <button
                      id={btnId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="w-full text-left flex items-start gap-4 md:gap-8 py-6 md:py-8 hover:text-accent transition-colors"
                      onClick={() => setOpen(isOpen ? null : i)}
                    >
                      <span className={`font-mono text-xs md:text-sm shrink-0 mt-1 ${isOpen ? "text-accent" : "text-white/40"}`}>
                        0{i + 1}
                      </span>
                      <span className="flex-1 font-sans font-bold text-lg md:text-2xl tracking-tight">
                        {f.q}
                      </span>
                      <span aria-hidden="true" className="font-mono text-xl shrink-0 text-white/60">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={btnId}
                    hidden={!isOpen}
                    className="pl-10 md:pl-16 pb-6 md:pb-8 pr-4 text-white/65 text-sm md:text-base leading-relaxed max-w-2xl"
                  >
                    {f.a}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
