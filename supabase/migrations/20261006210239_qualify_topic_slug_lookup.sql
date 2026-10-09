-- Topic insertion also runs inside functions with an empty search_path.
create or replace function public.generate_unique_slug() returns trigger
language plpgsql set search_path = '' as $$
declare base_slug text; candidate_slug text; counter integer := 1; exists_slug boolean;
begin
  base_slug := lower(regexp_replace(new.title,'\s+','-','g'));
  candidate_slug := base_slug;
  loop
    execute format('select exists(select 1 from %I.%I where slug = $1)',tg_table_schema,tg_table_name)
      into exists_slug using candidate_slug;
    exit when not exists_slug;
    counter := counter+1;
    candidate_slug := base_slug||'-'||counter;
  end loop;
  new.slug := candidate_slug;
  return new;
end $$;
