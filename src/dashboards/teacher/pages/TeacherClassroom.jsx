/**
 * July 24, 2026 teachers/classrooms
 * TODO: replace guildcard with same as home card
 */
import { useEffect, useState } from 'react'
import { useAuthStore }      from '../../../store/authStore'
import CreateClassroomModal  from '../components/CreateClassroomModal'
import { Plus, Loader2, GraduationCap } from 'lucide-react'
import { AppBreadcrumb } from '#components/common/breadcrumb'
import { Button } from '#components/ui/button'
import { useClassroom } from '#hooks/useClassroom'
import ClassroomCard from '../components/ClassroomCard'
import { getClassroomListMetrics } from '../../../services/classroomService'
import { PageHeader } from '#components/common/PageHeader'

export default function TeacherClassrooms() {
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [selectedClassroom, setSelectedClassroom] = useState(null)
  const [metrics, setMetrics] = useState({})
  const [metricsError, setMetricsError] = useState('')
  const [metricsRetry, setMetricsRetry] = useState(0)

  const profile = useAuthStore((s) => s.profile)
  const { teacherClassrooms, loading, actionLoading, fetchTeacherClassrooms, handleCreateClassroom, handleArchiveClassroom, handleRegenerateCode, handleUpdateClassroom } = useClassroom()

  useEffect(() => {
    if (profile?.id) fetchTeacherClassrooms()
  }, [profile?.id])

  useEffect(() => {
    let active = true
    getClassroomListMetrics(teacherClassrooms.map(classroom => classroom.id))
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

  return (
    <div className='mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8'>
      <PageHeader title="My Classrooms" description="Create and manage classrooms to track your student's progress" action={{icon:<Plus className='w-4 h-4'/>, label: 'New Classroom', onClick: () => setShowCreate(true)}} />
      {metricsError && <p role="alert" className="text-sm text-red-700 dark:text-red-300">Could not load classroom progress: {metricsError} <button className="underline" onClick={() => setMetricsRetry(value => value + 1)}>Retry</button></p>}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      ) : teacherClassrooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-5 text-center bg-muted rounded-3xl">
          <div className="w-16 h-16 rounded-2xl bg-blockly-blue/10 flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-blockly-blue" />
          </div>
          <div>
            <p className="font-bold text-foreground">No classrooms yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first classroom and share the join code with students.
            </p>
          </div>
          <Button variant='primary' onClick={() => setShowCreate(true)}>
            Create a Classroom
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-3">
          {teacherClassrooms.map((classroom) => (
            <ClassroomCard 
              key={classroom.id}
              classroom={classroom} 
              averageProgress={metrics[classroom.id]?.averageProgress}
              pendingSubmissions={metrics[classroom.id]?.pendingSubmissions}
              onArchive={() => handleArchiveClassroom(classroom.id, classroom.name)}
              onEdit={() => {
                setSelectedClassroom(classroom)
                setShowEdit(true)
              }}
            />
          ))}
        </div>
      )}
      <p className="text-sm text-muted-foreground mt-4">Progress measures completed published activities across current classroom members.</p>

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
    </div>
  )
}
