create or replace function public.claim_notification_emails() returns table(notification_id uuid,lease_id uuid,user_id uuid,content text,email text,post_id uuid,classroom_id uuid,project_id uuid)
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
    case when u.email_confirmed_at is not null then u.email::text end,n.post_id,n.classroom_id,n.project_id
  from claimed c join public.notifications n on n.id=c.notification_id left join auth.users u on u.id=n.user_id;
end $$;

