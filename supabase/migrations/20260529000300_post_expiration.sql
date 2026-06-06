alter table public.posts
add column if not exists expires_at timestamptz;

alter table public.posts
add column if not exists expired_at timestamptz;

alter table public.posts
add column if not exists storage_cleaned_at timestamptz;

alter table public.posts
add column if not exists cleanup_attempts integer not null default 0
check (cleanup_attempts >= 0);

alter table public.posts
add column if not exists cleanup_error text;

update public.posts
set expires_at = created_at + interval '30 days'
where expires_at is null;

alter table public.posts
alter column expires_at set not null;

alter table public.posts
alter column expires_at set default now() + interval '30 days';

create index if not exists posts_expiration_due_idx
on public.posts (expires_at)
where status in ('available', 'reserved');

create index if not exists posts_storage_cleanup_due_idx
on public.posts (cleanup_attempts, expired_at)
where status = 'archived'
  and expired_at is not null
  and storage_cleaned_at is null;

create table if not exists public.post_expiration_logs (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts (id) on delete set null,
  event text not null check (
    event in (
      'archived',
      'storage_cleanup_succeeded',
      'storage_cleanup_failed',
      'cleanup_skipped'
    )
  ),
  attempt integer not null default 0 check (attempt >= 0),
  image_count integer not null default 0 check (image_count >= 0),
  message text,
  created_at timestamptz not null default now()
);

create index if not exists post_expiration_logs_post_created_at_idx
on public.post_expiration_logs (post_id, created_at desc);

alter table public.post_expiration_logs enable row level security;

create policy "post expiration logs are service role only"
on public.post_expiration_logs for all
to service_role
using (true)
with check (true);

create or replace function public.mark_expired_posts(batch_size integer default 100)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  archived_count integer;
begin
  if batch_size < 1 or batch_size > 500 then
    raise exception 'Batch size must be between 1 and 500.';
  end if;

  with due_posts as (
    select id
    from public.posts
    where status in ('available', 'reserved')
      and expires_at <= now()
    order by expires_at asc
    limit batch_size
    for update skip locked
  ),
  archived_posts as (
    update public.posts
    set
      status = 'archived',
      expired_at = coalesce(expired_at, now()),
      cleanup_error = null
    where id in (select id from due_posts)
    returning id
  ),
  cancelled_reservations as (
    update public.reservations
    set status = 'cancelled'
    where post_id in (select id from archived_posts)
      and status in ('pending', 'accepted')
    returning id
  ),
  logged as (
    insert into public.post_expiration_logs (post_id, event, message)
    select
      id,
      'archived',
      'Post expired after 30 days and was archived.'
    from archived_posts
    returning id
  )
  select count(*) into archived_count from archived_posts;

  return archived_count;
end;
$$;

grant execute on function public.mark_expired_posts(integer) to service_role;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'mark-expired-posts-hourly',
      '7 * * * *',
      'select public.mark_expired_posts(250);'
    );
  end if;
end;
$$;
