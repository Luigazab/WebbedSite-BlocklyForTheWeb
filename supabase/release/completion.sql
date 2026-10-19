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
