import { createClient } from 'npm:@supabase/supabase-js@2.94.0'
import { createAdminAuthHandler } from './handler.js'
import { checkPassword } from '../_shared/password-policy.js'

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false, autoRefreshToken: false },
})
Deno.serve(createAdminAuthHandler({
  authenticate: async (token: string) => {
    const { data, error } = await db.auth.getUser(token)
    return error ? null : data.user
  },
  getRole: async (id: string) => {
    const { data, error } = await db.from('profiles').select('role').eq('id', id).single()
    if (error) throw error
    return data.role
  },
  createUser: async ({ email, password, username, role }: { email: string; password: string; username: string; role: string }) => {
    const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { username, role: role === 'admin' ? 'student' : role } })
    if (error) throw error
    return data.user!
  },
  setRole: async (id: string, role: string) => {
    const { data, error } = await db.from('profiles').update({ role, ...(role === 'teacher' ? { must_change_password: true } : {}) }).eq('id', id).select('id').single()
    if (error || !data) throw error || new Error('The account role could not be saved.')
  },
  resetPassword: async (id: string, password: string) => {
    const { error } = await db.auth.admin.updateUserById(id, { password })
    if (error) throw error
    const { error: requirementError } = await db.from('profiles').update({ must_change_password: true }).eq('id', id).eq('role', 'teacher')
    if (requirementError) throw requirementError
  },
  getUserStatus: async (id: string) => {
    const { data, error } = await db.auth.admin.getUserById(id)
    if (error) throw error
    const bannedUntil = (data.user as { banned_until?: string })?.banned_until
    return { is_banned: !!bannedUntil && Date.parse(bannedUntil) > Date.now() }
  },
  setBanned: async (id: string, banned: boolean) => {
    const { error } = await db.auth.admin.updateUserById(id, { ban_duration: banned ? '876600h' : 'none' })
    if (error) throw error
  },
  deleteUser: async (id: string) => {
    const { error } = await db.auth.admin.deleteUser(id)
    if (error) throw error
  },
  checkPassword,
}))
