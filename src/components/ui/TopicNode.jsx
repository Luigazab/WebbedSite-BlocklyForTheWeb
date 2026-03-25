import React, { useRef, useEffect } from 'react'
import { CheckCircle2, Lock, Play, Clock } from 'lucide-react'

/**
 * A single stage node on the roadmap.
 * isUnlocked comes pre-resolved by useLearn (always true for teachers).
 */
export default function TopicNode({
  topic,      // { id, title, description, estimated_duration, isCompleted, isUnlocked, progress }
  color,
  index,
  onStart,
  isActive,
  onToggle,
  disableOffset = false,
}) {
  const nodeRef = useRef(null)
  const tooltipRef = useRef(null)
  const { isCompleted, isUnlocked } = topic

  useEffect(() => {
    if (!isActive) return
    const handler = (e) => {
      if (
        nodeRef.current && !nodeRef.current.contains(e.target) &&
        tooltipRef.current && !tooltipRef.current.contains(e.target)
      ) {
        onToggle()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isActive, onToggle])

  const stateIcon = isCompleted
    ? <CheckCircle2 size={22} className="text-white" />
    : isUnlocked
    ? <Play size={20} className="text-white fill-white" />
    : <Lock size={18} className="text-white/70" />

  const offset = index % 2 === 0 ? 0 : 28
  const offsetX = index % 2 === 0 ? -60 : 60

  return (
    <div
      className="relative flex flex-col items-center"
      style={{
        transform: `translateX(${disableOffset ? 0 : offsetX}px) translateY(${disableOffset ? 0 : offset}px)`,
      }}
    >

      <button
        ref={nodeRef}
        onClick={onToggle}
        disabled={!isUnlocked}
        title={isUnlocked ? topic.title : 'Complete the prerequisite first'}
        className={`
          relative w-16 h-16 rounded-full border-4 flex items-center justify-center
          transition-all! duration-200! select-none
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          ${isCompleted
            ? 'shadow-md scale-95'
            : isUnlocked
            ? 'shadow-lg hover:scale-110 hover:shadow-xl active:scale-95 cursor-pointer'
            : 'opacity-40 cursor-not-allowed'
          }
        `}
        style={{
          backgroundColor: isCompleted ? color : isUnlocked ? color : '#94a3b8',
          borderColor: isCompleted
            ? darken(color, 20)
            : isUnlocked
            ? darken(color, 15)
            : '#64748b',
          boxShadow: isUnlocked && !isCompleted
            ? `0 6px 0 ${darken(color, 25)}, 0 8px 16px ${color}44`
            : undefined,
        }}
      >
        {stateIcon}

        {isCompleted && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ backgroundColor: color }}
          />
        )}
        {isCompleted && (
          <span className="absolute -top-2 -right-1 text-yellow-400 text-sm select-none">★</span>
        )}
      </button>

      <span
        className="mt-2 text-xs font-bold text-center leading-tight max-w-18"
        style={{ color: isUnlocked ? '#1e293b' : '#94a3b8' }}
      >
        {topic.title}
      </span>

      {isActive && (
        <div
          ref={tooltipRef}
          className="absolute z-50 bottom-full mb-4 left-1/2 -translate-x-1/2 w-64"
          style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.18))' }}
        >
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0"
            style={{
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderTop: `10px solid ${color}`,
            }}
          />
          <div className="rounded-2xl p-4 text-white" style={{ backgroundColor: color }}>
            <p className="font-black text-sm mb-1">{topic.title}</p>

            {topic.description && (
              <p className="text-xs opacity-85 mb-3 leading-snug">{topic.description}</p>
            )}

            {topic.estimated_duration && (
              <div className="flex items-center gap-1 text-xs opacity-75 mb-3">
                <Clock size={12} />
                <span>{topic.estimated_duration} min</span>
              </div>
            )}

            {isCompleted && (
              <div className="text-xs font-bold text-center opacity-90">✓ Completed</div>
            )}
            {!isCompleted && isUnlocked && (
              <button
                onClick={(e) => { e.stopPropagation(); onStart(topic.id) }}
                className="w-full py-2 rounded-xl text-xs font-black bg-white/20 hover:bg-white/30 border border-white/30 transition-colors"
              >
                Start →
              </button>
            )}
            {!isCompleted && !isUnlocked && (
              <div className="text-xs font-bold text-center opacity-90">
                Complete the prerequisite first
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function darken(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, (num >> 16) - amount)
  const g = Math.max(0, ((num >> 8) & 0xff) - amount)
  const b = Math.max(0, (num & 0xff) - amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}