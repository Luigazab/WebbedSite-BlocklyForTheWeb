import React from 'react'
import { MapPin } from 'lucide-react'
import { useLearn } from '../../hooks/useLearn'
import CategorySection from '../ui/CategorySection'
import { Divider } from '../public/Divider'
export default function LearnPage() {
  const {
    categories,
    loading,
    error,
    handleStartTopic,
    getEnrichedTopics,
  } = useLearn()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 text-sm animate-pulse">Loading your journey…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-4">
      {/* ── Hero Header ───────────────────────────────────────────────── */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center gap-2 pr-8">
          <MapPin className="text-blockly-green" size={30} />
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Learning Journey
          </h1>
        </div>
        <p className="text-slate-500 text-sm max-w-sm mx-auto tracking-relaxed font-bold">
          Complete each stage to unlock the next.
        </p>
      </div>
      <Divider/>

      {/* ── Roadmap ───────────────────────────────────────────────────── */}
      {categories.length === 0 ? (
        <div className="text-center py-20 text-slate-400 text-sm">
          No learning content available yet. Check back soon!
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => {
            const enrichedTopics = getEnrichedTopics(cat.id)
            return (
              <CategorySection
                key={cat.id}
                category={cat}
                topics={enrichedTopics}
                onStart={handleStartTopic}
              />
            )
          })}
        </div>
      )}
    </main>
  )
}