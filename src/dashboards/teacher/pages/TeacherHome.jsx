import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '../../../store/authStore'
import { useClassroomStore } from '../../../store/classroomStore'
import PageWrapper from '../../../components/layout/PageWrapper'
import {
  BookOpen, Users, HelpCircle, GraduationCap,
  Plus, ChevronRight, Award, TrendingUp, Clock,
  BookMarked, Zap, ArrowRight, BarChart2, Star,
  AlertCircle, CheckCircle2, Loader2,
} from 'lucide-react'
import { formatDistanceToNow, format, isPast } from 'date-fns'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

// ─── Colour palette (matches rest of app) ────────────────────────────────────
const C = {
  purple: '#7c3aed', purpleL: '#ede9fe',
  green:  '#22c55e', greenL:  '#dcfce7',
  amber:  '#f59e0b', amberL:  '#fef3c7',
  sky:    '#0ea5e9', skyL:    '#e0f2fe',
  red:    '#ef4444', redL:    '#fee2e2',
}

// ─── Greeting ─────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = C.purple, bg = C.purpleL, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 text-left w-full transition-all hover:shadow-md hover:-translate-y-0.5 ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
        <p className="text-xs font-semibold text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
      </div>
      {onClick && <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />}
    </button>
  )
}

// ─── Quick action button ──────────────────────────────────────────────────────
function QuickAction({ icon: Icon, label, desc, color, bg, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left w-full group"
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all shrink-0" />
    </button>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, title, desc, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
        <Icon className="w-5 h-5 text-gray-300" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-500">{title}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      {action && (
        <button
          onClick={onAction}
          className="flex items-center gap-1.5 px-4 py-2 bg-blockly-purple text-white text-xs font-semibold rounded-lg hover:bg-blockly-purple/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> {action}
        </button>
      )}
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, subtitle, action, onAction, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
        <div>
          <h2 className="font-bold text-gray-800">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {action && (
          <button
            onClick={onAction}
            className="flex items-center gap-1.5 text-xs font-semibold text-blockly-purple hover:text-blockly-purple/80 transition-colors"
          >
            {action} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div>{children}</div>
    </div>
  )
}

