import SubmissionReview from '../../../components/shared/SubmissionReview'
import { lessonResult } from '../../../lib/assessment'
import { useEffect, useState } from 'react'
import { Loader2, ClipboardList, FileCode, BookOpen } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog'
import { getStudentReview } from '../../../services/studentReviewService'

const tabs = [{ id: 'activities', label: 'Activities', icon: BookOpen }, { id: 'quizzes', label: 'Quizzes', icon: ClipboardList }, { id: 'submissions', label: 'Submissions', icon: FileCode }]
const date = value => value ? new Date(value).toLocaleString() : '—'
const attemptScore = (attempt, quiz) => attempt.score == null ? 'No score yet' : attempt.percentage != null ? `${Math.round(attempt.percentage)}%` : (attempt.score_total || quiz?.question_count) ? `${attempt.score} / ${attempt.score_total || quiz.question_count} correct` : `${attempt.score}%`

export default function StudentProgressModal({ classroomId, student, onClose, onGraded }) {
  const [review, setReview] = useState(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('activities')
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let cancelled = false
    getStudentReview(classroomId, student.studentId).then(data => { if (!cancelled) setReview(data) }).catch(err => { if (!cancelled) setError(err.message) })
    return () => { cancelled = true }
  }, [classroomId, student.studentId, retry])
  const lessons = review?.lessons ?? []
  const submissions = review?.submissions ?? []
  const published = lessons.filter(lesson => lesson.is_published)
  const completed = published.filter(lesson => lesson.progress?.is_completed).length
  const pending = submissions.filter(submission => submission.is_final && !submission.graded_at && lessons.find(lesson => lesson.id === submission.lesson_id)?.type === 'laboratory').length
  return <Dialog open onOpenChange={open => { if (!open) onClose() }}>
    <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-5xl">
      <DialogHeader><DialogTitle className="flex items-center gap-3"><img src={student.avatarUrl || '/default-avatar.png'} alt="" className="h-10 w-10 rounded-full object-cover" />{student.username}</DialogTitle><DialogDescription>Student progress and submitted work in this classroom.</DialogDescription></DialogHeader>
      {!review && !error && <div className="flex justify-center p-12"><Loader2 className="animate-spin text-sky-500" /></div>}
      {error && <div role="alert" className="text-red-600">{error}<button className="ml-3 underline" onClick={() => { setError(''); setRetry(value => value + 1) }}>Try again</button></div>}
      {review && <>
        <div className="grid grid-cols-3 gap-3"><Summary label="Completed lessons" value={`${completed}/${published.length}`} /><Summary label="Progress" value={`${published.length ? Math.round(completed / published.length * 100) : 0}%`} /><Summary label="Labs awaiting grades" value={pending} /></div>
        <div role="tablist" aria-label="Student progress" className="flex gap-2 border-b">{tabs.map(tab => { const Icon = tab.icon; return <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} aria-controls={`student-${tab.id}`} id={`student-tab-${tab.id}`} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 border-b-2 px-4 py-3 font-semibold ${activeTab === tab.id ? 'border-sky-500 text-sky-700' : 'border-transparent text-slate-500'}`}><Icon size={16} />{tab.label}</button> })}</div>
        <div role="tabpanel" id={`student-${activeTab}`} aria-labelledby={`student-tab-${activeTab}`} className="min-h-0 overflow-y-auto">
          {activeTab === 'activities' && <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr>{['Lesson','Type','Status','Score'].map(label => <th key={label} className="p-3">{label}</th>)}</tr></thead><tbody className="divide-y">{lessons.map(lesson => {
            const labSubmission = submissions.find(submission => submission.lesson_id === lesson.id)
            const finished = lesson.progress?.is_completed
            const score = lessonResult(lesson,submissions).score == null ? '—' : `${lessonResult(lesson,submissions).score}%`
            return <tr key={lesson.id}><td className="p-3"><p className="font-semibold">{lesson.title}</p><p className="text-xs text-slate-500">{lesson.topic_title}{!lesson.is_published && ' · Draft'}</p></td><td className="p-3 capitalize">{lesson.type}</td><td className="p-3"><span className={finished ? 'text-emerald-700' : 'text-slate-500'}>{finished ? 'Completed' : labSubmission ? 'Work saved' : 'Not completed'}</span><p className="text-xs text-slate-400">{finished ? date(lesson.progress.completed_at) : ''}</p></td><td className="p-3">{score}</td></tr>
          })}</tbody></table>{!lessons.length && <Empty text="No classroom lessons yet." />}</div>}
          {activeTab === 'quizzes' && <div className="space-y-4">{lessons.filter(lesson => lesson.type === 'quiz').map(lesson => <article key={lesson.id} className="rounded-xl border p-4"><h3 className="font-bold">{lesson.title}</h3><p className="text-xs text-slate-500">{lesson.topic_title} · {lesson.attempts.length} attempts</p>{!lesson.attempts.length ? <p className="mt-3 text-sm text-slate-500">No attempts yet.</p> : <table className="mt-3 w-full text-left text-sm"><thead className="text-xs text-slate-500"><tr><th className="py-2">Attempt</th><th>Score</th><th>Status</th><th>Finished</th></tr></thead><tbody className="divide-y">{lesson.attempts.map((attempt, index) => <tr key={attempt.id}><td className="py-3">#{index + 1}{attempt.answers?.length > 0 && <details className="mt-2"><summary className="cursor-pointer text-sky-800">Answers</summary>{attempt.answers.map((answer,i) => <p key={i} className="my-2 max-w-sm text-xs">{answer.question}<br />{answer.selected || 'Unanswered'} · {answer.correct ? 'Correct' : 'Incorrect'}</p>)}</details>}</td><td>{attemptScore(attempt, lesson.quiz)}</td><td className="capitalize">{attempt.status?.replace('_', ' ') ?? 'Unknown'}</td><td>{date(attempt.finished_at)}</td></tr>)}</tbody></table>}</article>)}{!lessons.some(lesson => lesson.type === 'quiz') && <Empty text="No quiz lessons in this classroom." />}</div>}
          {activeTab === 'submissions' && <div className="space-y-4">{lessons.filter(lesson => ['tutorial','laboratory'].includes(lesson.type)).map(lesson => {
            const work = submissions.filter(submission => submission.lesson_id === lesson.id && (lesson.type !== 'tutorial' || submission.is_final))
            return <article key={lesson.id} className="rounded-xl border p-4"><h3 className="font-bold">{lesson.title}</h3><p className="mb-3 text-xs capitalize text-slate-500">{lesson.type} · {lesson.topic_title}</p>{work.length ? work.map(submission => <SubmissionReview key={submission.id} submission={submission} readOnly={lesson.type !== 'laboratory'} onSaved={updated => { setReview(previous => ({...previous,submissions:previous.submissions.map(row => row.id===updated.id?updated:row)}));onGraded?.() }} />) : <p className="text-sm text-slate-500">{lesson.progress?.is_completed ? 'Completed previously. No saved submission is available for this work.' : 'No submitted work yet.'}</p>}</article>
          })}{!lessons.some(lesson => ['tutorial','laboratory'].includes(lesson.type)) && <Empty text="No tutorials or laboratories in this classroom." />}</div>}
        </div>
      </>}
    </DialogContent>
  </Dialog>
}

function Summary({ label, value }) { return <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div> }
function Empty({ text }) { return <p className="p-8 text-center text-slate-500">{text}</p> }
