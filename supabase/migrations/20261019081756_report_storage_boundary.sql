-- Older teacher storage policies span every bucket. Restrict this new bucket
-- independently so those permissive rules cannot expose or modify other reports.
create policy report_image_boundary on storage.objects as restrictive for all to authenticated
using(bucket_id<>'report-screenshots' or (private.account_ready() and ((storage.foldername(name))[1]=auth.uid()::text or private.current_profile_role()='admin')))
with check(bucket_id<>'report-screenshots' or (private.account_ready() and (storage.foldername(name))[1]=auth.uid()::text));
