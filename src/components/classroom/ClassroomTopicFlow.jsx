import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { getClassroomTopics, teacherUnlockTopic } from '../../services/curriculumService'
import { getClassroomTopicFlow, setClassroomLessonRule, setClassroomLessonTargetMinutes, setClassroomTopicExemption } from '../../services/classroomFlowService'
import { lessonPath } from '../../utils/lessonRoutes'

const TRACKS = ['core', 'beginner', 'intermediate', 'advanced']
const label = value => value ? value[0].toUpperCase() + value.slice(1).replaceAll('_', ' ') : 'Unclassified'

export default function ClassroomTopicFlow({ classroomId, teacher = false, curriculum = null, courses = [], onCurriculumChange, topicId = null }) {
  const [flow, setFlow] = useState(null)
  const [topics, setTopics] = useState(curriculum ?? [])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [reasons, setReasons] = useState({})

  const refresh = useCallback(async () => {
    try {
      const [nextFlow, nextTopics] = await Promise.all([
        getClassroomTopicFlow(classroomId), getClassroomTopics(classroomId),
      ])
      setFlow(nextFlow)
      setTopics(nextTopics)
      setError('')
    } catch (cause) { setError(cause.message || 'Could not load classroom progress.') }
  }, [classroomId])

  useEffect(() => { refresh() }, [refresh])
  useEffect(() => {
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refresh])

  const act = async task => {
    setBusy(true)
    try { await task(); await refresh(); await onCurriculumChange?.() }
    catch (cause) { setError(cause.message || 'Could not update classroom flow.') }
    finally { setBusy(false) }
  }

  const byId = new Map(topics.map(topic => [topic.id, topic]))
  const courseNames = new Map(courses.map(course => [course.course_id, course.courses?.title]))
  const courseSummary = useMemo(() => {
    if (!teacher || !flow?.topics) return []
    const rows = new Map()
    for (const topic of flow.topics) for (const student of topic.students ?? []) {
      if (student.accuracy == null) continue
      const key = `${topic.course_id}:${student.student_id}`
      const row = rows.get(key) ?? { courseId: topic.course_id, studentId: student.student_id, name: student.username, total: 0, accuracyTotal: 0, count: 0, provisional: false }
      row.total += Math.min(100, Number(student.accuracy) + Number(student.speed_bonus ?? 0))
      row.accuracyTotal += Number(student.accuracy)
      row.count += 1
      row.provisional ||= student.classification_provisional
      rows.set(key, row)
    }
    return [...rows.values()].map(row => ({ ...row, score: Math.round(row.total / row.count), accuracy: Math.round(row.accuracyTotal / row.count) }))
  }, [flow, teacher])

  return (
    <section className="space-y-5" aria-label="Classroom topic flow">
      <div className="flex items-center justify-between gap-3">
        <div><h2 className="text-lg font-semibold">Core topic progression</h2><p className="text-sm text-muted-foreground">Required core activities determine completion. Practice and teacher reviews do not delay the class.</p></div>
        <button type="button" className="rounded-lg border px-3 py-1.5 text-sm" onClick={refresh}>Refresh</button>
      </div>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!flow && !error && <p className="text-sm text-muted-foreground">Loading topic progress…</p>}
      {(flow?.topics ?? []).filter(topic => (teacher || topic.is_published) && (!topicId || topic.id === topicId)).map(topic => {
        const curriculumTopic = byId.get(topic.id)
        const own = teacher ? null : topic.students?.[0]
        const percent = topic.eligible ? Math.round(topic.completed / topic.eligible * 100) : topic.required_lessons && topic.is_unlocked ? 100 : 0
        return <article key={topic.id} className="rounded-2xl border bg-card p-5 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-xs text-muted-foreground">{courseNames.get(topic.course_id) || curriculumTopic?.courseTitle || 'Course'}</p><h3 className="font-semibold">{topic.title}</h3><p className="text-sm text-muted-foreground">{topic.is_unlocked ? topic.eligible ? `${topic.completed} of ${topic.eligible} active students completed` : 'No eligible students are holding this topic' : 'Locked until the previous topic is complete'}</p></div>
            <div className="flex items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${topic.is_unlocked ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>{topic.is_unlocked ? 'Open' : 'Locked'}</span>
              {teacher && !topic.is_unlocked && <button disabled={busy} onClick={() => act(() => teacherUnlockTopic(topic.id))} className="rounded-lg border px-3 py-1 text-xs font-semibold disabled:opacity-50">Unlock now</button>}
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100" aria-label={`${percent}% of eligible students completed`}><div className="h-full bg-emerald-500 transition-all" style={{ width: `${percent}%` }} /></div>
          {topic.required_lessons === 0 && <p className="text-xs text-amber-700">Add a required tutorial or laboratory to enable automatic progression.</p>}
          {own && <p className="text-sm">Your status: <strong>{label(own.status)}</strong>{own.late_joiner ? ' · Late enrollee (does not hold the class)' : ''}{own.pending_reviews > 0 ? ` · ${own.pending_reviews} teacher review pending` : ''}{own.classification ? ` · ${label(own.classification)}${own.classification_provisional ? ' (provisional)' : ''}` : ''}</p>}

          {curriculumTopic && <div className="space-y-3">
            {TRACKS.map(track => {
              const lessons = curriculumTopic.lessons.filter(lesson => (teacher || lesson.is_published) && (lesson.topic_track || 'core') === track)
              if (!lessons.length) return null
              return <div key={track}><h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{track === 'core' ? 'Core activities' : `${label(track)} practice · optional`}</h4>
                <ul className="space-y-1">{lessons.map(lesson => <li key={lesson.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm">
                  <span>{lesson.title} <span className="text-muted-foreground">({lesson.type})</span>{!lesson.is_published && <span className="ml-2 text-xs text-amber-700">Draft · does not count until published</span>}{track === 'core' && <span className="ml-2 text-xs text-muted-foreground">{lesson.required_for_topic ? 'Required' : 'Optional'}</span>}</span>
                  {teacher ? <span className="flex items-center gap-2">
                    <select aria-label={`Track for ${lesson.title}`} disabled={busy} value={lesson.topic_track || 'core'} onChange={event => act(() => setClassroomLessonRule(lesson.id, event.target.value, event.target.value === 'core' && Boolean(lesson.required_for_topic)))} className="rounded border px-1 py-1 text-xs">{TRACKS.map(value => <option key={value} value={value}>{label(value)}</option>)}</select>
                    {track === 'core' && <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={Boolean(lesson.required_for_topic)} disabled={busy} onChange={event => act(() => setClassroomLessonRule(lesson.id, 'core', event.target.checked))} /> Required</label>}
                    <label className="flex items-center gap-1 text-xs">Target min <input type="number" min="1" max="240" defaultValue={lesson.expected_minutes ?? 20} key={`${lesson.id}:${lesson.expected_minutes}`} disabled={busy} className="w-14 rounded border px-1 py-1" onBlur={event => { const value = Number(event.target.value); if (value !== lesson.expected_minutes) act(() => setClassroomLessonTargetMinutes(lesson.id, value)) }} /></label>
                  </span> : topic.is_unlocked && curriculumTopic.courseSlug ? <Link className="font-semibold text-primary underline" to={lessonPath(curriculumTopic.courseSlug, lesson.slug, classroomId)}>Open</Link> : <span className="text-xs text-muted-foreground">Locked</span>}
                </li>)}</ul>
              </div>
            })}
          </div>}
          {teacher && <div className="space-y-2 border-t pt-3"><h4 className="text-sm font-semibold">Student status and exemptions</h4>
            {(topic.students ?? []).map(student => <div key={student.student_id} className="flex flex-wrap items-center gap-2 text-xs">
              <span className="w-36 truncate font-medium">{student.username}</span><span className="w-32">{label(student.status)} · {student.completed_lessons}/{student.required_lessons}</span>
              {student.pending_reviews > 0 && <span className="text-sky-700">{student.pending_reviews} review pending</span>}
              <span className="text-muted-foreground">{student.classification ? `${label(student.classification)} · ${student.accuracy}% accuracy + ${student.speed_bonus ?? 0} speed bonus${student.classification_provisional ? ' (provisional)' : ''}` : 'Unclassified'}</span>
              {!student.late_joiner && (student.exemption_reason ?
                <button disabled={busy} className="rounded border px-2 py-1" onClick={() => act(() => setClassroomTopicExemption(topic.id, student.student_id, false))}>Remove exemption</button> :
                <span className="flex items-center gap-1"><input className="w-36 rounded border px-2 py-1" aria-label={`Exemption reason for ${student.username}`} placeholder="Reason for exemption" value={reasons[`${topic.id}:${student.student_id}`] ?? ''} onChange={event => setReasons(previous => ({ ...previous, [`${topic.id}:${student.student_id}`]: event.target.value }))} /><button disabled={busy || !reasons[`${topic.id}:${student.student_id}`]?.trim()} className="rounded border px-2 py-1 disabled:opacity-50" onClick={() => act(() => setClassroomTopicExemption(topic.id, student.student_id, true, reasons[`${topic.id}:${student.student_id}`]))}>Exempt</button></span>)}
              {student.exemption_reason && <span className="text-muted-foreground">{student.exemption_reason}</span>}
            </div>)}
          </div>}
        </article>
      })}
      {teacher && !topicId && courseSummary.length > 0 && <div className="rounded-2xl border bg-card p-5"><h3 className="mb-2 font-semibold">Course classification summary</h3><div className="grid gap-1 text-sm">{courseSummary.map(row => <p key={`${row.courseId}:${row.studentId}`}>{row.name} · {courseNames.get(row.courseId) || 'Course'}: <strong>{label(row.score >= 85 ? 'advanced' : row.score >= 65 ? 'intermediate' : 'beginner')}</strong> ({row.accuracy}% accuracy, {row.score - row.accuracy} point speed bonus{row.provisional ? ', provisional' : ''})</p>)}</div></div>}
      {teacher && (flow?.events?.length ?? 0) > 0 && <details className="rounded-2xl border bg-card p-5"><summary className="cursor-pointer font-semibold">Unlock and exemption log</summary><ul className="mt-3 space-y-1 text-xs text-muted-foreground">{flow.events.filter(event => !topicId || event.topic_id === topicId).map(event => <li key={event.id}>{new Date(event.created_at).toLocaleString()} · {event.action.replaceAll('_',' ')}{event.details?.reason ? ` · ${event.details.reason}` : ''}</li>)}</ul></details>}
    </section>
  )
}
