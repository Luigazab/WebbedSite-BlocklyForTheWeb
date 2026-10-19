CREATE OR REPLACE FUNCTION private.clone_master_course(p_classroom_id uuid, p_course_id uuid)
 RETURNS void
 LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$BEGIN
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
    INSERT INTO public.block_tutorial_steps (id, tutorial_id, instruction, hint, "order")
    SELECT new_id, new_tutorial_id, instruction, hint, "order" FROM src
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
  INSERT INTO public.block_tutorial_step_expected (id, step_id, file_id, expected_code, test_cases)
  SELECT gen_random_uuid(), sm.new_id, fm.new_id, e.expected_code, e.test_cases
  FROM public.block_tutorial_step_expected e
  JOIN _block_step_map sm ON sm.old_id = e.step_id
  JOIN _block_file_map fm ON fm.old_id = e.file_id;
END;$function$;


CREATE OR REPLACE FUNCTION public.clone_course_to_classroom(p_classroom_id uuid,p_course_id uuid) returns void language sql security invoker set search_path='' begin atomic select private.clone_master_course(p_classroom_id,p_course_id); end;
revoke all on function private.clone_master_course(uuid,uuid),public.clone_course_to_classroom(uuid,uuid) from public,anon;
grant execute on function private.clone_master_course(uuid,uuid),public.clone_course_to_classroom(uuid,uuid) to authenticated;
CREATE OR REPLACE FUNCTION private.get_classroom_student_review(p_classroom uuid, p_student uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare result jsonb;
begin
 if auth.uid() is null or not private.can_read_classroom(p_classroom) or (auth.uid()<>p_student and not private.can_manage_classroom(p_classroom)) then raise exception 'Only the student or classroom teacher can review this work.'; end if;
 if not exists(select 1 from public.classroom_members where classroom_id=p_classroom and student_id=p_student) then raise exception 'Student is not enrolled in this classroom.'; end if;
 select jsonb_build_object('lessons',coalesce(jsonb_agg(to_jsonb(l)||jsonb_build_object(
   'topic_title',t.title,'course_id',t.course_id,'course_slug',(select slug from public.courses where id=t.course_id),'progress',(select to_jsonb(p) from public.user_lesson_progress p where p.user_id=p_student and p.lesson_id=l.id),
   'quiz',(select to_jsonb(q)||jsonb_build_object('question_count',(select count(*) from public.questions where quiz_id=q.id)) from public.quizzes q where q.lesson_id=l.id limit 1),
   'attempts',coalesce((select jsonb_agg(to_jsonb(a)||jsonb_build_object('answers',case when a.finished_at is null then '[]'::jsonb else coalesce((
 select jsonb_agg(jsonb_build_object('question',coalesce(key->>'text',qu.text),'selected',coalesce((select o->>'text' from jsonb_array_elements(key->'options') o where o->>'id'=ans.options_id::text),op.text),'correct',ans.is_correct))
 from public.quiz_answers ans left join public.questions qu on qu.id=ans.question_id left join public.options op on op.id=ans.options_id
 left join private.quiz_attempt_keys ak on ak.attempt_id=a.id left join lateral jsonb_array_elements(ak.questions) key on key->>'id'=ans.question_id::text where ans.attempt_id=a.id),'[]'::jsonb) end) order by a.started_at,a.id) from public.quiz_attempts a join public.quizzes q on q.id=a.quiz_id where q.lesson_id=l.id and a.user_id=p_student),'[]'::jsonb)
 ) order by t."order",l."order",l.title),'[]'::jsonb),
 'submissions',coalesce((select jsonb_agg(to_jsonb(s)||jsonb_build_object('step_order',coalesce(
   (select "order" from public.block_tutorial_steps where id::text=s.step_key),
   (select "order" from public.text_tutorial_steps where id::text=s.step_key))) order by s.submitted_at desc)
   from public.lesson_submissions s where s.classroom_id=p_classroom and s.student_id=p_student),'[]'::jsonb))
 into result from public.lessons l join public.topics t on t.id=l.topics_id where l.classroom_id=p_classroom;
 return result;
end $function$;


CREATE OR REPLACE FUNCTION private.save_lesson_submission(p_lesson uuid, p_files jsonb, p_step uuid, p_finish boolean)
 RETURNS lesson_submissions
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare lesson record; submission public.lesson_submissions;
begin
 if auth.uid() is null then raise exception 'Sign in to submit your work.'; end if;
 select * into lesson from public.lessons where id=p_lesson;
 if not found or lesson.classroom_id is null or not lesson.is_published or lesson.type not in ('tutorial','laboratory') then raise exception 'Published classroom tutorial or laboratory required.'; end if;
 if not exists(select 1 from public.classroom_members where classroom_id=lesson.classroom_id and student_id=auth.uid()) then raise exception 'You must belong to this classroom.'; end if;
 if jsonb_typeof(p_files)<>'array' or jsonb_array_length(p_files)=0 or octet_length(p_files::text)>2097152 then raise exception 'Submit at least one file (maximum 2 MB).'; end if;
 if exists(select 1 from jsonb_array_elements(p_files) f where jsonb_typeof(f)<>'object' or coalesce(f->>'filename','')='' or not (f ? 'code' or f ? 'blocks_json')) then raise exception 'Each file must include a filename and code or workspace.'; end if;
 if lesson.type='laboratory' then return private.submit_laboratory(p_lesson,p_files,gen_random_uuid(),not p_finish); end if;
 if lesson.type='laboratory' and p_step is not null then raise exception 'Laboratories do not have tutorial steps.'; end if;
 if lesson.type='tutorial' and (p_step is null or not exists(
   select 1 from public.tutorials t where t.lesson_id=p_lesson and (
    exists(select 1 from public.block_tutorial_steps s where s.id=p_step and s.tutorial_id=t.id)
    or exists(select 1 from public.text_tutorial_steps s where s.id=p_step and s.tutorial_id=t.id)))) then raise exception 'Select a step belonging to this tutorial.'; end if;
 if lesson.type='tutorial' and p_finish then
   if exists(select 1 from public.block_tutorial_steps current_step join public.block_tutorial_steps other_step on other_step.tutorial_id=current_step.tutorial_id
     where current_step.id=p_step and (other_step."order">current_step."order" or (other_step."order"<current_step."order" and not exists(select 1 from public.block_step_completed where user_id=auth.uid() and step_id=other_step.id))))
     or exists(select 1 from public.text_tutorial_steps current_step join public.text_tutorial_steps other_step on other_step.tutorial_id=current_step.tutorial_id
     where current_step.id=p_step and (other_step."order">current_step."order" or (other_step."order"<current_step."order" and not exists(select 1 from public.text_step_completed where user_id=auth.uid() and step_id=other_step.id)))) then
     raise exception 'Complete the preceding steps and finish on the last tutorial step.';
   end if;
 end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||lesson.classroom_id::text,0));
 if exists(select 1 from public.lesson_submissions where student_id=auth.uid() and lesson_id=p_lesson and step_key=coalesce(p_step::text,'') and graded_at is not null) then raise exception 'This submission has been graded and cannot be replaced.'; end if;
 insert into public.lesson_submissions(classroom_id,lesson_id,student_id,step_key,files,is_final)
 values(lesson.classroom_id,p_lesson,auth.uid(),coalesce(p_step::text,''),p_files,p_finish)
 on conflict(student_id,lesson_id,step_key) do update set files=excluded.files,is_final=lesson_submissions.is_final or excluded.is_final,submitted_at=now()
 returning * into submission;
 if lesson.type='tutorial' then
   if exists(select 1 from public.block_tutorial_steps where id=p_step) then
     insert into public.block_step_completed(user_id,step_id) values(auth.uid(),p_step) on conflict(user_id,step_id) do nothing;
   else
     insert into public.text_step_completed(user_id,step_id) values(auth.uid(),p_step) on conflict(user_id,step_id) do nothing;
   end if;
 end if;
 if p_finish and not exists(select 1 from public.user_lesson_progress where user_id=auth.uid() and lesson_id=p_lesson and is_completed) then
   perform public.complete_lesson(auth.uid(),p_lesson,100);
 end if;
 return submission;
