import test from 'node:test'
import assert from 'node:assert/strict'
import { build, transform } from 'esbuild'
import { mkdir, writeFile, unlink, readFile } from 'node:fs/promises'
import { randomUUID, webcrypto } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider, Outlet, matchRoutes } from 'react-router'
import vm from 'node:vm'
import { createAuthStorage } from '../src/lib/authStorage.js'
import { assertPasswordPolicy } from '../src/lib/passwordPolicy.js'
import { checkPassword } from '../supabase/functions/_shared/password-policy.js'
import { createPasswordPolicyHandler } from '../supabase/functions/password-policy/handler.js'
import { createAdminAuthHandler } from '../supabase/functions/admin-auth/handler.js'

async function loadSubject(entry, stubs = {}) {
  const result = await build({ entryPoints: [entry], bundle: true, write: false, platform: 'node', format: 'esm', jsx: 'automatic', packages: 'external', plugins: [{
    name: 'auth-dependencies', setup(builder) {
      builder.onResolve({ filter: /.*/ }, args => {
        const key = Object.keys(stubs).find(name => args.path === name || args.path.endsWith(name))
        return key ? { path: key, namespace: 'auth-test' } : undefined
      })
      builder.onLoad({ filter: /.*/, namespace: 'auth-test' }, args => ({ contents: stubs[args.path], loader: 'js' }))
    },
  }] })
  await mkdir('node_modules/.cache/auth-tests', { recursive: true })
  const path = `node_modules/.cache/auth-tests/${randomUUID()}.mjs`
  await writeFile(path, result.outputFiles[0].text)
  try { return await import(pathToFileURL(`${process.cwd()}/${path}`).href) } finally { await unlink(path) }
}
const clientStub = `export const supabase = new Proxy({}, { get: (_, key) => globalThis.__authTest.supabase[key] });
export const authStorage = new Proxy({}, { get: (_, key) => globalThis.__authTest.storage[key] });
export const createLoginClient = () => globalThis.__authTest.login;
export const recoveryAccessToken = null;`
const policyStub = 'export const validateNewPassword = password => globalThis.__authTest.policy(password);'
const { createAuthStore } = await loadSubject('src/store/authStore.js', { 'auth.service': 'export const authService = {}' })
const { authService } = await loadSubject('src/services/auth.service.js', { supabaseClient: clientStub, 'passwordPolicy.service': policyStub })
const { profileService } = await loadSubject('src/services/profile.service.js', { supabaseClient: clientStub, 'passwordPolicy.service': policyStub })
const tick = () => new Promise(resolve => setTimeout(resolve, 5))
function memoryStorage() {
  const map = new Map()
  return { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, String(value)), removeItem: key => map.delete(key) }
}
const session = id => ({ access_token: `token-${id}`, refresh_token: `refresh-${id}`, user: { id } })
const profile = id => ({ id, username: id, role: 'student', onboarding_completed_at: 'completed' })

test('unchecked login is isolated from a remembered session in another tab, including logout and refresh', () => {
  const local = memoryStorage(), tabA = memoryStorage(), tabB = memoryStorage()
  const a = createAuthStorage(local, tabA, 'auth'), b = createAuthStorage(local, tabB, 'auth')
  a.setPersistence(true)
  a.storage.setItem('auth', JSON.stringify(session('A')))
  b.setPersistence(false)
  b.storage.setItem('auth', JSON.stringify(session('B')))
  a.storage.setItem('auth', JSON.stringify({ ...session('A'), access_token: 'refreshed-A' }))
  assert.equal(a.getStoredSession().access_token, 'refreshed-A')
  assert.equal(b.getStoredSession().user.id, 'B')
  assert.equal(b.ownsSession(a.getStoredSession()), false)
  assert.equal(b.ownsSession(null), false)
  b.clearSession()
  assert.equal(a.getStoredSession().user.id, 'A')
  assert.equal(b.getStoredSession(), null)
})

