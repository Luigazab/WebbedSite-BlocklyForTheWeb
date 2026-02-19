import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { useClassroomStore } from '../../../store/classroomStore'
import { useClassroom } from '../../../hooks/useClassroom'
import PageWrapper from '../../../components/layout/PageWrapper'
import { Users, Copy, RefreshCw, UserMinus, Check, Loader2, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function ClassroomDetail() {
  const { classroomId } = useParams()
  const { currentClassroom, loading, fetchClassroomDetail } = useClassroomStore()
  const { handleRemoveStudent, handleRegenerateCode } = useClassroom()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchClassroomDetail(classroomId)
  }, [classroomId])

  const copyCode = () => {
    navigator.clipboard.writeText(currentClassroom.class_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading || !currentClassroom) {
    return (
      <PageWrapper title="Classroom">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </PageWrapper>
    )
  }

  const activeEnrollments = currentClassroom.classroom_enrollments?.filter(
    (e) => e.status === 'active'
  ) ?? []

  return (
    <PageWrapper
      title={currentClassroom.name}
      subtitle={currentClassroom.description}
    >
      {/* Class code banner */}
      <div className="flex items-center justify-between bg-blockly-purple/5 border border-blockly-purple/20 rounded-2xl px-6 py-4">
        <div>
          <p className="text-xs font-semibold text-blockly-purple uppercase tracking-wider mb-1">
            Invite students with this code
          </p>
          <p className="text-3xl font-black text-blockly-purple tracking-[0.3em]">
            {currentClassroom.class_code}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyCode}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-blockly-purple/20 text-blockly-purple text-sm font-semibold rounded-lg hover:bg-blockly-purple/5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={() => handleRegenerateCode(classroomId)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </button>
        </div>
      </div>

      {/* Students list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            <h2 className="font-bold text-gray-800">Students</h2>
            <span className="text-sm text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {activeEnrollments.length}
            </span>
          </div>
        </div>

        {activeEnrollments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2 text-center">
            <Users className="w-8 h-8 text-gray-200" />
            <p className="text-sm text-gray-400">No students yet. Share the class code to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {activeEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <img
                    src={enrollment.student.avatar_url || '/default-avatar.png'}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover border border-gray-100"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{enrollment.student.username}</p>
                    <p className="text-xs text-gray-400">{enrollment.student.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    Joined {formatDistanceToNow(new Date(enrollment.enrolled_at), { addSuffix: true })}
                  </div>
                  <button
                    onClick={() => handleRemoveStudent(enrollment.id, enrollment.student.username)}
                    className="p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                    title="Remove student"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}