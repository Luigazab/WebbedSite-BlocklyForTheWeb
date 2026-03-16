import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '../../../store/authStore'
import { useLessonStore } from '../../../store/lessonStore'
import {
  Loader2, BookOpen, ClipboardList, ArrowRight,
  Clock, CheckCircle2, AlertCircle,
} from 'lucide-react'
import { format, differenceInDays, isPast } from 'date-fns'

const STATUS_CONFIG = {
  completed: {
    label: 'Completed',
    textClass: 'text-green-600',
    bgClass: 'bg-green-50',
    icon: CheckCircle2,
  },
  missing: {
    label: 'Missing',
    textClass: 'text-red-600',
    bgClass: 'bg-red-50',
    icon: AlertCircle,
  },
  assigned: {
    label: 'Assigned',
    textClass: 'text-blue-600',
    bgClass: 'bg-blue-50',
    icon: ClipboardList,
  },
}

const ACCENT_COLORS = [
  'border-l-orange-400',
  'border-l-blue-400',
  'border-l-green-400',
  'border-l-purple-400',
  'border-l-pink-400',
  'border-l-yellow-400',
]

function DaysLeft({ dueDate }) {
  const days = differenceInDays(new Date(dueDate), new Date())
  if (isPast(new Date(dueDate))) {
    return <span className="text-xs text-red-500 font-semibold">Overdue</span>
  }
  if (days === 0) return <span className="text-xs text-orange-500 font-semibold">Due today</span>
  if (days === 1) return <span className="text-xs text-orange-400 font-semibold">Due tomorrow</span>
  return <span className="text-xs text-gray-400">{days} days left</span>
}

export default function AssignmentsTab() {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const { lessonAssignments, loading, fetchStudentLessonAssignments } = useLessonStore()

  useEffect(() => {
    if (profile?.id) fetchStudentLessonAssignments(profile.id)
  }, [profile?.id])

  // Group by classroom
  const grouped = lessonAssignments.reduce((acc, la) => {
    const cid = la.classroom?.id
    if (!cid) return acc
    if (!acc[cid]) acc[cid] = { classroom: la.classroom, items: [] }
    acc[cid].items.push(la)
    return acc
  }, {})

  const groups = Object.values(grouped)

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
      </div>
    )
  }

  if (!groups.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <ClipboardList className="w-8 h-8 text-gray-300" />
        <p className="text-sm text-gray-400">No assignments with due dates yet</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {groups.map(({ classroom, items }, gIdx) => {
        const accentClass = ACCENT_COLORS[gIdx % ACCENT_COLORS.length]

        return (
          <div key={classroom.id} className="flex flex-col gap-3">
            {/* Classroom header */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full border-2 ${accentClass.replace('border-l-', 'border-')}`} />
              <h3 className="text-sm font-bold text-gray-700">{classroom.name}</h3>
              <span className="text-xs text-gray-400">({items.length} assignment{items.length !== 1 ? 's' : ''})</span>
              {classroom.is_active === false && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Archived</span>
              )}
            </div>

            {/* Assignment cards */}
            <div className="flex flex-col gap-2">
              {items.map((la) => {
                const st = STATUS_CONFIG[la.status] ?? STATUS_CONFIG.assigned
                const StatusIcon = st.icon
                const isDimmed = la.status === 'missing' || la.status === 'completed'
                const hasQuiz = (la.lesson?.lesson_quizzes?.length ?? 0) > 0

                return (
                  <button
                    key={la.id}
                    onClick={() =>
                      navigate(`${classroom.id}/lessons/${la.lesson_id}`, {
                        state: { dueDate: la.due_date, classroomId: classroom.id },
                      })
                    }
                    className={`
                      w-full text-left flex items-center gap-4 px-5 py-4
                      bg-white rounded-xl border border-gray-100 shadow-sm
                      border-l-4 ${accentClass}
                      hover:shadow-md transition-all duration-150
                      ${isDimmed ? 'opacity-60' : ''}
                    `}
                  >
                    <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isDimmed ? 'text-gray-500' : 'text-gray-800'}`}>
                        {la.lesson?.title ?? la.title}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {la.due_date && <DaysLeft dueDate={la.due_date} />}
                        {la.due_date && (
                          <span className="text-xs text-gray-400">
                            {format(new Date(la.due_date), 'MMM d')}
                          </span>
                        )}
                        {hasQuiz && (
                          <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">
                            Quiz
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`flex items-center gap-1 text-xs font-semibold ${st.textClass}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {st.label}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}