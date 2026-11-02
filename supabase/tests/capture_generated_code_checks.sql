-- Integration fixtures are always rolled back.
begin;
do $$
declare teacher uuid; student uuid; course uuid; classroom uuid; topic uuid;
  saved jsonb; definition jsonb; learner jsonb; step_id uuid; lesson_id uuid; tutorial_id uuid;
  initial jsonb := '{"index.html":{"blocks":{"languageVersion":0,"blocks":[]}}}'::jsonb;
begin
  select id into teacher from public.profiles where role='teacher' and not must_change_password limit 1;
  select id into student from public.profiles where role='student' and not must_change_password limit 1;
  select id into course from public.courses limit 1;
  if teacher is null or student is null or course is null then raise exception 'Capture tests require a teacher, student and course'; end if;
  insert into public.classrooms(teacher_id,name,is_active) values(teacher,'Capture regression rollback',true) returning id into classroom;
  insert into public.classroom_courses(classroom_id,course_id) values(classroom,course);
  insert into public.classroom_members(classroom_id,student_id) values(classroom,student);
  insert into public.topics(course_id,classroom_id,title,description,"order",is_published,slug,is_unlocked)
    values(course,classroom,'Capture regression','',1,true,'capture-test-'||gen_random_uuid(),true) returning id into topic;
  definition := jsonb_build_object('mode','block','meta',jsonb_build_object('title','Capture regression','topicId',topic,'baseXp',50),
    'files','[{"filename":"index.html","fileType":"html","initialContentJson":{}}]'::jsonb,
    'steps',jsonb_build_array(jsonb_build_object('instruction','Create a heading','initialByFile',initial,'expectedByFile',
      '{"index.html":{"code":"<h1>Welcome</h1>","blocksJson":{"blocks":{"blocks":[{"type":"heading","fields":{"LEVEL":"1","TEXT":"Welcome"}}]}},"requireStructure":false,"testCases":[{"type":"generatedChanges","checks":[{"type":"htmlOwnText","selector":"h1","value":"Welcome"}]}]}}'::jsonb)));
  perform set_config('request.jwt.claims','{"role":"service_role"}',true);
  saved := private.save_tutorial_definition(teacher,definition,true);
  step_id := (saved->'steps'->0->>'id')::uuid;
  lesson_id := (saved->>'lessonId')::uuid;
  tutorial_id := (saved->>'tutorialId')::uuid;
  if (select initial_files from public.block_tutorial_steps where id=step_id) is distinct from initial then raise exception 'Starting capture was not persisted'; end if;
  if saved->'steps'->0->'initialByFile' is distinct from initial then raise exception 'Starting capture missing from save response'; end if;
  perform set_config('request.jwt.claims',jsonb_build_object('sub',student,'role','authenticated')::text,true);
  perform set_config('request.jwt.claim.sub',student::text,true);
  learner := public.get_tutorial_view(tutorial_id);
  if learner->'block_tutorial_steps'->0->'initial_files' is distinct from initial then raise exception 'Learner did not receive starting capture'; end if;
  if learner->'block_tutorial_steps'->0->'block_tutorial_step_expected'->0 ? 'expected_code' then raise exception 'Learner received reference answer'; end if;
end $$;
rollback;
