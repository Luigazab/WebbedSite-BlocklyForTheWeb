import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getLessonCompletionSummary } from '@/services/teacherOverviewService'

export default function LessonDetailsModal({ classroomId, lesson, topic, onClose }) {
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let active = true
    getLessonCompletionSummary(classroomId, lesson.id)
      .then((data) => { if (active) setSummary(data) })
      .catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [classroomId, lesson.id, retry])

  const canEdit = ['lecture', 'quiz', 'tutorial', 'laboratory'].includes(lesson.type)
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{lesson.title}</DialogTitle>
          <DialogDescription>Lesson details for this classroom.</DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-2 gap-4 py-4">
          <div className="col-span-2"><dt className="text-sm text-muted-foreground">Topic</dt><dd className="font-semibold">{topic.title}</dd></div>
          <div><dt className="text-sm text-muted-foreground">Lesson type</dt><dd className="font-semibold capitalize">{lesson.type}</dd></div>
          <div><dt className="text-sm text-muted-foreground">Status</dt><dd className="font-semibold">{lesson.is_published ? 'Published' : 'Draft'}</dd></div>
          <div className="col-span-2 rounded-xl bg-muted p-4" aria-live="polite">
            <dt className="text-sm text-muted-foreground">Students completed</dt>
            <dd className="mt-1 font-semibold">
              {error ? 'Completion count unavailable.' : summary ? `${summary.completed} of ${summary.enrolled} enrolled students` : 'Loading completion count…'}
            </dd>
            {error && <Button variant="outline" className="mt-2" onClick={() => { setError(false); setRetry((value) => value + 1) }}>Retry</Button>}
          </div>
        </dl>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button disabled={!canEdit} onClick={() => navigate(`/teacher/${lesson.type}/edit/${lesson.id}?classroomId=${encodeURIComponent(classroomId)}`)}>Edit lesson</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
