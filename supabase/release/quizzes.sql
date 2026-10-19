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
