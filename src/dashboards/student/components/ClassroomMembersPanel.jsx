import { formatDistanceToNow } from 'date-fns'
import { Users } from 'lucide-react'

export default function ClassroomMembersPanel({ members = [], currentUserId }) {
  return <section className="overflow-hidden rounded-2xl border bg-white" aria-label="Classmates">
    <h2 className="flex items-center gap-2 border-b p-5 font-bold"><Users size={18} /> Classmates <span className="text-sm text-gray-500">({members.length})</span></h2>
    {!members.length ? <p className="p-6 text-sm text-gray-500">No classmates yet.</p> : <ul className="divide-y">
      {members.map(member => member.student && <li key={member.student_id} className="flex items-center gap-3 p-4">
        <img src={member.student.avatar_url || '/default-avatar.png'} alt="" className="h-9 w-9 rounded-full object-cover" />
        <div><p className="text-sm font-semibold">{member.student.username}{member.student_id === currentUserId && <span className="ml-2 text-xs text-blockly-purple">You</span>}</p>
          <p className="text-xs text-gray-500">Joined {formatDistanceToNow(new Date(member.enrolled_at), { addSuffix: true })}</p></div>
      </li>)}
    </ul>}
  </section>
}
