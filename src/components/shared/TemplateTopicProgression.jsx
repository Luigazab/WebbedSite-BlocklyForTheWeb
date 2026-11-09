import { useState } from 'react'
import { supabase } from '../../supabaseClient'

export default function TemplateTopicProgression({ topic }) {
  const [lessons, setLessons] = useState(topic.lessons)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function update(lesson, patch) {
    setBusy(true); setError('')
    try {
      const { data, error: cause } = await supabase.from('lessons').update(patch).eq('id', lesson.id).is('classroom_id', null).select('id,topic_track,required_for_topic,expected_minutes').single()
      if (cause) throw cause
      setLessons(items => items.map(item => item.id === lesson.id ? { ...item, ...data } : item))
    } catch (cause) { setError(cause.message) }
    finally { setBusy(false) }
  }
  return <details className="mt-4 rounded-xl border bg-muted p-4">
    <summary className="cursor-pointer text-sm font-semibold">Configure topic progression</summary>
    <p className="my-3 text-sm text-foreground">Required core lessons advance the classroom. Practice is optional. These defaults accompany future course clones.</p>
    {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
    <div className="space-y-3">{lessons.map(lesson => <div key={lesson.id} className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
      <span className="min-w-40 flex-1 text-sm font-medium">{lesson.title}{!lesson.is_published && ' · Draft'}</span>
      <select aria-label={`Track for ${lesson.title}`} className="rounded border p-2 text-sm" disabled={busy} value={lesson.topic_track || 'core'} onChange={event => update(lesson, { topic_track: event.target.value, required_for_topic: event.target.value === 'core' && lesson.required_for_topic })}>
        {['core', 'beginner', 'intermediate', 'advanced'].map(track => <option key={track} value={track}>{track === 'core' ? 'Core' : `${track} practice`}</option>)}
      </select>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" disabled={busy || lesson.topic_track !== 'core'} checked={Boolean(lesson.required_for_topic)} onChange={event => update(lesson, { required_for_topic: event.target.checked })} />Required</label>
      <label className="flex items-center gap-2 text-sm">Target minutes<input key={`${lesson.id}:${lesson.expected_minutes}`} type="number" min="1" max="240" className="w-20 rounded border p-2" disabled={busy} defaultValue={lesson.expected_minutes} onBlur={event => {
        const minutes = Number(event.target.value)
        if (!Number.isInteger(minutes) || minutes < 1 || minutes > 240) { setError('Target minutes must be a whole number from 1 to 240.'); event.target.value = lesson.expected_minutes; return }
        if (minutes !== lesson.expected_minutes) update(lesson, { expected_minutes: minutes })
      }} /></label>
    </div>)}</div>
  </details>
}
