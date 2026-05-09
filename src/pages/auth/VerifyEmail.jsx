import { useLocation } from 'react-router';
import { useAuth } from '../hooks/useAuth';

const VerifyEmail = () => {
  const location = useLocation();
  const email = location.state?.email;
  const { handleResendConfirmation } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Check your email</h2>
      <p className="mb-6 text-center">
        We sent a confirmation link to <strong>{email || 'your email address'}</strong>.
      </p>
      
      {email ? (
        <button 
          onClick={() => handleResendConfirmation(email)}
          className="text-blockly-purple underline hover:text-purple-700"
        >
          Didn't receive it? Resend confirmation email
        </button>
      ) : (
        <p className="text-gray-500">Please check your inbox to proceed.</p>
      )}
    </div>
  );
};

export default VerifyEmail;