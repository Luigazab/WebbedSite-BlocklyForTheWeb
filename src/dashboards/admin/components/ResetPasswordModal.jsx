import { useState } from "react";
import { X, Check, Loader2, KeyRound, Lock } from "lucide-react";
import { adminAuthService } from '../../../services/adminAuth.service';
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH, PASSWORD_HELP, passwordValidationError } from '../../../lib/passwordPolicy';
import { Input } from "#components/ui/input";
import { Label } from "#components/ui/label";
import { Button } from "#components/ui/button";

const ResetPasswordModal = ({ user, onClose }) => {
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    const validationError = passwordValidationError(pw);
    if (validationError) { setError(validationError); return; }
    setError('');
    setLoading(true);
    try {
      await adminAuthService.resetPassword(user.id, pw);
      setDone(true);
    } catch (error) {
      setError(error.message || 'The password could not be reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white space-y-4 border border-gray-200 rounded-xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-black text-base font-bold">Reset Password</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
            <X size={15} className="text-slate-500" />
          </button>
        </div>
        <hr />
        {done ? (
          <div className="text-center py-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-3">
              <Check size={18} className="text-emerald-700" />
            </div>
            <p className="text-gray-700 text-sm">
              Password reset for <span className="text-black font-medium">@{user.username}</span>
            </p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-100 text-slate-700 text-sm rounded-lg hover:bg-slate-200 transition-colors">
              Close
            </button>
          </div>
        ) : (
          <>
            {error && <p role="alert" className="text-red-600">{error}</p>}
            <p className="text-slate-600 mb-4">
              Setting new password for <span className="text-black">@{user.username}</span>
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="password">
                New Password
              </Label>
              <div className="relative">
                <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input id="password" type="password" autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} maxLength={MAX_PASSWORD_LENGTH} placeholder="••••••••" value={pw} onChange={(e) => setPw(e.target.value)} className="pl-9"/>
              </div>
              <p className="text-xs text-slate-500 mt-1">{PASSWORD_HELP}</p>
            </div>

            <div className="flex gap-2 mt-4">
              <Button variant="formalPlain" onClick={onClose} className="flex-1 px-0">
                Cancel
              </Button>
              <Button onClick={handleReset} disabled={loading || !!passwordValidationError(pw)} variant="formalPrimary" className="flex-1">
                {loading ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />}
                Reset
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordModal;
