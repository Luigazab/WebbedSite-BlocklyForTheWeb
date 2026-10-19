export const DEFAULT_RUBRIC = [
  { id: 'content', label: 'Required content and elements', max: 30 },
  { id: 'structure', label: 'Appropriate structure and organization', max: 25 },
  { id: 'application', label: 'Correct application of taught concepts', max: 30 },
  { id: 'readability', label: 'Readable and organized output', max: 15 },
]
export function rubricTotal(rubric, scores) {
  if (!Array.isArray(rubric) || !rubric.length || rubric.reduce((n, c) => n + Number(c.max), 0) !== 100) throw new Error('Rubric maximum points must total 100.')
  if (new Set(rubric.map(c => c.id)).size !== rubric.length) throw new Error('Criterion IDs must be unique.')
  return rubric.reduce((sum, criterion) => {
    const value = scores[criterion.id]
    if (value === '' || value == null || !Number.isInteger(Number(value)) || Number(value) < 0 || Number(value) > criterion.max) throw new Error(`Enter a whole-number score from 0 to ${criterion.max} for ${criterion.label}.`)
    return sum + Number(value)
  }, 0)
}
export function quizPercent(attempt, quiz) {
  if (attempt?.score == null || !attempt.finished_at) return null
  return (attempt.score_total || quiz?.question_count) ? Math.round(100 * attempt.score / (attempt.score_total || quiz.question_count)) : Number(attempt.score)
}
export function bestQuiz(attempts = [], quiz) {
  return attempts.reduce((best, a) => { const score = quizPercent(a, quiz); return score != null && (best == null || score > best) ? score : best }, null)
}
export function lessonResult(lesson, submissions = []) {
  const work = submissions.find(s => s.lesson_id === lesson.id && !s.step_key)
  if (lesson.type === 'laboratory') return { score: work?.score ?? null, status: !work ? 'Not submitted' : work.review_status === 'needs_revision' ? 'Needs revision' : work.graded_at ? 'Passed' : work.is_final ? 'Awaiting review' : 'Draft' }
  if (lesson.type === 'quiz') { const score = bestQuiz(lesson.attempts, lesson.quiz); return { score, status: score == null ? 'Not attempted' : lesson.progress?.is_completed ? 'Passed' : 'Attempted' } }
  return { score: null, status: lesson.progress?.is_completed ? 'Completed' : 'Not completed' }
}
export function csvCell(value) { return `"${String(value ?? '').replace(/^[=+@\-\t\r]/, "'$&").replaceAll('"', '""')}"` }
