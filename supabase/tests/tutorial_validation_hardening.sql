-- All fixtures, submissions, XP and notifications are rolled back.
begin;
do $$
declare teacher uuid; other_teacher uuid; student uuid; outsider uuid; course uuid; classroom uuid; topic uuid;
  lesson uuid; tutorial uuid; first_step uuid; last_step uuid; file uuid; text_lesson uuid; text_tutorial uuid; text_step uuid; text_file uuid;
  other_classroom uuid; other_topic uuid; other_lesson uuid; orphan_lesson uuid; orphan_revision timestamptz; registration_user uuid; registration_role text;
  definition jsonb; draft jsonb; saved jsonb; snapshot jsonb; submission public.lesson_submissions; amount integer;
begin
  select id into teacher from public.profiles where role='teacher' order by id limit 1;
  select id into other_teacher from public.profiles where role='teacher' and id<>teacher limit 1;
  select id into student from public.profiles where role='student' order by id limit 1;
  select id into outsider from public.profiles where role='student' and id<>student limit 1;
  select id into course from public.courses limit 1;
  if teacher is null or other_teacher is null or student is null or outsider is null or course is null then raise exception 'Tutorial tests require two teachers, two students and one course.'; end if;
  insert into public.classrooms(teacher_id,name,is_active) values(teacher,'Tutorial validation regression',true) returning id into classroom;
  insert into public.classroom_courses(classroom_id,course_id) values(classroom,course);
  insert into public.classroom_members(classroom_id,student_id) values(classroom,student);
  insert into public.topics(course_id,classroom_id,title,description,"order",is_published,slug,is_unlocked) values(course,classroom,'Tutorial validation regression','',1,true,'tutorial-regression-'||gen_random_uuid(),true) returning id into topic;
  insert into public.lessons(topics_id,classroom_id,author,title,type,is_published,slug) values(topic,classroom,teacher,'Block validation','tutorial',true,'block-regression-'||gen_random_uuid()) returning id into lesson;
  insert into public.tutorials(lesson_id,type) values(lesson,'block') returning id into tutorial;
  insert into public.block_tutorial_steps(tutorial_id,instruction,"order") values(tutorial,'First',0) returning id into first_step;
  insert into public.block_tutorial_steps(tutorial_id,instruction,"order") values(tutorial,'Last',1) returning id into last_step;
  insert into public.block_tutorial_step_files(tutorial_id,filename,file_type) values(tutorial,'index.html','html') returning id into file;
  insert into public.block_tutorial_step_expected(step_id,file_id,expected_code,test_cases,expected_blocks_json) values
    (first_step,file,'<h1>Welcome</h1>','[{"type":"htmlText","selector":"h1","value":"Welcome"}]','{"blocks":{"blocks":[{"type":"heading","fields":{"TEXT":"Welcome","LEVEL":"1"}}]}}'),
    (last_step,file,'<h1>Welcome</h1>','[]','{"blocks":{"blocks":[{"type":"heading","fields":{"TEXT":"Welcome","LEVEL":"1"}}]}}');
  snapshot := '[{"filename":"index.html","code":"<h1>Welcome</h1>","blocks_json":{"blocks":{"blocks":[{"type":"heading","fields":{"TEXT":"Welcome","LEVEL":"1"}}]}}}]';
  insert into public.classrooms(teacher_id,name,is_active) values(other_teacher,'Other tutorial teacher',true) returning id into other_classroom;
  insert into public.classroom_courses(classroom_id,course_id) values(other_classroom,course);
  insert into public.topics(course_id,classroom_id,title,description,"order",is_published,slug) values(course,other_classroom,'Other tutorial teacher','',1,true,'other-tutorial-'||gen_random_uuid()) returning id into other_topic;
  insert into public.lessons(topics_id,classroom_id,author,title,type,is_published,slug) values(other_topic,other_classroom,other_teacher,'Other tutorial','tutorial',false,'other-tutorial-'||gen_random_uuid()) returning id into other_lesson;

  perform set_config('request.jwt.claims',jsonb_build_object('sub',student,'role','authenticated')::text,true);
  perform set_config('request.jwt.claim.sub',student::text,true);
  set local role authenticated;
  begin update public.profiles set role='admin' where id=student; raise exception 'Student changed account role'; exception when insufficient_privilege then null; end;
  begin insert into public.profiles(id,username,email,role) select id,username,email,'admin' from public.profiles where id=student on conflict(id) do update set role=excluded.role; raise exception 'Profile upsert elevated role'; exception when insufficient_privilege then null; end;
  update public.profiles set bio='Rolled-back profile regression' where id=student;
  if (select count(*) from public.block_tutorial_step_expected where step_id=first_step)<>0 then raise exception 'Student could read reference answers'; end if;
  saved := public.get_tutorial_view(tutorial);
  if saved->'block_tutorial_steps'->0->'block_tutorial_step_expected'->0 ? 'expected_code' or saved->'block_tutorial_steps'->0->'block_tutorial_step_expected'->0 ? 'expected_blocks_json' then raise exception 'Learner DTO exposes answers'; end if;
  if not (saved->'block_tutorial_steps'->0->'block_tutorial_step_expected'->0->>'server_only')::boolean then raise exception 'Missing authoritative objective metadata'; end if;
  begin insert into public.block_step_completed(user_id,step_id) values(student,first_step); raise exception 'Forged marker accepted'; exception when insufficient_privilege then null; end;
  begin perform public.save_lesson_submission(lesson,snapshot,first_step,false); raise exception 'Direct tutorial submission accepted'; exception when raise_exception then if SQLERRM not like '%trusted tutorial validator%' then raise; end if; end;
  begin perform public.save_validated_tutorial_submission(student,lesson,first_step,snapshot,false,'fake'); raise exception 'Student called trusted RPC'; exception when insufficient_privilege then null; end;
  reset role;

  perform set_config('request.jwt.claim.sub',teacher::text,true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',teacher,'role','authenticated')::text,true);
  set local role authenticated;
  begin update public.tutorials set lesson_id=other_lesson where id=tutorial; raise exception 'Reparented content into another classroom'; exception when insufficient_privilege then null; end;
  reset role;

  perform set_config('request.jwt.claim.sub',other_teacher::text,true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',other_teacher,'role','authenticated')::text,true);
  set local role authenticated;
  begin update public.lessons set classroom_id=other_classroom,topics_id=other_topic where id=lesson; raise exception 'Other teacher took ownership through parent lesson'; exception when insufficient_privilege then null; end;
  begin update public.lessons set type='lecture' where id=lesson; raise exception 'Other teacher bypassed tutorial ownership by changing lesson type'; exception when insufficient_privilege then null; end;
  begin update public.topics set is_unlocked=false where id=topic; raise exception 'Other teacher changed tutorial topic'; exception when insufficient_privilege then null; end;
  begin delete from public.topics where id=topic; raise exception 'Other teacher cascaded tutorial deletion'; exception when insufficient_privilege then null; end;
  update public.block_tutorial_steps set instruction='tampered' where id=first_step;
  get diagnostics amount=row_count;
  if amount<>0 then raise exception 'Other teacher edited tutorial'; end if;
  begin insert into public.block_tutorial_step_expected(step_id,file_id,expected_code) values(first_step,file,'tampered'); raise exception 'Other teacher added objective'; exception when insufficient_privilege then null; end;
  reset role;

  perform set_config('request.jwt.claim.sub',outsider::text,true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',outsider,'role','authenticated')::text,true);
  set local role authenticated;
  begin perform public.get_tutorial_view(tutorial); raise exception 'Outsider opened tutorial'; exception when raise_exception then if SQLERRM not like '%not available%' then raise; end if; end;
  reset role;

  perform set_config('request.jwt.claims','{"role":"service_role"}',true);
  perform set_config('request.jwt.claim.sub','',true);
  definition := public.get_tutorial_validation_definition(student,lesson,last_step);
  begin perform public.save_validated_tutorial_submission(student,lesson,last_step,snapshot,true,definition->>'revision'); raise exception 'Skipped prior step accepted'; exception when raise_exception then if SQLERRM not like '%preceding steps%' then raise; end if; end;
  definition := public.get_tutorial_validation_definition(student,lesson,first_step);
  submission := public.save_validated_tutorial_submission(student,lesson,first_step,snapshot,false,definition->>'revision');
  if submission.validation_digest is distinct from definition->>'revision' then raise exception 'Validation version not stored'; end if;
  submission := public.save_validated_tutorial_submission(student,lesson,first_step,snapshot,false,definition->>'revision');
  if (select count(*) from public.lesson_submissions where lesson_id=lesson)<>1 then raise exception 'Resubmission duplicated work'; end if;
  if exists(select 1 from private.tutorial_validation_proofs where transaction_id=txid_current()) then raise exception 'Validation proof was not cleared'; end if;
  begin perform public.save_validated_tutorial_submission(student,lesson,first_step,snapshot,false,'stale-version'); raise exception 'Stale validation accepted'; exception when raise_exception then if SQLERRM not like '%objectives changed%' then raise; end if; end;
  definition := public.get_tutorial_validation_definition(student,lesson,last_step);
  submission := public.save_validated_tutorial_submission(student,lesson,last_step,snapshot,true,definition->>'revision');
  submission := public.save_validated_tutorial_submission(student,lesson,last_step,snapshot,true,definition->>'revision');
  if not exists(select 1 from public.user_lesson_progress where user_id=student and lesson_id=lesson and is_completed) then raise exception 'Final completion missing'; end if;
  if (select count(*) from public.user_xp_logs where user_id=student and source_id=lesson)<>1 then raise exception 'Duplicate completion XP'; end if;
  update public.block_tutorial_step_expected set expected_code='changed' where step_id=first_step;
  begin perform public.save_validated_tutorial_submission(student,lesson,last_step,snapshot,true,definition->>'revision'); raise exception 'Stale preceding objective accepted'; exception when raise_exception then if SQLERRM not like '%current tutorial%' then raise; end if; end;

  insert into public.lessons(topics_id,classroom_id,author,title,type,is_published,slug) values(topic,classroom,teacher,'Text validation','tutorial',true,'text-regression-'||gen_random_uuid()) returning id into text_lesson;
  insert into public.tutorials(lesson_id,type) values(text_lesson,'text') returning id into text_tutorial;
  insert into public.text_tutorial_steps(tutorial_id,instruction,"order") values(text_tutorial,'Text step',0) returning id into text_step;
  insert into public.text_tutorial_step_files(tutorial_id,step_id,filename,file_type,initial_content) values(text_tutorial,text_step,'index.html','html','') returning id into text_file;
  insert into public.text_tutorial_step_expected(step_id,file_id,expected_code,test_cases) values(text_step,text_file,'<h1>Typed</h1>','[{"type":"htmlText","selector":"h1","value":"Typed"}]');
  definition := public.get_tutorial_validation_definition(student,text_lesson,text_step);
  if definition->>'mode'<>'text' or jsonb_array_length(definition->'expected')<>1 then raise exception 'Text objectives not loaded'; end if;
  submission := public.save_validated_tutorial_submission(student,text_lesson,text_step,'[{"filename":"index.html","code":"<h1>Typed</h1>","blocks_json":null}]',true,definition->>'revision');
  if submission.validation_digest is null then raise exception 'Text completion was not validated'; end if;

  draft := jsonb_build_object('mode','block','meta',jsonb_build_object('title','Atomic tutorial','topicId',topic,'baseXp','50'),'files',jsonb_build_array(jsonb_build_object('id',null,'filename','index.html','fileType','html','initialContentJson',null)),
    'steps',jsonb_build_array(jsonb_build_object('id',null,'instruction','Build','hint','','expectedByFile',jsonb_build_object('index.html',jsonb_build_object('id',null,'code','<h1>Welcome</h1>','blocksJson',snapshot->0->'blocks_json','testCases','[]'::jsonb)))));
  saved := public.save_tutorial_definition(teacher,draft,false);
  if (select is_published from public.lessons where id=(saved->>'lessonId')::uuid) then raise exception 'Draft was published'; end if;
  draft := draft||saved;
  saved := public.save_tutorial_definition(teacher,draft,true);
  if not (select is_published from public.lessons where id=(saved->>'lessonId')::uuid) then raise exception 'Publish did not succeed'; end if;
  begin perform public.save_tutorial_definition(teacher,draft,false); raise exception 'Stale editor overwrote tutorial'; exception when raise_exception then if SQLERRM not like '%another editor%' then raise; end if; end;
  draft := draft||saved;
  draft := jsonb_set(draft,'{files,0,id}',to_jsonb(file::text));
  begin perform public.save_tutorial_definition(teacher,draft,false); raise exception 'Foreign file accepted'; exception when raise_exception then if SQLERRM not like '%another tutorial%' then raise; end if; end;
  if not (select is_published from public.lessons where id=(saved->>'lessonId')::uuid) then raise exception 'Failed atomic save partially unpublished lesson'; end if;

  insert into public.lessons(topics_id,classroom_id,author,title,type,is_published,slug)
    values(topic,classroom,teacher,'Legacy incomplete draft','tutorial',false,'orphan-tutorial-'||gen_random_uuid()) returning id,updated_at into orphan_lesson,orphan_revision;
  draft := jsonb_set(jsonb_set(draft,'{files,0,id}','null'::jsonb),'{steps,0,id}','null'::jsonb);
  draft := jsonb_set(draft,'{steps,0,expectedByFile,index.html,id}','null'::jsonb);
  draft := draft||jsonb_build_object('lessonId',orphan_lesson,'tutorialId',null,'revision',orphan_revision);
  saved := public.save_tutorial_definition(teacher,draft,false);
  if saved->>'lessonId'<>orphan_lesson::text or not exists(select 1 from public.tutorials where lesson_id=orphan_lesson) then raise exception 'Incomplete legacy draft was not recovered'; end if;

  -- Exercise signup before confirmation; no auth users or profiles persist.
  perform set_config('request.jwt.claims','{"role":"anon"}',true);
  perform set_config('request.jwt.claim.sub','',true);
  foreach registration_role in array array['student','teacher','admin'] loop
    registration_user := gen_random_uuid();
    insert into auth.users(id,email,raw_user_meta_data) values(registration_user,'tutorial-regression-'||registration_user||'@example.invalid',jsonb_build_object('username','register-'||registration_user,'role',registration_role));
    if not exists(select 1 from public.profiles p where p.id=registration_user and p.role::text=case when registration_role='teacher' then 'teacher' else 'student' end) then raise exception 'Signup failed or accepted an administrator role'; end if;
  end loop;
end $$;
rollback;
