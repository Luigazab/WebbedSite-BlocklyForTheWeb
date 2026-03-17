import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useAuthStore } from '../../../store/authStore'
import { useClassroomStore } from '../../../store/classroomStore'
import { useLessonStore } from '../../../store/lessonStore'
import { useUIStore } from '../../../store/uiStore'
import { supabase } from '../../../supabaseClient'
import PageWrapper from '../../../components/layout/PageWrapper'
import PostLessonModal from '../components/PostLessonModal'
import {
  BookOpen, HelpCircle, FlaskConical, BarChart2, Users,
  Plus, Loader2, Archive, Trash2, Copy, RefreshCw,
  Check, Award, Trophy, Target, Clock, TrendingUp,
  User, X, CheckCircle, XCircle, Calendar, AlarmClock,
  Eye, ClipboardList, ArrowLeft, ArrowRight,
} from 'lucide-react'
import { format, differenceInDays, isPast, formatDistanceToNow } from 'date-fns'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts'

// ─── Colours ──────────────────────────────────────────────────────────────────
const C = {
  purple: '#7c3aed', purpleL: '#ddd6fe',
  green:  '#22c55e', greenL:  '#dcfce7',
  amber:  '#f59e0b', amberL:  '#fef3c7',
  red:    '#ef4444', redL:    '#fee2e2',
  sky:    '#0ea5e9', skyL:    '#e0f2fe',
  gray:   '#94a3b8',
}

const TABS = [
  { key: 'lessons',     label: 'Lessons',     icon: BookOpen   },
  { key: 'quizzes',     label: 'Quizzes',     icon: HelpCircle },
  { key: 'activities',  label: 'Activities',  icon: FlaskConical },
  { key: 'performance', label: 'Performance', icon: BarChart2  },
  { key: 'members',     label: 'Members',     icon: Users      },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStudentId(enrollment) {
  const sid = enrollment.student_id ?? enrollment.student?.id ?? null
  if (!sid && process.env.NODE_ENV !== 'production') {
    console.warn('[getStudentId] Could not resolve student_id from enrollment:', enrollment)
  }
  return sid
}

function lessonHasQuiz(la) {
  const lesson = la?.lesson
  if (!lesson) return false
  if (Array.isArray(lesson.lesson_quizzes)) return lesson.lesson_quizzes.length > 0
  return lesson.has_quiz === true
}

function resolveStudentAnswer(answers, question, questionIndex) {
  if (!answers || !question) return null

  const opts = Array.isArray(question.options)
    ? question.options
    : Object.values(question.options ?? {})

  // Try by question UUID first, then fall back to positional string key
  const raw = answers[question.id] ?? answers[String(questionIndex)] ?? null
  if (raw === null || raw === undefined) return null

  // Format A: stored as integer index
  if (typeof raw === 'number' && Number.isInteger(raw)) {
    return opts[raw] ?? null
  }

  // Format B: stored as text string
  if (typeof raw === 'string') {
    return raw
  }

  return null
}

function didPass(attempt, passingScore) {
  if (!attempt || passingScore === null || passingScore === undefined) return null
  const correctCount = Math.round((attempt.score / 100) * attempt.total_items)
  return correctCount >= passingScore
}

/**
 * Display-friendly score: the attempt stores a percentage already.
 * Just return it directly — don't divide again.
 */
function attemptPct(attempt) {
  if (!attempt) return null
  return attempt.score // already 0-100 percentage
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = C.purple, bg = C.purpleL }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div>
        <p className="text-xl font-black text-gray-900 leading-none">{value}</p>
        <p className="text-xs font-semibold text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      {label && <p className="font-bold text-gray-700 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill || p.color }} className="font-semibold">
          {p.name}: {p.value}{typeof p.value === 'number' ? '%' : ''}
        </p>
      ))}
    </div>
  )
}

