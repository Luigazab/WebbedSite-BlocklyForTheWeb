-- Tutorial objectives are validated by the shared, inert Edge Function runtime.
-- Only its service-role RPC can create completion evidence. Existing content is retained.
alter table public.block_tutorial_step_expected add column require_block_structure boolean not null default false;
alter table public.lesson_submissions add column validation_digest text;
grant usage on schema private to authenticated,service_role;

create function private.tutorial_can_edit(p_tutorial uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select auth.uid() is not null and exists (
    select 1 from public.tutorials t join public.lessons l on l.id=t.lesson_id
    join public.profiles p on p.id=auth.uid() left join public.classrooms c on c.id=l.classroom_id
    where t.id=p_tutorial and (p.role::text='admin' or (p.role::text='teacher' and c.teacher_id=p.id))
  );
$$;
revoke all on function private.tutorial_can_edit(uuid) from public,anon;
grant execute on function private.tutorial_can_edit(uuid) to authenticated,service_role;

create function private.tutorial_can_read(p_tutorial uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select private.tutorial_can_edit(p_tutorial) or (auth.uid() is not null and exists (
    select 1 from public.tutorials t join public.lessons l on l.id=t.lesson_id
    join public.topics topic on topic.id=l.topics_id join public.profiles p on p.id=auth.uid()
    where t.id=p_tutorial and l.is_published and
      ((l.classroom_id is null and p.role::text='teacher') or
       (l.classroom_id is not null and topic.is_unlocked and exists (
         select 1 from public.classroom_members m where m.classroom_id=l.classroom_id and m.student_id=p.id)))
  ));
$$;
revoke all on function private.tutorial_can_read(uuid) from public,anon;
grant execute on function private.tutorial_can_read(uuid) to authenticated,service_role;

-- Replace the old role-only authoring and global-read policies, including text tables.
do $$
declare target text; policy record; parent_expression text;
begin
  foreach target in array array['tutorials','block_tutorial_steps','block_tutorial_step_files','block_tutorial_step_expected','text_tutorial_steps','text_tutorial_step_files','text_tutorial_step_expected'] loop
    for policy in select policyname from pg_policies where schemaname='public' and tablename=target loop
      execute format('drop policy %I on public.%I',policy.policyname,target);
    end loop;
    execute format('alter table public.%I enable row level security',target);
    if target='tutorials' then parent_expression := 'id';
    elsif target='block_tutorial_step_expected' then parent_expression := '(select s.tutorial_id from public.block_tutorial_steps s where s.id=step_id)';
    elsif target='text_tutorial_step_expected' then parent_expression := '(select s.tutorial_id from public.text_tutorial_steps s where s.id=step_id)';
    else parent_expression := 'tutorial_id'; end if;
    execute format('create policy tutorial_author_access on public.%I for all to authenticated using (private.tutorial_can_edit(%s)) with check (private.tutorial_can_edit(%s))',target,parent_expression,parent_expression);
    if target not like '%_expected' then
      execute format('create policy tutorial_learner_read on public.%I for select to authenticated using (private.tutorial_can_read(%s))',target,parent_expression);
    end if;
  end loop;
end $$;

revoke insert,update,delete,truncate,references,trigger on public.block_step_completed,public.text_step_completed from public,anon,authenticated;
do $$
declare target text; policy record; step_table text;
begin
  foreach target in array array['block_step_completed','text_step_completed'] loop
    for policy in select policyname from pg_policies where schemaname='public' and tablename=target loop
      execute format('drop policy %I on public.%I',policy.policyname,target);
    end loop;
    step_table := case when target='block_step_completed' then 'block_tutorial_steps' else 'text_tutorial_steps' end;
    execute format('create policy tutorial_progress_read on public.%I for select to authenticated using (user_id=(select auth.uid()) or exists (select 1 from public.%I s where s.id=step_id and private.tutorial_can_edit(s.tutorial_id)))',target,step_table);
  end loop;
end $$;
grant select on public.block_step_completed,public.text_step_completed to authenticated;

-- A deterministic version binds successful validation to the exact current objectives/files.
create function private.tutorial_step_definition(p_lesson uuid,p_step uuid) returns jsonb
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
  return result||jsonb_build_object('revision',encode(sha256(convert_to(result::text,'UTF8')),'hex'));
end $$;
revoke all on function private.tutorial_step_definition(uuid,uuid) from public,anon,authenticated;

create function private.get_tutorial_view(p_tutorial uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare tutorial record; step record; definition jsonb; steps jsonb := '[]'::jsonb; can_edit boolean; result jsonb;
begin
  if auth.uid() is null or not private.tutorial_can_read(p_tutorial) then raise exception 'This tutorial is not available to you.'; end if;
  select t.*,l.title into tutorial from public.tutorials t join public.lessons l on l.id=t.lesson_id where t.id=p_tutorial;
  can_edit := private.tutorial_can_edit(p_tutorial);
  result := jsonb_build_object('id',tutorial.id,'lesson_id',tutorial.lesson_id,'type',tutorial.type,'lesson',jsonb_build_object('id',tutorial.lesson_id,'title',tutorial.title));
  if tutorial.type='block' then
    for step in select s.* from public.block_tutorial_steps s where s.tutorial_id=p_tutorial order by s."order" loop
      definition := private.tutorial_step_definition(tutorial.lesson_id,step.id);
      steps := steps||jsonb_build_array(to_jsonb(step)||jsonb_build_object('validation_revision',definition->>'revision','block_tutorial_step_expected',
        case when can_edit then definition->'expected' else
          coalesce((select jsonb_agg(jsonb_build_object('file_id',e->'file_id','filename',e->'filename','server_only',true)) from jsonb_array_elements(definition->'expected') e),'[]'::jsonb) end));
    end loop;
    return result||jsonb_build_object('block_tutorial_steps',steps,'block_tutorial_step_files',coalesce((select jsonb_agg(to_jsonb(f) order by f.filename,f.id) from public.block_tutorial_step_files f where f.tutorial_id=p_tutorial),'[]'::jsonb));
  else
    for step in select s.* from public.text_tutorial_steps s where s.tutorial_id=p_tutorial order by s."order" loop
      definition := private.tutorial_step_definition(tutorial.lesson_id,step.id);
      steps := steps||jsonb_build_array(to_jsonb(step)||jsonb_build_object('validation_revision',definition->>'revision','text_tutorial_step_expected',
        case when can_edit then definition->'expected' else
          coalesce((select jsonb_agg(jsonb_build_object('file_id',e->'file_id','filename',e->'filename','server_only',true)) from jsonb_array_elements(definition->'expected') e),'[]'::jsonb) end));
    end loop;
    return result||jsonb_build_object('text_tutorial_steps',steps,'text_tutorial_step_files',coalesce((select jsonb_agg(to_jsonb(f) order by f.filename,f.id) from public.text_tutorial_step_files f where f.tutorial_id=p_tutorial),'[]'::jsonb));
  end if;
end $$;
revoke all on function private.get_tutorial_view(uuid) from public,anon;
grant execute on function private.get_tutorial_view(uuid) to authenticated;
create function public.get_tutorial_view(p_tutorial uuid) returns jsonb language sql security invoker set search_path='' begin atomic
  select private.get_tutorial_view(p_tutorial);
end;
revoke all on function public.get_tutorial_view(uuid) from public,anon;
grant execute on function public.get_tutorial_view(uuid) to authenticated;

-- Private, single-transaction proof. Clients cannot write it or mint completed steps.
create table private.tutorial_validation_proofs (
  transaction_id bigint not null,
  user_id uuid not null,
  lesson_id uuid not null,
  step_id uuid not null,
  files_digest text not null,
  revision text not null,
  primary key(transaction_id,user_id,step_id)
);
alter table private.tutorial_validation_proofs enable row level security;
revoke all on private.tutorial_validation_proofs from public,anon,authenticated,service_role;

create function private.tutorial_use_service_actor(p_user uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare previous jsonb;
begin
  if auth.jwt()->>'role' is distinct from 'service_role' or p_user is null then raise exception 'Trusted tutorial validator required.'; end if;
  previous := jsonb_build_object('claims',current_setting('request.jwt.claims',true),'sub',current_setting('request.jwt.claim.sub',true),'role',current_setting('request.jwt.claim.role',true));
  perform set_config('request.jwt.claims',jsonb_build_object('sub',p_user,'role','authenticated')::text,true);
  perform set_config('request.jwt.claim.sub',p_user::text,true);
  perform set_config('request.jwt.claim.role','authenticated',true);
  return previous;
end $$;
revoke all on function private.tutorial_use_service_actor(uuid) from public,anon,authenticated;
create function private.tutorial_restore_actor(previous jsonb) returns void
language plpgsql security definer set search_path='' as $$
begin
  perform set_config('request.jwt.claims',coalesce(previous->>'claims',''),true);
  perform set_config('request.jwt.claim.sub',coalesce(previous->>'sub',''),true);
  perform set_config('request.jwt.claim.role',coalesce(previous->>'role',''),true);
end $$;
revoke all on function private.tutorial_restore_actor(jsonb) from public,anon,authenticated;

create function private.get_tutorial_validation_definition(p_user uuid,p_lesson uuid,p_step uuid,p_preview boolean) returns jsonb
language plpgsql security definer set search_path='' as $$
declare previous jsonb; definition jsonb;
begin
  previous := private.tutorial_use_service_actor(p_user);
  if p_preview then
    if not exists(select 1 from public.tutorials t where t.lesson_id=p_lesson and private.tutorial_can_read(t.id)) then raise exception 'This tutorial is not available to you.'; end if;
  elsif not exists(select 1 from public.lessons l join public.topics topic on topic.id=l.topics_id
    join public.classroom_members m on m.classroom_id=l.classroom_id and m.student_id=p_user
    where l.id=p_lesson and l.is_published and l.type='tutorial' and topic.is_unlocked) then
    raise exception 'An open, published classroom tutorial and enrollment are required.';
  end if;
  definition := private.tutorial_step_definition(p_lesson,p_step);
  if jsonb_array_length(definition->'expected')=0 then raise exception 'This step has no validation configured.'; end if;
  perform private.tutorial_restore_actor(previous);
  return definition;
end $$;
revoke all on function private.get_tutorial_validation_definition(uuid,uuid,uuid,boolean) from public,anon,authenticated;
grant execute on function private.get_tutorial_validation_definition(uuid,uuid,uuid,boolean) to service_role;
create function public.get_tutorial_validation_definition(p_user uuid,p_lesson uuid,p_step uuid,p_preview boolean default false) returns jsonb language sql security invoker set search_path='' begin atomic
  select private.get_tutorial_validation_definition(p_user,p_lesson,p_step,p_preview);
end;
revoke all on function public.get_tutorial_validation_definition(uuid,uuid,uuid,boolean) from public,anon,authenticated;
grant execute on function public.get_tutorial_validation_definition(uuid,uuid,uuid,boolean) to service_role;

create or replace function private.validate_classroom_submission() returns trigger
language plpgsql security definer set search_path='' as $$
declare lesson record; expected jsonb; expected_filename text; lab_instruction text; proof record; step record; definition jsonb;
begin
  select l.id,l.type,l.classroom_id,t.is_unlocked into lesson from public.lessons l join public.topics t on t.id=l.topics_id where l.id=new.lesson_id;
  if lesson.classroom_id is null then return new; end if;
  if not lesson.is_unlocked then raise exception 'This class topic is locked.'; end if;
  if lesson.type='laboratory' and new.is_final then
    select instruction into lab_instruction from public.laboratories where lesson_id=new.lesson_id limit 1;
    begin expected := lab_instruction::jsonb->'expectedBlocks'; expected_filename := lab_instruction::jsonb->>'expectedFilename';
    exception when invalid_text_representation then expected := null; expected_filename := null; end;
    if expected is null then raise exception 'Laboratory objective checks are not configured.'; end if;
    if not exists(select 1 from jsonb_array_elements(new.files) f where (expected_filename is null or f->>'filename'=expected_filename) and private.workspace_structure_matches(f->'blocks_json',expected)) then raise exception 'Laboratory block structure does not meet the required objective.'; end if;
    new.objective_score := 100;
  elsif lesson.type='tutorial' then
    definition := private.tutorial_step_definition(new.lesson_id,new.step_key::uuid);
    if jsonb_array_length(definition->'expected')=0 then raise exception 'This step has no validation configured.'; end if;
    select p.* into proof from private.tutorial_validation_proofs p where p.transaction_id=txid_current() and p.user_id=auth.uid()
      and p.user_id=new.student_id and p.lesson_id=new.lesson_id and p.step_id::text=new.step_key
      and p.files_digest=encode(sha256(convert_to(new.files::text,'UTF8')),'hex') and p.revision=definition->>'revision';
    if not found then raise exception 'Submit through the trusted tutorial validator.'; end if;
    new.validation_digest := proof.revision;
    if new.is_final then
      for step in
        select other.id from public.block_tutorial_steps current_step join public.block_tutorial_steps other on other.tutorial_id=current_step.tutorial_id where current_step.id::text=new.step_key and other."order"<current_step."order"
        union all select other.id from public.text_tutorial_steps current_step join public.text_tutorial_steps other on other.tutorial_id=current_step.tutorial_id where current_step.id::text=new.step_key and other."order"<current_step."order"
      loop
        if not exists(select 1 from public.lesson_submissions s where s.student_id=new.student_id and s.lesson_id=new.lesson_id and s.step_key=step.id::text and s.validation_digest=private.tutorial_step_definition(new.lesson_id,step.id)->>'revision') then
          raise exception 'Validate every preceding step against the current tutorial before finishing.';
        end if;
      end loop;
    end if;
  end if;
  return new;
end $$;

create function private.save_validated_tutorial_submission(p_user uuid,p_lesson uuid,p_step uuid,p_files jsonb,p_finish boolean,p_revision text,p_active_seconds integer,p_device_factor numeric) returns public.lesson_submissions
language plpgsql security definer set search_path='' as $$
declare previous jsonb; definition jsonb; saved public.lesson_submissions;
begin
  previous := private.tutorial_use_service_actor(p_user);
  perform 1 from public.lessons where id=p_lesson for share;
  definition := private.tutorial_step_definition(p_lesson,p_step);
  if definition->>'revision' is distinct from p_revision then raise exception 'Tutorial objectives changed. Reload and try again.'; end if;
  insert into private.tutorial_validation_proofs values(txid_current(),p_user,p_lesson,p_step,encode(sha256(convert_to(p_files::text,'UTF8')),'hex'),p_revision);
  saved := private.save_lesson_submission_timed(p_lesson,p_files,p_step,p_finish,p_active_seconds,p_device_factor);
  delete from private.tutorial_validation_proofs where transaction_id=txid_current() and user_id=p_user and step_id=p_step;
  perform private.tutorial_restore_actor(previous);
  return saved;
end $$;
revoke all on function private.save_validated_tutorial_submission(uuid,uuid,uuid,jsonb,boolean,text,integer,numeric) from public,anon,authenticated;
grant execute on function private.save_validated_tutorial_submission(uuid,uuid,uuid,jsonb,boolean,text,integer,numeric) to service_role;
create function public.save_validated_tutorial_submission(p_user uuid,p_lesson uuid,p_step uuid,p_files jsonb,p_finish boolean,p_revision text,p_active_seconds integer default null,p_device_factor numeric default null) returns public.lesson_submissions
language sql security invoker set search_path='' begin atomic
  select private.save_validated_tutorial_submission(p_user,p_lesson,p_step,p_files,p_finish,p_revision,p_active_seconds,p_device_factor);
end;
revoke all on function public.save_validated_tutorial_submission(uuid,uuid,uuid,jsonb,boolean,text,integer,numeric) from public,anon,authenticated;
grant execute on function public.save_validated_tutorial_submission(uuid,uuid,uuid,jsonb,boolean,text,integer,numeric) to service_role;

create or replace function private.guard_classroom_lesson_completion() returns trigger
language plpgsql security definer set search_path='' as $$
declare lesson record;
begin
  if not new.is_completed then return new; end if;
  select l.id,l.type,l.classroom_id,t.is_unlocked into lesson from public.lessons l join public.topics t on t.id=l.topics_id where l.id=new.lesson_id;
  if lesson.classroom_id is null then return new; end if;
  if not lesson.is_unlocked then raise exception 'This class topic is locked.'; end if;
  if lesson.type='tutorial' then
    if not exists(select 1 from public.lesson_submissions s where s.lesson_id=new.lesson_id and s.student_id=new.user_id and s.is_final and
      s.validation_digest=private.tutorial_step_definition(s.lesson_id,s.step_key::uuid)->>'revision') then raise exception 'Pass the current tutorial checks before completing this lesson.'; end if;
  elsif lesson.type='laboratory' and not exists(select 1 from public.lesson_submissions s where s.lesson_id=new.lesson_id and s.student_id=new.user_id and s.is_final) then
    raise exception 'Pass the activity checks before completing this lesson.';
  end if;
  return new;
end $$;

-- Save the complete draft, including staged deletions, in one ownership-checked transaction.
create function private.save_tutorial_definition(p_user uuid,p_definition jsonb,p_publish boolean) returns jsonb
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
    if tutorial_id is null or not private.tutorial_can_edit(tutorial_id) then raise exception 'You cannot edit this tutorial.'; end if;
    if existing.updated_at is distinct from (p_definition->>'revision')::timestamptz then raise exception 'This tutorial changed in another editor. Reload before saving.'; end if;
    if existing.classroom_id is distinct from topic.classroom_id then raise exception 'A tutorial cannot be moved between classrooms.'; end if;
    if (select type from public.tutorials where id=tutorial_id)<>'block' then raise exception 'Use the matching tutorial editor.'; end if;
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
revoke all on function private.save_tutorial_definition(uuid,jsonb,boolean) from public,anon,authenticated;
grant execute on function private.save_tutorial_definition(uuid,jsonb,boolean) to service_role;
create function public.save_tutorial_definition(p_user uuid,p_definition jsonb,p_publish boolean) returns jsonb language sql security invoker set search_path='' begin atomic
  select private.save_tutorial_definition(p_user,p_definition,p_publish);
end;
revoke all on function public.save_tutorial_definition(uuid,jsonb,boolean) from public,anon,authenticated;
grant execute on function public.save_tutorial_definition(uuid,jsonb,boolean) to service_role;
