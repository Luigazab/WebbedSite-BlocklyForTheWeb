import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useAuthStore } from '../../../store/authStore'
import { useClassroomStore } from '../../../store/classroomStore'
import { useLessonStore } from '../../../store/lessonStore'
import { useClassroom } from '../../../hooks/useClassroom'
import PageWrapper from '../../../components/layout/PageWrapper'
import StudentLessonCard from '../components/StudentLessonCard'
import {
  BookOpen, HelpCircle, FlaskConical, BarChart2, Users,
  Loader2, Award, LogOut, CheckCircle2, Clock, Star,
  Trophy, User,
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'

const TABS = [
  { key: 'lessons',   label: 'Lessons',   icon: BookOpen    },
  { key: 'quizzes',   label: 'Quizzes',   icon: HelpCircle  },
  { key: 'activities',label: 'Activities',icon: FlaskConical },
  { key: 'progress',  label: 'Progress',  icon: BarChart2   },
  { key: 'members',   label: 'Members',   icon: Users       },
]

// ── Progress report helpers ───────────────────────────────────────────────────

function BadgeGrid({ earned, all }) {
  // merge: for each classroom badge, check if earned
  const earnedIds = new Set(earned.map((a) => a.badge?.id).filter(Boolean))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-6 gap-4">
      {all.map((badge) => {
        const isEarned = earnedIds.has(badge.id)
        const achievement = earned.find((a) => a.badge?.id === badge.id)

        return (
          <div
            key={badge.id}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
              isEarned
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-gray-50 border-gray-100 opacity-40 grayscale'
            }`}
            title={isEarned ? `Earned ${achievement ? format(new Date(achievement.earned_at), 'MMM d, yyyy') : ''}` : 'Not yet earned'}
          >
            {badge.icon_url ? (
              <img src={badge.icon_url} alt={badge.title} className="w-10 h-10 object-contain" />
            ) : (
              <Award className={`w-10 h-10 ${isEarned ? 'text-yellow-500' : 'text-gray-300'}`} />
            )}
            <span className="text-xs font-medium text-center text-gray-600 leading-tight line-clamp-2">
              {badge.title}
            </span>
            {isEarned && (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 -mt-1" />
            )}
          </div>
        )
      })}
      {all.length === 0 && (
        <p className="col-span-full text-sm text-gray-400 text-center py-6">
          No badges available for this classroom yet.
        </p>
      )}
    </div>
  )
}

function ScoreRow({ assignment }) {
  const { lesson, due_date, status, quizAttempt, progress } = assignment
  if (!lesson) return null
  const quiz = lesson.quizzes?.[0]?.quiz ?? null

  return (
    <div className={`flex items-center gap-4 px-4 py-3 rounded-xl border ${
      status === 'completed' ? 'bg-green-50 border-green-100' :
      status === 'missing'   ? 'bg-red-50 border-red-100 opacity-70' :
                               'bg-white border-gray-100'
    }`}>
      <BookOpen className={`w-4 h-4 shrink-0 ${
        status === 'completed' ? 'text-green-500' :
        status === 'missing'   ? 'text-red-400'   : 'text-gray-400'
      }`} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{lesson.title}</p>
        {due_date && (
          <p className="text-xs text-gray-400">{format(new Date(due_date), 'MMM d, yyyy')}</p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0 text-right">
        {/* Lesson progress */}
        {progress && (
          <div className="text-xs text-gray-500">
            <span className="font-semibold text-blockly-purple">{progress.progress_percentage ?? 0}%</span>
            <span className="ml-1">read</span>
          </div>
        )}

        {/* Quiz score */}
        {quizAttempt && quiz && (
          <div className="flex items-center gap-1 text-xs">
            <Star className="w-3.5 h-3.5 text-yellow-400" />
            <span className="font-bold text-gray-700">
              {quizAttempt.score}/{quizAttempt.total_items}
            </span>
            {quiz.passing_score != null && (
              <span className={`font-semibold ${
                (quizAttempt.score / quizAttempt.total_items * 100) >= quiz.passing_score
                  ? 'text-green-600' : 'text-red-500'
              }`}>
                ({Math.round(quizAttempt.score / quizAttempt.total_items * 100)}%)
              </span>
            )}
          </div>
        )}

        {status === 'missing' && (
          <span className="text-xs font-bold text-red-500">Missing</span>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function StudentClassroomDetail() {
  const { classroomId } = useParams()
  const navigate = useNavigate()
  const profile = useAuthStore((state) => state.profile)
  const { currentClassroom, loading: classroomLoading, fetchClassroomDetail } = useClassroomStore()
  const {
    classroomAssignments,
    classroomMembers,
    classroomBadges,
    achievements,
    loading,
    fetchClassroomLessonsForStudent,
    fetchClassroomMembers,
    fetchClassroomBadges,
    fetchStudentAchievements,
  } = useLessonStore()
  const { handleLeaveClassroom } = useClassroom()

  const [activeTab, setActiveTab] = useState('lessons')
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    fetchClassroomDetail(classroomId)
    if (profile?.id) {
      fetchClassroomLessonsForStudent(classroomId, profile.id)
      fetchStudentAchievements(profile.id)
    }
    fetchClassroomBadges(classroomId)
    fetchClassroomMembers(classroomId)
  }, [classroomId, profile?.id])

  // Derived lists
  const allLessons   = classroomAssignments.filter((la) => la.lesson)
  const quizOnly     = allLessons.filter((la) => (la.lesson?.quizzes?.length ?? 0) > 0)
  const activityOnly = allLessons.filter((la) => la.assignment_type === 'learn_topic')

  const completedLessons = allLessons.filter((la) => la.status === 'completed').length

  const onLeave = async () => {
    if (!window.confirm('Leave this classroom?')) return
    setLeaving(true)
    try {
      await handleLeaveClassroom(classroomId, currentClassroom?.name)
      navigate('/classrooms')
    } finally {
      setLeaving(false)
    }
  }

  // Render list based on active tab
  const listToShow = activeTab === 'quizzes' ? quizOnly
    : activeTab === 'activities' ? activityOnly
    : allLessons

  const teacher = currentClassroom?.teacher

  return (
    <PageWrapper
      title={currentClassroom?.name ?? 'Classroom'}
      subtitle={currentClassroom?.description}
    >
      {/* Classroom banner */}
      {currentClassroom && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 mb-2">
          <div className="flex items-center gap-3">
            <img
              src={teacher?.avatar_url || '/default-avatar.png'}
              alt=""
              className="w-10 h-10 rounded-full object-cover border border-gray-100"
            />
            <div>
              <p className="text-xs text-gray-400">Teacher</p>
              <p className="text-sm font-semibold text-gray-800">{teacher?.username}</p>
            </div>
          </div>

          <div className="flex flex-col gap-1 sm:w-52">
            <div className="flex justify-between text-xs font-medium text-gray-500">
              <span>Lessons done</span>
              <span>{completedLessons}/{allLessons.length}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blockly-purple rounded-full transition-all duration-500"
                style={{ width: allLessons.length ? `${(completedLessons / allLessons.length) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-5 overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors relative
              ${activeTab === key ? 'text-blockly-purple' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            {activeTab === key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blockly-purple" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {(loading || classroomLoading) && !classroomAssignments.length ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      ) : (
        <>
          {/* ── Lessons / Quizzes / Activities ────────────────── */}
          {['lessons', 'quizzes', 'activities'].includes(activeTab) && (
            <div className="flex flex-col gap-3">
              {listToShow.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                  <BookOpen className="w-8 h-8 text-gray-200" />
                  <p className="text-sm text-gray-400">
                    {activeTab === 'quizzes'    ? 'No quizzes assigned yet'    :
                     activeTab === 'activities' ? 'No activities assigned yet' :
                                                  'No lessons assigned yet'}
                  </p>
                </div>
              ) : (
                listToShow.map((la) => (
                  <StudentLessonCard
                    key={la.id}
                    assignment={la}
                    classroomId={classroomId}
                  />
                ))
              )}
            </div>
          )}

          {/* ── Progress Report ───────────────────────────────── */}
          {activeTab === 'progress' && (
            <div className="flex flex-col gap-8">
              {/* Badges */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-bold text-gray-800">Badges</h3>
                  <span className="text-xs text-gray-400">
                    {achievements.length} earned
                  </span>
                </div>
                <BadgeGrid
                  earned={achievements}
                  all={classroomBadges}
                />
              </div>

              {/* Scores */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <BarChart2 className="w-5 h-5 text-blockly-purple" />
                  <h3 className="font-bold text-gray-800">Lesson Scores</h3>
                </div>
                {allLessons.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No lessons yet</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {allLessons.map((la) => (
                      <ScoreRow key={la.id} assignment={la} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Members ───────────────────────────────────────── */}
          {activeTab === 'members' && (
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Users className="w-5 h-5 text-gray-500" />
                  <h3 className="font-bold text-gray-800">
                    Classmates
                    <span className="ml-2 text-sm font-normal text-gray-400">
                      ({classroomMembers.length} student{classroomMembers.length !== 1 ? 's' : ''})
                    </span>
                  </h3>
                </div>

                {classroomMembers.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No other students yet</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {classroomMembers.map((enrollment) => {
                      const student = enrollment.student
                      if (!student) return null
                      const isMe = student.id === profile?.id

                      return (
                        <div
                          key={enrollment.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border ${
                            isMe ? 'border-blockly-purple/30 bg-blockly-purple/5' : 'border-gray-100 bg-gray-50'
                          }`}
                        >
                          <img
                            src={student.avatar_url || '/default-avatar.png'}
                            alt={student.username}
                            className="w-9 h-9 rounded-full object-cover border border-gray-200"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {student.username}
                              {isMe && <span className="ml-1.5 text-xs text-blockly-purple">(you)</span>}
                            </p>
                            <p className="text-xs text-gray-400">
                              Joined {format(new Date(enrollment.enrolled_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Leave classroom */}
              <div className="flex justify-center pt-2 pb-8">
                <button
                  onClick={onLeave}
                  disabled={leaving}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors border border-red-100 disabled:opacity-50"
                >
                  {leaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  Leave Classroom
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </PageWrapper>
  )
}