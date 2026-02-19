import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Users, Copy, RefreshCw, Archive, ChevronRight, Check } from 'lucide-react'

export default function ClassroomCard({ classroom, onArchive, onRegenerateCode }) {
  const [copied, setCopied] = useState(false)
  const [showConfirmArchive, setShowConfirmArchive] = useState(false)
  const navigate = useNavigate()

  const studentCount = classroom.classroom_enrollments?.[0]?.count ?? 0

  const copyCode = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(classroom.class_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerate = (e) => {
    e.stopPropagation()
    onRegenerateCode()
  }

  const handleArchive = (e) => {
    e.stopPropagation()
    if (showConfirmArchive) {
      onArchive()
    } else {
      setShowConfirmArchive(true)
      setTimeout(() => setShowConfirmArchive(false), 3000)
    }
  }

  return (
    <div
      onClick={() => navigate(`/teacher/classrooms/${classroom.id}`)}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blockly-purple/20 transition-all cursor-pointer p-5 flex flex-col gap-4"
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 truncate group-hover:text-blockly-purple transition-colors">
            {classroom.name}
          </h3>
          {classroom.description && (
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{classroom.description}</p>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blockly-purple shrink-0 mt-1 transition-colors" />
      </div>

      {/* Student count */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500">
        <Users className="w-4 h-4" />
        <span>{studentCount} {studentCount === 1 ? 'student' : 'students'}</span>
      </div>

      {/* Class code */}
      <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
        <div>
          <p className="text-xs text-gray-400 font-medium">Class Code</p>
          <p className="text-lg font-bold text-blockly-purple tracking-widest mt-0.5">
            {classroom.class_code}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={copyCode}
            title="Copy code"
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <button
            onClick={handleRegenerate}
            title="Regenerate code"
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Archive */}
      <button
        onClick={handleArchive}
        className={`flex items-center gap-2 text-xs font-medium transition-colors w-fit
          ${showConfirmArchive ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
      >
        <Archive className="w-3.5 h-3.5" />
        {showConfirmArchive ? 'Click again to confirm archive' : 'Archive classroom'}
      </button>
    </div>
  )
}