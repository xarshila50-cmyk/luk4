alter table public.profiles
add column if not exists role text not null default 'member'
check (role in ('member', 'admin'));

create index if not exists profiles_role_idx
on public.profiles (role);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles (id) on delete set null,
  post_id uuid references public.posts (id) on delete cascade,
  subject text not null check (char_length(trim(subject)) between 2 and 120),
  body text not null check (char_length(trim(body)) between 2 and 1000),
  status text not null default 'open' check (
    status in ('open', 'reviewing', 'resolved', 'dismissed')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reports_status_created_at_idx
on public.reports (status, created_at desc);

create index if not exists reports_post_id_idx
on public.reports (post_id);

create trigger reports_set_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

alter table public.reports enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

create policy "admins read all profiles"
on public.profiles for select
to authenticated
using (public.is_admin());

create policy "admins update profiles"
on public.profiles for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins read all posts"
on public.posts for select
to authenticated
using (public.is_admin());

create policy "admins delete all posts"
on public.posts for delete
to authenticated
using (public.is_admin());

create policy "admins read all images"
on public.post_images for select
to authenticated
using (public.is_admin());

create policy "admins delete all images"
on public.post_images for delete
to authenticated
using (public.is_admin());

create policy "admins read all reservations"
on public.reservations for select
to authenticated
using (public.is_admin());

create policy "users create reports"
on public.reports for insert
to authenticated
with check (reporter_id = auth.uid());

create policy "reporters read their reports"
on public.reports for select
to authenticated
using (reporter_id = auth.uid());

create policy "admins manage reports"
on public.reports for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins delete storage objects"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'post-images'
  and public.is_admin()
);

create or replace function public.admin_dashboard_stats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select case
    when not public.is_admin() then
      jsonb_build_object('error', 'Admin access is required.')
    else
      jsonb_build_object(
        'users', (select count(*) from public.profiles),
        'posts', (select count(*) from public.posts),
        'openReports', (select count(*) from public.reports where status in ('open', 'reviewing')),
        'reservations', (select count(*) from public.reservations),
        'expiredPosts', (select count(*) from public.posts where status = 'archived')
      )
  end;
$$;

grant execute on function public.admin_dashboard_stats() to authenticated;
