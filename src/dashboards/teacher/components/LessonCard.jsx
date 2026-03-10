import { Book, BookCopyIcon, Clock, Paperclip, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function LessonCard({ lesson, onEdit, onDelete, onHandOut }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const attachCount = lesson.lesson_attachments?.length ?? 0
  const quizCount = lesson.lesson_quizzes?.length ?? 0

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Published indicator strip */}
      <div className={`h-1 w-full ${lesson.is_published ? 'bg-emerald-400' : 'bg-slate-200'}`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                lesson.is_published
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {lesson.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-800 leading-snug truncate">
              {lesson.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1">{timeAgo(lesson.updated_at || lesson.created_at)}</p>
          </div>

          {/* Actions menu */}
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
                <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-lg border border-slate-200 w-44 py-1 text-sm">
                  <button
                    onClick={() => { setMenuOpen(false); onEdit(lesson) }}
                    className="flex gap-2 w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-700"
                  >
                    <Pencil size={16}/>Edit
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onHandOut(lesson) }}
                    className="flex gap-2 w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-700"
                  >
                    <BookCopyIcon size={16}/>Hand Out
                  </button>
                  <hr className="my-1 border-slate-100" />
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(lesson) }}
                    className="flex gap-2 w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                  >
                    <Trash2 size={16}/>Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content preview */}
        {lesson.content_markdown && (
          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {lesson.content_markdown.replace(/[#*`>_\-]/g, '').slice(0, 120)}…
          </p>
        )}

        {/* Meta badges */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {attachCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
              <Paperclip size={12} />{attachCount} file{attachCount !== 1 ? 's' : ''}
            </span>
          )}
          {quizCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-blockly-blue bg-blockly-blue/10 px-2 py-1 rounded-full">
              <Book size={12} />{quizCount} quiz
            </span>
          )}
          {lesson.estimated_duration && (
            <span className="flex items-center gap-1 text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
              <Clock size={12} />{lesson.estimated_duration} min
            </span>
          )}
        </div>

        {/* Hand out button */}
        <button
          onClick={() => onHandOut(lesson)}
          className="mt-3 w-full py-2 text-sm font-bold text-blockly-blue bg-blockly-blue/10 hover:bg-blockly-blue/20 rounded-lg transition-colors"
        >
          Hand Out
        </button>
      </div>
    </div>
  )
}