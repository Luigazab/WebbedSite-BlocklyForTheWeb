CREATE OR REPLACE FUNCTION private.complete_classroom_lesson(p_user_id uuid, p_lesson_id uuid, p_score integer)
 RETURNS TABLE(earned_xp integer, is_first_attempt boolean, updated_best_score integer, course_total_xp bigint, did_level_up boolean, new_level bigint, next_level_xp_required bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare lesson record; progress record; attempts integer; best integer; xp integer; first_attempt boolean;
  course_xp bigint; prior_level bigint; level_value bigint; next_xp bigint;
begin
  if auth.uid() is null or auth.uid()<>p_user_id then raise exception 'You can only complete your own lessons.'; end if;
  if p_score is null or p_score<0 or p_score>100 then raise exception 'Score must be between 0 and 100.'; end if;
  select l.*,t.course_id into lesson from public.lessons l join public.topics t on t.id=l.topics_id where l.id=p_lesson_id;
  if not found or not coalesce(lesson.is_published,false) then raise exception 'Published lesson not found.'; end if;
  if lesson.classroom_id is not null and not exists(select 1 from public.classroom_members where classroom_id=lesson.classroom_id and student_id=p_user_id) then
    raise exception 'You must belong to this classroom.';
  end if;
  if lesson.type='quiz' and not exists(select 1 from public.quiz_attempts a join public.quizzes q on q.id=a.quiz_id where q.lesson_id=lesson.id and a.user_id=p_user_id and a.finished_at is not null and a.score>=coalesce(a.passing_count,q.passing_score,1)) then raise exception 'Pass the quiz before completing it.'; end if;
  if lesson.type in ('tutorial','laboratory') and not exists(select 1 from public.lesson_submissions where lesson_id=lesson.id and student_id=p_user_id and is_final) then raise exception 'Submit the activity before completing it.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text||coalesce(lesson.classroom_id::text,lesson.course_id::text),0));
  select * into progress from public.user_lesson_progress where user_id=p_user_id and lesson_id=p_lesson_id for update;
  if coalesce(progress.is_completed,false) then
    update public.user_lesson_progress set best_score=greatest(best_score,p_score) where user_id=p_user_id and lesson_id=p_lesson_id;
    select coalesce(sum(xp_earned),0) into course_xp from public.user_xp_logs where user_id=p_user_id and course_id=lesson.course_id;
    select coalesce(max(level),1) into level_value from public.levels where xp_required<=course_xp;
    select xp_required into next_xp from public.levels where level=level_value+1;
    return query select 0,false,greatest(progress.best_score,p_score),course_xp,false,level_value,next_xp;
    return;
  end if;
  attempts := coalesce(progress.attempts_count,0);
  best := greatest(coalesce(progress.best_score,0),p_score);
  first_attempt := attempts=0;
  xp := lesson.base_xp + case when p_score=100 then ceil(lesson.base_xp*0.2)::integer else 0 end;
  if not first_attempt then xp := ceil(xp*0.2)::integer; end if;
  select coalesce(max(level),1) into prior_level from public.levels where xp_required <= (
    select coalesce(sum(xp_earned),0) from public.user_xp_logs where user_id=p_user_id and course_id=lesson.course_id);
  insert into public.user_xp_logs(user_id,course_id,classroom_id,source_id,source_type,xp_earned)
    values(p_user_id,lesson.course_id,lesson.classroom_id,p_lesson_id,'lesson',xp);
  insert into public.user_lesson_progress(user_id,lesson_id,is_completed,attempts_count,best_score,completed_at)
    values(p_user_id,p_lesson_id,true,attempts+1,best,now())
    on conflict(user_id,lesson_id) do update set is_completed=true,attempts_count=excluded.attempts_count,
      best_score=excluded.best_score,completed_at=excluded.completed_at;
  select coalesce(sum(xp_earned),0) into course_xp from public.user_xp_logs where user_id=p_user_id and course_id=lesson.course_id;
  select coalesce(max(level),1) into level_value from public.levels where xp_required<=course_xp;
  select xp_required into next_xp from public.levels where level=level_value+1;
  return query select xp,first_attempt,best,course_xp,level_value>prior_level,level_value,next_xp;
end $function$;
