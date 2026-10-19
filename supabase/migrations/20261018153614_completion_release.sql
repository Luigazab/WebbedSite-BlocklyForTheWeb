-- Additive completion release. Existing accounts, submissions and grades survive.
alter table public.profiles add column must_change_password boolean not null default false;
create or replace function private.create_signup_profile() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,username,email,role) values(new.id,
 coalesce(nullif(btrim(new.raw_user_meta_data->>'username'),''),'user-'||new.id::text),coalesce(new.email,''),'student') on conflict(id) do nothing;
 return new;
end $$;
create function private.guard_password_requirement() returns trigger language plpgsql set search_path='' as $$
begin
 if new.must_change_password is distinct from old.must_change_password and current_user not in ('postgres','supabase_auth_admin') and coalesce(auth.role(),'')<>'service_role' then
 raise exception 'Only the account service can change the password requirement.'; end if;
 return new;
end $$;
create trigger guard_password_requirement before update on public.profiles for each row execute function private.guard_password_requirement();
create function private.password_changed() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.encrypted_password is distinct from old.encrypted_password then update public.profiles set must_change_password=false where id=new.id; end if;
 return new;
end $$;
create trigger completion_password_changed after update of encrypted_password on auth.users for each row execute function private.password_changed();
create function public.finish_first_password_change() returns boolean language plpgsql security invoker set search_path='' as $$
begin
 if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid() and not must_change_password) then raise exception 'Change your temporary password first.'; end if;
 return true;
end $$;

alter table public.lessons add column proficiency_tier text not null default 'beginner' check(proficiency_tier in ('beginner','intermediate','advanced'));
alter table public.lessons add column mastery_checkpoint boolean not null default false;
alter table public.lessons add column learning_objective text not null default '';
alter table public.laboratories add column rubric jsonb not null default '[{"id":"content","label":"Required content and elements","max":30},{"id":"structure","label":"Appropriate structure and organization","max":25},{"id":"application","label":"Correct application of taught concepts","max":30},{"id":"readability","label":"Readable and organized output","max":15}]';
alter table public.laboratories add column passing_score integer not null default 75 check(passing_score between 1 and 100);
alter table public.laboratories add column rubric_version integer not null default 1;
alter table public.lesson_submissions add column rubric_snapshot jsonb;
alter table public.lesson_submissions add column passing_score_snapshot integer;
alter table public.lesson_submissions add column rubric_version integer;
alter table public.lesson_submissions add column criterion_scores jsonb;
alter table public.lesson_submissions add column review_status text not null default 'submitted' check(review_status in ('draft','submitted','passed','needs_revision'));
alter table public.lesson_submissions add column revision integer not null default 1;
alter table public.lesson_submissions add column request_key uuid;
update public.lesson_submissions set review_status=case when not is_final then 'draft' when graded_at is null then 'submitted' when score>=75 then 'passed' else 'needs_revision' end;

create table public.submission_history (
 id uuid primary key default gen_random_uuid(), submission_id uuid not null references public.lesson_submissions on delete cascade,
 classroom_id uuid not null references public.classrooms on delete cascade,student_id uuid not null references public.profiles on delete cascade,
 snapshot jsonb not null, recorded_at timestamptz not null default now()
);
create index submission_history_parent_idx on public.submission_history(submission_id,recorded_at);
alter table public.submission_history enable row level security;
grant select on public.submission_history to authenticated;
create policy submission_history_read on public.submission_history for select to authenticated using(student_id=auth.uid() or private.can_manage_classroom(classroom_id));
create function private.archive_submission() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if old.files is distinct from new.files or old.score is distinct from new.score or old.feedback is distinct from new.feedback or old.review_status is distinct from new.review_status then
 insert into public.submission_history(submission_id,classroom_id,student_id,snapshot) values(old.id,old.classroom_id,old.student_id,to_jsonb(old)); end if;
 return new;
end $$;
create trigger archive_submission before update on public.lesson_submissions for each row execute function private.archive_submission();

create function private.validate_lab_rubric() returns trigger language plpgsql security definer set search_path='' as $$
declare total numeric;
begin
 if jsonb_typeof(new.rubric)<>'array' or jsonb_array_length(new.rubric) not between 1 and 12 then raise exception 'Provide 1 to 12 rubric criteria.'; end if;
 if exists(select 1 from jsonb_array_elements(new.rubric) x where coalesce(x->>'id','')='' or coalesce(trim(x->>'label'),'')='' or jsonb_typeof(x->'max')<>'number' or (x->>'max')::numeric<=0 or (x->>'max')::numeric<>trunc((x->>'max')::numeric)) then raise exception 'Criteria need unique IDs, labels and positive whole-number maximum points.'; end if;
 if (select count(distinct x->>'id') from jsonb_array_elements(new.rubric) x)<>jsonb_array_length(new.rubric) then raise exception 'Criterion IDs must be unique.'; end if;
 select sum((x->>'max')::numeric) into total from jsonb_array_elements(new.rubric) x;
 if total<>100 then raise exception 'Rubric maximum points must total 100.'; end if;
 if tg_op='UPDATE' and (new.rubric is distinct from old.rubric or new.passing_score is distinct from old.passing_score) then
 if exists(select 1 from public.lessons where id=old.lesson_id and is_published) then raise exception 'Unpublish the lesson before changing its rubric.'; end if;
 new.rubric_version:=old.rubric_version+1; end if;
 return new;
end $$;
create trigger validate_lab_rubric before insert or update on public.laboratories for each row execute function private.validate_lab_rubric();

-- Laboratory-only endpoint: no objective check can prevent teacher review.
create function private.submit_laboratory(p_lesson uuid,p_files jsonb,p_request uuid,p_draft boolean) returns public.lesson_submissions
language plpgsql security definer set search_path='' as $$
declare l public.lessons; lab public.laboratories; s public.lesson_submissions;
begin
 select * into l from public.lessons where id=p_lesson and type='laboratory' and is_published;
 if not found or auth.uid() is null or not exists(select 1 from public.classroom_members where classroom_id=l.classroom_id and student_id=auth.uid()) then raise exception 'An enrolled student and published classroom laboratory are required.'; end if;
 if p_request is null or p_files is null or jsonb_typeof(p_files)<>'array' or jsonb_array_length(p_files) not between 1 and 32 or octet_length(p_files::text)>2097152 then raise exception 'Submit 1 to 32 files, up to 2 MB, with a request ID.'; end if;
 if exists(select 1 from jsonb_array_elements(p_files) f where jsonb_typeof(f)<>'object' or coalesce(f->>'filename','')='' or not(f?'code' or f?'blocks_json')) or (select count(distinct f->>'filename') from jsonb_array_elements(p_files) f)<>jsonb_array_length(p_files) then raise exception 'Files must have unique names and source or blocks.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||l.classroom_id::text,0));
 select * into s from public.lesson_submissions where student_id=auth.uid() and lesson_id=p_lesson and step_key='' for update;
 if s.request_key=p_request then return s; end if;
 if s.id is not null and s.review_status in ('submitted','passed') and s.is_final then raise exception 'Wait for review or a revision request before replacing submitted work.'; end if;
 select * into strict lab from public.laboratories where lesson_id=p_lesson;
 insert into public.lesson_submissions(classroom_id,lesson_id,student_id,files,is_final,rubric_snapshot,passing_score_snapshot,rubric_version,review_status,request_key)
 values(l.classroom_id,l.id,auth.uid(),p_files,not p_draft,lab.rubric,lab.passing_score,lab.rubric_version,case when p_draft then 'draft' else 'submitted' end,p_request)
 on conflict(student_id,lesson_id,step_key) do update set files=excluded.files,is_final=excluded.is_final,
 rubric_snapshot=excluded.rubric_snapshot,passing_score_snapshot=excluded.passing_score_snapshot,rubric_version=excluded.rubric_version,
 review_status=excluded.review_status,request_key=excluded.request_key,submitted_at=now(),score=null,criterion_scores=null,feedback='',graded_at=null,graded_by=null,
 revision=case when lesson_submissions.review_status='needs_revision' then lesson_submissions.revision+1 else lesson_submissions.revision end returning * into s;
 if not p_draft and not exists(select 1 from public.user_lesson_progress where user_id=auth.uid() and lesson_id=p_lesson and is_completed) then perform public.complete_lesson(auth.uid(),p_lesson,100); end if;
 return s;
