-- Integration checks use existing profile IDs but roll back every test row.
begin;
do $$
declare teacher uuid; student uuid; room uuid := gen_random_uuid(); post uuid := gen_random_uuid(); project uuid := gen_random_uuid(); project_type text;
begin
  select id into teacher from public.profiles where role='teacher' limit 1;
  select id into student from public.profiles where role='student' limit 1;
  if teacher is null or student is null then raise exception 'Test requires a teacher and student profile'; end if;
  perform set_config('test.room',room::text,true);
  perform set_config('test.student',student::text,true);
  insert into public.classrooms(id,teacher_id,name,join_code,is_active) values(room,teacher,'Notification integration test',left(room::text,8),true);
  insert into public.classroom_members(classroom_id,student_id) values(room,student);
  if (select count(*) from public.notifications where classroom_id=room) <> 2 then raise exception 'Join notifications missing'; end if;
  insert into public.classroom_posts(id,classroom_id,author_id,type,content) values(post,room,teacher,'announcement','Test announcement');
  if (select count(*) from public.notifications where post_id=post and user_id=student) <> 1 then raise exception 'Announcement recipient incorrect'; end if;
  insert into public.comments(post_id,author_id,content) values(post,student,'Test reply');
  insert into public.classroom_post_likes(post_id,user_id) values(post,student);
  if (select count(*) from public.notifications where post_id=post and user_id=teacher) <> 2 then raise exception 'Comment/like notifications missing'; end if;
  insert into public.comments(post_id,author_id,content) values(post,teacher,'Self reply');
  if (select count(*) from public.notifications where post_id=post) <> 3 then raise exception 'Self-notification was generated'; end if;
  if (select count(*) from private.notification_email_jobs j join public.notifications n on n.id=j.notification_id where n.classroom_id=room) <> 5 then raise exception 'Email queue missing entries'; end if;
  select e.enumlabel into project_type from pg_enum e where e.enumtypid=(select atttypid from pg_attribute where attrelid='public.projects'::regclass and attname='type') order by e.enumsortorder limit 1;
  execute format('insert into public.projects(id,user_id,title,type,is_public) values($1,$2,$3,%L,true)',project_type) using project,teacher,'Notification test project';
  insert into public.project_likes(project_id,user_id) values(project,student);
  if (select count(*) from public.notifications where project_id=project and user_id=teacher and type='like') <> 1 then raise exception 'Project like trigger failed'; end if;
  insert into public.project_likes(project_id,user_id) values(project,teacher);
  if (select count(*) from public.notifications where project_id=project) <> 1 then raise exception 'Project self-like notified'; end if;
  perform set_config('request.jwt.claim.sub',student::text,true);
end $$;
set local role authenticated;
do $$ begin
  if exists(select 1 from public.notifications where user_id <> auth.uid()) then raise exception 'Notification RLS leaks other recipients'; end if;
  update public.notifications set is_read=true where classroom_id=current_setting('test.room')::uuid;
  if (select count(*) from public.notifications where classroom_id=current_setting('test.room')::uuid and is_read) <> 2 then raise exception 'Mark read failed'; end if;
  begin
    update public.notifications set content='Forged email' where classroom_id=current_setting('test.room')::uuid;
    raise exception 'Content edit was allowed';
  exception when insufficient_privilege then null; end;
  begin
    perform public.claim_notification_emails();
    raise exception 'Email queue was accessible to a client';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.notifications(user_id,from_user_id,type,content) values(auth.uid(),auth.uid(),'like','Forged');
    raise exception 'Notification forgery was allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
-- Put test jobs first without committing any queue changes.
update private.notification_email_jobs set available_at=now()-interval '1 day'
where notification_id in(select id from public.notifications where classroom_id=current_setting('test.room')::uuid);
set local role service_role;
do $$ declare j record; tested integer := 0;
begin
  if public.notification_worker_authorized(repeat('x',64)) then raise exception 'Invalid worker token accepted'; end if;
  for j in select * from public.claim_notification_emails() loop
    if j.classroom_id=current_setting('test.room')::uuid then
      tested := tested+1;
      perform public.finish_notification_email(j.notification_id,gen_random_uuid(),'sent');
      if (select status from private.notification_email_jobs where notification_id=j.notification_id) <> 'sending' then raise exception 'Wrong lease accepted'; end if;
      perform public.finish_notification_email(j.notification_id,j.lease_id,'pending','Simulated provider error');
      if (select status from private.notification_email_jobs where notification_id=j.notification_id) <> 'pending' then raise exception 'Retry not queued'; end if;
    end if;
  end loop;
  if tested <> 5 then raise exception 'Claimed % test jobs instead of 5',tested; end if;
end $$;
reset role;
rollback;
select 'PASS: events, recipients, self-suppression, RLS, queue, leases, retries; all test rows rolled back' as result;