test('persistence restores remembered sessions in a new tab and retains the selected mode across token writes', () => {
  const local = memoryStorage(), tab = memoryStorage()
  const a = createAuthStorage(local, tab, 'auth')
  a.setPersistence(true)
  a.storage.setItem('auth', JSON.stringify(session('A')))
  const reopened = createAuthStorage(local, memoryStorage(), 'auth')
  assert.equal(reopened.getStoredSession().user.id, 'A')
  local.setItem('remember-me', 'false') // Legacy flags have no effect.
  a.storage.setItem('auth', JSON.stringify(session('A')))
  assert.ok(local.getItem('auth'))
  assert.equal(tab.getItem('auth'), null)
})
test('global logout removes an older remembered copy of the same recovery account while preserving other accounts', () => {
  const local = memoryStorage(), tab = memoryStorage()
  local.setItem('auth', JSON.stringify(session('A')))
  const storage = createAuthStorage(local, tab, 'auth')
  storage.setPersistence(false)
  storage.storage.setItem('auth', JSON.stringify(session('A')))
  storage.clearOtherCopies()
  assert.equal(local.getItem('auth'), null)
  assert.equal(storage.getStoredSession().user.id, 'A')
  local.setItem('auth', JSON.stringify(session('B')))
  storage.clearOtherCopies()
  assert.equal(JSON.parse(local.getItem('auth')).user.id, 'B')
})

function serviceForStore(overrides = {}) {
  let current = session('A'), listener
  return {
    getSession: async () => current,
    getProfile: async id => profile(id),
    ownsSession: value => value ? value.access_token === current?.access_token : !current,
    isRecoverySession: () => false,
    markRecovery() {},
    onAuthStateChange: callback => { listener = callback; return { data: { subscription: { unsubscribe() { listener = null } } } } },
    emit(event, value) { current = value; return listener?.(event, value) },
    signOut: async () => { current = null; listener?.('SIGNED_OUT', null) },
    ...overrides,
  }
}
test('auth subscription is synchronous, handles sign-out, and unregisters on cleanup', async () => {
  const service = serviceForStore(), store = createAuthStore(service)
  const stop = store.getState().start()
  await tick()
  assert.equal(store.getState().user.id, 'A')
  assert.equal(service.emit('SIGNED_OUT', null), undefined)
  assert.equal(store.getState().user, null)
  assert.equal(store.getState().profile, null)
  stop()
  service.emit('SIGNED_IN', session('B'))
  await tick()
  assert.equal(store.getState().user, null)
})

test('late profile responses cannot resurrect a signed-out account', async () => {
  let resolveProfile
  const service = serviceForStore({ getProfile: () => new Promise(resolve => { resolveProfile = resolve }) })
  const store = createAuthStore(service), stop = store.getState().start()
  await tick()
  assert.equal(store.getState().user.id, 'A')
  service.emit('SIGNED_OUT', null)
  resolveProfile(profile('A'))
  await tick()
  assert.equal(store.getState().user, null)
  assert.equal(store.getState().profile, null)
  stop()
})

test('initial profile failures retain authentication and expose a retryable profile error', async () => {
  let fail = true
  const service = serviceForStore({ getProfile: async id => { if (fail) throw new Error('offline'); return profile(id) } })
  const store = createAuthStore(service)
  await store.getState().initialize()
  assert.equal(store.getState().user.id, 'A')
  assert.equal(store.getState().profile, null)
  assert.match(store.getState().profileError, /retry/i)
  fail = false
  await store.getState().initialize()
  assert.equal(store.getState().profile.id, 'A')
  assert.equal(store.getState().profileError, null)
})

test('recovery sessions bypass profile loading and remain in recovery until logout', async () => {
  let profileCalls = 0
  const service = serviceForStore({ isRecoverySession: () => true, getProfile: async () => { profileCalls++; throw new Error('must not load') } })
  const store = createAuthStore(service), stop = store.getState().start()
  await tick()
  assert.equal(store.getState().recovery, true)
  assert.equal(profileCalls, 0)
  await store.getState().signOut()
  assert.equal(store.getState().recovery, false)
  assert.equal(store.getState().user, null)
  stop()
})

