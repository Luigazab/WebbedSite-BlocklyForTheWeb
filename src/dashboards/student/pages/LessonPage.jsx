import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useLessonStore } from '../../../store/lessonStore'
import { useLesson } from '../../../hooks/useLesson'
import { useAuthStore } from '../../../store/authStore'
import PageWrapper from '../../../components/layout/PageWrapper'
import QuizSection from '../components/QuizSection'
import {
  ChevronLeft, CheckCircle2, BookOpen,
  Loader2, AlertCircle, Clock, Paperclip,
  FileText, Download, ExternalLink,
} from 'lucide-react'

export default function LessonPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const profile = useAuthStore((state) => state.profile)
  const {
    currentLesson, loading, error,
    lessonProgress, quizAttempt,
    fetchLesson, fetchProgress, clearCurrentLesson,
  } = useLessonStore()
  const { handleMarkComplete, handleSubmitQuiz } = useLesson()
  const [marking, setMarking] = useState(false)

  useEffect(() => {
    fetchLesson(lessonId)
    // FIX: load this student's progress so isCompleted reflects reality
    if (profile?.id) fetchProgress(profile.id)
    return () => clearCurrentLesson()
  }, [lessonId, profile?.id])

  const isCompleted = lessonProgress[lessonId]?.is_completed

  // FIX: quiz lives under lesson_quizzes[0].quiz, not quizzes[0]
  const quiz = currentLesson?.lesson_quizzes?.[0]?.quiz ?? null

  const onMarkComplete = async () => {
    setMarking(true)
    await handleMarkComplete(lessonId)
    setMarking(false)
  }

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <PageWrapper title="Lesson">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      </PageWrapper>
    )
  }

  // ── Error ────────────────────────────────────────────────
  if (error || !currentLesson) {
    return (
      <PageWrapper title="Lesson">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-gray-500">{error ?? 'Lesson not found.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-blockly-purple hover:underline"
          >
            Go back
          </button>
        </div>
      </PageWrapper>
    )
  }

  // ── Render ───────────────────────────────────────────────
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto flex flex-col gap-6">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors w-fit"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Classroom
        </button>

        {/* Lesson header card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-6 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <BookOpen className="w-4 h-4 text-blockly-purple shrink-0" />
                <span className="text-xs font-semibold text-blockly-purple uppercase tracking-wider">
                  Lesson
                </span>
                {currentLesson.has_quiz && (
                  <span className="text-xs bg-blockly-purple/10 text-blockly-purple font-medium px-2 py-0.5 rounded-full">
                    Includes Quiz
                  </span>
                )}
                {currentLesson.estimated_duration && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {currentLesson.estimated_duration} min
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-black text-gray-800 leading-snug">
                {currentLesson.title}
              </h1>
            </div>

            {isCompleted && (
              <div className="flex items-center gap-1.5 bg-green-50 text-green-600 text-xs font-semibold px-3 py-1.5 rounded-full shrink-0">
                <CheckCircle2 className="w-4 h-4" />
                Completed
              </div>
            )}
          </div>

          {/* Teacher */}
          {currentLesson.teacher && (
            <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
              <img
                src={currentLesson.teacher.avatar_url || '/default-avatar.png'}
                alt={currentLesson.teacher.username}
                className="w-7 h-7 rounded-full object-cover border border-gray-100"
              />
              <span className="text-xs text-gray-400">
                By{' '}
                <span className="font-semibold text-gray-600">
                  {currentLesson.teacher.username}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Lesson content — TipTap HTML */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-6">
          <div
            className="tiptap-content"
            dangerouslySetInnerHTML={{ __html: currentLesson.content }}
          />
        </div>

        {/* Attachments */}
        {currentLesson.lesson_attachments?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex flex-col gap-3">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
              <Paperclip className="w-4 h-4 text-gray-400" />
              Attachments
            </h3>
            <div className="flex flex-col gap-2">
              {currentLesson.lesson_attachments
                .sort((a, b) => a.order_index - b.order_index)
                .map((att) => (
                  <AttachmentItem key={att.id} attachment={att} />
                ))}
            </div>
          </div>
        )}

        {/* Quiz */}
        {quiz && (
          <QuizSection
            quiz={quiz}
            onSubmit={(answers) =>
              handleSubmitQuiz(quiz.id, answers, quiz.quiz_questions)
            }
            attempt={quizAttempt}
          />
        )}

        {/* Mark complete — only when no quiz and not yet done */}
        {!isCompleted && !quiz && (
          <button
            onClick={onMarkComplete}
            disabled={marking}
            className="flex items-center justify-center gap-2 w-full py-3 bg-blockly-purple text-white font-semibold rounded-xl hover:bg-blockly-purple/90 disabled:opacity-50 transition-colors"
          >
            {marking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Mark as Complete
              </>
            )}
          </button>
        )}

        {/* After passing quiz → offer mark complete */}
        {!isCompleted && quizAttempt && quizAttempt.score / quizAttempt.total_items >= 0.7 && (
          <button
            onClick={onMarkComplete}
            disabled={marking}
            className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            {marking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Mark Lesson as Complete
              </>
            )}
          </button>
        )}

      </div>
    </PageWrapper>
  )
}

// ── Attachment item ──────────────────────────────────────
function AttachmentItem({ attachment }) {
  const Icon =
    attachment.file_type === 'pdf'
      ? FileText
      : attachment.file_type === 'link'
        ? ExternalLink
        : Download

  return (
    <a
      href={attachment.file_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blockly-purple hover:bg-blockly-purple/5 transition-all group"
    >
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-blockly-purple/10 transition-colors">
        <Icon className="w-4 h-4 text-gray-500 group-hover:text-blockly-purple transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blockly-purple transition-colors">
          {attachment.file_name}
        </p>
        {attachment.file_size && (
          <p className="text-xs text-gray-400">{formatFileSize(attachment.file_size)}</p>
        )}
      </div>
    </a>
  )
}

function formatFileSize(bytes) {
  if (!bytes) return ''
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
}