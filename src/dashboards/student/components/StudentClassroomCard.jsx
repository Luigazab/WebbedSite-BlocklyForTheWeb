import { useState } from 'react'
import { useNavigate } from 'react-router'
import { BookOpen, ChevronRight, LogOut, User } from 'lucide-react'

export default function StudentClassroomCard({ classroom, onLeave }) {
  const [showConfirmLeave, setShowConfirmLeave] = useState(false)
  const navigate = useNavigate()

  const handleLeave = (e) => {
    e.stopPropagation()
    if (showConfirmLeave) {
      onLeave()
    } else {
      setShowConfirmLeave(true)
      setTimeout(() => setShowConfirmLeave(false), 3000)
    }
  }

  return (
    <div
      onClick={() => navigate(`/student/classrooms/${classroom.id}`)}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blockly-purple/20 transition-all cursor-pointer p-5 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-blockly-purple/10 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-blockly-purple" />
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blockly-purple mt-1 transition-colors" />
      </div>

      <div>
        <h3 className="font-bold text-gray-800 group-hover:text-blockly-purple transition-colors">
          {classroom.name}
        </h3>
        {classroom.description && (
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{classroom.description}</p>
        )}
      </div>

      {/* Teacher info */}
      {classroom.teacher && (
        <div className="flex items-center gap-2">
          <img
            src={classroom.teacher.avatar_url || '/default-avatar.png'}
            alt=""
            className="w-6 h-6 rounded-full object-cover border border-gray-100"
          />
          <span className="text-xs text-gray-500">{classroom.teacher.username}</span>
        </div>
      )}

      {/* Leave */}
      <button
        onClick={handleLeave}
        className={`flex items-center gap-1.5 text-xs font-medium transition-colors w-fit
          ${showConfirmLeave ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
      >
        <LogOut className="w-3.5 h-3.5" />
        {showConfirmLeave ? 'Click again to confirm leave' : 'Leave classroom'}
      </button>
    </div>
  )
}