import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const UpdatePassword = () => {
  const { handlePasswordUpdate } = useAuth();
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
    
    setLoading(true);
    await handlePasswordUpdate(password);
    setLoading(false);
  };

  const floatingLabel = `pt-2 absolute left-4 text-gray-400 bg-transparent transition-all! duration-300
    peer-focus:-translate-y-5 peer-focus:-translate-x-2 peer-focus:scale-90 peer-focus:bg-white peer-focus:px-1 peer-focus:text-blockly-purple peer-focus:font-bold
    peer-valid:-translate-y-5 peer-valid:-translate-x-2 peer-valid:scale-90 peer-valid:bg-white peer-valid:px-1 peer-valid:text-blockly-purple peer-valid:font-bold`;

  const inputClass = "peer w-full border border-slate-300 shadow rounded-lg px-4 py-2 text-base tracking-wide focus:outline-none focus:border-blockly-purple";

  return (
    <div className="items-center px-6 py-16 md:py-[10%] justify-center">
      <div className="flex flex-col items-center justify-center mx-auto w-full max-w-md gap-8 border border-slate-200 p-8 rounded-lg shadow-sm">
        
        <div className="text-center w-full">
          <h2 className="text-2xl font-bold mb-2">Create New Password</h2>
          <p className="text-gray-600">Please enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          
          <div className="relative">
            <input required autoComplete="off" type="password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className={inputClass} />
            <label className={floatingLabel}>New Password</label>
          </div>

          <div className="relative">
            <input required autoComplete="off" type="password"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass} />
            <label className={floatingLabel}>Confirm New Password</label>
          </div>

          <button className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;