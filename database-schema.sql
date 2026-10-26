-- ====================================================================
-- Live Kitchen · Enterprise Database Schema & Managed Realtime Architecture
-- Ready for execution in Supabase SQL Editor
-- ====================================================================

-- 1. جدول الطاولات ومخطط الصالة (Tables & Floor Plan)
create table if not exists public.restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now() not null,
  table_code text not null unique, -- e.g. T-01, T-02, T-04
  floor_section text not null default 'First Floor', -- First Floor, Second Floor, Outdoor
  capacity int not null default 4,
  status text not null default 'available', -- available, reserved, occupied, cleaning
  guest_name text,
  seated_at timestamp with time zone,
  reservation_time text
);

-- 2. جدول الحجوزات (Reservations)
create table if not exists public.table_reservations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now() not null,
  table_code text not null,
  guest_name text not null,
  guest_phone text,
  guest_count int not null default 2,
  reservation_date date not null default current_date,
  reservation_time text not null,
  status text not null default 'confirmed' -- confirmed, seated, cancelled
);

-- 3. جدول الطلبات الشامل (Orders)
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  created_at timestamp with time zone default now() not null,
  table_number text not null default 'T-01',
  order_type text not null default 'dine_in', -- dine_in, takeaway, delivery
  customer_name text not null default 'Guest Diner',
  customer_phone text,
  status text not null default 'new', -- new, confirmed, preparing, ready, served, cancelled
  subtotal numeric(10, 2) not null default 0,
  tax_amount numeric(10, 2) not null default 0,
  total_amount numeric(10, 2) not null default 0,
  items_summary text not null,
  order_payload jsonb -- Full JSON snapshot of items + modifiers + notes
);

-- 4. الصلاحيات لدور anon (Managed Stack RLS)
grant all on public.restaurant_tables to anon;
grant all on public.table_reservations to anon;
grant all on public.orders to anon;
grant usage, select on all sequences in schema public to anon;

alter table public.restaurant_tables enable row level security;
alter table public.table_reservations enable row level security;
alter table public.orders enable row level security;

drop policy if exists "Allow anonymous all on tables" on public.restaurant_tables;
create policy "Allow anonymous all on tables" on public.restaurant_tables for all to anon using (true) with check (true);

drop policy if exists "Allow anonymous all on reservations" on public.table_reservations;
create policy "Allow anonymous all on reservations" on public.table_reservations for all to anon using (true) with check (true);

drop policy if exists "Allow anonymous all on orders" on public.orders;
create policy "Allow anonymous all on orders" on public.orders for all to anon using (true) with check (true);

-- 5. تفعيل التحديث اللحظي (Supabase Realtime) للجداول الثلاثة
alter publication supabase_realtime add table public.restaurant_tables;
alter publication supabase_realtime add table public.table_reservations;
alter publication supabase_realtime add table public.orders;
