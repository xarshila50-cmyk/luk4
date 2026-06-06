create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 2 and 80),
  avatar_url text,
  location text not null check (char_length(trim(location)) between 2 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(trim(title)) between 3 and 120),
  description text not null check (char_length(trim(description)) between 10 and 2000),
  category text not null check (
    category in (
      'clothing',
      'home',
      'electronics',
      'books',
      'children',
      'sports',
      'other'
    )
  ),
  condition text not null check (
    condition in ('new', 'good', 'used', 'needs_repair')
  ),
  location text not null check (char_length(trim(location)) between 2 and 120),
  status text not null default 'available' check (
    status in ('available', 'reserved', 'given', 'archived')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  storage_path text not null unique,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now()
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  requester_id uuid not null references public.profiles (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (
    status in ('pending', 'accepted', 'declined', 'cancelled', 'completed')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservations_requester_is_not_owner check (requester_id <> owner_id)
);

create unique index reservations_one_active_per_post_requester
  on public.reservations (post_id, requester_id)
  where status in ('pending', 'accepted');

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (
    type in (
      'reservation_requested',
      'reservation_accepted',
      'reservation_declined',
      'reservation_cancelled',
      'post_given'
    )
  ),
  title text not null check (char_length(trim(title)) between 2 and 120),
  body text not null check (char_length(trim(body)) between 2 and 500),
  post_id uuid references public.posts (id) on delete cascade,
  reservation_id uuid references public.reservations (id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index posts_owner_id_idx on public.posts (owner_id);
create index posts_status_created_at_idx on public.posts (status, created_at desc);
create index post_images_post_id_sort_order_idx on public.post_images (post_id, sort_order);
create index reservations_post_id_idx on public.reservations (post_id);
create index reservations_requester_id_idx on public.reservations (requester_id);
create index reservations_owner_id_idx on public.reservations (owner_id);
create index notifications_recipient_created_at_idx on public.notifications (recipient_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

create trigger reservations_set_updated_at
before update on public.reservations
for each row execute function public.set_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url, location)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), 'Gaachuqe user'),
    nullif(trim(new.raw_user_meta_data->>'avatar_url'), ''),
    coalesce(nullif(trim(new.raw_user_meta_data->>'location'), ''), 'Georgia')
  );

  return new;
end;
$$;

create trigger auth_users_create_profile
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_images enable row level security;
alter table public.reservations enable row level security;
alter table public.notifications enable row level security;

create policy "profiles are readable by authenticated users"
on public.profiles for select
to authenticated
using (true);

create policy "users create their own profile"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

create policy "users update their own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "public posts are readable"
on public.posts for select
to anon, authenticated
using (status in ('available', 'reserved', 'given'));

create policy "users create their own posts"
on public.posts for insert
to authenticated
with check (owner_id = auth.uid());

create policy "owners update their own posts"
on public.posts for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "owners delete their own posts"
on public.posts for delete
to authenticated
using (owner_id = auth.uid());

create policy "images for readable posts are readable"
on public.post_images for select
to anon, authenticated
using (
  exists (
    select 1
    from public.posts
    where posts.id = post_images.post_id
      and posts.status in ('available', 'reserved', 'given')
  )
);

create policy "owners create images for their posts"
on public.post_images for insert
to authenticated
with check (
  exists (
    select 1
    from public.posts
    where posts.id = post_images.post_id
      and posts.owner_id = auth.uid()
  )
);

create policy "owners update images for their posts"
on public.post_images for update
to authenticated
using (
  exists (
    select 1
    from public.posts
    where posts.id = post_images.post_id
      and posts.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.posts
    where posts.id = post_images.post_id
      and posts.owner_id = auth.uid()
  )
);

create policy "owners delete images for their posts"
on public.post_images for delete
to authenticated
using (
  exists (
    select 1
    from public.posts
    where posts.id = post_images.post_id
      and posts.owner_id = auth.uid()
  )
);

create policy "reservation participants can read reservations"
on public.reservations for select
to authenticated
using (requester_id = auth.uid() or owner_id = auth.uid());

create policy "users request available posts from others"
on public.reservations for insert
to authenticated
with check (
  requester_id = auth.uid()
  and requester_id <> owner_id
  and exists (
    select 1
    from public.posts
    where posts.id = reservations.post_id
      and posts.owner_id = reservations.owner_id
      and posts.status = 'available'
  )
);

create policy "requesters can cancel pending reservations"
on public.reservations for update
to authenticated
using (requester_id = auth.uid() and status = 'pending')
with check (requester_id = auth.uid() and status = 'cancelled');

create policy "owners can manage reservation status"
on public.reservations for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "users read their notifications"
on public.notifications for select
to authenticated
using (recipient_id = auth.uid());

create policy "users mark their notifications read"
on public.notifications for update
to authenticated
using (recipient_id = auth.uid())
with check (recipient_id = auth.uid());

create policy "system can create notifications"
on public.notifications for insert
to authenticated
with check (recipient_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-images',
  'post-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "post images are readable for readable posts"
on storage.objects for select
to anon, authenticated
using (
  bucket_id = 'post-images'
  and exists (
    select 1
    from public.post_images
    join public.posts on posts.id = post_images.post_id
    where post_images.storage_path = storage.objects.name
      and posts.status in ('available', 'reserved', 'given')
  )
);

create policy "owners upload post images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'post-images'
  and exists (
    select 1
    from public.posts
    where posts.id::text = split_part(storage.objects.name, '/', 1)
      and posts.owner_id = auth.uid()
  )
);

create policy "owners update post images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'post-images'
  and exists (
    select 1
    from public.posts
    where posts.id::text = split_part(storage.objects.name, '/', 1)
      and posts.owner_id = auth.uid()
  )
)
with check (
  bucket_id = 'post-images'
  and exists (
    select 1
    from public.posts
    where posts.id::text = split_part(storage.objects.name, '/', 1)
      and posts.owner_id = auth.uid()
  )
);

create policy "owners delete post images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'post-images'
  and exists (
    select 1
    from public.posts
    where posts.id::text = split_part(storage.objects.name, '/', 1)
      and posts.owner_id = auth.uid()
  )
);
