import { supabase } from '../supabaseClient'
import { assertPasswordPolicy } from '../lib/passwordPolicy'

export async function validateNewPassword(password) {
  assertPasswordPolicy(password)
  // Only a SHA-1 prefix is sent to the breach service by the Edge Function.
  // The plaintext travels solely to our existing Supabase backend over HTTPS.
  const { data, error } = await supabase.functions.invoke('password-policy', { body: { password } })
  if (error) {
    let message = 'Password screening is unavailable. Please try again.'
    try { message = (await error.context?.json())?.error || message } catch { /* preserve safe fallback */ }
    throw new Error(message)
  }
  if (!data?.valid) throw new Error(data?.error || 'Choose a different password.')
}
