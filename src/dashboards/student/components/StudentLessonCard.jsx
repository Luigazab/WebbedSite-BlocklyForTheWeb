import { useNavigate } from 'react-router'
import {
  BookOpen, Clock, Award, ChevronRight,
  CheckCircle2, AlertCircle, ClipboardList,
  Paperclip, FlaskConical,
} from 'lucide-react'
import { format, differenceInDays, isPast } from 'date-fns'

function DueBadge({ dueDate }) {
  if (!dueDate) return null
  const due = new Date(dueDate)
  const days = differenceInDays(due, new Date())
  const past = isPast(due)

  if (past) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
        <AlertCircle className="w-3 h-3" />
        Overdue · {format(due, 'MMM d')}
      </span>
    )
  }

  const urgency = days <= 1
    ? 'text-orange-600 bg-orange-50'
    : days <= 3
    ? 'text-yellow-700 bg-yellow-50'
    : 'text-gray-500 bg-gray-100'

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${urgency} px-2 py-0.5 rounded-full`}>
      <Clock className="w-3 h-3" />
      {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${format(due, 'MMM d')}`}
    </span>
  )
}

function StatusChip({ status }) {
  if (status === 'completed') {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Done
      </span>
    )
  }
  if (status === 'missing') {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-red-500">
        <AlertCircle className="w-3.5 h-3.5" />
        Missing
      </span>
    )
  }
  return null
}

export default function StudentLessonCard({ assignment, classroomId }) {
  const navigate = useNavigate()
  const { lesson, due_date, status } = assignment

  if (!lesson) return null

  const quiz = lesson.quizzes?.[0]?.quiz ?? null
  const badge = quiz?.badges?.[0] ?? null
  const attachCount = lesson.attachments?.length ?? 0
  const isDimmed = status === 'missing' || status === 'completed'
  const isCompleted = status === 'completed'
  const isMissing = status === 'missing'

  // Strip HTML for content preview
  const contentPreview = lesson.content
    ? lesson.content.replace(/<[^>]+>/g, '').slice(0, 100).trim()
    : ''

  return (
    <button
      onClick={() =>
        navigate(`lessons/${lesson.id}`, {
          state: { dueDate: due_date, classroomId },
        })
      }
      className={`
        group w-full text-left bg-white rounded-2xl border shadow-sm
        hover:shadow-md transition-all duration-200
        ${isCompleted ? 'border-green-100' : isMissing ? 'border-red-100 opacity-70' : 'border-gray-100 hover:border-blockly-purple/30'}
      `}
    >
      {/* Top accent bar */}
      <div className={`h-1 w-full rounded-t-2xl ${
        isCompleted ? 'bg-green-400' : isMissing ? 'bg-red-300' : 'bg-blockly-purple/60 group-hover:bg-blockly-purple transition-colors'
      }`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
            isCompleted ? 'bg-green-50' : 'bg-blockly-purple/8 bg-purple-50'
          }`}>
            <BookOpen className={`w-4 h-4 ${isCompleted ? 'text-green-500' : 'text-blockly-purple'}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <StatusChip status={status} />
              {quiz && (
                <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">
                  Quiz
                </span>
              )}
              {lesson.estimated_duration && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {lesson.estimated_duration}m
                </span>
              )}
            </div>
            <h3 className={`font-bold leading-snug ${isDimmed ? 'text-gray-500' : 'text-gray-800'}`}>
              {lesson.title}
            </h3>
          </div>

          <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-2 group-hover:translate-x-0.5 transition-transform" />
        </div>

        {/* Content preview */}
        {contentPreview && (
          <p className="text-xs text-gray-400 mt-2 ml-12 line-clamp-2 leading-relaxed">
            {contentPreview}
          </p>
        )}

        {/* Footer: due date, badge, attachments */}
        <div className="flex items-center justify-between mt-3 ml-12">
          <div className="flex items-center gap-2 flex-wrap">
            <DueBadge dueDate={due_date} />
            {attachCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Paperclip className="w-3 h-3" />
                {attachCount}
              </span>
            )}
          </div>

          {/* Badge preview */}
          {badge && (
            <div className="flex items-center gap-1.5" title={`Badge: ${badge.title}`}>
              {badge.icon_url ? (
                <img src={badge.icon_url} alt={badge.title} className="w-5 h-5 object-contain" />
              ) : (
                <Award className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-xs text-gray-400 font-medium hidden sm:block">{badge.title}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}