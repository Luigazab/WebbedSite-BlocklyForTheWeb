import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

// role is passed in from the parent page (StudentRegister or TeacherRegister)
const SignUp = ({ role }) => {
  const { handleSignUp } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await handleSignUp(email, password, confirmPassword, username, role)
    setLoading(false)
  }

  const floatingLabel = `pt-2 absolute left-4 text-gray-400 bg-transparent transition-all duration-300
    peer-focus:-translate-y-5 peer-focus:-translate-x-2 peer-focus:scale-90 peer-focus:bg-white peer-focus:px-1 peer-focus:text-blockly-purple peer-focus:font-bold
    peer-valid:-translate-y-5 peer-valid:-translate-x-2 peer-valid:scale-90 peer-valid:bg-white peer-valid:px-1 peer-valid:text-blockly-purple peer-valid:font-bold`

  const inputClass = "peer w-full border border-gray-400 rounded-lg px-4 py-2 text-base tracking-wide focus:outline-none focus:border-blockly-purple"

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 min-w-xs">
        <div className="relative">
          <input required autoComplete="off" type="text"
            value={username} onChange={(e) => setUsername(e.target.value)}
            className={inputClass} />
          <label className={floatingLabel}>Username</label>
        </div>

        <div className="relative">
          <input required autoComplete="off" type="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className={inputClass} />
          <label className={floatingLabel}>Email</label>
        </div>

        <div className="relative">
          <input required autoComplete="off" type="password"
            value={password} onChange={(e) => setPassword(e.target.value)}
            className={inputClass} />
          <label className={floatingLabel}>Password</label>
        </div>

        <div className="relative">
          <input required autoComplete="off" type="password"
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass} />
          <label className={floatingLabel}>Confirm Password</label>
        </div>

        <button className="btn" disabled={loading}>
          {loading ? 'Creating account...' : 'Create my account'}
        </button>
      </form>
    </div>
  )
}

export default SignUp