end $$;
create function public.submit_laboratory(p_lesson uuid,p_files jsonb,p_request uuid,p_draft boolean default false) returns public.lesson_submissions language sql security invoker set search_path='' begin atomic
 select private.submit_laboratory(p_lesson,p_files,p_request,p_draft);
end;

create function private.grade_lab_rubric(p_submission uuid,p_scores jsonb,p_feedback text,p_revision integer) returns public.lesson_submissions
language plpgsql security definer set search_path='' as $$
declare s public.lesson_submissions; criterion jsonb; points numeric; total integer:=0;
begin
 select s1.* into s from public.lesson_submissions s1 join public.classrooms c on c.id=s1.classroom_id join public.profiles p on p.id=auth.uid()
 join public.lessons l on l.id=s1.lesson_id where s1.id=p_submission and c.teacher_id=auth.uid() and p.role='teacher' and not p.must_change_password and l.type='laboratory' for update of s1;
 if not found or not s.is_final then raise exception 'Only the owning classroom teacher can grade submitted laboratory work.'; end if;
 if p_revision<>s.revision then raise exception 'The student submitted a new revision. Reload before grading.'; end if;
 if s.rubric_snapshot is null then raise exception 'Use legacy percentage grading for this historical submission.'; end if;
 if p_scores is null or jsonb_typeof(p_scores)<>'object' or length(coalesce(p_feedback,''))>5000 then raise exception 'Provide criterion scores and feedback up to 5000 characters.'; end if;
 if (select count(*) from jsonb_object_keys(p_scores))<>jsonb_array_length(s.rubric_snapshot) then raise exception 'Score every rubric criterion exactly once.'; end if;
 for criterion in select value from jsonb_array_elements(s.rubric_snapshot) loop
 if jsonb_typeof(p_scores->(criterion->>'id'))<>'number' or p_scores->(criterion->>'id') is null then raise exception 'Each criterion needs a numeric score.'; end if;
 points:=(p_scores->>(criterion->>'id'))::numeric;
 if points<0 or points>(criterion->>'max')::numeric or points<>trunc(points) then raise exception 'Criterion score exceeds its allowed whole-number range.'; end if;
 total:=total+points::integer;
 end loop;
 update public.lesson_submissions set criterion_scores=p_scores,score=total,feedback=coalesce(p_feedback,''),graded_by=auth.uid(),graded_at=now(),
 review_status=case when total>=passing_score_snapshot then 'passed' else 'needs_revision' end where id=p_submission returning * into s;
 return s;
end $$;
create function public.grade_lab_rubric(p_submission uuid,p_scores jsonb,p_feedback text,p_revision integer) returns public.lesson_submissions language sql security invoker set search_path='' begin atomic
 select private.grade_lab_rubric(p_submission,p_scores,p_feedback,p_revision);
end;

-- Feedback columns are additive: preserve the actual deployed user_id/type data.
alter table public.feedback add column title text not null default '';
alter table public.feedback add column context_url text;
alter table public.feedback add column lesson_id uuid references public.lessons on delete set null;
alter table public.feedback add column screenshot_path text;
update public.feedback set status='open' where status is null;
alter table public.feedback alter column status set default 'open';
create table public.feedback_history(id uuid primary key default gen_random_uuid(),feedback_id bigint not null references public.feedback on delete cascade,status text not null,changed_by uuid references public.profiles,created_at timestamptz not null default now());
alter table public.feedback_history enable row level security;
grant select on public.feedback_history to authenticated;
create policy feedback_history_read on public.feedback_history for select to authenticated using(exists(select 1 from public.feedback f where f.id=feedback_id and (f.user_id=auth.uid() or exists(select 1 from public.profiles where id=auth.uid() and role='admin'))));
create function private.feedback_status_history() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.status not in ('open','in_review','resolved','closed') then raise exception 'Invalid report status.'; end if;
 if tg_op='INSERT' or new.status is distinct from old.status then insert into public.feedback_history(feedback_id,status,changed_by) values(new.id,new.status,auth.uid()); end if;
 return new;
end $$;
create trigger feedback_status_history after insert or update on public.feedback for each row execute function private.feedback_status_history();
alter table public.feedback enable row level security;
do $$ declare p record; begin for p in select policyname from pg_policies where schemaname='public' and tablename='feedback' loop execute format('drop policy %I on public.feedback',p.policyname); end loop; end $$;
revoke all on public.feedback from anon,authenticated;
grant select,insert,update on public.feedback to authenticated;
do $$ declare seq text; begin select pg_get_serial_sequence('public.feedback','id') into seq; if seq is not null then execute format('grant usage,select on sequence %s to authenticated',seq); end if; end $$;
create policy feedback_read on public.feedback for select to authenticated using(user_id=auth.uid() or exists(select 1 from public.profiles where id=auth.uid() and role='admin'));
create policy feedback_insert on public.feedback for insert to authenticated with check(user_id=auth.uid() and status='open' and reply is null);
create policy feedback_update on public.feedback for update to authenticated using(exists(select 1 from public.profiles where id=auth.uid() and role='admin')) with check(exists(select 1 from public.profiles where id=auth.uid() and role='admin'));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('report-screenshots','report-screenshots',false,2097152,array['image/png','image/jpeg','image/webp']) on conflict(id) do nothing;
create policy report_image_insert on storage.objects for insert to authenticated with check(bucket_id='report-screenshots' and (storage.foldername(name))[1]=auth.uid()::text);
create policy report_image_read on storage.objects for select to authenticated using(bucket_id='report-screenshots' and ((storage.foldername(name))[1]=auth.uid()::text or exists(select 1 from public.profiles where id=auth.uid() and role='admin')));

