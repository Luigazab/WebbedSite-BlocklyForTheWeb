-- Account restrictions also apply to older explicit RPCs and private profile lookups.
create or replace function private.current_profile_role() returns text language sql stable security definer set search_path='' as $$
 select role::text from public.profiles where id=auth.uid() and private.account_ready();
$$;
create or replace function private.can_read_private_profile(p_profile uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and (p_profile=auth.uid() or (private.account_ready() and exists(
 select 1 from public.profiles staff where staff.id=auth.uid() and (staff.role='admin' or (staff.role='teacher' and exists(
 select 1 from public.classrooms c join public.classroom_members m on m.classroom_id=c.id where c.teacher_id=staff.id and m.student_id=p_profile))))));
$$;
do $guard$ declare f record; definition text; begin
 for f in select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace join pg_language lg on lg.oid=p.prolang
 where n.nspname='private' and p.prosecdef and lg.lanname='plpgsql' and p.prorettype<>'trigger'::regtype
 and p.proname<>'require_account_ready' and has_function_privilege('authenticated',p.oid,'EXECUTE') loop
 definition:=pg_get_functiondef(f.oid);
 if position('perform private.require_account_ready()' in definition)=0 then
 definition:=regexp_replace(definition,E'\\m[bB][eE][gG][iI][nN]\\M',E'begin\n if auth.uid() is not null then perform private.require_account_ready();end if;');
 execute definition;
 end if;
 end loop;
end $guard$;
notify pgrst,'reload schema';
