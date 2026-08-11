-- kisei-note: Supabase スキーマ
-- Supabase ダッシュボードの SQL Editor に貼り付けて実行してください。

create extension if not exists pgcrypto;

-- 市町村（地元 / 現在地として登録される場所）
create table if not exists places (
  id uuid primary key default gen_random_uuid(),
  city_key text unique not null,
  city text not null,
  prefecture text,
  country text,
  lat double precision,
  lng double precision,
  kaisei_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- その場所の「魅力」投稿
create table if not exists charms (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references places(id) on delete cascade,
  content text not null,
  likes_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists charms_place_id_idx on charms (place_id);
create index if not exists places_kaisei_count_idx on places (kaisei_count desc);

-- いいね数の加算（同時実行でも安全なアトミック更新）
create or replace function increment_likes(charm_id uuid)
returns void
language sql
as $$
  update charms set likes_count = likes_count + 1 where id = charm_id;
$$;

-- 「帰省したい」票数の加算
create or replace function increment_kaisei(target_place_id uuid)
returns void
language sql
as $$
  update places set kaisei_count = kaisei_count + 1 where id = target_place_id;
$$;

-- RLS: このアプリはログイン機能を持たないため、匿名キーで読み書きできるようにする。
-- (二重投票/二重いいねの防止はクライアント側の localStorage で行っている簡易実装です)
alter table places enable row level security;
alter table charms enable row level security;

create policy "public read places" on places for select using (true);
create policy "public insert places" on places for insert with check (true);
create policy "public update places" on places for update using (true);

create policy "public read charms" on charms for select using (true);
create policy "public insert charms" on charms for insert with check (true);
create policy "public update charms" on charms for update using (true);
