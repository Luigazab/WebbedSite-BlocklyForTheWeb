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
