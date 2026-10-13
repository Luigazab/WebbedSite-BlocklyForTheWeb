import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Link } from 'react-router'

const SignIn = () => {
  const { handleSignIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await handleSignIn(email, password, rememberMe)
    setLoading(false)
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 min-w-xs">
        <div className="relative">
          <input
            required
            id="login-email"
            autoComplete="username"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="peer w-full border border-slate-300 shadow rounded-lg px-4 py-2 text-base tracking-wide focus:outline-none focus:border-blockly-purple"
          />
          <label htmlFor="login-email" className="pt-2 absolute left-4 text-slate-400 bg-transparent transition-all! duration-300
            peer-focus:-translate-y-5 peer-focus:-translate-x-2 peer-focus:scale-90 peer-focus:bg-white peer-focus:px-1 peer-focus:text-blockly-purple peer-focus:font-bold
            peer-valid:-translate-y-5 peer-valid:-translate-x-2 peer-valid:scale-90 peer-valid:bg-white peer-valid:px-1 peer-valid:text-blockly-purple peer-valid:font-bold">
            Email
          </label>
        </div>

        <div className="relative">
          <input
            required
            id="login-password"
            autoComplete="current-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="peer w-full border border-slate-300 shadow rounded-lg px-4 py-2 text-base tracking-wide focus:outline-none focus:border-blockly-purple"
          />
          <label htmlFor="login-password" className="pt-2 absolute left-4 text-slate-400 bg-transparent transition-all! duration-300
            peer-focus:-translate-y-5 peer-focus:-translate-x-2 peer-focus:scale-90 peer-focus:bg-white peer-focus:px-1 peer-focus:text-blockly-purple peer-focus:font-bold
            peer-valid:-translate-y-5 peer-valid:-translate-x-2 peer-valid:scale-90 peer-valid:bg-white peer-valid:px-1 peer-valid:text-blockly-purple peer-valid:font-bold">
            Password
          </label>
        </div>

        <div className="flex justify-between items-center w-full text-blockly-green">
          <div className="relative space-x-2 flex items-center">
            <input id="remember-me" className='accent-yellow-500/70 w-4 h-4' type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}/>
            <label htmlFor="remember-me">Remember me</label>
          </div>
          <Link to='/forgot-password' className='text-sm! hover:underline hover:text-blockly-purple'>I forgot my password</Link>
        </div>

        <button className="btn" disabled={loading}>
          {loading ? 'Signing in...' : 'Login to WebbedSite'}
        </button>
      </form>
    </div>
  )
}

export default SignIn