test('login profile failure revokes the temporary attempt without replacing persistence or the working session', async () => {
  let revoked = false
  globalThis.__authTest = {
    login: { auth: { signInWithPassword: async () => ({ data: sessionData(), error: null }), signOut: async ({ scope }) => { assert.equal(scope, 'local'); revoked = true } },
      from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ error: new Error('offline') }) }) }) }) },
    supabase: { auth: { setSession: () => assert.fail('must not replace active credentials') } },
    storage: { setPersistence: () => assert.fail('must not change mode') }, policy: async () => {},
  }
  await assert.rejects(authService.signIn('user@example.invalid', 'test-password', false), /profile could not be loaded/i)
  assert.equal(revoked, true)
})
function sessionData() { return { session: session('A'), user: session('A').user } }

test('successful login installs the requested persistence only after its profile loads', async () => {
  const order = []
  globalThis.__authTest = {
    login: { auth: { signInWithPassword: async () => ({ data: sessionData(), error: null }) },
      from: () => ({ select: () => ({ eq: () => ({ single: async () => { order.push('profile'); return { data: profile('A'), error: null } } }) }) }) },
    storage: { getPersistence: () => true, setPersistence: remember => { assert.equal(remember, false); order.push('mode') }, finishLogin: () => order.push('complete') },
    supabase: { auth: { setSession: async () => { order.push('install'); return { error: null } } } },
  }
  const data = await authService.signIn('user@example.invalid', 'test-password', false)
  assert.equal(data.profile.id, 'A')
  assert.deepEqual(order, ['profile', 'mode', 'install', 'complete'])
})

test('incorrect old passwords cannot update a password or replace the active session', async () => {
  globalThis.__authTest = {
    login: { auth: { signInWithPassword: async () => ({ data: { user: null }, error: new Error('invalid credentials') }) } },
    supabase: { auth: { getUser: async () => ({ data: { user: { id: 'A', email: 'user@example.invalid' } }, error: null }), updateUser: () => assert.fail('must not update password') } },
    policy: () => assert.fail('must verify current password first'),
  }
  await assert.rejects(profileService.updatePassword('a-new-long-password', 'incorrect'), /current password is incorrect/i)
})

test('settings password changes screen the new password, send current_password, and revoke the verifier session', async () => {
  const order = []
  globalThis.__authTest = {
    login: { auth: { signInWithPassword: async () => ({ data: { user: { id: 'A' } }, error: null }), signOut: async () => order.push('revoke') } },
    supabase: { auth: { getUser: async () => ({ data: { user: { id: 'A', email: 'user@example.invalid' } }, error: null }), updateUser: async args => { assert.deepEqual(args, { password: 'a-new-long-password', current_password: 'correct-old-password' }); order.push('update'); return { error: null } } } },
    policy: async () => order.push('screen'),
  }
  await profileService.updatePassword('a-new-long-password', 'correct-old-password')
  assert.deepEqual(order, ['screen', 'update', 'revoke'])
})

test('password policy rejects short and oversized UTF-8 values consistently', () => {
  assert.throws(() => assertPasswordPolicy('short'), /12/)
  assert.throws(() => assertPasswordPolicy('é'.repeat(37)), /72/)
  assert.doesNotThrow(() => assertPasswordPolicy('a long test passphrase'))
})
test('breach screening sends only a padded five-character hash-prefix request and rejects a known match', async () => {
  const password = 'known compromised test password'
  const hash = Buffer.from(await webcrypto.subtle.digest('SHA-1', new TextEncoder().encode(password))).toString('hex').toUpperCase()
  await assert.rejects(checkPassword(password, { digest: webcrypto.subtle.digest.bind(webcrypto.subtle), fetchRange: async (url, options) => {
    assert.equal(url, `https://api.pwnedpasswords.com/range/${hash.slice(0, 5)}`)
    assert.equal(options.headers['Add-Padding'], 'true')
    assert.equal(JSON.stringify(options).includes(password), false)
    return new Response(`${hash.slice(5)}:100\r\n`)
  } }), /known data breaches/)
  await checkPassword(password, { fetchRange: async () => new Response(`${hash.slice(5)}:0\r\n`) })
})
test('screening fails closed when the breach provider is unavailable', async () => {
  await assert.rejects(checkPassword('a long test passphrase', { fetchRange: async () => new Response('', { status: 503 }) }), /unavailable/)
  const handler = createPasswordPolicyHandler({ authenticateApiKey: async () => true, checkPassword: async () => { throw new Error('timeout details must be hidden') } })
  const response = await handler(new Request('https://example.invalid', { method: 'POST', body: JSON.stringify({ password: 'a long test passphrase' }) }))
  assert.equal(response.status, 503)
  assert.equal((await response.json()).error.includes('timeout details'), false)
})