alter table public.projects add column source_kind text not null default 'personal' check(source_kind in ('personal','tutorial','laboratory'));
alter table public.projects add column source_lesson_id uuid references public.lessons on delete set null;
alter table public.projects add column source_classroom_id uuid references public.classrooms on delete set null;
create unique index learning_project_once on public.projects(user_id,source_lesson_id) where source_lesson_id is not null;
create function private.copy_learning_project(p_lesson uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare l public.lessons; s public.lesson_submissions; project_id uuid;
begin
 select * into l from public.lessons where id=p_lesson and type in ('tutorial','laboratory');
 if not found or auth.uid() is null or not exists(select 1 from public.classroom_members where classroom_id=l.classroom_id and student_id=auth.uid()) then raise exception 'Classroom membership required.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||p_lesson::text,0));
 select id into project_id from public.projects where user_id=auth.uid() and source_lesson_id=p_lesson;
 if project_id is not null then return project_id; end if;
 select * into s from public.lesson_submissions where student_id=auth.uid() and lesson_id=p_lesson and is_final order by submitted_at desc limit 1;
 if not found then raise exception 'Finish and submit the activity first.'; end if;
 insert into public.projects(user_id,title,description,type,is_public,source_kind,source_lesson_id,source_classroom_id)
 values(auth.uid(),l.title,'Editable copy of submitted learning work. Graded submissions remain unchanged.','block',false,l.type,l.id,l.classroom_id) returning id into project_id;
 insert into public.project_files(project_id,filename,blocks_json,code) select project_id,f->>'filename',f->'blocks_json',f->>'code' from jsonb_array_elements(s.files) f;
 return project_id;
end $$;
create function public.copy_learning_project(p_lesson uuid) returns uuid language sql security invoker set search_path='' begin atomic select private.copy_learning_project(p_lesson); end;

-- Restrict new functions by default, including trigger helpers.
revoke all on function private.guard_password_requirement(),private.password_changed(),private.archive_submission(),private.validate_lab_rubric(),private.feedback_status_history() from public,anon,authenticated;
revoke all on function private.submit_laboratory(uuid,jsonb,uuid,boolean),private.grade_lab_rubric(uuid,jsonb,text,integer),private.copy_learning_project(uuid),public.submit_laboratory(uuid,jsonb,uuid,boolean),public.grade_lab_rubric(uuid,jsonb,text,integer),public.copy_learning_project(uuid),public.finish_first_password_change() from public,anon;
grant execute on function private.submit_laboratory(uuid,jsonb,uuid,boolean),private.grade_lab_rubric(uuid,jsonb,text,integer),private.copy_learning_project(uuid),public.submit_laboratory(uuid,jsonb,uuid,boolean),public.grade_lab_rubric(uuid,jsonb,text,integer),public.copy_learning_project(uuid),public.finish_first_password_change() to authenticated;


create function private.get_course_mastery(p_classroom uuid,p_student uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if auth.uid() is null or not private.can_read_classroom(p_classroom) or (auth.uid()<>p_student and not private.can_manage_classroom(p_classroom)) then raise exception 'You may only view your progress or review your own classroom.'; end if;
 if not exists(select 1 from public.classroom_members where classroom_id=p_classroom and student_id=p_student) then raise exception 'Student is not enrolled.'; end if;
 with evidence as (
 select l.id,l.title,t.course_id,l.type,l.proficiency_tier,l.learning_objective,
 case when l.type='quiz' then (select max(case when a.status='completed' then 100.0*a.score/nullif(coalesce(a.score_total,(select count(*) from public.questions where quiz_id=q.id)),0) else a.score end) from public.quiz_attempts a where a.quiz_id=q.id and a.user_id=p_student and a.finished_at is not null)
 else s.score end score,
 case when l.type='quiz' then coalesce((select 100.0*a.passing_count/nullif(a.score_total,0) from public.quiz_attempts a where a.quiz_id=q.id and a.user_id=p_student and a.finished_at is not null and a.score_total>0 order by 100.0*a.score/a.score_total desc limit 1),100.0*q.passing_score/nullif((select count(*) from public.questions where quiz_id=q.id),0)) else coalesce(s.passing_score_snapshot,lab.passing_score,75) end passing,
 case when l.type='laboratory' then coalesce(s.review_status,'not_submitted') else 'assessed' end review_status
 from public.lessons l join public.topics t on t.id=l.topics_id
 left join public.quizzes q on q.lesson_id=l.id left join public.laboratories lab on lab.lesson_id=l.id
 left join public.lesson_submissions s on s.lesson_id=l.id and s.student_id=p_student and s.step_key=''
 where l.classroom_id=p_classroom and l.is_published and l.mastery_checkpoint and l.type in ('quiz','laboratory')
 ), tiers as (
 select cc.course_id,tier,
 exists(select 1 from evidence e where e.course_id=cc.course_id and e.proficiency_tier=tier and e.type='quiz')
 and exists(select 1 from evidence e where e.course_id=cc.course_id and e.proficiency_tier=tier and e.type='laboratory')
 and not exists(select 1 from evidence e where e.course_id=cc.course_id and e.proficiency_tier=tier and (e.score is null or e.score<e.passing or (e.type='laboratory' and e.review_status<>'passed'))) passed
 from public.classroom_courses cc cross join unnest(array['beginner','intermediate','advanced']) tier where cc.classroom_id=p_classroom
 )
 select coalesce(jsonb_agg(jsonb_build_object('course_id',c.id,'title',c.title,'slug',c.slug,
 'classification',case when not exists(select 1 from evidence e where e.course_id=c.id and e.score is not null) then null
 when (select bool_and(passed) from tiers where course_id=c.id) then 'advanced'
 when (select bool_and(passed) from tiers where course_id=c.id and tier in ('beginner','intermediate')) then 'intermediate' else 'beginner' end,
 'checkpoints',coalesce((select jsonb_agg(to_jsonb(e)||jsonb_build_object('passed',e.score>=e.passing and (e.type<>'laboratory' or e.review_status='passed')) order by array_position(array['beginner','intermediate','advanced'],e.proficiency_tier),e.type) from evidence e where e.course_id=c.id),'[]'::jsonb),
 'tiers',(select jsonb_agg(jsonb_build_object('tier',tier,'passed',passed)) from tiers where course_id=c.id))), '[]'::jsonb) into result
 from public.classroom_courses cc join public.courses c on c.id=cc.course_id where cc.classroom_id=p_classroom;
 return result;
end $$;
create function public.get_course_mastery(p_classroom uuid,p_student uuid) returns jsonb language sql security invoker set search_path='' begin atomic select private.get_course_mastery(p_classroom,p_student); end;
revoke all on function public.get_course_mastery(uuid,uuid),private.get_course_mastery(uuid,uuid) from public,anon;
grant execute on function public.get_course_mastery(uuid,uuid),private.get_course_mastery(uuid,uuid) to authenticated;
alter table public.lessons add constraint checkpoint_type check(not mastery_checkpoint or type in ('quiz','laboratory'));
notify pgrst,'reload schema';


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



alter table public.quiz_attempts add column score_total integer;
alter table public.quiz_attempts add column passing_count integer;
alter table public.quiz_attempts add column deadline timestamptz;
create table private.quiz_attempt_keys(attempt_id uuid primary key references public.quiz_attempts on delete cascade,questions jsonb not null);
revoke all on private.quiz_attempt_keys from public,anon,authenticated;

create function private.begin_assessed_quiz(p_quiz uuid) returns public.quiz_attempts language plpgsql security definer set search_path='' as $$
declare q record; a public.quiz_attempts; keys jsonb;
begin
 select q1.*,l.classroom_id into q from public.quizzes q1 join public.lessons l on l.id=q1.lesson_id join public.topics t on t.id=l.topics_id
 where q1.id=p_quiz and l.is_published and t.is_unlocked and exists(select 1 from public.classroom_members where classroom_id=l.classroom_id and student_id=auth.uid());
 if not found then raise exception 'An unlocked quiz in your classroom is required.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||p_quiz::text,0));
 select * into a from public.quiz_attempts where user_id=auth.uid() and quiz_id=p_quiz and finished_at is null and deadline>now() order by started_at desc limit 1;
 if found then return a; end if;
 select jsonb_agg(jsonb_build_object('id',qu.id,'text',qu.text,'options',(select jsonb_agg(jsonb_build_object('id',o.id,'text',o.text,'is_correct',o.is_correct)) from public.options o where o.question_id=qu.id))) into keys from public.questions qu where qu.quiz_id=p_quiz;
 if keys is null or jsonb_array_length(keys)=0 then raise exception 'This quiz has no questions.'; end if;
 insert into public.quiz_attempts(user_id,quiz_id,status,score_total,passing_count,deadline) values(auth.uid(),p_quiz,'in_progress',jsonb_array_length(keys),coalesce(q.passing_score,ceil(jsonb_array_length(keys)*0.75)::integer),now()+make_interval(secs=>coalesce(q.time_limit,300))) returning * into a;
 insert into private.quiz_attempt_keys(attempt_id,questions) values(a.id,keys);
 return a;
end $$;
create function public.begin_assessed_quiz(p_quiz uuid) returns public.quiz_attempts language sql security invoker set search_path='' begin atomic select private.begin_assessed_quiz(p_quiz); end;

create function private.finish_assessed_quiz(p_attempt uuid,p_answers jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.quiz_attempts; q record; key jsonb; selected uuid; correct boolean; points integer:=0; answers jsonb:='[]';
begin
 select * into a from public.quiz_attempts where id=p_attempt and user_id=auth.uid() for update;
 if not found then raise exception 'Your quiz attempt is required.'; end if;
 select q1.*,l.classroom_id into q from public.quizzes q1 join public.lessons l on l.id=q1.lesson_id where q1.id=a.quiz_id;
 if not exists(select 1 from public.classroom_members where classroom_id=q.classroom_id and student_id=auth.uid()) then raise exception 'Classroom membership required.'; end if;
 if a.finished_at is not null then return to_jsonb(a)||jsonb_build_object('answers',coalesce((select jsonb_agg(to_jsonb(x)) from public.quiz_answers x where attempt_id=a.id),'[]'::jsonb)); end if;
 if jsonb_typeof(p_answers)<>'array' or jsonb_array_length(p_answers)>a.score_total then raise exception 'Invalid answer list.'; end if;
 if now()>a.deadline+interval '15 seconds' then p_answers:='[]'::jsonb; end if;
 for key in select value from jsonb_array_elements((select questions from private.quiz_attempt_keys where attempt_id=a.id)) loop
 selected:=nullif((select x->>'selectedOptionId' from jsonb_array_elements(p_answers) x where x->>'questionId'=key->>'id' limit 1),'')::uuid;
 correct:=coalesce((select (o->>'is_correct')::boolean from jsonb_array_elements(key->'options') o where o->>'id'=selected::text),false);
 if selected is not null and not exists(select 1 from jsonb_array_elements(key->'options') o where o->>'id'=selected::text) then raise exception 'An option does not belong to its question.'; end if;
 if correct then points:=points+1; end if;
 if selected is not null then insert into public.quiz_answers(attempt_id,question_id,options_id,is_correct) values(a.id,(key->>'id')::uuid,selected,correct); end if;
 end loop;
 update public.quiz_attempts set score=points,status='completed',finished_at=now() where id=a.id returning * into a;
 if points>=a.passing_count then perform public.complete_lesson(auth.uid(),q.lesson_id,round(100.0*points/a.score_total)::integer); end if;
 select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) into answers from public.quiz_answers x where attempt_id=a.id;
 return to_jsonb(a)||jsonb_build_object('answers',answers);
end $$;
create function public.finish_assessed_quiz(p_attempt uuid,p_answers jsonb) returns jsonb language sql security invoker set search_path='' begin atomic select private.finish_assessed_quiz(p_attempt,p_answers); end;
revoke insert,update,delete on public.quiz_attempts,public.quiz_answers,public.user_lesson_progress from authenticated;
revoke all on function private.begin_assessed_quiz(uuid),public.begin_assessed_quiz(uuid),private.finish_assessed_quiz(uuid,jsonb),public.finish_assessed_quiz(uuid,jsonb) from public,anon;
grant execute on function private.begin_assessed_quiz(uuid),public.begin_assessed_quiz(uuid),private.finish_assessed_quiz(uuid,jsonb),public.finish_assessed_quiz(uuid,jsonb) to authenticated;


CREATE OR REPLACE FUNCTION private.complete_classroom_lesson(p_user_id uuid, p_lesson_id uuid, p_score integer)
 RETURNS TABLE(earned_xp integer, is_first_attempt boolean, updated_best_score integer, course_total_xp bigint, did_level_up boolean, new_level bigint, next_level_xp_required bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare lesson record; progress record; attempts integer; best integer; xp integer; first_attempt boolean;
  course_xp bigint; prior_level bigint; level_value bigint; next_xp bigint;
begin
  if auth.uid() is null or auth.uid()<>p_user_id then raise exception 'You can only complete your own lessons.'; end if;
  if p_score is null or p_score<0 or p_score>100 then raise exception 'Score must be between 0 and 100.'; end if;
  select l.*,t.course_id into lesson from public.lessons l join public.topics t on t.id=l.topics_id where l.id=p_lesson_id;
  if not found or not coalesce(lesson.is_published,false) then raise exception 'Published lesson not found.'; end if;
  if lesson.classroom_id is not null and not exists(select 1 from public.classroom_members where classroom_id=lesson.classroom_id and student_id=p_user_id) then
    raise exception 'You must belong to this classroom.';
  end if;
  if lesson.type='quiz' and not exists(select 1 from public.quiz_attempts a join public.quizzes q on q.id=a.quiz_id where q.lesson_id=lesson.id and a.user_id=p_user_id and a.finished_at is not null and a.score>=coalesce(a.passing_count,q.passing_score,1)) then raise exception 'Pass the quiz before completing it.'; end if;
  if lesson.type in ('tutorial','laboratory') and not exists(select 1 from public.lesson_submissions where lesson_id=lesson.id and student_id=p_user_id and is_final) then raise exception 'Submit the activity before completing it.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text||coalesce(lesson.classroom_id::text,lesson.course_id::text),0));
  select * into progress from public.user_lesson_progress where user_id=p_user_id and lesson_id=p_lesson_id for update;
  if coalesce(progress.is_completed,false) then
    update public.user_lesson_progress set best_score=greatest(best_score,p_score) where user_id=p_user_id and lesson_id=p_lesson_id;
    select coalesce(sum(xp_earned),0) into course_xp from public.user_xp_logs where user_id=p_user_id and course_id=lesson.course_id;
    select coalesce(max(level),1) into level_value from public.levels where xp_required<=course_xp;
    select xp_required into next_xp from public.levels where level=level_value+1;
    return query select 0,false,greatest(progress.best_score,p_score),course_xp,false,level_value,next_xp;
    return;
  end if;
  attempts := coalesce(progress.attempts_count,0);
  best := greatest(coalesce(progress.best_score,0),p_score);
  first_attempt := attempts=0;
  xp := lesson.base_xp + case when p_score=100 then ceil(lesson.base_xp*0.2)::integer else 0 end;
  if not first_attempt then xp := ceil(xp*0.2)::integer; end if;
  select coalesce(max(level),1) into prior_level from public.levels where xp_required <= (
    select coalesce(sum(xp_earned),0) from public.user_xp_logs where user_id=p_user_id and course_id=lesson.course_id);
  insert into public.user_xp_logs(user_id,course_id,classroom_id,source_id,source_type,xp_earned)
    values(p_user_id,lesson.course_id,lesson.classroom_id,p_lesson_id,'lesson',xp);
  insert into public.user_lesson_progress(user_id,lesson_id,is_completed,attempts_count,best_score,completed_at)
    values(p_user_id,p_lesson_id,true,attempts+1,best,now())
    on conflict(user_id,lesson_id) do update set is_completed=true,attempts_count=excluded.attempts_count,
      best_score=excluded.best_score,completed_at=excluded.completed_at;
  select coalesce(sum(xp_earned),0) into course_xp from public.user_xp_logs where user_id=p_user_id and course_id=lesson.course_id;
  select coalesce(max(level),1) into level_value from public.levels where xp_required<=course_xp;
  select xp_required into next_xp from public.levels where level=level_value+1;
  return query select xp,first_attempt,best,course_xp,level_value>prior_level,level_value,next_xp;
end $function$;


create table public.reusable_block_versions (
 id uuid primary key default gen_random_uuid(),family_id uuid not null default gen_random_uuid(),version integer not null check(version>0),
 classroom_id uuid not null references public.classrooms on delete cascade,author_id uuid not null references public.profiles,
 label text not null check(length(trim(label)) between 1 and 80),description text not null default '' check(length(description)<=1000),
 language text not null check(language in ('html','css','js')),workspace jsonb not null check(octet_length(workspace::text)<=262144),
 connection_shape jsonb not null default '{}',created_at timestamptz not null default now(),unique(family_id,version)
);
create index reusable_block_classroom_idx on public.reusable_block_versions(classroom_id,created_at);
alter table public.reusable_block_versions enable row level security;
grant select,insert on public.reusable_block_versions to authenticated;
create policy reusable_read on public.reusable_block_versions for select to authenticated using(private.can_read_classroom(classroom_id));
create policy reusable_insert on public.reusable_block_versions for insert to authenticated with check(author_id=auth.uid() and exists(select 1 from public.classrooms c join public.profiles p on p.id=c.teacher_id where c.id=classroom_id and c.teacher_id=auth.uid() and p.role='teacher' and not p.must_change_password));
create function private.guard_reusable_version() returns trigger language plpgsql security definer set search_path='' as $$
begin
 perform pg_advisory_xact_lock(hashtextextended(new.family_id::text,0));
 if exists(select 1 from public.reusable_block_versions where family_id=new.family_id and (classroom_id<>new.classroom_id or author_id<>new.author_id)) then raise exception 'A block family belongs to its original teacher and classroom.'; end if;
 if new.version<>coalesce((select max(version)+1 from public.reusable_block_versions where family_id=new.family_id),1) then raise exception 'Use the next consecutive version.'; end if;
 if jsonb_typeof(new.workspace->'blocks'->'blocks')<>'array' or jsonb_array_length(new.workspace->'blocks'->'blocks')<>1 then raise exception 'Capture exactly one connected stack.'; end if;
 if new.workspace::text like '%"webbed_reusable"%' then raise exception 'Nested reusable blocks are not supported.'; end if;
 return new;
end $$;
create trigger guard_reusable_version before insert on public.reusable_block_versions for each row execute function private.guard_reusable_version();
revoke all on function private.guard_reusable_version() from public,anon,authenticated;


create function private.classroom_gradebook(p_classroom uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not exists(select 1 from public.classrooms c join public.profiles p on p.id=auth.uid() where c.id=p_classroom and c.teacher_id=auth.uid() and p.role='teacher' and not p.must_change_password) then raise exception 'Only the classroom teacher can open this gradebook.'; end if;
 return jsonb_build_object('students',coalesce((select jsonb_agg(jsonb_build_object('studentId',p.id,'username',p.username,'avatarUrl',p.avatar_url) order by p.username) from public.classroom_members m join public.profiles p on p.id=m.student_id where m.classroom_id=p_classroom),'[]'::jsonb),
 'lessons',coalesce((select jsonb_agg(jsonb_build_object('id',l.id,'title',l.title,'type',l.type,'topic_title',t.title,'course_id',t.course_id) order by t."order",l."order") from public.lessons l join public.topics t on t.id=l.topics_id where l.classroom_id=p_classroom and l.is_published),'[]'::jsonb),
 'results',coalesce((select jsonb_agg(jsonb_build_object('student_id',m.student_id,'lesson_id',l.id,
 'completed',coalesce(p.is_completed,false),'score',case when l.type='laboratory' then s.score when l.type='quiz' then (select max(round(case when a.status='completed' then 100.0*a.score/nullif(coalesce(a.score_total,(select count(*) from public.questions where quiz_id=q.id)),0) else a.score end)) from public.quiz_attempts a where a.user_id=m.student_id and a.quiz_id=q.id and a.finished_at is not null) end,
 'status',case when l.type='laboratory' then coalesce(s.review_status,'not_submitted') when l.type='quiz' then case when p.is_completed then 'passed' when exists(select 1 from public.quiz_attempts a where a.quiz_id=q.id and a.user_id=m.student_id and a.finished_at is not null) then 'attempted' else 'not_attempted' end when p.is_completed then 'completed' else 'not_completed' end))
 from public.classroom_members m join public.lessons l on l.classroom_id=m.classroom_id and l.is_published
 left join public.user_lesson_progress p on p.user_id=m.student_id and p.lesson_id=l.id left join public.lesson_submissions s on s.student_id=m.student_id and s.lesson_id=l.id and s.step_key='' left join public.quizzes q on q.lesson_id=l.id where m.classroom_id=p_classroom),'[]'::jsonb));
end $$;
create function public.classroom_gradebook(p_classroom uuid) returns jsonb language sql security invoker set search_path='' begin atomic select private.classroom_gradebook(p_classroom); end;

create function private.release_dashboard() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare role_name text; payload jsonb;
begin
 select role::text into role_name from public.profiles where id=auth.uid() and not must_change_password;
 if role_name='admin' then
 select jsonb_build_object('counts',jsonb_build_object('Students',(select count(*) from public.profiles where role='student'),'Teachers',(select count(*) from public.profiles where role='teacher'),'Classrooms',(select count(*) from public.classrooms),'Course templates',(select count(*) from public.courses),'Open reports',(select count(*) from public.feedback where status in ('open','in_review'))),
 'signups',coalesce((select jsonb_agg(to_jsonb(s) order by s."day") from (select created_at::date as "day",count(*) users from public.profiles where created_at>=now()-interval '30 days' group by created_at::date) s),'[]'::jsonb),
 'courses',coalesce((select jsonb_agg(jsonb_build_object('title',c.title,'published_lessons',(select count(*) from public.lessons l join public.topics t on t.id=l.topics_id where t.course_id=c.id and l.is_published),
 'completions',(select count(*) from public.user_lesson_progress p join public.lessons l on l.id=p.lesson_id join public.topics t on t.id=l.topics_id where t.course_id=c.id and p.is_completed),
 'quiz_attempts',(select count(*) from public.quiz_attempts a join public.quizzes q on q.id=a.quiz_id join public.lessons l on l.id=q.lesson_id join public.topics t on t.id=l.topics_id where t.course_id=c.id and a.finished_at is not null),
 'quiz_average',(select round(avg(case when a.status='completed' then 100.0*a.score/nullif(coalesce(a.score_total,(select count(*) from public.questions where quiz_id=q.id)),0) else a.score end),1) from public.quiz_attempts a join public.quizzes q on q.id=a.quiz_id join public.lessons l on l.id=q.lesson_id join public.topics t on t.id=l.topics_id where t.course_id=c.id and a.finished_at is not null),
 'reviewed_labs',(select count(*) from public.lesson_submissions s join public.lessons l on l.id=s.lesson_id join public.topics t on t.id=l.topics_id where t.course_id=c.id and l.type='laboratory' and s.graded_at is not null),
 'lab_average',(select round(avg(s.score),1) from public.lesson_submissions s join public.lessons l on l.id=s.lesson_id join public.topics t on t.id=l.topics_id where t.course_id=c.id and l.type='laboratory' and s.graded_at is not null))) from public.courses c),'[]'::jsonb),
 'recent_completions',coalesce((select jsonb_agg(to_jsonb(r)) from (select l.title,p.completed_at,c.name classroom from public.user_lesson_progress p join public.lessons l on l.id=p.lesson_id left join public.classrooms c on c.id=l.classroom_id where p.is_completed order by p.completed_at desc nulls last limit 8) r),'[]'::jsonb),
 'reports',coalesce((select jsonb_agg(to_jsonb(f)) from (select id,title,type,status,created_at from public.feedback order by created_at desc limit 6) f),'[]'::jsonb)) into payload;
 elsif role_name='teacher' then
 select jsonb_build_object('counts',jsonb_build_object('Classrooms',(select count(*) from public.classrooms where teacher_id=auth.uid()),'Students',(select count(distinct m.student_id) from public.classroom_members m join public.classrooms c on c.id=m.classroom_id where c.teacher_id=auth.uid()),'Labs awaiting review',(select count(*) from public.lesson_submissions s join public.classrooms c on c.id=s.classroom_id join public.lessons l on l.id=s.lesson_id where c.teacher_id=auth.uid() and l.type='laboratory' and s.is_final and s.graded_at is null)),
 'classrooms',coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'name',c.name,'students',(select count(*) from public.classroom_members where classroom_id=c.id),'completed',(select count(*) from public.user_lesson_progress p join public.lessons l on l.id=p.lesson_id join public.classroom_members m on m.classroom_id=c.id and m.student_id=p.user_id where l.classroom_id=c.id and l.is_published and p.is_completed),'possible',(select count(*) from public.classroom_members where classroom_id=c.id)*(select count(*) from public.lessons where classroom_id=c.id and is_published))) from public.classrooms c where c.teacher_id=auth.uid()),'[]'::jsonb),
 'queue',coalesce((select jsonb_agg(to_jsonb(q)) from (select s.id,s.classroom_id,s.student_id,p.username,l.title,s.submitted_at from public.lesson_submissions s join public.classrooms c on c.id=s.classroom_id join public.profiles p on p.id=s.student_id join public.lessons l on l.id=s.lesson_id where c.teacher_id=auth.uid() and l.type='laboratory' and s.is_final and s.graded_at is null order by s.submitted_at limit 20) q),'[]'::jsonb),
 'recent',coalesce((select jsonb_agg(to_jsonb(r)) from (select s.classroom_id,p.username,l.title,s.submitted_at from public.lesson_submissions s join public.classrooms c on c.id=s.classroom_id join public.profiles p on p.id=s.student_id join public.lessons l on l.id=s.lesson_id where c.teacher_id=auth.uid() and s.is_final order by s.submitted_at desc limit 8) r),'[]'::jsonb)) into payload;
 else raise exception 'Staff account required.'; end if;
 return payload;
