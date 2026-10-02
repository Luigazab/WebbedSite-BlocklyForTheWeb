create table public.lesson_submissions (
 id uuid primary key default gen_random_uuid(),
 classroom_id uuid not null references public.classrooms(id) on delete cascade,
 lesson_id uuid not null references public.lessons(id) on delete cascade,
 student_id uuid not null references public.profiles(id) on delete cascade,
 step_key text not null default '',
 files jsonb not null check(jsonb_typeof(files)='array' and jsonb_array_length(files)>0 and octet_length(files::text)<=2097152),
 is_final boolean not null default false,
 submitted_at timestamptz not null default now(),
 score integer check(score between 0 and 100),
 feedback text not null default '' check(length(feedback)<=5000),
 graded_by uuid references public.profiles(id),
 graded_at timestamptz,
 unique(student_id,lesson_id,step_key)
);
create index lesson_submissions_classroom_idx on public.lesson_submissions(classroom_id,student_id);
create index lesson_submissions_lesson_idx on public.lesson_submissions(lesson_id);
create index lesson_submissions_grader_idx on public.lesson_submissions(graded_by);
alter table public.lesson_submissions enable row level security;
revoke all on public.lesson_submissions from public,anon,authenticated;
grant select on public.lesson_submissions to authenticated;
create policy submissions_read on public.lesson_submissions for select to authenticated using (
 student_id=(select auth.uid()) or exists(select 1 from public.classrooms c where c.id=classroom_id and c.teacher_id=(select auth.uid()))
);

create function private.save_lesson_submission(p_lesson uuid,p_files jsonb,p_step uuid,p_finish boolean) returns public.lesson_submissions
language plpgsql security definer set search_path='' as $$
declare lesson record; submission public.lesson_submissions;
begin
 if auth.uid() is null then raise exception 'Sign in to submit your work.'; end if;
 select * into lesson from public.lessons where id=p_lesson;
 if not found or lesson.classroom_id is null or not lesson.is_published or lesson.type not in ('tutorial','laboratory') then raise exception 'Published classroom tutorial or laboratory required.'; end if;
 if not exists(select 1 from public.classroom_members where classroom_id=lesson.classroom_id and student_id=auth.uid()) then raise exception 'You must belong to this classroom.'; end if;
 if jsonb_typeof(p_files)<>'array' or jsonb_array_length(p_files)=0 or octet_length(p_files::text)>2097152 then raise exception 'Submit at least one file (maximum 2 MB).'; end if;
 if exists(select 1 from jsonb_array_elements(p_files) f where jsonb_typeof(f)<>'object' or coalesce(f->>'filename','')='' or not (f ? 'code' or f ? 'blocks_json')) then raise exception 'Each file must include a filename and code or workspace.'; end if;
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
end $$;
revoke all on function private.save_lesson_submission(uuid,jsonb,uuid,boolean) from public,anon;
grant execute on function private.save_lesson_submission(uuid,jsonb,uuid,boolean) to authenticated;
create function public.save_lesson_submission(p_lesson uuid,p_files jsonb,p_step uuid default null,p_finish boolean default true) returns public.lesson_submissions
language sql security invoker set search_path='' begin atomic
 select private.save_lesson_submission(p_lesson,p_files,p_step,p_finish);
end;
revoke all on function public.save_lesson_submission(uuid,jsonb,uuid,boolean) from public,anon;
grant execute on function public.save_lesson_submission(uuid,jsonb,uuid,boolean) to authenticated;

create function private.grade_laboratory_submission(p_submission uuid,p_score integer,p_feedback text) returns public.lesson_submissions
language plpgsql security definer set search_path='' as $$
declare submission public.lesson_submissions;
begin
 if auth.uid() is null then raise exception 'Sign in to grade work.'; end if;
 select s.* into submission from public.lesson_submissions s join public.classrooms c on c.id=s.classroom_id
 join public.lessons l on l.id=s.lesson_id where s.id=p_submission and c.teacher_id=auth.uid() and l.type='laboratory' for update of s;
 if not found then raise exception 'Only this classroom teacher can grade its laboratory submissions.'; end if;
 if p_score is null or p_score not between 0 and 100 then raise exception 'Score must be a whole number between 0 and 100.'; end if;
 if length(coalesce(p_feedback,''))>5000 then raise exception 'Feedback is limited to 5000 characters.'; end if;
 update public.lesson_submissions set score=p_score,feedback=coalesce(p_feedback,''),graded_by=auth.uid(),graded_at=now()
 where id=p_submission returning * into submission;
 return submission;
end $$;
revoke all on function private.grade_laboratory_submission(uuid,integer,text) from public,anon;
grant execute on function private.grade_laboratory_submission(uuid,integer,text) to authenticated;
create function public.grade_laboratory_submission(p_submission uuid,p_score integer,p_feedback text default '') returns public.lesson_submissions
language sql security invoker set search_path='' begin atomic
 select private.grade_laboratory_submission(p_submission,p_score,p_feedback);
end;
revoke all on function public.grade_laboratory_submission(uuid,integer,text) from public,anon;
grant execute on function public.grade_laboratory_submission(uuid,integer,text) to authenticated;

create function private.get_classroom_student_review(p_classroom uuid,p_student uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if auth.uid() is null or not exists(select 1 from public.classrooms where id=p_classroom and teacher_id=auth.uid()) then raise exception 'Only the classroom teacher can review students.'; end if;
 if not exists(select 1 from public.classroom_members where classroom_id=p_classroom and student_id=p_student) then raise exception 'Student is not enrolled in this classroom.'; end if;
 select jsonb_build_object('lessons',coalesce(jsonb_agg(to_jsonb(l)||jsonb_build_object(
   'topic_title',t.title,'progress',(select to_jsonb(p) from public.user_lesson_progress p where p.user_id=p_student and p.lesson_id=l.id),
   'quiz',(select to_jsonb(q)||jsonb_build_object('question_count',(select count(*) from public.questions where quiz_id=q.id)) from public.quizzes q where q.lesson_id=l.id limit 1),
   'attempts',coalesce((select jsonb_agg(to_jsonb(a) order by a.started_at,a.id) from public.quiz_attempts a join public.quizzes q on q.id=a.quiz_id where q.lesson_id=l.id and a.user_id=p_student),'[]'::jsonb)
 ) order by t."order",l."order",l.title),'[]'::jsonb),
 'submissions',coalesce((select jsonb_agg(to_jsonb(s)||jsonb_build_object('step_order',coalesce(
   (select "order" from public.block_tutorial_steps where id::text=s.step_key),
   (select "order" from public.text_tutorial_steps where id::text=s.step_key))) order by s.submitted_at desc)
   from public.lesson_submissions s where s.classroom_id=p_classroom and s.student_id=p_student),'[]'::jsonb))
 into result from public.lessons l join public.topics t on t.id=l.topics_id where l.classroom_id=p_classroom;
 return result;
end $$;
revoke all on function private.get_classroom_student_review(uuid,uuid) from public,anon;
grant execute on function private.get_classroom_student_review(uuid,uuid) to authenticated;
create function public.get_classroom_student_review(p_classroom uuid,p_student uuid) returns jsonb
language sql security invoker set search_path='' begin atomic
 select private.get_classroom_student_review(p_classroom,p_student);
end;
revoke all on function public.get_classroom_student_review(uuid,uuid) from public,anon;
grant execute on function public.get_classroom_student_review(uuid,uuid) to authenticated;
