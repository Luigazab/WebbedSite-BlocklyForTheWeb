-- A student's final lab submission completes a lesson and can unlock the next
-- published topic. Allow only that narrow, nested system update through the
-- tutorial topic ownership guard. Direct student edits remain prohibited.
create or replace function private.guard_tutorial_topic_parent() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if auth.role() in ('anon','authenticated') and exists (
    select 1 from public.lessons l where l.topics_id=old.id and l.type='tutorial') then
    if tg_op='UPDATE'
      and pg_trigger_depth()>1
      and old.is_unlocked=false and new.is_unlocked=true
      and new.unlocked_at is not null and new.unlocked_by is null
      and (to_jsonb(new)-array['is_unlocked','unlocked_at','unlocked_by'])
        = (to_jsonb(old)-array['is_unlocked','unlocked_at','unlocked_by']) then
      return new;
    end if;
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

-- Drafts belong only to the student. Teachers receive the work after submission.
drop policy if exists submissions_read on public.lesson_submissions;
create policy submissions_read on public.lesson_submissions for select to authenticated
using (
  student_id=(select auth.uid())
  or (is_final and exists (
    select 1 from public.classrooms c
    where c.id=lesson_submissions.classroom_id and c.teacher_id=(select auth.uid())
  ))
);

-- The review RPC is security definer below its public wrapper, so filter its
-- result as well; RLS alone does not protect that response.
create or replace function public.get_classroom_student_review(p_classroom uuid,p_student uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare review jsonb;
begin
  review := private.get_classroom_student_review(p_classroom,p_student);
  if auth.uid()<>p_student then
    select jsonb_set(review,'{submissions}',coalesce(jsonb_agg(entry),'[]'::jsonb)) into review
    from jsonb_array_elements(review->'submissions') entry
    where (entry->>'is_final')::boolean;
  end if;
  return review;
end $$;
