import { BRAND } from "../lib/constants";

interface Props { onBook: () => void; }

const TOPICS = [
  "Relationship", "Marriage", "Personal Growth", "Depression",
  "Career", "Talent", "Confidence", "Decisions", "Family", "Self-Worth",
];

export default function Hero({ onBook }: Props) {
  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-title">
      {/* Faint grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      {/* Soft blue glow corner */}
      <div
        aria-hidden="true"
        className="absolute -top-40 -right-40 w-[480px] h-[480px] pointer-events-none opacity-30"
        style={{
          background:
            "radial-gradient(circle at center, rgba(245,255,0,0.30), transparent 60%)",
        }}
      />

      <div className="container-x relative pt-5 pb-6 md:pt-8 md:pb-8">
        {/* Top status bar */}
        <div className="flex items-center justify-between gap-4 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.25em]">
          <div className="flex items-center gap-2 text-white/70">
            <span className="relative inline-flex items-center justify-center w-3 h-3" aria-hidden="true">
              <span className="absolute inset-0 bg-accent motion-safe:animate-pulseDot" />
              <span className="relative w-1.5 h-1.5 bg-accent" />
            </span>
            <span>Live · Booking now</span>
          </div>
          <div className="text-white/40 hidden sm:block">
            <span className="text-white/70">N06° 27′</span> &nbsp;/&nbsp;
            <span className="text-white/70">E03° 25′</span> &nbsp;/&nbsp; LAGOS · WAT
          </div>
        </div>

        <div className="mt-6 md:mt-10 grid grid-cols-1 md:grid-cols-12 gap-y-8 md:gap-x-10">
          {/* Left meta */}
          <aside className="md:col-span-2 order-2 md:order-1" aria-label="Session at a glance">
            <div className="border-t border-white/20 pt-4 md:border-t-0 md:pt-0">
              <div className="eyebrow mb-3">File / 00-intro</div>
              <dl className="font-mono text-[10px] leading-relaxed text-white/55 space-y-1">
                <div className="flex justify-between md:block"><dt className="text-white/35">Since</dt><dd>2002</dd></div>
                <div className="flex justify-between md:block"><dt className="text-white/35">Sessions</dt><dd>1,200+</dd></div>
                <div className="flex justify-between md:block"><dt className="text-white/35">Rate</dt><dd>30 MIN</dd></div>
                <div className="flex justify-between md:block"><dt className="text-white/35">Lang</dt><dd>EN/YO/HA</dd></div>
              </dl>
            </div>
          </aside>

          {/* Main */}
          <div className="md:col-span-7 order-1 md:order-2">
            <div className="eyebrow mb-3">A private line. Open now.</div>

            <h1
              id="hero-title"
              className="display text-[40px] sm:text-[52px] md:text-[64px] lg:text-[76px]"
            >
              Talk it out
              <br />
              with{" "}
              <span className="relative inline-block">
                <span className="text-accent">{BRAND.host}</span>
                <span aria-hidden="true" className="text-accent motion-safe:animate-blink">_</span>
              </span>
            </h1>

            <p className="mt-5 md:mt-6 text-base md:text-lg text-white/70 max-w-xl leading-relaxed">
              You don't have to figure it out alone. Thirty private minutes
              with {BRAND.host}, and you leave lighter, clearer, surer of your
              next move. Honest answers, real warmth, zero judgment. Off the
              record, always.
            </p>

            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 max-w-lg">
              <button onClick={onBook} className="btn-primary flex-1">
                Book a session →
              </button>
              <a href="#how" className="btn-ghost flex-1">
                How it works
              </a>
            </div>

            <div className="mt-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
              <span aria-hidden="true" className="inline-block w-6 border-t border-white/30" />
              <span>No subscription · Pay per session · Confidential</span>
            </div>
          </div>

          {/* Card */}
          <aside className="md:col-span-3 order-3" aria-label="Session card">
            <div className="border border-white/25 divide-y divide-white/15 motion-safe:transition-colors hover:border-accent/60">
              <div className="p-4 md:p-5 flex items-baseline justify-between">
                <span className="eyebrow">Card / 01</span>
                <span className="text-accent text-xs" aria-hidden="true">●</span>
              </div>
              <div className="p-4 md:p-5">
                <div className="eyebrow">Format</div>
                <div className="mt-1 font-sans font-bold text-lg">Audio · Video</div>
              </div>
              <div className="p-4 md:p-5">
                <div className="eyebrow">Duration</div>
                <div className="mt-1 font-sans font-bold text-lg">30 minutes</div>
              </div>
              <div className="p-4 md:p-5">
                <div className="eyebrow">Window</div>
                <div className="mt-1 font-sans font-bold text-lg">10:00 – 22:00</div>
              </div>
              <div className="p-4 md:p-5 bg-white/[0.03]">
                <div className="eyebrow">From</div>
                <div className="mt-1 font-sans font-extrabold text-2xl">
                  ₦40,000
                  <span className="text-white/40 text-sm font-mono font-normal"> /session</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Marquee */}
      <div className="border-y border-white/20 overflow-hidden" aria-hidden="true">
        <div className="flex w-max motion-safe:animate-marquee py-4 md:py-5">
          {[0, 1].map((dup) => (
            <ul key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1 ? true : undefined}>
              {TOPICS.map((t, i) => (
                <li
                  key={`${dup}-${i}`}
                  className="font-sans font-bold text-2xl md:text-4xl px-6 md:px-10 inline-flex items-center gap-6 md:gap-10 whitespace-nowrap"
                >
                  <span className={i % 3 === 1 ? "text-accent" : "text-white"}>{t}</span>
                  <span className="text-white/25 font-mono text-base md:text-xl">✕</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      {/* Stats band */}
      <div className="border-b border-white/15">
        <div className="container-x grid grid-cols-2 md:grid-cols-4 divide-x divide-white/15">
          {[
            { k: "Years listening", v: "20+" },
            { k: "Sessions held", v: "1,200+" },
            { k: "Avg. rating", v: "4.9 / 5" },
            { k: "Response time", v: "< 24h" },
          ].map((s, i) => (
            <div key={s.k} className={`p-5 md:p-8 ${i === 0 ? "border-l-0" : ""}`}>
              <div className="eyebrow">{s.k}</div>
              <div className="mt-2 display text-2xl md:text-4xl">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
