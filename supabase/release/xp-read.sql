create policy completion_xp_read on public.user_xp_logs for select to authenticated using(user_id=auth.uid() or private.can_manage_classroom(classroom_id));
