create table public.reusable_block_versions (
 id uuid primary key default gen_random_uuid(),family_id uuid not null default gen_random_uuid(),version integer not null check(version>0),
 classroom_id uuid not null references public.classrooms on delete cascade,author_id uuid not null references public.profiles,
 label text not null check(length(trim(label)) between 1 and 80),description text not null default '' check(length(description)<=1000),
 language text not null check(language in ('html','css','js')),workspace jsonb not null check(octet_length(workspace::text)<=262144),
 connection_shape jsonb not null default '{}',created_at timestamptz not null default now(),unique(family_id,version)
);
create index reusable_block_classroom_idx on public.reusable_block_versions(classroom_id,created_at);
alter table public.reusable_block_versions enable row level security;
grant select,insert on public.reusable_block_versions to authenticated;
create policy reusable_read on public.reusable_block_versions for select to authenticated using(private.can_read_classroom(classroom_id));
create policy reusable_insert on public.reusable_block_versions for insert to authenticated with check(author_id=auth.uid() and exists(select 1 from public.classrooms c join public.profiles p on p.id=c.teacher_id where c.id=classroom_id and c.teacher_id=auth.uid() and p.role='teacher' and not p.must_change_password));
create function private.guard_reusable_version() returns trigger language plpgsql security definer set search_path='' as $$
begin
 perform pg_advisory_xact_lock(hashtextextended(new.family_id::text,0));
 if exists(select 1 from public.reusable_block_versions where family_id=new.family_id and (classroom_id<>new.classroom_id or author_id<>new.author_id)) then raise exception 'A block family belongs to its original teacher and classroom.'; end if;
 if new.version<>coalesce((select max(version)+1 from public.reusable_block_versions where family_id=new.family_id),1) then raise exception 'Use the next consecutive version.'; end if;
 if jsonb_typeof(new.workspace->'blocks'->'blocks')<>'array' or jsonb_array_length(new.workspace->'blocks'->'blocks')<>1 then raise exception 'Capture exactly one connected stack.'; end if;
 if new.workspace::text like '%"webbed_reusable"%' then raise exception 'Nested reusable blocks are not supported.'; end if;
 return new;
end $$;
create trigger guard_reusable_version before insert on public.reusable_block_versions for each row execute function private.guard_reusable_version();
revoke all on function private.guard_reusable_version() from public,anon,authenticated;
