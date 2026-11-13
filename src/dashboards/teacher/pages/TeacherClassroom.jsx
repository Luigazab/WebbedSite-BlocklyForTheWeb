import { useEffect, useState } from 'react'
import { useAuthStore }      from '../../../store/authStore'
import CreateClassroomModal  from '../components/CreateClassroomModal'
import { Plus, Loader2, GraduationCap, Search, X } from 'lucide-react'
import { Button } from '#components/ui/button'
import { useClassroom } from '#hooks/useClassroom'
import ClassroomCard from '../components/ClassroomCard'
import { getClassroomListMetrics } from '../../../services/classroomService'
import DeleteModal from '#components/ui/DeleteModal'

export default function TeacherClassrooms() {
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [selectedClassroom, setSelectedClassroom] = useState(null)
  const [metrics, setMetrics] = useState({})
  const [metricsError, setMetricsError] = useState('')
  const [metricsRetry, setMetricsRetry] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [view, setView] = useState('active')
  const [classroomToDelete, setClassroomToDelete] = useState(null)

  const profile = useAuthStore((s) => s.profile)
  const { teacherClassrooms, loading, actionLoading, fetchTeacherClassrooms, handleCreateClassroom, handleArchiveClassroom, handleRestoreClassroom, handleDeleteClassroom, handleRegenerateCode, handleUpdateClassroom } = useClassroom()

  useEffect(() => {
    if (profile?.id) fetchTeacherClassrooms()
  }, [profile?.id])

  useEffect(() => {
    let active = true
    getClassroomListMetrics(teacherClassrooms.filter(classroom => classroom.is_active !== false).map(classroom => classroom.id))
      .then(data => { if (active) { setMetrics(data); setMetricsError('') } })
      .catch(error => { if (active) { setMetrics({}); setMetricsError(error.message) } })
    return () => { active = false }
  }, [teacherClassrooms, metricsRetry])

  const onCreateSubmit = async (formData) => {
    await handleCreateClassroom(formData)
    setShowCreate(false)
  }

  const onEditSubmit = async (formData) => {
    await handleUpdateClassroom(formData)
    setShowEdit(false)
    setSelectedClassroom(null)
  }

  const activeCount = teacherClassrooms.filter(classroom => classroom.is_active !== false).length
  const inactiveCount = teacherClassrooms.length - activeCount
  const visibleClassrooms = teacherClassrooms.filter(classroom =>
    (view === 'inactive' ? classroom.is_active === false : classroom.is_active !== false) &&
    `${classroom.name || ''} ${classroom.description || ''}`.toLowerCase().includes(searchTerm.trim().toLowerCase())
  )

  const confirmDelete = async () => {
    if (!classroomToDelete) return
    try {
      await handleDeleteClassroom(classroomToDelete.id, classroomToDelete.name)
      setClassroomToDelete(null)
    } catch {
      // The hook shows the database error; keep the dialog open for another choice.
    }
  }

  return (
    <div className="wide-container">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">My Classrooms</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create and manage classrooms to track your students&apos; progress.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input type="search" aria-label="Search classrooms" placeholder="Search classrooms..." value={searchTerm} onChange={event => setSearchTerm(event.target.value)} className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            {searchTerm && <button type="button" onClick={() => setSearchTerm('')} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X size={14} /></button>}
          </div>
          <Button variant="formalPrimary" className="shrink-0 gap-1.5" onClick={() => setShowCreate(true)}><Plus size={16} /> New Classroom</Button>
        </div>
      </div>
      <div role="tablist" aria-label="Classroom status" className="flex gap-2 border-b border-border">
        {[['active', activeCount], ['inactive', inactiveCount]].map(([status, count]) => (
          <button key={status} type="button" role="tab" aria-selected={view === status} onClick={() => setView(status)} className={`border-b-2 px-4 py-2 text-sm font-semibold capitalize transition-colors ${view === status ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{status} <span className="ml-1 text-xs">{count}</span></button>
        ))}
      </div>
      {metricsError && <p role="alert" className="text-sm text-red-700 dark:text-red-300">Could not load classroom progress: {metricsError} <button className="underline" onClick={() => setMetricsRetry(value => value + 1)}>Retry</button></p>}
      <div className="inner-container">
        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
        ) : visibleClassrooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
            <div className="mb-3 grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground"><GraduationCap size={24} /></div>
            <h2 className="text-base font-semibold text-foreground">{searchTerm ? 'No matching classrooms found' : view === 'inactive' ? 'No inactive classrooms' : 'No active classrooms yet'}</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">{searchTerm ? 'Try a different keyword.' : view === 'inactive' ? 'Archived classrooms will appear here.' : 'Create a classroom and share its join code with students.'}</p>
            {searchTerm ? <Button variant="formalPlain" size="sm" className="mt-4" onClick={() => setSearchTerm('')}>Clear Search</Button> : view === 'active' && <Button variant="formalPrimary" size="sm" className="mt-4" onClick={() => setShowCreate(true)}>Create Classroom</Button>}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleClassrooms.map((classroom) => (
            <ClassroomCard 
              key={classroom.id}
              classroom={classroom} 
              averageProgress={metrics[classroom.id]?.averageProgress}
              pendingSubmissions={metrics[classroom.id]?.pendingSubmissions}
              onArchive={() => handleArchiveClassroom(classroom.id, classroom.name)}
              onRestore={() => handleRestoreClassroom(classroom.id, classroom.name)}
              onDelete={() => setClassroomToDelete(classroom)}
              onEdit={() => {
                setSelectedClassroom(classroom)
                setShowEdit(true)
              }}
            />
          ))}
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground">Progress measures completed published activities across current classroom members.</p>

      {showCreate && (
        <CreateClassroomModal
          mode='create'
          loading={actionLoading}
          onSubmit={onCreateSubmit}
          onClose={() => setShowCreate(false)}
        />
      )}
      {showEdit && selectedClassroom && (
        <CreateClassroomModal
          mode='edit'
          classroom={selectedClassroom}
          loading={actionLoading}
          onSubmit={onEditSubmit}
          onClose={() => {setShowEdit(false), setSelectedClassroom(null)}}
          handleRegenerate={() => handleRegenerateCode(selectedClassroom.id)}
        />
      )}
      <DeleteModal isOpen={Boolean(classroomToDelete)} onClose={() => setClassroomToDelete(null)} onConfirm={confirmDelete} loading={actionLoading} title="Delete classroom" message={`Delete “${classroomToDelete?.name || 'this classroom'}” permanently? Its assigned courses, posts, lessons, and student progress will be removed. This cannot be undone.`} confirmText="Delete classroom" />
    </div>
  )
}