end $$;
create function public.release_dashboard() returns jsonb language sql security invoker set search_path='' begin atomic select private.release_dashboard(); end;
revoke all on function private.classroom_gradebook(uuid),public.classroom_gradebook(uuid),private.release_dashboard(),public.release_dashboard() from public,anon;
grant execute on function private.classroom_gradebook(uuid),public.classroom_gradebook(uuid),private.release_dashboard(),public.release_dashboard() to authenticated;


create function private.quiz_editor_data(p_lesson uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if not exists(select 1 from public.lessons l join public.profiles p on p.id=auth.uid() where l.id=p_lesson and not p.must_change_password and (p.role='admin' or (p.role='teacher' and private.can_manage_classroom(l.classroom_id)))) then raise exception 'Only the lesson authoring staff can access answer keys.'; end if;
 select to_jsonb(l)||jsonb_build_object('quizzes',coalesce((select jsonb_agg(to_jsonb(q)||jsonb_build_object('questions',coalesce((select jsonb_agg(to_jsonb(qu)||jsonb_build_object('options',coalesce((select jsonb_agg(to_jsonb(o)) from public.options o where o.question_id=qu.id),'[]'::jsonb)) order by qu."order") from public.questions qu where qu.quiz_id=q.id),'[]'::jsonb))) from public.quizzes q where q.lesson_id=l.id),'[]'::jsonb)) into result from public.lessons l where l.id=p_lesson;
 return result;
end $$;
create function public.quiz_editor_data(p_lesson uuid) returns jsonb language sql security invoker set search_path='' begin atomic select private.quiz_editor_data(p_lesson); end;
revoke all on function private.quiz_editor_data(uuid),public.quiz_editor_data(uuid) from public,anon;
grant execute on function private.quiz_editor_data(uuid),public.quiz_editor_data(uuid) to authenticated;
revoke select on public.options from authenticated,anon;
grant select(id,question_id,text,image_src) on public.options to authenticated;


create function private.account_ready() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.profiles where id=auth.uid() and not must_change_password); $$;
revoke all on function private.account_ready() from public,anon;
grant execute on function private.account_ready() to authenticated;
do $$ declare tab record; begin
 for tab in select tablename from pg_tables where schemaname='public' and rowsecurity and tablename<>'profiles' loop
 execute format('create policy account_setup_required on public.%I as restrictive for all to authenticated using ((select private.account_ready())) with check ((select private.account_ready()))',tab.tablename);
 end loop;
