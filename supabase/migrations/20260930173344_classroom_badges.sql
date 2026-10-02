-- Match XP aggregation to the current (user_id, classroom_id) progress key.
create or replace function public.handle_xp_gain() returns trigger
language plpgsql set search_path='' as $$
declare classroom uuid; total bigint; level_value bigint;
begin
  classroom := new.classroom_id;
  if classroom is null then select classroom_id into classroom from public.lessons where id=new.source_id; end if;
  if classroom is null then return new; end if;
  select coalesce(sum(x.xp_earned),0) into total from public.user_xp_logs x where x.user_id=new.user_id
    and (x.classroom_id=classroom or (x.classroom_id is null and exists(select 1 from public.lessons l where l.id=x.source_id and l.classroom_id=classroom)));
  select coalesce(max(level),1) into level_value from public.levels where xp_required<=total;
  insert into public.user_progress(user_id,classroom_id,active_course,current_xp,current_level,total_xp)
    values(new.user_id,classroom,new.course_id,total,level_value,total)
    on conflict(user_id,classroom_id) do update set active_course=excluded.active_course,
      current_xp=excluded.current_xp,current_level=excluded.current_level,total_xp=excluded.total_xp;
  return new;
end $$;

-- Preserve the existing RPC response while using the classroom progress key.
create or replace function private.complete_classroom_lesson(p_user_id uuid,p_lesson_id uuid,p_score integer)
returns table(earned_xp integer,is_first_attempt boolean,updated_best_score integer,course_total_xp bigint,did_level_up boolean,new_level bigint,next_level_xp_required bigint)
language plpgsql security definer set search_path='' as $$
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
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text||coalesce(lesson.classroom_id::text,lesson.course_id::text),0));
  select * into progress from public.user_lesson_progress where user_id=p_user_id and lesson_id=p_lesson_id for update;
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
end $$;
revoke all on function private.complete_classroom_lesson(uuid,uuid,integer) from public,anon;
grant execute on function private.complete_classroom_lesson(uuid,uuid,integer) to authenticated;
create or replace function public.complete_lesson(p_user_id uuid,p_lesson_id uuid,p_score integer)
returns table(earned_xp integer,is_first_attempt boolean,updated_best_score integer,course_total_xp bigint,did_level_up boolean,new_level bigint,next_level_xp_required bigint)
language sql security invoker set search_path=''
begin atomic
  select * from private.complete_classroom_lesson(p_user_id,p_lesson_id,p_score);
end;
revoke all on function public.complete_lesson(uuid,uuid,integer) from public,anon;
grant execute on function public.complete_lesson(uuid,uuid,integer) to authenticated;

-- Classroom badge rules and immutable award snapshots.
create table public.classroom_badge_rules (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  topic_id uuid references public.topics(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 80),
  description text not null default '' check (length(description) <= 500),
  image_url text,
  criterion text not null check (criterion in ('topic_completed','course_xp')),
  xp_target bigint,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check ((criterion='topic_completed' and topic_id is not null and xp_target is null)
    or (criterion='course_xp' and topic_id is null and xp_target is not null and xp_target > 0))
);
create index classroom_badge_rules_classroom_idx on public.classroom_badge_rules(classroom_id);
create index classroom_badge_rules_course_idx on public.classroom_badge_rules(course_id);
create index classroom_badge_rules_topic_idx on public.classroom_badge_rules(topic_id);
create table public.classroom_badge_awards (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid references public.classroom_badge_rules(id) on delete set null,
  student_id uuid not null references public.profiles(id) on delete cascade,
  classroom_id uuid references public.classrooms(id) on delete set null,
  name text not null,
  description text not null,
  image_url text,
  requirement text not null,
  earned_at timestamptz not null default now(),
  unique(rule_id, student_id)
);
create index classroom_badge_awards_student_idx on public.classroom_badge_awards(student_id,earned_at desc);
create index classroom_badge_awards_classroom_idx on public.classroom_badge_awards(classroom_id);
create index if not exists badge_xp_lookup_idx on public.user_xp_logs(user_id,course_id);
create index if not exists badge_lesson_lookup_idx on public.lessons(topics_id,classroom_id) where is_published;
alter table public.classroom_badge_rules enable row level security;
alter table public.classroom_badge_awards enable row level security;
grant select, insert, update on public.classroom_badge_rules to authenticated;
grant select on public.classroom_badge_awards to authenticated;
create policy badge_rules_read on public.classroom_badge_rules for select to authenticated using (
  exists(select 1 from public.classrooms c where c.id=classroom_id and c.teacher_id=(select auth.uid()))
  or exists(select 1 from public.classroom_members m where m.classroom_id=classroom_badge_rules.classroom_id and m.student_id=(select auth.uid()))
);
create policy badge_rules_create on public.classroom_badge_rules for insert to authenticated with check (
  exists(select 1 from public.classrooms c where c.id=classroom_id and c.teacher_id=(select auth.uid()))
);
create policy badge_rules_update on public.classroom_badge_rules for update to authenticated using (
  exists(select 1 from public.classrooms c where c.id=classroom_id and c.teacher_id=(select auth.uid()))
) with check (
  exists(select 1 from public.classrooms c where c.id=classroom_id and c.teacher_id=(select auth.uid()))
);
-- Badges are profile achievements, visible to signed-in users just like profiles.
create policy badge_awards_read on public.classroom_badge_awards for select to authenticated using (true);

