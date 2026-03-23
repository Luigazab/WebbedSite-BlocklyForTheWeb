import { Calendar, CheckCircle, CircleQuestionMarkIcon, Clock, Edit2, FileEdit, LayoutList, Medal, Trash2 } from 'lucide-react'
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
    <div className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
      <div className="h-1.5 bg-linear-to-r from-blockly-blue to-indigo-400 w-full" />

      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Stats row */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="px-2.5 py-0.5 flex gap-2 items-center text-[11px] font-bold rounded-full bg-slate-100 text-slate-500">
            <CircleQuestionMarkIcon size={12} /> {questionCount} question{questionCount !== 1 ? 's' : ''}
          </span>
          {quiz.passing_score != null && (
            <span className="px-2.5 py-0.5 flex gap-2 items-center text-[11px] font-bold rounded-full bg-green-100 text-green-700">
              <CheckCircle size={12}/> Pass: {quiz.passing_score}
            </span>
          )}
          {badge && (
            <span className="px-2.5 py-0.5 flex gap-2 items-center text-[11px] font-semibold rounded-full bg-indigo-50 text-indigo-600">
              <Medal size={13}/> Badge
            </span>
          )}
        </div>

        <h3 className="text-sm font-black text-slate-800 leading-snug line-clamp-2">{quiz.title}</h3>

        {quiz.description && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{quiz.description || 'No description'}</p>
        )}

        <div className="flex items-center gap-4 mt-auto pt-1 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {timeAgo(quiz.created_at)}
          </span>
          {quiz.time_limit && (
            <span className="flex items-center gap-1">
              <Clock size={12}/> {quiz.time_limit} min
            </span>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-end gap-2 bg-slate-50">
        <button
          onClick={() => onEdit(quiz)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          <Edit2 size={13} /> Edit
        </button>
        <button
          onClick={() =>  onDelete(quiz)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  )
}