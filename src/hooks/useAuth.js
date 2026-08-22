import { toast } from 'sonner'
import { authService } from '../services/auth.service'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router'

export function useAuth() {
  const { signIn, signUp, signOut, user, profile, loading } = useAuthStore()
  const navigate = useNavigate()

  const handleSignIn = async (email, password) => {
    try {
      const profile = await signIn(email, password)
      toast.success(`Welcome back, ${profile.username}!`)

      if (profile.role === 'student') navigate('/student')
      else if (profile.role === 'teacher') navigate('/teacher')
      else if (profile.role === 'admin') navigate('/admin')
    } catch (err) {
      toast.error(err.message || 'Failed to sign in.')
    }
  }

  const handleSignUp = async (email, password, confirmPassword, username, role) => {
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return false;
    }
    if (username.trim().length < 3) {
      toast.error('Username must be at least 3 characters.')
      return false;
    }
    try {
      await signUp(email, password, username, role)
      return true;
    } catch (err) {
      toast.error(err.message || 'Failed to create account.');
      return false;
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.info('Signed out successfully.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Failed to sign out.')
    }
  }

  const handleResendConfirmation = async (email) => {
    try {
      await authService.resendConfirmation(email);
      toast.success('Confirmation email resent. Please check your inbox.');
    } catch (err) {
      toast.error(err.message || 'Failed to resend email.');
    }
  };

  const handlePasswordReset = async (email) => {
    try {
      await authService.resetPasswordRequest(email);
      return true;
    } catch (err) {
      toast.error(err.message || 'Failed to send reset link.');
      return false;
    }
  };

  const handlePasswordUpdate = async (newPassword) => {
    try {
      await authService.updatePassword(newPassword);
      toast.success('Password updated successfully.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Failed to update password.');
    }
  };

  return { handleSignIn, handleSignUp, handleSignOut, user, profile, loading, handleResendConfirmation, handlePasswordReset, handlePasswordUpdate }
}