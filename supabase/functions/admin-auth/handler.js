const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export function createAdminAuthHandler({ authenticate, getRole, createUser, setRole, resetPassword, checkPassword, getUserStatus, setBanned, deleteUser }) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json', 'Cache-Control': 'no-store',
  }
  const reply = (status, body) => new Response(JSON.stringify(body), { status, headers })
  return async request => {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
    if (request.method !== 'POST') return reply(405, { error: 'Method not allowed.' })
    try {
      const token = request.headers.get('Authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1]
      if (!token) return reply(401, { error: 'Sign in to continue.' })
      const caller = await authenticate(token)
      if (!caller) return reply(401, { error: 'Your session has expired. Please sign in again.' })
      // Always load the server-controlled profile role; never trust metadata/body.
      if (await getRole(caller.id) !== 'admin') return reply(403, { error: 'Administrator access required.' })
      const text = await request.text()
      if (text.length > 4096) return reply(413, { error: 'Request is too large.' })
      let body
      try { body = JSON.parse(text) } catch { return reply(400, { error: 'Invalid request.' }) }
      if (!['create-user', 'reset-password', 'set-role', 'set-banned', 'delete-user', 'user-statuses'].includes(body?.action)) return reply(400, { error: 'Unsupported action.' })
      if (body.action === 'user-statuses') {
        if (!Array.isArray(body.userIds) || body.userIds.length > 50 || body.userIds.some(id => !UUID.test(id))) return reply(400, { error: 'Select valid users.' })
        const statuses = await Promise.all(body.userIds.map(async id => [id, await getUserStatus(id)]))
        return reply(200, { statuses: Object.fromEntries(statuses) })
      }
      if (body.action === 'create-user') {
        const email = typeof body.email === 'string' ? body.email.trim() : ''
        const username = typeof body.username === 'string' ? body.username.trim() : ''
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || username.length < 3 || username.length > 80 || !['student', 'teacher', 'admin'].includes(body.role)) {
          return reply(400, { error: 'Enter a valid email, username, and account role.' })
        }
        await checkPassword(body.password)
        const user = await createUser({ email, password: body.password, username, role: body.role })
        // The signup trigger intentionally defaults admin creations to student;
        // only this authorized server operation may grant the selected role.
        await setRole(user.id, body.role)
        return reply(201, { user: { id: user.id } })
      }
      if (!UUID.test(body.userId ?? '')) return reply(400, { error: 'Select a valid user.' })
      if (body.action === 'set-role') {
        if (!['student', 'teacher', 'admin'].includes(body.role)) return reply(400, { error: 'Select a valid role.' })
        if (body.userId === caller.id && body.role !== 'admin') return reply(409, { error: 'You cannot remove your own administrator access.' })
        await setRole(body.userId, body.role)
        return reply(200, { success: true })
      }
      if (body.action === 'set-banned') {
        if (typeof body.banned !== 'boolean') return reply(400, { error: 'Select a valid account status.' })
        if (body.userId === caller.id && body.banned) return reply(409, { error: 'You cannot ban your own account.' })
        await setBanned(body.userId, body.banned)
        return reply(200, { success: true })
      }
      if (body.action === 'delete-user') {
        if (body.userId === caller.id) return reply(409, { error: 'You cannot delete your own administrator account.' })
        await deleteUser(body.userId)
        return reply(200, { success: true })
      }
      await checkPassword(body.password)
      await resetPassword(body.userId, body.password)
      return reply(200, { success: true })
    } catch (error) {
      return reply(error?.status && error.status >= 400 && error.status < 600 ? error.status : 500,
        { error: error?.message || 'The account operation failed.' })
    }
  }
}
