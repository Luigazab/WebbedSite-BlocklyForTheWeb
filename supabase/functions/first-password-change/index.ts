import { createClient } from 'npm:@supabase/supabase-js@2.94.0'
import { checkPassword } from '../_shared/password-policy.js'
import { createFirstPasswordChangeHandler } from './handler.js'

const url = Deno.env.get('SUPABASE_URL')!
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const publishableKey = Deno.env.get('SUPABASE_ANON_KEY')!
const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })

Deno.serve(createFirstPasswordChangeHandler({
  authenticate: async (token: string) => {
    const { data, error } = await db.auth.getUser(token)
    if (error || !data.user) return null
    const { data: status, error: statusError } = await db.auth.admin.getUserById(data.user.id)
    const bannedUntil = status?.user?.banned_until
    if (statusError || (bannedUntil && Date.parse(bannedUntil) > Date.now())) return null
    return data.user
  },
  getProfile: async (id: string) => {
    const { data, error } = await db.from('profiles').select('role,must_change_password').eq('id', id).single()
    if (error) throw error
    return data
  },
  verifyCurrentPassword: async (email: string, password: string, id: string) => {
    const verifier = createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } })
    const { data, error } = await verifier.auth.signInWithPassword({ email, password })
    await verifier.auth.signOut({ scope: 'local' })
    return !error && data.user?.id === id
  },
  checkPassword,
  updatePassword: async (id: string, password: string) => {
    const { error } = await db.auth.admin.updateUserById(id, { password })
    if (error) throw error
  },
  clearRequirement: async (id: string) => {
    const { data, error } = await db.from('profiles').update({ must_change_password: false })
      .eq('id', id).eq('role', 'teacher').eq('must_change_password', true).select('id').single()
    if (error || !data) throw error || new Error('The account setup requirement could not be cleared.')
  },
}))
