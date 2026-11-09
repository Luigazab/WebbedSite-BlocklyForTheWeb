-- Fixtures and notifications roll back; run against the migrated database.
begin;
do $$
declare admin_id uuid; teacher_id uuid; student_id uuid; outsider uuid;
  course uuid; master_topic uuid; copied_topic uuid; classroom uuid;
  master_lesson uuid; master_lab uuid; lesson uuid; lab uuid; draft_lesson uuid; template uuid;
  reward jsonb; total integer;
begin
  select id into admin_id from public.profiles where role='admin' limit 1;
  select id into teacher_id from public.profiles where role='teacher' limit 1;
  select id into student_id from public.profiles where role='student' limit 1;
  select id into outsider from public.profiles where id not in (admin_id,teacher_id,student_id) limit 1;
  if admin_id is null or teacher_id is null or student_id is null then raise exception 'An admin, teacher and student are required.'; end if;
  update public.profiles set must_change_password=false where id in(admin_id,teacher_id,student_id);
  insert into public.courses(title,"order",slug) values('Reward fixture',9999,'reward-fixture-'||gen_random_uuid()) returning id into course;
  insert into public.topics(course_id,title,description,"order",is_published) values(course,'Reward topic','',0,true) returning id into master_topic;
  insert into public.lessons(topics_id,author,title,type,is_published,topic_track,required_for_topic,expected_minutes,base_xp,"order")
    values(master_topic,admin_id,'Optional lecture','lecture',false,'advanced',false,37,50,0) returning id into master_lesson;
  insert into public.lectures(lesson_id,content) values(master_lesson,'Lecture content');
  insert into public.lessons(topics_id,author,title,type,is_published,topic_track,required_for_topic,expected_minutes,"order")
    values(master_topic,admin_id,'Required laboratory','laboratory',false,'core',true,42,1) returning id into master_lab;
  insert into public.laboratories(lesson_id,instruction) values(master_lab,'Create a web page.');
  update public.lessons set is_published=true where id in(master_lesson,master_lab);
  insert into public.lessons(topics_id,author,title,type,is_published,"order") values(master_topic,admin_id,'Hidden draft','lecture',false,2) returning id into draft_lesson;
  perform set_config('request.jwt.claim.sub',admin_id::text,true);
  perform set_config('request.jwt.claims',json_build_object('sub',admin_id,'role','authenticated')::text,true);
  set local role authenticated;
  insert into public.topic_badge_templates(course_id,topic_id,name,image_url) values(course,master_topic,'Topic star','https://example.com/star.png') returning id into template;
  reset role;
  insert into public.classrooms(teacher_id,name,is_active) values(teacher_id,'Reward fixture',true) returning id into classroom;
  perform set_config('request.jwt.claim.sub',teacher_id::text,true);
  perform set_config('request.jwt.claims',json_build_object('sub',teacher_id,'role','authenticated')::text,true);
  set local role authenticated;
  perform public.clone_course_to_classroom(classroom,course);
  perform public.clone_course_to_classroom(classroom,course);
  select id into copied_topic from public.topics where classroom_id=classroom and course_id=course;
  select id into lesson from public.lessons where topics_id=copied_topic and title='Optional lecture';
  select id into lab from public.lessons where topics_id=copied_topic and title='Required laboratory';
  if not exists(select 1 from public.lessons where id=lesson and topic_track='advanced' and not required_for_topic and expected_minutes=37) then raise exception 'Lecture rules not copied.'; end if;
  if not exists(select 1 from public.lessons where id=lab and topic_track='core' and required_for_topic and expected_minutes=42) then raise exception 'Laboratory rules not copied.'; end if;
  if (select count(*) from public.classroom_badge_rules where classroom_id=classroom)<>1 then raise exception 'Missing or duplicated cloned badge.'; end if;
  begin
    insert into public.topic_badge_templates(course_id,topic_id,name) values(course,master_topic,'Forbidden');
    raise exception 'Teacher wrote an admin template';
  exception when insufficient_privilege then null; end;
  reset role;
  perform set_config('request.jwt.claim.sub',admin_id::text,true);
  perform set_config('request.jwt.claims',json_build_object('sub',admin_id,'role','authenticated')::text,true);
  update public.topic_badge_templates set name='Changed template' where id=template;
  if not exists(select 1 from public.classroom_badge_rules where classroom_id=classroom and name='Topic star') then raise exception 'Template changed existing classroom.'; end if;
  perform set_config('request.jwt.claim.sub','',true);
  perform set_config('request.jwt.claims','{}',true);
  insert into public.classroom_members(classroom_id,student_id) values(classroom,student_id);
  perform set_config('request.jwt.claim.sub',student_id::text,true);
  perform set_config('request.jwt.claims',json_build_object('sub',student_id,'role','authenticated')::text,true);
  set local role authenticated;
  perform public.submit_laboratory(lab,'[{"filename":"index.html","code":"<h1>Hello</h1>"}]',gen_random_uuid(),true);
  reward:=public.lesson_completion_rewards(lab);
  if (reward->>'completed')::boolean then raise exception 'Draft lab counted as complete.'; end if;
  perform public.submit_laboratory(lab,'[{"filename":"index.html","code":"<h1>Hello</h1>"}]',gen_random_uuid(),false);
  reward:=public.lesson_completion_rewards(lab);
  if not (reward->>'completed')::boolean or (reward->>'topic_complete')::boolean or jsonb_array_length(reward->'awards')<>0 then raise exception 'Optional published lecture did not hold badge.'; end if;
  perform public.complete_lesson(student_id,lesson,100);
  reward:=public.lesson_completion_rewards(lesson);
  if not (reward->>'topic_complete')::boolean or jsonb_array_length(reward->'awards')<>1 then raise exception 'Ungraded submitted lab or hidden draft held badge: %',reward; end if;
  if (reward->>'earned_xp')::integer<>60 then raise exception 'Wrong actual XP: %',reward; end if;
  perform public.complete_lesson(student_id,lesson,100);
  reward:=public.lesson_completion_rewards(lesson);
  if (reward->>'earned_xp')::integer<>0 or jsonb_array_length(reward->'awards')<>0 then raise exception 'Rewards replayed.'; end if;
  reset role;
  if (select count(*) from public.classroom_badge_awards where classroom_id=classroom)<>1 then raise exception 'Duplicate awards.'; end if;
  if outsider is not null then
    perform set_config('request.jwt.claim.sub',outsider::text,true);
    perform set_config('request.jwt.claims',json_build_object('sub',outsider,'role','authenticated')::text,true);
    set local role authenticated;
    begin
      perform public.lesson_completion_rewards(lesson);
      raise exception 'Outsider read rewards';
    exception when raise_exception then if sqlerrm='Outsider read rewards' then raise; end if; end;
    reset role;
  end if;
end $$;
rollback;
