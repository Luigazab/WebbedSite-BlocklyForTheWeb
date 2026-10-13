-- Legacy parent-table policies are permissive. Enforce tutorial ownership at
-- their write boundary, including FK cascades which bypass child-table RLS.
create function private.tutorial_classroom_can_edit(p_classroom uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.profiles p where p.id=auth.uid() and
    (p.role::text='admin' or (p.role::text='teacher' and exists(
      select 1 from public.classrooms c where c.id=p_classroom and c.teacher_id=p.id))));
$$;
revoke all on function private.tutorial_classroom_can_edit(uuid) from public,anon;
grant execute on function private.tutorial_classroom_can_edit(uuid) to authenticated,service_role;

create function private.guard_tutorial_lesson_parent() returns trigger
language plpgsql security definer set search_path='' as $$
declare affects_tutorial boolean;
begin
  if tg_op='INSERT' then affects_tutorial := new.type='tutorial';
  elsif tg_op='DELETE' then affects_tutorial := old.type='tutorial';
  else affects_tutorial := old.type='tutorial' or new.type='tutorial'; end if;
  if affects_tutorial and auth.role() in ('anon','authenticated') then
    if tg_op<>'INSERT' and not private.tutorial_classroom_can_edit(old.classroom_id) then
      raise exception 'You cannot edit this tutorial lesson.' using errcode='42501';
    end if;
    if tg_op<>'DELETE' and (not private.tutorial_classroom_can_edit(new.classroom_id) or not exists(
      select 1 from public.topics t where t.id=new.topics_id and t.classroom_id is not distinct from new.classroom_id)) then
      raise exception 'The tutorial must belong to a topic in your classroom.' using errcode='42501';
    end if;
  end if;
  if tg_op='DELETE' then return old; end if;
  return new;
end $$;
revoke all on function private.guard_tutorial_lesson_parent() from public,anon,authenticated;
create trigger guard_tutorial_lesson_parent before insert or update or delete on public.lessons for each row execute function private.guard_tutorial_lesson_parent();

create function private.guard_tutorial_topic_parent() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if auth.role() in ('anon','authenticated') and exists(
    select 1 from public.lessons l where l.topics_id=old.id and l.type='tutorial') then
    if not private.tutorial_classroom_can_edit(old.classroom_id) then
      raise exception 'You cannot change another teacher''s tutorial topic.' using errcode='42501';
    end if;
    if tg_op='UPDATE' and new.classroom_id is distinct from old.classroom_id then
      raise exception 'A topic containing tutorials cannot be moved between classrooms.' using errcode='42501';
    end if;
  end if;
  if tg_op='DELETE' then return old; end if;
  return new;
end $$;
revoke all on function private.guard_tutorial_topic_parent() from public,anon,authenticated;
create trigger guard_tutorial_topic_parent before update or delete on public.topics for each row execute function private.guard_tutorial_topic_parent();
