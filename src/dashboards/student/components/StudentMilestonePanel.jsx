import { CheckCircle2, Target, Zap, Lock } from 'lucide-react'

function MilestoneRow({ milestone, isNext }) {
  const current   = milestone.current_score ?? 0
  const target    = milestone.target_score ?? 1
  const pct       = Math.min(100, Math.round((current / target) * 100))
  const done      = current >= target
  const remaining = Math.max(0, target - current)

  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-2 transition-colors ${
      done
        ? 'border-green-200 bg-green-50'
        : isNext
          ? 'border-blockly-purple/30 bg-blockly-purple/5 ring-1 ring-blockly-purple/20'
          : 'border-gray-100 bg-white'
    }`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {done
            ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
            : isNext
              ? <Target className="w-4 h-4 text-blockly-purple shrink-0" />
              : <Lock className="w-4 h-4 text-gray-300 shrink-0" />
          }
          <p className={`text-sm font-semibold truncate ${
            done ? 'text-green-700' : isNext ? 'text-blockly-purple' : 'text-gray-500'
          }`}>
            {milestone.title}
          </p>
          {isNext && !done && (
            <span className="shrink-0 text-xs font-bold text-blockly-purple bg-blockly-purple/10 px-2 py-0.5 rounded-full">
              Current
            </span>
          )}
        </div>
        <span className={`text-xs font-bold shrink-0 ${done ? 'text-green-600' : 'text-blockly-purple'}`}>
          {done ? '🎉 Done!' : `${pct}%`}
        </span>
      </div>

      {/* Progress bar — only show for done or current */}
      {(done || isNext) && (
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${done ? 'bg-green-400' : 'bg-blockly-purple'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" />
          {current.toLocaleString()} / {target.toLocaleString()} XP
        </span>
        {!done && isNext && (
          <span>{remaining.toLocaleString()} XP to go</span>
        )}
      </div>
    </div>
  )
}

export default function StudentMilestonePanel({ milestones = [] }) {
  const nextIdx  = milestones.findIndex((m) => (m.current_score ?? 0) < m.target_score)
  const doneCount = milestones.filter((m) => (m.current_score ?? 0) >= m.target_score).length

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-400" />
          <h2 className="font-bold text-gray-800">Guild Milestones</h2>
          {milestones.length > 0 && (
            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {doneCount}/{milestones.length}
            </span>
          )}
        </div>
        {milestones.length > 0 && doneCount === milestones.length && (
          <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
            All complete 🎉
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3">
        {milestones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
            <Target className="w-7 h-7 text-gray-200" />
            <p className="text-sm text-gray-400">No milestones set yet.</p>
            <p className="text-xs text-gray-300">Your teacher will add goals for the class to work toward.</p>
          </div>
        ) : (
          milestones.map((m, i) => (
            <MilestoneRow
              key={m.id}
              milestone={m}
              isNext={i === nextIdx}
            />
          ))
        )}
      </div>
    </div>
  )
}