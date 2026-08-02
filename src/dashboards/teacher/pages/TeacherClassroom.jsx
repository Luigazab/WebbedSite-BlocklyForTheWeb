/**
 * July 24, 2026 teachers/classrooms
 * TODO: replace guildcard with same as home card
 */
import { useEffect, useState } from 'react'
import { useAuthStore }      from '../../../store/authStore'
import GuildCard             from '../components/GuildCard'
import CreateClassroomModal  from '../components/CreateClassroomModal'
import { Plus, Loader2, GraduationCap } from 'lucide-react'
import { AppBreadcrumb } from '#components/common/breadcrumb'
import { Button } from '#components/ui/button'
import { useClassroom } from '#hooks/useClassroom'
import ClassroomCard from '../components/ClassroomCard'

export default function TeacherClassrooms() {
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [selectedClassroom, setSelectedClassroom] = useState(null)

  const profile = useAuthStore((s) => s.profile)
  const { teacherClassrooms, loading, actionLoading, fetchTeacherClassrooms, handleCreateClassroom, handleArchiveClassroom, handleRegenerateCode, handleUpdateClassroom } = useClassroom()

  useEffect(() => {
    if (profile?.id) fetchTeacherClassrooms()
  }, [profile?.id])

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
    <div className='p-6 space-y-6'>
      <AppBreadcrumb
        items={[
          { label: 'Home', href: '/teachers/' },
          { label: 'Classrooms', href: '/teachers/classrooms' },
        ]}
      />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">My Classrooms</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create and manage classrooms to track your student's progress</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" />
          New Classroom
        </Button>
      </div>
    
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      ) : teacherClassrooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-5 text-center bg-gray-50 rounded-3xl">
          <div className="w-16 h-16 rounded-2xl bg-blockly-blue/10 flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-blockly-blue" />
          </div>
          <div>
            <p className="font-bold text-gray-800">No classrooms yet</p>
            <p className="text-sm text-gray-400 mt-1">
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
              averageProgress={20}
              onArchive={() => handleArchiveClassroom(classroom.id, classroom.name)}
              onEdit={() => {
                setSelectedClassroom(classroom)
                setShowEdit(true)
              }}
            />
          ))}
        </div>
      )}

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