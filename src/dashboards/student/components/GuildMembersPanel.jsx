import { Users, Crown } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function GuildMembersPanel({ members = [], teacherId, currentUserId }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
        <Users className="w-5 h-5 text-gray-400" />
        <h2 className="font-bold text-gray-800">Guild Members</h2>
        <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {members.length}
        </span>
      </div>

      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
          <Users className="w-7 h-7 text-gray-200" />
          <p className="text-sm text-gray-400">No other members yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {members.map((member) => {
            const student   = member.student
            const isMe      = member.student_id === currentUserId
            if (!student) return null

            return (
              <div
                key={member.student_id}
                className={`flex items-center justify-between px-5 py-3.5 ${isMe ? 'bg-blockly-purple/3' : ''}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={student.avatar_url || '/default-avatar.png'}
                      alt={student.username}
                      className="w-8 h-8 rounded-full object-cover border border-gray-100"
                    />
                    {isMe && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-blockly-purple rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-sm font-semibold truncate ${isMe ? 'text-blockly-purple' : 'text-gray-800'}`}>
                        {student.username}
                      </p>
                      {isMe && (
                        <span className="text-xs font-bold text-blockly-purple bg-blockly-purple/10 px-1.5 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      Joined {formatDistanceToNow(new Date(member.enrolled_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}