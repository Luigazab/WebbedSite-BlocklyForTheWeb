import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useLessonStore } from '../../../store/lessonStore'
import { useLesson } from '../../../hooks/useLesson'
import { useAuthStore } from '../../../store/authStore'
import PageWrapper from '../../../components/layout/PageWrapper'
import QuizSection from '../components/QuizSection'
import {
  ChevronLeft, CheckCircle2, BookOpen,
  Loader2, User, AlertCircle
} from 'lucide-react'

export default function LessonPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const profile = useAuthStore((state) => state.profile)
  const { currentLesson, loading, error, lessonProgress, quizAttempt, fetchLesson, clearCurrentLesson } = useLessonStore()
  const { handleMarkComplete, handleSubmitQuiz } = useLesson()
  const [marking, setMarking] = useState(false)

  useEffect(() => {
    fetchLesson(lessonId)
    return () => clearCurrentLesson()
  }, [lessonId])

  const isCompleted = lessonProgress[lessonId]?.is_completed
  const quiz = currentLesson?.quizzes?.[0] ?? null

  const onMarkComplete = async () => {
    setMarking(true)
    await handleMarkComplete(lessonId)
    setMarking(false)
  }

  if (loading) {
    return (
      <PageWrapper title="Lesson">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      </PageWrapper>
    )
  }

  if (error || !currentLesson) {
    return (
      <PageWrapper title="Lesson">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-gray-500">{error ?? 'Lesson not found.'}</p>
          <button onClick={() => navigate(-1)} className="text-sm text-blockly-purple hover:underline">
            Go back
          </button>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors w-fit"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Classroom
        </button>

        {/* Lesson header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-6 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-blockly-purple" />
                <span className="text-xs font-semibold text-blockly-purple uppercase tracking-wider">
                  Lesson
                </span>
                {currentLesson.has_quiz && (
                  <span className="text-xs bg-blockly-purple/10 text-blockly-purple font-medium px-2 py-0.5 rounded-full">
                    Includes Quiz
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-black text-gray-800">{currentLesson.title}</h1>
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
            <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
              <img
                src={currentLesson.teacher.avatar_url || '/default-avatar.png'}
                alt=""
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-xs text-gray-400">By {currentLesson.teacher.username}</span>
            </div>
          )}
        </div>

        {/* Lesson content */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-6">
          <div
            className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-gray-800 prose-p:text-gray-600 prose-a:text-blockly-purple"
            dangerouslySetInnerHTML={{ __html: currentLesson.content }}
          />
        </div>

        {/* Quiz section — only if lesson has a quiz */}
        {quiz && (
          <QuizSection
            quiz={quiz}
            onSubmit={(answers) =>
              handleSubmitQuiz(quiz.id, answers, quiz.quiz_questions)
            }
            attempt={quizAttempt}
          />
        )}

        {/* Mark complete button — show if not done and no quiz pending */}
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

        {/* If quiz was just submitted and passed, offer to mark complete */}
        {!isCompleted && quizAttempt && quizAttempt.score / quizAttempt.total_items >= 0.7 && (
          <button
            onClick={onMarkComplete}
            disabled={marking}
            className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            {marking ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <><CheckCircle2 className="w-4 h-4" />Mark Lesson as Complete</>
            )}
          </button>
        )}
      </div>
    </PageWrapper>
  )
}