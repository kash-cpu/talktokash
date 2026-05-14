import { SESSION_TYPES, formatNaira } from "../lib/constants";

interface Props { onBook: () => void; }

const FEATURES: Record<string, string[]> = {
  audio: [
    "Voice-only · phone or Meet audio",
    "Great when you'd rather not be on camera",
    "Calendar invite + reminder",
    "Strictly confidential",
  ],
  video: [
    "Face-to-face on Google Meet",
    "Read tone + expression clearly",
    "Calendar invite + reminder",
    "Strictly confidential",
  ],
};

export default function Pricing({ onBook }: Props) {
  return (
    <section id="pricing" className="section scroll-mt-24" aria-labelledby="pricing-title">
      <div className="container-x py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-10 md:gap-x-12">
          <div className="md:col-span-4">
            <div className="eyebrow mb-4">
              <span className="text-accent">●</span> Index / 02
            </div>
            <h2 id="pricing-title" className="display text-4xl md:text-6xl lg:text-7xl">
              Pricing.
            </h2>
            <p className="mt-6 text-sm md:text-base text-white/60 max-w-xs leading-relaxed">
              Flat rate per 30-minute session. No subscription. No surprises. No refunds.
            </p>
            <div className="mt-8 border border-white/20 p-5">
              <div className="eyebrow mb-2">Includes</div>
              <ul className="space-y-2 text-sm text-white/75">
                <li className="flex gap-2"><span className="text-accent">→</span> 30 minutes one-on-one</li>
                <li className="flex gap-2"><span className="text-accent">→</span> Calendar + Meet link</li>
                <li className="flex gap-2"><span className="text-accent">→</span> Total confidentiality</li>
              </ul>
            </div>
          </div>

          <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 border border-white/20">
            {SESSION_TYPES.map((s, i) => {
              const popular = s.id === "video";
              return (
                <article
                  key={s.id}
                  className={[
                    "group relative p-8 md:p-12 transition-colors",
                    i === 1 ? "border-t border-white/20 md:border-t-0 md:border-l" : "",
                    "hover:bg-white/[0.025]",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <div className="eyebrow">0{i + 1} / {s.id}</div>
                    {popular && (
                      <span className="tag !text-accent !border-accent">Most picked</span>
                    )}
                  </div>

                  <div className="mt-10 flex items-baseline gap-2">
                    <div className="display text-5xl md:text-6xl">{formatNaira(s.price)}</div>
                    <div className="font-mono text-xs text-white/40">/ session</div>
                  </div>
                  <div className="mt-2 font-mono text-xs uppercase tracking-[0.22em] text-white/50">
                    {s.title} · 30 min
                  </div>

                  <ul className="mt-10 space-y-3 text-sm text-white/75">
                    {FEATURES[s.id].map((f) => (
                      <li key={f} className="flex gap-3">
                        <span className="text-accent shrink-0">→</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={onBook}
                    className={popular ? "btn-primary btn-block mt-10" : "btn-ghost btn-block mt-10"}
                  >
                    Book {s.title.toLowerCase()} →
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
