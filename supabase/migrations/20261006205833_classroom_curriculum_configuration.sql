-- Save curriculum edits atomically, then evaluate progression in the final order.
create or replace function private.recompute_classroom_topic_unlocks(p_classroom uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare current_topic record; previous_topic uuid; previous_complete boolean := false;
begin
  if current_setting('webbedsite.defer_topic_flow',true) = 'on' then return; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_classroom::text,0));
  for current_topic in
    select t.id,t.is_published,t.is_unlocked from public.topics t
    join public.classroom_courses cc on cc.classroom_id=t.classroom_id and cc.course_id=t.course_id
    where t.classroom_id=p_classroom
    order by cc.sequence_order,t."order",t.id
  loop
    if current_topic.is_published and not current_topic.is_unlocked
      and (previous_topic is null or previous_complete) then
      update public.topics set is_unlocked=true,unlocked_at=now(),unlocked_by=null where id=current_topic.id;
    end if;
    previous_topic := current_topic.id;
    previous_complete := private.topic_is_complete(current_topic.id);
  end loop;
end $$;

create function private.assign_classroom_courses_ordered(p_classroom_id uuid,p_course_ids uuid[])
returns void language plpgsql security definer set search_path = '' as $$
declare course uuid; position integer := 0; previous_defer text;
begin
  if auth.uid() is null or not exists(select 1 from public.classrooms where id=p_classroom_id and teacher_id=auth.uid())
    then raise exception 'Only the classroom teacher can manage its courses.'; end if;
  if p_course_ids is null or cardinality(p_course_ids)=0 or array_position(p_course_ids,null) is not null
    then raise exception 'Select at least one valid course.'; end if;
  -- DISTINCT alone sorts UUIDs and discards the order chosen by the teacher.
  select array_agg(id order by first_position) into p_course_ids
  from (select id,min(ordinality) as first_position from unnest(p_course_ids) with ordinality as chosen(id,ordinality) group by id) ordered;
  if cardinality(p_course_ids)>4 then raise exception 'A classroom can hold at most four courses.'; end if;
  if exists(select 1 from unnest(p_course_ids) as requested(course_id) where not exists(select 1 from public.courses c where c.id=requested.course_id))
    then raise exception 'One of the selected courses no longer exists.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_classroom_id::text,0));
  previous_defer := coalesce(current_setting('webbedsite.defer_topic_flow',true),'off');
  perform set_config('webbedsite.defer_topic_flow','on',true);
  delete from public.classroom_courses where classroom_id=p_classroom_id and course_id<>all(p_course_ids);
  foreach course in array p_course_ids loop
    position := position+1;
    if not exists(select 1 from public.classroom_courses where classroom_id=p_classroom_id and course_id=course) then
      if exists(select 1 from public.topics where classroom_id=p_classroom_id and course_id=course) then
        -- Reassigning a course reuses its classroom lessons and saved student work.
        insert into public.classroom_courses(classroom_id,course_id,sequence_order) values(p_classroom_id,course,position);
      else
        perform public.clone_course_to_classroom(p_classroom_id,course);
      end if;
    end if;
    update public.classroom_courses set sequence_order=position where classroom_id=p_classroom_id and course_id=course;
  end loop;
  perform set_config('webbedsite.defer_topic_flow',previous_defer,true);
  perform private.recompute_classroom_topic_unlocks(p_classroom_id);
end $$;
revoke all on function private.assign_classroom_courses_ordered(uuid,uuid[]) from public,anon;
grant execute on function private.assign_classroom_courses_ordered(uuid,uuid[]) to authenticated;
create or replace function public.assign_courses_to_classroom(p_classroom_id uuid,p_course_ids uuid[])
returns void language sql security invoker set search_path = '' begin atomic
  select private.assign_classroom_courses_ordered(p_classroom_id,p_course_ids);
end;
revoke all on function public.assign_courses_to_classroom(uuid,uuid[]) from public,anon;
grant execute on function public.assign_courses_to_classroom(uuid,uuid[]) to authenticated;

