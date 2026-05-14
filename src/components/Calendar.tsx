import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  buildMonthGrid,
  formatDateISO,
  generateSlots,
  humanDate,
  sameDay,
  Slot,
  startOfDay,
} from "../lib/time";
import { getBusySlots } from "../lib/bookings";

interface Props {
  value: { date: Date; slot: Slot } | null;
  onChange: (val: { date: Date; slot: Slot }) => void;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function Calendar({ value, onChange }: Props) {
  const today = startOfDay(new Date());
  const [viewMonth, setViewMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date>(value?.date ?? today);
  const [busy, setBusy] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    getBusySlots(60).then((iso) => { if (!cancelled) setBusy(new Set(iso)); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const gridDays = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);
  const slots = useMemo(() => generateSlots(selectedDate), [selectedDate]);

  const isSelectableDay = (d: Date) => d.getTime() >= today.getTime();
  const isCurrentMonth = (d: Date) => d.getMonth() === viewMonth.getMonth();
  const monthLabel = viewMonth.toLocaleDateString("en-NG", { month: "long", year: "numeric" }).toUpperCase();

  function pickSlot(slot: Slot) {
    if (busy.has(slot.start.toISOString())) return;
    if (slot.start.getTime() < Date.now()) return;
    onChange({ date: selectedDate, slot });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 border border-white/20">
      <div className="p-5 md:p-8 border-b border-white/20 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
            className="font-mono text-xs md:text-sm hover:text-accent"
          >← PREV</button>
          <div className="font-mono text-xs md:text-sm tracking-[0.2em]">{monthLabel}</div>
          <button
            onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
            className="font-mono text-xs md:text-sm hover:text-accent"
          >NEXT →</button>
        </div>

        <div className="grid grid-cols-7 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">
          {WEEKDAYS.map((d, i) => (<div key={i} className="py-2">{d}</div>))}
        </div>

        <div className="grid grid-cols-7 border-t border-l border-white/15">
          {gridDays.map((d) => {
            const selectable = isSelectableDay(d);
            const selected = sameDay(d, selectedDate);
            const dim = !isCurrentMonth(d);
            return (
              <button
                key={d.toISOString()}
                disabled={!selectable}
                onClick={() => setSelectedDate(d)}
                className={[
                  "aspect-square border-r border-b border-white/15 text-sm font-mono flex items-center justify-center transition-colors",
                  selected
                    ? "bg-accent text-black"
                    : selectable
                    ? "bg-black text-white hover:bg-white hover:text-black"
                    : "bg-black text-white/15 cursor-not-allowed",
                  dim && !selected ? "opacity-40" : "",
                ].join(" ")}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
          <span className="inline-flex items-center gap-2"><span className="w-3 h-3 bg-accent inline-block"></span>Selected</span>
          <span className="inline-flex items-center gap-2"><span className="w-3 h-3 border border-white inline-block"></span>Available</span>
          <span className="inline-flex items-center gap-2"><span className="w-3 h-3 border border-white/30 inline-block bg-white/5"></span>Taken</span>
        </div>
      </div>

      <div className="p-5 md:p-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">Times for</div>
        <div className="font-sans font-bold text-lg md:text-xl mt-1 mb-5">{humanDate(selectedDate)}</div>

        <div
          key={formatDateISO(selectedDate)}
          className="grid grid-cols-3 sm:grid-cols-4 border-t border-l border-white/15 max-h-[320px] overflow-y-auto"
        >
          {slots.map((s) => {
            const occupied = busy.has(s.start.toISOString());
            const past = s.start.getTime() < Date.now();
            const disabled = occupied || past;
            const selected = value && sameDay(value.date, selectedDate) && value.slot.label === s.label;
            return (
              <button
                key={s.label}
                disabled={disabled}
                onClick={() => pickSlot(s)}
                className={[
                  "border-r border-b border-white/15 py-3 text-sm font-mono transition-colors",
                  selected
                    ? "bg-accent text-black"
                    : occupied
                    ? "bg-black text-white/25 line-through cursor-not-allowed"
                    : past
                    ? "bg-black text-white/15 cursor-not-allowed"
                    : "bg-black text-white hover:bg-white hover:text-black",
                ].join(" ")}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
          30-min · Daily 10:00 – 22:00 ·{" "}
          <button className="text-accent hover:underline" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
            Try tomorrow →
          </button>
        </div>
      </div>
    </div>
  );
}