const targetId = '11111111-1111-4111-8111-111111111111'
const adminBody = { action: 'reset-password', userId: targetId, password: 'a long test passphrase' }
function adminHandler(overrides = {}) {
  return createAdminAuthHandler({ authenticate: async () => ({ id: 'caller' }), getRole: async () => 'admin',
    createUser: async () => ({ id: targetId }), setRole: async () => {}, resetPassword: async () => {}, checkPassword: async () => {}, ...overrides })
}
function requestAdmin(body, token = 'verified-test-token') {
  return new Request('https://example.invalid', { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: JSON.stringify(body) })
}
test('admin endpoint rejects missing/invalid authentication and forged admin metadata before mutations', async () => {
  assert.equal((await adminHandler()(requestAdmin(adminBody, null))).status, 401)
  assert.equal((await adminHandler({ authenticate: async () => null })(requestAdmin(adminBody))).status, 401)
  const nonAdmin = adminHandler({ getRole: async () => 'student', resetPassword: () => assert.fail('unauthorized mutation'), checkPassword: () => assert.fail('must authorize first') })
  assert.equal((await nonAdmin(requestAdmin({ ...adminBody, role: 'admin', user_metadata: { role: 'admin' } }))).status, 403)
})
test('admin password errors return an error status without reporting success', async () => {
  const response = await adminHandler({ resetPassword: async () => { throw Object.assign(new Error('User not allowed'), { status: 403 }) } })(requestAdmin(adminBody))
  assert.equal(response.status, 403)
  const body = await response.json()
  assert.equal(body.success, undefined)
  assert.equal(body.error, 'User not allowed')
})
test('all administrator account operations reject non-admins and prevent self-lockout', async () => {
  const peerActions = [
    { action: 'set-role', userId: targetId, role: 'admin' },
    { action: 'set-banned', userId: targetId, banned: true },
    { action: 'delete-user', userId: targetId },
    { action: 'user-statuses', userIds: [targetId] },
  ]
  for (const body of peerActions) {
    assert.equal((await adminHandler({ getRole: async () => 'student' })(requestAdmin(body))).status, 403)
  }
  const self = adminHandler({ authenticate: async () => ({ id: targetId }) })
  for (const body of [{ ...peerActions[0], role: 'student' }, peerActions[1], peerActions[2]]) {
    assert.equal((await self(requestAdmin(body))).status, 409)
  }
})
test('admin creation validates role and applies the authorized server role after screening', async () => {
  const order = []
  const handler = adminHandler({ checkPassword: async () => order.push('screen'), createUser: async () => { order.push('create'); return { id: targetId } }, setRole: async (id, role) => { assert.equal(id, targetId); assert.equal(role, 'teacher'); order.push('role') } })
  const body = { action: 'create-user', email: 'test@example.invalid', username: 'tester', password: 'a long test passphrase', role: 'teacher' }
  assert.equal((await handler(requestAdmin({ ...body, role: 'super-admin' }))).status, 400)
  assert.equal((await handler(requestAdmin(body))).status, 201)
  assert.deepEqual(order, ['screen', 'create', 'role'])
})

test('password completion clears the session before login navigation; a failed update keeps recovery active', async () => {
  const { useAuth } = await loadSubject('src/hooks/useAuth.js', {
    'auth.service': 'export const authService = new Proxy({}, { get: (_, key) => globalThis.__authTest.service[key] })',
    'authStore': 'export const useAuthStore = () => globalThis.__authTest.state; useAuthStore.getState = () => globalThis.__authTest.state;',
    'react-router': 'export const useLocation = () => ({search: ""}); export const useNavigate = () => globalThis.__authTest.navigate;',
    'sonner': 'export const toast = { success() {}, error() {}, warning() {}, info() {} };',
  })
  const order = []
  globalThis.__authTest = {
    state: { user: { id: 'A' }, signOut: async () => { order.push('signout'); globalThis.__authTest.state.user = null } },
    service: { updatePassword: async () => order.push('update') },
    navigate: path => { assert.equal(globalThis.__authTest.state.user, null); assert.equal(path, '/login'); order.push('navigate') },
  }
  assert.equal(await useAuth().handlePasswordUpdate('a long test passphrase'), true)
  assert.deepEqual(order, ['update', 'signout', 'navigate'])
  globalThis.__authTest.state.user = { id: 'A' }
  globalThis.__authTest.service.updatePassword = async () => { throw new Error('screening failed') }
  assert.equal(await useAuth().handlePasswordUpdate('a long test passphrase'), false)
  assert.equal(globalThis.__authTest.state.user.id, 'A')
  assert.equal(order.length, 3)
})

