import { useEffect, useState } from "react";
import { BRAND } from "../lib/constants";

interface Props { onBook: () => void; }

const NAV = [
  { href: "#how", n: "01", label: "How" },
  { href: "#pricing", n: "02", label: "Pricing" },
  { href: "#faq", n: "03", label: "FAQ" },
];

export default function Navbar({ onBook }: Props) {
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      const h = document.documentElement;
      const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
      setProgress(Math.min(1, Math.max(0, scrolled)));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-[2px] border-b border-white/25">
      <div className="container-x h-14 md:h-20 flex items-center justify-between gap-4">
        <a
          href="#"
          aria-label={`${BRAND.name}, home`}
          className="font-mono text-sm md:text-base font-bold tracking-[0.22em] uppercase"
        >
          {BRAND.name}<span className="text-accent">.</span>
        </a>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-10 text-[11px] font-mono uppercase tracking-[0.22em] text-white/70">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="link-underline hover:text-accent">
              <span className="text-white/40">{n.n}</span> · {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onBook}
            className="btn-primary !py-2 !px-3 md:!px-4 text-[11px]"
          >
            Book →
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="md:hidden btn-ghost !py-2 !px-3 text-[11px]"
          >
            {menuOpen ? "✕" : "≡"}
          </button>
        </div>
      </div>

      {/* Scroll progress */}
      <div className="h-px bg-white/10" aria-hidden="true">
        <div
          className="h-full bg-accent transition-[width] duration-100"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-nav"
        className={`md:hidden overflow-hidden transition-[max-height] duration-200 border-b border-white/15 ${
          menuOpen ? "max-h-[400px]" : "max-h-0"
        }`}
      >
        <nav aria-label="Mobile" className="container-x py-4 flex flex-col">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={() => setMenuOpen(false)}
              className="py-4 border-b border-white/10 last:border-b-0 font-mono text-xs uppercase tracking-[0.22em] flex items-center justify-between hover:text-accent"
            >
              <span><span className="text-white/40">{n.n}</span> · {n.label}</span>
              <span className="text-white/40">→</span>
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
