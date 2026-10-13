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
    insert into public.block_tutorial_steps(id,tutorial_id,instruction,hint,"order",highlight_category_path,highlight_block_type)
      values(step_id,tutorial_id,step->>'instruction',step->>'hint',position,case when jsonb_typeof(step->'highlightCategoryPath')='array' then array(select jsonb_array_elements_text(step->'highlightCategoryPath')) else null end,step->>'highlightBlockType')
      on conflict(id) do update set instruction=excluded.instruction,hint=excluded.hint,"order"=excluded."order",highlight_category_path=excluded.highlight_category_path,highlight_block_type=excluded.highlight_block_type;
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
