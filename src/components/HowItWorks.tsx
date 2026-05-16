const STEPS = [
  { n: "01", title: "Pick your topic", text: "Relationship, marriage, personal growth, or mood. Pick what fits.", time: "~30 sec" },
  { n: "02", title: "Audio or Video", text: "Voice-only for ₦40,000. Video on Google Meet for ₦50,000.", time: "~30 sec" },
  { n: "03", title: "Pick a time", text: "See free slots between 10:00 and 22:00 WAT. Tap one.", time: "~1 min" },
  { n: "04", title: "Pay & confirm", text: "Card, bank transfer or USSD via Paystack. Your slot locks the moment payment clears.", time: "~2 min" },
];

export default function HowItWorks() {
  return (
    <section id="how" className="section scroll-mt-24" aria-labelledby="how-title">
      <div className="container-x py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-10 md:gap-x-12">
          <div className="md:col-span-4">
            <div className="eyebrow mb-4">
              <span className="text-accent">●</span> Index / 01
            </div>
            <h2 id="how-title" className="display text-4xl md:text-6xl lg:text-7xl">
              How it<br />works.
            </h2>
            <p className="mt-6 text-sm md:text-base text-white/60 max-w-xs leading-relaxed">
              Four steps. About five minutes from picking a topic to a confirmed booking.
            </p>
          </div>

          <div className="md:col-span-8">
            <ol className="border-t border-white/20" role="list">
              {STEPS.map((s) => (
                <li
                  key={s.n}
                  className="group border-b border-white/20 transition-colors hover:bg-white/[0.025]"
                >
                  <div className="py-6 md:py-9 grid grid-cols-12 gap-4 md:gap-8 items-baseline">
                    <div className="col-span-2 md:col-span-1 font-mono text-sm md:text-base text-white/40 group-hover:text-accent transition-colors">
                      {s.n}
                    </div>
                    <div className="col-span-10 md:col-span-5">
                      <h3 className="font-sans font-bold text-xl md:text-2xl tracking-tight">
                        {s.title}
                      </h3>
                      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
                        {s.time}
                      </div>
                    </div>
                    <div className="col-span-12 md:col-span-5 text-white/65 text-sm md:text-base leading-relaxed">
                      {s.text}
                    </div>
                    <div className="hidden md:block md:col-span-1 text-right font-mono text-white/30 group-hover:text-accent transition-colors">
                      →
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
