import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { supabase } from '../../supabaseClient'
import { xpService } from '../../services/xpService'

/** Displays the signed-in student's XP for the course that owns a lesson. */
export default function CourseXPProgress({ userId, lessonId }) {
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    if (!userId || !lessonId) return undefined
    let channel
    let active = true

    const load = async () => {
      const { data: lesson, error } = await supabase
        .from('lessons')
        .select('topics!inner(course_id)')
        .eq('id', lessonId)
        .single()
      if (error) return
      const courseId = lesson.topics.course_id
      const refresh = async () => {
        try {
          const value = await xpService.getCourseXP(userId, courseId)
          if (active) setSummary(value)
        } catch (err) {
          console.error('Failed to load course XP:', err)
        }
      }
      await refresh()
      channel = xpService.subscribeToCourseXP({ userId, courseId, onChange: refresh })
    }

    load()
    return () => {
      active = false
      if (channel) supabase.removeChannel(channel)
    }
  }, [userId, lessonId])

  if (!summary) return null
  const percent = summary.totalXP > 0 ? Math.min(100, Math.round((summary.earnedXP / summary.totalXP) * 100)) : 0

  return (
    <div className="min-w-44">
      <div className="flex items-center justify-between gap-2 text-xs font-semibold text-violet-700">
        <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> {summary.earnedXP} XP</span>
        <span>{percent}%</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-violet-100 overflow-hidden">
        <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
