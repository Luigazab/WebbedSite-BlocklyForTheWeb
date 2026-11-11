alter table public.lessons
  drop constraint if exists lessons_topics_id_fkey;

alter table public.lessons
  add constraint lessons_topics_id_fkey
  foreign key (topics_id) references public.topics(id)
  on update cascade on delete cascade;
