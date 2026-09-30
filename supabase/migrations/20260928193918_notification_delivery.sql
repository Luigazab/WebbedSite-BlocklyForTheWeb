-- Existing WebbedSite schema is the baseline for this additive migration.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

alter table public.notifications add column classroom_id uuid references public.classrooms(id) on delete set null;
alter table public.notifications add column post_id uuid references public.classroom_posts(id) on delete set null;
create index notifications_user_created_idx on public.notifications(user_id, created_at desc);
create index notifications_unread_idx on public.notifications(user_id) where is_read = false;
create index notifications_classroom_idx on public.notifications(classroom_id);
create index notifications_post_idx on public.notifications(post_id);
alter table public.notifications enable row level security;
drop policy if exists "Interacting users can insert notifications" on public.notifications;
drop policy if exists "Users can update their own notifications" on public.notifications;
drop policy if exists "Users can view their own notifications" on public.notifications;
drop policy if exists "Users can delete their own notifications" on public.notifications;
revoke all on public.notifications from anon, authenticated;
grant select, delete on public.notifications to authenticated;
grant update(is_read) on public.notifications to authenticated;
create policy notifications_read on public.notifications for select to authenticated using (user_id = (select auth.uid()));
create policy notifications_update on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy notifications_delete on public.notifications for delete to authenticated using (user_id = (select auth.uid()));
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='notifications') then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;

-- Privileged triggers create recipient rows; clients cannot forge email notifications.
create function private.notify_classroom_activity() returns trigger language plpgsql security definer set search_path = '' as $$
declare
  actor uuid;
  owner_id uuid;
  room_id uuid;
  room_name text;
  post_owner uuid;
  actor_name text;
begin
  if tg_table_name = 'classroom_posts' then
    actor := new.author_id; room_id := new.classroom_id;
  elsif tg_table_name = 'classroom_members' then
    actor := coalesce(auth.uid(), new.student_id); room_id := new.classroom_id;
  else
    if tg_table_name = 'comments' then actor := new.author_id; else actor := new.user_id; end if;
    select p.classroom_id, p.author_id into room_id, post_owner from public.classroom_posts p where p.id = new.post_id;
  end if;
  select c.teacher_id, coalesce(c.name, 'your classroom') into owner_id, room_name from public.classrooms c where c.id = room_id;
  -- Service-originated activity is allowed; user activity must match the actor and membership.
  if auth.uid() is not null and auth.uid() <> actor then return new; end if;
  if actor <> owner_id and not exists(select 1 from public.classroom_members m where m.classroom_id=room_id and m.student_id=actor) then return new; end if;
  select coalesce(p.username, 'A classroom member') into actor_name from public.profiles p where p.id=actor;
  if tg_table_name = 'classroom_posts' then
    -- Broadcast announcements only; automatic learning activity does not email the entire class.
    if new.type = 'announcement' then
      insert into public.notifications(user_id,from_user_id,type,content,classroom_id,post_id)
      select recipient,actor,'classroom',actor_name || ' posted an announcement in ' || room_name,room_id,new.id
      from (select student_id as recipient from public.classroom_members where classroom_id=room_id union select owner_id) r
      where recipient <> actor;
    end if;
  elsif tg_table_name = 'classroom_members' then
    if new.student_id <> owner_id then
      insert into public.notifications(user_id,from_user_id,type,content,classroom_id)
      values (owner_id,new.student_id,'classroom','A student joined ' || room_name,room_id),
             (new.student_id,owner_id,'classroom','You joined ' || room_name,room_id);
    end if;
  elsif post_owner <> actor and (post_owner=owner_id or exists(select 1 from public.classroom_members where classroom_id=room_id and student_id=post_owner)) then
    if tg_table_name='comments' then
      insert into public.notifications(user_id,from_user_id,type,content,classroom_id,post_id)
      values(post_owner,actor,'comment',actor_name || ' commented on your post in ' || room_name,room_id,new.post_id);
    else
      insert into public.notifications(user_id,from_user_id,type,content,classroom_id,post_id)
      values(post_owner,actor,'like',actor_name || ' liked your post in ' || room_name,room_id,new.post_id);
    end if;
  end if;
  return new;
end $$;
revoke all on function private.notify_classroom_activity() from public, anon, authenticated;
create trigger notify_classroom_post after insert on public.classroom_posts for each row execute function private.notify_classroom_activity();
create trigger notify_classroom_comment after insert on public.comments for each row execute function private.notify_classroom_activity();
create trigger notify_classroom_like after insert on public.classroom_post_likes for each row execute function private.notify_classroom_activity();
create trigger notify_classroom_join after insert on public.classroom_members for each row execute function private.notify_classroom_activity();

create function private.notify_project_like() returns trigger language plpgsql security definer set search_path = '' as $$
declare owner_id uuid;
begin
  if auth.uid() is not null and auth.uid() <> new.user_id then return new; end if;
  select user_id into owner_id from public.projects where id=new.project_id;
  if owner_id <> new.user_id then
    insert into public.notifications(project_id,user_id,from_user_id,type,content)
    values(new.project_id,owner_id,new.user_id,'like','Someone liked your project!');
  end if;
  return new;
