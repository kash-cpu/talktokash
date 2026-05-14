import { HOURS_END, HOURS_START, SESSION_MINUTES } from "./constants";

export interface Slot {
  /** start of slot (local time) */
  start: Date;
  /** end of slot */
  end: Date;
  /** "HH:mm" */
  label: string;
}

export const pad = (n: number) => n.toString().padStart(2, "0");

export function formatTime(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDateISO(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function addMinutes(d: Date, n: number) {
  const x = new Date(d);
  x.setMinutes(x.getMinutes() + n);
  return x;
}

/**
 * Generate every 30-minute slot for a given day between HOURS_START and HOURS_END.
 * The LAST possible START slot is HOURS_END - 30 minutes (so a 30-min session ends at HOURS_END).
 */
export function generateSlots(day: Date): Slot[] {
  const slots: Slot[] = [];
  const base = startOfDay(day);
  const totalMinutes = (HOURS_END - HOURS_START) * 60;
  for (let m = 0; m + SESSION_MINUTES <= totalMinutes; m += SESSION_MINUTES) {
    const start = addMinutes(base, HOURS_START * 60 + m);
    const end = addMinutes(start, SESSION_MINUTES);
    slots.push({ start, end, label: formatTime(start) });
  }
  return slots;
}

/** Build a 6-week (42 cells) calendar grid starting on Sunday */
export function buildMonthGrid(viewMonth: Date): Date[] {
  const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const startWeekday = first.getDay(); // 0 = Sun
  const gridStart = addDays(first, -startWeekday);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

export function isPast(d: Date) {
  return d.getTime() < Date.now();
}

export function humanDate(d: Date) {
  return d.toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Build a Google Calendar "Add event" link, which also auto-generates a Google Meet
 * link when the event is saved. (No API keys needed — opens in browser.)
 */
export function googleCalendarLink(opts: {
  title: string;
  details: string;
  start: Date;
  end: Date;
}) {
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]|\.\d{3}/g, "").slice(0, 15) + "Z";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    details: opts.details,
    dates: `${fmt(opts.start)}/${fmt(opts.end)}`,
    add: "", // attendee placeholder
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
