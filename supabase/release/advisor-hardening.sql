alter view public.course_with_counts set (security_invoker=true);
-- This directory intentionally exposes only display names and avatars, never email or role.
create function private.profile_directory_rows() returns table(id uuid,username text,avatar_url text) language sql stable security definer set search_path='' as $$
 select p.id,p.username,p.avatar_url from public.profiles p where auth.uid() is not null and private.account_ready();
$$;
revoke all on function private.profile_directory_rows() from public,anon;
grant execute on function private.profile_directory_rows() to authenticated;
create or replace view public.profile_directory with(security_invoker=true) as select id,username,avatar_url from private.profile_directory_rows();
revoke all on public.profile_directory from anon;
drop policy if exists profile_registration on public.profiles;
create policy profile_registration on public.profiles for insert to authenticated with check(id=(select auth.uid()) and role='student');
create function private.current_profile_role() returns text language sql stable security definer set search_path='' as $$ select role::text from public.profiles where id=auth.uid(); $$;
revoke all on function private.current_profile_role() from public,anon;
grant execute on function private.current_profile_role() to authenticated;
create or replace function public.get_user_role() returns text language sql stable security invoker set search_path='' as $$ select private.current_profile_role(); $$;
revoke all on function public.get_user_role(),public.sync_profiles_from_auth(),public.handle_streak_update() from public,anon;
grant execute on function public.get_user_role() to authenticated;
revoke all on function public.sync_profiles_from_auth(),public.handle_streak_update() from authenticated;
alter function public.handle_streak_update() set search_path='';
alter function public.sync_profiles_from_auth() set search_path='';
alter function public.try_auto_unlock_next_topic(uuid) set search_path='';
create function private.unlock_topic_owned(p_topic_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare classroom uuid;
begin
 select classroom_id into classroom from public.topics where id=p_topic_id;
 if classroom is null or not private.can_manage_classroom(classroom) then raise exception 'Classroom ownership required.';end if;
 update public.topics set is_unlocked=true,unlocked_at=now(),unlocked_by=auth.uid() where id=p_topic_id;
end $$;
create or replace function public.teacher_unlock_topic(p_topic_id uuid) returns void language sql security invoker set search_path='' begin atomic select private.unlock_topic_owned(p_topic_id);end;
revoke all on function private.unlock_topic_owned(uuid),public.teacher_unlock_topic(uuid) from public,anon;
grant execute on function private.unlock_topic_owned(uuid),public.teacher_unlock_topic(uuid) to authenticated;
