CREATE OR REPLACE FUNCTION private.validate_classroom_submission()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare lesson record; expected jsonb; expected_filename text; lab_instruction text; proof record; step record; definition jsonb;
begin
  select l.id,l.type,l.classroom_id,t.is_unlocked into lesson from public.lessons l join public.topics t on t.id=l.topics_id where l.id=new.lesson_id;
  if lesson.classroom_id is null then return new; end if;
  if not lesson.is_unlocked and (tg_op='INSERT' or old.files is distinct from new.files) then raise exception 'This class topic is locked.'; end if;
  if lesson.type='laboratory' then
    -- Objective checks are formative. Only the teacher's rubric establishes mastery.
    new.objective_score := null;
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
end $function$;
