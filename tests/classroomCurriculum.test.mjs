import test from 'node:test'
import assert from 'node:assert/strict'
import { groupClassroomCurriculum, lessonTrackLabel, visibleTopicLessons } from '../src/utils/classroomCurriculum.js'

test('curriculum follows saved course order and topic order', () => {
  const groups = groupClassroomCurriculum([
    { course_id: 'html', sequence_order: 2 }, { course_id: 'css', sequence_order: 1 },
  ], [
    { id: 'late', courseId: 'html', order: 2 }, { id: 'early', courseId: 'html', order: 1 },
    { id: 'removed', courseId: 'unassigned', order: 1 },
  ])
  assert.deepEqual(groups.map(group => group.courseId), ['css', 'html'])
  assert.deepEqual(groups[1].topics.map(topic => topic.id), ['early', 'late'])
})

test('teachers can configure draft lessons while students see published lessons', () => {
  const topic = { lessons: [{ id: 'published', is_published: true }, { id: 'draft', is_published: false }] }
  assert.equal(visibleTopicLessons(topic, true).length, 2)
  assert.deepEqual(visibleTopicLessons(topic).map(lesson => lesson.id), ['published'])
})

test('lesson tags distinguish required core and each optional practice level', () => {
  assert.equal(lessonTrackLabel({ topic_track: 'core', required_for_topic: true }), 'Core')
  assert.equal(lessonTrackLabel({ topic_track: 'core', required_for_topic: false }), 'Core · optional')
  for (const track of ['beginner', 'intermediate', 'advanced']) {
    assert.equal(lessonTrackLabel({ topic_track: track }), 'Optional · ' + track[0].toUpperCase() + track.slice(1))
  }
})