end $$;
create or replace function private.can_manage_classroom(p_classroom uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.profiles p where p.id=auth.uid() and not p.must_change_password and
 (p.role::text='admin' or (p.role::text='teacher' and exists(select 1 from public.classrooms c where c.id=p_classroom and c.teacher_id=p.id))));
$$;
create function private.sync_confirmed_email() returns trigger language plpgsql security definer set search_path='' as $$ begin
 if new.email is distinct from old.email then update public.profiles set email=new.email where id=new.id; end if; return new;
end $$;
create trigger sync_confirmed_profile_email after update of email on auth.users for each row execute function private.sync_confirmed_email();
revoke all on function private.sync_confirmed_email() from public,anon,authenticated;


CREATE OR REPLACE FUNCTION private.get_classroom_topic_flow(p_classroom uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare teacher boolean; topic record; member record; required_count integer;
  done_count integer; eligible_count integer; completed_count integer;
  completed_lessons integer; accuracy numeric; speed_bonus numeric; pending_count integer;
  exempt_reason text; late_joiner boolean; is_eligible boolean;
  student_rows jsonb; topic_rows jsonb := '[]'::jsonb; log_rows jsonb;
begin
  select c.teacher_id=auth.uid() into teacher from public.classrooms c where c.id=p_classroom;
  if teacher is null or (not teacher and not exists (
    select 1 from public.classroom_members m where m.classroom_id=p_classroom and m.student_id=auth.uid()
  )) then raise exception 'Classroom access required.'; end if;

  for topic in
    select t.id,t.title,t.course_id,t."order",t.is_published,t.is_unlocked,t.unlocked_at,t.unlocked_by
    from public.topics t join public.classroom_courses cc
      on cc.classroom_id=t.classroom_id and cc.course_id=t.course_id
    where t.classroom_id=p_classroom
    order by coalesce(cc.sequence_order,2147483647),t."order",t.id
  loop
    select count(*) into required_count from public.lessons l where l.topics_id=topic.id
      and l.is_published and l.topic_track='core' and l.required_for_topic;
    eligible_count := 0; completed_count := 0; student_rows := '[]'::jsonb;
    for member in select m.student_id,m.enrolled_at,p.username from public.classroom_members m
      join public.profiles p on p.id=m.student_id where m.classroom_id=p_classroom order by p.username
    loop
      select e.reason into exempt_reason from public.classroom_topic_exemptions e
      where e.topic_id=topic.id and e.student_id=member.student_id;
      late_joiner := topic.unlocked_at is not null and member.enrolled_at > topic.unlocked_at;
      is_eligible := exempt_reason is null and not late_joiner;
      select count(p.lesson_id) filter (where l.type not in ('tutorial','laboratory') or exists (
          select 1 from public.lesson_submissions final_submission where final_submission.lesson_id=l.id
            and final_submission.student_id=member.student_id and final_submission.is_final)),
        avg(case when l.type='laboratory' then s.score else p.best_score end),
        avg(case when metrics.active_seconds is not null and metrics.device_factor is not null
          then greatest(0,least(5,5 * (l.expected_minutes*60 - metrics.active_seconds / metrics.device_factor)
            / (l.expected_minutes*60))) else 0 end),
        count(*) filter (where l.type='laboratory' and s.id is not null and s.graded_at is null)
      into completed_lessons,accuracy,speed_bonus,pending_count
      from public.lessons l
      left join public.user_lesson_progress p on p.lesson_id=l.id and p.user_id=member.student_id and p.is_completed
      left join public.lesson_submissions s on s.lesson_id=l.id and s.student_id=member.student_id and s.step_key=''
      left join lateral (select active_seconds,device_factor from public.lesson_submissions timing
        where timing.lesson_id=l.id and timing.student_id=member.student_id and timing.is_final
        order by timing.submitted_at desc limit 1) metrics on true
      where l.topics_id=topic.id and l.is_published and l.topic_track='core' and l.required_for_topic;
      if is_eligible then
        eligible_count := eligible_count+1;
        if required_count>0 and completed_lessons=required_count then completed_count := completed_count+1; end if;
      end if;
      if teacher or member.student_id=auth.uid() then
        student_rows := student_rows || jsonb_build_array(jsonb_build_object(
          'student_id',member.student_id,'username',member.username,
          'eligible',is_eligible,'exemption_reason',exempt_reason,'late_joiner',late_joiner,
          'completed_lessons',completed_lessons,'required_lessons',required_count,
          'status',case when exempt_reason is not null then 'exempt'
            when required_count>0 and completed_lessons=required_count then 'completed'
            when late_joiner then 'late_enrollee'
            else 'working' end,
          'pending_reviews',pending_count,
          'accuracy',round(accuracy,1),'speed_bonus',0,
          'classification',(select value->>'classification' from jsonb_array_elements(private.get_course_mastery(p_classroom,member.student_id)) where value->>'course_id'=topic.course_id::text),
          'classification_provisional',pending_count>0
        ));
      end if;
    end loop;
    topic_rows := topic_rows || jsonb_build_array(jsonb_build_object(
      'id',topic.id,'title',topic.title,'course_id',topic.course_id,'order',topic."order",
      'is_published',topic.is_published,'is_unlocked',topic.is_unlocked,
      'required_lessons',required_count,'completed',completed_count,'eligible',eligible_count,
      'students',student_rows
    ));
  end loop;
  if teacher then
    select coalesce(jsonb_agg(to_jsonb(log) order by log.created_at desc),'[]'::jsonb) into log_rows
    from (select id,topic_id,student_id,actor_id,action,details,created_at
      from public.classroom_flow_log where classroom_id=p_classroom order by created_at desc limit 30) log;
  else log_rows := '[]'::jsonb; end if;
  return jsonb_build_object('topics',topic_rows,'events',log_rows);
end $function$;


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


create policy completion_xp_read on public.user_xp_logs for select to authenticated using(user_id=auth.uid() or private.can_manage_classroom(classroom_id));


alter table public.classroom_badge_rules drop constraint classroom_badge_rules_criterion_check;
alter table public.classroom_badge_rules drop constraint classroom_badge_rules_check;
alter table public.classroom_badge_rules add constraint classroom_badge_rules_criterion_check check(criterion in ('topic_completed','topic_mastered','course_xp'));
alter table public.classroom_badge_rules add constraint classroom_badge_rules_check check((criterion in ('topic_completed','topic_mastered') and topic_id is not null and xp_target is null) or (criterion='course_xp' and topic_id is null and xp_target>0));
create function private.passed_topic_checkpoints(p_student uuid,p_classroom uuid,p_topic uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.lessons where topics_id=p_topic and classroom_id=p_classroom and is_published and mastery_checkpoint and type='quiz')
 and exists(select 1 from public.lessons where topics_id=p_topic and classroom_id=p_classroom and is_published and mastery_checkpoint and type='laboratory')
 and not exists(select 1 from public.lessons l where topics_id=p_topic and classroom_id=p_classroom and is_published and mastery_checkpoint and (
  (l.type='quiz' and not exists(select 1 from public.quizzes q join public.quiz_attempts a on a.quiz_id=q.id where q.lesson_id=l.id and a.user_id=p_student and a.finished_at is not null and
  case when a.status='completed' then a.score>=coalesce(a.passing_count,q.passing_score) else a.score>=100.0*q.passing_score/nullif((select count(*) from public.questions where quiz_id=q.id),0) end))
  or (l.type='laboratory' and not exists(select 1 from public.lesson_submissions s where s.lesson_id=l.id and s.student_id=p_student and s.is_final and s.review_status='passed'))));
$$;
CREATE OR REPLACE FUNCTION private.evaluate_classroom_badges(p_student uuid, p_classroom uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare r record; award_id uuid; requirement_text text;
begin
  if auth.uid() is not null and auth.uid()<>p_student and not private.can_manage_classroom(p_classroom) then
    raise exception 'Not authorized to evaluate this student.';
  end if;
  if not exists(select 1 from public.classroom_members where classroom_id=p_classroom and student_id=p_student) then return; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_student::text||p_classroom::text,0));
  for r in select b.*,c.title as course_title,t.title as topic_title from public.classroom_badge_rules b
    join public.courses c on c.id=b.course_id left join public.topics t on t.id=b.topic_id
    where b.classroom_id=p_classroom and b.is_active
    and exists(select 1 from public.classroom_courses cc where cc.classroom_id=p_classroom and cc.course_id=b.course_id)
    and not exists(select 1 from public.classroom_badge_awards a where a.rule_id=b.id and a.student_id=p_student)
  loop
    if r.criterion='topic_completed' then
      if not exists(select 1 from public.lessons l where l.topics_id=r.topic_id and l.classroom_id=p_classroom and l.is_published) then continue; end if;
      if exists(select 1 from public.lessons l where l.topics_id=r.topic_id and l.classroom_id=p_classroom and l.is_published
        and not exists(select 1 from public.user_lesson_progress p where p.user_id=p_student and p.lesson_id=l.id and p.is_completed)) then continue; end if;
      requirement_text := 'Completed all lessons in '||r.topic_title;
    elsif r.criterion='topic_mastered' then
      if not private.passed_topic_checkpoints(p_student,p_classroom,r.topic_id) then continue; end if;
      requirement_text := 'Passed checkpoint quizzes and laboratories in '||r.topic_title;
    else
      if (select coalesce(sum(x.xp_earned),0) from public.user_xp_logs x where x.user_id=p_student and x.course_id=r.course_id
        and (x.classroom_id=p_classroom or (x.classroom_id is null and exists(select 1 from public.lessons l where l.id=x.source_id and l.classroom_id=p_classroom)))) < r.xp_target then continue; end if;
      requirement_text := 'Reached '||r.xp_target||' XP in '||r.course_title;
    end if;
    award_id := null;
    insert into public.classroom_badge_awards(rule_id,student_id,classroom_id,name,description,image_url,requirement)
      values(r.id,p_student,p_classroom,r.name,r.description,r.image_url,requirement_text)
      on conflict(rule_id,student_id) do nothing returning id into award_id;
    if award_id is not null then
      insert into public.classroom_posts(classroom_id,author_id,type,content)
        values(p_classroom,p_student,'badge_earned','earned the "'||r.name||'" badge! '||requirement_text||'.');
    end if;
  end loop;
