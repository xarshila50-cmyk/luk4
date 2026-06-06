create or replace function public.reserve_post(target_post_id uuid)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  post_record public.posts;
  reservation_record public.reservations;
  requester_name text;
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

  select display_name
  into requester_name
  from public.profiles
  where id = auth.uid();

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

  insert into public.notifications (
    recipient_id,
    type,
    title,
    body,
    post_id,
    reservation_id
  )
  values (
    post_record.owner_id,
    'reservation_requested',
    'New reservation request',
    coalesce(requester_name, 'A member') || ' reserved "' || post_record.title || '".',
    target_post_id,
    reservation_record.id
  );

  return reservation_record;
end;
$$;

grant execute on function public.reserve_post(uuid) to authenticated;

create or replace function public.cancel_reservation(target_reservation_id uuid)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  reservation_record public.reservations;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  select *
  into reservation_record
  from public.reservations
  where id = target_reservation_id
  for update;

  if reservation_record.id is null then
    raise exception 'Reservation was not found.';
  end if;

  if reservation_record.requester_id <> auth.uid() then
    raise exception 'Only the requester can cancel this reservation.';
  end if;

  if reservation_record.status not in ('pending', 'accepted') then
    raise exception 'This reservation cannot be cancelled.';
  end if;

  update public.reservations
  set status = 'cancelled'
  where id = target_reservation_id
  returning * into reservation_record;

  update public.posts
  set status = 'available'
  where id = reservation_record.post_id
    and status = 'reserved';

  return reservation_record;
end;
$$;

grant execute on function public.cancel_reservation(uuid) to authenticated;

create or replace function public.mark_post_given(target_post_id uuid)
returns public.posts
language plpgsql
security definer
set search_path = public
as $$
declare
  post_record public.posts;
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

  if post_record.owner_id <> auth.uid() then
    raise exception 'Only the owner can mark this post as given.';
  end if;

  update public.posts
  set status = 'given'
  where id = target_post_id
  returning * into post_record;

  update public.reservations
  set status = 'completed'
  where post_id = target_post_id
    and status in ('pending', 'accepted');

  return post_record;
end;
$$;

grant execute on function public.mark_post_given(uuid) to authenticated;
