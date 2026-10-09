-- Existing block tutorials may have expected code but no saved workspace JSON.
-- Require their configured code objective before saving a step as complete.
create or replace function private.validate_classroom_submission() returns trigger
language plpgsql security definer set search_path = '' as $$
declare lesson record; expected jsonb; expected_filename text; solution record; lab_instruction text;
begin
  select l.id,l.type,l.classroom_id,t.is_unlocked into lesson from public.lessons l
    join public.topics t on t.id=l.topics_id where l.id=new.lesson_id;
  if lesson.classroom_id is null then return new; end if;
  if not lesson.is_unlocked then raise exception 'This class topic is locked.'; end if;
  if lesson.type='laboratory' and new.is_final then
    select instruction into lab_instruction from public.laboratories where lesson_id=new.lesson_id limit 1;
    begin
      expected := lab_instruction::jsonb->'expectedBlocks';
      expected_filename := lab_instruction::jsonb->>'expectedFilename';
    exception when invalid_text_representation then expected := null; expected_filename := null; end;
    if expected is null then raise exception 'Laboratory objective checks are not configured.'; end if;
    if not exists(select 1 from jsonb_array_elements(new.files) f
      where (expected_filename is null or f->>'filename'=expected_filename)
        and private.workspace_structure_matches(f->'blocks_json',expected)) then
      raise exception 'Laboratory block structure does not meet the required objective.';
    end if;
    new.objective_score := 100;
  elsif lesson.type='tutorial' then
    for solution in select e.expected_blocks_json,e.expected_code,e.test_cases,f.filename
      from public.block_tutorial_step_expected e
      join public.block_tutorial_step_files f on f.id=e.file_id
      where e.step_id::text=new.step_key
    loop
      if solution.expected_blocks_json is not null then
        if not exists(select 1 from jsonb_array_elements(new.files) submitted
          where submitted->>'filename'=solution.filename
            and private.workspace_structure_matches(submitted->'blocks_json',solution.expected_blocks_json)) then
          raise exception 'Tutorial block structure does not meet the required objective for %.',solution.filename;
        end if;
      elsif solution.expected_code is not null
        and (solution.test_cases is null or solution.test_cases::jsonb='[]'::jsonb) then
        if not exists(select 1 from jsonb_array_elements(new.files) submitted
          where submitted->>'filename'=solution.filename
            and btrim(replace(coalesce(submitted->>'code',''),E'\r\n',E'\n'),E' \t\r\n')
              = btrim(replace(solution.expected_code,E'\r\n',E'\n'),E' \t\r\n')) then
          raise exception 'Tutorial output does not meet the expected code for %.',solution.filename;
        end if;
      end if;
    end loop;
  end if;
  return new;
end $$;
