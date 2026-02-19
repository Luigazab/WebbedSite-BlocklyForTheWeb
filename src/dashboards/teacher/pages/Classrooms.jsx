import { useEffect, useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { useClassroomStore } from '../../../store/classroomStore'
import { useClassroom } from '../../../hooks/useClassroom'
import PageWrapper from '../../../components/layout/PageWrapper'
import ClassroomCard from '../components/ClassroomCard'
import CreateClassroomModal from '../components/CreateClassroomModal'
import { Plus, Loader2 } from 'lucide-react'

export default function Classrooms() {
  const [showCreate, setShowCreate] = useState(false)
  const profile = useAuthStore((state) => state.profile)
  const { classrooms, loading, fetchTeacherClassrooms } = useClassroomStore()
  const { handleCreateClassroom, handleArchiveClassroom, handleRegenerateCode } = useClassroom()

  useEffect(() => {
    if (profile?.id) fetchTeacherClassrooms(profile.id)
  }, [profile?.id])

  const onCreateSubmit = async (formData) => {
    await handleCreateClassroom(formData)
    setShowCreate(false)
  }

  return (
    <PageWrapper
      title="My Classrooms"
      subtitle="Manage your classrooms and students"
      actions={
        <button
          onClick={() => setShowCreate(true)}
          className="flex btn items-center gap-2 px-4 py-2 bg-blockly-purple text-white text-sm font-semibold rounded-lg hover:bg-blockly-purple/90"
        >
          <Plus className="w-4 h-4" />
          New Classroom
        </button>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : classrooms.length === 0 ? (
        <EmptyState onCreateClick={() => setShowCreate(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {classrooms.map((classroom) => (
            <ClassroomCard
              key={classroom.id}
              classroom={classroom}
              onArchive={() => handleArchiveClassroom(classroom.id, classroom.name)}
              onRegenerateCode={() => handleRegenerateCode(classroom.id)}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateClassroomModal
          onSubmit={onCreateSubmit}
          onClose={() => setShowCreate(false)}
        />
      )}
    </PageWrapper>
  )
}

function EmptyState({ onCreateClick }) {
  return (
    <div className="flex flex-col bg-gray-200 rounded-3xl items-center justify-center py-20 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blockly-purple/10 flex items-center justify-center">
        <Plus className="w-8 h-8 text-blockly-purple" />
      </div>
      <div>
        <p className="font-semibold text-gray-800">No classrooms yet</p>
        <p className="text-sm text-gray-400 mt-1">Create your first classroom to get started</p>
      </div>
      <button
        onClick={onCreateClick}
        className="px-4 btn py-2 bg-blockly-purple text-white text-sm font-semibold rounded-lg hover:bg-blockly-purple/90"
      >
        Create a Classroom
      </button>
    </div>
  )
}