end $function$;
create function private.review_awards() returns trigger language plpgsql security definer set search_path='' as $$
begin if new.review_status='passed' and new.review_status is distinct from old.review_status then perform private.evaluate_classroom_badges(new.student_id,new.classroom_id); end if; return new; end $$;
create trigger review_mastery_badges after update of review_status on public.lesson_submissions for each row execute function private.review_awards();
revoke all on function private.passed_topic_checkpoints(uuid,uuid,uuid),private.review_awards() from public,anon,authenticated;


-- Validate complete lesson content before a draft becomes visible.
create function private.assert_lesson_publishable(p_lesson uuid) returns void language plpgsql security definer set search_path='' as $$
declare l public.lessons; q public.quizzes; n integer; t public.tutorials;
begin
 select * into l from public.lessons where id=p_lesson;
 if not found then raise exception 'Lesson does not exist.'; end if;
 if length(trim(coalesce(l.title,'')))=0 then raise exception 'A lesson title is required.'; end if;
 if l.mastery_checkpoint and length(trim(coalesce(l.learning_objective,'')))=0 then raise exception 'Checkpoint % needs a learning objective.',l.title; end if;
 if l.type='lecture' then
  if not exists(select 1 from public.lectures where lesson_id=l.id and (length(trim(coalesce(content,'')))>0 or length(trim(coalesce(video_src,'')))>0 or length(trim(coalesce(file_url,'')))>0)) then raise exception 'Lecture % needs text, a PDF, or a video.',l.title; end if;
 elsif l.type='quiz' then
  select * into q from public.quizzes where lesson_id=l.id;
  select count(*) into n from public.questions where quiz_id=q.id;
  if n=0 or q.passing_score<1 or q.passing_score>n or q.time_limit<1 then raise exception 'Quiz % needs questions, a valid passing count, and a timer.',l.title; end if;
  if exists(select 1 from public.questions qu where qu.quiz_id=q.id and (length(trim(qu.text))=0 or (select count(*) from public.options o where o.question_id=qu.id)<2 or (select count(*) from public.options o where o.question_id=qu.id and is_correct)<>1 or exists(select 1 from public.options o where o.question_id=qu.id and length(trim(o.text))=0))) then raise exception 'Quiz % needs two options and exactly one correct answer for every question.',l.title; end if;
 elsif l.type='tutorial' then
  select * into t from public.tutorials where lesson_id=l.id;
  if t.type='block' then
   if not exists(select 1 from public.block_tutorial_steps where tutorial_id=t.id) or not exists(select 1 from public.block_tutorial_step_files where tutorial_id=t.id) or exists(select 1 from public.block_tutorial_steps s where s.tutorial_id=t.id and not exists(select 1 from public.block_tutorial_step_expected e where e.step_id=s.id)) then raise exception 'Tutorial % needs steps, files, and expected work for each step.',l.title; end if;
  elsif t.type='text' then
   if not exists(select 1 from public.text_tutorial_steps where tutorial_id=t.id) or not exists(select 1 from public.text_tutorial_step_files where tutorial_id=t.id) or exists(select 1 from public.text_tutorial_steps s where s.tutorial_id=t.id and not exists(select 1 from public.text_tutorial_step_expected e where e.step_id=s.id)) then raise exception 'Tutorial % needs steps, files, and expected work for each step.',l.title; end if;
  else raise exception 'Tutorial % needs a supported editor type.',l.title; end if;
 elsif l.type='laboratory' then
  if not exists(select 1 from public.laboratories where lesson_id=l.id and length(trim(coalesce(instruction,'')))>2 and rubric is not null and passing_score between 1 and 100) then raise exception 'Laboratory % needs instructions, a rubric, and a passing requirement.',l.title; end if;
 end if;
