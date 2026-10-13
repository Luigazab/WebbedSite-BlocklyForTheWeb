import { supabase } from '../supabaseClient'
import { assertPasswordPolicy } from '../lib/passwordPolicy'

async function invokeAdmin(body) {
  if (['create-user', 'reset-password'].includes(body.action)) assertPasswordPolicy(body.password)
  const { data, error } = await supabase.functions.invoke('admin-auth', { body })
  if (error) {
    let message = 'The account operation failed. Please try again.'
    try { message = (await error.context?.json())?.error || message } catch { /* safe fallback */ }
    throw new Error(message)
  }
  return data
}

export const adminAuthService = {
  createUser: form => invokeAdmin({ action: 'create-user', ...form }),
  async resetPassword(userId, password) {
    const data = await invokeAdmin({ action: 'reset-password', userId, password })
    if (!data?.success) throw new Error('The password could not be reset.')
  },
  async getUserStatuses(userIds) {
    if (!userIds.length) return {}
    return (await invokeAdmin({ action: 'user-statuses', userIds })).statuses
  },
  async setRole(userId, role) {
    if (!(await invokeAdmin({ action: 'set-role', userId, role }))?.success) throw new Error('The account role could not be changed.')
  },
  async setBanned(userId, banned) {
    if (!(await invokeAdmin({ action: 'set-banned', userId, banned }))?.success) throw new Error('The account status could not be changed.')
  },
  async deleteUser(userId) {
    if (!(await invokeAdmin({ action: 'delete-user', userId }))?.success) throw new Error('The account could not be deleted.')
  },
}
