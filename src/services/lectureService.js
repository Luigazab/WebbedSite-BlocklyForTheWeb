/**
 * CREATE TABLE public.lectures (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    content text,
    video_src text,
    file_url text,
    lesson_id uuid NOT NULL,
    CONSTRAINT lectures_pkey PRIMARY KEY (id),
    CONSTRAINT discussions_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id)
  );
 */
import { supabase } from "../supabaseClient";

export const fetchLectureEditorData = async (lessonId) => {
  const { data, error } = await supabase
    .from("lessons")
    .select(`
      id,
      title,
      topics_id,
      type,
      base_xp,
      lectures (
        id,
        content,
        video_src,
        file_url
      )
    `)
    .eq("id", lessonId)
    .single();

  if (error) throw error;

  return {
    ...data,
    lecture: data.lectures?.[0] ?? null,
  };
};

export const uploadLectureAttachment = async ({ lessonId, file }) => {
  const safeName = file.name.replace(/\s+/g, "_");
  const path = `lectures/${lessonId}/${Date.now()}_${safeName}`;

  const { error: uploadError } = await supabase.storage.from("lesson-files").upload(path, file, {
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("lesson-files").getPublicUrl(path);
  return data.publicUrl;
};

export const createLectureContent = async ({ lessonId, content, videoSrc, fileUrl }) => {
  const { data, error } = await supabase
    .from("lectures")
    .insert({
      lesson_id: lessonId,
      content: content || "",
      video_src: videoSrc || null,
      file_url: fileUrl || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const upsertLectureContent = async ({ lessonId, content, videoSrc, fileUrl }) => {
  const { data: existing, error: existingError } = await supabase
    .from("lectures")
    .select("id")
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing?.id) {
    const { data, error } = await supabase
      .from("lectures")
      .update({
        content: content || "",
        video_src: videoSrc || null,
        file_url: fileUrl || null,
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  return createLectureContent({ lessonId, content, videoSrc, fileUrl });
}; 

// student view

export const fetchLectureForStudent = async (lessonId) => {
  const { data, error } = await supabase
    .from("lessons")
    .select(`
      id,
      title,
      created_at,
      base_xp,
      topics_id,
      classroom_id,
      profiles!lessons_author_fkey ( username, avatar_url ),
      topics ( id, course_id, classroom_id ),
      lectures ( content, video_src, file_url )
    `)
    .eq("id", lessonId)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    createdAt: data.created_at,
    baseXp: data.base_xp,
    topicId: data.topics_id,
    classroomId: data.classroom_id ?? data.topics?.classroom_id ?? null,
    courseId: data.topics?.course_id ?? null,
    author: data.profiles
      ? { username: data.profiles.username, avatarUrl: data.profiles.avatar_url }
      : null,
    lecture: data.lectures?.[0] ?? null,
  };
};