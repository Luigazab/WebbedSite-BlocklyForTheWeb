import { useEffect, useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { useClassroomStore } from '../../../store/classroomStore'
import { useClassroom } from '../../../hooks/useClassroom'
import PageWrapper from '../../../components/layout/PageWrapper'
import StudentClassroomCard from '../components/StudentClassroomCard'
import JoinClassroomModal from '../components/JoinClassroomModal'
import AssignmentsTab from '../components/AssignmentsTab'
import { Plus, Loader2, BookOpen } from 'lucide-react'

const TABS = ['Class', 'Assignments', 'Completed Classes']

export default function StudentClassrooms() {
  const [activeTab, setActiveTab] = useState('Class')
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

  const activeClassrooms = classrooms.filter((c) => c.status === 'active' || !c.status)
  const archivedClassrooms = classrooms.filter((c) => c.status === 'archived')

  return (
    <PageWrapper
      title="Classrooms"
      subtitle="Start learning"
      actions={
        <button
          onClick={() => setShowJoin(true)}
          className="flex items-center btn gap-2 px-4 py-2 bg-blockly-purple text-white text-sm font-semibold rounded-lg hover:bg-blockly-purple/90"
        >
          <Plus className="w-4 h-4" />
          Join Classroom
        </button>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-semibold transition-colors relative
                ${activeTab === tab
                  ? 'text-blockly-purple'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blockly-purple" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {activeTab === 'Class' && (
              <>
                {activeClassrooms.length === 0 ? (
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
                    {activeClassrooms.map((classroom) => (
                      <StudentClassroomCard
                        key={classroom.id}
                        classroom={classroom}
                        onLeave={() => handleLeaveClassroom(classroom.id, classroom.name)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'Assignments' && <AssignmentsTab />}

            {activeTab === 'Completed Classes' && (
              <>
                {archivedClassrooms.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <p className="text-sm text-gray-400">No completed classes yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {archivedClassrooms.map((classroom) => (
                      <StudentClassroomCard
                        key={classroom.id}
                        classroom={classroom}
                        isArchived
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {showJoin && (
        <JoinClassroomModal
          onSubmit={onJoinSubmit}
          onClose={() => setShowJoin(false)}
        />
      )}
    </PageWrapper>
  )
}