/**
 * CREATE TABLE public.tutorials (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    lesson_id uuid NOT NULL,
    type text,
    CONSTRAINT tutorials_pkey PRIMARY KEY (id),
    CONSTRAINT tutorials_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id)
  );
  CREATE TABLE public.text_tutorial_steps (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    tutorial_id uuid NOT NULL,
    instruction text,
    hint text,
    order integer,
    CONSTRAINT text_tutorial_steps_pkey PRIMARY KEY (id),
    CONSTRAINT text_tutorial_steps_tutorial_id_fkey FOREIGN KEY (tutorial_id) REFERENCES public.tutorials(id)
  );
  CREATE TABLE public.text_tutorial_step_files (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    tutorial_id uuid NOT NULL,
    filename text NOT NULL,
    initial_content text,
    file_type text NOT NULL,
    CONSTRAINT text_tutorial_step_files_pkey PRIMARY KEY (id),
    CONSTRAINT text_tutorial_step_files_tutorial_id_fkey FOREIGN KEY (tutorial_id) REFERENCES public.tutorials(id)
  );
  CREATE TABLE public.text_tutorial_step_expected (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    step_id uuid NOT NULL,
    file_id uuid NOT NULL,
    expected_code text,
    test_cases jsonb,
    CONSTRAINT text_tutorial_step_expected_pkey PRIMARY KEY (id),
    CONSTRAINT text_tutorial_step_expected_step_id_fkey FOREIGN KEY (step_id) REFERENCES public.text_tutorial_steps(id),
    CONSTRAINT text_tutorial_step_expected_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.text_tutorial_step_files(id)
  );
  CREATE TABLE public.text_step_completed (
    user_id uuid NOT NULL,
    step_id uuid NOT NULL,
    completed_at timestamp with time zone DEFAULT now(),
    CONSTRAINT text_step_completed_pkey PRIMARY KEY (user_id, step_id),
    CONSTRAINT step_completed_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
    CONSTRAINT step_completed_step_id_fkey FOREIGN KEY (step_id) REFERENCES public.text_tutorial_steps(id)
  );
  CREATE TABLE public.block_tutorial_steps (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    tutorial_id uuid NOT NULL,
    instruction text,
    hint text,
    order integer,
    CONSTRAINT block_tutorial_steps_pkey PRIMARY KEY (id),
    CONSTRAINT block_tutorial_steps_tutorial_id_fkey FOREIGN KEY (tutorial_id) REFERENCES public.tutorials(id)
  );
  CREATE TABLE public.block_tutorial_step_files (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    tutorial_id uuid NOT NULL,
    filename text,
    initial_content_json jsonb,
    file_type text,
    CONSTRAINT block_tutorial_step_files_pkey PRIMARY KEY (id),
    CONSTRAINT block_tutorial_step_files_tutorial_id_fkey FOREIGN KEY (tutorial_id) REFERENCES public.tutorials(id)
  );
  CREATE TABLE public.block_tutorial_step_expected (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    step_id uuid NOT NULL,
    file_id uuid NOT NULL,
    expected_code text,
    test_cases jsonb,
    CONSTRAINT block_tutorial_step_expected_pkey PRIMARY KEY (id),
    CONSTRAINT block_tutorials_step_expected_step_id_fkey FOREIGN KEY (step_id) REFERENCES public.block_tutorial_steps(id),
    CONSTRAINT block_tutorials_step_expected_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.block_tutorial_step_files(id)
  );
  CREATE TABLE public.block_step_completed (
    user_id uuid NOT NULL,
    step_id uuid NOT NULL,
    completed_at timestamp with time zone DEFAULT now(),
    CONSTRAINT block_step_completed_pkey PRIMARY KEY (user_id, step_id),
    CONSTRAINT block_step_completed_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
    CONSTRAINT block_step_completed_step_id_fkey FOREIGN KEY (step_id) REFERENCES public.block_tutorial_steps(id)
  );
 */
import { supabase } from "../supabaseClient";

export const fetchTutorialEditorData = async (lessonId) => {
  const { data, error } = await supabase
    .from("lessons")
    .select(`
      id,
      title,
      topics_id,
      type,
      base_xp,
      tutorials (
        id
      )
    `)
    .eq("id", lessonId)
    .single();

  if (error) throw error;

  return {
    ...data,
    tutorial: data.tutorials?.[0] ?? null,
  };
};

export const linkTutorialToLesson = async ({ tutorialId, lessonId }) => {
  const { data, error } = await supabase
    .from("tutorials")
    .update({ lesson_id: lessonId })
    .eq("id", tutorialId)
    .select()
    .single();

  if (error) throw error;
  return data;
};