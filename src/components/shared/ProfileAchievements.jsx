import { useEffect, useState } from 'react'
import { Award } from 'lucide-react'
import { getStudentBadgeAwards, getStudentRecentActivity } from '../../services/classroomBadgeService'
import RecentActivityPanel from './RecentActivityPanel'

export default function ProfileAchievements({ studentId }) {
  const [result, setResult] = useState({ awards: [], activities: [], loading: true, error: '' })
  useEffect(() => {
    let cancelled = false
    async function load() {
      setResult({ awards: [], activities: [], loading: true, error: '' })
      try {
        const [awards, activities] = await Promise.all([getStudentBadgeAwards(studentId), getStudentRecentActivity(studentId)])
        if (!cancelled) setResult({ awards, activities, loading: false, error: '' })
      } catch (error) {
        if (!cancelled) setResult({ awards: [], activities: [], loading: false, error: error.message })
      }
    }
    load()
    return () => { cancelled = true }
  }, [studentId])
  return <div className="space-y-6">
    <section>
      <h2 className="mb-4 flex items-center gap-2 font-bold text-foreground"><Award className="text-amber-600 dark:text-amber-300" /> Earned Badges ({result.awards.length})</h2>
      {result.loading && <p className="text-sm text-muted-foreground">Loading badges…</p>}
      {result.error && <p role="alert" className="text-sm text-red-600 dark:text-red-300">Could not load achievements: {result.error}</p>}
      {!result.loading && !result.error && !result.awards.length && <p className="text-sm text-muted-foreground">Complete topics and earn course XP to collect your classroom badges.</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.awards.map(award => <article key={award.id} className="rounded-2xl border border-amber-200 bg-card p-5 text-center shadow-sm">
          {award.image_url ? <img src={award.image_url} alt={award.name} className="mx-auto mb-3 h-16 w-16 object-contain" /> : <Award className="mx-auto mb-3 h-16 w-16 text-amber-500" />}
          <h3 className="font-bold text-foreground">{award.name}</h3>
          {award.description && <p className="mt-1 text-sm text-muted-foreground">{award.description}</p>}
          <p className="mt-3 text-xs font-semibold text-amber-700 dark:text-amber-300">{award.requirement}</p>
          <p className="mt-2 text-xs text-muted-foreground">Earned {new Date(award.earned_at).toLocaleDateString()}</p>
        </article>)}
      </div>
    </section>
    <RecentActivityPanel posts={result.activities} loading={result.loading} error={result.error} showAuthor={false} />
  </div>
}
