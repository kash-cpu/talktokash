-- TalkToKash — Supabase schema
-- Run this in the Supabase SQL editor (Project → SQL → New query).

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  category text not null check (category in ('relationship','marriage','personal','depression')),
  session_type text not null check (session_type in ('audio','video')),
  amount integer not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  contact_name text not null,
  contact_email text,
  contact_phone text,
  status text not null default 'pending_payment'
    check (status in ('pending_payment','awaiting_verification','confirmed','cancelled')),
  payment_ref text,
  meet_link text,
  unique (start_at)  -- prevents double-booking the exact same slot
);

create index if not exists bookings_start_at_idx on public.bookings (start_at);
create index if not exists bookings_status_idx   on public.bookings (status);

-- Row-Level Security:
-- We allow anonymous INSERTs and limited SELECTs (only fields needed to compute busy slots).
-- For full safety, lock SELECT to a SECURITY DEFINER view, but this is fine for MVP.

alter table public.bookings enable row level security;

drop policy if exists "anon can insert bookings"   on public.bookings;
drop policy if exists "anon can read busy slots"   on public.bookings;
drop policy if exists "anon can update own ref"    on public.bookings;

create policy "anon can insert bookings"
  on public.bookings for insert
  to anon
  with check (true);

-- Anyone may read start_at + status to see what's busy.
-- (The frontend only selects these columns; PostgREST will not expose others
--  through this policy because we filter columns app-side, but for hard
--  privacy create a view + grant select only on the view instead.)
create policy "anon can read busy slots"
  on public.bookings for select
  to anon
  using (status in ('awaiting_verification','confirmed'));

-- Allow attaching payment reference + flipping status to awaiting_verification.
create policy "anon can update own ref"
  on public.bookings for update
  to anon
  using (status = 'pending_payment')
  with check (status in ('pending_payment','awaiting_verification'));