end $$;
revoke all on function private.notify_project_like() from public, anon, authenticated;
drop trigger if exists trigger_project_like_notification on public.project_likes;
create trigger trigger_project_like_notification after insert on public.project_likes for each row execute function private.notify_project_like();
drop function public.create_notification_on_project_like();

create table private.notification_email_jobs (
  notification_id uuid primary key references public.notifications(id) on delete cascade,
  status text not null default 'pending' check(status in ('pending','sending','sent','failed','skipped')),
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  first_attempt_at timestamptz,
  lease_id uuid,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
alter table private.notification_email_jobs enable row level security;
grant select, update on private.notification_email_jobs to service_role;
create index notification_email_pending_idx on private.notification_email_jobs(available_at) where status in ('pending','sending');
create function private.queue_notification_email() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  -- Internal trigger only: called for trusted notification inserts, including background jobs.
  insert into private.notification_email_jobs(notification_id) values(new.id);
  return new;
end $$;
revoke all on function private.queue_notification_email() from public, anon, authenticated;
create trigger queue_notification_email after insert on public.notifications for each row execute function private.queue_notification_email();

-- Service-only RPCs use invoker privileges. Claims are leased so crashes can be retried.
grant usage on schema auth to service_role;
grant select(id,email,email_confirmed_at) on auth.users to service_role;
create function public.claim_notification_emails() returns table(notification_id uuid,lease_id uuid,user_id uuid,content text,email text,post_id uuid,classroom_id uuid,project_id uuid)
language plpgsql security invoker set search_path = '' as $$
begin
  update private.notification_email_jobs j set status='failed',last_error='Retry window expired; review before manual retry'
    where j.status in ('pending','sending') and (j.attempts >= 5 or j.first_attempt_at < now()-interval '23 hours') and j.available_at<=now();
  return query
  with candidates as (
    select j.notification_id from private.notification_email_jobs j
    where j.status in ('pending','sending') and j.available_at<=now()
    order by j.available_at for update skip locked limit 10
  ), claimed as (
    update private.notification_email_jobs j set status='sending', attempts=j.attempts+1,
      first_attempt_at=coalesce(j.first_attempt_at,now()),available_at=now()+interval '5 minutes',lease_id=gen_random_uuid()
    from candidates c where j.notification_id=c.notification_id returning j.notification_id,j.lease_id
  )
  select c.notification_id,c.lease_id,n.user_id,n.content,
    case when u.email_confirmed_at is not null then u.email end,n.post_id,n.classroom_id,n.project_id
  from claimed c join public.notifications n on n.id=c.notification_id left join auth.users u on u.id=n.user_id;
end $$;
create function public.finish_notification_email(p_id uuid,p_lease uuid,p_status text,p_error text default null) returns void
language plpgsql security invoker set search_path = '' as $$
begin
  if p_status not in ('sent','pending','skipped') then raise exception 'Invalid delivery status'; end if;
  update private.notification_email_jobs set status=case when p_status='pending' and attempts>=5 then 'failed' else p_status end,
    last_error=left(p_error,500),sent_at=case when p_status='sent' then now() else sent_at end,
    available_at=now()+interval '1 minute'*power(2,attempts),lease_id=null
  where notification_id=p_id and lease_id=p_lease and status='sending';
end $$;
revoke all on function public.claim_notification_emails() from public,anon,authenticated;
revoke all on function public.finish_notification_email(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.claim_notification_emails(), public.finish_notification_email(uuid,uuid,text,text) to service_role;

-- The scheduler uses an independent token kept in Vault. No service key is stored in cron text.
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;
do $$ begin
  if not exists(select 1 from vault.secrets where name='notification_worker_token') then
    perform vault.create_secret(encode(extensions.gen_random_bytes(32),'hex'),'notification_worker_token');
  end if;
end $$;
create function private.notification_worker_authorized(p_token text) returns boolean
language sql security definer set search_path = '' as $$
  select exists(select 1 from vault.decrypted_secrets where name='notification_worker_token' and decrypted_secret=p_token and length(p_token)=64);
$$;
revoke all on function private.notification_worker_authorized(text) from public,anon,authenticated;
grant execute on function private.notification_worker_authorized(text) to service_role;
create function public.notification_worker_authorized(p_token text) returns boolean
language sql security invoker set search_path = '' as $$ select private.notification_worker_authorized(p_token); $$;
revoke all on function public.notification_worker_authorized(text) from public,anon,authenticated;
grant execute on function public.notification_worker_authorized(text) to service_role;
select cron.schedule('deliver-notification-emails','* * * * *', $job$
  select net.http_post(
    url := 'https://ffnjdqoiaywleodqswnp.supabase.co/functions/v1/deliver-notification-emails',
    headers := jsonb_build_object('Content-Type','application/json','x-notification-token',
      (select decrypted_secret from vault.decrypted_secrets where name='notification_worker_token')),
    body := '{}'::jsonb, timeout_milliseconds := 10000
  );
$job$);
