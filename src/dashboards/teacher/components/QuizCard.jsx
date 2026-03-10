import { CheckCircle, CircleQuestionMarkIcon, Clock, FileEdit, Medal, Trash2 } from 'lucide-react'
import { useState } from 'react'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function QuizCard({ quiz, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const questionCount = quiz.quiz_questions?.length ?? 0
  const badge = quiz.badges?.[0] ?? null

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="h-1 bg-blockly-green w-full" />

      <div className="p-5 flex flex-col justify-between space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-800 leading-snug">{quiz.title}</h3>
            {quiz.description && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{quiz.description}</p>
            )}
            <p className="text-xs text-slate-400 mt-1">{timeAgo(quiz.created_at)}</p>
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              ⋮
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-lg border border-slate-200 w-40 py-1 text-sm">
                  <button
                    onClick={() => { setMenuOpen(false); onEdit(quiz) }}
                    className="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-slate-50 text-slate-700"
                  >
                    <FileEdit size={15}/> Edit
                  </button>
                  <hr className="my-1 border-slate-100" />
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(quiz) }}
                    className="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-red-50 text-red-600"
                  >
                    <Trash2 size={15}/> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
            <CircleQuestionMarkIcon size={15} color='red' /> {questionCount} question{questionCount !== 1 ? 's' : ''}
          </span>
          {quiz.passing_score != null && (
            <span className="flex items-center gap-1 text-xs text-blockly-green bg-emerald-100 px-2 py-1 rounded-full">
              <CheckCircle size={15}/> Pass: {quiz.passing_score}
            </span>
          )}
          {quiz.time_limit && (
            <span className="flex items-center gap-1 text-xs text-blockly-red bg-orange-100 px-2 py-1 rounded-full">
              <Clock size={15}/> {quiz.time_limit} min
            </span>
          )}
          {badge && (
            <span className="flex items-center gap-1 text-xs text-blockly-purple bg-purple-100 px-2 py-1 rounded-full">
              <Medal size={15}/> Badge
            </span>
          )}
        </div>

        <button
          onClick={() => onEdit(quiz)}
          className="flex items-center gap-2 justify-center w-full py-2 text-sm font-bold text-blockly-blue bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
        >
          Edit Quiz
        </button>
      </div>
    </div>
  )
}