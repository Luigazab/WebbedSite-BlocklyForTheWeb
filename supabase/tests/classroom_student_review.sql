-- Fixtures and generated activity/notifications are rolled back.
begin;
do $$
declare teacher uuid; student uuid; outsider uuid; course uuid; classroom uuid; topic uuid;
 lab uuid; tutorial_lesson uuid; quiz_lesson uuid; tutorial uuid; step1 uuid; step2 uuid; quiz uuid;
 submitted public.lesson_submissions; review jsonb; amount integer;
begin
 select id into teacher from public.profiles where role='teacher' limit 1;
 select id into student from public.profiles where role='student' limit 1;
 select id into outsider from public.profiles where id not in (teacher,student) limit 1;
 select id into course from public.courses limit 1;
 if teacher is null or student is null or outsider is null or course is null then raise exception 'Test requires teacher, student, third profile and course.'; end if;
 insert into public.classrooms(teacher_id,name,is_active) values(teacher,'Student review test',true) returning id into classroom;
 insert into public.classroom_courses(classroom_id,course_id) values(classroom,course);
 insert into public.classroom_members(classroom_id,student_id) values(classroom,student);
 insert into public.topics(course_id,classroom_id,title,description,"order",is_published) values(course,classroom,'Student review test topic','',1,true) returning id into topic;
 insert into public.lessons(topics_id,classroom_id,author,title,type,is_published) values(topic,classroom,teacher,'Review lab','laboratory',true) returning id into lab;
 insert into public.lessons(topics_id,classroom_id,author,title,type,is_published) values(topic,classroom,teacher,'Review tutorial','tutorial',true) returning id into tutorial_lesson;
 insert into public.lessons(topics_id,classroom_id,author,title,type,is_published) values(topic,classroom,teacher,'Review quiz','quiz',true) returning id into quiz_lesson;
 insert into public.tutorials(lesson_id,type) values(tutorial_lesson,'block') returning id into tutorial;
 insert into public.block_tutorial_steps(tutorial_id,instruction,"order") values(tutorial,'First',1) returning id into step1;
 insert into public.block_tutorial_steps(tutorial_id,instruction,"order") values(tutorial,'Second',2) returning id into step2;
 insert into public.quizzes(lesson_id) values(quiz_lesson) returning id into quiz;
 perform set_config('request.jwt.claim.sub',student::text,true);
 perform set_config('request.jwt.claim.role','authenticated',true);
 set local role authenticated;
 select * into submitted from public.save_lesson_submission(lab,'[{"filename":"index.html","code":"<h1>Student work</h1>","blocks_json":{}}]'::jsonb,null,true);
 if submitted.student_id<>student or submitted.score is not null then raise exception 'Incorrect submission owner or premature grade.'; end if;
 perform public.save_lesson_submission(lab,'[{"filename":"index.html","code":"<h1>Updated work</h1>"}]'::jsonb,null,true);
 select count(*) into amount from public.lesson_submissions where lesson_id=lab;
 if amount<>1 then raise exception 'Repeated submit duplicated lab work.'; end if;
 if not exists(select 1 from public.user_lesson_progress where user_id=student and lesson_id=lab and is_completed) then raise exception 'Submitting lab did not mark completion.'; end if;
 begin
   perform public.save_lesson_submission(tutorial_lesson,'[{"filename":"index.html","code":"skip"}]'::jsonb,step2,true); raise exception 'Skipped tutorial steps accepted';
 exception when raise_exception then if sqlerrm='Skipped tutorial steps accepted' then raise; end if; end;
 perform public.save_lesson_submission(tutorial_lesson,'[{"filename":"index.html","code":"first"}]'::jsonb,step1,false);
 if exists(select 1 from public.user_lesson_progress where user_id=student and lesson_id=tutorial_lesson and is_completed) then raise exception 'Partial tutorial marked complete.'; end if;
 perform public.save_lesson_submission(tutorial_lesson,'[{"filename":"index.html","code":"second"}]'::jsonb,step2,true);
 if not exists(select 1 from public.block_step_completed where user_id=student and step_id=step2) then raise exception 'Tutorial step not saved.'; end if;
 insert into public.quiz_attempts(user_id,quiz_id,score,status) values(student,quiz,87,'passed'),(student,quiz,0,'failed');
 begin
   perform public.grade_laboratory_submission(submitted.id,100,'Forged'); raise exception 'Student graded lab';
 exception when raise_exception then if sqlerrm='Student graded lab' then raise; end if; end;
 begin
   perform public.get_classroom_student_review(classroom,student); raise exception 'Student accessed teacher review';
 exception when raise_exception then if sqlerrm='Student accessed teacher review' then raise; end if; end;
 begin
   update public.lesson_submissions set score=100 where id=submitted.id; raise exception 'Student directly changed grade';
 exception when insufficient_privilege then null; end;
 begin
   perform public.save_lesson_submission(tutorial_lesson,'[{"filename":"index.html","code":"wrong step"}]'::jsonb,gen_random_uuid(),true); raise exception 'Wrong tutorial step accepted';
 exception when raise_exception then if sqlerrm='Wrong tutorial step accepted' then raise; end if; end;
 reset role;
 if (select count(*) from public.user_xp_logs where source_id=lab and user_id=student)<>1 then raise exception 'Repeated submission awarded duplicate XP.'; end if;
 perform set_config('request.jwt.claim.sub',outsider::text,true);
 set local role authenticated;
 select count(*) into amount from public.lesson_submissions where classroom_id=classroom;
 if amount<>0 then raise exception 'Outsider read student work.'; end if;
 begin
   perform public.get_classroom_student_review(classroom,student); raise exception 'Outsider accessed review';
 exception when raise_exception then if sqlerrm='Outsider accessed review' then raise; end if; end;
 reset role;
 perform set_config('request.jwt.claim.sub',teacher::text,true);
 set local role authenticated;
 select public.get_classroom_student_review(classroom,student) into review;
 if jsonb_array_length(review->'lessons')<>3 or jsonb_array_length(review->'submissions')<>3 then raise exception 'Teacher review missing lessons or submissions.'; end if;
 if not exists(select 1 from jsonb_array_elements(review->'lessons') lesson where lesson->>'id'=quiz_lesson::text and jsonb_array_length(lesson->'attempts')=2) then raise exception 'Quiz attempt history incomplete.'; end if;
 perform public.grade_laboratory_submission(submitted.id,0,'Needs revision');
 perform public.grade_laboratory_submission(submitted.id,85,'Updated grade');
 if not exists(select 1 from public.lesson_submissions where id=submitted.id and score=85 and feedback='Updated grade' and graded_by=teacher and graded_at is not null) then raise exception 'Teacher grade did not persist.'; end if;
 begin
   perform public.grade_laboratory_submission(submitted.id,101,'invalid'); raise exception 'Out-of-range grade accepted';
 exception when raise_exception then if sqlerrm='Out-of-range grade accepted' then raise; end if; end;
 reset role;
 perform set_config('request.jwt.claim.sub',student::text,true);
 set local role authenticated;
 begin
   perform public.save_lesson_submission(lab,'[{"filename":"index.html","code":"overwrite"}]'::jsonb,null,true); raise exception 'Graded work overwritten';
 exception when raise_exception then if sqlerrm='Graded work overwritten' then raise; end if; end;
 reset role;
end $$;
rollback;