create or replace function private.validate_classroom_badge_rule() returns trigger
language plpgsql set search_path='' as $$
begin
  if not exists(select 1 from public.classroom_courses cc where cc.classroom_id=new.classroom_id and cc.course_id=new.course_id) then
    raise exception 'Select a course assigned to this classroom.';
  end if;
  if new.topic_id is not null and not exists(select 1 from public.topics t where t.id=new.topic_id and t.classroom_id=new.classroom_id and t.course_id=new.course_id) then
    raise exception 'Select a topic belonging to this classroom and course.';
  end if;
  if tg_op='UPDATE' and (new.classroom_id,new.course_id,new.topic_id,new.criterion,new.xp_target,new.name,new.description,new.image_url)
    is distinct from (old.classroom_id,old.course_id,old.topic_id,old.criterion,old.xp_target,old.name,old.description,old.image_url) then
    raise exception 'Badge requirements cannot be changed. Pause this badge and create a new one.';
  end if;
  return new;
end $$;
create trigger validate_classroom_badge_rule before insert or update on public.classroom_badge_rules for each row execute function private.validate_classroom_badge_rule();

-- Internal trigger-only evaluator: clients cannot grant themselves awards.
create or replace function private.evaluate_classroom_badges(p_student uuid,p_classroom uuid) returns void
language plpgsql security definer set search_path='' as $$
declare r record; award_id uuid; requirement_text text;
begin
  if auth.uid() is not null and auth.uid()<>p_student and not exists(select 1 from public.classrooms where id=p_classroom and teacher_id=auth.uid()) then
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
end $$;
revoke all on function private.evaluate_classroom_badges(uuid,uuid) from public,anon,authenticated;

create or replace function private.classroom_progress_activity() returns trigger
language plpgsql security definer set search_path='' as $$
declare lesson record;
begin
  if auth.uid() is not null and auth.uid()<>new.user_id then raise exception 'Not authorized to record this student activity.'; end if;
  select l.* into lesson from public.lessons l where l.id=new.lesson_id;
  if lesson.classroom_id is null or not exists(select 1 from public.classroom_members where classroom_id=lesson.classroom_id and student_id=new.user_id) then return new; end if;
  if new.is_completed and (tg_op='INSERT' or not coalesce(old.is_completed,false)) then
    insert into public.classroom_posts(classroom_id,author_id,type,content) values(lesson.classroom_id,new.user_id,
      case lesson.type when 'quiz' then 'quiz_scored' when 'laboratory' then 'laboratory_completed' else 'lecture_completed' end,
      'completed the '||lesson.type||' "'||lesson.title||'"');
  end if;
  if new.is_completed then perform private.evaluate_classroom_badges(new.user_id,lesson.classroom_id); end if;
  return new;
end $$;
create trigger classroom_progress_activity after insert or update on public.user_lesson_progress for each row execute function private.classroom_progress_activity();

create or replace function private.classroom_xp_badges() returns trigger
language plpgsql security definer set search_path='' as $$
declare classroom uuid;
begin
  if auth.uid() is not null and auth.uid()<>new.user_id then raise exception 'Not authorized to record this student XP.'; end if;
  classroom := new.classroom_id;
  if classroom is null then select classroom_id into classroom from public.lessons where id=new.source_id; end if;
  if classroom is not null then perform private.evaluate_classroom_badges(new.user_id,classroom); end if;
  return new;
end $$;
create trigger classroom_xp_badges after insert on public.user_xp_logs for each row execute function private.classroom_xp_badges();

create or replace function private.classroom_badge_backfill() returns trigger
language plpgsql security definer set search_path='' as $$
declare student uuid;
begin
  if tg_table_name='classroom_members' then
    if auth.uid() is not null and auth.uid()<>new.student_id and not exists(select 1 from public.classrooms where id=new.classroom_id and teacher_id=auth.uid()) then raise exception 'Not authorized.'; end if;
    perform private.evaluate_classroom_badges(new.student_id,new.classroom_id);
  elsif new.is_active then
    if auth.uid() is not null and not exists(select 1 from public.classrooms where id=new.classroom_id and teacher_id=auth.uid()) then raise exception 'Not authorized.'; end if;
    for student in select student_id from public.classroom_members where classroom_id=new.classroom_id order by student_id loop
      perform private.evaluate_classroom_badges(student,new.classroom_id);
    end loop;
  end if;
  return new;
end $$;
create trigger classroom_badge_backfill after insert or update on public.classroom_badge_rules for each row execute function private.classroom_badge_backfill();
create trigger classroom_member_badges after insert on public.classroom_members for each row execute function private.classroom_badge_backfill();
revoke all on function private.validate_classroom_badge_rule(),private.classroom_progress_activity(),private.classroom_xp_badges(),private.classroom_badge_backfill() from public,anon,authenticated;

do $$ begin
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='classroom_posts') then
    alter publication supabase_realtime add table public.classroom_posts;
  end if;
end $$;
