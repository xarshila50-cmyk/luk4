alter table public.reservations
add column if not exists expires_at timestamptz;

update public.reservations
set expires_at = created_at + interval '24 hours'
where expires_at is null
  and status in ('pending', 'accepted');

alter table public.reservations
add constraint reservations_active_expiration_required
check (
  status not in ('pending', 'accepted')
  or expires_at is not null
);

create index if not exists reservations_status_expires_at_idx
on public.reservations (status, expires_at)
where status in ('pending', 'accepted');

create or replace function public.reserve_post(target_post_id uuid)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  post_record public.posts;
  reservation_record public.reservations;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  select *
  into post_record
  from public.posts
  where id = target_post_id
  for update;

  if post_record.id is null then
    raise exception 'Post was not found.';
  end if;

  if post_record.owner_id = auth.uid() then
    raise exception 'Owners cannot reserve their own posts.';
  end if;

  if post_record.status <> 'available' then
    raise exception 'This item is not available.';
  end if;

  update public.posts
  set status = 'reserved'
  where id = target_post_id;

  insert into public.reservations (
    post_id,
    requester_id,
    owner_id,
    status,
    expires_at
  )
  values (
    target_post_id,
    auth.uid(),
    post_record.owner_id,
    'pending',
    now() + interval '24 hours'
  )
  returning * into reservation_record;

  return reservation_record;
end;
$$;

grant execute on function public.reserve_post(uuid) to authenticated;

create or replace function public.expire_reservations()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  expired_count integer;
begin
  with expired as (
    update public.reservations
    set status = 'cancelled'
    where status in ('pending', 'accepted')
      and expires_at <= now()
    returning post_id
  ),
  unlocked as (
    update public.posts
    set status = 'available'
    where id in (select post_id from expired)
      and status = 'reserved'
    returning id
  )
  select count(*) into expired_count from expired;

  return expired_count;
end;
$$;

grant execute on function public.expire_reservations() to service_role;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'expire-reservations-every-5-minutes',
      '*/5 * * * *',
      'select public.expire_reservations();'
    );
  end if;
end;
$$;
