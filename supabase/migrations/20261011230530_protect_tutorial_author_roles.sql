-- Tutorial authorization depends on server-controlled profile roles.
-- Preserve student/teacher registration and ordinary profile editing.
create function private.guard_profile_role_changes() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if auth.jwt()->>'role' in ('anon','authenticated') and not exists (
    select 1 from public.profiles p where p.id=auth.uid() and p.role::text='admin'
  ) then
    if (tg_op='INSERT' and new.role::text='admin') or (tg_op='UPDATE' and new.role is distinct from old.role) then
      raise exception 'Only an administrator can change account roles.' using errcode='42501';
    end if;
  end if;
  return new;
end $$;
revoke all on function private.guard_profile_role_changes() from public,anon,authenticated;
create trigger guard_profile_role_changes before insert or update of role on public.profiles for each row execute function private.guard_profile_role_changes();

do $$
declare policy record;
begin
  for policy in select policyname from pg_policies where schemaname='public' and tablename='profiles' and cmd='INSERT' loop
    execute format('drop policy %I on public.profiles',policy.policyname);
  end loop;
end $$;
create policy profile_registration on public.profiles for insert to authenticated
  with check (id=(select auth.uid()) and role::text in ('student','teacher'));

-- Check the proposed parent lesson, not a lookup of the tutorial's old row.
-- This prevents reparenting owned content into another teacher's lesson.
create function private.tutorial_lesson_can_edit(p_lesson uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select auth.uid() is not null and exists (
    select 1 from public.lessons l join public.profiles p on p.id=auth.uid()
    left join public.classrooms c on c.id=l.classroom_id
    where l.id=p_lesson and l.type='tutorial' and
      (p.role::text='admin' or (p.role::text='teacher' and c.teacher_id=p.id))
  );
$$;
revoke all on function private.tutorial_lesson_can_edit(uuid) from public,anon;
grant execute on function private.tutorial_lesson_can_edit(uuid) to authenticated,service_role;
drop policy tutorial_author_access on public.tutorials;
create policy tutorial_author_access on public.tutorials for all to authenticated
  using (private.tutorial_lesson_can_edit(lesson_id)) with check (private.tutorial_lesson_can_edit(lesson_id));

create policy tutorial_proofs_deny_client_access on private.tutorial_validation_proofs
  for all to anon,authenticated using (false) with check (false);
