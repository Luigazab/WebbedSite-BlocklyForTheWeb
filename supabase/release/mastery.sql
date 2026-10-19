create function private.get_course_mastery(p_classroom uuid,p_student uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if auth.uid() is null or not private.can_read_classroom(p_classroom) or (auth.uid()<>p_student and not private.can_manage_classroom(p_classroom)) then raise exception 'You may only view your progress or review your own classroom.'; end if;
 if not exists(select 1 from public.classroom_members where classroom_id=p_classroom and student_id=p_student) then raise exception 'Student is not enrolled.'; end if;
 with evidence as (
 select l.id,l.title,t.course_id,l.type,l.proficiency_tier,l.learning_objective,
 case when l.type='quiz' then (select max(case when a.status='completed' then 100.0*a.score/nullif(coalesce(a.score_total,(select count(*) from public.questions where quiz_id=q.id)),0) else a.score end) from public.quiz_attempts a where a.quiz_id=q.id and a.user_id=p_student and a.finished_at is not null)
 else s.score end score,
 case when l.type='quiz' then coalesce((select 100.0*a.passing_count/nullif(a.score_total,0) from public.quiz_attempts a where a.quiz_id=q.id and a.user_id=p_student and a.finished_at is not null and a.score_total>0 order by 100.0*a.score/a.score_total desc limit 1),100.0*q.passing_score/nullif((select count(*) from public.questions where quiz_id=q.id),0)) else coalesce(s.passing_score_snapshot,lab.passing_score,75) end passing,
 case when l.type='laboratory' then coalesce(s.review_status,'not_submitted') else 'assessed' end review_status
 from public.lessons l join public.topics t on t.id=l.topics_id
 left join public.quizzes q on q.lesson_id=l.id left join public.laboratories lab on lab.lesson_id=l.id
 left join public.lesson_submissions s on s.lesson_id=l.id and s.student_id=p_student and s.step_key=''
 where l.classroom_id=p_classroom and l.is_published and l.mastery_checkpoint and l.type in ('quiz','laboratory')
 ), tiers as (
 select cc.course_id,tier,
 exists(select 1 from evidence e where e.course_id=cc.course_id and e.proficiency_tier=tier and e.type='quiz')
 and exists(select 1 from evidence e where e.course_id=cc.course_id and e.proficiency_tier=tier and e.type='laboratory')
 and not exists(select 1 from evidence e where e.course_id=cc.course_id and e.proficiency_tier=tier and (e.score is null or e.score<e.passing or (e.type='laboratory' and e.review_status<>'passed'))) passed
 from public.classroom_courses cc cross join unnest(array['beginner','intermediate','advanced']) tier where cc.classroom_id=p_classroom
 )
 select coalesce(jsonb_agg(jsonb_build_object('course_id',c.id,'title',c.title,'slug',c.slug,
 'classification',case when not exists(select 1 from evidence e where e.course_id=c.id and e.score is not null) then null
 when (select bool_and(passed) from tiers where course_id=c.id) then 'advanced'
 when (select bool_and(passed) from tiers where course_id=c.id and tier in ('beginner','intermediate')) then 'intermediate' else 'beginner' end,
 'checkpoints',coalesce((select jsonb_agg(to_jsonb(e)||jsonb_build_object('passed',e.score>=e.passing and (e.type<>'laboratory' or e.review_status='passed')) order by array_position(array['beginner','intermediate','advanced'],e.proficiency_tier),e.type) from evidence e where e.course_id=c.id),'[]'::jsonb),
 'tiers',(select jsonb_agg(jsonb_build_object('tier',tier,'passed',passed)) from tiers where course_id=c.id))), '[]'::jsonb) into result
 from public.classroom_courses cc join public.courses c on c.id=cc.course_id where cc.classroom_id=p_classroom;
 return result;
end $$;
create function public.get_course_mastery(p_classroom uuid,p_student uuid) returns jsonb language sql security invoker set search_path='' begin atomic select private.get_course_mastery(p_classroom,p_student); end;
revoke all on function public.get_course_mastery(uuid,uuid),private.get_course_mastery(uuid,uuid) from public,anon;
grant execute on function public.get_course_mastery(uuid,uuid),private.get_course_mastery(uuid,uuid) to authenticated;
alter table public.lessons add constraint checkpoint_type check(not mastery_checkpoint or type in ('quiz','laboratory'));
notify pgrst,'reload schema';
