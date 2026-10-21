-- A successful login may transparently rehash a password. Do not treat any
-- auth hash change as proof that a teacher chose a replacement password.
drop trigger if exists completion_password_changed on auth.users;
drop function if exists private.password_changed();
drop function if exists public.finish_first_password_change();
