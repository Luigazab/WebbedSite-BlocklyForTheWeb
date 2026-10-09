import { useState } from 'react'
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { saveCourseTopics } from '../../../services/curriculumService'

export default function CourseTopicsModal({ classroomId, group, onClose, onSaved }) {
  const [topics, setTopics] = useState(() => group.topics.map(topic => ({
    id: topic.id, key: topic.id, title: topic.title ?? '', description: topic.description ?? '',
    isPublished: Boolean(topic.isPublished),
  })))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const update = (key, changes) => setTopics(rows => rows.map(row => row.key === key ? { ...row, ...changes } : row))
  function move(index, direction) {
    setTopics(rows => {
      const next = [...rows]
      const target = index + direction
      if (target < 0 || target >= next.length) return rows
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }
  async function save(event) {
    event.preventDefault()
    if (topics.some(topic => !topic.title.trim())) { setError('Give every topic a title.'); return }
    setBusy(true); setError('')
    try {
      await saveCourseTopics(classroomId, group.courseId, topics)
      await onSaved()
      onClose()
    } catch (cause) { setError(cause.message || 'Could not save the topics.') }
    finally { setBusy(false) }
  }
  return <Dialog open onOpenChange={open => { if (!open && !busy) onClose() }}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl" showCloseButton={!busy}>
      <DialogHeader><DialogTitle>Edit topics · {group.course?.title}</DialogTitle><DialogDescription>Add topics and arrange the learning order for this course. Topics already open to students stay open.</DialogDescription></DialogHeader>
      <form onSubmit={save} className="space-y-4">
        <fieldset disabled={busy} className="space-y-4">
          {topics.map((topic, index) => <div key={topic.key} className="space-y-3 rounded-xl border p-4">
            <div className="flex items-center gap-2"><strong className="flex-1 text-sm">Topic {index + 1}{!topic.id ? ' · New' : ''}</strong>
              <Button type="button" variant="outline" size="icon-sm" aria-label={`Move topic ${index + 1} up`} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={15} /></Button>
              <Button type="button" variant="outline" size="icon-sm" aria-label={`Move topic ${index + 1} down`} disabled={index === topics.length - 1} onClick={() => move(index, 1)}><ArrowDown size={15} /></Button>
              {!topic.id && <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove new topic" onClick={() => setTopics(rows => rows.filter(row => row.key !== topic.key))}><Trash2 size={15} /></Button>}
            </div>
            <label className="text-sm font-medium">Title<input required maxLength={160} value={topic.title} onChange={event => update(topic.key, { title: event.target.value })} className="mt-1 w-full rounded-lg border p-2" /></label>
            <label className="text-sm font-medium">Description<textarea rows={2} maxLength={2000} value={topic.description} onChange={event => update(topic.key, { description: event.target.value })} className="mt-1 w-full rounded-lg border p-2" /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={topic.isPublished} onChange={event => update(topic.key, { isPublished: event.target.checked })} /> Publish topic to students</label>
          </div>)}
          <Button type="button" variant="outline" onClick={() => setTopics(rows => [...rows, { id: null, key: crypto.randomUUID(), title: '', description: '', isPublished: false }])}><Plus size={16} /> Add topic</Button>
        </fieldset>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" disabled={busy} onClick={onClose}>Cancel</Button><Button type="submit" disabled={busy || !topics.length}>{busy && <Loader2 size={16} className="animate-spin" />}{busy ? 'Saving…' : 'Save topics'}</Button></div>
      </form>
    </DialogContent>
  </Dialog>
}
