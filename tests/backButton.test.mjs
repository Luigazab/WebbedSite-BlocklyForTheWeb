import test from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { mkdir } from 'node:fs/promises'
import { JSDOM } from 'jsdom'
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'

await mkdir('node_modules/.cache/back-button-tests', { recursive: true })
await build({ entryPoints: ['src/components/common/BackButton.jsx'], bundle: true, format: 'esm', platform: 'node', packages: 'external', jsx: 'automatic', outfile: 'node_modules/.cache/back-button-tests/button.mjs' })
const { default: BackButton } = await import('../node_modules/.cache/back-button-tests/button.mjs')

test('BackButton follows router history, never submits forms, and replaces a direct-entry fallback', async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://webbed.test/start', pretendToBeVisual: true })
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  let submissions = 0
  const root = createRoot(document.getElementById('root'))
  const router = createBrowserRouter([{ path: '*', element: React.createElement('form', { onSubmit: event => { event.preventDefault(); submissions++ } }, React.createElement(BackButton, { fallback: '/home', message: 'Previous page' })) }], { window: dom.window })
  const clickBack = async () => {
    await act(async () => {
      document.querySelector('button').click()
      // Browser history traversal dispatches popstate asynchronously.
      await new Promise(resolve => setTimeout(resolve, 30))
    })
  }
  try {
    await act(async () => root.render(React.createElement(RouterProvider, { router })))
    assert.equal(document.querySelector('button').type, 'button')
    assert.equal(document.querySelector('button').textContent, 'Previous page')
    await act(async () => router.navigate('/lesson?tab=work#editor'))
    await clickBack()
    assert.equal(router.state.location.pathname, '/start')
    assert.equal(submissions, 0)

    // At index zero, length is still two because the lesson is in forward history.
    assert.equal(window.history.length, 2)
    assert.equal(window.history.state.idx, 0)
    await clickBack()
    assert.equal(router.state.location.pathname, '/home')
    assert.equal(window.history.state.idx, 0)
    assert.equal(window.history.length, 2)

    // Saving a new lesson with replace must retain the original previous page.
    await act(async () => router.navigate('/course?topic=1#lessons'))
    await act(async () => router.navigate('/create'))
    await act(async () => router.navigate('/edit/123', { replace: true }))
    await clickBack()
    assert.equal(router.state.location.pathname, '/course')
    assert.equal(router.state.location.search, '?topic=1')
    assert.equal(router.state.location.hash, '#lessons')

    // A direct entry with unknown state must also use the fallback.
    window.history.replaceState(null, '', '/external-entry')
    await clickBack()
    assert.equal(router.state.location.pathname, '/home')
  } finally {
    await act(async () => root.unmount())
    router.dispose()
    dom.window.close()
    delete globalThis.window
    delete globalThis.document
    delete globalThis.IS_REACT_ACT_ENVIRONMENT
  }
})
