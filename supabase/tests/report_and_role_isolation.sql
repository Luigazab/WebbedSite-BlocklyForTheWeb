-- Permission checks use synthetic records; no account, file metadata, or report survives.
begin;
do $test$
declare teacher_a uuid:=gen_random_uuid();teacher_b uuid:=gen_random_uuid();student_a uuid:=gen_random_uuid();student_b uuid:=gen_random_uuid();administrator uuid:=gen_random_uuid();class_a uuid;class_b uuid;report bigint;u uuid;
begin
 perform set_config('request.jwt.claims','{"role":"service_role"}',true);
 foreach u in array array[teacher_a,teacher_b,student_a,student_b,administrator] loop
 insert into auth.users(id,email,raw_user_meta_data) values(u,'isolation-'||u||'@example.invalid',jsonb_build_object('username','Isolation '||u));
 end loop;
 update public.profiles set role='teacher' where id in (teacher_a,teacher_b);
 update public.profiles set role='admin' where id=administrator;
 insert into public.classrooms(teacher_id,name,is_active) values(teacher_a,'Isolation A',true) returning id into class_a;
 insert into public.classrooms(teacher_id,name,is_active) values(teacher_b,'Isolation B',true) returning id into class_b;
 insert into public.classroom_members(classroom_id,student_id) values(class_a,student_a),(class_b,student_b);
 insert into storage.objects(bucket_id,name) values('report-screenshots',student_a||'/fixture.png');
 perform set_config('request.jwt.claims',jsonb_build_object('sub',student_a,'role','authenticated')::text,true);set local role authenticated;
 insert into public.feedback(user_id,type,title,message,status,screenshot_path) values(student_a,'bug','Isolation acceptance','Test report','open',student_a||'/fixture.png') returning id into report;
 if (select count(*) from public.feedback_history where feedback_id=report)<>1 then raise exception 'Initial report history missing.';end if;
 update public.feedback set status='resolved' where id=report;
 if exists(select 1 from public.feedback where id=report and status<>'open') then raise exception 'Reporter changed administrator status.';end if;
 if not exists(select 1 from storage.objects where bucket_id='report-screenshots' and name=student_a||'/fixture.png') then raise exception 'Reporter cannot view their screenshot.';end if;
 reset role;perform set_config('request.jwt.claims',jsonb_build_object('sub',student_b,'role','authenticated')::text,true);set local role authenticated;
 if exists(select 1 from public.feedback where id=report) or exists(select 1 from public.feedback_history where feedback_id=report) then raise exception 'Another student read a private report.';end if;
 if exists(select 1 from storage.objects where bucket_id='report-screenshots' and name=student_a||'/fixture.png') then raise exception 'Another student read a private screenshot.';end if;
 reset role;perform set_config('request.jwt.claims',jsonb_build_object('sub',teacher_b,'role','authenticated')::text,true);set local role authenticated;
 begin perform public.classroom_gradebook(class_a);raise exception 'Teacher opened another classroom gradebook';exception when raise_exception then if sqlerrm='Teacher opened another classroom gradebook' then raise;end if;end;
 begin insert into storage.objects(bucket_id,name) values('report-screenshots',student_a||'/forged.png');raise exception 'Broad teacher storage policy bypassed screenshot ownership';exception when insufficient_privilege then null;end;
 reset role;perform set_config('request.jwt.claims',jsonb_build_object('sub',administrator,'role','authenticated')::text,true);set local role authenticated;
 update public.feedback set status='in_review' where id=report;
 update public.feedback set status='resolved' where id=report;
 if (select count(*) from public.feedback_history where feedback_id=report)<>3 then raise exception 'Report status history incorrect.';end if;
 if not exists(select 1 from storage.objects where bucket_id='report-screenshots' and name=student_a||'/fixture.png') then raise exception 'Administrator cannot review screenshot.';end if;
 reset role;
 update auth.users set banned_until=now()+interval '1 day' where id=teacher_b;
 perform set_config('request.jwt.claims',jsonb_build_object('sub',teacher_b,'role','authenticated')::text,true);set local role authenticated;
 begin perform public.classroom_gradebook(class_b);raise exception 'Disabled teacher opened gradebook';exception when raise_exception then if sqlerrm='Disabled teacher opened gradebook' then raise;end if;end;
 if exists(select 1 from public.profiles where id<>teacher_b) then raise exception 'Disabled teacher read other private profiles.';end if;
 reset role;
end $test$;
rollback;
