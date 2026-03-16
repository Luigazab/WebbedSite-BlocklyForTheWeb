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
  Trophy, ChevronDown, ChevronUp, AlertCircle, Target,
  TrendingUp, BookMarked,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadialBarChart, RadialBar,
} from 'recharts'

const TABS = [
  { key: 'lessons',    label: 'Lessons',    icon: BookOpen    },
  { key: 'quizzes',    label: 'Quizzes',    icon: HelpCircle  },
  { key: 'activities', label: 'Activities', icon: FlaskConical },
  { key: 'progress',   label: 'Progress',   icon: BarChart2   },
  { key: 'members',    label: 'Members',    icon: Users       },
]

// ─── Colour palette ───────────────────────────────────────────────────────────
const C = {
  purple:   '#7c3aed',
  purpleL:  '#ddd6fe',
  green:    '#22c55e',
  greenL:   '#dcfce7',
  amber:    '#f59e0b',
  amberL:   '#fef3c7',
  red:      '#ef4444',
  redL:     '#fee2e2',
  sky:      '#0ea5e9',
  skyL:     '#e0f2fe',
  gray:     '#94a3b8',
  grayL:    '#f1f5f9',
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = C.purple, bg = C.purpleL }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
        <p className="text-xs font-semibold text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-xs">
      {label && <p className="font-bold text-gray-700 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill || p.color }} className="font-semibold">
          {p.name}: {p.value}{typeof p.value === 'number' && p.name?.includes('%') ? '' : ''}
        </p>
      ))}
    </div>
  )
}

