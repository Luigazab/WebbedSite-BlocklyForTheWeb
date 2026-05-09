import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router';

const ForgotPassword = () => {
  const { handlePasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await handlePasswordReset(email);
    if (success) {
      setIsSubmitted(true);
    }
    setLoading(false);
  };

  const floatingLabel = `pt-2 absolute left-4 text-gray-400 bg-transparent transition-all! duration-300
    peer-focus:-translate-y-5 peer-focus:-translate-x-2 peer-focus:scale-90 peer-focus:bg-white peer-focus:px-1 peer-focus:text-blockly-purple peer-focus:font-bold
    peer-valid:-translate-y-5 peer-valid:-translate-x-2 peer-valid:scale-90 peer-valid:bg-white peer-valid:px-1 peer-valid:text-blockly-purple peer-valid:font-bold`;

  const inputClass = "peer w-full border border-slate-300 shadow rounded-lg px-4 py-2 text-base tracking-wide focus:outline-none focus:border-blockly-purple";

  return (
    <div className="items-center px-6 py-16 md:py-[10%] justify-center">
      <div className="flex flex-col items-center justify-center mx-auto w-full height max-w-md gap-8 border border-slate-200 p-8 rounded-lg shadow! card">
        
        <div className="text-center w-full">
          <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
          <p className="text-gray-600">Enter your email to receive a reset link.</p>
        </div>

        {isSubmitted ? (
          <div className="flex flex-col items-center text-center gap-4 w-full">
            <div className="p-4 bg-green-50 text-green-700 rounded-lg w-full">
              Reset link sent to <strong>{email}</strong>
            </div>
            <p className="text-sm text-gray-500">Please check your spam folder if you don't see it.</p>
            <Link to="/login" className="text-blockly-purple underline mt-4">
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
            <div className="relative">
              <input required autoComplete="off" type="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className={inputClass} />
              <label className={floatingLabel}>Email</label>
            </div>

            <button className="btn btn-secondary" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            
            <div className="text-center mt-4">
              <Link to="/login" className="text-sm text-gray-500 hover:text-blockly-purple">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;