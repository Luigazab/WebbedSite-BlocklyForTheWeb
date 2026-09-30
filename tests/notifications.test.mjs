import test from 'node:test'
import assert from 'node:assert/strict'
import { notificationDestination, notificationReturnPath } from '../src/lib/notificationLinks.js'
import { buildNotificationEmail } from '../supabase/functions/deliver-notification-emails/email.js'

test('email landing resolves post before classroom and handles deleted targets', () => {
  assert.equal(notificationDestination({ post_id: 'post', classroom_id: 'room' }, 'teacher'), '/classroom-posts/post')
  assert.equal(notificationDestination({ classroom_id: 'room' }, 'student'), '/student/classrooms/room')
  assert.equal(notificationDestination({ classroom_id: 'room' }, 'teacher'), '/teacher/classrooms/room')
  assert.equal(notificationDestination({ project_id: 'project' }, 'student'), '/student/projects?project=project')
  assert.equal(notificationDestination({}, 'student'), null)
})
test('login return path rejects external URLs and unrelated destinations', () => {
  const path = '/notifications/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  assert.equal(notificationReturnPath(`?next=${encodeURIComponent(path)}`), path)
  for (const path of ['https://evil.example', '//evil.example', '/admin', '/notifications/../admin']) {
    assert.equal(notificationReturnPath(`?next=${encodeURIComponent(path)}`), null)
  }
})
test('email escapes user content and links to the authenticated notification entry', () => {
  const message = buildNotificationEmail({ notification_id: 'abc', email: 'student@example.com', content: '<img src=x onerror="bad()"> & hello' }, 'https://app.example.com', 'School <notify@example.com>')
  assert.ok(!message.html.includes('<img'))
  assert.ok(message.html.includes('&lt;img'))
  assert.ok(message.html.includes('https://app.example.com/notifications/abc'))
  assert.deepEqual(message.to, ['student@example.com'])
  assert.throws(() => buildNotificationEmail({}, 'javascript:bad()', 'from'))
  assert.throws(() => buildNotificationEmail({}, 'https://user:password@app.example.com', 'from'))
})
