import { useState } from 'react'
import {
  BookOpen, HelpCircle, Eye, EyeOff,
  Pencil, Trash2, ChevronRight, Clock
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function LessonCard({ lesson, onEdit, onDelete, onTogglePublish }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = (e) => {
    e.stopPropagation()
    if (confirmDelete) {
      onDelete()
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <div
      onClick={onEdit}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blockly-purple/20 transition-all cursor-pointer p-5 flex flex-col gap-4"
    >
      {/* Status badges */}
      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
          ${lesson.is_published
            ? 'bg-green-100 text-green-600'
            : 'bg-orange-100 text-orange-500'
          }`}
        >
          {lesson.is_published ? 'Published' : 'Draft'}
        </span>
        {lesson.has_quiz && (
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blockly-purple/10 text-blockly-purple">
            <HelpCircle className="w-3 h-3" />
            Quiz
          </span>
        )}
      </div>

      {/* Title */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-gray-800 group-hover:text-blockly-purple transition-colors leading-snug line-clamp-2">
          {lesson.title}
        </h3>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blockly-purple shrink-0 mt-0.5 transition-colors" />
      </div>

      {/* Updated at */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <Clock className="w-3.5 h-3.5" />
        Updated {formatDistanceToNow(new Date(lesson.updated_at ?? lesson.created_at), { addSuffix: true })}
      </div>

      {/* Actions */}
      <div
        className="flex items-center gap-1 pt-3 border-t border-gray-50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Publish toggle */}
        <button
          onClick={onTogglePublish}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
            ${lesson.is_published
              ? 'text-orange-500 hover:bg-orange-50'
              : 'text-green-600 hover:bg-green-50'
            }`}
        >
          {lesson.is_published ? (
            <><EyeOff className="w-3.5 h-3.5" />Unpublish</>
          ) : (
            <><Eye className="w-3.5 h-3.5" />Publish</>
          )}
        </button>

        <div className="flex-1" />

        {/* Edit */}
        <button
          onClick={onEdit}
          className="p-2 rounded-lg text-gray-400 hover:text-blockly-purple hover:bg-blockly-purple/10 transition-colors"
          title="Edit lesson"
        >
          <Pencil className="w-4 h-4" />
        </button>

        {/* Delete */}
        <button
          onClick={handleDelete}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors
            ${confirmDelete
              ? 'bg-red-500 text-white'
              : 'text-gray-400 hover:text-red-400 hover:bg-red-50'
            }`}
          title="Delete lesson"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {confirmDelete ? 'Confirm?' : ''}
        </button>
      </div>
    </div>
  )
}