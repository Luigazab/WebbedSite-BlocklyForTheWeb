import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

const SignIn = () => {
  const { handleSignIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await handleSignIn(email, password)
    setLoading(false)
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 min-w-xs">
        <div className="relative">
          <input
            required
            autoComplete="off"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="peer w-full border border-gray-400 rounded-lg px-4 py-2 text-base tracking-wide focus:outline-none focus:border-blockly-purple"
          />
          <label className="pt-2 absolute left-4 text-gray-400 bg-transparent transition-all duration-300
            peer-focus:-translate-y-5 peer-focus:-translate-x-2 peer-focus:scale-90 peer-focus:bg-white peer-focus:px-1 peer-focus:text-blockly-purple peer-focus:font-bold
            peer-valid:-translate-y-5 peer-valid:-translate-x-2 peer-valid:scale-90 peer-valid:bg-white peer-valid:px-1 peer-valid:text-blockly-purple peer-valid:font-bold">
            Email
          </label>
        </div>

        <div className="relative">
          <input
            required
            autoComplete="off"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="peer w-full border border-gray-400 rounded-lg px-4 py-2 text-base tracking-wide focus:outline-none focus:border-blockly-purple"
          />
          <label className="pt-2 absolute left-4 text-gray-400 bg-transparent transition-all duration-300
            peer-focus:-translate-y-5 peer-focus:-translate-x-2 peer-focus:scale-90 peer-focus:bg-white peer-focus:px-1 peer-focus:text-blockly-purple peer-focus:font-bold
            peer-valid:-translate-y-5 peer-valid:-translate-x-2 peer-valid:scale-90 peer-valid:bg-white peer-valid:px-1 peer-valid:text-blockly-purple peer-valid:font-bold">
            Password
          </label>
        </div>

        <div className="flex justify-between w-full text-blockly-green">
          <div className="relative space-x-2">
            <input type="checkbox" />
            <label>Remember me</label>
          </div>
          <a href="/forgot-password" className="hover:underline">Forgot your password?</a>
        </div>

        <button className="btn" disabled={loading}>
          {loading ? 'Signing in...' : 'Login to WebbedSite'}
        </button>
      </form>
    </div>
  )
}

export default SignIn