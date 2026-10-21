import test from 'node:test'
import assert from 'node:assert/strict'
import { createFirstPasswordChangeHandler } from '../supabase/functions/first-password-change/handler.js'

function request(body = {}, token = 'valid') {
  return new Request('https://example.invalid', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
}

function subject(overrides = {}) {
  const calls = []
  const handler = createFirstPasswordChangeHandler({
    authenticate: async token => token === 'valid' ? { id: 'teacher', email: 'teacher@example.invalid' } : null,
    getProfile: async () => ({ role: 'teacher', must_change_password: true }),
    verifyCurrentPassword: async (_email, password, id) => password === 'temporary password' && id === 'teacher',
    checkPassword: async password => { calls.push(['check', password]) },
    updatePassword: async (id, password) => { calls.push(['update', id, password]) },
    clearRequirement: async id => { calls.push(['clear', id]) },
    ...overrides,
  })
  return { handler, calls }
}

test('temporary-password replacement verifies, updates, and only then clears the requirement', async () => {
  const { handler, calls } = subject()
  const response = await handler(request({ currentPassword: 'temporary password', newPassword: 'a new long password' }))
  assert.equal(response.status, 200)
  assert.deepEqual(calls, [
    ['check', 'a new long password'],
    ['update', 'teacher', 'a new long password'],
    ['clear', 'teacher'],
  ])
})

test('an incorrect temporary password cannot update or clear the requirement', async () => {
  const { handler, calls } = subject()
  const response = await handler(request({ currentPassword: 'wrong', newPassword: 'a new long password' }))
  assert.equal(response.status, 401)
  assert.deepEqual(calls, [])
})

test('a failed password update cannot clear the requirement', async () => {
  const { handler, calls } = subject({ updatePassword: async () => { calls.push(['update']); throw new Error('update failed') } })
  const response = await handler(request({ currentPassword: 'temporary password', newPassword: 'a new long password' }))
  assert.equal(response.status, 500)
  assert.deepEqual(calls, [['check', 'a new long password'], ['update']])
})

test('ordinary accounts cannot invoke the first-password endpoint', async () => {
  const { handler, calls } = subject({ getProfile: async () => ({ role: 'teacher', must_change_password: false }) })
  const response = await handler(request({ currentPassword: 'temporary password', newPassword: 'a new long password' }))
  assert.equal(response.status, 409)
  assert.deepEqual(calls, [])
})

test('expired sessions cannot reach password verification', async () => {
  const { handler, calls } = subject()
  const response = await handler(request({ currentPassword: 'temporary password', newPassword: 'a new long password' }, 'expired'))
  assert.equal(response.status, 401)
  assert.deepEqual(calls, [])
})