end $function$;


CREATE OR REPLACE FUNCTION private.grade_laboratory_submission(p_submission uuid, p_score integer, p_feedback text)
 RETURNS lesson_submissions
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare submission public.lesson_submissions;
begin
 if auth.uid() is null then raise exception 'Sign in to grade work.'; end if;
 select s.* into submission from public.lesson_submissions s join public.classrooms c on c.id=s.classroom_id
 join public.lessons l on l.id=s.lesson_id where s.id=p_submission and c.teacher_id=auth.uid() and l.type='laboratory' for update of s;
 if not found then raise exception 'Only this classroom teacher can grade its laboratory submissions.'; end if;
 if submission.rubric_snapshot is not null then raise exception 'Use criterion grading for this submission.'; end if;
 if p_score is null or p_score not between 0 and 100 then raise exception 'Score must be a whole number between 0 and 100.'; end if;
 if length(coalesce(p_feedback,''))>5000 then raise exception 'Feedback is limited to 5000 characters.'; end if;
 update public.lesson_submissions set score=p_score,feedback=coalesce(p_feedback,''),graded_by=auth.uid(),graded_at=now(),review_status=case when p_score>=coalesce(passing_score_snapshot,75) then 'passed' else 'needs_revision' end
 where id=p_submission returning * into submission;
 return submission;
end $function$;
