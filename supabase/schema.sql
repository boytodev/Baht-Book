-- สมุดเงิน: สคีมาฐานข้อมูล
-- วิธีใช้: Supabase Dashboard → SQL Editor → วางทั้งไฟล์นี้แล้วกด Run

-- ---------------------------------------------------------------
-- ตาราง
-- ---------------------------------------------------------------

create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 40),
  type       text not null check (type in ('income', 'expense')),
  created_at timestamptz not null default now(),
  unique (user_id, type, name)
);

create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  type        text not null check (type in ('income', 'expense')),
  -- เก็บเป็นสตางค์ (จำนวนเต็ม) เช่น 85 บาท = 8500 เพื่อเลี่ยงทศนิยมคลาดเคลื่อน
  amount      bigint not null check (amount > 0),
  note        text check (note is null or char_length(note) <= 200),
  occurred_on date not null default current_date,
  created_at  timestamptz not null default now()
);

create index if not exists transactions_user_date_idx
  on public.transactions (user_id, occurred_on desc, created_at desc);

-- ---------------------------------------------------------------
-- Row Level Security: ผู้ใช้แต่ละคนเห็นและแก้ได้เฉพาะข้อมูลของตัวเอง
-- ---------------------------------------------------------------

alter table public.categories   enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "own categories" on public.categories;
create policy "own categories" on public.categories
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "own transactions" on public.transactions;
create policy "own transactions" on public.transactions
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------
-- หมวดหมู่เริ่มต้น: สร้างให้อัตโนมัติเมื่อมีผู้ใช้ใหม่สมัคร
-- ---------------------------------------------------------------

create or replace function public.seed_default_categories()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.categories (user_id, name, type) values
    (new.id, 'อาหาร',        'expense'),
    (new.id, 'ที่อยู่อาศัย',  'expense'),
    (new.id, 'เดินทาง',      'expense'),
    (new.id, 'บิล',          'expense'),
    (new.id, 'บันเทิง',      'expense'),
    (new.id, 'อื่น ๆ',       'expense'),
    (new.id, 'เงินเดือน',    'income'),
    (new.id, 'รายได้เสริม',  'income'),
    (new.id, 'อื่น ๆ',       'income');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_seed_categories on auth.users;
create trigger on_auth_user_created_seed_categories
  after insert on auth.users
  for each row execute function public.seed_default_categories();
