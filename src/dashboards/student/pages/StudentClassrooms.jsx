import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { BookOpen, ChevronRight, Loader2, LogOut, Plus, Users } from 'lucide-react'
import PageWrapper from '../../../components/layout/PageWrapper'
import DeleteModal from '#components/ui/DeleteModal'
import { getClassroomTopicFlow } from '../../../services/classroomFlowService'
import { useAuthStore } from '../../../store/authStore'
import { useClassroomStore } from '../../../store/classroomStore'
import JoinClassroomModal from '../components/JoinClassroomModal'
import { summarizeStudentLessons } from '../utils/classroomProgress'

function MyClassroomCard({ classroom, progress, progressLoading, onLeave }) {
  const summary = summarizeStudentLessons(progress)
  const percent = summary.total ? Math.round(summary.completed / summary.total * 100) : 0

  return <article className="w-full rounded-2xl border border-b-8 border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-blockly-purple">Your classroom</p>
        <h2 className="mt-1 text-2xl font-black text-gray-800">{classroom.name}</h2>
        {classroom.description && <p className="mt-2 max-w-2xl text-sm text-gray-500">{classroom.description}</p>}
        {classroom.teacher && <p className="mt-3 text-sm text-gray-600">Teacher: <strong>{classroom.teacher.username}</strong></p>}
      </div>
      <Link to={`/student/classrooms/${classroom.id}`} className="inline-flex items-center gap-2 rounded-xl bg-blockly-purple px-4 py-2 font-semibold text-white hover:bg-blockly-purple/90">
        Open classroom <ChevronRight size={17} />
      </Link>
    </div>
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl bg-slate-50 p-4"><Users className="mb-2 text-slate-500" size={20} /><p className="text-2xl font-black text-gray-800">{classroom.member_count ?? 0}</p><p className="text-xs font-semibold text-gray-500">Classmates</p></div>
      <div className="rounded-xl bg-amber-50 p-4"><BookOpen className="mb-2 text-amber-600" size={20} /><p className="text-2xl font-black text-gray-800">{progressLoading ? '…' : progress ? `${summary.completed}/${summary.total}` : '—'}</p><p className="text-xs font-semibold text-gray-500">Your required core lessons</p></div>
      <div className="rounded-xl bg-violet-50 p-4"><BookOpen className="mb-2 text-violet-600" size={20} /><p className="text-2xl font-black text-gray-800">{progressLoading ? '…' : progress ? summary.openTopics : '—'}</p><p className="text-xs font-semibold text-gray-500">Open topics</p></div>
    </div>
    {progress && <div className="mt-5">
      <div className="flex justify-between gap-3 text-sm"><span className="font-medium text-gray-600">Your core lesson progress</span><span className="font-bold text-blockly-purple">{summary.completed} of {summary.total}</span></div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-label="Your required core lesson progress" aria-valuenow={summary.completed} aria-valuemin={0} aria-valuemax={summary.total || 1}><div className="h-full bg-blockly-purple" style={{ width: `${percent}%` }} /></div>
      {summary.currentTopic && <p className="mt-2 text-xs text-gray-500">Current topic: {summary.currentTopic}</p>}
      {!summary.total && <p className="mt-2 text-xs text-gray-500">Your teacher has not opened any required core lessons yet.</p>}
    </div>}
    <button type="button" onClick={onLeave} className="mt-5 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600"><LogOut size={16} /> Leave classroom</button>
  </article>
}

export default function StudentClassrooms() {
  const profile = useAuthStore(state => state.profile)
  const { studentClassroom, loading, actionLoading, error, fetchStudentClassroom, joinClassroom, leaveClassroom } = useClassroomStore()
  const [showJoin, setShowJoin] = useState(false)
  const [showLeave, setShowLeave] = useState(false)
  const [ready, setReady] = useState(false)
  const [progress, setProgress] = useState(null)
  const [progressLoading, setProgressLoading] = useState(false)

  useEffect(() => {
    if (!profile?.id) return
    let active = true
    fetchStudentClassroom(profile.id).catch(() => {}).finally(() => { if (active) setReady(true) })
    return () => { active = false }
  }, [profile?.id, fetchStudentClassroom])

  useEffect(() => {
    if (!studentClassroom?.id) return
    let active = true
    const refresh = () => {
      setProgressLoading(true)
      getClassroomTopicFlow(studentClassroom.id)
        .then(flow => { if (active) setProgress({ classroomId: studentClassroom.id, flow }) })
        .catch(() => { if (active) setProgress({ classroomId: studentClassroom.id, flow: null }) })
        .finally(() => { if (active) setProgressLoading(false) })
    }
    queueMicrotask(refresh)
    window.addEventListener('focus', refresh)
    return () => { active = false; window.removeEventListener('focus', refresh) }
  }, [studentClassroom?.id])

  const onJoin = async code => { await joinClassroom(profile.id, code); setShowJoin(false) }
  const onLeave = async () => { await leaveClassroom(profile.id, studentClassroom.id); setShowLeave(false) }
  const visibleProgress = progress && studentClassroom && progress.classroomId === studentClassroom.id ? progress.flow : null

  return <PageWrapper title="My Classroom" subtitle="Work through core lessons with your class." actions={!studentClassroom && <button type="button" onClick={() => setShowJoin(true)} className="inline-flex items-center gap-2 rounded-lg bg-blockly-purple px-4 py-2 text-sm font-semibold text-white"><Plus size={16} /> Join classroom</button>}>
    {!ready || loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blockly-purple" /></div>
      : error && !studentClassroom ? <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}<button type="button" onClick={() => fetchStudentClassroom(profile.id).catch(() => {})} className="ml-3 underline">Try again</button></div>
      : studentClassroom ? <MyClassroomCard classroom={studentClassroom} progress={visibleProgress} progressLoading={progressLoading || progress?.classroomId !== studentClassroom.id} onLeave={() => setShowLeave(true)} />
      : <div className="rounded-2xl border bg-white px-6 py-16 text-center"><BookOpen className="mx-auto text-blockly-purple" size={42} /><h2 className="mt-4 text-xl font-bold">You’re not in a classroom yet</h2><p className="mt-2 text-sm text-gray-500">Ask your teacher for a six-character classroom code.</p><button type="button" onClick={() => setShowJoin(true)} className="mt-5 rounded-lg bg-blockly-purple px-5 py-2 text-sm font-semibold text-white">Join a classroom</button></div>}
    {showJoin && <JoinClassroomModal loading={actionLoading} onSubmit={onJoin} onClose={() => setShowJoin(false)} />}
    {showLeave && studentClassroom && <DeleteModal isOpen onClose={() => setShowLeave(false)} onConfirm={onLeave} title="Leave classroom?" message={`You'll leave “${studentClassroom.name}”. You can rejoin with a code from your teacher.`} confirmText="Leave" loading={actionLoading} />}
  </PageWrapper>
}
