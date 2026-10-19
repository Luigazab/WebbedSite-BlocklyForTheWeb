CREATE OR REPLACE FUNCTION private.get_classroom_topic_flow(p_classroom uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare teacher boolean; topic record; member record; required_count integer;
  done_count integer; eligible_count integer; completed_count integer;
  completed_lessons integer; accuracy numeric; speed_bonus numeric; pending_count integer;
  exempt_reason text; late_joiner boolean; is_eligible boolean;
  student_rows jsonb; topic_rows jsonb := '[]'::jsonb; log_rows jsonb;
begin
  select c.teacher_id=auth.uid() into teacher from public.classrooms c where c.id=p_classroom;
  if teacher is null or (not teacher and not exists (
    select 1 from public.classroom_members m where m.classroom_id=p_classroom and m.student_id=auth.uid()
  )) then raise exception 'Classroom access required.'; end if;

  for topic in
    select t.id,t.title,t.course_id,t."order",t.is_published,t.is_unlocked,t.unlocked_at,t.unlocked_by
    from public.topics t join public.classroom_courses cc
      on cc.classroom_id=t.classroom_id and cc.course_id=t.course_id
    where t.classroom_id=p_classroom
    order by coalesce(cc.sequence_order,2147483647),t."order",t.id
  loop
    select count(*) into required_count from public.lessons l where l.topics_id=topic.id
      and l.is_published and l.topic_track='core' and l.required_for_topic;
    eligible_count := 0; completed_count := 0; student_rows := '[]'::jsonb;
    for member in select m.student_id,m.enrolled_at,p.username from public.classroom_members m
      join public.profiles p on p.id=m.student_id where m.classroom_id=p_classroom order by p.username
    loop
      select e.reason into exempt_reason from public.classroom_topic_exemptions e
      where e.topic_id=topic.id and e.student_id=member.student_id;
      late_joiner := topic.unlocked_at is not null and member.enrolled_at > topic.unlocked_at;
      is_eligible := exempt_reason is null and not late_joiner;
      select count(p.lesson_id) filter (where l.type not in ('tutorial','laboratory') or exists (
          select 1 from public.lesson_submissions final_submission where final_submission.lesson_id=l.id
            and final_submission.student_id=member.student_id and final_submission.is_final)),
        avg(case when l.type='laboratory' then s.score else p.best_score end),
        avg(case when metrics.active_seconds is not null and metrics.device_factor is not null
          then greatest(0,least(5,5 * (l.expected_minutes*60 - metrics.active_seconds / metrics.device_factor)
            / (l.expected_minutes*60))) else 0 end),
        count(*) filter (where l.type='laboratory' and s.id is not null and s.graded_at is null)
      into completed_lessons,accuracy,speed_bonus,pending_count
      from public.lessons l
      left join public.user_lesson_progress p on p.lesson_id=l.id and p.user_id=member.student_id and p.is_completed
      left join public.lesson_submissions s on s.lesson_id=l.id and s.student_id=member.student_id and s.step_key=''
      left join lateral (select active_seconds,device_factor from public.lesson_submissions timing
        where timing.lesson_id=l.id and timing.student_id=member.student_id and timing.is_final
        order by timing.submitted_at desc limit 1) metrics on true
      where l.topics_id=topic.id and l.is_published and l.topic_track='core' and l.required_for_topic;
      if is_eligible then
        eligible_count := eligible_count+1;
        if required_count>0 and completed_lessons=required_count then completed_count := completed_count+1; end if;
      end if;
      if teacher or member.student_id=auth.uid() then
        student_rows := student_rows || jsonb_build_array(jsonb_build_object(
          'student_id',member.student_id,'username',member.username,
          'eligible',is_eligible,'exemption_reason',exempt_reason,'late_joiner',late_joiner,
          'completed_lessons',completed_lessons,'required_lessons',required_count,
          'status',case when exempt_reason is not null then 'exempt'
            when required_count>0 and completed_lessons=required_count then 'completed'
            when late_joiner then 'late_enrollee'
            else 'working' end,
          'pending_reviews',pending_count,
          'accuracy',round(accuracy,1),'speed_bonus',0,
          'classification',(select value->>'classification' from jsonb_array_elements(private.get_course_mastery(p_classroom,member.student_id)) where value->>'course_id'=topic.course_id::text),
          'classification_provisional',pending_count>0
        ));
      end if;
    end loop;
    topic_rows := topic_rows || jsonb_build_array(jsonb_build_object(
      'id',topic.id,'title',topic.title,'course_id',topic.course_id,'order',topic."order",
      'is_published',topic.is_published,'is_unlocked',topic.is_unlocked,
      'required_lessons',required_count,'completed',completed_count,'eligible',eligible_count,
      'students',student_rows
    ));
  end loop;
  if teacher then
    select coalesce(jsonb_agg(to_jsonb(log) order by log.created_at desc),'[]'::jsonb) into log_rows
    from (select id,topic_id,student_id,actor_id,action,details,created_at
      from public.classroom_flow_log where classroom_id=p_classroom order by created_at desc limit 30) log;
  else log_rows := '[]'::jsonb; end if;
  return jsonb_build_object('topics',topic_rows,'events',log_rows);
end $function$;
