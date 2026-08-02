import { useCopyCode } from "@/utils/copyCode";
import { Archive, Pencil } from "lucide-react";
import { useNavigate } from "react-router";

export default function ClassroomCard({ classroom, onArchive, averageProgress, pendingSubmissions = 0, onEdit }) {
  const navigate = useNavigate();
  const {copied, copyCode} = useCopyCode()

  const handleEdit = (e) => {
    e.stopPropagation()
    onEdit()
  }

  const handleArchive = (e) => {
    e.stopPropagation()
    onArchive()
  }

  return (
    <div
      onClick={() => navigate(`/teacher/classrooms/${classroom.id}`)}
      className="group relative flex flex-col overflow-hidden cursor-pointer rounded-2xl shadow border-b-4 border-b-slate-400 border border-border bg-card p-6 transition-all! duration-300 hover:-translate-y-0.5 hover:border-primary/50"
    >
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between">
          {copied
            ? <button onClick={(e) => (e.stopPropagation(), copyCode(classroom.join_code || ''))} title="copy join code" className="rounded-md bg-green-500/15 px-2 py-1 font-mono text-[11px] font-extrabold tracking-widest text-green-500">
                Code copied
              </button>
            : <button onClick={(e) => (e.stopPropagation(), copyCode(classroom.join_code || ''))} title="copy join code" className="rounded-md bg-primary/15 px-2 py-1 font-mono text-[11px] font-extrabold tracking-widest text-primary">
                {classroom.join_code || "N/A"}
              </button>
          }
          
          <span className="text-xs text-muted-foreground">
            <button onClick={handleEdit} className="p-1.5 rounded-md bg-background hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors!" title="Edit course">
              <Pencil size={16} />
            </button>
            <button onClick={handleArchive} className="p-1.5 rounded-md bg-background hover:bg-red-100 text-muted-foreground hover:text-red-600 transition-colors!" title="Delete course">
              <Archive size={16} />
            </button>
          </span>
        </div>

        {/* Title */}
        <h4 className="mt-5 font-display text-lg font-extrabold leading-tight text-balance">
          {classroom.name || "Unnamed Classroom"}
        </h4>
        <span className="text-xs text-muted-foreground">
          {classroom.description || "No section"}
        </span>

        {/* Stats */}
        <div className="mt-5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {classroom.member_count || 0} students
          </span>
          <span className="font-mono text-primary">
            {averageProgress || 0}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${averageProgress || 0}%` }}
          />
        </div>

        {/* Avatars + Pending */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex -space-x-1.5">
            {Array.isArray(classroom?.students) &&
            classroom.students.slice(0, 4).map((student, i) => (
              <div
                key={student.id || i}
                className="grid size-7 place-items-center rounded-full border-2 border-card bg-muted font-bold text-slate-500"
                style={{ zIndex: 10 - i }}
              >
                {student.avatar_url ? (
                  <img
                    src={student.avatar_url}
                    alt={student.username}
                    className="rounded-full"
                  />
                ) : (
                  student.username?.[0]?.toUpperCase() || "S"
                )}
              </div>
            ))}
            {classroom.member_count > 4 && (
              <div className="grid size-7 place-items-center rounded-full border-2 border-card bg-primary/20 text-[10px] font-medium text-primary">
                +{classroom.member_count - 4}
              </div>
            )}
          </div>
          <span className="text-xs text-warning">
            {pendingSubmissions} pending
          </span>
        </div>
      </div>
    </div>
  );
}
