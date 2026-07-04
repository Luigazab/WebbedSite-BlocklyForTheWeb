import { Users, UserMinus, Clock, Zap } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function RosterPanel({ members = [], onRemove }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
        <Users className="w-5 h-5 text-gray-400" />
        <h2 className="font-bold text-gray-800">Roster</h2>
        <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {members.length}
        </span>
      </div>

      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
          <Users className="w-7 h-7 text-gray-200" />
          <p className="text-sm text-gray-400">No students yet.</p>
          <p className="text-xs text-gray-300">Share the join code to get started.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {members.map((member) => {
            const student = member.student
            if (!student) return null
            return (
              <div key={member.student_id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={student.avatar_url || '/default-avatar.png'}
                    alt={student.username}
                    className="w-8 h-8 rounded-full object-cover border border-gray-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{student.username}</p>
                    <p className="text-xs text-gray-400 truncate">{student.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(member.enrolled_at), { addSuffix: true })}
                  </div>
                  <button
                    onClick={() => onRemove(member.student_id, student.username)}
                    title="Remove student"
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}