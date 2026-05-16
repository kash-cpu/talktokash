import { Booking, supabase, supabaseEnabled } from "./supabase";
import { addDays, startOfDay } from "./time";

const LOCAL_KEY = "ttk_bookings_v1";

/* ------------------------------------------------------------------ */
/*  Local fallback (works without Supabase configured — for demo)      */
/* ------------------------------------------------------------------ */
function readLocal(): Booking[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeLocal(list: Booking[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/** Return start ISO strings of slots that are already occupied (confirmed OR awaiting). */
export async function getBusySlots(rangeDays = 60): Promise<string[]> {
  const from = startOfDay(new Date()).toISOString();
  const to = addDays(new Date(), rangeDays).toISOString();

  if (supabaseEnabled && supabase) {
    const { data, error } = await supabase
      .from("bookings")
      .select("start_at,status")
      .gte("start_at", from)
      .lte("start_at", to)
      .in("status", ["confirmed"]);
    if (error) {
      console.warn("[supabase] busy fetch failed, falling back to local", error);
    } else if (data) {
      return data.map((r) => new Date(r.start_at).toISOString());
    }
  }
  return readLocal()
    .filter((b) => b.status === "confirmed")
    .map((b) => new Date(b.start_at).toISOString());
}

/** Insert a booking row (pending_payment). Returns the saved booking with id. */
export async function createBooking(b: Booking): Promise<Booking> {
  if (supabaseEnabled && supabase) {
    const { data, error } = await supabase
      .from("bookings")
      .insert(b)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Booking;
  }
  const row: Booking = { ...b, id: crypto.randomUUID(), created_at: new Date().toISOString() };
  const list = readLocal();
  list.push(row);
  writeLocal(list);
  return row;
}

/** Update status / payment reference after a payment attempt. */
export async function updateBooking(
  id: string,
  patch: Partial<Booking>
): Promise<Booking> {
  if (supabaseEnabled && supabase) {
    const { data, error } = await supabase
      .from("bookings")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Booking;
  }
  const list = readLocal();
  const idx = list.findIndex((b) => b.id === id);
  if (idx === -1) throw new Error("Booking not found");
  list[idx] = { ...list[idx], ...patch };
  writeLocal(list);
  return list[idx];
}
