import { Link } from 'react-router'
import { ChevronDown, Lock, Settings2 } from 'lucide-react'
import { LessonPlainChip } from '../common/LessonChip'
import { Button } from '../ui/button'
import { groupClassroomCurriculum, lessonTrackLabel, visibleTopicLessons } from '../../utils/classroomCurriculum'
import { lessonPath } from '../../utils/lessonRoutes'

export default function ClassroomCurriculum({
  classroomId, courses = [], topics = [], teacher = false, flow = null,
  lessonCompletion = {}, onEditTopics, onConfigureTopic, onSelectLesson, onUnlockTopic,
}) {
  const groups = groupClassroomCurriculum(courses, topics)
  const flowById = new Map((flow?.topics ?? []).map(topic => [topic.id, topic]))
  return <div className="space-y-8">
    {groups.map(group => {
      const visibleTopics = group.topics.filter(topic => teacher || topic.isPublished)
      const image = group.course?.image_src
      const imageUrl = image && (/^https?:\/\//.test(image) ? image : `https://ffnjdqoiaywleodqswnp.supabase.co/storage/v1/object/public/${image}`)
      return <section key={group.courseId} className="space-y-4" aria-label={group.course?.title || 'Course'}>
        <header className="flex items-center gap-3 rounded-xl p-3" style={{ background: `${group.course?.color || '#94a3b8'}10` }}>
          {imageUrl ? <img src={imageUrl} alt="" className="h-10 w-10 rounded-full border object-cover" />
            : <span className="grid size-10 place-items-center rounded-lg bg-slate-200 font-bold">{group.sequenceOrder}</span>}
          <div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Course {group.sequenceOrder}</p><h3 className="text-base font-bold">{group.course?.title || 'Untitled course'}</h3></div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{visibleTopics.length} topics</p>
            {teacher && <Button size="sm" variant="sidebar" onClick={() => onEditTopics(group)}>Edit topics</Button>}
          </div>
        </header>
        {!visibleTopics.length && <p className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">{teacher ? 'Add a topic to start organizing this course.' : 'Your teacher has not published any topics yet.'}</p>}
        <ol className="space-y-4">{visibleTopics.map((topic, index) => {
          const progress = flowById.get(topic.id)
          const own = progress?.students?.[0]
          const percent = progress?.eligible > 0 ? Math.round(progress.completed / progress.eligible * 100) : 0
          const lessons = visibleTopicLessons(topic, teacher)
          return <li key={topic.id} className="overflow-hidden rounded-xl border border-b-4 border-slate-200 bg-card">
            <div className='p-4 space-y-2'>
              <div className='flex items-center justify-between'>
                <div className='flex gap-2'>
                  <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">{String(index + 1).padStart(2, '0')}</span>
                  <h4 className="min-w-0 flex-1 text-lg font-semibold">
                    {topic.title}{teacher && !topic.isPublished && <span className="ml-2 text-xs font-normal text-amber-700">Draft topic</span>}
                  </h4>
                </div>
                {teacher ? <span className="text-xs text-muted-foreground">{topic.isUnlocked ? 'Open to students' : 'Locked'}</span>
                  : <div className="w-40 max-w-full text-xs" aria-label="Class topic progress">
                    <p className="mb-1 text-muted-foreground">{progress ? `${progress.completed} of ${progress.eligible} students complete` : 'Loading progress…'}</p>
                    <div role="progressbar" aria-label={`Class completion for ${topic.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-emerald-500 transition-all" style={{ width: `${percent}%` }} /></div>
                  </div>}
              </div>
              {topic.description && <p className="text-muted-foreground">{topic.description}</p>}
            </div>
            <details className="group" open>
              <summary className="flex cursor-pointer justify-between items-center p-4 border-t">
                <span className='flex items-center gap-2 text-sky-600 font-semibold px-4 py-2 hover:bg-slate-100 rounded'>
                  View topic details 
                  <ChevronDown size={18} className="shrink-0 transition-transform! group-open:rotate-180" />
                </span>
                {teacher && <div className="flex gap-2">{!topic.isUnlocked && <Button size="sm" variant="primaryOutline" onClick={() => onUnlockTopic(topic.id, topic.title)}>Force unlock</Button>}<Button size="sm" variant="primaryOutline" onClick={() => onConfigureTopic(topic)}><Settings2 size={15} /> Configure progression</Button></div>}
              </summary>
              {!teacher &&
                <div className="mx-4 flex flex-wrap items-center justify-between gap-3">
                  {own && <p className="mt-1 text-xs text-muted-foreground">Your core lessons: {own.completed_lessons}/{own.required_lessons}{own.pending_reviews > 0 ? ` · ${own.pending_reviews} review pending` : ''}</p>}
                  {!topic.isUnlocked && <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Lock size={12} /> Opens after the class finishes the previous topic.</p>}
                </div>
              }
              {!lessons.length && <p className="px-10 pb-4 text-sm text-muted-foreground">{teacher ? 'No lessons in this topic yet.' : 'Your teacher is preparing the lessons for this topic.'}</p>}
              <ul className='pb-4'>{lessons.map(lesson => {
                const content = <><LessonPlainChip type={lesson.type} /><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><span className="font-semibold">{lesson.title}</span><span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${lesson.topic_track === 'core' || !lesson.topic_track ? 'bg-sky-50 text-sky-700' : 'bg-violet-50 text-violet-700'}`}>{lessonTrackLabel(lesson)}</span>{teacher && !lesson.is_published && <span className="text-xs text-amber-700">Draft</span>}</span></span>
                  {teacher ? <><span className="font-mono text-xs">{lessonCompletion[lesson.id] ?? 0}%</span><span className="text-xs font-semibold text-primary">View</span></> : <span className="text-xs font-semibold text-primary">{topic.isUnlocked ? 'Open' : 'Locked'}</span>}</>
                const className = 'flex w-full items-center gap-3 px-10 py-3 text-left hover:bg-muted'
                return <li key={lesson.id}>{teacher ? <button type="button" className={className} onClick={() => onSelectLesson(lesson, topic)}>{content}</button>
                  : topic.isUnlocked && topic.courseSlug ? <Link className={className} to={lessonPath(topic.courseSlug, lesson.slug, classroomId)}>{content}</Link>
                    : <div className={className}>{content}</div>}</li>
              })}</ul>
            </details>
          </li>
        })}</ol>
      </section>
    })}
    {!groups.length && <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">No courses have been assigned to this classroom yet.</p>}
  </div>
}
