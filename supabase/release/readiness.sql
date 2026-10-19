create function private.account_ready() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.profiles where id=auth.uid() and not must_change_password); $$;
revoke all on function private.account_ready() from public,anon;
grant execute on function private.account_ready() to authenticated;
do $$ declare tab record; begin
 for tab in select tablename from pg_tables where schemaname='public' and rowsecurity and tablename<>'profiles' loop
 execute format('create policy account_setup_required on public.%I as restrictive for all to authenticated using ((select private.account_ready())) with check ((select private.account_ready()))',tab.tablename);
 end loop;
end $$;
create or replace function private.can_manage_classroom(p_classroom uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.profiles p where p.id=auth.uid() and not p.must_change_password and
 (p.role::text='admin' or (p.role::text='teacher' and exists(select 1 from public.classrooms c where c.id=p_classroom and c.teacher_id=p.id))));
$$;
create function private.sync_confirmed_email() returns trigger language plpgsql security definer set search_path='' as $$ begin
 if new.email is distinct from old.email then update public.profiles set email=new.email where id=new.id; end if; return new;
end $$;
create trigger sync_confirmed_profile_email after update of email on auth.users for each row execute function private.sync_confirmed_email();
revoke all on function private.sync_confirmed_email() from public,anon,authenticated;
