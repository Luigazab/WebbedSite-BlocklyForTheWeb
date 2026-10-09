-- Classroom progression is based on required core lessons, not XP or reviews.
alter table public.lessons add column topic_track text not null default 'core'
  check (topic_track in ('core','beginner','intermediate','advanced'));
alter table public.lessons add column required_for_topic boolean;
alter table public.lessons add column expected_minutes integer not null default 20
  check (expected_minutes between 1 and 240);
update public.lessons set required_for_topic = (type in ('tutorial','laboratory'));
alter table public.lessons alter column required_for_topic set not null;
alter table public.lessons add constraint practice_is_optional
  check (topic_track = 'core' or required_for_topic = false);

create function private.default_classroom_lesson_rule() returns trigger
language plpgsql set search_path = '' as $$
declare template record;
begin
  if tg_op='INSERT' and new.classroom_id is not null then
    select source.topic_track,source.required_for_topic into template
    from public.lessons source join public.topics source_topic on source_topic.id=source.topics_id
    join public.topics target_topic on target_topic.id=new.topics_id
    where source.classroom_id is null and source.slug=new.slug
      and source_topic.course_id=target_topic.course_id limit 1;
    if found then
      new.topic_track := template.topic_track;
      new.required_for_topic := template.required_for_topic;
    end if;
  end if;
  if new.required_for_topic is null then
    new.required_for_topic := new.type in ('tutorial','laboratory');
  end if;
  return new;
end $$;
create trigger default_classroom_lesson_rule before insert or update on public.lessons
for each row execute function private.default_classroom_lesson_rule();
revoke all on function private.default_classroom_lesson_rule() from public,anon,authenticated;

-- The existing course-cloning function copies expected code but omits the
-- saved Blockly workspace. Restore it when cloned tutorial rows are inserted.
create function private.copy_cloned_expected_workspace() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.expected_blocks_json is not null then return new; end if;
  select source_expected.expected_blocks_json into new.expected_blocks_json
  from public.block_tutorial_steps target_step
  join public.tutorials target_tutorial on target_tutorial.id=target_step.tutorial_id
  join public.lessons target_lesson on target_lesson.id=target_tutorial.lesson_id
  join public.topics target_topic on target_topic.id=target_lesson.topics_id
  join public.block_tutorial_step_files target_file on target_file.id=new.file_id
  join public.lessons source_lesson on source_lesson.slug=target_lesson.slug and source_lesson.classroom_id is null
  join public.topics source_topic on source_topic.id=source_lesson.topics_id and source_topic.course_id=target_topic.course_id
  join public.tutorials source_tutorial on source_tutorial.lesson_id=source_lesson.id
  join public.block_tutorial_steps source_step on source_step.tutorial_id=source_tutorial.id and source_step."order"=target_step."order"
  join public.block_tutorial_step_files source_file on source_file.tutorial_id=source_tutorial.id and source_file.filename=target_file.filename
  join public.block_tutorial_step_expected source_expected on source_expected.step_id=source_step.id and source_expected.file_id=source_file.id
  where target_step.id=new.step_id and target_lesson.classroom_id is not null limit 1;
  return new;
end $$;
create trigger copy_cloned_expected_workspace before insert or update of test_cases on public.block_tutorial_step_expected
for each row execute function private.copy_cloned_expected_workspace();
revoke all on function private.copy_cloned_expected_workspace() from public,anon,authenticated;
update public.block_tutorial_step_expected set test_cases=test_cases where expected_blocks_json is null;

