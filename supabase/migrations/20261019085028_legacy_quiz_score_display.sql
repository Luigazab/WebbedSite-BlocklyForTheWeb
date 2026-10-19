create function private.quiz_attempt_percent(p_attempt public.quiz_attempts) returns numeric language plpgsql stable security definer set search_path='' as $$
declare denominator integer;
begin
 if p_attempt.score is null or p_attempt.finished_at is null then return null;end if;
 if p_attempt.score_total>0 then return 100.0*p_attempt.score/p_attempt.score_total;end if;
 select count(*) into denominator from public.questions where quiz_id=p_attempt.quiz_id;
 -- Old recordQuizAttempt stored raw counts with passed/failed status.
 -- Saved answer evidence distinguishes those records from historical percentage grades.
 if p_attempt.status='completed' or (exists(select 1 from public.quiz_answers where attempt_id=p_attempt.id)
 and p_attempt.score=(select count(*) from public.quiz_answers where attempt_id=p_attempt.id and is_correct)) then
 return 100.0*p_attempt.score/nullif(denominator,0);
 end if;
 return p_attempt.score;
end $$;
revoke all on function private.quiz_attempt_percent(public.quiz_attempts) from public,anon,authenticated;
do $patch$ declare name text;definition text;updated text;begin
 foreach name in array array['classroom_gradebook(uuid)','release_dashboard()','get_course_mastery(uuid,uuid)'] loop
 definition:=pg_get_functiondef(('private.'||name)::regprocedure);
 updated:=replace(definition,$formula$case when a.status='completed' then 100.0*a.score/nullif(coalesce(a.score_total,(select count(*) from public.questions where quiz_id=q.id)),0) else a.score end$formula$,'private.quiz_attempt_percent(a)');
 if updated=definition then raise exception 'Expected quiz formula missing in %.',name;end if;
 execute updated;
 end loop;
 definition:=pg_get_functiondef('private.passed_topic_checkpoints(uuid,uuid,uuid)'::regprocedure);
 updated:=replace(definition,$old$case when a.status='completed' then a.score>=coalesce(a.passing_count,q.passing_score) else a.score>=100.0*q.passing_score/nullif((select count(*) from public.questions where quiz_id=q.id),0) end$old$,
 $new$private.quiz_attempt_percent(a)>=coalesce(100.0*a.passing_count/nullif(a.score_total,0),100.0*q.passing_score/nullif((select count(*) from public.questions where quiz_id=q.id),0))$new$);
 if updated=definition then raise exception 'Expected badge quiz formula missing.';end if;
 execute updated;
end $patch$;
notify pgrst,'reload schema';
-- Supply the same normalization to student and teacher history views.
do $review$ declare definition text;begin
 definition:=pg_get_functiondef('private.get_classroom_student_review(uuid,uuid)'::regprocedure);
 definition:=replace(definition,$old$jsonb_build_object('answers',case when a.finished_at$old$,$new$jsonb_build_object('percentage',private.quiz_attempt_percent(a),'answers',case when a.finished_at$new$);
 execute definition;
end $review$;
create function private.assessed_quiz_history(p_quiz uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 perform private.require_account_ready();
 return coalesce((select jsonb_agg(to_jsonb(a)||jsonb_build_object('percentage',private.quiz_attempt_percent(a),'answers',coalesce((select jsonb_agg(to_jsonb(ans)) from public.quiz_answers ans where ans.attempt_id=a.id),'[]'::jsonb)) order by a.started_at,a.id) from public.quiz_attempts a where a.quiz_id=p_quiz and a.user_id=auth.uid() and a.finished_at is not null),'[]'::jsonb);
end $$;
create function public.assessed_quiz_history(p_quiz uuid) returns jsonb language sql security invoker set search_path='' begin atomic select private.assessed_quiz_history(p_quiz);end;
revoke all on function private.assessed_quiz_history(uuid),public.assessed_quiz_history(uuid) from public,anon;
grant execute on function private.assessed_quiz_history(uuid),public.assessed_quiz_history(uuid) to authenticated;
