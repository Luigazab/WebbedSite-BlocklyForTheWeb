import { useEffect, useState }    from 'react'
import { useNavigate }            from 'react-router'
import { useAuthStore }           from '../../../store/authStore'
import { useClassroomStore }      from '../../../store/classroomStore'
import PageWrapper                from '../../../components/layout/PageWrapper'
import JoinClassroomModal         from '../components/JoinClassroomModal'
import {
  Plus, Loader2, BookOpen, Users, Target,
  ChevronRight, LogOut, Zap,
} from 'lucide-react'
import DeleteModal from '#components/ui/DeleteModal'

// ── Mini guild summary card shown when student already has a classroom ─────────
function MyGuildCard({ guild, onLeave, onOpen }) {
  const milestones  = guild.milestones ?? []
  const nextM       = milestones.find((m) => (m.current_score ?? 0) < m.target_score)
  const pct         = nextM
    ? Math.min(100, Math.round(((nextM.current_score ?? 0) / nextM.target_score) * 100))
    : milestones.length > 0 ? 100 : 0
  const doneCount   = milestones.filter((m) => (m.current_score ?? 0) >= m.target_score).length
  const guildXp     = nextM?.current_score ?? milestones[milestones.length - 1]?.current_score ?? 0

  return (
    <div className="bg-white rounded-2xl border border-b-8 border-slate-200 shadow-sm p-8 flex flex-col overflow-hidden">
      {/* Coloured top strip */}
      {/* <div className="h-2 bg-gradient-to-r from-blockly-purple to-purple-400" /> */}

      <div className="md:flex gap-4 space-y-7 md:space-y-0">
        {/* Name + teacher */}
        <div className="flex flex-col items-start justify-between gap-3">
          <div className="flex-1">
            <h2 className="text-3xl font-black text-gray-800">{guild.name}</h2>
            {guild.description && (
              <p className="text-sm text-gray-400 mt-0.5 line-clamp-2 max-w-sm">{guild.description}</p>
            )}
          </div>
          {guild.teacher && (
            <div className="flex items-center gap-2">
            <img src={guild.teacher.avatar_url} alt="teacher picture" className="w-10 h-10 rounded-full object-cover object-center" />
            <div>
              <p className="text-xs text-gray-400">Teacher</p>
              <p className="text-sm font-semibold text-gray-600">{guild.teacher.username}</p>
            </div>
            </div>
          )}
          {/* Actions */}
          <div className="flex w-full gap-3 pt-3 min-h-[60px]">
            <button
              onClick={onOpen}
              className="btn btn-warning flex-1 flex items-center justify-center gap-2 py-1 text-md text-amber-900"
            >
              Enter Classroom
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onLeave}
              title="Leave classroom"
              className="btn bg-slate-200 hover:bg-red-200 flex items-center justify-center gap-2 py-1 text-md text-amber-900"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid md:grid-cols-3 gap-7 flex-1">
          <div className="flex flex-col items-center bg-slate-200 rounded-lg px-6 pt-10 gap-1 shadow border border-b-8 border-[#587194]">
            <p className="text-6xl font-black text-slate-700 leading-none">{guild.member_count}</p>
            <p className="text-sm font-black text-slate-400">Members</p>
            <img src="/teacher.png" alt="members icon" className="mt-10" />
          </div>
          <div className="flex flex-col items-center bg-[#FFEFE0] rounded-lg px-6 pt-10 gap-1 shadow border border-b-8 border-[#dfa269]">
            <p className="text-6xl font-black text-slate-700 leading-none">
              {doneCount}<span className="text-sm font-semibold text-slate-500">/{milestones.length}</span>
            </p>
            <p className="text-sm font-black text-slate-400">Goals done</p>
            <img src="/goals.png" alt="goals icon" className="mt-10" />
          </div>
          <div className="flex flex-col items-center bg-[#E9E3FF] rounded-lg px-6 pt-10 gap-1 shadow border border-b-8 border-[#8778be]">
            <p className="text-6xl font-black text-slate-700 leading-none">{guildXp.toLocaleString()}</p>
            <p className="text-sm font-black text-slate-400">Collective XP</p>
            <img src="/xp.png" alt="xp icon" className="mt-10" />
          </div>
        </div>

        {/* Next milestone progress */}
        {milestones.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">
                {nextM ? `Next milestone: ${nextM.title}` : 'All milestones complete 🎉'}
              </span>
              <span className="font-bold text-blockly-purple">{pct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blockly-purple rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function StudentClassrooms() {
  const [showJoin,    setShowJoin]    = useState(false)
  const [leaveTarget, setLeaveTarget] = useState(null)

  const navigate = useNavigate()
  const profile  = useAuthStore((s) => s.profile)

  const {
    studentGuild,
    loading,
    actionLoading,
    fetchStudentGuild,
    handleJoinClassroom,
    handleLeaveClassroom,
  } = useClassroomStore()

  useEffect(() => {
    if (profile?.id) fetchStudentGuild(profile.id)
  }, [profile?.id])

  const onJoinSubmit = async (code) => {
    await handleJoinClassroom(profile.id, code)
    setShowJoin(false)
  }

  const confirmLeave = async () => {
    if (!leaveTarget) return
    await handleLeaveClassroom(profile.id, leaveTarget.id, leaveTarget.name)
    setLeaveTarget(null)
  }

  return (
    <PageWrapper
      title="My Classroom"
      subtitle="Share your progress and achievements with your teacher and classmates."
      actions={
        !studentGuild && (
          <button
            onClick={() => setShowJoin(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blockly-purple text-white text-sm font-semibold rounded-lg hover:bg-blockly-purple/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Join Classroom
          </button>
        )
      }
    >
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      ) : !studentGuild ? (
        /* ── No classroom: join screen ── */
        <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-blockly-purple/10 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-blockly-purple" />
          </div>
          <div className="max-w-xs">
            <p className="text-xl font-black text-gray-800">You're not in a classroom yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Ask your teacher for the 6-character join code to enter their guild classroom.
            </p>
          </div>
          <button
            onClick={() => setShowJoin(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blockly-purple text-white font-semibold rounded-xl hover:bg-blockly-purple/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Join a Classroom
          </button>
        </div>
      ) : (
        /* ── Has classroom: guild summary card ── */
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <MyGuildCard
            guild={studentGuild}
            onOpen={() => navigate(`/student/classrooms/${studentGuild.id}`)}
            onLeave={() => setLeaveTarget({ id: studentGuild.id, name: studentGuild.name })}
          />
        </div>
      )}

      {/* Join modal */}
      {showJoin && (
        <JoinClassroomModal
          loading={actionLoading}
          onSubmit={onJoinSubmit}
          onClose={() => setShowJoin(false)}
        />
      )}

      {/* Leave confirm */}
      {leaveTarget && (
        <DeleteModal isOpen={true} onClose={() => setLeaveTarget(null)} onConfirm={confirmLeave} title="Leave Classroom?" message={`You'll leave "${leaveTarget.name}" and can rejoin later with a code from your teacher.`} confirmText={"Leave"} loading={actionLoading}/>
      )}
    </PageWrapper>
  )
}