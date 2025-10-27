-- profiles: 用户档案（与 auth.users 绑定）
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text unique,
  avatar_url text,
  is_moderator boolean default false,
  created_at timestamptz default now()
);

-- games: 游戏
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text,
  price numeric default 0 check (price >= 0),
  genres text[] default '{}',
  background text,
  gameplay text,
  official_url text,
  cover_url text,           -- 建议用 Storage 的公开 URL
  creator uuid references public.profiles(id) on delete set null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz default now()
);

-- game_images: 游戏图集（可选，配合 Storage）
create table if not exists public.game_images (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  image_url text not null,
  position int default 0,
  created_at timestamptz default now()
);

-- ratings: 游戏评分
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  stars int not null check (stars between 1 and 5),
  created_at timestamptz default now()
);

-- posts: 帖子
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author_id uuid references public.profiles(id) on delete set null,
  author_name text,               -- 允许展示名字快照
  content text,
  likes int default 0 check (likes >= 0),
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz default now()
);

-- post_images: 帖子配图
create table if not exists public.post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  image_url text not null,
  position int default 0,
  created_at timestamptz default now()
);

-- comments: 评论
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  author_name text,
  content text not null,
  created_at timestamptz default now()
);

-- relations: 关注关系（去重）
create table if not exists public.relations (
  follower uuid not null references public.profiles(id) on delete cascade,
  following uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower, following),
  check (follower <> following)
);


create index if not exists idx_games_created_at on public.games(created_at desc);
create index if not exists idx_games_status on public.games(status);
create index if not exists idx_posts_created_at on public.posts(created_at desc);
create index if not exists idx_posts_status on public.posts(status);
create index if not exists idx_comments_post_id_created_at on public.comments(post_id, created_at desc);
create index if not exists idx_ratings_game_id on public.ratings(game_id);
create index if not exists idx_game_images_game_id_position on public.game_images(game_id, position);
create index if not exists idx_post_images_post_id_position on public.post_images(post_id, position);
create index if not exists idx_relations_follower on public.relations(follower);
create index if not exists idx_relations_following on public.relations(following);


alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.game_images enable row level security;
alter table public.ratings enable row level security;
alter table public.posts enable row level security;
alter table public.post_images enable row level security;
alter table public.comments enable row level security;
alter table public.relations enable row level security;

-- profiles
create policy "profiles_select_public" on public.profiles
  for select using (true);
create policy "profiles_upsert_self" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_self" on public.profiles
  for update using (auth.uid() = id);

-- games
create policy "games_select_public" on public.games
  for select using (
    status = 'approved' OR 
    creator = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_moderator = true)
  );
create policy "games_insert_auth" on public.games
  for insert with check (auth.role() = 'authenticated');
create policy "games_update_owner" on public.games
  for update using (creator = auth.uid());
create policy "games_delete_owner" on public.games
  for delete using (creator = auth.uid());

-- game_images：作者拥有
create policy "game_images_select_public" on public.game_images
  for select using (true);
create policy "game_images_mutation_owner" on public.game_images
  for all using (
    exists (select 1 from public.games g where g.id = game_images.game_id and g.creator = auth.uid())
  ) with check (
    exists (select 1 from public.games g where g.id = game_images.game_id and g.creator = auth.uid())
  );

-- ratings：登录即可评价；可允许用户更新自己的评分（可选）
create policy "ratings_select_public" on public.ratings
  for select using (true);
create policy "ratings_insert_auth" on public.ratings
  for insert with check (auth.role() = 'authenticated');
create policy "ratings_update_self" on public.ratings
  for update using (user_id = auth.uid());

-- posts
create policy "posts_select_public" on public.posts
  for select using (
    status = 'approved' OR 
    author_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_moderator = true)
  );
create policy "posts_insert_auth" on public.posts
  for insert with check (auth.role() = 'authenticated');
create policy "posts_update_owner" on public.posts
  for update using (author_id = auth.uid());
create policy "posts_delete_owner" on public.posts
  for delete using (author_id = auth.uid());

-- post_images：作者拥有
create policy "post_images_select_public" on public.post_images
  for select using (true);
create policy "post_images_mutation_owner" on public.post_images
  for all using (
    exists (select 1 from public.posts p where p.id = post_images.post_id and p.author_id = auth.uid())
  ) with check (
    exists (select 1 from public.posts p where p.id = post_images.post_id and p.author_id = auth.uid())
  );

-- comments
create policy "comments_select_public" on public.comments
  for select using (true);
create policy "comments_insert_auth" on public.comments
  for insert with check (auth.role() = 'authenticated');
create policy "comments_update_owner" on public.comments
  for update using (author_id = auth.uid());
create policy "comments_delete_owner" on public.comments
  for delete using (author_id = auth.uid());

-- relations：自己只能改与自己相关的关注关系
create policy "relations_select_public" on public.relations
  for select using (true);
create policy "relations_insert_self" on public.relations
  for insert with check (follower = auth.uid());
create policy "relations_delete_self" on public.relations
  for delete using (follower = auth.uid());
