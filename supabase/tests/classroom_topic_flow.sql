-- Run after the classroom topic flow migration. Fixture changes are rolled back.
begin;
do $validation$
declare required jsonb := '{"blocks":{"blocks":[{"type":"body","inputs":{"CONTENT":{"block":{"type":"heading"}}}}]}}';
  correct jsonb := '{"blocks":{"blocks":[{"type":"body","x":900,"y":10,"inputs":{"CONTENT":{"block":{"type":"heading","id":"moved"}}}},{"type":"paragraph"}]}}';
  wrong_parent jsonb := '{"blocks":{"blocks":[{"type":"body"},{"type":"heading"}]}}';
begin
  if not private.workspace_structure_matches(correct,required) then raise exception 'Server rejected valid hierarchy.'; end if;
  if private.workspace_structure_matches(wrong_parent,required) then raise exception 'Server accepted wrong hierarchy.'; end if;
end $validation$;
do $$
declare teacher uuid; first_student uuid; second_student uuid; course uuid; classroom uuid;
  first_topic uuid; second_topic uuid; core_lesson uuid; practice_lesson uuid; flow jsonb;
begin
  select id into teacher from public.profiles where role='teacher' limit 1;
  select id into first_student from public.profiles where role='student' order by id limit 1;
  select id into second_student from public.profiles where role='student' and id<>first_student order by id limit 1;
  select id into course from public.courses limit 1;
  if teacher is null or first_student is null or second_student is null or course is null
    then raise exception 'Test requires one teacher, two students, and one course.'; end if;
  insert into public.classrooms(teacher_id,name,is_active) values(teacher,'Topic flow test',true) returning id into classroom;
  insert into public.classroom_courses(classroom_id,course_id,sequence_order) values(classroom,course,1);
  insert into public.classroom_members(classroom_id,student_id) values(classroom,first_student),(classroom,second_student);
  insert into public.topics(course_id,classroom_id,title,description,"order",is_published,slug)
    values(course,classroom,'Core one','',1,true,'flow-one') returning id into first_topic;
  insert into public.topics(course_id,classroom_id,title,description,"order",is_published,slug)
    values(course,classroom,'Core two','',2,true,'flow-two') returning id into second_topic;
  insert into public.lessons(topics_id,classroom_id,author,title,type,is_published,slug,required_for_topic)
    values(first_topic,classroom,teacher,'Required lesson','lecture',true,'required-flow-lesson',true) returning id into core_lesson;
  insert into public.lessons(topics_id,classroom_id,author,title,type,is_published,slug,topic_track,required_for_topic)
    values(first_topic,classroom,teacher,'Beginner practice','lecture',true,'practice-flow-lesson','beginner',false) returning id into practice_lesson;
  insert into public.lessons(topics_id,classroom_id,author,title,type,is_published,slug,required_for_topic)
    values(second_topic,classroom,teacher,'Next required lesson','lecture',true,'next-required-flow-lesson',true);
  if not (select is_unlocked from public.topics where id=first_topic) then raise exception 'First published topic did not open.'; end if;
  if (select is_unlocked from public.topics where id=second_topic) then raise exception 'Next topic opened before core completion.'; end if;
  if private.topic_is_complete(second_topic) then raise exception 'A locked topic was counted as complete.'; end if;

  perform set_config('request.jwt.claim.sub',first_student::text,true);
  perform set_config('request.jwt.claim.role','authenticated',true);
  set local role authenticated;
  perform public.complete_lesson(first_student,core_lesson,90);
  select public.get_classroom_topic_flow(classroom) into flow;
  if (flow->'topics'->0->>'completed')::integer<>1 or (flow->'topics'->0->>'eligible')::integer<>2
    then raise exception 'Class progress must be 1 of 2.'; end if;
  reset role;
  if (select is_unlocked from public.topics where id=second_topic) then raise exception 'One student unlocked the next topic.'; end if;

  perform set_config('request.jwt.claim.sub',teacher::text,true);
  set local role authenticated;
  perform public.set_classroom_topic_exemption(first_topic,second_student,true,'Absent');
  select public.get_classroom_topic_flow(classroom) into flow;
  if (flow->'topics'->0->>'completed')::integer<>1 or (flow->'topics'->0->>'eligible')::integer<>1
    then raise exception 'Exemption did not adjust progress.'; end if;
  if not (select is_unlocked from public.topics where id=second_topic) then raise exception 'Eligible class completion did not unlock next topic.'; end if;
  if not exists(select 1 from jsonb_array_elements(flow->'events') event
    where event->>'topic_id'=first_topic::text and event->>'action'='student_exempted')
    then raise exception 'Exemption was not logged.'; end if;
  reset role;
end $$;
rollback;
