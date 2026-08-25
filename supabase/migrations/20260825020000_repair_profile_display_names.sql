drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    display_name = coalesce(
      nullif(trim(public.profiles.display_name), ''),
      excluded.display_name
    ),
    updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update of raw_user_meta_data, email on auth.users
for each row
execute function public.handle_new_user_profile();

insert into public.profiles (id, email, display_name)
select
  users.id,
  users.email,
  nullif(trim(coalesce(users.raw_user_meta_data ->> 'display_name', '')), '')
from auth.users as users
on conflict (id) do update
set
  email = excluded.email,
  display_name = coalesce(
    nullif(trim(public.profiles.display_name), ''),
    excluded.display_name
  ),
  updated_at = timezone('utc', now());
