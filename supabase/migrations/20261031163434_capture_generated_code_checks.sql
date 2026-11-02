-- Store independent starting workspaces for each step. Existing tutorials retain inheritance.
alter table public.block_tutorial_steps add column if not exists initial_files jsonb not null default '{}'::jsonb;
alter table public.block_tutorial_steps add constraint tutorial_initial_files_object check (jsonb_typeof(initial_files) = 'object');

-- Recover incomplete legacy tutorial drafts within the same atomic save.
create or replace function private.save_tutorial_definition(p_user uuid,p_definition jsonb,p_publish boolean) returns jsonb
language plpgsql security definer set search_path='' as $$
<<authoring>>
declare previous jsonb; lesson_id uuid; tutorial_id uuid; topic record; existing record; file jsonb; step jsonb; exp record;
  file_id uuid; step_id uuid; expected_id uuid; file_ids uuid[] := '{}'; step_ids uuid[] := '{}'; expected_ids uuid[] := '{}';
  file_map jsonb := '{}'::jsonb; saved_files jsonb := '[]'::jsonb; saved_steps jsonb := '[]'::jsonb; expected_map jsonb; saved_exp record;
  position integer := 0; revision timestamptz; title text; xp integer;
begin
  previous := private.tutorial_use_service_actor(p_user);
  if coalesce(p_definition->>'mode','block')<>'block' then raise exception 'The current builder creates block tutorials.'; end if;
  title := btrim(p_definition->'meta'->>'title'); xp := (p_definition->'meta'->>'baseXp')::integer;
  if title is null or title='' or xp is null or xp<1 then raise exception 'A title and positive XP are required.'; end if;
  select t.*,c.teacher_id into topic from public.topics t left join public.classrooms c on c.id=t.classroom_id where t.id=(p_definition->'meta'->>'topicId')::uuid for update of t;
  if not found or not exists(select 1 from public.profiles p where p.id=p_user and (p.role::text='admin' or (p.role::text='teacher' and topic.teacher_id=p_user))) then raise exception 'You cannot author content in this topic.'; end if;
  lesson_id := nullif(p_definition->>'lessonId','')::uuid;
  if lesson_id is not null then
    select * into existing from public.lessons where id=lesson_id for update;
    if not found or existing.type<>'tutorial' then raise exception 'Tutorial lesson not found.'; end if;
    select t.id into tutorial_id from public.tutorials t where t.lesson_id=authoring.lesson_id limit 1;
    if not private.tutorial_lesson_can_edit(lesson_id) then raise exception 'You cannot edit this tutorial.'; end if;
    if existing.updated_at is distinct from (p_definition->>'revision')::timestamptz then raise exception 'This tutorial changed in another editor. Reload before saving.'; end if;
    if existing.classroom_id is distinct from topic.classroom_id then raise exception 'A tutorial cannot be moved between classrooms.'; end if;
    if tutorial_id is null then
      -- Recover a lesson left without tutorial rows by a legacy partial save.
      insert into public.tutorials(lesson_id,type) values(lesson_id,'block') returning id into tutorial_id;
    elsif (select type from public.tutorials where id=tutorial_id)<>'block' then
      raise exception 'Use the matching tutorial editor.';
    end if;
    update public.lessons set title=authoring.title,topics_id=topic.id,base_xp=xp,is_published=p_publish,updated_at=clock_timestamp() where id=authoring.lesson_id returning updated_at into revision;
  else
    insert into public.lessons(topics_id,classroom_id,author,title,type,is_published,slug,"order",base_xp)
      values(topic.id,topic.classroom_id,p_user,title,'tutorial',p_publish,'tutorial-'||gen_random_uuid()::text,coalesce((select max(l."order")+1 from public.lessons l where l.topics_id=topic.id),1),xp)
      returning id,updated_at into lesson_id,revision;
    insert into public.tutorials(lesson_id,type) values(lesson_id,'block') returning id into tutorial_id;
  end if;
  if jsonb_typeof(p_definition->'files') is distinct from 'array' or jsonb_array_length(p_definition->'files') not between 1 and 32 or jsonb_typeof(p_definition->'steps') is distinct from 'array' or jsonb_array_length(p_definition->'steps') not between 1 and 100 then raise exception 'Add files and steps.'; end if;
  if (select count(distinct f->>'filename') from jsonb_array_elements(p_definition->'files') f)<>jsonb_array_length(p_definition->'files') then raise exception 'File names must be unique.'; end if;
  for file in select value from jsonb_array_elements(p_definition->'files') loop
    if (file->>'filename') !~ '^[\w.-]+\.(html|css|js)$' then raise exception 'Invalid tutorial filename.'; end if;
    file_id := nullif(file->>'id','')::uuid;
    if file_id is not null and not exists(select 1 from public.block_tutorial_step_files f where f.id=authoring.file_id and f.tutorial_id=authoring.tutorial_id) then raise exception 'A file belongs to another tutorial.'; end if;
    file_id := coalesce(file_id,gen_random_uuid());
    insert into public.block_tutorial_step_files(id,tutorial_id,filename,file_type,initial_content_json) values(file_id,tutorial_id,file->>'filename',file->>'fileType',nullif(file->'initialContentJson','null'::jsonb))
      on conflict(id) do update set filename=excluded.filename,file_type=excluded.file_type,initial_content_json=excluded.initial_content_json;
    file_ids := array_append(file_ids,file_id); file_map := file_map||jsonb_build_object(file->>'filename',file_id);
    saved_files := saved_files||jsonb_build_array(file||jsonb_build_object('id',file_id));
  end loop;
  -- Temporary negative orders avoid unique-order collisions when a middle step is removed.
  update public.block_tutorial_steps target set "order"=-100000-abs(target."order") where target.tutorial_id=authoring.tutorial_id;
  for step in select value from jsonb_array_elements(p_definition->'steps') loop
    step_id := nullif(step->>'id','')::uuid;
    if step_id is not null and not exists(select 1 from public.block_tutorial_steps s where s.id=authoring.step_id and s.tutorial_id=authoring.tutorial_id) then raise exception 'A step belongs to another tutorial.'; end if;
    step_id := coalesce(step_id,gen_random_uuid()); expected_map := '{}'::jsonb;
    insert into public.block_tutorial_steps(id,tutorial_id,instruction,hint,"order",highlight_category_path,highlight_block_type,initial_files)
      values(step_id,tutorial_id,step->>'instruction',step->>'hint',position,case when jsonb_typeof(step->'highlightCategoryPath')='array' then array(select jsonb_array_elements_text(step->'highlightCategoryPath')) else null end,step->>'highlightBlockType',coalesce(step->'initialByFile','{}'::jsonb))
      on conflict(id) do update set instruction=excluded.instruction,hint=excluded.hint,"order"=excluded."order",highlight_category_path=excluded.highlight_category_path,highlight_block_type=excluded.highlight_block_type,initial_files=excluded.initial_files;
    step_ids := array_append(step_ids,step_id);
    for exp in select key,value from jsonb_each(coalesce(step->'expectedByFile','{}'::jsonb)) loop
      file_id := (file_map->>exp.key)::uuid;
      if file_id is null then raise exception 'Unknown solution file.'; end if;
      expected_id := nullif(exp.value->>'id','')::uuid;
      if expected_id is not null and not exists(select 1 from public.block_tutorial_step_expected e where e.id=authoring.expected_id and e.step_id=authoring.step_id and e.file_id=authoring.file_id) then raise exception 'A solution belongs to another step.'; end if;
      expected_id := coalesce(expected_id,gen_random_uuid());
      insert into public.block_tutorial_step_expected(id,step_id,file_id,expected_code,expected_blocks_json,test_cases,require_block_structure)
        values(expected_id,step_id,file_id,exp.value->>'code',nullif(exp.value->'blocksJson','null'::jsonb),coalesce(exp.value->'testCases','[]'::jsonb),coalesce((exp.value->>'requireStructure')::boolean,false))
        on conflict(id) do update set expected_code=excluded.expected_code,expected_blocks_json=excluded.expected_blocks_json,test_cases=excluded.test_cases,require_block_structure=excluded.require_block_structure
        returning * into saved_exp;
      expected_ids := array_append(expected_ids,expected_id);
      expected_map := expected_map||jsonb_build_object(exp.key,exp.value||jsonb_build_object('id',expected_id,'fileId',file_id,'blocksJson',saved_exp.expected_blocks_json));
    end loop;
    saved_steps := saved_steps||jsonb_build_array(step||jsonb_build_object('id',step_id,'order',position,'expectedByFile',expected_map,'workingState','{}'::jsonb,'testDraftByFile','{}'::jsonb));
    position := position+1;
  end loop;
  delete from public.block_tutorial_step_expected e using public.block_tutorial_steps s where e.step_id=s.id and s.tutorial_id=authoring.tutorial_id and e.id<>all(expected_ids);
  delete from public.block_tutorial_steps s where s.tutorial_id=authoring.tutorial_id and s.id<>all(step_ids);
  delete from public.block_tutorial_step_files f where f.tutorial_id=authoring.tutorial_id and f.id<>all(file_ids);
  perform private.tutorial_restore_actor(previous);
  return jsonb_build_object('lessonId',lesson_id,'tutorialId',tutorial_id,'revision',revision,'files',saved_files,'steps',saved_steps);
