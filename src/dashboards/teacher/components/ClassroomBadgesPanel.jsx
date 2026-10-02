import { useCallback, useEffect, useState } from 'react'
import { Award, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClassroomBadgeRule, getBadgeLibrary, getClassroomBadgeRules, setClassroomBadgeActive } from '../../../services/classroomBadgeService'

const emptyForm = { name: '', description: '', image_url: '', criterion: 'topic_completed', course_id: '', topic_id: '', xp_target: '' }

export default function ClassroomBadgesPanel({ classroomId, courses, topics, onAwarded }) {
  const [rules, setRules] = useState([])
  const [library, setLibrary] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [libraryError, setLibraryError] = useState('')
  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try { setRules(await getClassroomBadgeRules(classroomId)) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }, [classroomId])
  useEffect(() => { load() }, [load])
  useEffect(() => {
    getBadgeLibrary().then(setLibrary).catch(() => setLibraryError('Badge images could not be loaded. You can still use the default award icon or an image URL.'))
  }, [])
  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))
  const availableTopics = topics.filter(topic => topic.courseId === form.course_id)
  async function save(event) {
    event.preventDefault()
    if (busy) return
    if (form.criterion === 'course_xp' && (!Number.isSafeInteger(Number(form.xp_target)) || Number(form.xp_target) <= 0)) {
      setError('Enter a positive whole number for the XP target.'); return
    }
    if (form.image_url && !/^https?:\/\//i.test(form.image_url)) { setError('Use an HTTP or HTTPS image URL.'); return }
    setBusy(true); setError('')
    try {
      await createClassroomBadgeRule({
        classroom_id: classroomId, course_id: form.course_id, name: form.name.trim(), description: form.description.trim(),
        image_url: form.image_url.trim() || null, criterion: form.criterion,
        topic_id: form.criterion === 'topic_completed' ? form.topic_id : null,
        xp_target: form.criterion === 'course_xp' ? Number(form.xp_target) : null,
      })
      setForm(emptyForm)
      await load()
      await onAwarded()
      toast.success('Badge created. Eligible students have been awarded automatically.')
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }
  async function toggle(rule) {
    setBusy(true); setError('')
    try { await setClassroomBadgeActive(rule.id, !rule.is_active); await load(); await onAwarded() }
    catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }
  return <div className="grid gap-6 lg:grid-cols-2">
    <form onSubmit={save} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold"><Award className="text-amber-600" /> Create a Badge</h2>
      <p className="text-sm text-slate-500">Students earn badges automatically. Students who already meet the requirement receive the badge when you create it.</p>
      <label className="text-sm font-semibold">Badge name<input required maxLength={80} value={form.name} onChange={e => update('name', e.target.value)} className="mt-1 w-full rounded-lg border p-2" /></label>
      <label className="text-sm font-semibold">Description<textarea maxLength={500} value={form.description} onChange={e => update('description', e.target.value)} className="mt-1 w-full rounded-lg border p-2" /></label>
      <label className="text-sm font-semibold">Award for<select value={form.criterion} onChange={e => update('criterion', e.target.value)} className="mt-1 w-full rounded-lg border p-2">
        <option value="topic_completed">Completing all published lessons in a topic</option><option value="course_xp">Reaching a course XP target</option>
      </select></label>
      <label className="text-sm font-semibold">Course<select required value={form.course_id} onChange={e => setForm(prev => ({ ...prev, course_id: e.target.value, topic_id: '' }))} className="mt-1 w-full rounded-lg border p-2">
        <option value="">Select an assigned course</option>{courses.map(course => <option key={course.course_id} value={course.course_id}>{course.courses?.title}</option>)}
      </select></label>
      {form.criterion === 'topic_completed' ? <label className="text-sm font-semibold">Topic<select required value={form.topic_id} onChange={e => update('topic_id', e.target.value)} className="mt-1 w-full rounded-lg border p-2">
        <option value="">Select a topic</option>{availableTopics.map(topic => <option key={topic.id} value={topic.id}>{topic.title}</option>)}
      </select></label> : <label className="text-sm font-semibold">XP target<input required type="number" min="1" step="1" value={form.xp_target} onChange={e => update('xp_target', e.target.value)} className="mt-1 w-full rounded-lg border p-2" /><span className="text-xs font-normal text-slate-500">Counts XP earned in this classroom’s course lessons.</span></label>}
      <div><p className="text-sm font-semibold">Badge image</p><p className="text-xs text-slate-500">Choose a library image, enter an image URL, or keep the default award icon.</p>
        {libraryError && <p className="mt-2 text-xs text-amber-700">{libraryError}</p>}
        <div className="mt-2 flex flex-wrap gap-2"><button type="button" aria-label="Use default badge icon" aria-pressed={!form.image_url} onClick={() => update('image_url', '')} className={`rounded-lg border p-2 ${!form.image_url ? 'border-amber-500 bg-amber-50' : ''}`}><Award className="h-10 w-10 text-amber-500" /></button>
          {library.map(image => <button type="button" key={image.id} title={image.name} aria-label={`Use ${image.name}`} aria-pressed={form.image_url === image.image_url} onClick={() => update('image_url', image.image_url)} className={`rounded-lg border p-2 ${form.image_url === image.image_url ? 'border-amber-500 bg-amber-50' : ''}`}><img src={image.image_url} alt={image.name} className="h-10 w-10 object-contain" /></button>)}
        </div>
        <input aria-label="Badge image URL" type="url" placeholder="https://… (optional image URL)" value={form.image_url} onChange={e => update('image_url', e.target.value)} className="mt-2 w-full rounded-lg border p-2 text-sm" />
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {!courses.length && <p className="text-sm text-amber-700">Assign a course before creating badges.</p>}
      <button disabled={busy || !courses.length} className="btn btn-primary flex items-center gap-2 disabled:opacity-50">{busy && <Loader2 size={16} className="animate-spin" />} {busy ? 'Saving…' : 'Create Badge'}</button>
    </form>
    <section className="space-y-4"><h2 className="text-lg font-bold">Classroom Badges</h2>
      {loading && <p className="text-sm text-slate-500">Loading badges…</p>}
      {!loading && !rules.length && <p className="text-sm text-slate-500">No badges created yet.</p>}
      {rules.map(rule => <article key={rule.id} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        {rule.image_url ? <img src={rule.image_url} alt={rule.name} className="h-14 w-14 object-contain" /> : <Award className="h-14 w-14 shrink-0 text-amber-500" />}
        <div className="min-w-0 flex-1"><h3 className="font-bold">{rule.name}</h3><p className="text-sm text-slate-500">{rule.description}</p>
          <p className="mt-2 text-xs text-slate-600">{rule.criterion === 'topic_completed' ? `Complete all lessons in ${topics.find(t => t.id === rule.topic_id)?.title ?? 'topic'}` : `Reach ${rule.xp_target} XP in ${courses.find(c => c.course_id === rule.course_id)?.courses?.title ?? 'course'}`}</p>
          <p className="mt-1 text-xs font-semibold text-amber-700">{rule.is_active ? 'Active' : 'Paused — earned badges are kept'}</p>
          <button disabled={busy} type="button" onClick={() => toggle(rule)} className="mt-3 text-sm font-semibold text-sky-700 disabled:opacity-50">{rule.is_active ? 'Pause awards' : 'Resume awards'}</button>
        </div>
      </article>)}
    </section>
  </div>
}