create table public.classroom_topic_exemptions (
  topic_id uuid not null references public.topics(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (length(reason) between 1 and 300),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  primary key (topic_id, student_id)
);
create index classroom_topic_exemptions_student_idx on public.classroom_topic_exemptions(student_id);
alter table public.classroom_topic_exemptions enable row level security;
revoke all on public.classroom_topic_exemptions from public, anon, authenticated;

create table public.classroom_flow_log (
  id bigint generated always as identity primary key,
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  topic_id uuid references public.topics(id) on delete set null,
  student_id uuid references public.profiles(id) on delete set null,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null check (action in ('topic_unlocked','student_exempted','exemption_removed','lesson_rule_changed')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index classroom_flow_log_classroom_idx on public.classroom_flow_log(classroom_id,created_at desc);
alter table public.classroom_flow_log enable row level security;
revoke all on public.classroom_flow_log from public, anon, authenticated;

alter table public.lesson_submissions add column objective_score integer check (objective_score between 0 and 100);
alter table public.lesson_submissions add column active_seconds integer check (active_seconds between 0 and 86400);
alter table public.lesson_submissions add column device_factor numeric(5,2) check (device_factor between 0.5 and 2);
create view public.lab_results with (security_invoker = true) as
  select s.id as submission_id,s.classroom_id,s.lesson_id,s.student_id,
    s.objective_score,s.score as teacher_score,s.feedback as teacher_feedback,
    s.submitted_at,s.graded_at
  from public.lesson_submissions s join public.lessons l on l.id=s.lesson_id
  where l.type='laboratory';
revoke all on public.lab_results from public,anon,authenticated;
grant select on public.lab_results to authenticated;

create function private.topic_is_complete(p_topic uuid) returns boolean
language sql security definer set search_path = '' as $$
  select exists (
    select 1 from public.lessons l where l.topics_id = p_topic and l.is_published
      and l.topic_track = 'core' and l.required_for_topic
  ) and not exists (
    select 1 from public.topics t
    join public.classroom_members m on m.classroom_id = t.classroom_id
    where t.id = p_topic and t.is_unlocked
      and m.enrolled_at <= coalesce(t.unlocked_at, now())
      and not exists (select 1 from public.classroom_topic_exemptions e
        where e.topic_id = t.id and e.student_id = m.student_id)
      and exists (
        select 1 from public.lessons l
        where l.topics_id = t.id and l.is_published and l.topic_track = 'core'
          and l.required_for_topic and not exists (
            select 1 from public.user_lesson_progress p
            where p.lesson_id = l.id and p.user_id = m.student_id and p.is_completed
              and (l.type not in ('tutorial','laboratory') or exists (
                select 1 from public.lesson_submissions s where s.lesson_id=l.id
                  and s.student_id=m.student_id and s.is_final))
          )
      )
  );
$$;
revoke all on function private.topic_is_complete(uuid) from public, anon, authenticated;

create function private.recompute_classroom_topic_unlocks(p_classroom uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare current_topic record; previous_topic uuid; previous_complete boolean := false;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_classroom::text, 0));
  for current_topic in
    select t.id, t.is_published, t.is_unlocked from public.topics t
    left join public.classroom_courses cc on cc.classroom_id=t.classroom_id and cc.course_id=t.course_id
    where t.classroom_id=p_classroom
    order by coalesce(cc.sequence_order, 2147483647), t."order", t.id
  loop
    if current_topic.is_published and not current_topic.is_unlocked
      and (previous_topic is null or previous_complete) then
      update public.topics set is_unlocked=true, unlocked_at=now(), unlocked_by=null
      where id=current_topic.id;
    end if;
    previous_topic := current_topic.id;
    previous_complete := private.topic_is_complete(current_topic.id);
  end loop;
end $$;
revoke all on function private.recompute_classroom_topic_unlocks(uuid) from public, anon, authenticated;

create function private.refresh_classroom_topic_flow() returns trigger
language plpgsql security definer set search_path = '' as $$
declare classroom uuid; affected_lesson uuid; affected_topic uuid;
begin
  if tg_table_name='user_lesson_progress' then
    affected_lesson := case when tg_op='DELETE' then old.lesson_id else new.lesson_id end;
    select l.classroom_id into classroom from public.lessons l where l.id=affected_lesson;
  elsif tg_table_name='lessons' then
    classroom := case when tg_op='DELETE' then old.classroom_id else new.classroom_id end;
  elsif tg_table_name='classroom_members' then
    classroom := case when tg_op='DELETE' then old.classroom_id else new.classroom_id end;
  elsif tg_table_name='classroom_topic_exemptions' then
    affected_topic := case when tg_op='DELETE' then old.topic_id else new.topic_id end;
    select t.classroom_id into classroom from public.topics t where t.id=affected_topic;
  else
    classroom := case when tg_op='DELETE' then old.classroom_id else new.classroom_id end;
  end if;
  if classroom is not null then perform private.recompute_classroom_topic_unlocks(classroom); end if;
  if tg_op='DELETE' then return old; end if;
  return new;
end $$;
revoke all on function private.refresh_classroom_topic_flow() from public, anon, authenticated;
create trigger refresh_flow_after_progress after insert or update of is_completed on public.user_lesson_progress
  for each row execute function private.refresh_classroom_topic_flow();
create trigger refresh_flow_after_lesson after insert or update of is_published,required_for_topic,topic_track or delete on public.lessons
  for each row execute function private.refresh_classroom_topic_flow();
create trigger refresh_flow_after_membership after insert or delete on public.classroom_members
  for each row execute function private.refresh_classroom_topic_flow();
create trigger refresh_flow_after_exemption after insert or delete on public.classroom_topic_exemptions
  for each row execute function private.refresh_classroom_topic_flow();
create trigger refresh_flow_after_topic_publish after insert or update of is_published on public.topics
  for each row execute function private.refresh_classroom_topic_flow();

create function private.log_classroom_topic_unlock() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.classroom_id is not null and old.is_unlocked is distinct from new.is_unlocked and new.is_unlocked then
    insert into public.classroom_flow_log(classroom_id,topic_id,actor_id,action,details)
    values(new.classroom_id,new.id,new.unlocked_by,'topic_unlocked',
      jsonb_build_object('source',case when new.unlocked_by is null then 'automatic' else 'teacher' end));
  end if;
  return new;
end $$;
create trigger log_classroom_topic_unlock after update of is_unlocked on public.topics
  for each row execute function private.log_classroom_topic_unlock();
revoke all on function private.log_classroom_topic_unlock() from public,anon,authenticated;

create function private.set_classroom_topic_exemption(p_topic uuid,p_student uuid,p_exempt boolean,p_reason text)
returns void language plpgsql security definer set search_path = '' as $$
declare classroom uuid;
begin
  select t.classroom_id into classroom from public.topics t join public.classrooms c on c.id=t.classroom_id
  where t.id=p_topic and c.teacher_id=auth.uid();
  if classroom is null then raise exception 'Only the classroom teacher can change exemptions.'; end if;
  if not exists(select 1 from public.classroom_members where classroom_id=classroom and student_id=p_student)
    then raise exception 'Student is not enrolled in this classroom.'; end if;
  if p_exempt then
    if length(trim(coalesce(p_reason,'')))=0 then raise exception 'Provide a reason for the exemption.'; end if;
    insert into public.classroom_topic_exemptions(topic_id,student_id,reason,created_by)
    values(p_topic,p_student,trim(p_reason),auth.uid())
    on conflict(topic_id,student_id) do update set reason=excluded.reason,created_by=excluded.created_by,created_at=now();
  else
    delete from public.classroom_topic_exemptions where topic_id=p_topic and student_id=p_student;
  end if;
  insert into public.classroom_flow_log(classroom_id,topic_id,student_id,actor_id,action,details)
  values(classroom,p_topic,p_student,auth.uid(),case when p_exempt then 'student_exempted' else 'exemption_removed' end,
    jsonb_build_object('reason',coalesce(p_reason,'')));
end $$;
revoke all on function private.set_classroom_topic_exemption(uuid,uuid,boolean,text) from public,anon;
grant execute on function private.set_classroom_topic_exemption(uuid,uuid,boolean,text) to authenticated;
create function public.set_classroom_topic_exemption(p_topic uuid,p_student uuid,p_exempt boolean,p_reason text default '')
returns void language sql security invoker set search_path = '' begin atomic
  select private.set_classroom_topic_exemption(p_topic,p_student,p_exempt,p_reason);
end;
revoke all on function public.set_classroom_topic_exemption(uuid,uuid,boolean,text) from public,anon;
grant execute on function public.set_classroom_topic_exemption(uuid,uuid,boolean,text) to authenticated;

create function private.set_classroom_lesson_rule(p_lesson uuid,p_track text,p_required boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare target record;
begin
  select l.id,l.classroom_id,l.topics_id into target from public.lessons l
  join public.classrooms c on c.id=l.classroom_id
  where l.id=p_lesson and c.teacher_id=auth.uid();
  if not found then raise exception 'Only the classroom teacher can change this activity.'; end if;
  if p_track not in ('core','beginner','intermediate','advanced') or (p_track<>'core' and p_required)
    then raise exception 'Practice activities must be optional.'; end if;
  update public.lessons set topic_track=p_track,required_for_topic=p_required where id=p_lesson;
  insert into public.classroom_flow_log(classroom_id,topic_id,actor_id,action,details)
  values(target.classroom_id,target.topics_id,auth.uid(),'lesson_rule_changed',
    jsonb_build_object('lesson_id',p_lesson,'track',p_track,'required',p_required));
end $$;
revoke all on function private.set_classroom_lesson_rule(uuid,text,boolean) from public,anon;
grant execute on function private.set_classroom_lesson_rule(uuid,text,boolean) to authenticated;
create function public.set_classroom_lesson_rule(p_lesson uuid,p_track text,p_required boolean)
returns void language sql security invoker set search_path = '' begin atomic
  select private.set_classroom_lesson_rule(p_lesson,p_track,p_required);
end;
revoke all on function public.set_classroom_lesson_rule(uuid,text,boolean) from public,anon;
grant execute on function public.set_classroom_lesson_rule(uuid,text,boolean) to authenticated;

create function private.set_classroom_lesson_target_minutes(p_lesson uuid,p_minutes integer)
returns void language plpgsql security definer set search_path = '' as $$
declare target record;
begin
  select l.classroom_id,l.topics_id into target from public.lessons l
  join public.classrooms c on c.id=l.classroom_id
  where l.id=p_lesson and c.teacher_id=auth.uid();
  if not found then raise exception 'Only the classroom teacher can set the time target.'; end if;
  if p_minutes not between 1 and 240 then raise exception 'Choose 1 to 240 minutes.'; end if;
  update public.lessons set expected_minutes=p_minutes where id=p_lesson;
  insert into public.classroom_flow_log(classroom_id,topic_id,actor_id,action,details)
  values(target.classroom_id,target.topics_id,auth.uid(),'lesson_rule_changed',
    jsonb_build_object('lesson_id',p_lesson,'expected_minutes',p_minutes));
end $$;
revoke all on function private.set_classroom_lesson_target_minutes(uuid,integer) from public,anon;
grant execute on function private.set_classroom_lesson_target_minutes(uuid,integer) to authenticated;
create function public.set_classroom_lesson_target_minutes(p_lesson uuid,p_minutes integer)
returns void language sql security invoker set search_path = '' begin atomic
  select private.set_classroom_lesson_target_minutes(p_lesson,p_minutes);
end;
revoke all on function public.set_classroom_lesson_target_minutes(uuid,integer) from public,anon;
grant execute on function public.set_classroom_lesson_target_minutes(uuid,integer) to authenticated;

create function private.get_classroom_topic_flow(p_classroom uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
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
    from public.topics t left join public.classroom_courses cc
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
          'accuracy',round(accuracy,1),'speed_bonus',round(coalesce(speed_bonus,0),1),
          'classification',case when accuracy is null then null
            when least(100,accuracy+coalesce(speed_bonus,0))>=85 then 'advanced'
            when least(100,accuracy+coalesce(speed_bonus,0))>=65 then 'intermediate' else 'beginner' end,
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
end $$;
revoke all on function private.get_classroom_topic_flow(uuid) from public,anon;
grant execute on function private.get_classroom_topic_flow(uuid) to authenticated;
create function public.get_classroom_topic_flow(p_classroom uuid) returns jsonb
language sql security invoker set search_path = '' begin atomic
  select private.get_classroom_topic_flow(p_classroom);
end;
revoke all on function public.get_classroom_topic_flow(uuid) from public,anon;
grant execute on function public.get_classroom_topic_flow(uuid) to authenticated;

-- Recheck submitted Blockly structure on the server before it can become
-- completion evidence. Browser feedback remains immediate and more detailed.
create function private.block_structure_matches(actual jsonb, expected jsonb) returns boolean
language plpgsql immutable set search_path = '' as $$
declare input_name text; required_input jsonb; actual_child jsonb; required_child jsonb; candidate jsonb;
begin
  if actual is null or actual->>'type' is distinct from expected->>'type' then return false; end if;
  for input_name,required_input in select key,value from jsonb_each(coalesce(expected->'inputs','{}'::jsonb)) loop
    required_child := coalesce(required_input->'block',required_input->'shadow');
    if required_child is not null then
      actual_child := coalesce(actual->'inputs'->input_name->'block',actual->'inputs'->input_name->'shadow');
      if not private.block_structure_matches(actual_child,required_child) then return false; end if;
    end if;
  end loop;
  required_child := coalesce(expected->'next'->'block',expected->'next'->'shadow');
  if required_child is not null then
    candidate := coalesce(actual->'next'->'block',actual->'next'->'shadow');
    while candidate is not null loop
      if private.block_structure_matches(candidate,required_child) then return true; end if;
      candidate := coalesce(candidate->'next'->'block',candidate->'next'->'shadow');
    end loop;
    return false;
  end if;
  return true;
end $$;
revoke all on function private.block_structure_matches(jsonb,jsonb) from public,anon,authenticated;

create function private.workspace_structure_matches(actual jsonb, expected jsonb) returns boolean
language plpgsql immutable set search_path = '' as $$
declare required_block jsonb; candidate record; used_positions bigint[] := '{}'; matched boolean;
begin
  if jsonb_typeof(expected->'blocks'->'blocks') <> 'array' or jsonb_array_length(expected->'blocks'->'blocks')=0
    or jsonb_typeof(actual->'blocks'->'blocks') <> 'array' then return false; end if;
  for required_block in select value from jsonb_array_elements(expected->'blocks'->'blocks') loop
    matched := false;
    for candidate in select value,ordinality from jsonb_array_elements(actual->'blocks'->'blocks') with ordinality loop
      if candidate.ordinality <> all(used_positions)
        and private.block_structure_matches(candidate.value,required_block) then
        used_positions := array_append(used_positions,candidate.ordinality);
        matched := true;
        exit;
      end if;
    end loop;
    if not matched then return false; end if;
  end loop;
  return true;
end $$;
revoke all on function private.workspace_structure_matches(jsonb,jsonb) from public,anon,authenticated;

create function private.validate_classroom_submission() returns trigger
language plpgsql security definer set search_path = '' as $$
declare lesson record; expected jsonb; expected_filename text; solution record; lab_instruction text;
begin
  select l.id,l.type,l.classroom_id,t.is_unlocked into lesson from public.lessons l
    join public.topics t on t.id=l.topics_id where l.id=new.lesson_id;
  if lesson.classroom_id is null then return new; end if;
  if not lesson.is_unlocked then raise exception 'This class topic is locked.'; end if;
  if lesson.type='laboratory' and new.is_final then
    select instruction into lab_instruction from public.laboratories where lesson_id=new.lesson_id limit 1;
    begin
      expected := lab_instruction::jsonb->'expectedBlocks';
      expected_filename := lab_instruction::jsonb->>'expectedFilename';
    exception when invalid_text_representation then expected := null; expected_filename := null; end;
    if expected is null then raise exception 'Laboratory objective checks are not configured.'; end if;
    if not exists(select 1 from jsonb_array_elements(new.files) f
      where (expected_filename is null or f->>'filename'=expected_filename)
        and private.workspace_structure_matches(f->'blocks_json',expected)) then
      raise exception 'Laboratory block structure does not meet the required objective.';
    end if;
    new.objective_score := 100;
  elsif lesson.type='tutorial' then
    for solution in select e.expected_blocks_json,f.filename from public.block_tutorial_step_expected e
      join public.block_tutorial_step_files f on f.id=e.file_id
      where e.step_id::text=new.step_key and e.expected_blocks_json is not null
    loop
      if not exists(select 1 from jsonb_array_elements(new.files) submitted
        where submitted->>'filename'=solution.filename
          and private.workspace_structure_matches(submitted->'blocks_json',solution.expected_blocks_json)) then
        raise exception 'Tutorial block structure does not meet the required objective for %.',solution.filename;
      end if;
    end loop;
  end if;
  return new;
end $$;
revoke all on function private.validate_classroom_submission() from public,anon,authenticated;
create trigger validate_classroom_submission before insert or update of files,is_final on public.lesson_submissions
  for each row execute function private.validate_classroom_submission();

create function private.guard_classroom_lesson_completion() returns trigger
language plpgsql security definer set search_path = '' as $$
declare lesson record;
begin
  if not new.is_completed then return new; end if;
  select l.id,l.type,l.classroom_id,t.is_unlocked into lesson from public.lessons l
    join public.topics t on t.id=l.topics_id where l.id=new.lesson_id;
  if lesson.classroom_id is null then return new; end if;
  if not lesson.is_unlocked then raise exception 'This class topic is locked.'; end if;
  if lesson.type in ('tutorial','laboratory') and not exists (
    select 1 from public.lesson_submissions s where s.lesson_id=new.lesson_id
      and s.student_id=new.user_id and s.is_final
  ) then raise exception 'Pass the activity checks before completing this lesson.'; end if;
  return new;
end $$;
revoke all on function private.guard_classroom_lesson_completion() from public,anon,authenticated;
create trigger guard_classroom_lesson_completion before insert or update of is_completed on public.user_lesson_progress
  for each row execute function private.guard_classroom_lesson_completion();

create function private.save_lesson_submission_timed(
  p_lesson uuid,p_files jsonb,p_step uuid,p_finish boolean,p_active_seconds integer,p_device_factor numeric)
returns public.lesson_submissions language plpgsql security definer set search_path = '' as $$
declare saved public.lesson_submissions;
begin
  if p_active_seconds is not null and p_active_seconds not between 0 and 86400
    then raise exception 'Activity time is out of range.'; end if;
  if p_device_factor is not null and p_device_factor not between 0.5 and 2
    then raise exception 'Device adjustment is out of range.'; end if;
  saved := private.save_lesson_submission(p_lesson,p_files,p_step,p_finish);
  if p_finish then
    update public.lesson_submissions set active_seconds=p_active_seconds,device_factor=p_device_factor
    where id=saved.id returning * into saved;
  end if;
  return saved;
end $$;
revoke all on function private.save_lesson_submission_timed(uuid,jsonb,uuid,boolean,integer,numeric) from public,anon;
grant execute on function private.save_lesson_submission_timed(uuid,jsonb,uuid,boolean,integer,numeric) to authenticated;
create function public.save_lesson_submission_timed(
  p_lesson uuid,p_files jsonb,p_step uuid default null,p_finish boolean default true,
  p_active_seconds integer default null,p_device_factor numeric default null)
returns public.lesson_submissions language sql security invoker set search_path = '' begin atomic
  select private.save_lesson_submission_timed(p_lesson,p_files,p_step,p_finish,p_active_seconds,p_device_factor);
end;
revoke all on function public.save_lesson_submission_timed(uuid,jsonb,uuid,boolean,integer,numeric) from public,anon;
grant execute on function public.save_lesson_submission_timed(uuid,jsonb,uuid,boolean,integer,numeric) to authenticated;

revoke all on function public.try_auto_unlock_next_topic(uuid) from public,anon,authenticated;

-- Existing classrooms may already have a published first topic.
update public.topics set unlocked_at=now()
where classroom_id is not null and is_unlocked and unlocked_at is null;
do $$ declare classroom record; begin
  for classroom in select id from public.classrooms loop
    perform private.recompute_classroom_topic_unlocks(classroom.id);
  end loop;
end $$;