test('screening endpoint requires a valid project key before inspecting passwords', async () => {
  const handler = createPasswordPolicyHandler({ authenticateApiKey: async () => false, checkPassword: () => assert.fail('must authenticate first') })
  const request = new Request('https://example.invalid', { method: 'POST', body: JSON.stringify({ password: 'a long test passphrase' }) })
  assert.equal((await handler(request)).status, 401)
})

test('classroom enrollment sends only the join code to the authenticated database boundary', async () => {
  const { joinClassroom } = await loadSubject('src/services/classroomService.js', { supabaseClient: clientStub })
  globalThis.__authTest = { supabase: { rpc: async (name, args) => {
    assert.equal(name, 'join_classroom_by_code')
    assert.deepEqual(args, { p_join_code: 'ABC123' })
    return { data: 'verified-classroom', error: null }
  } } }
  assert.equal(await joinClassroom('client-provided-id', ' abc123 '), 'verified-classroom')
})

test('the reset route has Auth layout ancestry and a real outlet child', async () => {
  const { routes } = await loadSubject('src/router/index.jsx', {
    'react-router': 'export const createBrowserRouter = routes => { globalThis.__authRoutes = routes; return routes }; export const RouterProvider = () => null; export const Navigate = () => null;',
    './studentRoutes': 'export const studentRoutes = []', './teacherRoutes': 'export const teacherRoutes = []', './adminRoutes': 'export const adminRoutes = []',
    '../components/layout/ProtectedRoute': 'export const ProtectedRoute = () => null', '../components/layout/PublicRoute': 'export const PublicRoute = () => null',
    // Keep the actual routing structure; the unrelated pages are inert stubs.
    '../components/layout/Auth': 'export default function Auth() { return null }',
    '../pages/auth/UpdatePassword': 'export default function UpdatePassword() { return null }',
    '../pages/auth/Login': 'export default () => null', '../pages/auth/Register': 'export default () => null',
    '../pages/auth/StudentRegister': 'export default () => null', '../pages/auth/TeacherRegister': 'export default () => null',
    '../pages/auth/ForgotPassword': 'export default () => null', '../pages/public/NotFound': 'export default () => null',
    '../pages/public/ErrorPage': 'export default () => null', '../pages/public/JavaScriptPractice': 'export default () => null',
    '../pages/app/NotificationEntry': 'export default () => null', '../pages/app/ClassroomPostPage': 'export default () => null',
    '../pages/public/RemiDemo': 'export default () => null',
  })
  void routes
  const matches = matchRoutes(globalThis.__authRoutes, '/update-password')
  assert.deepEqual(matches.map(match => match.route.element.type.name), ['Auth', 'UpdatePassword'])
  const layoutSource = (await readFile('src/components/layout/Auth.jsx', 'utf8')).replace(/^import .*\r?\n/gm, '')
  const { code } = await transform(layoutSource, { loader: 'jsx', format: 'cjs', jsx: 'transform' })
  const module = { exports: {} }
  vm.runInNewContext(code, { module, exports: module.exports, React, Outlet, Header: () => null, Footer: () => null })
  const router = createMemoryRouter([{ element: React.createElement(module.exports.default), children: [{ path: '/update-password', element: React.createElement('form', null, 'Create New Password') }] }], { initialEntries: ['/update-password'] })
  assert.match(renderToString(React.createElement(RouterProvider, { router })), /Create New Password/)
  router.dispose()
})
