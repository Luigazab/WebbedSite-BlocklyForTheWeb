export function createPasswordPolicyHandler({ checkPassword, authenticateApiKey }) {
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
      if (!await authenticateApiKey(request.headers.get('apikey'))) return reply(401, { error: 'A valid project API key is required.' })
      // Bound parsing before the password checker to avoid accepting large bodies.
      const text = await request.text()
      if (text.length > 2048) return reply(413, { error: 'Request is too large.' })
      let body
      try { body = JSON.parse(text) } catch { return reply(400, { error: 'Invalid request.' }) }
      await checkPassword(body?.password)
      return reply(200, { valid: true })
    } catch (error) {
      return reply(error?.status ?? 503, { error: error?.status ? error.message : 'Password screening is unavailable. Please try again.' })
    }
  }
}