end $$;
create function private.check_lesson_publication() returns trigger language plpgsql security definer set search_path='' as $$
begin if new.is_published and not old.is_published then perform private.assert_lesson_publishable(new.id); end if; return new; end $$;
create trigger completion_publication_check before update of is_published on public.lessons for each row execute function private.check_lesson_publication();
create function private.publish_course_template(p_course uuid) returns void language plpgsql security definer set search_path='' as $$
declare l record;
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role='admin' and not must_change_password) then raise exception 'Administrator access required.'; end if;
 for l in select le.id from public.lessons le join public.topics t on t.id=le.topics_id where t.course_id=p_course and t.classroom_id is null and le.classroom_id is null and not le.is_published loop perform private.assert_lesson_publishable(l.id); end loop;
 update public.lessons le set is_published=true from public.topics t where t.id=le.topics_id and t.course_id=p_course and t.classroom_id is null and le.classroom_id is null and not le.is_published;
 update public.topics set is_published=true where course_id=p_course and classroom_id is null and not is_published;
end $$;
create function public.publish_course_template(p_course uuid) returns void language sql security invoker set search_path='' begin atomic select private.publish_course_template(p_course); end;
revoke all on function private.assert_lesson_publishable(uuid),private.check_lesson_publication() from public,anon,authenticated;
revoke all on function private.publish_course_template(uuid),public.publish_course_template(uuid) from public,anon;
grant execute on function private.publish_course_template(uuid),public.publish_course_template(uuid) to authenticated;


