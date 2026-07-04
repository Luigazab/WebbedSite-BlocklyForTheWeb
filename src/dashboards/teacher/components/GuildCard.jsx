import { useNavigate } from 'react-router'
import { Users, Copy, RefreshCw, Archive, Check, Target, ChevronRight } from 'lucide-react'
import { useState } from 'react'

// Renders one classroom guild card on the teacher list page.
export default function GuildCard({ guild, onArchive, onRegenerateCode }) {
  const navigate     = useNavigate()
  const [copied, setCopied] = useState(false)

  const copyCode = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(guild.join_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerate = (e) => {
    e.stopPropagation()
    onRegenerateCode()
  }

  const handleArchive = (e) => {
    e.stopPropagation()
    onArchive()
  }

  // Milestone summary — find the next incomplete milestone
  const milestones    = guild.milestones ?? []
  const nextMilestone = milestones.find((m) => (m.current_score ?? 0) < m.target_score)
  const pct           = nextMilestone
    ? Math.min(100, Math.round(((nextMilestone.current_score ?? 0) / nextMilestone.target_score) * 100))
    : milestones.length > 0 ? 100 : null

  return (
    <div
      onClick={() => navigate(`/teacher/classrooms/${guild.id}`)}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blockly-purple/20 transition-all cursor-pointer flex flex-col"
    >
      {/* Top section */}
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-800 truncate group-hover:text-blockly-purple transition-colors">
              {guild.name}
            </h3>
            {guild.description && (
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{guild.description}</p>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blockly-purple shrink-0 mt-0.5 transition-colors" />
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-3">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-gray-400" />
            {guild.member_count} {guild.member_count === 1 ? 'student' : 'students'}
          </span>
          {milestones.length > 0 && (
            <span className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-gray-400" />
              {milestones.filter((m) => (m.current_score ?? 0) >= m.target_score).length}/{milestones.length} milestones
            </span>
          )}
        </div>

        {/* Milestone progress bar */}
        {pct !== null && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">
                {nextMilestone ? `Next: ${nextMilestone.title}` : 'All milestones complete'}
              </span>
              <span className="text-xs font-semibold text-blockly-purple">{pct}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blockly-purple rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Join code + actions */}
      <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Code:</span>
          <span className="font-mono font-bold text-sm text-blockly-purple tracking-widest">
            {guild.join_code}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={copyCode}
            title="Copy join code"
            className="p-1.5 rounded-lg text-gray-400 hover:text-blockly-purple hover:bg-blockly-purple/5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleRegenerate}
            title="Regenerate code"
            className="p-1.5 rounded-lg text-gray-400 hover:text-blockly-purple hover:bg-blockly-purple/5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleArchive}
            title="Archive classroom"
            className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
          >
            <Archive className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}