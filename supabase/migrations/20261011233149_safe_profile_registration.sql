-- Create profiles at the trusted signup boundary, including when email
-- confirmation means the browser has no authenticated session yet.
create function private.create_signup_profile() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  insert into public.profiles(id,username,email,role)
    values(new.id,
      coalesce(nullif(btrim(new.raw_user_meta_data->>'username'),''),'user-'||new.id::text),
      coalesce(new.email,''),
      (case when new.raw_user_meta_data->>'role'='teacher' then 'teacher' else 'student' end)::public.user_roles)
    on conflict(id) do nothing;
  return new;
end $$;
revoke all on function private.create_signup_profile() from public,anon,authenticated;
create trigger create_signup_profile after insert on auth.users for each row execute function private.create_signup_profile();
