import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useAuthStore } from '../../../store/authStore'
import { useClassroomStore } from '../../../store/classroomStore'
import { useLessonStore } from '../../../store/lessonStore'
import { lessonService } from '../../../services/lesson.service'
import PageWrapper from '../../../components/layout/PageWrapper'
import {
  BookOpen, CheckCircle2, Clock, ChevronRight,
  Loader2, User, Lock
} from 'lucide-react'

export default function StudentClassroomDetail() {
  const { classroomId } = useParams()
  const navigate = useNavigate()
  const profile = useAuthStore((state) => state.profile)
  const { currentClassroom, fetchClassroomDetail } = useClassroomStore()
  const {
    lessons, loading,
    lessonProgress,
    fetchClassroomLessons,
    fetchProgress,
  } = useLessonStore()

  useEffect(() => {
    fetchClassroomDetail(classroomId)
    fetchClassroomLessons(classroomId)
    if (profile?.id) fetchProgress(profile.id, classroomId)
  }, [classroomId, profile?.id])

  const completedCount = Object.values(lessonProgress).filter((p) => p.is_completed).length

  return (
    <PageWrapper
      title={currentClassroom?.name ?? 'Classroom'}
      subtitle={currentClassroom?.description}
    >
      {/* Teacher info + progress bar */}
      {currentClassroom && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4">
          <div className="flex items-center gap-3">
            <img
              src={currentClassroom.teacher?.avatar_url || '/default-avatar.png'}
              alt=""
              className="w-10 h-10 rounded-full object-cover border border-gray-100"
            />
            <div>
              <p className="text-xs text-gray-400">Teacher</p>
              <p className="text-sm font-semibold text-gray-800">
                {currentClassroom.teacher?.username}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 sm:w-56">
            <div className="flex justify-between text-xs font-medium text-gray-500">
              <span>Progress</span>
              <span>{completedCount}/{lessons.length} lessons</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blockly-purple rounded-full transition-all duration-500"
                style={{ width: lessons.length ? `${(completedCount / lessons.length) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Lessons list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-50">
          <BookOpen className="w-5 h-5 text-gray-400" />
          <h2 className="font-bold text-gray-800">Lessons</h2>
          <span className="text-sm text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {lessons.length}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
          </div>
        ) : lessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <BookOpen className="w-8 h-8 text-gray-200" />
            <p className="text-sm text-gray-400">No lessons published yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {lessons.map((lesson, index) => {
              const progress = lessonProgress[lesson.id]
              const isCompleted = progress?.is_completed

              return (
                <button
                  key={lesson.id}
                  onClick={() => navigate(`/student/lessons/${lesson.id}`)}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left group"
                >
                  {/* Step number / completed */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold transition-colors
                    ${isCompleted
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400 group-hover:bg-blockly-purple/10 group-hover:text-blockly-purple'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate transition-colors
                      ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-800 group-hover:text-blockly-purple'}`}
                    >
                      {lesson.title}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {lesson.has_quiz && (
                        <span className="text-xs text-blockly-purple bg-blockly-purple/10 px-2 py-0.5 rounded-full font-medium">
                          Has Quiz
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-xs text-green-500 font-medium">Completed</span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blockly-purple shrink-0 transition-colors" />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}