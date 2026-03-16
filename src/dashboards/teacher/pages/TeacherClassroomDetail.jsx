import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useAuthStore } from '../../../store/authStore'
import { useClassroomStore } from '../../../store/classroomStore'
import { useLessonStore } from '../../../store/lessonStore'
import { useClassroom } from '../../../hooks/useClassroom'
import { useUIStore } from '../../../store/uiStore'
import { lessonService } from '../../../services/lesson.service'
import PageWrapper from '../../../components/layout/PageWrapper'
import PostLessonModal from '../components/PostLessonModal'
import {
  BookOpen, HelpCircle, FlaskConical, BarChart2, Users,
  Plus, Pencil, Loader2, Archive, Trash2, Copy, RefreshCw,
  Check, ChevronRight, Award, Trophy, Target, Clock,
  TrendingUp, AlertCircle, CheckCircle2, User,
} from 'lucide-react'
import { format, differenceInDays, isPast } from 'date-fns'
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
const BAR_COLORS = ['#7c3aed','#0ea5e9','#22c55e','#f59e0b','#f472b6','#fb923c']

const TABS = [
  { key: 'lessons',     label: 'Lessons',     icon: BookOpen   },
  { key: 'quizzes',     label: 'Quizzes',     icon: HelpCircle },
  { key: 'activities',  label: 'Activities',  icon: FlaskConical },
  { key: 'performance', label: 'Performance', icon: BarChart2  },
  { key: 'members',     label: 'Members',     icon: Users      },
]

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

