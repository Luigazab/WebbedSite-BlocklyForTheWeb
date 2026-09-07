/**
 * CREATE TABLE public.laboratories (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    lesson_id uuid NOT NULL,
    instruction text,
    CONSTRAINT laboratories_pkey PRIMARY KEY (id),
    CONSTRAINT laboratories_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id)
  );
  CREATE TABLE public.laboratory_files (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    laboratory_id uuid NOT NULL,
    filename text,
    file_type text,
    intial_code text,
    intial_blockly_code text,
    expected_code text,
    test_cases jsonb,
    CONSTRAINT laboratory_files_pkey PRIMARY KEY (id),
    CONSTRAINT laboratory_files_laboratory_id_fkey FOREIGN KEY (laboratory_id) REFERENCES public.laboratories(id)
  );
  CREATE TABLE public.laboratory_completed (
    user_id uuid NOT NULL,
    laboratory_id uuid NOT NULL,
    completed_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT laboratory_completed_pkey PRIMARY KEY (user_id, laboratory_id),
    CONSTRAINT laboratory_completed_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
    CONSTRAINT laboratory_completed_laboratory_id_fkey FOREIGN KEY (laboratory_id) REFERENCES public.laboratories(id)
  );
 */
import { supabase } from "../supabaseClient";

export const fetchLaboratoryEditorData = async (lessonId) => {
  const { data, error } = await supabase
    .from("lessons")
    .select(`
      id,
      title,
      topics_id,
      type,
      laboratories (
        id,
        instruction
      )
    `)
    .eq("id", lessonId)
    .single();

  if (error) throw error;

  return {
    ...data,
    laboratory: data.laboratories?.[0] ?? null,
  };
};

export const upsertLaboratoryContent = async ({ lessonId, instruction }) => {
  const { data: existing, error: existingError } = await supabase
    .from("laboratories")
    .select("id")
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing?.id) {
    const { data, error } = await supabase
      .from("laboratories")
      .update({ instruction })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("laboratories")
    .insert({ lesson_id: lessonId, instruction })
    .select()
    .single();

  if (error) throw error;
  return data;
};