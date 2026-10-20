-- Rollback-only regression: imported tutorial solutions remain independent.
begin;
do $test$
declare teacher uuid; classroom uuid; course uuid; source_step uuid; source_expected uuid; copied_expected uuid;
begin
 select id into teacher from public.profiles where role='teacher' and not must_change_password limit 1;
 select id into course from public.courses where slug='javascript';
 if teacher is null or course is null then raise exception 'Teacher and JavaScript curriculum required'; end if;
 select s.id,e.id into source_step,source_expected from public.block_tutorial_steps s
 join public.tutorials tu on tu.id=s.tutorial_id join public.lessons l on l.id=tu.lesson_id
 join public.topics t on t.id=l.topics_id join public.block_tutorial_step_expected e on e.step_id=s.id
 where t.course_id=course and l.classroom_id is null and e.expected_blocks_json is not null limit 1;
 update public.block_tutorial_steps set highlight_category_path=ARRAY['JavaScript'],highlight_block_type='js_let' where id=source_step;
 update public.block_tutorial_step_expected set require_block_structure=true where id=source_expected;
 insert into public.classrooms(teacher_id,name,is_active) values(teacher,'Rollback import regression',true) returning id into classroom;
 perform set_config('request.jwt.claims',jsonb_build_object('sub',teacher,'role','authenticated')::text,true);
 set local role authenticated;
 perform public.clone_course_to_classroom(classroom,course);
 reset role;
 if not exists(select 1 from public.lessons where classroom_id=classroom and type='tutorial') then raise exception 'Nothing imported'; end if;
 if exists(
 select 1 from public.block_tutorial_step_expected ce
 join public.block_tutorial_steps cs on cs.id=ce.step_id
 join public.block_tutorial_step_files cf on cf.id=ce.file_id
 join public.tutorials ct on ct.id=cs.tutorial_id join public.lessons cl on cl.id=ct.lesson_id
 join public.lessons ml on ml.slug=cl.slug and ml.classroom_id is null
 join public.tutorials mt on mt.lesson_id=ml.id
 join public.block_tutorial_steps ms on ms.tutorial_id=mt.id and ms."order"=cs."order"
 join public.block_tutorial_step_files mf on mf.tutorial_id=mt.id and mf.filename=cf.filename
 join public.block_tutorial_step_expected me on me.step_id=ms.id and me.file_id=mf.id
 where cl.classroom_id=classroom and
 (ce.expected_blocks_json is distinct from me.expected_blocks_json or ce.require_block_structure is distinct from me.require_block_structure
 or cs.highlight_category_path is distinct from ms.highlight_category_path or cs.highlight_block_type is distinct from ms.highlight_block_type))
 then raise exception 'Import dropped solution or guidance fields'; end if;
 select ce.id into copied_expected from public.block_tutorial_step_expected ce join public.block_tutorial_steps cs on cs.id=ce.step_id
 join public.tutorials ct on ct.id=cs.tutorial_id join public.lessons cl on cl.id=ct.lesson_id
 where cl.classroom_id=classroom and ce.require_block_structure limit 1;
 if copied_expected is null then raise exception 'Required structure was not imported';end if;
 update public.block_tutorial_step_expected set expected_blocks_json='{}',require_block_structure=false where id=copied_expected;
 if not exists(select 1 from public.block_tutorial_step_expected where id=source_expected and require_block_structure and expected_blocks_json<>'{}'::jsonb) then raise exception 'Classroom edit changed master';end if;
end $test$;
rollback;
