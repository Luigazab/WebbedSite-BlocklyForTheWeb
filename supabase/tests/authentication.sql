-- Read-only role simulations and catalog assertions; leaves no data changes.
begin;
do $$
declare viewer record; expected_profiles bigint; actual_profiles bigint; expected_courses bigint; actual_courses bigint;
begin
  if has_table_privilege('anon','public.profiles','SELECT') or
     has_table_privilege('anon','public.classroom_courses','SELECT,INSERT,UPDATE,DELETE') then
    raise exception 'Anonymous access is still granted';
  end if;
  if not (select relrowsecurity from pg_class where oid='public.classroom_courses'::regclass) then
    raise exception 'Course-assignment RLS is disabled';
  end if;
  if has_table_privilege('authenticated','public.classroom_members','INSERT') or
     has_function_privilege('anon','public.join_classroom_by_code(text)','EXECUTE') then
    raise exception 'Classroom membership can bypass authenticated join-code verification';
  end if;
  if exists(select 1 from information_schema.columns where table_schema='public' and table_name='profile_directory'
    and column_name not in ('id','username','avatar_url')) then
    raise exception 'Directory exposes private fields';
  end if;
  for viewer in select id,role::text as role from public.profiles loop
    select count(*) into expected_profiles from public.profiles p where p.id=viewer.id or viewer.role='admin' or
      (viewer.role='teacher' and exists(select 1 from public.classrooms c join public.classroom_members m on m.classroom_id=c.id
        where c.teacher_id=viewer.id and m.student_id=p.id));
    select count(*) into expected_courses from public.classroom_courses cc where viewer.role='admin' or
      (viewer.role='teacher' and exists(select 1 from public.classrooms c where c.id=cc.classroom_id and c.teacher_id=viewer.id)) or
      exists(select 1 from public.classroom_members m where m.classroom_id=cc.classroom_id and m.student_id=viewer.id);
    perform set_config('request.jwt.claims',json_build_object('sub',viewer.id,'role','authenticated')::text,true);
    set local role authenticated;
    select count(*) into actual_profiles from public.profiles;
    select count(*) into actual_courses from public.classroom_courses;
    reset role;
    if actual_profiles <> expected_profiles or actual_courses <> expected_courses then
      raise exception 'RLS visibility differs from the intended owner/staff/class membership rule for role %',viewer.role;
    end if;
  end loop;
end $$;
rollback;
