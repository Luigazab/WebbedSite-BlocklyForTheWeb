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
    INSERT INTO public.block_tutorial_steps (id, tutorial_id, instruction, hint, "order", highlight_category_path, highlight_block_type)
    SELECT new_id, new_tutorial_id, instruction, hint, "order", highlight_category_path, highlight_block_type FROM src
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

