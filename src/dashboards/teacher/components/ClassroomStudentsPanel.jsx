import { useState } from 'react'
import { Search } from 'lucide-react'
import { formatTimeAgo } from '../../../utils/dateFormat'

export default function ClassroomStudentsPanel({ students, loading, onSelect }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const status = student => student.progressPct >= 85 ? 'ahead' : student.progressPct < 50 ? 'at-risk' : 'on-track'
  const visible = students.filter(student => `${student.username} ${student.email ?? ''}`.toLowerCase().includes(search.toLowerCase()) && (filter === 'all' || status(student) === filter))
  return <section className="space-y-4">
    <div><h2 className="text-xl font-semibold">Students</h2><p className="mt-1 text-sm text-muted-foreground">Select a student to review progress, quiz attempts, and submitted work.</p></div>
    <div className="flex flex-wrap gap-3">
      <label className="flex min-w-48 flex-1 items-center gap-2 rounded-lg border bg-white p-3"><Search size={18} className="text-slate-400" /><input aria-label="Search classroom students" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…" className="w-full bg-transparent text-sm outline-none" /></label>
      <select aria-label="Filter student progress" value={filter} onChange={e => setFilter(e.target.value)} className="rounded-lg border bg-white p-3 text-sm"><option value="all">All students</option><option value="ahead">Ahead (85% or more)</option><option value="on-track">On track (50–84%)</option><option value="at-risk">At risk (below 50%)</option></select>
    </div>
    <div className="overflow-x-auto rounded-2xl border border-b-4 border-slate-200 bg-white">
      <table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b text-xs uppercase tracking-wider text-slate-500"><tr>{['Student','Progress','Streak','Last active','Status'].map(label => <th key={label} className="px-6 py-3">{label}</th>)}</tr></thead>
        <tbody className="divide-y">
          {visible.map(student => <tr key={student.studentId} onClick={() => onSelect(student)} className="cursor-pointer hover:bg-sky-50">
            <td className="px-6 py-4"><button onClick={e => { e.stopPropagation(); onSelect(student) }} className="flex items-center gap-3 text-left" aria-label={`Review ${student.username}`}><img src={student.avatarUrl || '/default-avatar.png'} alt="" className="h-9 w-9 rounded-full object-cover" /><span><span className="font-semibold">{student.username}</span><span className="text-xs text-slate-500">{student.email}</span></span></button></td>
            <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="h-1.5 w-28 rounded-full bg-slate-100"><div style={{ width: `${student.progressPct}%` }} className="h-full rounded-full bg-sky-500" /></div><span>{student.progressPct}%</span></div><p className="mt-1 text-xs text-slate-400">{student.completedLessons}/{student.totalLessons} lessons</p></td>
            <td className="px-6 py-4">🔥 {student.streakCount ?? 0}d</td><td className="px-6 py-4 text-slate-500">{student.lastActive ? formatTimeAgo(student.lastActive) : 'No activity yet'}</td>
            <td className="px-6 py-4"><span className={`rounded-md px-2 py-1 text-xs font-semibold ${status(student) === 'ahead' ? 'bg-emerald-100 text-emerald-700' : status(student) === 'at-risk' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'}`}>{status(student).replace('-', ' ')}</span></td>
          </tr>)}
          {!visible.length && <tr><td colSpan={5} className="p-8 text-center text-slate-500">{loading ? 'Loading students…' : students.length ? 'No students match your search.' : 'No students enrolled yet. Share the join code to invite them.'}</td></tr>}
        </tbody>
      </table>
    </div>
  </section>
}
