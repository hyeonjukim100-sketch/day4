-- 장바구니 테이블 (Supabase SQL Editor에서 실행)
-- 로그인한 사용자별로 담은 기념품(src/products.js 의 id)과 수량을 저장합니다.
--
-- 이전 버전(spot_id 컬럼)을 이미 실행했다면 아래 한 줄의 주석을 풀어 먼저 실행하세요.
-- drop table if exists public.cart_items;

create table if not exists public.cart_items (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  product_id text not null,
  quantity   integer not null default 1 check (quantity between 1 and 99),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- 수정 시 updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cart_items_set_updated_at on public.cart_items;
create trigger cart_items_set_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

-- RLS: 본인 장바구니만 조회/추가/수정/삭제
alter table public.cart_items enable row level security;

drop policy if exists "cart_select_own" on public.cart_items;
create policy "cart_select_own" on public.cart_items
  for select using (auth.uid() = user_id);

drop policy if exists "cart_insert_own" on public.cart_items;
create policy "cart_insert_own" on public.cart_items
  for insert with check (auth.uid() = user_id);

drop policy if exists "cart_update_own" on public.cart_items;
create policy "cart_update_own" on public.cart_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "cart_delete_own" on public.cart_items;
create policy "cart_delete_own" on public.cart_items
  for delete using (auth.uid() = user_id);
