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

-- 2. تفعيل نظام حماية مستوى الصفوف (Row Level Security)
alter table public.messages enable row level security;

-- 3. إنشاء سياسة تسمح لأي زائر بإضافة رسالة جديدة فقط (Insert only)
-- تمنع القراءة (Select) والتعديل (Update) والحذف (Delete) لحماية خصوصية بيانات العملاء
create policy "Allow anonymous inserts"
  on public.messages
  for insert
  to anon
  with check (true);
