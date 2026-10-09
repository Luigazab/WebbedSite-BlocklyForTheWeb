-- Exercise ordering, topic edits, content preservation, and ownership. Roll back all fixtures.
begin;
do $test$
declare teacher uuid; outsider uuid; course_ids uuid[]; classroom uuid; fresh_classroom uuid; clone_course uuid; first_topic uuid; second_topic uuid;
  lesson uuid; actual_order uuid[]; topic_input jsonb; flow jsonb;
begin
  select id into teacher from public.profiles where role='teacher' limit 1;
  select id into outsider from public.profiles where id<>teacher limit 1;
  select array_agg(id order by id) into course_ids from (select id from public.courses order by id limit 2) selected;
  if teacher is null or outsider is null or cardinality(course_ids)<>2 then raise exception 'Need a teacher, another user, and two courses.'; end if;
  insert into public.classrooms(teacher_id,name,is_active) values(teacher,'Curriculum configuration test',true) returning id into classroom;
  insert into public.classrooms(teacher_id,name,is_active) values(teacher,'Fresh curriculum assignment test',true) returning id into fresh_classroom;
  select course_id into clone_course from public.topics where classroom_id is null limit 1;
  insert into public.classroom_courses(classroom_id,course_id,sequence_order) values(classroom,course_ids[1],1),(classroom,course_ids[2],2);
  insert into public.topics(course_id,classroom_id,title,description,"order",is_published,slug)
    values(course_ids[1],classroom,'First topic','',1,false,'configuration-first') returning id into first_topic;
  insert into public.topics(course_id,classroom_id,title,description,"order",is_published,slug)
    values(course_ids[1],classroom,'Second topic','',2,false,'configuration-second') returning id into second_topic;
  insert into public.lessons(topics_id,classroom_id,author,title,type,is_published,slug)
    values(first_topic,classroom,teacher,'Preserved lesson','lecture',false,'preserved-configuration-lesson') returning id into lesson;
  perform set_config('request.jwt.claim.sub',teacher::text,true);
  perform set_config('request.jwt.claim.role','authenticated',true);
  set local role authenticated;
  if clone_course is not null then
    perform public.assign_courses_to_classroom(fresh_classroom,array[clone_course]);
    if not exists(select 1 from public.topics where classroom_id=fresh_classroom and course_id=clone_course)
      then raise exception 'Assigning a new course did not clone its topics.'; end if;
  end if;
  perform public.assign_courses_to_classroom(classroom,array[course_ids[2],course_ids[1],course_ids[2]]);
  select array_agg(course_id order by sequence_order) into actual_order from public.classroom_courses where classroom_id=classroom;
  if actual_order is distinct from array[course_ids[2],course_ids[1]] then raise exception 'Course order was lost.'; end if;
  topic_input := jsonb_build_array(
    jsonb_build_object('id',second_topic,'title','Renamed second','description','Edited description','is_published',false),
    jsonb_build_object('id',first_topic,'title','First topic','description','','is_published',false),
    jsonb_build_object('id',null,'title','New topic','description','New description','is_published',false));
  perform public.configure_classroom_course_topics(classroom,course_ids[1],topic_input);
  if not exists(select 1 from public.topics where id=second_topic and "order"=1 and title='Renamed second' and description='Edited description')
    then raise exception 'Topic edits or swapped order were not saved.'; end if;
  if not exists(select 1 from public.topics where id=first_topic and "order"=2)
    then raise exception 'Second topic position was not saved.'; end if;
  if (select count(*) from public.topics where classroom_id=classroom)<>3 then raise exception 'New topic was not added.'; end if;
  if not exists(select 1 from public.lessons where id=lesson and topics_id=first_topic) then raise exception 'Topic reorder changed lesson identity.'; end if;
  begin
    perform public.configure_classroom_course_topics(classroom,course_ids[1],jsonb_build_array(topic_input->0));
    raise exception 'Omitted existing topics accepted';
  exception when raise_exception then if sqlerrm='Omitted existing topics accepted' then raise; end if; end;
  perform public.assign_courses_to_classroom(classroom,array[course_ids[2]]);
  flow := public.get_classroom_topic_flow(classroom);
  if jsonb_array_length(flow->'topics')<>0 then raise exception 'Unassigned course still appears in flow.'; end if;
  perform public.assign_courses_to_classroom(classroom,array[course_ids[1],course_ids[2]]);
  if (select count(*) from public.topics where classroom_id=classroom)<>3 then raise exception 'Reassignment duplicated topics.'; end if;
  if not exists(select 1 from public.lessons where id=lesson) then raise exception 'Reassignment lost a lesson.'; end if;
  reset role;
  perform set_config('request.jwt.claim.sub',outsider::text,true);
  set local role authenticated;
  begin
    perform public.assign_courses_to_classroom(classroom,array[course_ids[2]]);
    raise exception 'Outsider changed classroom courses';
  exception when raise_exception then if sqlerrm='Outsider changed classroom courses' then raise; end if; end;
  begin
    perform public.configure_classroom_course_topics(classroom,course_ids[1],topic_input);
    raise exception 'Outsider changed classroom topics';
  exception when raise_exception then if sqlerrm='Outsider changed classroom topics' then raise; end if; end;
  reset role;
end $test$;
rollback;