create function private.configure_classroom_course_topics(p_classroom_id uuid,p_course_id uuid,p_topics jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare item record; topic_id uuid; temporary_offset integer; previous_defer text;
begin
  if auth.uid() is null or not exists(select 1 from public.classrooms where id=p_classroom_id and teacher_id=auth.uid())
    then raise exception 'Only the classroom teacher can configure these topics.'; end if;
  if not exists(select 1 from public.classroom_courses where classroom_id=p_classroom_id and course_id=p_course_id)
    then raise exception 'Assign this course before configuring its topics.'; end if;
  if jsonb_typeof(p_topics) is distinct from 'array' then raise exception 'Provide an ordered topic list.'; end if;
  if jsonb_array_length(p_topics) not between 1 and 200 then raise exception 'Provide between 1 and 200 topics.'; end if;
  if exists(select 1 from jsonb_array_elements(p_topics) entry
    where length(trim(coalesce(entry->>'title',''))) not between 1 and 160
      or length(coalesce(entry->>'description',''))>2000
      or jsonb_typeof(entry->'is_published') is distinct from 'boolean')
    then raise exception 'Each topic needs a title, a publication status, and a description of at most 2000 characters.'; end if;
  if exists(select 1 from jsonb_array_elements(p_topics) entry where nullif(entry->>'id','') is not null
    group by entry->>'id' having count(*)>1) then raise exception 'A topic cannot appear twice.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_classroom_id::text,0));
  if exists(select 1 from jsonb_array_elements(p_topics) entry where nullif(entry->>'id','') is not null
    and not exists(select 1 from public.topics t where t.id=(entry->>'id')::uuid and t.classroom_id=p_classroom_id and t.course_id=p_course_id))
    then raise exception 'A topic does not belong to this classroom course.'; end if;
  if exists(select 1 from public.topics t where t.classroom_id=p_classroom_id and t.course_id=p_course_id
    and not exists(select 1 from jsonb_array_elements(p_topics) entry where entry->>'id'=t.id::text))
    then raise exception 'The topics changed. Reopen the editor and include every existing topic.'; end if;
  previous_defer := coalesce(current_setting('webbedsite.defer_topic_flow',true),'off');
  perform set_config('webbedsite.defer_topic_flow','on',true);
  select coalesce(max(abs("order")),0)+jsonb_array_length(p_topics)+1 into temporary_offset
    from public.topics where classroom_id=p_classroom_id and course_id=p_course_id;
  -- Vacate all original positions before swapping rows under the unique constraint.
  with positions as (
    select id,row_number() over(order by id) as position from public.topics
    where classroom_id=p_classroom_id and course_id=p_course_id
  )
  update public.topics t set "order"=temporary_offset+positions.position from positions where t.id=positions.id;
  for item in select value,ordinality from jsonb_array_elements(p_topics) with ordinality loop
    topic_id := nullif(item.value->>'id','')::uuid;
    if topic_id is null then
      topic_id := gen_random_uuid();
      insert into public.topics(id,classroom_id,course_id,title,description,"order",is_published,is_unlocked,slug)
      values(topic_id,p_classroom_id,p_course_id,trim(item.value->>'title'),coalesce(item.value->>'description',''),
        item.ordinality,(item.value->>'is_published')::boolean,false,
        trim(both '-' from regexp_replace(lower(item.value->>'title'),'[^a-z0-9]+','-','g'))||'-'||topic_id::text);
    else
      update public.topics set title=trim(item.value->>'title'),description=coalesce(item.value->>'description',''),
        "order"=item.ordinality,is_published=(item.value->>'is_published')::boolean
        where id=topic_id and classroom_id=p_classroom_id and course_id=p_course_id;
    end if;
  end loop;
  perform set_config('webbedsite.defer_topic_flow',previous_defer,true);
  perform private.recompute_classroom_topic_unlocks(p_classroom_id);
end $$;
revoke all on function private.configure_classroom_course_topics(uuid,uuid,jsonb) from public,anon;
grant execute on function private.configure_classroom_course_topics(uuid,uuid,jsonb) to authenticated;
create function public.configure_classroom_course_topics(p_classroom_id uuid,p_course_id uuid,p_topics jsonb)
returns void language sql security invoker set search_path = '' begin atomic
  select private.configure_classroom_course_topics(p_classroom_id,p_course_id,p_topics);
end;
revoke all on function public.configure_classroom_course_topics(uuid,uuid,jsonb) from public,anon;
grant execute on function public.configure_classroom_course_topics(uuid,uuid,jsonb) to authenticated;

-- Flow summaries follow only the courses currently assigned to the classroom.
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
          'accuracy',round(accuracy,1),'speed_bonus',round(coalesce(speed_bonus,0),1),
          'classification',case when accuracy is null then null
            when least(100,accuracy+coalesce(speed_bonus,0))>=85 then 'advanced'
            when least(100,accuracy+coalesce(speed_bonus,0))>=65 then 'intermediate' else 'beginner' end,
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
