-- Supabase > SQL Editor 에 붙여넣고 Run 하세요. (찜하기 기능용 테이블)
create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  spot_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, spot_id)
);

alter table public.favorites enable row level security;

-- 내 찜만 보고, 내 찜만 추가/삭제할 수 있게 합니다.
create policy "favorites_select_own" on public.favorites
  for select using (auth.uid() = user_id);
create policy "favorites_insert_own" on public.favorites
  for insert with check (auth.uid() = user_id);
create policy "favorites_delete_own" on public.favorites
  for delete using (auth.uid() = user_id);
