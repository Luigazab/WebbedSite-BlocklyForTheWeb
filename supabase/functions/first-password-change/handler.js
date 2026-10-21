export function createFirstPasswordChangeHandler({ authenticate, getProfile, verifyCurrentPassword, checkPassword, updatePassword, clearRequirement }) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json',
  }
  const reply = (status, body) => new Response(JSON.stringify(body), { status, headers })

  return async request => {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
    if (request.method !== 'POST') return reply(405, { error: 'Method not allowed.' })

    try {
      const token = request.headers.get('Authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1]
      if (!token) return reply(401, { error: 'Sign in with the temporary password to continue.' })
      const user = await authenticate(token)
      if (!user?.id || !user.email) return reply(401, { error: 'Your session has expired. Please sign in again.' })

      const profile = await getProfile(user.id)
      if (profile?.role !== 'teacher' || !profile.must_change_password) {
        return reply(409, { error: 'This account does not require a temporary-password replacement.' })
      }

      const text = await request.text()
      if (text.length > 4096) return reply(413, { error: 'Request is too large.' })
      let body
      try { body = JSON.parse(text) } catch { return reply(400, { error: 'Invalid request.' }) }
      const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : ''
      const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : ''
      if (!currentPassword || !newPassword) return reply(400, { error: 'Enter the temporary and new passwords.' })
      if (currentPassword === newPassword) return reply(400, { error: 'Choose a different password from the temporary password.' })

      if (!await verifyCurrentPassword(user.email, currentPassword, user.id)) {
        return reply(401, { error: 'Your temporary password is incorrect.' })
      }
      await checkPassword(newPassword)
      await updatePassword(user.id, newPassword)
      await clearRequirement(user.id)
      return reply(200, { success: true })
    } catch (error) {
      return reply(error?.status && error.status >= 400 && error.status < 600 ? error.status : 500,
        { error: error?.message || 'The password could not be replaced.' })
    }
  }
}