// ─── Lesson Detail Panel ──────────────────────────────────────────────────────
function LessonDetailPanel({ assignment, enrollments, onClose }) {
  const lesson     = assignment.lesson
  const hasQuiz    = lessonHasQuiz(assignment)
  const isActivity = assignment.assignment_type === 'learn_topic'

  const [panelTab,          setPanelTab]          = useState('students')
  const [quizStudentIdx,    setQuizStudentIdx]    = useState(0)
  const [showScoresSidebar, setShowScoresSidebar] = useState(true)
  const [studentProgress,   setStudentProgress]   = useState([])
  const [quizData,          setQuizData]          = useState([])
  const [questions,         setQuestions]         = useState([])
  const [loadingData,       setLoadingData]       = useState(true)
  const [grades,            setGrades]            = useState({})
  const [savingGrade,       setSavingGrade]       = useState(null)

  // Active enrollments only
  const activeEnrollments = enrollments.filter(e => e.status === 'active')
  // Collect all student UUIDs — guards against empty .in() queries
  const studentIds = activeEnrollments.map(e => getStudentId(e)).filter(Boolean)

  useEffect(() => { loadData() }, [assignment.id])

  const loadData = async () => {
    setLoadingData(true)
    try {
      const lessonId = lesson?.id
      if (!lessonId) { setLoadingData(false); return }

      // ── 1. lesson_progress ────────────────────────────────────────────────
      // IMPORTANT: only call .in() when the array is non-empty — Supabase
      // returns a 400 bad request for .in('col', [])
      let progressMap = {}
      if (studentIds.length > 0) {
        const { data: progressRows, error: progErr } = await supabase
          .from('lesson_progress')
          .select('student_id, progress_percentage, completed_at, time_spent')
          .eq('lesson_id', lessonId)
          .in('student_id', studentIds)

        if (progErr) {
          console.error('lesson_progress error:', progErr.code, progErr.message)
        } else {
          for (const row of progressRows ?? []) {
            progressMap[row.student_id] = row
          }
        }
      }

      const progressList = activeEnrollments.map(enrollment => {
        const sid      = getStudentId(enrollment)
        const progress = progressMap[sid] ?? null
        const pct      = progress?.progress_percentage ?? 0
        return {
          enrollment,
          student:   enrollment.student,
          studentId: sid,
          progress,
          status: progress?.completed_at
            ? 'completed'
            : pct > 0
              ? 'in_progress'
              : 'not_started',
        }
      })
      setStudentProgress(progressList)

      // ── 2. Quiz data ───────────────────────────────────────────────────────
      // Resolve quiz_id — may be in the joined lesson_quizzes, or fetch it
      let quizId = lesson?.lesson_quizzes?.[0]?.quiz_id ?? null
      if (!quizId && hasQuiz) {
        const { data: lqRows } = await supabase
          .from('lesson_quizzes')
          .select('quiz_id')
          .eq('lesson_id', lessonId)
          .limit(1)
        quizId = lqRows?.[0]?.quiz_id ?? null
      }

      if (hasQuiz && quizId && studentIds.length > 0) {
        const [
          { data: questionsData, error: qErr },
          { data: attemptsData,  error: aErr },
          { data: quizMeta },
        ] = await Promise.all([
          supabase
            .from('quiz_questions')
            .select('id, question_text, options, correct_answer, order_index')
            .eq('quiz_id', quizId)
            .order('order_index'),
          supabase
            .from('quiz_attempts')
            .select('id, student_id, score, total_items, answers, completed_at')
            .eq('quiz_id', quizId)
            .in('student_id', studentIds)
            .order('completed_at', { ascending: false }),
          supabase
            .from('quizzes')
            .select('passing_score')
            .eq('id', quizId)
            .single(),
        ])

        if (qErr) console.error('quiz_questions error:', qErr.message)
        if (aErr) console.error('quiz_attempts error:', aErr.message)

        setQuestions(questionsData ?? [])

        // Group attempts by student — find best (highest %)
        const byStudent = {}
        for (const attempt of attemptsData ?? []) {
          const sid = attempt.student_id
          if (!byStudent[sid]) byStudent[sid] = { attempts: [], best: null }
          byStudent[sid].attempts.push(attempt)
          // score is stored as a percentage (0-100), compare directly
          const prevBest = byStudent[sid].best?.score ?? -1
          if (attempt.score > prevBest) byStudent[sid].best = attempt
        }

        const passingScore = quizMeta?.passing_score ?? null

        setQuizData(
          activeEnrollments.map(enrollment => {
            const sid = getStudentId(enrollment)
            return {
              student:      enrollment.student,
              studentId:    sid,
              attempts:     byStudent[sid]?.attempts ?? [],
              best:         byStudent[sid]?.best     ?? null,
              passingScore,
            }
          })
        )
      }

      // ── 3. Activity grades ─────────────────────────────────────────────────
      if (isActivity && assignment.id) {
        const { data: subs } = await supabase
          .from('assignment_submissions')
          .select('student_id, grade, feedback, status')
          .eq('assignment_id', assignment.id)

        const gradeMap = {}
        for (const sub of subs ?? []) {
          gradeMap[sub.student_id] = { grade: sub.grade ?? '', feedback: sub.feedback ?? '' }
        }
        setGrades(gradeMap)
      }
    } catch (err) {
      console.error('LessonDetailPanel unexpected error:', err)
    } finally {
      setLoadingData(false)
    }
  }

  const handleSaveGrade = async (studentId) => {
    setSavingGrade(studentId)
    try {
      const g = grades[studentId] ?? {}
      await supabase
        .from('assignment_submissions')
        .upsert({
          assignment_id: assignment.id,
          student_id:    studentId,
          grade:         g.grade !== '' ? parseInt(g.grade, 10) : null,
          feedback:      g.feedback || null,
          status:        'completed',
          updated_at:    new Date().toISOString(),
        }, { onConflict: 'assignment_id,student_id' })
    } catch (err) {
      console.error('Grade save error:', err)
    } finally {
      setSavingGrade(null)
    }
  }

  const due          = assignment.due_date ? new Date(assignment.due_date) : null
  const overdue      = due && isPast(due)
  const completedCnt = studentProgress.filter(p => p.status === 'completed').length
  const inProgCnt    = studentProgress.filter(p => p.status === 'in_progress').length
  const notStartCnt  = studentProgress.filter(p => p.status === 'not_started').length
  // Punctuality counts (only meaningful when there's a due date)
  const onTimeCnt    = due ? studentProgress.filter(p => {
    const completedAt = p.progress?.completed_at ? new Date(p.progress.completed_at) : null
    return completedAt && completedAt <= due
  }).length : null
  const lateCnt      = due ? studentProgress.filter(p => {
    const completedAt = p.progress?.completed_at ? new Date(p.progress.completed_at) : null
    return completedAt && completedAt > due
  }).length : null
  const missingCnt   = due && isPast(due)
    ? studentProgress.filter(p => !p.progress?.completed_at).length
    : null

  const panelTabs = [
    { key: 'students',  label: 'Students',     icon: Users       },
    ...(hasQuiz    ? [{ key: 'quiz',     label: 'Quiz Results', icon: HelpCircle  }] : []),
    ...(isActivity ? [{ key: 'activity', label: 'Activity',     icon: FlaskConical }] : []),
  ]

  const currentQuizStudent = quizData[quizStudentIdx] ?? null
  const quizPassingScore   = quizData[0]?.passingScore ?? null

  return (
    <div className="fixed inset-0 z-50 flex items-stretch">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="w-full max-w-4xl bg-white shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start gap-4 px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-blockly-purple/10 flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-blockly-purple" />
              </div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {isActivity ? 'Activity' : 'Lesson'} Detail
              </span>
            </div>
            <h2 className="text-lg font-black text-gray-900 truncate">
              {lesson?.title ?? assignment.title}
            </h2>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {lesson?.estimated_duration && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />{lesson.estimated_duration}m
                </span>
              )}
              {due && (
                <span className={`flex items-center gap-1 text-xs font-semibold ${overdue ? 'text-red-500' : 'text-gray-400'}`}>
                  <Calendar className="w-3 h-3" />
                  Due {format(due, 'MMM d, yyyy')}{overdue && ' (Overdue)'}
                </span>
              )}
              {hasQuiz && (
                <span className="px-2 py-0.5 bg-purple-100 text-blockly-purple text-xs font-semibold rounded-full">
                  Has Quiz
                </span>
              )}
            </div>
          </div>

          {/* Completion counters */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-xl">
              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs font-bold text-green-700">{completedCnt}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-bold text-amber-700">{inProgCnt}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-xl">
              <XCircle className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-bold text-gray-500">{notStartCnt}</span>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 ml-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Panel tabs */}
        <div className="flex gap-1 px-6 border-b border-gray-100 shrink-0">
          {panelTabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setPanelTab(key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold transition-colors relative
                ${panelTab === key ? 'text-blockly-purple' : 'text-gray-400 hover:text-gray-700'}`}>
              <Icon className="w-3.5 h-3.5" />{label}
              {panelTab === key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blockly-purple" />}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex">
          {loadingData ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
            </div>
          ) : (
            <>
              {/* ── Students ──────────────────────────────────────────── */}
              {panelTab === 'students' && (
                <div className="flex-1 overflow-y-auto">
                  {/* Progress summary */}
                  <div className="px-6 py-4 border-b border-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-500 font-semibold">Class completion</span>
                      <span className="text-xs font-black text-blockly-purple ml-auto">
                        {activeEnrollments.length > 0
                          ? Math.round((completedCnt / activeEnrollments.length) * 100) : 0}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blockly-purple rounded-full transition-all"
                        style={{ width: `${activeEnrollments.length > 0 ? (completedCnt / activeEnrollments.length) * 100 : 0}%` }} />
                    </div>

                    {/* Reading status counts */}
                    <div className="flex gap-3 mt-3">
                      {[
                        { label: 'Completed',   count: completedCnt, color: 'text-green-600', bg: 'bg-green-50' },
                        { label: 'In Progress', count: inProgCnt,    color: 'text-amber-600', bg: 'bg-amber-50' },
                        { label: 'Not Started', count: notStartCnt,  color: 'text-gray-500',  bg: 'bg-gray-100' },
                      ].map(({ label, count, color, bg }) => (
                        <div key={label} className={`flex items-center gap-1.5 px-3 py-1 rounded-lg ${bg}`}>
                          <span className={`text-xs font-bold ${color}`}>{count}</span>
                          <span className="text-xs text-gray-400">{label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Punctuality counts — only shown when assignment has a due date */}
                    {due && (
                      <div className="flex gap-3 mt-2 pt-2 border-t border-gray-50">
                        <span className="text-xs text-gray-400 font-semibold self-center">Punctuality:</span>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-50">
                          <span className="text-xs font-bold text-green-600">{onTimeCnt ?? 0}</span>
                          <span className="text-xs text-gray-400">On Time</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50">
                          <span className="text-xs font-bold text-amber-600">{lateCnt ?? 0}</span>
                          <span className="text-xs text-gray-400">Late</span>
                        </div>
                        {isPast(due) && (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-50">
                            <span className="text-xs font-bold text-red-600">{missingCnt ?? 0}</span>
                            <span className="text-xs text-gray-400">Missing</span>
                          </div>
                        )}
                        <span className="text-xs text-gray-400 self-center ml-auto">
                          Due {format(due, 'MMM d, yyyy')}
                          {overdue && <span className="text-red-500 ml-1">(past due)</span>}
                        </span>
                      </div>
                    )}
                  </div>

                  {studentProgress.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 gap-2">
                      <Users className="w-7 h-7 text-gray-200" />
                      <p className="text-sm text-gray-400">No students enrolled yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {/* ── Table header ── */}
                      <div className="grid grid-cols-12 px-6 py-2 bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wide">
                        <span className="col-span-4">Student</span>
                        <span className="col-span-2 text-center">Reading</span>
                        <span className="col-span-3 text-center">Progress</span>
                        <span className="col-span-1 text-center">Time</span>
                        <span className="col-span-2 text-center">Punctuality</span>
                      </div>

                      {studentProgress.map(({ student, progress, status }) => {
                        const pct         = progress?.progress_percentage ?? 0
                        const completedAt = progress?.completed_at ? new Date(progress.completed_at) : null
                        const timeSecs    = progress?.time_spent ?? 0
                        const timeDisplay = timeSecs >= 3600
                          ? `${Math.floor(timeSecs / 3600)}h ${Math.floor((timeSecs % 3600) / 60)}m`
                          : timeSecs >= 60
                            ? `${Math.floor(timeSecs / 60)}m ${timeSecs % 60}s`
                            : timeSecs > 0 ? `${timeSecs}s` : '—'

                        let punctuality = 'none'
                        if (due) {
                          if (completedAt) {
                            punctuality = completedAt <= due ? 'on_time' : 'late'
                          } else if (isPast(due)) {
                            punctuality = 'missing'
                          }
                        }

                        const punctualityBadge = {
                          on_time: (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full whitespace-nowrap">
                              <Check className="w-3 h-3" /> On Time
                            </span>
                          ),
                          late: (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full whitespace-nowrap"
                              title={completedAt ? `Completed ${format(completedAt, 'MMM d, h:mm a')}` : ''}>
                              <AlarmClock className="w-3 h-3" /> Late
                            </span>
                          ),
                          missing: (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full whitespace-nowrap">
                              <XCircle className="w-3 h-3" /> Missing
                            </span>
                          ),
                          none: <span className="text-gray-300 text-xs">—</span>,
                        }[punctuality]

                        return (
                          <div key={student?.id}
                            className={`grid grid-cols-12 items-center px-6 py-3 hover:bg-gray-50/80 transition-colors
                              ${punctuality === 'missing' ? 'bg-red-50/30' : ''}`}>

                            {/* Student info */}
                            <div className="col-span-4 flex items-center gap-2">
                              <img src={student?.avatar_url || '/default-avatar.png'} alt={student?.username}
                                className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">{student?.username}</p>
                                <p className="text-xs text-gray-400 truncate">{student?.email}</p>
                              </div>
                            </div>

                            {/* Reading status */}
                            <div className="col-span-2 flex justify-center">
                              {status === 'completed'   && <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full"><CheckCircle className="w-3 h-3" /> Done</span>}
                              {status === 'in_progress' && <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full"><Clock className="w-3 h-3" /> Reading</span>}
                              {status === 'not_started' && <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-bold rounded-full"><XCircle className="w-3 h-3" /> Pending</span>}
                            </div>

                            {/* Progress bar */}
                            <div className="col-span-3 flex items-center gap-2 justify-center">
                              <div className="flex-1 max-w-[5rem] h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${pct === 100 ? 'bg-green-500' : 'bg-blockly-purple'}`}
                                  style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs font-semibold text-gray-500 w-8 text-right">{pct}%</span>
                            </div>

                            {/* Time spent */}
                            <div className="col-span-1 text-center text-xs text-gray-400 font-medium">{timeDisplay}</div>

                            {/* Punctuality */}
                            <div className="col-span-2 flex justify-center">
                              {punctualityBadge}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── Quiz Results ───────────────────────────────────────── */}
              {panelTab === 'quiz' && (
                <div className="flex-1 overflow-hidden flex">
                  <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
                    {quizData.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-10 text-center">
                        <HelpCircle className="w-8 h-8 text-gray-200" />
                        <p className="text-sm text-gray-400">No students or quiz data yet</p>
                      </div>
                    ) : (
                      <>
                        {/* Student navigator */}
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50 shrink-0">
                          <button onClick={() => setQuizStudentIdx(i => Math.max(0, i - 1))}
                            disabled={quizStudentIdx === 0}
                            className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-white transition-colors">
                            <ArrowLeft className="w-4 h-4 text-gray-500" />
                          </button>

                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <img src={currentQuizStudent?.student?.avatar_url || '/default-avatar.png'}
                              className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0" alt="" />
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-gray-800 truncate">
                                {currentQuizStudent?.student?.username}
                              </p>
                              <p className="text-xs text-gray-400">
                                {currentQuizStudent?.attempts?.length ?? 0} attempt{currentQuizStudent?.attempts?.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>

                          <span className="text-xs text-gray-400 font-semibold shrink-0">
                            {quizStudentIdx + 1} / {quizData.length}
                          </span>

                          <button onClick={() => setQuizStudentIdx(i => Math.min(quizData.length - 1, i + 1))}
                            disabled={quizStudentIdx === quizData.length - 1}
                            className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-white transition-colors">
                            <ArrowRight className="w-4 h-4 text-gray-500" />
                          </button>

                          <button onClick={() => setShowScoresSidebar(s => !s)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-white transition-colors ml-2">
                            <ClipboardList className="w-3.5 h-3.5" />Scores
                          </button>
                        </div>

                        {/* Best attempt score bar */}
                        {currentQuizStudent?.best ? (() => {
                          const best        = currentQuizStudent.best
                          // score is stored as a PERCENTAGE (0-100) by quizService
                          const pct         = attemptPct(best)
                          // correctCount derived from pct × total_items
                          const correctCount = Math.round((pct / 100) * best.total_items)
                          // passing_score is a RAW COUNT in the DB — compare counts
                          const passed      = didPass(best, quizPassingScore)
                          const late        = due && new Date(best.completed_at) > due
                          return (
                            <div className="px-6 py-3 flex items-center gap-4 flex-wrap border-b border-gray-50 shrink-0">
                              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${passed === true ? 'bg-green-50' : passed === false ? 'bg-red-50' : 'bg-gray-50'}`}>
                                <Trophy className={`w-4 h-4 ${passed === true ? 'text-green-600' : passed === false ? 'text-red-500' : 'text-gray-400'}`} />
                                <div>
                                  <p className={`text-lg font-black leading-none ${passed === true ? 'text-green-700' : passed === false ? 'text-red-600' : 'text-gray-700'}`}>{pct}%</p>
                                  <p className="text-xs text-gray-400">Best score</p>
                                </div>
                              </div>
                              <p className="text-sm text-gray-500">
                                <span className="font-bold text-gray-700">{correctCount}</span> / {best.total_items} correct
                              </p>
                              {passed !== null && (
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                  {passed ? '✓ Passed' : '✗ Failed'}
                                </span>
                              )}
                              {quizPassingScore != null && (
                                <span className="text-xs text-gray-400">Pass: {quizPassingScore}/{best.total_items} correct</span>
                              )}
                              <span className={`text-xs ml-auto ${late ? 'text-red-500' : 'text-gray-400'}`}>
                                {formatDistanceToNow(new Date(best.completed_at), { addSuffix: true })}
                                {late && ' · Late'}
                              </span>
                            </div>
                          )
                        })() : (
                          <div className="px-6 py-4 text-sm text-gray-400 bg-gray-50 border-b border-gray-100 shrink-0">
                            No attempts yet for this student.
                          </div>
                        )}

                        {/* Question breakdown */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-3">
                          {questions.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-8">No questions found.</p>
                          ) : questions.map((q, qi) => {
                            const answers = currentQuizStudent?.best?.answers ?? {}
                            const opts    = Array.isArray(q.options)
                              ? q.options
                              : Object.values(q.options ?? {})

                            // Resolve the answer format: may be integer index OR text string
                            const studentAnswer = currentQuizStudent?.best
                              ? resolveStudentAnswer(answers, q, qi)
                              : null
                            const isCorrect = studentAnswer !== null && studentAnswer === q.correct_answer

                            return (
                              <div key={q.id} className={`rounded-2xl border p-4 ${
                                !currentQuizStudent?.best ? 'border-gray-100 bg-gray-50'
                                : isCorrect               ? 'border-green-200 bg-green-50/50'
                                :                           'border-red-200 bg-red-50/50'
                              }`}>
                                <div className="flex items-start gap-2 mb-3">
                                  <span className="shrink-0 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                    {qi + 1}
                                  </span>
                                  <p className="text-sm font-semibold text-gray-800 flex-1">{q.question_text}</p>
                                  {currentQuizStudent?.best && (
                                    isCorrect
                                      ? <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                                      : <XCircle    className="w-4 h-4 text-red-500 shrink-0"   />
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  {opts.map((opt, oi) => {
                                    const isCorrectOpt    = opt === q.correct_answer
                                    const isStudentChoice = opt === studentAnswer
                                    let cls = 'border-gray-200 bg-white text-gray-600'
                                    if (isCorrectOpt)              cls = 'border-green-400 bg-green-100 text-green-800 font-semibold'
                                    else if (isStudentChoice)      cls = 'border-red-400 bg-red-100 text-red-700'
                                    return (
                                      <div key={oi} className={`px-3 py-2 rounded-xl border text-xs flex items-center gap-2 ${cls}`}>
                                        {isCorrectOpt                        && <Check className="w-3 h-3 text-green-600 shrink-0" />}
                                        {isStudentChoice && !isCorrectOpt    && <X     className="w-3 h-3 text-red-500 shrink-0"   />}
                                        {!isCorrectOpt   && !isStudentChoice && <span className="w-3 shrink-0" />}
                                        <span className="flex-1">{opt}</span>
                                        {isStudentChoice && <span className="text-[10px] font-bold opacity-60 shrink-0">Chosen</span>}
                                      </div>
                                    )
                                  })}
                                </div>
                                {/* Show unanswered state clearly */}
                                {currentQuizStudent?.best && studentAnswer === null && (
                                  <p className="text-xs text-gray-400 mt-2 italic">Not answered</p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Scores sidebar */}
                  {showScoresSidebar && quizData.length > 0 && (
                    <div className="w-56 border-l border-gray-100 flex flex-col bg-gray-50 shrink-0">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Score Board</p>
                      </div>
                      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                        {quizData
                          .slice()
                          .sort((a, b) => {
                            // score is already 0-100 percentage — sort descending
                            const aP = a.best ? a.best.score : -1
                            const bP = b.best ? b.best.score : -1
                            return bP - aP
                          })
                          .map((qs, rank) => {
                            // score is already a percentage
                            const pct    = qs.best ? attemptPct(qs.best) : null
                            const passed = didPass(qs.best, quizPassingScore)
                            const isSelected = qs.studentId === currentQuizStudent?.studentId
                            return (
                              <button key={qs.studentId}
                                onClick={() => setQuizStudentIdx(quizData.findIndex(q => q.studentId === qs.studentId))}
                                className={`w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-white transition-colors ${isSelected ? 'bg-white shadow-sm' : ''}`}>
                                <span className="text-xs font-bold text-gray-400 w-5 shrink-0">{rank + 1}</span>
                                <img src={qs.student?.avatar_url || '/default-avatar.png'}
                                  className="w-6 h-6 rounded-full object-cover border border-gray-200 shrink-0" alt="" />
                                <p className="text-xs font-semibold text-gray-700 truncate flex-1">{qs.student?.username}</p>
                                {pct !== null
                                  ? <span className={`text-xs font-black shrink-0 ${passed === true ? 'text-green-600' : passed === false ? 'text-red-500' : 'text-gray-500'}`}>{pct}%</span>
                                  : <span className="text-xs text-gray-300 shrink-0">—</span>}
                              </button>
                            )
                          })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Activity / Grading ─────────────────────────────────── */}
              {panelTab === 'activity' && (
                <div className="flex-1 overflow-y-auto">
                  <div className="px-6 py-3 border-b border-gray-50 bg-gray-50">
                    <p className="text-xs text-gray-500">
                      Assign grades (0–100) and optional feedback. Saved per-student to the database.
                    </p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    <div className="grid grid-cols-12 px-6 py-2 bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wide">
                      <span className="col-span-4">Student</span>
                      <span className="col-span-2 text-center">Status</span>
                      <span className="col-span-2 text-center">Grade /100</span>
                      <span className="col-span-3">Feedback</span>
                      <span className="col-span-1 text-center">Save</span>
                    </div>
                    {studentProgress.map(({ student, status }) => {
                      const sid = student?.id
                      const g   = grades[sid] ?? { grade: '', feedback: '' }
                      return (
                        <div key={sid} className="grid grid-cols-12 items-center px-6 py-3 gap-2">
                          <div className="col-span-4 flex items-center gap-2">
                            <img src={student?.avatar_url || '/default-avatar.png'}
                              className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0" alt="" />
                            <p className="text-sm font-semibold text-gray-800 truncate">{student?.username}</p>
                          </div>
                          <div className="col-span-2 flex justify-center">
                            {status === 'completed'   && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">Done</span>}
                            {status === 'in_progress' && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">In Progress</span>}
                            {status === 'not_started' && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-bold rounded-full">Pending</span>}
                          </div>
                          <div className="col-span-2 flex justify-center">
                            <input type="number" min={0} max={100} value={g.grade}
                              onChange={e => setGrades(prev => ({ ...prev, [sid]: { ...prev[sid], grade: e.target.value } }))}
                              placeholder="—"
                              className="w-16 px-2 py-1.5 text-sm text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blockly-purple/30 bg-white font-semibold" />
                          </div>
                          <div className="col-span-3">
                            <input type="text" value={g.feedback}
                              onChange={e => setGrades(prev => ({ ...prev, [sid]: { ...prev[sid], feedback: e.target.value } }))}
                              placeholder="Add feedback…"
                              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blockly-purple/30 bg-white" />
                          </div>
                          <div className="col-span-1 flex justify-center">
                            <button onClick={() => handleSaveGrade(sid)} disabled={savingGrade === sid}
                              className="p-1.5 rounded-lg bg-blockly-purple text-white hover:bg-blockly-purple/90 disabled:opacity-50 transition-colors">
                              {savingGrade === sid
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Check   className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Teacher Lesson Card ──────────────────────────────────────────────────────
function TeacherLessonCard({ assignment, enrollments, classroomId, onRemove }) {
  const lesson     = assignment.lesson
  const [openDetail, setOpenDetail] = useState(false)
  if (!lesson) return null

  const due        = assignment.due_date ? new Date(assignment.due_date) : null
  const overdue    = due && isPast(due)
  const daysLeft   = due ? differenceInDays(due, new Date()) : null
  const hasQuiz    = lessonHasQuiz(assignment)
  const isActivity = assignment.assignment_type === 'learn_topic'
  const studentCount = enrollments.filter(e => e.status === 'active').length

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
        <div className={`h-1 w-full ${isActivity ? 'bg-amber-400' : hasQuiz ? 'bg-sky-400' : 'bg-blockly-purple/40'}`} />
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isActivity ? 'bg-amber-50' : hasQuiz ? 'bg-sky-50' : 'bg-purple-50'}`}>
              {isActivity   ? <FlaskConical className="w-4 h-4 text-amber-600" />
               : hasQuiz    ? <HelpCircle   className="w-4 h-4 text-sky-600" />
               :               <BookOpen    className="w-4 h-4 text-blockly-purple" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 truncate text-sm">{lesson.title}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {isActivity  && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold border border-amber-200">Activity</span>}
                {hasQuiz && !isActivity && <span className="text-xs bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full font-semibold border border-sky-200">Quiz</span>}
                {lesson.estimated_duration && (
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{lesson.estimated_duration}m</span>
                )}
                {due && (
                  <span className={`text-xs font-semibold flex items-center gap-1 ${overdue ? 'text-red-500' : daysLeft === 0 ? 'text-orange-500' : daysLeft != null && daysLeft <= 3 ? 'text-amber-500' : 'text-gray-400'}`}>
                    <Calendar className="w-3 h-3" />
                    {overdue ? 'Overdue' : daysLeft === 0 ? 'Due today' : `Due ${format(due, 'MMM d')}`}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                Posted {formatDistanceToNow(new Date(assignment.assigned_at), { addSuffix: true })}
                {' · '}{studentCount} student{studentCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setOpenDetail(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blockly-purple bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <Eye className="w-3.5 h-3.5" />View
              </button>
              <button onClick={() => onRemove(assignment)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {openDetail && (
        <LessonDetailPanel
          assignment={assignment}
          enrollments={enrollments}
          classroomId={classroomId}
          onClose={() => setOpenDetail(false)}
        />
      )}
    </>
  )
}

// ─── Performance tab ──────────────────────────────────────────────────────────
function PerformanceTab({ performanceData }) {
  const navigate      = useNavigate()
  const { classroomId } = useParams()

  const totalStudents = performanceData.length
  const avgCompletion = totalStudents
    ? Math.round(performanceData.reduce((s, p) => s + (p.lessonStats?.total ? (p.lessonStats.completed / p.lessonStats.total) * 100 : 0), 0) / totalStudents)
    : 0
  const withQuiz      = performanceData.filter(p => p.avgQuizScore !== null)
  const avgQuizScore  = withQuiz.length ? Math.round(withQuiz.reduce((s, p) => s + p.avgQuizScore, 0) / withQuiz.length) : null
  const totalBadges   = performanceData.reduce((s, p) => s + (p.badgeCount ?? 0), 0)

  const sorted = [...performanceData].sort((a, b) => {
    const aComp = a.lessonStats?.total ? a.lessonStats.completed / a.lessonStats.total : 0
    const bComp = b.lessonStats?.total ? b.lessonStats.completed / b.lessonStats.total : 0
    return bComp - aComp || (b.avgQuizScore ?? 0) - (a.avgQuizScore ?? 0)
  })

  const donutData = [
    { name: 'Completed',   value: performanceData.reduce((s, p) => s + (p.lessonStats?.completed ?? 0), 0), fill: C.green },
    { name: 'Missing',     value: performanceData.reduce((s, p) => s + (p.lessonStats?.missing  ?? 0), 0), fill: C.red   },
    { name: 'Not Started', value: performanceData.reduce((s, p) => s + Math.max(0, (p.lessonStats?.total ?? 0) - (p.lessonStats?.completed ?? 0) - (p.lessonStats?.missing ?? 0)), 0), fill: C.gray },
  ].filter(d => d.value > 0)

  const barData = sorted.slice(0, 10).map(p => ({
    name: (p.student?.username ?? '').length > 12 ? p.student.username.slice(0, 10) + '…' : (p.student?.username ?? ''),
    'Completion %': p.lessonStats?.total ? Math.round((p.lessonStats.completed / p.lessonStats.total) * 100) : 0,
    'Quiz Score %': p.avgQuizScore ?? 0,
  }))

  if (!totalStudents) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <BarChart2 className="w-8 h-8 text-gray-200" />
        <p className="text-sm text-gray-400">No student data yet</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users}      label="Students"       value={totalStudents}                                   color={C.purple} bg={C.purpleL} />
        <StatCard icon={Target}     label="Avg Completion" value={`${avgCompletion}%`}                             color={C.green}  bg={C.greenL}  />
        <StatCard icon={TrendingUp} label="Avg Quiz Score" value={avgQuizScore != null ? `${avgQuizScore}%` : '—'} color={C.sky}    bg={C.skyL}    />
        <StatCard icon={Award}      label="Badges Earned"  value={totalBadges}                                     color={C.amber}  bg={C.amberL}  sub="class total" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Assignment Status Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {donutData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip content={<ChartTip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-1">Top Students</h3>
          <p className="text-xs text-gray-400 mb-4">Up to 10 — completion % and quiz score</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip content={<ChartTip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="Completion %" fill={C.purple} radius={[3,3,0,0]} maxBarSize={18} />
              <Bar dataKey="Quiz Score %" fill={C.sky}    radius={[3,3,0,0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-800">All Students</h3>
        </div>
        <div className="divide-y divide-gray-50">
          <div className="grid grid-cols-6 px-6 py-2 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wide">
            <span className="col-span-2">Student</span>
            <span className="text-center">Completed</span>
            <span className="text-center">Missing</span>
            <span className="text-center">Avg Quiz</span>
            <span className="text-center">On-Time</span>
          </div>
          {sorted.map(p => {
            const pct = p.lessonStats?.total ? Math.round((p.lessonStats.completed / p.lessonStats.total) * 100) : 0
            return (
              <button key={p.enrollment?.id}
                onClick={() => navigate(`/teacher/classrooms/${classroomId}/student/${p.student?.id}`)}
                className="w-full grid grid-cols-6 items-center px-6 py-3 hover:bg-gray-50 transition-colors text-left">
                <div className="col-span-2 flex items-center gap-3">
                  <img src={p.student?.avatar_url || '/default-avatar.png'} alt={p.student?.username}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{p.student?.username}</p>
                    <div className="w-20 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-blockly-purple rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
                <span className="text-center text-sm font-semibold text-green-600">{p.lessonStats?.completed ?? 0}</span>
                <span className="text-center text-sm font-semibold text-red-500">{p.lessonStats?.missing ?? 0}</span>
                <span className="text-center text-sm font-semibold text-sky-600">{p.avgQuizScore != null ? `${p.avgQuizScore}%` : '—'}</span>
                <span className="text-center text-sm font-semibold text-amber-600">{p.onTimeCount ?? 0}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Confirm modal ────────────────────────────────────────────────────────────
function ConfirmModal({ title, message, confirmText, danger, loading, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-base font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-50 transition-colors
              ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'}`}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TeacherClassroomDetail() {
  const { classroomId } = useParams()
  const navigate  = useNavigate()
  const addToast  = useUIStore(s => s.addToast)

  const {
    currentClassroom, performanceData, loading,
    fetchClassroomDetail, fetchClassroomPerformance,
    archiveClassroom, deleteClassroom, regenerateCode, removeStudent,
  } = useClassroomStore()

  const { lessons, fetchClassroomAssignments } = useLessonStore()

  const [activeTab,       setActiveTab]       = useState('lessons')
  const [showPostLesson,  setShowPostLesson]   = useState(false)
  const [removingLesson,  setRemovingLesson]   = useState(null)
  const [removingStudent, setRemovingStudent]  = useState(null)
  const [actionLoading,   setActionLoading]    = useState(false)
  const [copied,          setCopied]           = useState(false)
  const [showArchive,     setShowArchive]       = useState(false)
  const [showDelete,      setShowDelete]        = useState(false)

  const refresh = useCallback(() => {
    fetchClassroomDetail(classroomId)
    fetchClassroomAssignments(classroomId)
    fetchClassroomPerformance(classroomId)
  }, [classroomId])

  useEffect(() => { refresh() }, [classroomId])

  const copyCode = () => {
    navigator.clipboard.writeText(currentClassroom?.class_code ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerateCode = async () => {
    setActionLoading(true)
    try { await regenerateCode(classroomId); addToast('Code regenerated', 'success') }
    catch (err) { addToast(err.message, 'error') }
    finally { setActionLoading(false) }
  }

  const handleRemoveLesson = async () => {
    if (!removingLesson) return
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('lesson_assignments')
        .delete()
        .eq('id', removingLesson.id)
      if (error) throw error
      addToast('Lesson removed', 'info')
      fetchClassroomAssignments(classroomId)
    } catch (err) { addToast(err.message, 'error') }
    finally { setActionLoading(false); setRemovingLesson(null) }
  }

  const handleRemoveStudent = async () => {
    if (!removingStudent) return
    setActionLoading(true)
    try {
      await removeStudent(removingStudent.id)
      addToast(`${removingStudent.student?.username} removed`, 'info')
      setRemovingStudent(null)
    } catch (err) { addToast(err.message, 'error') }
    finally { setActionLoading(false) }
  }

  const handleArchive = async () => {
    setActionLoading(true)
    try { await archiveClassroom(classroomId); addToast('Classroom archived', 'info'); navigate('/teacher/classrooms') }
    catch (err) { addToast(err.message, 'error') }
    finally { setActionLoading(false); setShowArchive(false) }
  }

  const handleDelete = async () => {
    setActionLoading(true)
    try { await deleteClassroom(classroomId); addToast('Classroom deleted', 'info'); navigate('/teacher/classrooms') }
    catch (err) { addToast(err.message, 'error') }
    finally { setActionLoading(false); setShowDelete(false) }
  }

  const allAssignments = lessons.filter(la => la.lesson)

  const lessonItems   = allAssignments.filter(la =>
    la.assignment_type === 'lesson' || la.assignment_type === 'quiz'
  )
  const quizItems     = lessonItems.filter(la => lessonHasQuiz(la))
  const activityItems = allAssignments.filter(la =>
    la.assignment_type === 'learn_topic'
  )

  const listToShow = activeTab === 'quizzes'    ? quizItems
                   : activeTab === 'activities' ? activityItems
                   : lessonItems

  const enrollments  = currentClassroom?.classroom_enrollments ?? []
  const studentCount = enrollments.filter(e => e.status === 'active').length

  const tabCounts = {
    lessons:    lessonItems.length,
    quizzes:    quizItems.length,
    activities: activityItems.length,
  }

  return (
    <PageWrapper
      title={currentClassroom?.name ?? 'Classroom'}
      subtitle={currentClassroom?.description}
    >
      {/* Header bar */}
      {currentClassroom && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 mb-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
              <div>
                <p className="text-xs text-gray-400">Class Code</p>
                <p className="text-base font-bold text-blockly-purple tracking-widest">{currentClassroom.class_code}</p>
              </div>
              <button onClick={copyCode} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors" title="Copy">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
              <button onClick={handleRegenerateCode} disabled={actionLoading} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors" title="Regenerate">
                <RefreshCw className={`w-4 h-4 text-gray-400 ${actionLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>{studentCount} student{studentCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/teacher/lessons/create')}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-blockly-purple bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors">
              <Plus className="w-4 h-4" />Create Lesson
            </button>
            <button onClick={() => setShowPostLesson(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-blockly-purple text-white hover:bg-blockly-purple/90 rounded-xl transition-colors">
              <BookOpen className="w-4 h-4" />Post Lesson
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-5 overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors relative
              ${activeTab === key ? 'text-blockly-purple' : 'text-gray-500 hover:text-gray-700'}`}>
            <Icon className="w-3.5 h-3.5" />{label}
            {tabCounts[key] != null && tabCounts[key] > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
                ${activeTab === key ? 'bg-blockly-purple/10 text-blockly-purple' : 'bg-gray-100 text-gray-400'}`}>
                {tabCounts[key]}
              </span>
            )}
            {activeTab === key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blockly-purple" />}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && !lessons.length ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      ) : (
        <>
          {['lessons', 'quizzes', 'activities'].includes(activeTab) && (
            <div className="flex flex-col gap-3">
              {listToShow.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <BookOpen className="w-8 h-8 text-gray-200" />
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      No {activeTab === 'activities' ? 'activities' : activeTab} posted yet
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {activeTab === 'quizzes'
                        ? 'Post a lesson that has a quiz attached — it will appear here automatically'
                        : activeTab === 'activities'
                          ? 'Post a learn topic activity to see it here'
                          : 'Use "Post Lesson" to add content to this classroom'}
                    </p>
                  </div>
                  {activeTab === 'lessons' && (
                    <button onClick={() => setShowPostLesson(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blockly-purple text-white text-sm font-semibold rounded-xl hover:bg-blockly-purple/90 transition-colors">
                      <Plus className="w-4 h-4" />Post a Lesson
                    </button>
                  )}
                </div>
              ) : listToShow.map(la => (
                <TeacherLessonCard key={la.id} assignment={la} enrollments={enrollments}
                  classroomId={classroomId} onRemove={setRemovingLesson} />
              ))}
            </div>
          )}

          {activeTab === 'performance' && <PerformanceTab performanceData={performanceData} />}

          {activeTab === 'members' && (
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                  <h3 className="font-bold text-gray-800">
                    Students <span className="ml-2 text-sm font-normal text-gray-400">({studentCount})</span>
                  </h3>
                </div>
                {studentCount === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-10">No students enrolled yet</p>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {enrollments.filter(e => e.status === 'active').map(enrollment => {
                      const student = enrollment.student
                      if (!student) return null
                      return (
                        <div key={enrollment.id} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors">
                          <img src={student.avatar_url || '/default-avatar.png'} alt={student.username}
                            className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800">{student.username}</p>
                            <p className="text-xs text-gray-400">
                              Joined {format(new Date(enrollment.enrolled_at), 'MMM d, yyyy')}
                              {student.last_login && ` · Last seen ${format(new Date(student.last_login), 'MMM d')}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => navigate(`/teacher/classrooms/${classroomId}/student/${student.id}`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blockly-purple bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                              <User className="w-3.5 h-3.5" />View Progress
                            </button>
                            <button onClick={() => setRemovingStudent(enrollment)}
                              className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
                <h3 className="font-bold text-red-600 mb-4">Danger Zone</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => setShowArchive(true)}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-colors">
                    <Archive className="w-4 h-4" />Archive Classroom
                  </button>
                  <button onClick={() => setShowDelete(true)}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors">
                    <Trash2 className="w-4 h-4" />Delete Classroom
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Post Lesson Modal — fetch only after close to avoid render race */}
      {showPostLesson && (
        <PostLessonModal
          classroomId={classroomId}
          onClose={() => {
            setShowPostLesson(false)
            setTimeout(() => fetchClassroomAssignments(classroomId), 150)
          }}
          onSuccess={() => {}}
        />
      )}

      {removingLesson && (
        <ConfirmModal title="Remove Lesson?"
          message={`Remove "${removingLesson.lesson?.title ?? removingLesson.title}" from this classroom? Students will lose access but the lesson itself won't be deleted.`}
          confirmText="Remove" danger loading={actionLoading}
          onConfirm={handleRemoveLesson} onClose={() => setRemovingLesson(null)} />
      )}
      {removingStudent && (
        <ConfirmModal title="Remove Student?"
          message={`Remove ${removingStudent.student?.username} from this classroom?`}
          confirmText="Remove" danger loading={actionLoading}
          onConfirm={handleRemoveStudent} onClose={() => setRemovingStudent(null)} />
      )}
      {showArchive && (
        <ConfirmModal title="Archive Classroom?"
          message={`"${currentClassroom?.name}" will be archived. Existing data is preserved.`}
          confirmText="Archive" loading={actionLoading}
          onConfirm={handleArchive} onClose={() => setShowArchive(false)} />
      )}
      {showDelete && (
        <ConfirmModal title="Delete Classroom?"
          message={`"${currentClassroom?.name}" and ALL its data will be permanently deleted. This cannot be undone.`}
          confirmText="Delete" danger loading={actionLoading}
          onConfirm={handleDelete} onClose={() => setShowDelete(false)} />
      )}
    </PageWrapper>
  )
}