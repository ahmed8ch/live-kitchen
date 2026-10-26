-- ==========================================================
-- جداول مشروع Live Kitchen (Restaurant Ordering & Kitchen Display)
-- لتنفيذها: انسخ الكود وافتحه في SQL Editor في Supabase واضغط Run
-- ==========================================================

-- 1. جدول الطلبات (orders)
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  created_at timestamp with time zone default now() not null,
  table_number text not null, -- رقم الطاولة أو Takeaway
  customer_name text default 'عميل',
  status text not null default 'new', -- new, preparing, ready, completed
  total_amount numeric(10, 2) not null default 0,
  items_summary text not null -- ملخص الأصناف للعرض السريع
);

-- 2. تفعيل الصلاحيات لدور anon
grant all on public.orders to anon;
grant usage, select on all sequences in schema public to anon;

-- 3. تفعيل الحماية RLS وسماح القراءة والإضافة والتعديل للعملاء والمطبخ
alter table public.orders enable row level security;

drop policy if exists "Allow anonymous all on orders" on public.orders;
create policy "Allow anonymous all on orders"
  on public.orders
  for all
  to anon
  using (true)
  with check (true);

-- 4. تفعيل ميزة التحديث اللحظي (Supabase Realtime) على جدول الطلبات!
-- هذا السطر يجعل أي طلب جديد يظهر في شاشة المطبخ في نفس الثانية فوراً
alter publication supabase_realtime add table public.orders;
