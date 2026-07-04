import { supabase } from "../supabaseClient";

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const makeLessonSlug = (title) => {
  const base = slugify(title) || "lesson";
  return `${base}-${Date.now().toString(36)}`;
};

export const fetchTopicGroupsForAuthoring = async () => {
  const { data, error } = await supabase
    .from("topics")
    .select("id, title, description, order, course_id, courses(title)")
    .order("order", { ascending: true });

  if (error) throw error;

  const grouped = {};
  for (const topic of data ?? []) {
    const courseName = topic.courses?.title ?? "Uncategorized";
    if (!grouped[courseName]) grouped[courseName] = [];
    grouped[courseName].push({
      id: topic.id,
      title: topic.title,
      description: topic.description,
    });
  }

  return Object.entries(grouped).map(([course, topics]) => ({ course, topics }));
};

export const fetchTeacherContentTree = async (teacherId) => {
  const { data, error } = await supabase
    .from("courses")
    .select(`
      id,
      title,
      description,
      image_src,
      order,
      topics (
        id,
        title,
        description,
        order,
        lessons (
          id,
          title,
          type,
          is_published,
          author,
          updated_at,
          profiles!lessons_author_fkey (username)
        )
      )
    `)
    .order("order", { ascending: true })
    .order("order", { foreignTable: "topics", ascending: true })
    .order("order", { foreignTable: "topics.lessons", ascending: true });

  if (error) throw error;

  return (data ?? []).map((course) => ({
    ...course,
    topics: (course.topics ?? []).map((topic) => ({
      ...topic,
      lessons: (topic.lessons ?? [])
        .filter((lesson) => lesson.author === teacherId)
        .map((lesson) => ({
          ...lesson,
          author_name: lesson.profiles?.username ?? "Unknown",
        })),
    })),
  }));
};

export const removeLessonById = async (lessonId) => {
  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
  if (error) throw error;
};

export const createLessonBase = async ({ topicId, authorId, title, type }) => {
  const { data: existingRows, error: orderError } = await supabase
    .from("lessons")
    .select("order")
    .eq("topics_id", topicId)
    .order("order", { ascending: false })
    .limit(1);

  if (orderError) throw orderError;

  const nextOrder = (existingRows?.[0]?.order ?? 0) + 1;
  const payload = {
    topics_id: topicId,
    author: authorId,
    title: title.trim(),
    type,
    is_published: false,
    slug: makeLessonSlug(title),
    order: nextOrder,
  };

  const { data, error } = await supabase.from("lessons").insert(payload).select().single();
  if (error) throw error;
  return data;
};

export const updateLessonBase = async ({ lessonId, topicId, title }) => {
  const { data, error } = await supabase
    .from("lessons")
    .update({
      topics_id: topicId,
      title: title.trim(),
      is_published: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", lessonId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchLectureEditorData = async (lessonId) => {
  const { data, error } = await supabase
    .from("lessons")
    .select(`
      id,
      title,
      topics_id,
      type,
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

export const fetchQuizEditorData = async (lessonId) => {
  const { data, error } = await supabase
    .from("lessons")
    .select(`
      id,
      title,
      topics_id,
      type,
      quizzes (
        id,
        time_limit,
        passing_score,
        questions (
          id,
          text,
          order,
          options (
            id,
            text,
            is_correct
          )
        )
      )
    `)
    .eq("id", lessonId)
    .single();

  if (error) throw error;

  const quiz = data.quizzes?.[0] ?? null;
  return {
    ...data,
    quiz: quiz
      ? {
          ...quiz,
          questions: [...(quiz.questions ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        }
      : null,
  };
};

export const fetchTutorialEditorData = async (lessonId) => {
  const { data, error } = await supabase
    .from("lessons")
    .select(`
      id,
      title,
      topics_id,
      type,
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

export const createQuizContent = async ({ lessonId, timeLimit, passingScore, questions }) => {
  const { data: quizRow, error: quizError } = await supabase
    .from("quizzes")
    .insert({
      lesson_id: lessonId,
      time_limit: timeLimit ?? null,
      passing_score: passingScore ?? null,
    })
    .select()
    .single();

  if (quizError) throw quizError;

  const questionPayload = questions.map((question, index) => ({
    quiz_id: quizRow.id,
    text: question.text.trim(),
    order: index + 1,
  }));

  const { data: questionRows, error: questionError } = await supabase
    .from("questions")
    .insert(questionPayload)
    .select("id, order");

  if (questionError) throw questionError;

  const optionsPayload = questionRows.flatMap((questionRow) => {
    const sourceQuestion = questions[questionRow.order - 1];
    return sourceQuestion.options.map((option) => ({
      question_id: questionRow.id,
      text: option.text.trim(),
      is_correct: Boolean(option.isCorrect),
    }));
  });

  const { error: optionsError } = await supabase.from("options").insert(optionsPayload);
  if (optionsError) throw optionsError;

  return quizRow;
};

export const upsertQuizContent = async ({ lessonId, timeLimit, passingScore, questions }) => {
  const { data: existingQuiz, error: existingQuizError } = await supabase
    .from("quizzes")
    .select("id")
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (existingQuizError) throw existingQuizError;

  let quizId = existingQuiz?.id;
  if (quizId) {
    const { error } = await supabase
      .from("quizzes")
      .update({
        time_limit: timeLimit ?? null,
        passing_score: passingScore ?? null,
      })
      .eq("id", quizId);
    if (error) throw error;
  } else {
    const created = await createQuizContent({ lessonId, timeLimit, passingScore, questions: [] });
    quizId = created.id;
  }

  const { data: existingQuestions, error: existingQuestionsError } = await supabase
    .from("questions")
    .select("id")
    .eq("quiz_id", quizId);
  if (existingQuestionsError) throw existingQuestionsError;

  const questionIds = (existingQuestions ?? []).map((question) => question.id);
  if (questionIds.length > 0) {
    const { error: deleteOptionsError } = await supabase.from("options").delete().in("question_id", questionIds);
    if (deleteOptionsError) throw deleteOptionsError;

    const { error: deleteQuestionsError } = await supabase.from("questions").delete().eq("quiz_id", quizId);
    if (deleteQuestionsError) throw deleteQuestionsError;
  }

  if (questions.length === 0) return { id: quizId };

  const questionPayload = questions.map((question, index) => ({
    quiz_id: quizId,
    text: question.text.trim(),
    order: index + 1,
  }));

  const { data: insertedQuestions, error: questionError } = await supabase
    .from("questions")
    .insert(questionPayload)
    .select("id, order");
  if (questionError) throw questionError;

  const optionsPayload = insertedQuestions.flatMap((questionRow) => {
    const sourceQuestion = questions[questionRow.order - 1];
    return sourceQuestion.options.map((option) => ({
      question_id: questionRow.id,
      text: option.text.trim(),
      is_correct: Boolean(option.isCorrect),
    }));
  });

  const { error: optionsError } = await supabase.from("options").insert(optionsPayload);
  if (optionsError) throw optionsError;

  return { id: quizId };
};
