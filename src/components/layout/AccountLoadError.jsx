import { useAuth } from '../../hooks/useAuth'
import { useAuthStore } from '../../store/authStore'

export default function AccountLoadError() {
  const { profileError, initialize } = useAuthStore()
  const { handleSignOut } = useAuth()
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md rounded-xl border bg-white p-8 text-center space-y-4" role="alert">
        <h1 className="text-xl font-bold">Could not load your account</h1>
        <p>{profileError}</p>
        <button className="btn" onClick={() => { void initialize() }}>Retry</button>
        <button className="btn btn-secondary" onClick={handleSignOut}>Sign out</button>
      </div>
    </main>
  )
}
