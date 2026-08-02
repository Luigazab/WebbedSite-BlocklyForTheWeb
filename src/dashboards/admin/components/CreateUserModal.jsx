import { useState } from "react";
import { X, UserPlus, Mail, User, Lock, Loader2 } from "lucide-react";
import { supabase } from "../../../supabaseClient";
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
      const { data, error: authErr } = await supabase.auth.admin.createUser({
        email: form.email,
        password: form.password,
        email_confirm: true,
        user_metadata: { username: form.username },
      });
      if (authErr) throw authErr;

      const { error: profileErr } = await supabase.from("profiles").upsert({
        id: data.user.id,
        email: form.email,
        username: form.username,
        role: form.role,
      });
      if (profileErr) throw profileErr;

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
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Create New User</h2>
            <p className="mt-0.5 text-slate-500">Add a new account to the platform</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
            <X size={15} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="font-medium text-slate-700">
              Email
            </Label>
            <div className="relative">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input id="email" type="email" placeholder="user@example.com" value={form.email} onChange={set("email")} className="pl-9"/>
            </div>
          </div>

          {/* Username Field */}
          <div className="space-y-1.5">
            <Label htmlFor="username" className="font-medium text-slate-700">
              Username
            </Label>
            <div className="relative">
              <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input id="username" type="text" placeholder="johndoe" value={form.username} onChange={set("username")} className="pl-9"/>
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="font-medium text-slate-700">
              Password
            </Label>
            <div className="relative">
              <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input id="password" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} className="pl-9"/>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-1.5">
            <Label className="font-medium text-slate-700">Role</Label>
            <div className="flex gap-2">
              {roleOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setForm((f) => ({ ...f, role: value }))}
                  className={`flex-1 py-2 font-medium rounded-lg border transition-all! capitalize ${
                    form.role === value
                      ? "bg-sky-500/15 border-sky-500/40 text-sky-700"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
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