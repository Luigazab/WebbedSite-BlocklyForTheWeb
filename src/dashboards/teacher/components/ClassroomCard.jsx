import { useCopyCode } from '@/utils/copyCode'
import { Archive, ArrowRight, GraduationCap, Pencil, RotateCcw, Trash2, Users } from 'lucide-react'
import { Link } from 'react-router'

export default function ClassroomCard({ classroom, onArchive, onRestore, onDelete, averageProgress, pendingSubmissions, onEdit }) {
  const { copied, copyCode } = useCopyCode()
  const inactive = classroom.is_active === false

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      <div className={`h-1.5 w-full transition-all duration-300 group-hover:h-2 ${inactive ? 'bg-slate-400' : 'bg-primary'}`} />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${inactive ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
            {inactive ? 'Inactive' : 'Active'}
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-background/90 p-1 shadow-xs">
              <button type="button" onClick={onEdit} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground" title="Edit classroom" aria-label={`Edit ${classroom.name}`}><Pencil size={14} /></button>
              {inactive ? (
                <button type="button" onClick={onRestore} className="rounded-md p-1 text-muted-foreground hover:bg-primary/10 hover:text-primary" title="Restore classroom" aria-label={`Restore ${classroom.name}`}><RotateCcw size={14} /></button>
              ) : (
                <button type="button" onClick={onArchive} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground" title="Archive classroom" aria-label={`Archive ${classroom.name}`}><Archive size={14} /></button>
              )}
              <button type="button" onClick={onDelete} className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="Delete classroom" aria-label={`Delete ${classroom.name}`}><Trash2 size={14} /></button>
            </div>
            <div className="grid size-10 place-items-center rounded-xl border border-border bg-primary/10 text-primary"><GraduationCap size={20} /></div>
          </div>
        </div>

        <Link to={`/teacher/classrooms/${classroom.id}`} className="mt-4 flex-1">
          <h2 className="font-display text-lg font-bold leading-tight text-foreground transition-colors group-hover:text-primary">{classroom.name || 'Unnamed Classroom'}</h2>
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{classroom.description || 'No description provided.'}</p>
        </Link>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Users className="size-3.5" /><strong className="font-semibold text-foreground">{classroom.member_count || 0}</strong> students</span>
          {inactive ? (
            <Link to={`/teacher/classrooms/${classroom.id}`} className="flex items-center gap-1 font-semibold text-primary">View <ArrowRight className="size-3.5" /></Link>
          ) : (
            <span><strong className="font-semibold text-foreground">{averageProgress == null ? '—' : `${averageProgress}%`}</strong> progress · {pendingSubmissions == null ? '—' : pendingSubmissions} pending</span>
          )}
        </div>
        {!inactive && (
          <button type="button" onClick={() => copyCode(classroom.join_code || '')} className="mt-3 self-start rounded-md bg-muted px-2.5 py-1 font-mono text-xs font-semibold tracking-wide text-muted-foreground hover:text-primary" title="Copy join code">
            {copied ? 'Code copied' : `Join code: ${classroom.join_code || 'N/A'}`}
          </button>
        )}
      </div>
    </article>
  )
}
