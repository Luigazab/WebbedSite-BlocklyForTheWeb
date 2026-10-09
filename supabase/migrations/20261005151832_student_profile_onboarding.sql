-- Student onboarding is complete only after the profile introduction.
alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz;

-- Student uploads use avatars/<user-id>/<unique-file-name> in the public
-- avatars bucket. Students choose presets from the root of avatar-pool.
create policy "Users can upload their own avatar"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
