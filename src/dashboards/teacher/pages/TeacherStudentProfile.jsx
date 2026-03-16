import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useAuthStore } from '../../../store/authStore'
import { useLessonStore } from '../../../store/lessonStore'
import { lessonService } from '../../../services/lesson.service'
import { supabase } from '../../../supabaseClient'
import PageWrapper from '../../../components/layout/PageWrapper'
import {
  ArrowLeft, BookOpen, HelpCircle, Award, Clock,
  Target, CheckCircle2, AlertCircle, Trophy, Star,
  ChevronDown, ChevronUp, Loader2, BarChart2,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'

const C = {
  purple: '#7c3aed', purpleL: '#ddd6fe',
  green:  '#22c55e', greenL:  '#dcfce7',
  amber:  '#f59e0b', amberL:  '#fef3c7',
  sky:    '#0ea5e9', skyL:    '#e0f2fe',
  red:    '#ef4444',
}

function StatCard({ icon: Icon, label, value, color = C.purple, bg = C.purpleL }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div>
        <p className="text-xl font-black text-gray-900 leading-none">{value}</p>
        <p className="text-xs font-semibold text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

function QuizAccordion({ quizHistory, achievements }) {
  const [open, setOpen] = useState(null)
  const earnedIds = new Set(achievements.map((a) => a.badge?.id).filter(Boolean))

  if (!quizHistory.length) return <p className="text-sm text-gray-400 text-center py-6">No quiz data yet</p>

  return (
    <div className="flex flex-col gap-2">
      {quizHistory.map((quiz) => {
        const isOpen  = open === quiz.quizId
        const passed  = quiz.passing_score !== null && quiz.bestScore !== null
          ? quiz.bestScore >= Math.round((quiz.passing_score / quiz.questionCount) * 100)
          : null

        return (
          <div key={quiz.quizId} className="border border-gray-100 rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpen(isOpen ? null : quiz.quizId)}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${passed === true ? 'bg-green-100' : passed === false ? 'bg-red-100' : 'bg-gray-100'}`}>
                  <Trophy className={`w-4 h-4 ${passed === true ? 'text-green-600' : passed === false ? 'text-red-500' : 'text-gray-400'}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{quiz.title}</p>
                  <p className="text-xs text-gray-400">
                    {quiz.attemptCount} attempt{quiz.attemptCount !== 1 ? 's' : ''}
                    {quiz.passing_score !== null && ` · Pass: ${quiz.passing_score}/${quiz.questionCount}`}
                    {quiz.badge && (earnedIds.has(quiz.badge.id)
                      ? <span className="ml-2 text-yellow-600 font-semibold">🏅 Earned</span>
                      : <span className="ml-2 text-gray-400">🏅 Not yet</span>)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {quiz.bestScore !== null && (
                  <span className={`text-sm font-black px-3 py-1 rounded-full ${passed === true ? 'bg-green-100 text-green-700' : passed === false ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                    {quiz.bestScore}%
                  </span>
                )}
                {quiz.attemptCount === 0
                  ? <span className="text-xs text-gray-400">No attempts</span>
                  : isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-gray-50 divide-y divide-gray-50">
                {quiz.attempts.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-gray-400 bg-gray-50">No attempts yet.</p>
                ) : quiz.attempts.map((attempt, i) => {
                  const aPassed = quiz.passing_score !== null
                    ? attempt.score >= Math.round((quiz.passing_score / quiz.questionCount) * 100)
                    : null
                  return (
                    <div key={attempt.id} className="flex items-center justify-between px-5 py-3 bg-gray-50/50">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-6">#{quiz.attempts.length - i}</span>
                        <div>
                          <p className="text-xs font-semibold text-gray-700">
                            {attempt.score}%
                            <span className={`ml-2 font-bold ${aPassed === true ? 'text-green-600' : aPassed === false ? 'text-red-500' : ''}`}>
                              {aPassed === true ? '✓ Pass' : aPassed === false ? '✗ Fail' : ''}
                            </span>
                          </p>
                          <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(attempt.completed_at), { addSuffix: true })}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">{format(new Date(attempt.completed_at), 'MMM d, yyyy')}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function TeacherStudentProfile() {
  const { classroomId, studentId } = useParams()
  const navigate = useNavigate()

  const [student,       setStudent]       = useState(null)
  const [assignments,   setAssignments]   = useState([])
  const [quizHistory,   setQuizHistory]   = useState([])
  const [achievements,  setAchievements]  = useState([])
  const [loading,       setLoading]       = useState(true)
  const [activeTab,     setActiveTab]     = useState('overview')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [profileRes, assignData, quizData, achData] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', studentId).single(),
          lessonService.getClassroomLessonsForStudent(classroomId, studentId),
          lessonService.getStudentQuizAttemptsForClassroom(studentId, classroomId),
          lessonService.getStudentAchievements(studentId),
        ])
        setStudent(profileRes.data)
        setAssignments(assignData)
        setQuizHistory(quizData)
        setAchievements(achData)
      } finally { setLoading(false) }
    }
    load()
  }, [classroomId, studentId])

  if (loading) {
    return (
      <PageWrapper title="Student Profile">
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      </PageWrapper>
    )
  }

  if (!student) {
    return (
      <PageWrapper title="Student not found">
        <button onClick={() => navigate(-1)} className="text-sm text-blockly-purple hover:underline">← Back</button>
      </PageWrapper>
    )
  }

  const allLessons   = assignments.filter((la) => la.lesson)
  const total        = allLessons.length
  const completed    = allLessons.filter((la) => la.status === 'completed').length
  const missing      = allLessons.filter((la) => la.status === 'missing').length
  const totalTime    = allLessons.reduce((s, la) => s + (la.lesson?.progress?.time_spent ?? 0), 0)
  const quizPassed   = quizHistory.filter((q) => {
    if (q.bestScore === null || q.passing_score === null) return false
    return q.bestScore >= Math.round((q.passing_score / q.questionCount) * 100)
  }).length
  const earnedIds    = new Set(achievements.map((a) => a.badge?.id).filter(Boolean))

  // Lesson reading bar chart data
  const lessonBarData = allLessons.map((la) => ({
    name: (la.lesson?.title ?? '').length > 14 ? la.lesson.title.slice(0, 12) + '…' : (la.lesson?.title ?? ''),
    read: la.lesson?.progress?.progress_percentage ?? 0,
  }))

  const TABS = ['overview', 'lessons', 'quizzes', 'badges']

  return (
    <PageWrapper title={`${student.username}'s Progress`} subtitle={`in classroom`}>
      {/* Back */}
      <button
        onClick={() => navigate(`/teacher/classrooms/${classroomId}`)}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />Back to classroom
      </button>

      {/* Profile header */}
      <div className="flex items-center gap-5 bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 mb-6">
        <img
          src={student.avatar_url || '/default-avatar.png'}
          alt={student.username}
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
        />
        <div>
          <h2 className="text-xl font-black text-gray-900">{student.username}</h2>
          <p className="text-sm text-gray-400">{student.email}</p>
          {student.last_login && (
            <p className="text-xs text-gray-400 mt-0.5">
              Last active {formatDistanceToNow(new Date(student.last_login), { addSuffix: true })}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold capitalize transition-colors relative
              ${activeTab === tab ? 'text-blockly-purple' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blockly-purple" />}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Target}  label="Completed"   value={`${total ? Math.round((completed/total)*100) : 0}%`} color={C.purple} bg={C.purpleL} />
            <StatCard icon={Trophy}  label="Quizzes Passed" value={quizPassed} color={C.green}  bg={C.greenL} />
            <StatCard icon={Clock}   label="Time Spent"  value={`${Math.floor(totalTime/60)}m`}  color={C.sky}    bg={C.skyL}    />
            <StatCard icon={Award}   label="Badges"      value={achievements.length}              color={C.amber}  bg={C.amberL}  />
          </div>

          {lessonBarData.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4">Lesson Progress</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={lessonBarData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="read" name="Read %" fill={C.purple} radius={[4,4,0,0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Lessons tab */}
      {activeTab === 'lessons' && (
        <div className="flex flex-col gap-2">
          {!allLessons.length ? (
            <p className="text-sm text-gray-400 text-center py-10">No lessons assigned yet</p>
          ) : allLessons.map((la) => {
            const pct = la.lesson?.progress?.progress_percentage ?? 0
            const quiz = la.lesson?.quizzes?.[0]?.quiz ?? null
            return (
              <div key={la.id} className={`flex items-center gap-4 px-5 py-4 rounded-2xl border ${
                la.status === 'completed' ? 'bg-green-50 border-green-100'
                : la.status === 'missing' ? 'bg-red-50 border-red-100 opacity-80'
                : 'bg-white border-gray-100'}`}>
                <BookOpen className={`w-5 h-5 shrink-0 ${la.status === 'completed' ? 'text-green-500' : la.status === 'missing' ? 'text-red-400' : 'text-gray-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{la.lesson?.title}</p>
                  {la.due_date && (
                    <p className="text-xs text-gray-400">{format(new Date(la.due_date), 'MMM d, yyyy')}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 w-24 shrink-0">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blockly-purple rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
                </div>
                {quiz && la.lesson?.quizAttempt && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    la.lesson.quizAttempt.score >= Math.round(((quiz.passing_score ?? 0) / (quiz.questions?.length || 1)) * 100)
                      ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {la.lesson.quizAttempt.score}%
                  </span>
                )}
                <span className={`text-xs font-bold shrink-0 ${la.status === 'completed' ? 'text-green-600' : la.status === 'missing' ? 'text-red-500' : 'text-gray-400'}`}>
                  {la.status === 'completed' ? '✓ Done' : la.status === 'missing' ? '✗ Missing' : 'Pending'}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Quizzes tab */}
      {activeTab === 'quizzes' && (
        <QuizAccordion quizHistory={quizHistory} achievements={achievements} />
      )}

      {/* Badges tab */}
      {activeTab === 'badges' && (
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-5">
              Badges Earned
              <span className="ml-2 text-sm font-normal text-gray-400">({achievements.length})</span>
            </h3>
            {!achievements.length ? (
              <p className="text-sm text-gray-400 text-center py-6">No badges earned yet</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-4">
                {achievements.map((ach) => (
                  <div key={ach.id} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-yellow-50 border border-yellow-200">
                    {ach.badge?.icon_url
                      ? <img src={ach.badge.icon_url} alt={ach.badge.title} className="w-9 h-9 object-contain" />
                      : <Award className="w-9 h-9 text-yellow-500" />}
                    <span className="text-xs font-medium text-center text-gray-600 leading-tight line-clamp-2">{ach.badge?.title}</span>
                    <span className="text-xs text-gray-400">{format(new Date(ach.earned_at), 'MMM d')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </PageWrapper>
  )
}