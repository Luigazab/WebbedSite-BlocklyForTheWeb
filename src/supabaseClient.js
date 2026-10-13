import { createClient } from '@supabase/supabase-js'
import { createAuthStorage } from './lib/authStorage'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const storageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`
export const authStorage = createAuthStorage(localStorage, sessionStorage, storageKey)
const recoveryParams = new URLSearchParams(window.location.hash.slice(1))
export const recoveryAccessToken = recoveryParams.get('type') === 'recovery' ? recoveryParams.get('access_token') : null
if (recoveryAccessToken) authStorage.setPersistence(false)

// Login/reauthentication attempts cannot replace a working session on failure,
// leak an unchecked login into localStorage, or broadcast temporary credentials.
export function createLoginClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { storageKey: `webbed-attempt-${crypto.randomUUID()}`, persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey,
    storage: authStorage.storage,
    persistSession: true,
    autoRefreshToken: true,
  }
})
