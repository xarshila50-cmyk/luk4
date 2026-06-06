alter table public.profiles
add column if not exists phone_number text;

alter table public.profiles
drop constraint if exists profiles_phone_number_format;

alter table public.profiles
add constraint profiles_phone_number_format
check (
  phone_number is null
  or phone_number ~ '^\+9955[0-9]{8}$'
);

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url, location, phone_number)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), 'Gaachuqe user'),
    nullif(trim(new.raw_user_meta_data->>'avatar_url'), ''),
    coalesce(nullif(trim(new.raw_user_meta_data->>'location'), ''), 'Georgia'),
    nullif(trim(new.raw_user_meta_data->>'phone_number'), '')
  );

  return new;
end;
$$;
