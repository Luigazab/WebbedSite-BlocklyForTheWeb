import { CheckCircle2, Target, Plus, Zap } from 'lucide-react'

function MilestoneRow({ milestone }) {
  const current  = milestone.current_score ?? 0
  const target   = milestone.target_score ?? 1
  const pct      = Math.min(100, Math.round((current / target) * 100))
  const done     = current >= target
  const remaining = Math.max(0, target - current)

  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-2 transition-colors ${
      done ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-white'
    }`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {done
            ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
            : <Target className="w-4 h-4 text-amber-400 shrink-0" />
          }
          <p className={`text-sm font-semibold truncate ${done ? 'text-green-700' : 'text-gray-800'}`}>
            {milestone.title}
          </p>
        </div>
        <span className={`text-xs font-bold shrink-0 ${done ? 'text-green-600' : 'text-blockly-purple'}`}>
          {done ? 'Complete!' : `${pct}%`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${done ? 'bg-green-400' : 'bg-blockly-purple'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" />
          {current.toLocaleString()} / {target.toLocaleString()} XP
        </span>
        {!done && <span>{remaining.toLocaleString()} XP remaining</span>}
      </div>
    </div>
  )
}

export default function MilestonePanel({ milestones = [], onAddMilestone }) {
  const done  = milestones.filter((m) => (m.current_score ?? 0) >= m.target_score).length
  const total = milestones.length

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-400" />
          <h2 className="font-bold text-gray-800">Milestones</h2>
          {total > 0 && (
            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {done}/{total}
            </span>
          )}
        </div>
        <button
          onClick={onAddMilestone}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blockly-purple bg-blockly-purple/5 rounded-lg hover:bg-blockly-purple/10 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {milestones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
            <Target className="w-7 h-7 text-gray-200" />
            <p className="text-sm text-gray-400">No milestones yet.</p>
            <p className="text-xs text-gray-300">Set XP targets for your class to work toward together.</p>
          </div>
        ) : (
          milestones.map((m) => <MilestoneRow key={m.id} milestone={m} />)
        )}
      </div>
    </div>
  )
}