-- Owners may upload new thumbnail snapshots and clean up failed uploads.
-- Match the existing workspace_snapshots/<project UUID>_<snapshot UUID>.png path.
create policy project_thumbnail_insert on storage.objects
for insert to authenticated with check (bucket_id = 'thumbnails'
  and (select private.account_ready())
  and (select public.get_user_role()) in ('student', 'teacher', 'admin')
  and (storage.foldername(name)) = array['workspace_snapshots']
  and storage.extension(name) = 'png'
  and exists (
    select 1 from public.projects p
    where p.id::text = split_part(storage.filename(name), '_', 1)
      and p.user_id = (select auth.uid())
  ));

create policy project_thumbnail_select on storage.objects
for select to authenticated using (bucket_id = 'thumbnails'
  and (select private.account_ready())
  and (select public.get_user_role()) in ('student', 'teacher', 'admin')
  and (storage.foldername(name)) = array['workspace_snapshots']
  and storage.extension(name) = 'png'
  and exists (
    select 1 from public.projects p
    where p.id::text = split_part(storage.filename(name), '_', 1)
      and p.user_id = (select auth.uid())
  ));

create policy project_thumbnail_delete on storage.objects
for delete to authenticated using (bucket_id = 'thumbnails'
  and (select private.account_ready())
  and (select public.get_user_role()) in ('student', 'teacher', 'admin')
  and (storage.foldername(name)) = array['workspace_snapshots']
  and storage.extension(name) = 'png'
  and exists (
    select 1 from public.projects p
    where p.id::text = split_part(storage.filename(name), '_', 1)
      and p.user_id = (select auth.uid())
  ));

-- Existing staff upload policies are broad; constrain new thumbnail uploads to
-- their own projects too, without changing any other bucket's permissions.
create policy project_thumbnail_insert_boundary on storage.objects
as restrictive for insert to authenticated
with check (bucket_id <> 'thumbnails' or (bucket_id = 'thumbnails'
  and (select private.account_ready())
  and (select public.get_user_role()) in ('student', 'teacher', 'admin')
  and (storage.foldername(name)) = array['workspace_snapshots']
  and storage.extension(name) = 'png'
  and exists (
    select 1 from public.projects p
    where p.id::text = split_part(storage.filename(name), '_', 1)
      and p.user_id = (select auth.uid())
  )));
