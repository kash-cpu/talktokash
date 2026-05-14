import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import BookingModal from "./components/BookingModal";

export default function App() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("modal-open", open);
    return () => document.body.classList.remove("modal-open");
  }, [open]);

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="skip-link">Skip to content</a>
      <Navbar onBook={() => setOpen(true)} />
      <main id="main" className="flex-1">
        <Hero onBook={() => setOpen(true)} />
        <HowItWorks />
        <Pricing onBook={() => setOpen(true)} />
        <FAQ />
      </main>
      <Footer onBook={() => setOpen(true)} />
      <BookingModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
