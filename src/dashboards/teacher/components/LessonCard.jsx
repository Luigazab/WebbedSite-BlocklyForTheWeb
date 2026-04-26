import { Book, BookCopyIcon, Calendar, Clock, Edit2, Paperclip, Pencil, Trash2 } from 'lucide-react'

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
  const attachCount = lesson.lesson_attachments?.length ?? 0
  const quizCount = lesson.lesson_quizzes?.length ?? 0

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
      {/* Published indicator strip */}
      <div className={`h-1.5 w-full ${lesson.is_published ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
        
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Stats row */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
            lesson.is_published
              ? 'bg-green-100 text-green-700'
              : 'bg-slate-100 text-slate-500'
          }`}>
            {lesson.is_published ? 'Published' : 'Draft'}
          </span>
          {attachCount > 0 && (
            <span className="px-2.5 py-0.5 flex gap-2 items-center text-[11px] font-bold rounded-full text-slate-500 bg-slate-100">
              <Paperclip size={12} />{attachCount} file{attachCount !== 1 ? 's' : ''}
            </span>
          )}
          {quizCount > 0 && (
            <span className="px-2.5 py-0.5 flex gap-2 items-center text-[11px] font-bold rounded-full text-indigo-600 bg-indigo-50">
              <Book size={12} />{quizCount} quiz
            </span>
          )}
        </div>
        <h3 className="text-sm font-black text-slate-800 leading-snug line-clamp-2 truncate">
          {lesson.title}
        </h3>
        {/* Content preview */}
        {lesson.content_markdown && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {lesson.content_markdown.replace(/[#*`>_\-]/g, '').slice(0, 120)}…
          </p>
        )}
        {/* Meta badges */}
        <div className="flex items-center gap-4 mt-auto pt-1 text-xs text-slate-400 font-medium">
            <p className="flex items-center gap-1"><Calendar size={12} /> {timeAgo(lesson.updated_at || lesson.created_at)}</p>
          {lesson.estimated_duration && (
            <span className="flex items-center gap-1 ">
              <Clock size={12} />{lesson.estimated_duration} min
            </span>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className='border-t border-slate-100 px-5 py-3 flex items-center justify-end gap-2 bg-slate-50'>
        <button
          onClick={() => onHandOut(lesson)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
        >
          <BookCopyIcon size={13}/> Hand Out
        </button>
        <button
          onClick={() => onEdit(lesson)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          <Edit2 size={13} /> Edit
        </button>
        <button
          onClick={() => onDelete(lesson)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  )
}