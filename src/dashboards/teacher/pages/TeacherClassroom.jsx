import { useEffect, useState } from 'react'
import { useAuthStore }      from '../../../store/authStore'
import { useClassroomStore } from '../../../store/classroomStore'
import PageWrapper           from '../../../components/layout/PageWrapper'
import GuildCard             from '../components/GuildCard'
import CreateClassroomModal  from '../components/CreateClassroomModal'
import { Plus, Loader2, GraduationCap } from 'lucide-react'

export default function TeacherClassrooms() {
  const [showCreate, setShowCreate] = useState(false)

  const profile = useAuthStore((s) => s.profile)
  const {
    teacherGuilds,
    loading,
    actionLoading,
    fetchTeacherGuilds,
    handleCreateClassroom,
    handleArchiveClassroom,
    handleRegenerateCode,
  } = useClassroomStore()

  useEffect(() => {
    if (profile?.id) fetchTeacherGuilds(profile.id)
  }, [profile?.id])

  const onCreateSubmit = async (formData) => {
    await handleCreateClassroom({ teacherId: profile.id, ...formData })
    setShowCreate(false)
  }

  return (
    <PageWrapper
      title="My Classrooms"
      subtitle="Manage your guild classrooms"
      actions={
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blockly-purple text-white text-sm font-semibold rounded-lg hover:bg-blockly-purple/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Classroom
        </button>
      }
    >
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      ) : teacherGuilds.length === 0 ? (
        /* ── Empty state ── */
        <div className="flex flex-col items-center justify-center py-24 gap-5 text-center bg-gray-50 rounded-3xl">
          <div className="w-16 h-16 rounded-2xl bg-blockly-purple/10 flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-blockly-purple" />
          </div>
          <div>
            <p className="font-bold text-gray-800">No classrooms yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Create your first classroom and share the join code with students.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-5 py-2.5 bg-blockly-purple text-white text-sm font-semibold rounded-xl hover:bg-blockly-purple/90 transition-colors"
          >
            Create a Classroom
          </button>
        </div>
      ) : (
        /* ── Guild grid ── */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {teacherGuilds.map((guild) => (
            <GuildCard
              key={guild.id}
              guild={guild}
              onArchive={() => handleArchiveClassroom(guild.id, guild.name)}
              onRegenerateCode={() => handleRegenerateCode(guild.id)}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateClassroomModal
          loading={actionLoading}
          onSubmit={onCreateSubmit}
          onClose={() => setShowCreate(false)}
        />
      )}
    </PageWrapper>
  )
}