// ─── Badge grid ───────────────────────────────────────────────────────────────
function BadgeGrid({ earned, all }) {
  const earnedIds = new Set(earned.map((a) => a.badge?.id).filter(Boolean))
  if (!all.length) return <p className="text-sm text-gray-400 text-center py-6">No badges available for this classroom.</p>

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-4">
      {all.map((badge) => {
        const isEarned     = earnedIds.has(badge.id)
        const achievement  = earned.find((a) => a.badge?.id === badge.id)
        return (
          <div key={badge.id} title={isEarned ? `Earned ${achievement ? format(new Date(achievement.earned_at), 'MMM d, yyyy') : ''}` : badge.title}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all cursor-default ${
              isEarned ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100 opacity-40 grayscale'
            }`}>
            {badge.icon_url
              ? <img src={badge.icon_url} alt={badge.title} className="w-9 h-9 object-contain" />
              : <Award className={`w-9 h-9 ${isEarned ? 'text-yellow-500' : 'text-gray-300'}`} />}
            <span className="text-xs font-medium text-center text-gray-600 leading-tight line-clamp-2">{badge.title}</span>
            {isEarned && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 -mt-1" />}
          </div>
        )
      })}
    </div>
  )
}

// ─── Quiz attempt accordion ───────────────────────────────────────────────────
function QuizHistoryCard({ quiz, earned }) {
  const [open, setOpen] = useState(false)
  const isEarned = earned.some((a) => a.badge?.id === quiz.badge?.id && quiz.badge)
  const passed   = quiz.passing_score !== null && quiz.bestScore !== null
    ? quiz.bestScore >= Math.round((quiz.passing_score / quiz.questionCount) * 100)
    : null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${passed === true ? 'bg-green-100' : passed === false ? 'bg-red-100' : 'bg-gray-100'}`}>
            <Trophy className={`w-5 h-5 ${passed === true ? 'text-green-600' : passed === false ? 'text-red-500' : 'text-gray-400'}`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate">{quiz.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-400">{quiz.attemptCount} attempt{quiz.attemptCount !== 1 ? 's' : ''}</span>
              {quiz.passing_score !== null && (
                <span className="text-xs text-gray-400">· Pass: {quiz.passing_score}/{quiz.questionCount}</span>
              )}
              {quiz.badge && (
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${isEarned ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-400'}`}>
                  {isEarned ? '🏅 Earned' : '🏅 Not yet'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {quiz.bestScore !== null && (
            <span className={`text-sm font-black px-3 py-1 rounded-full ${
              passed === true ? 'bg-green-100 text-green-700' : passed === false ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
              {quiz.bestScore}%
            </span>
          )}
          {quiz.attemptCount === 0
            ? <span className="text-xs text-gray-400">Not attempted</span>
            : open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {open && quiz.attempts.length > 0 && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          {quiz.attempts.map((attempt, i) => {
            const attemptPassed = quiz.passing_score !== null
              ? attempt.score >= Math.round((quiz.passing_score / quiz.questionCount) * 100)
              : null
            return (
              <div key={attempt.id} className="flex items-center justify-between px-5 py-3 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 font-medium w-6">#{quiz.attempts.length - i}</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">
                      {attempt.score}%
                      <span className={`ml-2 font-bold ${attemptPassed === true ? 'text-green-600' : attemptPassed === false ? 'text-red-500' : ''}`}>
                        {attemptPassed === true ? '✓ Pass' : attemptPassed === false ? '✗ Fail' : ''}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(attempt.completed_at), { addSuffix: true })}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-400">{format(new Date(attempt.completed_at), 'MMM d, yyyy')}</div>
              </div>
            )
          })}
        </div>
      )}
      {open && quiz.attempts.length === 0 && (
        <div className="px-5 py-4 text-sm text-gray-400 bg-gray-50 border-t border-gray-100">No attempts yet.</div>
      )}
    </div>
  )
}

// ─── Progress tab ─────────────────────────────────────────────────────────────
function ProgressTab({ classroomAssignments, achievements, classroomBadges, quizAttemptHistory }) {
  const allLessons  = classroomAssignments.filter((la) => la.lesson)
  const total       = allLessons.length
  const completed   = allLessons.filter((la) => la.status === 'completed').length
  const missing     = allLessons.filter((la) => la.status === 'missing').length
  const inProgress  = allLessons.filter((la) => la.lesson?.progress && la.status === 'assigned').length

  const quizzedLessons   = allLessons.filter((la) => (la.lesson?.quizzes?.length ?? 0) > 0)
  const quizCompleted    = quizzedLessons.filter((la) => la.lesson?.quizAttempt).length
  const quizPending      = quizzedLessons.length - quizCompleted

  const totalTimeSpent   = allLessons.reduce((sum, la) => sum + (la.lesson?.progress?.time_spent ?? 0), 0)
  const avgScore         = quizAttemptHistory.length
    ? Math.round(quizAttemptHistory.reduce((s, q) => s + (q.bestScore ?? 0), 0) / quizAttemptHistory.filter((q) => q.bestScore !== null).length || 0)
    : null

  // Donut chart data
  const donutData = [
    { name: 'Completed',   value: completed,  fill: C.green  },
    { name: 'In Progress', value: inProgress, fill: C.amber  },
    { name: 'Missing',     value: missing,    fill: C.red    },
    { name: 'Not Started', value: Math.max(0, total - completed - inProgress - missing), fill: C.gray },
  ].filter((d) => d.value > 0)

  // Bar chart: lesson progress per lesson (% read)
  const lessonBarData = allLessons.map((la) => ({
    name: (la.lesson?.title ?? '').length > 16 ? (la.lesson?.title ?? '').slice(0, 14) + '…' : (la.lesson?.title ?? 'Lesson'),
    read: la.lesson?.progress?.progress_percentage ?? 0,
    done: la.status === 'completed' ? 100 : 0,
  }))

  // Quiz performance bar
  const quizBarData = quizAttemptHistory
    .filter((q) => q.bestScore !== null)
    .map((q) => ({
      name:    q.title.length > 14 ? q.title.slice(0, 12) + '…' : q.title,
      score:   q.bestScore,
      passing: q.passing_score !== null
        ? Math.round((q.passing_score / q.questionCount) * 100)
        : null,
    }))

  return (
    <div className="flex flex-col gap-8">

      {/* ── Stat cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Target}      label="Overall Progress"   value={total ? `${Math.round((completed/total)*100)}%` : '—'} sub={`${completed}/${total} lessons`}   color={C.purple} bg={C.purpleL} />
        <StatCard icon={Trophy}      label="Quizzes Passed"     value={quizCompleted}   sub={`of ${quizzedLessons.length}`} color={C.green}  bg={C.greenL}  />
        <StatCard icon={Clock}       label="Time Spent"         value={`${Math.floor(totalTimeSpent/60)}m`} sub={`${totalTimeSpent}s total`} color={C.sky} bg={C.skyL} />
        <StatCard icon={Award}       label="Badges Earned"      value={achievements.length} sub="this classroom"             color={C.amber}  bg={C.amberL}  />
      </div>

      {/* ── Charts row ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Donut: Assignment Overview */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Assignment Overview</h3>
          {total === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No assignments yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {donutData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip content={<ChartTip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar: Lesson read progress */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Lesson Reading Progress</h3>
          {!lessonBarData.length ? (
            <p className="text-sm text-gray-400 text-center py-8">No lessons yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={lessonBarData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip content={<ChartTip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="read" name="Read %" fill={C.purple} radius={[4,4,0,0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Quiz score bar ──────────────────────────────── */}
      {quizBarData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-1">Quiz Best Scores</h3>
          <p className="text-xs text-gray-400 mb-5">Best score across all attempts per quiz</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={quizBarData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip content={<ChartTip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="score" name="Best Score %" fill={C.sky} radius={[4,4,0,0]} maxBarSize={42} />
              {/* Passing line — rendered as a reference-like second bar at 0 height + label would be complex; skip for now */}
            </BarChart>
          </ResponsiveContainer>
          {/* Passing score reference text per quiz */}
          <div className="flex flex-wrap gap-2 mt-3">
            {quizBarData.map((q, i) => q.passing !== null && (
              <span key={i} className="text-xs bg-gray-50 border border-gray-200 px-2 py-1 rounded-full text-gray-500">
                {q.name}: pass at {q.passing}%
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Badges ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Award className="w-5 h-5 text-yellow-500" />
          <h3 className="font-bold text-gray-800">Badges</h3>
          <span className="text-xs text-gray-400 ml-1">
            {achievements.length}/{classroomBadges.length || '?'} earned
          </span>
        </div>
        <BadgeGrid earned={achievements} all={classroomBadges} />
      </div>

      {/* ── Quiz detail accordion ───────────────────────── */}
      {quizAttemptHistory.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blockly-purple" />
            <h3 className="font-bold text-gray-800">Quiz Details</h3>
          </div>
          {quizAttemptHistory.map((quiz) => (
            <QuizHistoryCard key={quiz.quizId} quiz={quiz} earned={achievements} />
          ))}
        </div>
      )}

      {/* ── Lesson score list ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <BookMarked className="w-5 h-5 text-blockly-purple" />
          <h3 className="font-bold text-gray-800">Lesson Summary</h3>
        </div>
        {!allLessons.length ? (
          <p className="text-sm text-gray-400 text-center py-6">No lessons assigned yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            {allLessons.map((la) => {
              const pct = la.lesson?.progress?.progress_percentage ?? 0
              const quiz = la.lesson?.quizzes?.[0]?.quiz ?? null
              const attempt = la.lesson?.quizAttempt

              return (
                <div key={la.id} className={`flex items-center gap-4 px-4 py-3 rounded-xl border ${
                  la.status === 'completed' ? 'bg-green-50 border-green-100'
                  : la.status === 'missing'  ? 'bg-red-50 border-red-100 opacity-75'
                  : 'bg-white border-gray-100'}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{la.lesson?.title}</p>
                    {la.due_date && (
                      <p className="text-xs text-gray-400">{format(new Date(la.due_date), 'MMM d')}</p>
                    )}
                  </div>

                  {/* Read progress */}
                  <div className="flex items-center gap-2 w-24">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blockly-purple rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
                  </div>

                  {/* Quiz score */}
                  {quiz && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      attempt
                        ? (quiz.passing_score !== null && attempt.score >= Math.round((quiz.passing_score / (quiz.quiz_questions?.length || quiz.questions?.length || 1)) * 100))
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {attempt ? `${attempt.score}%` : 'Quiz —'}
                    </span>
                  )}

                  {/* Status */}
                  <span className={`text-xs font-bold shrink-0 ${
                    la.status === 'completed' ? 'text-green-600'
                    : la.status === 'missing'  ? 'text-red-500'
                    : 'text-gray-400'}`}>
                    {la.status === 'completed' ? '✓ Done'
                     : la.status === 'missing'  ? '✗ Missing'
                     : 'Pending'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StudentClassroomDetail() {
  const { classroomId } = useParams()
  const navigate = useNavigate()
  const profile  = useAuthStore((state) => state.profile)

  const { currentClassroom, loading: classroomLoading, fetchClassroomDetail } = useClassroomStore()
  const {
    classroomAssignments, classroomMembers, classroomBadges,
    achievements, quizAttemptHistory, loading,
    fetchClassroomLessonsForStudent, fetchClassroomMembers,
    fetchClassroomBadges, fetchStudentAchievements, fetchQuizAttemptHistory,
  } = useLessonStore()
  const { handleLeaveClassroom } = useClassroom()

  const [activeTab, setActiveTab] = useState('lessons')
  const [leaving,   setLeaving]   = useState(false)

  useEffect(() => {
    fetchClassroomDetail(classroomId)
    if (profile?.id) {
      fetchClassroomLessonsForStudent(classroomId, profile.id)
      fetchStudentAchievements(profile.id)
      fetchQuizAttemptHistory(profile.id, classroomId)
    }
    fetchClassroomBadges(classroomId)
    fetchClassroomMembers(classroomId)
  }, [classroomId, profile?.id])

  const allLessons   = classroomAssignments.filter((la) => la.lesson)
  const quizOnly     = allLessons.filter((la) => (la.lesson?.quizzes?.length ?? 0) > 0)
  const activityOnly = allLessons.filter((la) => la.assignment_type === 'learn_topic')
  const completedCnt = allLessons.filter((la) => la.status === 'completed').length
  const teacher      = currentClassroom?.teacher

  const listToShow = activeTab === 'quizzes'    ? quizOnly
                   : activeTab === 'activities' ? activityOnly
                   : allLessons

  const onLeave = async () => {
    if (!window.confirm('Leave this classroom?')) return
    setLeaving(true)
    try {
      await handleLeaveClassroom(classroomId, currentClassroom?.name)
      navigate('/classrooms')
    } finally { setLeaving(false) }
  }

  return (
    <PageWrapper title={currentClassroom?.name ?? 'Classroom'} subtitle={currentClassroom?.description}>

      {/* Banner */}
      {currentClassroom && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 mb-2">
          <div className="flex items-center gap-3">
            <img src={teacher?.avatar_url || '/default-avatar.png'} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-100" />
            <div>
              <p className="text-xs text-gray-400">Teacher</p>
              <p className="text-sm font-semibold text-gray-800">{teacher?.username}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1 sm:w-52">
            <div className="flex justify-between text-xs font-medium text-gray-500">
              <span>Lessons done</span>
              <span>{completedCnt}/{allLessons.length}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blockly-purple rounded-full transition-all duration-500"
                style={{ width: allLessons.length ? `${(completedCnt/allLessons.length)*100}%` : '0%' }} />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-5 overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors relative
              ${activeTab === key ? 'text-blockly-purple' : 'text-gray-500 hover:text-gray-700'}`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
            {activeTab === key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blockly-purple" />}
          </button>
        ))}
      </div>

      {/* Content */}
      {(loading || classroomLoading) && !classroomAssignments.length ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
      ) : (
        <>
          {['lessons','quizzes','activities'].includes(activeTab) && (
            <div className="flex flex-col gap-3">
              {listToShow.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                  <BookOpen className="w-8 h-8 text-gray-200" />
                  <p className="text-sm text-gray-400">
                    {activeTab === 'quizzes'    ? 'No quizzes assigned yet'
                    : activeTab === 'activities' ? 'No activities assigned yet'
                    : 'No lessons assigned yet'}
                  </p>
                </div>
              ) : listToShow.map((la) => (
                <StudentLessonCard key={la.id} assignment={la} classroomId={classroomId} />
              ))}
            </div>
          )}

          {activeTab === 'progress' && (
            <ProgressTab
              classroomAssignments={classroomAssignments}
              achievements={achievements}
              classroomBadges={classroomBadges}
              quizAttemptHistory={quizAttemptHistory}
            />
          )}

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
                {!classroomMembers.length ? (
                  <p className="text-sm text-gray-400 text-center py-6">No other students yet</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {classroomMembers.map((enrollment) => {
                      const student = enrollment.student
                      if (!student) return null
                      const isMe = student.id === profile?.id
                      return (
                        <div key={enrollment.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border ${isMe ? 'border-blockly-purple/30 bg-blockly-purple/5' : 'border-gray-100 bg-gray-50'}`}>
                          <img src={student.avatar_url || '/default-avatar.png'} alt={student.username} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {student.username}
                              {isMe && <span className="ml-1.5 text-xs text-blockly-purple">(you)</span>}
                            </p>
                            <p className="text-xs text-gray-400">Joined {format(new Date(enrollment.enrolled_at), 'MMM d, yyyy')}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-center pt-2 pb-8">
                <button onClick={onLeave} disabled={leaving}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors border border-red-100 disabled:opacity-50">
                  {leaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
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