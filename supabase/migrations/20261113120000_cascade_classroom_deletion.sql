-- Deleting a classroom removes its owned curriculum and student activity.
-- Walk foreign keys from classrooms through owned children, replacing the
-- older NO ACTION constraints with CASCADE. Existing SET NULL references
-- (notifications, projects, feedback, award history) remain independent.
do $$
declare
  fk record;
  definition text;
  replacement text;
begin
  for fk in
    with recursive owned(table_oid, path) as (
      select 'public.classrooms'::regclass::oid, array['public.classrooms'::regclass::oid]
      union all
      select c.conrelid, owned.path || c.conrelid
      from owned
      join pg_constraint c on c.contype = 'f' and c.confrelid = owned.table_oid
      join pg_class child on child.oid = c.conrelid
      join pg_namespace child_schema on child_schema.oid = child.relnamespace
      where child_schema.nspname = 'public'
        and child.relname not in ('courses', 'profiles', 'projects', 'notifications', 'feedback')
        and c.confdeltype in ('a', 'r', 'c')
        and not c.conrelid = any(owned.path)
    )
    select distinct c.oid, c.conname, c.conrelid, c.confdeltype
    from owned
    join pg_constraint c on c.contype = 'f' and c.confrelid = owned.table_oid
    join pg_class child on child.oid = c.conrelid
    join pg_namespace child_schema on child_schema.oid = child.relnamespace
    where child_schema.nspname = 'public'
      and child.relname not in ('courses', 'profiles', 'projects', 'notifications', 'feedback')
      and c.confdeltype in ('a', 'r')
      -- A prerequisite is a relationship between lessons, not ownership.
      and not (child.relname = 'lessons' and c.conname = 'lessons_prerequisite_lesson_fkey')
    order by c.oid
  loop
    definition := pg_get_constraintdef(fk.oid);
    if definition ~ ' ON DELETE (NO ACTION|RESTRICT)' then
      replacement := regexp_replace(definition, ' ON DELETE (NO ACTION|RESTRICT)', ' ON DELETE CASCADE');
    elsif definition ~ ' (NOT )?DEFERRABLE' then
      replacement := regexp_replace(definition, ' ((NOT )?DEFERRABLE)', ' ON DELETE CASCADE \1');
    elsif definition ~ ' NOT VALID$' then
      replacement := regexp_replace(definition, ' NOT VALID$', ' ON DELETE CASCADE NOT VALID');
    else
      replacement := definition || ' ON DELETE CASCADE';
    end if;

    execute format('alter table %s drop constraint %I', fk.conrelid::regclass, fk.conname);
    execute format('alter table %s add constraint %I %s', fk.conrelid::regclass, fk.conname, replacement);
  end loop;
end $$;

-- A lesson can point to another lesson as a prerequisite. Clearing that link
-- avoids deleting an unrelated lesson if it refers to a removed classroom lesson.
alter table public.lessons drop constraint if exists lessons_prerequisite_lesson_fkey;
alter table public.lessons add constraint lessons_prerequisite_lesson_fkey
  foreign key (prerequisite_lesson) references public.lessons(id) on delete set null;
