-- ==========================================================
-- كود إنشاء الجدول وسياسة الأمان (RLS) في Supabase
-- الصق هذا الكود في SQL Editor داخل لوحة تحكم Supabase واضغط Run
-- ==========================================================

-- 1. إنشاء جدول messages
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  created_at timestamp with time zone default now() not null,
  name text not null,
  phone text not null,
  message text not null
);

-- 2. إعطاء الصلاحيات لدور anon (مطلوبة لـ Data API)
grant insert on public.messages to anon;
grant usage, select on all sequences in schema public to anon;

-- 3. تفعيل نظام حماية مستوى الصفوف (Row Level Security)
alter table public.messages enable row level security;

-- 4. إنشاء سياسة تسمح لأي زائر بإضافة رسالة جديدة فقط (Insert only)
-- تمنع القراءة (Select) والتعديل (Update) والحذف (Delete) لحماية خصوصية بيانات العملاء
drop policy if exists "Allow anonymous inserts" on public.messages;
create policy "Allow anonymous inserts"
  on public.messages
  for insert
  to anon
  with check (true);
