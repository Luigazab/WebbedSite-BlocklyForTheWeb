-- A locked or unpublished topic cannot satisfy the previous-topic gate.
create or replace function private.topic_is_complete(p_topic uuid) returns boolean
language sql security definer set search_path = '' as $$
  select exists (
    select 1 from public.topics t
    where t.id = p_topic and t.is_published and t.is_unlocked
      and exists (
        select 1 from public.lessons l where l.topics_id = t.id and l.is_published
          and l.topic_track = 'core' and l.required_for_topic
      )
      and not exists (
        select 1 from public.classroom_members m
        where m.classroom_id = t.classroom_id
          and m.enrolled_at <= coalesce(t.unlocked_at, now())
          and not exists (select 1 from public.classroom_topic_exemptions e
            where e.topic_id = t.id and e.student_id = m.student_id)
          and exists (
            select 1 from public.lessons l
            where l.topics_id = t.id and l.is_published and l.topic_track = 'core'
              and l.required_for_topic and not exists (
                select 1 from public.user_lesson_progress p
                where p.lesson_id = l.id and p.user_id = m.student_id and p.is_completed
                  and (l.type not in ('tutorial','laboratory') or exists (
                    select 1 from public.lesson_submissions s where s.lesson_id=l.id
                      and s.student_id=m.student_id and s.is_final
                  ))
              )
          )
      )
  );
$$;
