import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(url && key);

export const supabase: SupabaseClient | null = supabaseEnabled
  ? createClient(url, key)
  : null;

/**
 * Booking row shape used by the app.
 * Matches the SQL schema in supabase/schema.sql
 */
export type BookingStatus =
  | "pending_payment"
  | "awaiting_verification"
  | "confirmed"
  | "cancelled";

export interface Booking {
  id?: string;
  created_at?: string;
  category: string;
  session_type: "audio" | "video";
  amount: number;
  start_at: string; // ISO timestamp
  end_at: string; // ISO timestamp
  contact_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  status: BookingStatus;
  payment_ref: string | null;
  meet_link?: string | null;
}