// ─── Lesson assignment card (teacher view) ────────────────────────────────────
function TeacherLessonCard({ assignment, onRemove }) {
  const navigate = useNavigate()
  const lesson = assignment.lesson
  if (!lesson) return null

  const due = assignment.due_date ? new Date(assignment.due_date) : null
  const overdue = due && isPast(due)
  const daysLeft = due ? differenceInDays(due, new Date()) : null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
      <div className="h-1 w-full bg-blockly-purple/40" />
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 mt-0.5">
            <BookOpen className="w-4 h-4 text-blockly-purple" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 truncate">{lesson.title}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {lesson.estimated_duration && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />{lesson.estimated_duration}m
                </span>
              )}
              {(lesson.lesson_quizzes?.length ?? 0) > 0 && (
                <span className="text-xs bg-purple-50 text-blockly-purple px-2 py-0.5 rounded-full font-medium">Quiz</span>
              )}
              {due && (
                <span className={`text-xs font-semibold ${overdue ? 'text-red-500' : daysLeft === 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                  {overdue ? 'Overdue' : daysLeft === 0 ? 'Due today' : `Due ${format(due, 'MMM d')}`}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => navigate(`/teacher/lessons/${lesson.id}/edit`)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              title="Edit lesson"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onRemove(assignment)}
              className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              title="Remove from classroom"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Performance tab ──────────────────────────────────────────────────────────
function PerformanceTab({ performanceData, lessons }) {
  const navigate   = useNavigate()
  const { classroomId } = useParams()

  const totalStudents    = performanceData.length
  const avgCompletion    = totalStudents
    ? Math.round(performanceData.reduce((s, p) => s + (p.lessonStats.total ? (p.lessonStats.completed / p.lessonStats.total) * 100 : 0), 0) / totalStudents)
    : 0
  const avgQuiz          = performanceData.filter((p) => p.avgQuizScore !== null)
  const avgQuizScore     = avgQuiz.length ? Math.round(avgQuiz.reduce((s, p) => s + p.avgQuizScore, 0) / avgQuiz.length) : null
  const totalBadges      = performanceData.reduce((s, p) => s + p.badgeCount, 0)

  // Sort by completion for top performers
  const sorted = [...performanceData].sort((a, b) => {
    const aComp = a.lessonStats.total ? a.lessonStats.completed / a.lessonStats.total : 0
    const bComp = b.lessonStats.total ? b.lessonStats.completed / b.lessonStats.total : 0
    return bComp - aComp || (b.avgQuizScore ?? 0) - (a.avgQuizScore ?? 0)
  })

  // Charts
  const completionDonut = [
    { name: 'Completed',    value: performanceData.reduce((s, p) => s + p.lessonStats.completed, 0),    fill: C.green  },
    { name: 'Missing',      value: performanceData.reduce((s, p) => s + p.lessonStats.missing, 0),      fill: C.red    },
    { name: 'Not Started',  value: performanceData.reduce((s, p) => s + Math.max(0, p.lessonStats.total - p.lessonStats.completed - p.lessonStats.missing), 0), fill: C.gray },
  ].filter((d) => d.value > 0)

  const studentBarData = sorted.slice(0, 10).map((p) => ({
    name: (p.student?.username ?? '').length > 12 ? (p.student.username.slice(0, 10) + '…') : (p.student?.username ?? ''),
    'Completion %': p.lessonStats.total ? Math.round((p.lessonStats.completed / p.lessonStats.total) * 100) : 0,
    'Quiz Score %': p.avgQuizScore ?? 0,
  }))

  if (!performanceData.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <BarChart2 className="w-8 h-8 text-gray-200" />
        <p className="text-sm text-gray-400">No student data yet</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users}      label="Students"        value={totalStudents}                                 color={C.purple} bg={C.purpleL} />
        <StatCard icon={Target}     label="Avg Completion"  value={`${avgCompletion}%`}                           color={C.green}  bg={C.greenL}  />
        <StatCard icon={TrendingUp} label="Avg Quiz Score"  value={avgQuizScore != null ? `${avgQuizScore}%` : '—'} color={C.sky} bg={C.skyL} />
        <StatCard icon={Award}      label="Badges Earned"   value={totalBadges}                                   color={C.amber}  bg={C.amberL}  sub="class total" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Assignment Status Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={completionDonut} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {completionDonut.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip content={<ChartTip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-1">Top Students (up to 10)</h3>
          <p className="text-xs text-gray-400 mb-4">Completion % and quiz score</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={studentBarData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
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

      {/* Full student table */}
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
          {sorted.map((p) => {
            const pct = p.lessonStats.total
              ? Math.round((p.lessonStats.completed / p.lessonStats.total) * 100)
              : 0
            return (
              <button
                key={p.enrollment?.id}
                onClick={() => navigate(`/teacher/classrooms/${classroomId}/student/${p.student?.id}`)}
                className="w-full grid grid-cols-6 items-center px-6 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="col-span-2 flex items-center gap-3">
                  <img
                    src={p.student?.avatar_url || '/default-avatar.png'}
                    alt={p.student?.username}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{p.student?.username}</p>
                    <div className="w-20 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-blockly-purple rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
                <span className="text-center text-sm font-semibold text-green-600">{p.lessonStats.completed}</span>
                <span className="text-center text-sm font-semibold text-red-500">{p.lessonStats.missing}</span>
                <span className="text-center text-sm font-semibold text-sky-600">
                  {p.avgQuizScore != null ? `${p.avgQuizScore}%` : '—'}
                </span>
                <span className="text-center text-sm font-semibold text-amber-600">{p.onTimeCount}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TeacherClassroomDetail() {
  const { classroomId } = useParams()
  const navigate = useNavigate()
  const profile  = useAuthStore((s) => s.profile)
  const addToast = useUIStore((s) => s.addToast)

  const { currentClassroom, performanceData, loading, fetchClassroomDetail, fetchClassroomPerformance, archiveClassroom, deleteClassroom, regenerateCode, removeStudent } = useClassroomStore()
  const { lessons, fetchClassroomAssignments } = useLessonStore()

  const [activeTab,      setActiveTab]      = useState('lessons')
  const [showPostLesson, setShowPostLesson] = useState(false)
  const [removingLesson, setRemovingLesson] = useState(null)
  const [removingStudent,setRemovingStudent]= useState(null)
  const [actionLoading,  setActionLoading]  = useState(false)
  const [copied,         setCopied]         = useState(false)
  const [showArchive,    setShowArchive]     = useState(false)
  const [showDelete,     setShowDelete]      = useState(false)

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
    try {
      await regenerateCode(classroomId)
      addToast('Code regenerated', 'success')
    } catch (err) { addToast(err.message, 'error') }
    finally { setActionLoading(false) }
  }

  const handleRemoveLesson = async () => {
    if (!removingLesson) return
    setActionLoading(true)
    try {
      await lessonService.removeAssignment?.(removingLesson.id) ?? supabase.from('lesson_assignments').delete().eq('id', removingLesson.id)
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
    try {
      await archiveClassroom(classroomId)
      addToast(`"${currentClassroom?.name}" archived`, 'info')
      navigate('/teacher/classrooms')
    } catch (err) { addToast(err.message, 'error') }
    finally { setActionLoading(false); setShowArchive(false) }
  }

  const handleDelete = async () => {
    setActionLoading(true)
    try {
      await deleteClassroom(classroomId)
      addToast('Classroom deleted', 'info')
      navigate('/teacher/classrooms')
    } catch (err) { addToast(err.message, 'error') }
    finally { setActionLoading(false); setShowDelete(false) }
  }

  // Derived lists
  const allLessons   = lessons.filter((la) => la.lesson)
  const quizOnly     = allLessons.filter((la) => (la.lesson?.lesson_quizzes?.length ?? 0) > 0)
  const activityOnly = allLessons.filter((la) => la.assignment_type === 'learn_topic')
  const listToShow   = activeTab === 'quizzes'    ? quizOnly
                     : activeTab === 'activities' ? activityOnly
                     : allLessons

  const enrollments  = currentClassroom?.classroom_enrollments?.filter((e) => e.status === 'active') ?? []
  const studentCount = enrollments.length

  return (
    <PageWrapper
      title={currentClassroom?.name ?? 'Classroom'}
      subtitle={currentClassroom?.description}
    >
      {/* Header bar */}
      {currentClassroom && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 mb-2">
          <div className="flex items-center gap-4">
            {/* Class code */}
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
              <div>
                <p className="text-xs text-gray-400">Class Code</p>
                <p className="text-base font-bold text-blockly-purple tracking-widest">
                  {currentClassroom.class_code}
                </p>
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

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/teacher/lessons/create`)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-blockly-purple bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Lesson
            </button>
            <button
              onClick={() => setShowPostLesson(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-blockly-purple text-white hover:bg-blockly-purple/90 rounded-xl transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Post Lesson
            </button>
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
            {activeTab === key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blockly-purple" />}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {loading && !lessons.length ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      ) : (
        <>
          {/* Lessons / Quizzes / Activities */}
          {['lessons', 'quizzes', 'activities'].includes(activeTab) && (
            <div className="flex flex-col gap-3">
              {listToShow.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <BookOpen className="w-8 h-8 text-gray-200" />
                  <div>
                    <p className="text-sm font-semibold text-gray-500">No {activeTab} posted yet</p>
                    <p className="text-xs text-gray-400 mt-0.5">Use "Post Lesson" to add content to this classroom</p>
                  </div>
                  <button
                    onClick={() => setShowPostLesson(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blockly-purple text-white text-sm font-semibold rounded-xl hover:bg-blockly-purple/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />Post a Lesson
                  </button>
                </div>
              ) : listToShow.map((la) => (
                <TeacherLessonCard
                  key={la.id}
                  assignment={la}
                  onRemove={setRemovingLesson}
                />
              ))}
            </div>
          )}

          {/* Performance */}
          {activeTab === 'performance' && (
            <PerformanceTab performanceData={performanceData} lessons={allLessons} />
          )}

          {/* Members */}
          {activeTab === 'members' && (
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                  <h3 className="font-bold text-gray-800">
                    Students
                    <span className="ml-2 text-sm font-normal text-gray-400">({studentCount})</span>
                  </h3>
                </div>
                {!enrollments.length ? (
                  <p className="text-sm text-gray-400 text-center py-10">No students enrolled yet</p>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {enrollments.map((enrollment) => {
                      const student = enrollment.student
                      if (!student) return null
                      return (
                        <div key={enrollment.id} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors">
                          <img
                            src={student.avatar_url || '/default-avatar.png'}
                            alt={student.username}
                            className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800">{student.username}</p>
                            <p className="text-xs text-gray-400">
                              Joined {format(new Date(enrollment.enrolled_at), 'MMM d, yyyy')}
                              {student.last_login && ` · Last seen ${format(new Date(student.last_login), 'MMM d')}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => navigate(`/teacher/classrooms/${classroomId}/student/${student.id}`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blockly-purple bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                            >
                              <User className="w-3.5 h-3.5" />View Progress
                            </button>
                            <button
                              onClick={() => setRemovingStudent(enrollment)}
                              className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                              title="Remove student"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Classroom danger zone */}
              <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
                <h3 className="font-bold text-red-600 mb-4">Danger Zone</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowArchive(true)}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors border border-amber-200"
                  >
                    <Archive className="w-4 h-4" />Archive Classroom
                  </button>
                  <button
                    onClick={() => setShowDelete(true)}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-200"
                  >
                    <Trash2 className="w-4 h-4" />Delete Classroom
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Post Lesson Modal */}
      {showPostLesson && (
        <PostLessonModal
          classroomId={classroomId}
          onClose={() => setShowPostLesson(false)}
          onSuccess={() => fetchClassroomAssignments(classroomId)}
        />
      )}

      {/* Remove lesson confirm */}
      {removingLesson && (
        <ConfirmModal
          title="Remove Lesson?"
          message={`Remove "${removingLesson.lesson?.title}" from this classroom? Students will lose access but the lesson itself won't be deleted.`}
          confirmText="Remove"
          danger
          loading={actionLoading}
          onConfirm={handleRemoveLesson}
          onClose={() => setRemovingLesson(null)}
        />
      )}

      {/* Remove student confirm */}
      {removingStudent && (
        <ConfirmModal
          title="Remove Student?"
          message={`Remove ${removingStudent.student?.username} from this classroom?`}
          confirmText="Remove"
          danger
          loading={actionLoading}
          onConfirm={handleRemoveStudent}
          onClose={() => setRemovingStudent(null)}
        />
      )}

      {/* Archive confirm */}
      {showArchive && (
        <ConfirmModal
          title="Archive Classroom?"
          message={`"${currentClassroom?.name}" will be archived. Students won't be able to join but existing data is preserved.`}
          confirmText="Archive"
          loading={actionLoading}
          onConfirm={handleArchive}
          onClose={() => setShowArchive(false)}
        />
      )}

      {/* Delete confirm */}
      {showDelete && (
        <ConfirmModal
          title="Delete Classroom?"
          message={`"${currentClassroom?.name}" and ALL its data will be permanently deleted. This cannot be undone.`}
          confirmText="Delete"
          danger
          loading={actionLoading}
          onConfirm={handleDelete}
          onClose={() => setShowDelete(false)}
        />
      )}
    </PageWrapper>
  )
}

// ─── Reusable confirm modal ───────────────────────────────────────────────────
function ConfirmModal({ title, message, confirmText, danger, loading, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-base font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-50 transition-colors ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}