import { toast } from 'sonner'
import { authService } from '../services/auth.service'
import { useAuthStore } from '../store/authStore'
import { useLocation, useNavigate } from 'react-router'
import { notificationReturnPath } from '../lib/notificationLinks'
import { passwordValidationError } from '../lib/passwordPolicy'

export function useAuth() {
  const { signIn, signUp, signOut, user, profile, loading } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignIn = async (email, password, rememberMe) => {
    try {
      const profile = await signIn(email, password, rememberMe)
      toast.success(`Welcome back, ${profile.username}!`)

      const returnTo = notificationReturnPath(location.search)
      if (returnTo) navigate(returnTo, { replace: true })
      else if (profile.role === 'student') navigate('/student')
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
    const passwordError = passwordValidationError(password)
    if (passwordError) { toast.error(passwordError); return false }
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
      navigate('/login', { replace: true })
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
      try { await signOut() } catch (error) { toast.warning(error.message) }
      toast.success('Password updated. Please sign in with your new password.');
      navigate('/login', { replace: true });
      return true;
    } catch (err) {
      toast.error(err.message || 'Failed to update password.');
      if (!useAuthStore.getState().user) navigate('/login', { replace: true });
      return false;
    }
  };

  return { handleSignIn, handleSignUp, handleSignOut, user, profile, loading, handleResendConfirmation, handlePasswordReset, handlePasswordUpdate }
}