end $$;

create or replace function private.tutorial_step_definition(p_lesson uuid,p_step uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare tutorial record; files jsonb; expected jsonb; result jsonb;
begin
  select t.* into tutorial from public.tutorials t where t.lesson_id=p_lesson and (
    exists(select 1 from public.block_tutorial_steps s where s.id=p_step and s.tutorial_id=t.id and t.type='block') or
    exists(select 1 from public.text_tutorial_steps s where s.id=p_step and s.tutorial_id=t.id and t.type='text'));
  if not found then raise exception 'Select a step belonging to this tutorial.'; end if;
  if tutorial.type='block' then
    select coalesce(jsonb_agg(to_jsonb(f) order by f.filename,f.id),'[]'::jsonb) into files from public.block_tutorial_step_files f where f.tutorial_id=tutorial.id;
    select coalesce(jsonb_agg(to_jsonb(e)||jsonb_build_object('filename',f.filename) order by e.file_id,e.id),'[]'::jsonb) into expected
      from public.block_tutorial_step_expected e join public.block_tutorial_step_files f on f.id=e.file_id and f.tutorial_id=tutorial.id where e.step_id=p_step;
  else
    select coalesce(jsonb_agg(to_jsonb(f) order by f.filename,f.id),'[]'::jsonb) into files from public.text_tutorial_step_files f where f.tutorial_id=tutorial.id and (f.step_id is null or f.step_id=p_step);
    select coalesce(jsonb_agg(to_jsonb(e)||jsonb_build_object('filename',f.filename) order by e.file_id,e.id),'[]'::jsonb) into expected
      from public.text_tutorial_step_expected e join public.text_tutorial_step_files f on f.id=e.file_id and f.tutorial_id=tutorial.id and (f.step_id is null or f.step_id=p_step) where e.step_id=p_step;
  end if;
  result := jsonb_build_object('mode',tutorial.type,'files',files,'expected',expected);
  if tutorial.type='block' and (select s.initial_files from public.block_tutorial_steps s where s.id=p_step)<>'{}'::jsonb then
    result := result||jsonb_build_object('initial_files',(select s.initial_files from public.block_tutorial_steps s where s.id=p_step));
  end if;
  return result||jsonb_build_object('revision',encode(sha256(convert_to(result::text,'UTF8')),'hex'));
end $$;

-- Preserve per-step starting captures when teachers import an authored course.
-- Preserve independent reference solutions and guidance in future imports.
CREATE OR REPLACE FUNCTION private.clone_master_course(p_classroom_id uuid, p_course_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$begin
 if auth.uid() is not null then perform private.require_account_ready();end if;
  if not private.can_manage_classroom(p_classroom_id) then raise exception 'Classroom ownership required.'; end if;
  if exists(select 1 from public.classroom_courses where classroom_id=p_classroom_id and course_id=p_course_id) then return; end if;
  DROP TABLE IF EXISTS pg_temp._topic_map;
  CREATE TEMP TABLE _topic_map (old_id uuid, new_id uuid) ON COMMIT DROP;
  TRUNCATE _topic_map;
  DROP TABLE IF EXISTS pg_temp._lesson_map;
  CREATE TEMP TABLE _lesson_map (old_id uuid, new_id uuid) ON COMMIT DROP;
  TRUNCATE _lesson_map;
  DROP TABLE IF EXISTS pg_temp._quiz_map;
  CREATE TEMP TABLE _quiz_map (old_id uuid, new_id uuid) ON COMMIT DROP;
  TRUNCATE _quiz_map;
  DROP TABLE IF EXISTS pg_temp._question_map;
  CREATE TEMP TABLE _question_map (old_id uuid, new_id uuid) ON COMMIT DROP;
  TRUNCATE _question_map;
  DROP TABLE IF EXISTS pg_temp._tutorial_map;
  CREATE TEMP TABLE _tutorial_map (old_id uuid, new_id uuid) ON COMMIT DROP;
  TRUNCATE _tutorial_map;
  DROP TABLE IF EXISTS pg_temp._text_step_map;
  CREATE TEMP TABLE _text_step_map (old_id uuid, new_id uuid) ON COMMIT DROP;
  TRUNCATE _text_step_map;
  DROP TABLE IF EXISTS pg_temp._text_file_map;
  CREATE TEMP TABLE _text_file_map (old_id uuid, new_id uuid) ON COMMIT DROP;
  TRUNCATE _text_file_map;
  DROP TABLE IF EXISTS pg_temp._block_step_map;
  CREATE TEMP TABLE _block_step_map (old_id uuid, new_id uuid) ON COMMIT DROP;
  TRUNCATE _block_step_map;
  DROP TABLE IF EXISTS pg_temp._block_file_map;
  CREATE TEMP TABLE _block_file_map (old_id uuid, new_id uuid) ON COMMIT DROP;
  TRUNCATE _block_file_map;
 
  INSERT INTO public.classroom_courses (classroom_id, course_id)
  VALUES (p_classroom_id, p_course_id)
  ON CONFLICT DO NOTHING;
 
  -- clone topics
  WITH src AS (
    SELECT t.*, gen_random_uuid() AS new_id
    FROM public.topics t
    WHERE t.course_id = p_course_id AND t.classroom_id IS NULL
  ), ins AS (
    INSERT INTO public.topics
      (id, course_id, classroom_id, title, description, "order",
       is_published, required_level, required_xp, slug,
       is_unlocked, unlocked_at)
    SELECT new_id, course_id, p_classroom_id, title, description, "order",
           is_published, required_level, required_xp, slug,
           ("order" = 0), CASE WHEN "order" = 0 THEN now() END
    FROM src
    RETURNING id
  )
  INSERT INTO _topic_map (old_id, new_id) SELECT id, new_id FROM src;
 
  -- clone lessons, repointed at the new topic ids
  WITH src AS (
    SELECT l.*, tm.new_id AS new_topic_id, gen_random_uuid() AS new_id
    FROM public.lessons l
    JOIN _topic_map tm ON tm.old_id = l.topics_id
    WHERE l.classroom_id IS NULL
  ), ins AS (
    INSERT INTO public.lessons
      (id, topics_id, classroom_id, author, title,
       type, is_published, slug, "order", base_xp,proficiency_tier,mastery_checkpoint,learning_objective)
    SELECT new_id, new_topic_id, p_classroom_id, author, title,
           type, is_published, slug, "order", base_xp,proficiency_tier,mastery_checkpoint,learning_objective
    FROM src
    RETURNING id
  )
  INSERT INTO _lesson_map (old_id, new_id) SELECT id, new_id FROM src;
 
  -- clone lectures (1:1 with lesson, simplest case)
  INSERT INTO public.lectures (id, content, video_src, file_url, lesson_id)
  SELECT gen_random_uuid(), lec.content, lec.video_src, lec.file_url, lm.new_id
  FROM public.lectures lec
  JOIN _lesson_map lm ON lm.old_id = lec.lesson_id;
 
  -- clone quizzes
  WITH src AS (
    SELECT q.*, lm.new_id AS new_lesson_id, gen_random_uuid() AS new_id
    FROM public.quizzes q
    JOIN _lesson_map lm ON lm.old_id = q.lesson_id
  ), ins AS (
    INSERT INTO public.quizzes (id, lesson_id, time_limit, passing_score)
    SELECT new_id, new_lesson_id, time_limit, passing_score FROM src
    RETURNING id
  )
  INSERT INTO _quiz_map (old_id, new_id) SELECT id, new_id FROM src;
 
  -- clone questions
  WITH src AS (
    SELECT q.*, qm.new_id AS new_quiz_id, gen_random_uuid() AS new_id
    FROM public.questions q
    JOIN _quiz_map qm ON qm.old_id = q.quiz_id
  ), ins AS (
    INSERT INTO public.questions (id, quiz_id, text, "order")
    SELECT new_id, new_quiz_id, text, "order" FROM src
    RETURNING id
  )
  INSERT INTO _question_map (old_id, new_id) SELECT id, new_id FROM src;
 
  -- clone options
  INSERT INTO public.options (id, question_id, text, is_correct, image_src)
  SELECT gen_random_uuid(), qm.new_id, o.text, o.is_correct, o.image_src
  FROM public.options o
  JOIN _question_map qm ON qm.old_id = o.question_id;
 
  -- clone laboratories + files
  WITH src AS (
    SELECT lab.*, lm.new_id AS new_lesson_id, gen_random_uuid() AS new_id
    FROM public.laboratories lab
    JOIN _lesson_map lm ON lm.old_id = lab.lesson_id
  ), ins AS (
    INSERT INTO public.laboratories (id, lesson_id, instruction,rubric,passing_score,rubric_version)
    SELECT new_id, new_lesson_id, instruction,rubric,passing_score,rubric_version FROM src
    RETURNING id
  ), lab_map AS (
    SELECT id AS old_id, new_id FROM src
  )
  INSERT INTO public.laboratory_files
    (id, laboratory_id, filename, file_type, intial_code,
     intial_blockly_code, expected_code, test_cases)
  SELECT gen_random_uuid(), labmap.new_id, lf.filename, lf.file_type,
         lf.intial_code, lf.intial_blockly_code, lf.expected_code, lf.test_cases
  FROM public.laboratory_files lf
  JOIN lab_map labmap ON labmap.old_id = lf.laboratory_id;
 
  -- clone tutorials (1:1 with lesson)
  WITH src AS (
    SELECT tu.*, lm.new_id AS new_lesson_id, gen_random_uuid() AS new_id
    FROM public.tutorials tu
    JOIN _lesson_map lm ON lm.old_id = tu.lesson_id
  ), ins AS (
    INSERT INTO public.tutorials (id, lesson_id, type)
    SELECT new_id, new_lesson_id, type FROM src
    RETURNING id
  )
  INSERT INTO _tutorial_map (old_id, new_id) SELECT id, new_id FROM src;
 
  -- clone text tutorial steps
  WITH src AS (
    SELECT s.*, tm.new_id AS new_tutorial_id, gen_random_uuid() AS new_id
    FROM public.text_tutorial_steps s
    JOIN _tutorial_map tm ON tm.old_id = s.tutorial_id
  ), ins AS (
    INSERT INTO public.text_tutorial_steps (id, tutorial_id, instruction, hint, "order")
    SELECT new_id, new_tutorial_id, instruction, hint, "order" FROM src
    RETURNING id
  )
  INSERT INTO _text_step_map (old_id, new_id) SELECT id, new_id FROM src;
 
  -- clone text tutorial step files (linked to tutorial, not step)
  WITH src AS (
    SELECT f.*, tm.new_id AS new_tutorial_id, gen_random_uuid() AS new_id
    FROM public.text_tutorial_step_files f
    JOIN _tutorial_map tm ON tm.old_id = f.tutorial_id
  ), ins AS (
    INSERT INTO public.text_tutorial_step_files (id, tutorial_id, filename, initial_content, file_type)
    SELECT new_id, new_tutorial_id, filename, initial_content, file_type FROM src
    RETURNING id
  )
  INSERT INTO _text_file_map (old_id, new_id) SELECT id, new_id FROM src;
 
  -- clone text tutorial step expected (links a step + a file)
  INSERT INTO public.text_tutorial_step_expected (id, step_id, file_id, expected_code, test_cases)
  SELECT gen_random_uuid(), sm.new_id, fm.new_id, e.expected_code, e.test_cases
  FROM public.text_tutorial_step_expected e
  JOIN _text_step_map sm ON sm.old_id = e.step_id
  JOIN _text_file_map fm ON fm.old_id = e.file_id;
 
  -- clone block tutorial steps
  WITH src AS (
    SELECT s.*, tm.new_id AS new_tutorial_id, gen_random_uuid() AS new_id
    FROM public.block_tutorial_steps s
    JOIN _tutorial_map tm ON tm.old_id = s.tutorial_id
  ), ins AS (
    INSERT INTO public.block_tutorial_steps (id, tutorial_id, instruction, hint, "order", highlight_category_path, highlight_block_type, initial_files)
    SELECT new_id, new_tutorial_id, instruction, hint, "order", highlight_category_path, highlight_block_type, initial_files FROM src
    RETURNING id
  )
  INSERT INTO _block_step_map (old_id, new_id) SELECT id, new_id FROM src;
 
  -- clone block tutorial step files (linked to tutorial, not step)
  WITH src AS (
    SELECT f.*, tm.new_id AS new_tutorial_id, gen_random_uuid() AS new_id
    FROM public.block_tutorial_step_files f
    JOIN _tutorial_map tm ON tm.old_id = f.tutorial_id
  ), ins AS (
    INSERT INTO public.block_tutorial_step_files (id, tutorial_id, filename, initial_content_json, file_type)
    SELECT new_id, new_tutorial_id, filename, initial_content_json, file_type FROM src
    RETURNING id
  )
  INSERT INTO _block_file_map (old_id, new_id) SELECT id, new_id FROM src;
 
  -- clone block tutorial step expected (links a step + a file)
  INSERT INTO public.block_tutorial_step_expected (id, step_id, file_id, expected_code, expected_blocks_json, test_cases, require_block_structure)
  SELECT gen_random_uuid(), sm.new_id, fm.new_id, e.expected_code, e.expected_blocks_json, e.test_cases, e.require_block_structure
  FROM public.block_tutorial_step_expected e
  JOIN _block_step_map sm ON sm.old_id = e.step_id
  JOIN _block_file_map fm ON fm.old_id = e.file_id;
END;$function$
;

