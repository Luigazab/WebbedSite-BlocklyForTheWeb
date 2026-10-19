import { DOMParser } from 'linkedom'
import { instrumentLoops, sourceDiagnostics } from './javascriptSource.js'

// Runs only inside the opaque preview frame. Storage is an isolated practice
// store; the frame never receives the host application's storage or sessions.
export function previewBootstrap(snapshot = {}) {
  const send = data => window.parent.postMessage(data, '*')
  const print = (type, args) => send({ type: 'CONSOLE_MESSAGE', logType: type, message: args.map(arg => {
    if (typeof arg === 'object' && arg !== null) { try { return JSON.stringify(arg, null, 2) } catch { return String(arg) } }
    return String(arg)
  }).join(' ').slice(0, 10000) })
  for (const type of ['log', 'warn', 'error', 'info']) {
    const original = console[type].bind(console)
    console[type] = (...args) => { print(type, args); original(...args) }
  }
  window.addEventListener('error', event => print('error', [`${event.message} (Line: ${event.lineno})`]))
  window.addEventListener('unhandledrejection', event => print('error', [event.reason?.message || event.reason]))
  let iterations = 0, resetQueued = false, started = 0
  Object.defineProperty(window, '__webbedTick', { value() {
    if (!resetQueued) {
      started = Date.now(); resetQueued = true
      queueMicrotask(() => { iterations = 0; resetQueued = false })
    }
    if (++iterations > 10000 || Date.now() - started > 250) throw new Error('Preview stopped a long loop. Check its condition or use fewer iterations.')
  }, writable: false, configurable: false })
  const stores = { local: new Map(Object.entries(snapshot.local ?? {})), session: new Map(Object.entries(snapshot.session ?? {})) }
  const notify = () => send({ type: 'PREVIEW_STORAGE', local: Object.fromEntries(stores.local), session: Object.fromEntries(stores.session) })
  for (const [name, key] of [['localStorage', 'local'], ['sessionStorage', 'session']]) {
    const store = stores[key]
    Object.defineProperty(window, name, { configurable: false, value: Object.freeze({
      get length() { return store.size },
      key(index) { return [...store.keys()][Number(index)] ?? null },
      getItem(key) { return store.get(String(key)) ?? null },
      setItem(key, value) {
        key = String(key); value = String(value)
        if (key.length > 200 || value.length > 10000 || (!store.has(key) && store.size >= 100)) throw new Error('Practice storage limit exceeded.')
        store.set(key, value); notify()
      },
      removeItem(key) { store.delete(String(key)); notify() },
      clear() { store.clear(); notify() },
    }) })
  }
  const nativeFetch = window.fetch?.bind(window)
  window.fetch = async (url, options) => {
    if (String(url) === 'practice://cards') return { ok: true, status: 200, json: async () => [{ title: 'HTML' }, { title: 'CSS' }, { title: 'JavaScript' }], text: async () => 'HTML, CSS, JavaScript' }
    if (String(url) === 'practice://error') return { ok: false, status: 500, json: async () => ({ error: 'Practice server error' }), text: async () => 'Practice server error' }
    if (!nativeFetch) throw new Error('Fetch is unavailable in this preview.')
    return nativeFetch(url, options)
  }
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a')
    const page = link?.getAttribute('data-page') || link?.getAttribute('href')
    if (page && (link.hasAttribute('data-page') || /\.html$/.test(page))) {
      event.preventDefault(); send({ type: 'NAVIGATE_TO_FILE', filename: page })
    }
  })
}

const escapeHTML = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
export function buildPreviewDocument(html, snapshot = {}) {
  const payload = JSON.stringify(snapshot).replaceAll('<', '\\u003c')
  const bootstrap = `<script>(${previewBootstrap.toString()})(${payload});</script>`
  const errors = sourceDiagnostics(html, 'index.html')
  if (errors.length) return `${bootstrap}<p role="alert">Fix JavaScript before running the preview.</p><pre>${escapeHTML(errors.map(error => error.message).join('\n'))}</pre>`
  const document = new DOMParser().parseFromString(html, 'text/html')
  for (const script of document.querySelectorAll('script')) {
    if (script.hasAttribute('src')) continue
    const type = script.getAttribute('type')?.trim().toLowerCase()
    if (type && !['module', 'text/javascript', 'application/javascript'].includes(type)) continue
    script.textContent = instrumentLoops(script.textContent, type === 'module' ? 'module' : 'script')
  }
  return bootstrap + document.toString()
}

export function readPracticeStorage(scope, storage, sessionStorage) {
  let local = {}, session = {}
  try { local = JSON.parse((storage ?? globalThis.localStorage).getItem(`webbed:practice:${scope}`))?.local ?? {} } catch { /* Use an in-memory practice store. */ }
  try { session = JSON.parse((sessionStorage ?? globalThis.sessionStorage).getItem(`webbed:practice:${scope}`)) ?? {} } catch { /* Use an in-memory practice store. */ }
  return { local, session }
}
export function savePracticeStorage(scope, snapshot, storage, sessionStorage) {
  try { (storage ?? globalThis.localStorage).setItem(`webbed:practice:${scope}`, JSON.stringify({ local: snapshot.local })) } catch { /* A disabled host store keeps practice data in memory. */ }
  try { (sessionStorage ?? globalThis.sessionStorage).setItem(`webbed:practice:${scope}`, JSON.stringify(snapshot.session)) } catch { /* A disabled host store keeps practice data in memory. */ }
}
