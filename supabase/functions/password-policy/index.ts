import { checkPassword } from '../_shared/password-policy.js'
import { createPasswordPolicyHandler } from './handler.js'

// Pre-signup callers authenticate with a project publishable API key rather
// than a user JWT. This endpoint never mutates accounts or logs passwords.
let verifiedKey: string | null = null
let verifiedUntil = 0
Deno.serve(createPasswordPolicyHandler({
  checkPassword,
  authenticateApiKey: async (key: string | null) => {
    if (!key) return false
    if (key === verifiedKey && Date.now() < verifiedUntil) return true
    const result = await fetch(`${Deno.env.get('SUPABASE_URL')}/auth/v1/settings`, {
      headers: { apikey: key }, signal: AbortSignal.timeout(8000),
    })
    if (result.status !== 200) return false
    verifiedKey = key
    verifiedUntil = Date.now() + 600_000
    return true
  },
}))