// ─── Activity chart tooltip ───────────────────────────────────────────────────
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TeacherHome() {
  const navigate  = useNavigate()
  const profile   = useAuthStore((s) => s.profile)
  const {
    classrooms,
    loading,
    fetchTeacherClassrooms,
    aggregatePerformance,
    fetchAggregatePerformance,
  } = useClassroomStore()

  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    if (profile?.id) {
      fetchTeacherClassrooms(profile.id)
      fetchAggregatePerformance(profile.id)
    }
  }, [profile?.id])

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalStudents   = aggregatePerformance?.totalStudents    ?? 0
  const totalBadges     = aggregatePerformance?.totalBadges      ?? 0
  const avgCompletion   = aggregatePerformance?.overallCompletion ?? 0
  const avgQuizScore    = aggregatePerformance?.overallAvgScore   ?? null
  const activeClassrooms = classrooms.filter((c) => !c.is_archived)

  // Build a small sparkline dataset from per-classroom completion
  const byClassroom = aggregatePerformance?.byClassroom ?? {}
  const classroomList = Object.entries(byClassroom).map(([id, data]) => ({ id, ...data }))

  const sparkData = classroomList.slice(0, 7).map((c, i) => ({
    name: c.name?.slice(0, 8) ?? `C${i + 1}`,
    completion: c.completionRate ?? 0,
    quiz: c.avgQuizScore ?? 0,
  }))

  // Most recent classrooms (show up to 4)
  const recentClassrooms = [...activeClassrooms]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4)

  // Active classrooms sorted by student count for top-performers widget
  const topClassrooms = [...classroomList]
    .sort((a, b) => (b.students ?? 0) - (a.students ?? 0))
    .slice(0, 3)

  return (
    <PageWrapper
      title={`${getGreeting()}, ${profile?.username ?? 'Teacher'}`}
      subtitle="Here's what's happening across your classrooms today."
    >
      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={GraduationCap}
          label="Active Classrooms"
          value={loading ? '—' : activeClassrooms.length}
          sub={activeClassrooms.length === 0 ? 'Create your first' : `${activeClassrooms.length} running`}
          color={C.purple}
          bg={C.purpleL}
          onClick={() => navigate('/teacher/classrooms')}
        />
        <StatCard
          icon={Users}
          label="Total Students"
          value={loading ? '—' : totalStudents}
          sub="across all classrooms"
          color={C.sky}
          bg={C.skyL}
          onClick={() => navigate('/teacher/classrooms')}
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Completion"
          value={loading ? '—' : `${avgCompletion}%`}
          sub="lesson completion rate"
          color={C.green}
          bg={C.greenL}
        />
        <StatCard
          icon={Award}
          label="Badges Earned"
          value={loading ? '—' : totalBadges}
          sub="by all students"
          color={C.amber}
          bg={C.amberL}
        />
      </div>

      {/* ── Middle row: chart + quick actions ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Completion chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-gray-800">Classroom Performance</h2>
              <p className="text-xs text-gray-400 mt-0.5">Completion & quiz scores per classroom</p>
            </div>
            <button
              onClick={() => navigate('/teacher/classrooms')}
              className="text-xs font-semibold text-blockly-purple hover:text-blockly-purple/80 flex items-center gap-1"
            >
              Details <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {sparkData.length === 0 ? (
            <EmptyState
              icon={BarChart2}
              title="No performance data yet"
              desc="Add students to your classrooms to see data here."
            />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={sparkData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.purple} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={C.purple} stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="gradQuiz" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.sky} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={C.sky} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip content={<ChartTip />} />
                <Area
                  type="monotone"
                  dataKey="completion"
                  name="Completion"
                  stroke={C.purple}
                  strokeWidth={2}
                  fill="url(#gradComp)"
                  dot={{ r: 3, fill: C.purple }}
                />
                <Area
                  type="monotone"
                  dataKey="quiz"
                  name="Quiz Score"
                  stroke={C.sky}
                  strokeWidth={2}
                  fill="url(#gradQuiz)"
                  dot={{ r: 3, fill: C.sky }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex flex-col gap-3">
          <h2 className="font-bold text-gray-800 px-1">Quick Actions</h2>
          <QuickAction
            icon={Plus}
            label="New Classroom"
            desc="Set up a new class for your students"
            color={C.purple}
            bg={C.purpleL}
            onClick={() => navigate('/teacher/classrooms')}
          />
          <QuickAction
            icon={BookOpen}
            label="Create Lesson"
            desc="Build a lesson with rich content"
            color={C.sky}
            bg={C.skyL}
            onClick={() => navigate('/teacher/lessons/create')}
          />
          <QuickAction
            icon={HelpCircle}
            label="Create Quiz"
            desc="Design a quiz with questions & badges"
            color={C.green}
            bg={C.greenL}
            onClick={() => navigate('/teacher/quizzes/create')}
          />
          <QuickAction
            icon={Zap}
            label="Build Tutorial"
            desc="Step-by-step interactive coding guide"
            color={C.amber}
            bg={C.amberL}
            onClick={() => navigate('/teacher/tutorials/create')}
          />
        </div>
      </div>

      {/* ── Bottom row: classrooms + top performers ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent classrooms */}
        <Section
          title="My Classrooms"
          subtitle={`${activeClassrooms.length} active`}
          action="View all"
          onAction={() => navigate('/teacher/classrooms')}
        >
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
            </div>
          ) : recentClassrooms.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No classrooms yet"
              desc="Create a classroom and invite your students."
              action="New Classroom"
              onAction={() => navigate('/teacher/classrooms')}
            />
          ) : (
            <div className="divide-y divide-gray-50">
              {recentClassrooms.map((classroom) => {
                const enrollment = classroom.classroom_enrollments ?? []
                const count = typeof enrollment === 'number'
                  ? enrollment
                  : Array.isArray(enrollment) ? enrollment.length : 0
                const perf = byClassroom[classroom.id]
                return (
                  <button
                    key={classroom.id}
                    onClick={() => navigate(`/teacher/classrooms/${classroom.id}`)}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blockly-purple/10 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5 text-blockly-purple" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{classroom.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Code: <span className="font-mono font-bold text-blockly-purple">{classroom.class_code}</span>
                        {' · '}{formatDistanceToNow(new Date(classroom.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {perf && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blockly-purple rounded-full"
                              style={{ width: `${perf.completionRate ?? 0}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-500">{perf.completionRate ?? 0}%</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{perf?.students ?? 0} students</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors" />
                  </button>
                )
              })}
            </div>
          )}
        </Section>

        {/* Top classrooms by engagement */}
        <Section
          title="Class Leaderboard"
          subtitle="Ranked by student completion"
          action="Full report"
          onAction={() => navigate('/teacher/classrooms')}
        >
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
            </div>
          ) : topClassrooms.length === 0 ? (
            <EmptyState
              icon={Star}
              title="No data yet"
              desc="Student activity will appear here once classes start."
            />
          ) : (
            <div className="divide-y divide-gray-50">
              {topClassrooms.map((c, idx) => {
                const medals = ['🥇', '🥈', '🥉']
                return (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/teacher/classrooms/${c.id}`)}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <span className="text-xl w-8 shrink-0">{medals[idx] ?? `${idx + 1}.`}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{c.name}</p>
                      <p className="text-xs text-gray-400">
                        {c.students ?? 0} students
                        {c.avgQuizScore != null ? ` · ${c.avgQuizScore}% avg quiz` : ''}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-base font-black text-blockly-purple">{c.completionRate ?? 0}%</p>
                      <p className="text-xs text-gray-400">completion</p>
                    </div>
                  </button>
                )
              })}

              {/* Summary footer */}
              <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  {avgQuizScore != null
                    ? `Overall avg quiz score: ${avgQuizScore}%`
                    : 'No quiz data yet'}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  {totalBadges} badge{totalBadges !== 1 ? 's' : ''} earned
                </div>
              </div>
            </div>
          )}
        </Section>
      </div>

      {/* ── Tips / Getting started banner (only shown if no classrooms) ───────── */}
      {!loading && activeClassrooms.length === 0 && (
        <div className="bg-linear-to-br from-blockly-purple/5 to-blockly-purple/10 border border-blockly-purple/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blockly-purple/20 flex items-center justify-center shrink-0">
              <BookMarked className="w-5 h-5 text-blockly-purple" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 mb-1">Get started in 3 steps</h3>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Create a classroom and share the class code with your students.</li>
                <li>Write a lesson or build a tutorial for them to complete.</li>
                <li>Attach a quiz and award badges for passing — students love it!</li>
              </ol>
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => navigate('/teacher/classrooms')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blockly-purple text-white text-sm font-semibold rounded-lg hover:bg-blockly-purple/90 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Create Classroom
                </button>
                <button
                  onClick={() => navigate('/teacher/lessons/create')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white border border-blockly-purple/20 text-blockly-purple text-sm font-semibold rounded-lg hover:bg-blockly-purple/5 transition-colors"
                >
                  <BookOpen className="w-4 h-4" /> Create Lesson
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}