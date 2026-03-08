import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { useQuizStore } from '../../../store/quizStore'
import { Plus, X, FileQuestion, Loader2 } from 'lucide-react'

export default function QuizLinker({ lessonId, linkedQuizzes, onQuizzesChange }) {
  const [showBrowser, setShowBrowser] = useState(false)
  const profile = useAuthStore((s) => s.profile)
  const { quizzes, loading, fetchTeacherQuizzes } = useQuizStore()

  useEffect(() => {
    if (profile?.id && showBrowser) {
      fetchTeacherQuizzes(profile.id)
    }
  }, [profile?.id, showBrowser])

  const handleLinkQuiz = (quiz) => {
    if (!linkedQuizzes.find((q) => q.id === quiz.id)) {
      onQuizzesChange([...linkedQuizzes, quiz])
    }
    setShowBrowser(false)
  }

  const handleUnlinkQuiz = (quizId) => {
    onQuizzesChange(linkedQuizzes.filter((q) => q.id !== quizId))
  }

  const availableQuizzes = quizzes.filter(
    (quiz) => !linkedQuizzes.find((lq) => lq.id === quiz.id)
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Attached Quizzes</h3>
        <button
          onClick={() => setShowBrowser(true)}
          className="btn flex items-center gap-2 px-4 py-2 bg-blockly-purple text-white rounded-lg text-sm font-semibold hover:bg-blockly-purple/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Attach Quiz
        </button>
      </div>

      {linkedQuizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 rounded-xl">
          <FileQuestion className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">No quizzes attached</p>
          <p className="text-xs text-gray-400 mt-1">Add quizzes to test student understanding</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {linkedQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blockly-purple transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                <FileQuestion className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{quiz.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {quiz.questions?.length || 0} questions · Passing score: {quiz.passing_score || 70}%
                </p>
              </div>
              <button
                onClick={() => handleUnlinkQuiz(quiz.id)}
                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quiz Browser Modal */}
      {showBrowser && (
        <QuizBrowserModal
          quizzes={availableQuizzes}
          loading={loading}
          onClose={() => setShowBrowser(false)}
          onSelect={handleLinkQuiz}
        />
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Quiz Browser Modal
// ──────────────────────────────────────────────────────────
function QuizBrowserModal({ quizzes, loading, onClose, onSelect }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-800">Select Quiz to Attach</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : quizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileQuestion className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No quizzes available</p>
              <p className="text-xs text-gray-400 mt-1">Create a quiz first to attach it to lessons</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {quizzes.map((quiz) => (
                <button
                  key={quiz.id}
                  onClick={() => onSelect(quiz)}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blockly-purple hover:bg-blockly-purple/5 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                    <FileQuestion className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{quiz.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {quiz.questions?.length || 0} questions · Passing: {quiz.passing_score || 70}%
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}