import { useState } from "react";
import { X, UserPlus, Mail, User, Lock, Loader2 } from "lucide-react";
import { adminAuthService } from '../../../services/adminAuth.service';
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH, PASSWORD_HELP } from '../../../lib/passwordPolicy';
import { Input } from "#components/ui/input";
import { Label } from "#components/ui/label";
import { Button } from "#components/ui/button";

const CreateUserModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ 
    email: "", 
    username: "", 
    password: "", 
    role: "student" 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.email || !form.username || !form.password) { 
      setError("All fields required."); 
      return; 
    }
    setLoading(true); 
    setError("");
    try {
      await adminAuthService.createUser(form);

      onCreated();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: "student", label: "Student" },
    { value: "teacher", label: "Teacher" },
    { value: "admin", label: "Admin" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">Create New User</h2>
            <p className="mt-0.5 text-muted-foreground">Add a new account to the platform</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
            <X size={15} className="text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="font-medium text-foreground">
              Email
            </Label>
            <div className="relative">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" type="email" placeholder="user@example.com" value={form.email} onChange={set("email")} className="pl-9"/>
            </div>
          </div>

          {/* Username Field */}
          <div className="space-y-1.5">
            <Label htmlFor="username" className="font-medium text-foreground">
              Username
            </Label>
            <div className="relative">
              <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input id="username" type="text" placeholder="johndoe" value={form.username} onChange={set("username")} className="pl-9"/>
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="font-medium text-foreground">
              Password
            </Label>
            <div className="relative">
              <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" type="password" autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} maxLength={MAX_PASSWORD_LENGTH} placeholder="••••••••" value={form.password} onChange={set("password")} className="pl-9"/>
              <p className="text-xs text-muted-foreground">{PASSWORD_HELP}</p>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-1.5">
            <Label className="font-medium text-foreground">Role</Label>
            <div className="flex gap-2">
              {roleOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setForm((f) => ({ ...f, role: value }))}
                  className={`flex-1 py-2 font-medium rounded-lg border transition-all! capitalize ${
                    form.role === value
                      ? "bg-sky-500/15 border-sky-500/40 text-sky-700 dark:text-sky-300"
                      : "bg-muted border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <Button  type="button"  variant="formalPlain"  onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading} variant="formalPrimary" className="flex-1">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
            Create User
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal;
