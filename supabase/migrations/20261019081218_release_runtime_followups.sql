-- Retain foreign-key inference for the deliberately limited display directory.
create or replace view public.profile_directory with(security_invoker=false,security_barrier=true) as
 select id,username,avatar_url from public.profiles where auth.uid() is not null and private.account_ready();
revoke all on public.profile_directory from public,anon,authenticated;
grant select on public.profile_directory to authenticated;
comment on view public.profile_directory is 'Intentional owner-executed projection of display name/avatar only. Preserves PostgREST profile foreign-key joins; no email, role, or activity fields.';
drop function private.profile_directory_rows();
create or replace function private.account_ready() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles p join auth.users u on u.id=p.id where p.id=auth.uid() and not p.must_change_password and (u.banned_until is null or u.banned_until<=now()));
$$;
create or replace function private.can_manage_classroom(p_classroom uuid) returns boolean language sql stable security definer set search_path='' as $$
 select private.account_ready() and exists(select 1 from public.profiles p where p.id=auth.uid() and (p.role='admin' or (p.role='teacher' and exists(select 1 from public.classrooms c where c.id=p_classroom and c.teacher_id=p.id))));
$$;
create or replace function private.can_read_classroom(p_classroom uuid) returns boolean language sql stable security definer set search_path='' as $$
 select private.account_ready() and (private.can_manage_classroom(p_classroom) or exists(select 1 from public.classroom_members where classroom_id=p_classroom and student_id=auth.uid()));
$$;
create policy active_profile_write on public.profiles as restrictive for update to authenticated using(private.account_ready()) with check(private.account_ready());
create function private.require_account_ready() returns void language plpgsql stable security definer set search_path='' as $$
begin if not private.account_ready() then raise exception 'Complete account setup or contact your administrator about account access.';end if;end $$;
revoke all on function private.require_account_ready() from public,anon;
grant execute on function private.require_account_ready() to authenticated;
-- Private service-only tutorial adapters authenticate their explicit user separately.
do $guard$ declare f record; definition text; begin
 for f in select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='private' and p.proname in ('submit_laboratory','grade_lab_rubric','copy_learning_project','begin_assessed_quiz','finish_assessed_quiz','complete_classroom_lesson','save_lesson_submission','grade_laboratory_submission','release_dashboard','quiz_editor_data') loop
 definition:=pg_get_functiondef(f.oid);
 definition:=regexp_replace(definition,E'\\m[bB][eE][gG][iI][nN]\\M',E'begin\n if auth.uid() is not null then perform private.require_account_ready();end if;');
 execute definition;
 end loop;
end $guard$;
-- Expired attempts stay in history even when the student leaves the quiz page.
do $expiry$ declare definition text; begin
 definition:=pg_get_functiondef('private.begin_assessed_quiz(uuid)'::regprocedure);
 definition:=replace(definition,'select * into a from public.quiz_attempts',E'update public.quiz_attempts set score=0,status=\'completed\',finished_at=now() where user_id=auth.uid() and quiz_id=p_quiz and finished_at is null and deadline<=now();\n select * into a from public.quiz_attempts');
 execute definition;
end $expiry$;
notify pgrst,'reload schema';
