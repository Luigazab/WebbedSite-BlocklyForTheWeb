import { useEffect, useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { useClassroomStore } from '../../../store/classroomStore'
import { useClassroom } from '../../../hooks/useClassroom'
import PageWrapper from '../../../components/layout/PageWrapper'
import StudentClassroomCard from '../components/StudentClassroomCard'
import JoinClassroomModal from '../components/JoinClassroomModal'
import { Plus, Loader2, BookOpen } from 'lucide-react'

export default function StudentClassrooms() {
  const [showJoin, setShowJoin] = useState(false)
  const profile = useAuthStore((state) => state.profile)
  const { classrooms, loading, fetchStudentClassrooms } = useClassroomStore()
  const { handleJoinClassroom, handleLeaveClassroom } = useClassroom()

  useEffect(() => {
    if (profile?.id) fetchStudentClassrooms(profile.id)
  }, [profile?.id])

  const onJoinSubmit = async (code) => {
    await handleJoinClassroom(code)
    setShowJoin(false)
  }

  return (
    <PageWrapper
      title="My Classrooms"
      subtitle="View lessons and assignments from your teachers"
      actions={
        <button
          onClick={() => setShowJoin(true)}
          className="flex items-center btn gap-2 px-4 py-2 bg-blockly-purple text-white text-sm font-semibold rounded-lg hover:bg-blockly-purple/90 "
        >
          <Plus className="w-4 h-4" />
          Join Classroom
        </button>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : classrooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center bg-gray-200 rounded-3xl">
          <div className="w-16 h-16 rounded-2xl bg-blockly-purple/10 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-blockly-purple" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">No classrooms yet</p>
            <p className="text-sm text-gray-400 mt-1">Ask your teacher for a class code to join</p>
          </div>
          <button
            onClick={() => setShowJoin(true)}
            className="btn px-4 py-2 bg-blockly-purple text-white text-sm font-semibold rounded-lg hover:bg-blockly-purple/90"
          >
            Join a Classroom
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {classrooms.map((classroom) => (
            <StudentClassroomCard
              key={classroom.id}
              classroom={classroom}
              onLeave={() => handleLeaveClassroom(classroom.id, classroom.name)}
            />
          ))}
        </div>
      )}

      {showJoin && (
        <JoinClassroomModal
          onSubmit={onJoinSubmit}
          onClose={() => setShowJoin(false)}
        />
      )}
    </PageWrapper>
  )
}