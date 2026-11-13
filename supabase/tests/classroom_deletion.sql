-- Run after the classroom deletion migration. All fixtures are rolled back.
begin;
do $test$
declare
  teacher uuid;
  student uuid;
  course uuid;
  target uuid;
  retained uuid;
  topic uuid;
  lesson uuid;
begin
  select id into teacher from public.profiles where role = 'teacher' limit 1;
  select id into student from public.profiles where role = 'student' limit 1;
  select id into course from public.courses limit 1;
  if teacher is null or student is null or course is null then
    raise exception 'Test requires a teacher, student, and course.';
  end if;

  insert into public.classrooms(teacher_id, name, is_active)
    values (teacher, 'Cascade deletion test', false) returning id into target;
  insert into public.classrooms(teacher_id, name, is_active)
    values (teacher, 'Retained classroom', true) returning id into retained;
  insert into public.classroom_members(classroom_id, student_id) values (target, student);
  insert into public.classroom_courses(classroom_id, course_id) values (target, course);
  insert into public.topics(course_id, classroom_id, title, description, "order", is_published, slug)
    values (course, target, 'Delete test topic', '', 1, false, 'cascade-deletion-test') returning id into topic;
  insert into public.lessons(topics_id, classroom_id, author, title, type, is_published, slug)
    values (topic, target, teacher, 'Delete test lesson', 'lecture', false, 'cascade-deletion-test') returning id into lesson;

  delete from public.classrooms where id = target;

  if exists (select 1 from public.classroom_members where classroom_id = target)
    or exists (select 1 from public.classroom_courses where classroom_id = target)
    or exists (select 1 from public.topics where id = topic)
    or exists (select 1 from public.lessons where id = lesson) then
    raise exception 'Classroom-owned records survived deletion.';
  end if;
  if not exists (select 1 from public.classrooms where id = retained)
    or not exists (select 1 from public.courses where id = course)
    or not exists (select 1 from public.profiles where id = student) then
    raise exception 'Deletion removed shared or unrelated records.';
  end if;
end $test$;
rollback;
