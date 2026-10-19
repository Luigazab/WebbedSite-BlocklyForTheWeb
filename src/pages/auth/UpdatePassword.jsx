import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { Link, useNavigate } from 'react-router';
import Loader from '../../components/layout/Loader';
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH, PASSWORD_HELP, passwordValidationError } from '../../lib/passwordPolicy';

const UpdatePassword = () => {
  const { handlePasswordUpdate } = useAuth();
  const { recovery, user, loading: authLoading, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    const validationError = passwordValidationError(password);
    if (validationError) { setError(validationError); return; }
    
    setLoading(true);
    const success = await handlePasswordUpdate(password);
    if (!success) setError('Your password could not be updated. Please try again or request a new link.');
    setLoading(false);
  };

  const floatingLabel = `pt-2 absolute left-4 text-gray-400 bg-transparent transition-all! duration-300
    peer-focus:-translate-y-5 peer-focus:-translate-x-2 peer-focus:scale-90 peer-focus:bg-white peer-focus:px-1 peer-focus:text-blockly-purple peer-focus:font-bold
    peer-valid:-translate-y-5 peer-valid:-translate-x-2 peer-valid:scale-90 peer-valid:bg-white peer-valid:px-1 peer-valid:text-blockly-purple peer-valid:font-bold`;

  const inputClass = "peer w-full border border-slate-300 shadow rounded-lg px-4 py-2 text-base tracking-wide focus:outline-none focus:border-blockly-purple";

  if (authLoading) return <Loader />;
  if (!recovery || !user) return (
    <div className="mx-auto max-w-md px-6 py-16 text-center space-y-5">
      <h2 className="text-2xl font-bold">Request a new reset link</h2>
      <p role="alert">This reset link is missing, expired, or has already been used.</p>
      {user ? <button className="btn" onClick={async () => {
        try { await signOut() } catch { /* local session is still cleared */ }
        navigate('/forgot-password', { replace: true });
      }}>Request a new link</button> : <Link className="btn btn-secondary" to="/forgot-password">Request a new link</Link>}
      <Link className="flex justify-center text-slate-700 underline pt-4" to="/login">Return to login</Link>
    </div>
  );

  return (
    <div className="items-center px-6 py-16 md:py-[10%] justify-center">
      <div className="flex flex-col items-center justify-center mx-auto w-full max-w-md gap-8 border border-slate-200 p-8 rounded-lg shadow-sm">
        
        <div className="text-center w-full">
          <h2 className="text-2xl font-bold mb-2">Create New Password</h2>
          <p className="text-gray-600">Please enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
          {error && <div role="alert" className="text-red-500 text-sm text-center">{error}</div>}
          
          <div className="relative">
            <input id="reset-password" required autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} maxLength={MAX_PASSWORD_LENGTH} aria-describedby="reset-password-help" type="password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className={inputClass} />
            <label htmlFor="reset-password" className={floatingLabel}>New Password</label>
          </div>

          <div className="relative">
            <input id="reset-confirm-password" required autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} maxLength={MAX_PASSWORD_LENGTH} type="password"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass} />
            <label htmlFor="reset-confirm-password" className={floatingLabel}>Confirm New Password</label>
          </div>

          <p id="reset-password-help" className="text-sm text-slate-500">{PASSWORD_HELP}</p>
          <button className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
