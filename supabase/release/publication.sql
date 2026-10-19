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
