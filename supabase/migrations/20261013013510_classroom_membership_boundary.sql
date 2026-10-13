-- Course-assignment authorization is only effective if clients cannot enroll
-- themselves into arbitrary classrooms or list other classrooms' join codes.
revoke all on public.classrooms, public.classroom_members from anon;
drop policy "Anyone can view classrooms to join them" on public.classrooms;
create policy classrooms_member_read on public.classrooms for select to authenticated
  using (private.can_read_classroom(id));
create policy classrooms_admin_access on public.classrooms for all to authenticated
  using ((select public.get_user_role()) = 'admin') with check ((select public.get_user_role()) = 'admin');
drop policy "Users can see members of classrooms they are in" on public.classroom_members;
create policy classroom_members_read on public.classroom_members for select to authenticated
  using (private.can_read_classroom(classroom_id));
drop policy "Students can join classrooms" on public.classroom_members;
revoke insert, update on public.classroom_members from authenticated;
grant select, delete on public.classroom_members to authenticated;
create policy classroom_members_delete on public.classroom_members for delete to authenticated
  using (student_id = (select auth.uid()) or private.can_manage_classroom(classroom_id));

create function private.join_classroom_by_code(p_join_code text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare target uuid;
begin
  if auth.uid() is null or not exists (select 1 from public.profiles where id=auth.uid() and role::text='student') then
    raise exception 'A student account is required.' using errcode='42501';
  end if;
  -- The browser previously allowed only one classroom per student. Lock the
  -- profile row so concurrent joins cannot bypass that existing rule.
  perform 1 from public.profiles where id=auth.uid() for update;
  if exists(select 1 from public.classroom_members where student_id=auth.uid()) then
    raise exception 'You already belong to a classroom.';
  end if;
  if length(btrim(p_join_code)) not between 4 and 32 then
    raise exception 'Invalid join code. Please check and try again.';
  end if;
  select id into target from public.classrooms where join_code=upper(btrim(p_join_code)) and is_active=true;
  if target is null then raise exception 'Invalid join code or inactive classroom.'; end if;
  insert into public.classroom_members(classroom_id,student_id) values(target,auth.uid());
  return target;
end $$;
revoke all on function private.join_classroom_by_code(text) from public, anon;
grant execute on function private.join_classroom_by_code(text) to authenticated, service_role;
create function public.join_classroom_by_code(p_join_code text) returns uuid
language sql security invoker set search_path='' as $$ select private.join_classroom_by_code(p_join_code); $$;
revoke all on function public.join_classroom_by_code(text) from public, anon;
grant execute on function public.join_classroom_by_code(text) to authenticated, service_role;
notify pgrst, 'reload schema';
