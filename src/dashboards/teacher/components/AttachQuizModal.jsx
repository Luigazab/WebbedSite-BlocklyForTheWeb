import { useState, useEffect, useCallback } from 'react'
import { searchTeacherQuizzes } from '../../../services/quizService'
import { useNavigate } from 'react-router'

export default function AttachQuizModal({ teacherId, attachedQuizIds = [], onAttach, onClose }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await searchTeacherQuizzes(teacherId, search)
      setQuizzes(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [teacherId, search])

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [load])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Attach a Quiz</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-slate-100">
          <input
            type="text"
            placeholder="Search quizzes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50"
            autoFocus
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2">
          {loading && (
            <p className="text-sm text-slate-400 text-center py-6">Searching…</p>
          )}
          {!loading && quizzes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500 mb-3">No quizzes found.</p>
              <button
                onClick={() => { onClose(); navigate('/teacher/quizzes/create') }}
                className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                + Create a new quiz
              </button>
            </div>
          )}
          {quizzes.map((quiz) => {
            const isAttached = attachedQuizIds.includes(quiz.id)
            const questionCount = quiz.quiz_questions?.length ?? 0
            return (
              <div
                key={quiz.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                  isAttached
                    ? 'border-indigo-300 bg-indigo-50'
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                }`}
                onClick={() => !isAttached && onAttach(quiz)}
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{quiz.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {questionCount} question{questionCount !== 1 ? 's' : ''} · Passing: {quiz.passing_score ?? '—'}
                  </p>
                  {quiz.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{quiz.description}</p>
                  )}
                </div>
                {isAttached ? (
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                    Attached
                  </span>
                ) : (
                  <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 border border-indigo-200 rounded-lg hover:bg-indigo-50">
                    Attach
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center">
          <button
            onClick={() => { onClose(); navigate('/teacher/quizzes/create') }}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            + Create new quiz
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}