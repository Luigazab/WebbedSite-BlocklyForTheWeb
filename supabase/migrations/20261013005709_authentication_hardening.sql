-- Authentication audit findings 1 and 2. Helpers are private to avoid recursive
-- profile/member RLS lookups; they only answer authorization for auth.uid().
create or replace function private.can_manage_classroom(p_classroom uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and (
      p.role::text = 'admin' or (p.role::text = 'teacher' and exists (
        select 1 from public.classrooms c where c.id = p_classroom and c.teacher_id = p.id
      ))
    )
  );
$$;
create or replace function private.can_read_classroom(p_classroom uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and (
    private.can_manage_classroom(p_classroom) or exists (
      select 1 from public.classroom_members m
      where m.classroom_id = p_classroom and m.student_id = auth.uid()
    )
  );
$$;
create or replace function private.can_read_private_profile(p_profile uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and (
    p_profile = auth.uid() or exists (
      select 1 from public.profiles staff where staff.id = auth.uid() and (
        staff.role::text = 'admin' or (staff.role::text = 'teacher' and exists (
          select 1 from public.classrooms c join public.classroom_members m on m.classroom_id = c.id
          where c.teacher_id = staff.id and m.student_id = p_profile
        ))
      )
    )
  );
$$;
revoke all on function private.can_manage_classroom(uuid), private.can_read_classroom(uuid), private.can_read_private_profile(uuid) from public, anon;
grant execute on function private.can_manage_classroom(uuid), private.can_read_classroom(uuid), private.can_read_private_profile(uuid) to authenticated, service_role;
grant usage on schema private to authenticated, service_role;

alter table public.classroom_courses enable row level security;
revoke all on public.classroom_courses from anon;
grant select, insert, update, delete on public.classroom_courses to authenticated;
create policy classroom_courses_read on public.classroom_courses for select to authenticated
  using (private.can_read_classroom(classroom_id));
create policy classroom_courses_insert on public.classroom_courses for insert to authenticated
  with check (private.can_manage_classroom(classroom_id));
create policy classroom_courses_update on public.classroom_courses for update to authenticated
  using (private.can_manage_classroom(classroom_id)) with check (private.can_manage_classroom(classroom_id));
create policy classroom_courses_delete on public.classroom_courses for delete to authenticated
  using (private.can_manage_classroom(classroom_id));

revoke all on public.profiles from anon;
drop policy "Profiles are viewable by everyone" on public.profiles;
create policy profiles_private_read on public.profiles for select to authenticated
  using (private.can_read_private_profile(id));
alter policy "Users can update their own profile" on public.profiles to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Deliberately owner-executed projection: unrelated signed-in users need display
-- names without access to the underlying email, name, role, or activity columns.
-- It has exactly three safe columns, no anonymous grants, and no write grants.
-- PostgREST can infer the existing profiles foreign keys through the id column.
create view public.profile_directory with (security_barrier = true) as
  select id, username, avatar_url from public.profiles where (select auth.uid()) is not null;
revoke all on public.profile_directory from public, anon, authenticated;
grant select on public.profile_directory to authenticated;
comment on view public.profile_directory is 'Authenticated display-name/avatar projection; private profile fields remain protected by profiles RLS.';
notify pgrst, 'reload schema';
