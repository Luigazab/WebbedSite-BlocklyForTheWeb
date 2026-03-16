import { BookOpen, Clock, Edit2, LayoutList, Trash2, Zap } from 'lucide-react'

const DIFFICULTY_META = {
  beginner:     { label: 'Beginner',     color: 'bg-emerald-100 text-emerald-700' },
  intermediate: { label: 'Intermediate', color: 'bg-amber-100  text-amber-700'   },
  advanced:     { label: 'Advanced',     color: 'bg-red-100    text-red-700'      },
}

export default function TutorialCard({ tutorial, onEdit, onDelete }) {
  const stepCount = tutorial.tutorial_steps?.length ?? 0
  const diff = DIFFICULTY_META[tutorial.difficulty_level] ?? DIFFICULTY_META.beginner

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
      {/* Colored top accent */}
      <div className="h-1.5 w-full bg-linear-to-r from-blockly-blue to-indigo-400" />

      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Badges row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${diff.color}`}>
            {diff.label}
          </span>
          {tutorial.is_published ? (
            <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-green-100 text-green-700">
              Published
            </span>
          ) : (
            <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-slate-100 text-slate-500">
              Draft
            </span>
          )}
          {tutorial.category && tutorial.category !== 'general' && (
            <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-indigo-50 text-indigo-600">
              {tutorial.category}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-black text-slate-800 leading-snug line-clamp-2">
          {tutorial.title || 'Untitled Tutorial'}
        </h3>

        {/* Description */}
        {tutorial.description && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {tutorial.description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-4 mt-auto pt-1 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <LayoutList size={12} />
            {stepCount} step{stepCount !== 1 ? 's' : ''}
          </span>
          {tutorial.estimated_time_minutes && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {tutorial.estimated_time_minutes} min
            </span>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-end gap-2 bg-slate-50">
        <button
          onClick={() => onEdit(tutorial)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          <Edit2 size={13} /> Edit
        </button>
        <button
          onClick={() => onDelete(tutorial)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  )
}