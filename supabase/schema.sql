-- Run this in Supabase SQL Editor.
create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  guests integer not null default 1 check (guests between 1 and 10),
  attending boolean not null default true,
  note text,
  created_at timestamptz not null default now()
);

alter table public.rsvps enable row level security;

-- Public visitors can submit an RSVP, but cannot read the guest list.
drop policy if exists "Anyone can submit RSVP" on public.rsvps;
create policy "Anyone can submit RSVP"
on public.rsvps for insert
to anon, authenticated
with check (
  char_length(trim(name)) between 2 and 100
  and char_length(trim(phone)) between 8 and 16
  and guests between 1 and 10
);

-- Only authenticated admins can view guest responses.
drop policy if exists "Admins can view RSVPs" on public.rsvps;
create policy "Admins can view RSVPs"
on public.rsvps for select
to authenticated
using (true);

-- Do not add a public SELECT policy.
-- Create the admin account in Supabase Dashboard > Authentication > Users.
