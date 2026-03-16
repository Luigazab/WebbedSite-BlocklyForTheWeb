import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '../../../store/authStore'
import { useClassroomStore } from '../../../store/classroomStore'
import { useClassroom } from '../../../hooks/useClassroom'
import PageWrapper from '../../../components/layout/PageWrapper'
import ClassroomCard from '../components/ClassroomCard'
import CreateClassroomModal from '../components/CreateClassroomModal'
import {
  Plus, Loader2, Archive, University, BarChart2,
  Users, Trophy, Target, TrendingUp, Award,
  ChevronRight,
} from 'lucide-react'
import { format } from 'date-fns'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'

const TABS = ['Classes', 'Performance', 'Archived']

// ─── Colour palette ───────────────────────────────────────────────────────────
const C = {
  purple: '#7c3aed', purpleL: '#ddd6fe',
  green:  '#22c55e', greenL:  '#dcfce7',
  amber:  '#f59e0b', amberL:  '#fef3c7',
  sky:    '#0ea5e9', skyL:    '#e0f2fe',
}
const BAR_COLORS = ['#7c3aed','#0ea5e9','#22c55e','#f59e0b','#f472b6','#fb923c']

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = C.purple, bg = C.purpleL }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
        <p className="text-xs font-semibold text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-xs">
      {label && <p className="font-bold text-gray-700 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill || p.color }} className="font-semibold">
          {p.name}: {p.value}{p.name?.includes('Rate') || p.name?.includes('Score') ? '%' : ''}
        </p>
      ))}
    </div>
  )
}

