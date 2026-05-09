import { authService } from '../services/auth.service'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import { useNavigate } from 'react-router'

export function useAuth() {
  const { signIn, signUp, signOut, user, profile, loading } = useAuthStore()
  const addToast = useUIStore((state) => state.addToast)
  const navigate = useNavigate()

  const handleSignIn = async (email, password) => {
    try {
      const profile = await signIn(email, password)
      addToast(`Welcome back, ${profile.username}!`, 'success')

      if (profile.role === 'student') navigate('/student')
      else if (profile.role === 'teacher') navigate('/teacher')
      else if (profile.role === 'admin') navigate('/admin')
    } catch (err) {
      addToast(err.message || 'Failed to sign in.', 'error')
    }
  }

  const handleSignUp = async (email, password, confirmPassword, username, role) => {
    if (password !== confirmPassword) {
      addToast('Passwords do not match.', 'error')
      return false;
    }
    if (username.trim().length < 3) {
      addToast('Username must be at least 3 characters.', 'error')
      return false;
    }
    try {
      await signUp(email, password, username, role)
      return true;
    } catch (err) {
      addToast(err.message || 'Failed to create account.', 'error');
      return false;
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      addToast('Signed out successfully.', 'info')
      navigate('/login')
    } catch (err) {
      addToast(err.message || 'Failed to sign out.', 'error')
    }
  }

  const handleResendConfirmation = async (email) => {
    try {
      await authService.resendConfirmation(email);
      addToast('Confirmation email resent. Please check your inbox.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to resend email.', 'error');
    }
  };

  const handlePasswordReset = async (email) => {
    try {
      await authService.resetPasswordRequest(email);
      return true;
    } catch (err) {
      addToast(err.message || 'Failed to send reset link.', 'error');
      return false;
    }
  };

  const handlePasswordUpdate = async (newPassword) => {
    try {
      await authService.updatePassword(newPassword);
      addToast('Password updated successfully.', 'success');
      navigate('/login');
    } catch (err) {
      addToast(err.message || 'Failed to update password.', 'error');
    }
  };

  return { handleSignIn, handleSignUp, handleSignOut, user, profile, loading, handleResendConfirmation, handlePasswordReset, handlePasswordUpdate }
}