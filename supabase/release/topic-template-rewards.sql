-- Template settings are independent of existing classroom copies.
create table public.topic_badge_templates (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 100),
  description text not null default '',
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index topic_badge_templates_course_idx on public.topic_badge_templates(course_id);
alter table public.topic_badge_templates enable row level security;
grant select,insert,update,delete on public.topic_badge_templates to authenticated;
create policy template_badges_admin on public.topic_badge_templates for all to authenticated
using (private.current_profile_role()='admin') with check (private.current_profile_role()='admin');
create function private.validate_topic_badge_template() returns trigger language plpgsql set search_path='' as $$
begin
  if not exists(select 1 from public.topics where id=new.topic_id and course_id=new.course_id and classroom_id is null) then
    raise exception 'Select a master topic belonging to this course.';
  end if;
  if new.image_url is not null and new.image_url !~* '^https?://' then raise exception 'Use an HTTP or HTTPS badge image URL.'; end if;
  return new;
end $$;
create trigger validate_topic_badge_template before insert or update on public.topic_badge_templates
for each row execute function private.validate_topic_badge_template();
revoke all on function private.validate_topic_badge_template() from public,anon,authenticated;

-- Capture first-completion XP in the same transaction as the existing XP ledger.
-- Historical completions are deliberately not backfilled as new celebrations.
create table public.lesson_reward_receipts (
  student_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  earned_xp integer not null,
  claimed_at timestamptz,
  primary key(student_id,lesson_id)
);
alter table public.lesson_reward_receipts enable row level security;
grant select on public.lesson_reward_receipts to authenticated;
create policy own_reward_receipts on public.lesson_reward_receipts for select to authenticated using(student_id=(select auth.uid()));
alter table public.classroom_badge_awards add column celebration_seen_at timestamptz;
update public.classroom_badge_awards set celebration_seen_at=earned_at;

create function private.capture_lesson_reward() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.is_completed and (tg_op='INSERT' or not coalesce(old.is_completed,false)) then
    insert into public.lesson_reward_receipts(student_id,lesson_id,earned_xp)
    select new.user_id,new.lesson_id,coalesce(sum(x.xp_earned),0)::integer from public.user_xp_logs x
      where x.user_id=new.user_id and x.source_id=new.lesson_id and x.source_type='lesson'
    on conflict do nothing;
  end if;
  return new;
end $$;
create trigger capture_lesson_reward after insert or update of is_completed on public.user_lesson_progress
for each row execute function private.capture_lesson_reward();
revoke all on function private.capture_lesson_reward() from public,anon,authenticated;

create function private.lesson_completion_rewards(p_lesson uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare l public.lessons; xp integer:=0; completed boolean; topic_complete boolean; awards jsonb;
begin
  perform private.require_account_ready();
  select * into l from public.lessons where id=p_lesson;
  if auth.uid() is null or l.classroom_id is null or not exists(select 1 from public.classroom_members where classroom_id=l.classroom_id and student_id=auth.uid()) then
    raise exception 'An enrolled student is required.';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||l.classroom_id::text,0));
  select exists(select 1 from public.user_lesson_progress where lesson_id=l.id and user_id=auth.uid() and is_completed) into completed;
  if not completed then return jsonb_build_object('completed',false,'earned_xp',0,'awards','[]'::jsonb,'topic_complete',false); end if;
  update public.lesson_reward_receipts set claimed_at=now() where student_id=auth.uid() and lesson_id=l.id and claimed_at is null returning earned_xp into xp;
  select exists(select 1 from public.lessons where topics_id=l.topics_id and is_published)
    and not exists(select 1 from public.lessons lesson where lesson.topics_id=l.topics_id and lesson.is_published
      and not exists(select 1 from public.user_lesson_progress p where p.lesson_id=lesson.id and p.user_id=auth.uid() and p.is_completed)) into topic_complete;
  perform private.evaluate_classroom_badges(auth.uid(),l.classroom_id);
  with earned as (
    update public.classroom_badge_awards a set celebration_seen_at=now() from public.classroom_badge_rules r
    where a.rule_id=r.id and a.student_id=auth.uid() and a.classroom_id=l.classroom_id
      and r.topic_id=l.topics_id and r.criterion='topic_completed' and a.celebration_seen_at is null
    returning a.*
  ) select coalesce(jsonb_agg(to_jsonb(earned) order by earned_at,id),'[]'::jsonb) into awards from earned;
  return jsonb_build_object('completed',true,'earned_xp',coalesce(xp,0),'topic_complete',topic_complete,'awards',awards);
end $$;
create function public.lesson_completion_rewards(p_lesson uuid) returns jsonb language sql security invoker set search_path=''
begin atomic select private.lesson_completion_rewards(p_lesson); end;
revoke all on function private.lesson_completion_rewards(uuid), public.lesson_completion_rewards(uuid) from public,anon;
grant execute on function private.lesson_completion_rewards(uuid), public.lesson_completion_rewards(uuid) to authenticated;

create or replace function private.default_classroom_lesson_rule() returns trigger
language plpgsql set search_path='' as $$
begin
  if new.required_for_topic is null then
    new.required_for_topic := new.type in ('tutorial','laboratory') and new.topic_track='core';
  end if;
  return new;
end $$;

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
       type, is_published, slug, "order", base_xp,proficiency_tier,mastery_checkpoint,learning_objective,topic_track,required_for_topic,expected_minutes)
    SELECT new_id, new_topic_id, p_classroom_id, author, title,
           type, is_published, slug, "order", base_xp,proficiency_tier,mastery_checkpoint,learning_objective,topic_track,required_for_topic,expected_minutes
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
  update public.lessons target set topic_track=source.topic_track,
    required_for_topic=source.required_for_topic, expected_minutes=source.expected_minutes
  from public.lessons source join _lesson_map mapping on mapping.old_id=source.id
  where target.id=mapping.new_id;

  insert into public.classroom_badge_rules(classroom_id,course_id,topic_id,name,description,image_url,criterion,is_active)
  select p_classroom_id,p_course_id,mapping.new_id,b.name,b.description,b.image_url,'topic_completed',b.is_active
  from public.topic_badge_templates b join _topic_map mapping on mapping.old_id=b.topic_id
  where b.course_id=p_course_id;
  perform private.recompute_classroom_topic_unlocks(p_classroom_id);
END;$function$
;