// ─── Performance tab ──────────────────────────────────────────────────────────
function PerformanceTab() {
  const navigate   = useNavigate()
  const profile    = useAuthStore((s) => s.profile)
  const { aggregatePerformance, performanceData, fetchAggregatePerformance } = useClassroomStore()
  const [classFilter, setClassFilter] = useState('all')

  useEffect(() => {
    if (profile?.id) fetchAggregatePerformance(profile.id)
  }, [profile?.id])

  if (!aggregatePerformance) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    )
  }

  const { byClassroom, totalStudents, totalBadges, overallAvgScore, overallCompletion, classrooms } = aggregatePerformance

  const classroomList = Object.entries(byClassroom).map(([id, data]) => ({ id, ...data }))

  // Filter for classroom-specific data if needed
  const filteredClassrooms = classFilter === 'all'
    ? classroomList
    : classroomList.filter((c) => c.id === classFilter)

  const completionBarData = filteredClassrooms.map((c, i) => ({
    name:           c.name.length > 14 ? c.name.slice(0, 12) + '…' : c.name,
    'Completion %': c.completionRate,
    fill:           BAR_COLORS[i % BAR_COLORS.length],
  }))

  const quizBarData = filteredClassrooms
    .filter((c) => c.avgQuizScore !== null)
    .map((c, i) => ({
      name:          c.name.length > 14 ? c.name.slice(0, 12) + '…' : c.name,
      'Avg Score %': c.avgQuizScore,
      fill:          BAR_COLORS[i % BAR_COLORS.length],
    }))

  return (
    <div className="flex flex-col gap-8">

      {/* Classroom filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold text-gray-600">View:</label>
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blockly-purple bg-white"
        >
          <option value="all">All Classrooms</option>
          {classroomList.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users}     label="Total Students"     value={totalStudents}            color={C.purple} bg={C.purpleL} />
        <StatCard icon={Target}    label="Avg Completion"     value={`${overallCompletion}%`}  color={C.green}  bg={C.greenL}  sub="across all classrooms" />
        <StatCard icon={TrendingUp} label="Avg Quiz Score"    value={overallAvgScore != null ? `${overallAvgScore}%` : '—'} color={C.sky} bg={C.skyL} />
        <StatCard icon={Award}     label="Badges Earned"      value={totalBadges}              color={C.amber}  bg={C.amberL}  sub="all students" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Lesson Completion by Classroom</h3>
          {!completionBarData.length ? (
            <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={completionBarData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip content={<ChartTip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="Completion %" radius={[4,4,0,0]} maxBarSize={44}>
                  {completionBarData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Avg Quiz Score by Classroom</h3>
          {!quizBarData.length ? (
            <p className="text-sm text-gray-400 text-center py-8">No quiz data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={quizBarData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip content={<ChartTip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="Avg Score %" radius={[4,4,0,0]} maxBarSize={44}>
                  {quizBarData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Per-classroom student table */}
      {filteredClassrooms.map((classroom) => {
        const classroomObj = classrooms?.find((c) => c.id === classroom.id)
        return (
          <div key={classroom.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div
              className="flex items-center justify-between px-6 py-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => navigate(`/teacher/classrooms/${classroom.id}`)}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blockly-purple/10 flex items-center justify-center">
                  <University className="w-4 h-4 text-blockly-purple" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">{classroom.name}</p>
                  <p className="text-xs text-gray-400">{classroom.students} student{classroom.students !== 1 ? 's' : ''} · {classroom.completionRate}% completion · {classroom.avgQuizScore != null ? `${classroom.avgQuizScore}% avg quiz` : 'No quizzes'}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* Student rows for this classroom */}
            {classroomObj?.classroom_enrollments?.length > 0 && (
              <div className="divide-y divide-gray-50">
                <div className="grid grid-cols-5 px-6 py-2 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wide">
                  <span className="col-span-2">Student</span>
                  <span className="text-center">Completion</span>
                  <span className="text-center">Avg Quiz</span>
                  <span className="text-center">On-Time</span>
                </div>
                {classroomObj.classroom_enrollments
                  .filter((e) => e.status === 'active' && e.student)
                  .map((enrollment) => (
                    <button
                      key={enrollment.id}
                      onClick={() => navigate(`/teacher/classrooms/${classroom.id}/student/${enrollment.student.id}`)}
                      className="w-full grid grid-cols-5 items-center px-6 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="col-span-2 flex items-center gap-3">
                        <img
                          src={enrollment.student.avatar_url || '/default-avatar.png'}
                          alt={enrollment.student.username}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        />
                        <span className="text-sm font-semibold text-gray-700">{enrollment.student.username}</span>
                      </div>
                      <span className="text-center text-sm text-gray-500">—</span>
                      <span className="text-center text-sm text-gray-500">—</span>
                      <span className="text-center text-sm text-gray-500">—</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Archived card ────────────────────────────────────────────────────────────
function ArchivedCard({ classroom, onDelete }) {
  const studentCount = classroom.classroom_enrollments?.[0]?.count ?? 0
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 opacity-70">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold text-gray-700">{classroom.name}</p>
          {classroom.description && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{classroom.description}</p>
          )}
        </div>
        <Archive className="w-4 h-4 text-gray-400 shrink-0" />
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{studentCount} students</span>
        <span>Archived {format(new Date(classroom.updated_at || classroom.created_at), 'MMM d, yyyy')}</span>
      </div>
      <button
        onClick={() => onDelete(classroom)}
        className="w-full py-2 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
      >
        Delete Permanently
      </button>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TeacherClassrooms() {
  const [activeTab,    setActiveTab]    = useState('Classes')
  const [showCreate,   setShowCreate]   = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]     = useState(false)

  const profile = useAuthStore((s) => s.profile)
  const { classrooms, archivedClassrooms, loading, fetchTeacherClassrooms, fetchArchivedClassrooms, deleteClassroom } = useClassroomStore()
  const { handleCreateClassroom, handleArchiveClassroom, handleRegenerateCode } = useClassroom?.() ?? useClassroomStore()

  // Use the hook version if available, otherwise fall back
  const classroomHook = (() => {
    try { return require('../../../hooks/useClassroom').useClassroom() } catch { return {} }
  })()
  const doCreate    = classroomHook.handleCreateClassroom    ?? (() => {})
  const doArchive   = classroomHook.handleArchiveClassroom   ?? (() => {})
  const doRegen     = classroomHook.handleRegenerateCode     ?? (() => {})

  useEffect(() => {
    if (profile?.id) {
      fetchTeacherClassrooms(profile.id)
      fetchArchivedClassrooms(profile.id)
    }
  }, [profile?.id])

  const onCreateSubmit = async (formData) => {
    await doCreate({ ...formData, teacher_id: profile.id })
    setShowCreate(false)
  }

  const onDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteClassroom(deleteTarget.id)
      setDeleteTarget(null)
    } finally { setDeleting(false) }
  }

  return (
    <PageWrapper
      title="My Classrooms"
      subtitle="Manage your classrooms and students"
      actions={
        activeTab === 'Classes' && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex btn items-center gap-2 px-4 py-2 bg-blockly-purple text-white text-sm font-semibold rounded-lg hover:bg-blockly-purple/90"
          >
            <Plus className="w-4 h-4" />
            New Classroom
          </button>
        )
      }
    >
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold transition-colors relative
              ${activeTab === tab ? 'text-blockly-purple' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blockly-purple" />
            )}
          </button>
        ))}
      </div>

      {/* Classes tab */}
      {activeTab === 'Classes' && (
        loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : classrooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center bg-gray-100 rounded-3xl">
            <div className="w-16 h-16 rounded-2xl bg-blockly-purple/10 flex items-center justify-center">
              <Plus className="w-8 h-8 text-blockly-purple" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">No classrooms yet</p>
              <p className="text-sm text-gray-400 mt-1">Create your first classroom to get started</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 btn py-2 bg-blockly-purple text-white text-sm font-semibold rounded-lg hover:bg-blockly-purple/90"
            >
              Create a Classroom
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {classrooms.map((classroom) => (
              <ClassroomCard
                key={classroom.id}
                classroom={classroom}
                onArchive={() => doArchive(classroom.id, classroom.name)}
                onRegenerateCode={() => doRegen(classroom.id)}
              />
            ))}
          </div>
        )
      )}

      {/* Performance tab */}
      {activeTab === 'Performance' && <PerformanceTab />}

      {/* Archived tab */}
      {activeTab === 'Archived' && (
        archivedClassrooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <Archive className="w-8 h-8 text-gray-300" />
            <p className="text-sm text-gray-400">No archived classrooms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {archivedClassrooms.map((classroom) => (
              <ArchivedCard
                key={classroom.id}
                classroom={classroom}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )
      )}

      {/* Modals */}
      {showCreate && (
        <CreateClassroomModal
          onSubmit={onCreateSubmit}
          onClose={() => setShowCreate(false)}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-base font-bold text-gray-800 mb-2">Delete Classroom?</h2>
            <p className="text-sm text-gray-500 mb-6">
              <strong>"{deleteTarget.name}"</strong> and all its assignment history will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}