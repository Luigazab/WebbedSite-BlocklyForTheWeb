alter table public.classroom_badge_rules drop constraint classroom_badge_rules_criterion_check;
alter table public.classroom_badge_rules drop constraint classroom_badge_rules_check;
alter table public.classroom_badge_rules add constraint classroom_badge_rules_criterion_check check(criterion in ('topic_completed','topic_mastered','course_xp'));
alter table public.classroom_badge_rules add constraint classroom_badge_rules_check check((criterion in ('topic_completed','topic_mastered') and topic_id is not null and xp_target is null) or (criterion='course_xp' and topic_id is null and xp_target>0));
create function private.passed_topic_checkpoints(p_student uuid,p_classroom uuid,p_topic uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.lessons where topics_id=p_topic and classroom_id=p_classroom and is_published and mastery_checkpoint and type='quiz')
 and exists(select 1 from public.lessons where topics_id=p_topic and classroom_id=p_classroom and is_published and mastery_checkpoint and type='laboratory')
 and not exists(select 1 from public.lessons l where topics_id=p_topic and classroom_id=p_classroom and is_published and mastery_checkpoint and (
  (l.type='quiz' and not exists(select 1 from public.quizzes q join public.quiz_attempts a on a.quiz_id=q.id where q.lesson_id=l.id and a.user_id=p_student and a.finished_at is not null and
  case when a.status='completed' then a.score>=coalesce(a.passing_count,q.passing_score) else a.score>=100.0*q.passing_score/nullif((select count(*) from public.questions where quiz_id=q.id),0) end))
  or (l.type='laboratory' and not exists(select 1 from public.lesson_submissions s where s.lesson_id=l.id and s.student_id=p_student and s.is_final and s.review_status='passed'))));
$$;
CREATE OR REPLACE FUNCTION private.evaluate_classroom_badges(p_student uuid, p_classroom uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare r record; award_id uuid; requirement_text text;
begin
  if auth.uid() is not null and auth.uid()<>p_student and not private.can_manage_classroom(p_classroom) then
    raise exception 'Not authorized to evaluate this student.';
  end if;
  if not exists(select 1 from public.classroom_members where classroom_id=p_classroom and student_id=p_student) then return; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_student::text||p_classroom::text,0));
  for r in select b.*,c.title as course_title,t.title as topic_title from public.classroom_badge_rules b
    join public.courses c on c.id=b.course_id left join public.topics t on t.id=b.topic_id
    where b.classroom_id=p_classroom and b.is_active
    and exists(select 1 from public.classroom_courses cc where cc.classroom_id=p_classroom and cc.course_id=b.course_id)
    and not exists(select 1 from public.classroom_badge_awards a where a.rule_id=b.id and a.student_id=p_student)
  loop
    if r.criterion='topic_completed' then
      if not exists(select 1 from public.lessons l where l.topics_id=r.topic_id and l.classroom_id=p_classroom and l.is_published) then continue; end if;
      if exists(select 1 from public.lessons l where l.topics_id=r.topic_id and l.classroom_id=p_classroom and l.is_published
        and not exists(select 1 from public.user_lesson_progress p where p.user_id=p_student and p.lesson_id=l.id and p.is_completed)) then continue; end if;
      requirement_text := 'Completed all lessons in '||r.topic_title;
    elsif r.criterion='topic_mastered' then
      if not private.passed_topic_checkpoints(p_student,p_classroom,r.topic_id) then continue; end if;
      requirement_text := 'Passed checkpoint quizzes and laboratories in '||r.topic_title;
    else
      if (select coalesce(sum(x.xp_earned),0) from public.user_xp_logs x where x.user_id=p_student and x.course_id=r.course_id
        and (x.classroom_id=p_classroom or (x.classroom_id is null and exists(select 1 from public.lessons l where l.id=x.source_id and l.classroom_id=p_classroom)))) < r.xp_target then continue; end if;
      requirement_text := 'Reached '||r.xp_target||' XP in '||r.course_title;
    end if;
    award_id := null;
    insert into public.classroom_badge_awards(rule_id,student_id,classroom_id,name,description,image_url,requirement)
      values(r.id,p_student,p_classroom,r.name,r.description,r.image_url,requirement_text)
      on conflict(rule_id,student_id) do nothing returning id into award_id;
    if award_id is not null then
      insert into public.classroom_posts(classroom_id,author_id,type,content)
        values(p_classroom,p_student,'badge_earned','earned the "'||r.name||'" badge! '||requirement_text||'.');
    end if;
  end loop;
end $function$;
create function private.review_awards() returns trigger language plpgsql security definer set search_path='' as $$
begin if new.review_status='passed' and new.review_status is distinct from old.review_status then perform private.evaluate_classroom_badges(new.student_id,new.classroom_id); end if; return new; end $$;
create trigger review_mastery_badges after update of review_status on public.lesson_submissions for each row execute function private.review_awards();
revoke all on function private.passed_topic_checkpoints(uuid,uuid,uuid),private.review_awards() from public,anon,authenticated;
