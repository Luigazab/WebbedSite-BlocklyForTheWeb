/**
 * NOTE: TABLE IS:
 * CREATE TABLE public.quizzes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    lesson_id uuid NOT NULL,
    time_limit integer DEFAULT 300,
    passing_score integer,
    CONSTRAINT quizzes_pkey PRIMARY KEY (id),
    CONSTRAINT quizzes_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id)
  );
  CREATE TABLE public.questions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    quiz_id uuid NOT NULL,
    text text NOT NULL,
    order integer,
    CONSTRAINT questions_pkey PRIMARY KEY (id),
    CONSTRAINT questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id)
  );
  CREATE TABLE public.options (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    question_id uuid NOT NULL,
    text text NOT NULL,
    is_correct boolean NOT NULL DEFAULT false,
    image_src text,
    CONSTRAINT options_pkey PRIMARY KEY (id),
    CONSTRAINT options_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id)
  );
  CREATE TABLE public.quiz_attempts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    quiz_id uuid NOT NULL,
    score integer,
    status text,
    started_at timestamp with time zone NOT NULL DEFAULT now(),
    finished_at timestamp with time zone,
    CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id),
    CONSTRAINT quiz_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
    CONSTRAINT quiz_attempts_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id)
  );
  CREATE TABLE public.quiz_answers (
    attempt_id uuid NOT NULL,
    question_id uuid NOT NULL,
    options_id uuid NOT NULL,
    is_correct boolean,
    CONSTRAINT quiz_answers_pkey PRIMARY KEY (attempt_id, question_id),
    CONSTRAINT quiz_answers_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.quiz_attempts(id),
    CONSTRAINT quiz_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id),
    CONSTRAINT quiz_answers_options_id_fkey FOREIGN KEY (options_id) REFERENCES public.options(id)
  );
 */

import { supabase } from "../supabaseClient";

export const fetchQuizEditorData = async (lessonId) => {
  const { data, error } = await supabase
    .from("lessons")
    .select(`
      id,
      title,
      topics_id,
      type,
      base_xp,
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

//student view
export const fetchQuizForStudent = async (lessonId) => {
  const { data, error } = await supabase
    .from("lessons")
    .select(`
      id,
      title,
      base_xp,
      topics_id,
      classroom_id,
      topics ( id, course_id, classroom_id ),
      quizzes (
        id,
        time_limit,
        passing_score,
        questions (
          id, text, order,
          options ( id, text, is_correct )
        )
      )
    `)
    .eq("id", lessonId)
    .single();

  if (error) throw error;

  const quizRow = data.quizzes?.[0] ?? null;

  return {
    id: data.id,
    title: data.title,
    baseXp: data.base_xp,
    topicId: data.topics_id,
    classroomId: data.classroom_id ?? data.topics?.classroom_id ?? null,
    courseId: data.topics?.course_id ?? null,
    quiz: quizRow
      ? { ...quizRow, questions: [...(quizRow.questions ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) }
      : null,
  };
};