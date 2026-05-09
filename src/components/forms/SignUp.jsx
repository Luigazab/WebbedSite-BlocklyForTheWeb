import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const SignUp = ({ role }) => {
  const { handleSignUp, handleResendConfirmation } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await handleSignUp(email, password, confirmPassword, username, role);
    if (success) {
      setIsSubmitted(true);
    }
    setLoading(false);
  };

  const handleResend = async () => {
    await handleResendConfirmation(email);
  };

  const floatingLabel = `pt-2 absolute left-4 text-gray-400 bg-transparent transition-all! duration-300
    peer-focus:-translate-y-5 peer-focus:-translate-x-2 peer-focus:scale-90 peer-focus:bg-white peer-focus:px-1 peer-focus:text-blockly-purple peer-focus:font-bold
    peer-valid:-translate-y-5 peer-valid:-translate-x-2 peer-valid:scale-90 peer-valid:bg-white peer-valid:px-1 peer-valid:text-blockly-purple peer-valid:font-bold`;

  const inputClass = "peer w-full border border-gray-400 rounded-lg px-4 py-2 text-base tracking-wide focus:outline-none focus:border-blockly-purple";

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-8 min-w-xs">
        <h3 className="text-xl font-semibold text-blockly-purple">Check your inbox</h3>
        <p className="text-gray-600">
          We've sent a confirmation link to <br/><span className="font-bold">{email}</span>.
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Didn't receive it?
        </p>
        <button 
          onClick={handleResend} 
          className="btn text-blockly-purple! hover:text-purple-700 transition-colors"
        >
          Click to resend
        </button>
      </div>
    );
  }

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
  );
};

export default SignUp;