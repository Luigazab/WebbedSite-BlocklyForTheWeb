import test from 'node:test'
import assert from 'node:assert/strict'
import { uploadProjectThumbnail } from '../src/services/projectThumbnail.js'
import { validThumbnailMessage } from '../src/utils/websiteThumbnail.js'

function clientMock({ uploadError = null, dbError = null, row = { thumbnail_url: 'https://example.test/thumbnail.png' } } = {}) {
  const calls = []
  const bucket = {
    upload: async (path, blob) => { calls.push(['upload', path, blob]); return { error: uploadError } },
    getPublicUrl: () => ({ data: { publicUrl: 'https://example.test/thumbnail.png' } }),
    remove: async paths => { calls.push(['remove', paths]); return { error: null } },
  }
  const client = {
    storage: { from: () => bucket },
    from: () => ({ update: values => { calls.push(['update', values]); return {
      eq: (_key, id) => { calls.push(['project', id]); return { select: () => ({ single: async () => ({ data: row, error: dbError }) }) } },
    } } }),
  }
  return { client, calls }
}

test('uploads screenshot before saving its URL to the requested project', async () => {
  const { client, calls } = clientMock()
  const blob = new Blob(['png'], { type: 'image/png' })
  assert.equal(await uploadProjectThumbnail(client, 'project-id', blob), 'https://example.test/thumbnail.png')
  assert.match(calls[0][1], /^workspace_snapshots\/project-id_[a-f0-9-]+\.png$/)
  assert.equal(calls[0][2], blob)
  assert.deepEqual(calls.map(call => call[0]), ['upload', 'update', 'project'])
  assert.deepEqual(Object.keys(calls[1][1]).sort(), ['thumbnail_url', 'updated_at'])
  assert.equal(calls[2][1], 'project-id')
})

test('a denied upload leaves the previous project URL intact', async () => {
  const { client, calls } = clientMock({ uploadError: new Error('Denied') })
  await assert.rejects(uploadProjectThumbnail(client, 'p', new Blob()), /Denied/)
  assert.deepEqual(calls.map(call => call[0]), ['upload'])
})

test('a rejected project update cleans up the unused screenshot', async () => {
  const { client, calls } = clientMock({ dbError: new Error('Update denied'), row: null })
  await assert.rejects(uploadProjectThumbnail(client, 'p', new Blob()), /Update denied/)
  assert.deepEqual(calls.at(-1), ['remove', [calls[0][1]]])
})

test('zero updated projects is a failure rather than a false success', async () => {
  const { client, calls } = clientMock({ row: null })
  await assert.rejects(uploadProjectThumbnail(client, 'p', new Blob()), /could not be updated/)
  assert.equal(calls.at(-1)[0], 'remove')
})

test('only the expected opaque frame and capture token can supply a screenshot', () => {
  const frame = {}
  const message = { source: frame, origin: 'null', data: { type: 'WEBSITE_THUMBNAIL', token: 'capture' } }
  assert.equal(validThumbnailMessage(message, frame, 'capture'), true)
  assert.equal(validThumbnailMessage({ ...message, source: {} }, frame, 'capture'), false)
  assert.equal(validThumbnailMessage({ ...message, origin: 'https://example.test' }, frame, 'capture'), false)
  assert.equal(validThumbnailMessage(message, frame, 'other'), false)
})
