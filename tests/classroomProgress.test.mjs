import test from 'node:test'
import assert from 'node:assert/strict'
import { summarizeStudentLessons } from '../src/dashboards/student/utils/classroomProgress.js'

test('student card counts required lessons in open topics only', () => {
  const summary = summarizeStudentLessons({ topics: [
    { title: 'HTML', is_published: true, is_unlocked: true, required_lessons: 2, students: [{ completed_lessons: 1 }] },
    { title: 'CSS', is_published: true, is_unlocked: false, required_lessons: 3, students: [{ completed_lessons: 0 }] },
    { title: 'Practice', is_published: true, is_unlocked: true, required_lessons: 0, students: [{ completed_lessons: 0 }] },
  ] })
  assert.deepEqual(summary, { completed: 1, total: 2, openTopics: 2, currentTopic: 'HTML' })
})

test('empty flow has no lessons yet', () => {
  assert.deepEqual(summarizeStudentLessons(null), { completed: 0, total: 0, openTopics: 0, currentTopic: null })
})