alter view public.course_with_counts set (security_invoker=true);
-- This directory intentionally exposes only display names and avatars, never email or role.
create function private.profile_directory_rows() returns table(id uuid,username text,avatar_url text) language sql stable security definer set search_path='' as $$
 select p.id,p.username,p.avatar_url from public.profiles p where auth.uid() is not null and private.account_ready();
$$;
revoke all on function private.profile_directory_rows() from public,anon;
grant execute on function private.profile_directory_rows() to authenticated;
create or replace view public.profile_directory with(security_invoker=true) as select id,username,avatar_url from private.profile_directory_rows();
revoke all on public.profile_directory from anon;
drop policy if exists profile_registration on public.profiles;
create policy profile_registration on public.profiles for insert to authenticated with check(id=(select auth.uid()) and role='student');
create function private.current_profile_role() returns text language sql stable security definer set search_path='' as $$ select role::text from public.profiles where id=auth.uid(); $$;
revoke all on function private.current_profile_role() from public,anon;
grant execute on function private.current_profile_role() to authenticated;
create or replace function public.get_user_role() returns text language sql stable security invoker set search_path='' as $$ select private.current_profile_role(); $$;
revoke all on function public.get_user_role(),public.sync_profiles_from_auth(),public.handle_streak_update() from public,anon;
grant execute on function public.get_user_role() to authenticated;
revoke all on function public.sync_profiles_from_auth(),public.handle_streak_update() from authenticated;
alter function public.handle_streak_update() set search_path='';
alter function public.sync_profiles_from_auth() set search_path='';
alter function public.try_auto_unlock_next_topic(uuid) set search_path='';
create function private.unlock_topic_owned(p_topic_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare classroom uuid;
begin
 select classroom_id into classroom from public.topics where id=p_topic_id;
 if classroom is null or not private.can_manage_classroom(classroom) then raise exception 'Classroom ownership required.';end if;
 update public.topics set is_unlocked=true,unlocked_at=now(),unlocked_by=auth.uid() where id=p_topic_id;
end $$;
create or replace function public.teacher_unlock_topic(p_topic_id uuid) returns void language sql security invoker set search_path='' begin atomic select private.unlock_topic_owned(p_topic_id);end;
revoke all on function private.unlock_topic_owned(uuid),public.teacher_unlock_topic(uuid) from public,anon;
grant execute on function private.unlock_topic_owned(uuid),public.teacher_unlock_topic(uuid) to authenticated;
