import { BRAND } from "../lib/constants";

interface Props { onBook: () => void; }

export default function Footer({ onBook }: Props) {
  return (
    <footer className="border-t border-white/30" aria-labelledby="footer-title">
      {/* CTA strip */}
      <div className="container-x py-16 md:py-24 grid grid-cols-1 md:grid-cols-12 gap-y-8 md:gap-x-12 items-end border-b border-white/15">
        <div className="md:col-span-8">
          <div className="eyebrow mb-4">
            <span className="text-accent">●</span> Ready when you are
          </div>
          <h2 id="footer-title" className="display text-4xl md:text-6xl lg:text-7xl">
            Let's <span className="text-accent">talk.</span>
          </h2>
          <p className="mt-5 text-sm md:text-base text-white/60 max-w-md leading-relaxed">
            A private 30-minute conversation can change a week. Sometimes a year.
          </p>
        </div>
        <div className="md:col-span-4">
          <button onClick={onBook} className="btn-primary btn-block">
            Book a session →
          </button>
          <a href={`mailto:${BRAND.email}`} className="btn-ghost btn-block mt-3">
            Email instead →
          </a>
        </div>
      </div>

      {/* Link columns */}
      <div className="container-x py-12 md:py-16 grid grid-cols-2 md:grid-cols-12 gap-y-10 md:gap-x-12">
        <div className="col-span-2 md:col-span-4">
          <a href="#" aria-label={`${BRAND.name}, home`} className="font-mono text-base md:text-lg font-bold tracking-[0.22em] uppercase inline-block">
            {BRAND.name}<span className="text-accent">.</span>
          </a>
          <p className="mt-4 text-sm text-white/55 max-w-xs leading-relaxed">
            Honest, confidential 30-minute sessions with Kash. Audio or video. Lagos · WAT.
          </p>
        </div>

        <div className="md:col-span-2">
          <div className="eyebrow mb-4">Sessions</div>
          <ul className="space-y-3 text-sm text-white/80">
            <li><a href="#pricing" className="link-underline hover:text-accent">Audio · ₦40,000</a></li>
            <li><a href="#pricing" className="link-underline hover:text-accent">Video · ₦50,000</a></li>
            <li><a href="#how" className="link-underline hover:text-accent">How it works</a></li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <div className="eyebrow mb-4">Topics</div>
          <ul className="space-y-3 text-sm text-white/80">
            <li>Relationship</li>
            <li>Marriage</li>
            <li>Personal Growth</li>
            <li>Depression &amp; Mood</li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <div className="eyebrow mb-4">Hours</div>
          <ul className="space-y-3 text-sm text-white/80">
            <li>Daily · 10:00 – 22:00</li>
            <li>West Africa Time</li>
            <li>UTC +01:00</li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <div className="eyebrow mb-4">Contact</div>
          <ul className="space-y-3 text-sm text-white/80 break-all">
            <li><a href={`mailto:${BRAND.email}`} className="link-underline hover:text-accent">{BRAND.email}</a></li>
          </ul>
        </div>
      </div>

      {/* Wordmark band */}
      <div
        aria-hidden="true"
        className="border-t border-white/15 py-8 md:py-12 overflow-hidden"
      >
        <div className="display text-center text-[18vw] md:text-[14vw] leading-none tracking-[-0.04em] text-white/[0.06] select-none">
          TALK·TO·{BRAND.host.toUpperCase()}.
        </div>
      </div>

      {/* Bottom bar */}
      <div className="container-x border-t border-white/15 py-5 md:py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">
        <div>© {new Date().getFullYear()} {BRAND.name} · All rights reserved</div>
        <div className="flex items-center gap-4">
          <span>v1.0</span>
          <span>·</span>
          <span>Built in Lagos</span>
          <span className="text-accent">●</span>
        </div>
      </div>
    </footer>
  );
}
