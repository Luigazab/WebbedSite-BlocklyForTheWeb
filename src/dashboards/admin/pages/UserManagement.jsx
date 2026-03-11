import { useState, useEffect, useCallback } from "react";
import {
  Search, UserPlus, MoreHorizontal, Shield, ShieldOff,
  KeyRound, Trash2, ChevronDown, X, Check, Loader2,
  Filter, RefreshCw, Mail, User, Lock
} from "lucide-react";
import { supabase } from "../../../supabaseClient";

// ── Role Badge ─────────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const map = {
    student: "bg-sky-500/15 text-sky-300 border-sky-500/20",
    teacher: "bg-violet-500/15 text-violet-300 border-violet-500/20",
    admin:   "bg-amber-500/15 text-amber-300 border-amber-500/20",
  };
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${map[role] || map.student}`}>
      {role}
    </span>
  );
}

// ── Status Dot ─────────────────────────────────────────────────────────────────
function StatusDot({ banned }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${banned ? "text-rose-400" : "text-emerald-400"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${banned ? "bg-rose-400" : "bg-emerald-400"}`} />
      {banned ? "Banned" : "Active"}
    </span>
  );
}

// ── Create User Modal ──────────────────────────────────────────────────────────
function CreateUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ email: "", username: "", password: "", role: "student" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.email || !form.username || !form.password) { setError("All fields required."); return; }
    setLoading(true); setError("");
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#13151e] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white text-base font-semibold">Create New User</h2>
            <p className="text-white/35 text-xs mt-0.5">Add a new account to the platform</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white/80 transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="space-y-4">
          <Field icon={<Mail size={13} />} label="Email" placeholder="user@example.com" value={form.email} onChange={set("email")} type="email" />
          <Field icon={<User size={13} />} label="Username" placeholder="johndoe" value={form.username} onChange={set("username")} />
          <Field icon={<Lock size={13} />} label="Password" placeholder="••••••••" value={form.password} onChange={set("password")} type="password" />

          <div>
            <label className="text-white/50 text-xs font-medium block mb-1.5">Role</label>
            <div className="flex gap-2">
              {["student", "teacher", "admin"].map((r) => (
                <button
                  key={r}
                  onClick={() => setForm((f) => ({ ...f, role: r }))}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all capitalize ${
                    form.role === r
                      ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                      : "bg-white/[0.03] border-white/[0.07] text-white/40 hover:text-white/60"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{error}</p>}
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-white/50 bg-white/[0.04] hover:bg-white/[0.07] rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 text-sm font-medium text-black bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
            Create User
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, placeholder, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="text-white/50 text-xs font-medium block mb-1.5">{label}</label>
      <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 focus-within:border-amber-500/40 transition-colors">
        <span className="text-white/30">{icon}</span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="bg-transparent text-white/80 text-sm placeholder:text-white/20 outline-none flex-1"
        />
      </div>
    </div>
  );
}

// ── Reset Password Modal ───────────────────────────────────────────────────────
function ResetPasswordModal({ user, onClose }) {
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleReset = async () => {
    if (!pw || pw.length < 6) return;
    setLoading(true);
    try {
      await supabase.auth.admin.updateUserById(user.id, { password: pw });
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#13151e] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white text-base font-semibold">Reset Password</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.04] text-white/50 hover:text-white/80">
            <X size={14} />
          </button>
        </div>
        {done ? (
          <div className="text-center py-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-3">
              <Check size={18} className="text-emerald-400" />
            </div>
            <p className="text-white/70 text-sm">Password reset for <span className="text-white font-medium">@{user.username}</span></p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-white/[0.06] text-white/60 text-sm rounded-lg hover:bg-white/[0.09]">Close</button>
          </div>
        ) : (
          <>
            <p className="text-white/40 text-xs mb-4">Setting new password for <span className="text-white/70">@{user.username}</span></p>
            <Field icon={<Lock size={13} />} label="New Password" placeholder="••••••••" value={pw} onChange={(e) => setPw(e.target.value)} type="password" />
            <div className="flex gap-2 mt-4">
              <button onClick={onClose} className="flex-1 py-2.5 text-sm text-white/50 bg-white/[0.04] rounded-lg hover:bg-white/[0.07]">Cancel</button>
              <button onClick={handleReset} disabled={loading || pw.length < 6} className="flex-1 py-2.5 text-sm font-medium text-black bg-amber-500 hover:bg-amber-400 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <Loader2 size={13} className="animate-spin" /> : <KeyRound size={13} />}
                Reset
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Confirm Delete Modal ───────────────────────────────────────────────────────
function ConfirmDeleteModal({ user, onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#13151e] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-10 rounded-full bg-rose-500/15 flex items-center justify-center mb-4">
          <Trash2 size={18} className="text-rose-400" />
        </div>
        <h2 className="text-white text-base font-semibold mb-1">Remove User</h2>
        <p className="text-white/40 text-sm mb-6">
          Are you sure you want to permanently remove <span className="text-white font-medium">@{user.username}</span>? This cannot be undone.
        </p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm text-white/50 bg-white/[0.04] rounded-lg hover:bg-white/[0.07]">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 text-sm font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Row Actions Dropdown ───────────────────────────────────────────────────────
function RowActions({ user, onBan, onReset, onDelete, onRoleChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/[0.06] text-white/30 hover:text-white/70 transition-colors"
      >
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-44 bg-[#1a1d2a] border border-white/10 rounded-xl shadow-2xl py-1.5 text-sm overflow-hidden">
            <button onClick={() => { onBan(user); setOpen(false); }} className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/[0.05] text-left transition-colors ${user.is_banned ? "text-emerald-400" : "text-amber-300"}`}>
              {user.is_banned ? <Shield size={13} /> : <ShieldOff size={13} />}
              {user.is_banned ? "Unban User" : "Ban User"}
            </button>
            <button onClick={() => { onReset(user); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/[0.05] text-white/60 text-left transition-colors">
              <KeyRound size={13} />
              Reset Password
            </button>
            <div className="my-1 border-t border-white/[0.06]" />
            {["student", "teacher", "admin"].filter((r) => r !== user.role).map((r) => (
              <button key={r} onClick={() => { onRoleChange(user, r); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/[0.05] text-white/40 text-left transition-colors capitalize">
                <User size={13} />
                Set as {r}
              </button>
            ))}
            <div className="my-1 border-t border-white/[0.06]" />
            <button onClick={() => { onDelete(user); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-rose-500/10 text-rose-400 text-left transition-colors">
              <Trash2 size={13} />
              Remove User
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 15;

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [resetUser, setResetUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase
        .from("profiles")
        .select("id,username,email,role,created_at,last_login,avatar_url,bio", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (roleFilter !== "all") q = q.eq("role", roleFilter);
      if (search) q = q.or(`username.ilike.%${search}%,email.ilike.%${search}%`);

      const { data, count, error } = await q;
      if (error) throw error;
      setUsers(data || []);
      setTotal(count || 0);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleBan = async (user) => {
    // Toggle banned state via user_metadata (Supabase Auth Admin API)
    await supabase.auth.admin.updateUserById(user.id, {
      ban_duration: user.is_banned ? "none" : "876600h",
    });
    fetchUsers();
  };

  const handleRoleChange = async (user, newRole) => {
    await supabase.from("profiles").update({ role: newRole }).eq("id", user.id);
    fetchUsers();
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setDeleteLoading(true);
    try {
      await supabase.auth.admin.deleteUser(deleteUser.id);
      setDeleteUser(null);
      fetchUsers();
    } finally {
      setDeleteLoading(false);
    }
  };

  const timeAgo = (ts) => {
    if (!ts) return "—";
    const s = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-7xl space-y-4 mx-auto py-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2.5 flex-1 min-w-48 max-w-72 focus-within:border-amber-500/30 transition-colors">
          <Search size={13} className="shrink-0" />
          <input
            placeholder="Search username or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="bg-transparent text-sm  outline-none flex-1"
          />
        </div>

        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
          {["all", "student", "teacher", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => { setRoleFilter(r); setPage(0); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${roleFilter === r ? "bg-blockly-yellow text-white" : "text-blockly-yellow hover:text-yellow-900"}`}
            >
              {r}
            </button>
          ))}
        </div>

        <button onClick={fetchUsers} className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold rounded-lg transition-colors ml-auto shadow-lg shadow-amber-500/20"
        >
          <UserPlus size={14} />
          New User
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#13151e] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["User", "Role", "Status", "Joined", "Last Login", ""].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold text-white/25 uppercase tracking-wider px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(8).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-white/[0.03]">
                      {Array(6).fill(0).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-3 bg-white/[0.04] rounded animate-pulse w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                : users.map((u) => (
                    <tr key={u.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400/20 to-violet-400/20 border border-white/[0.08] flex items-center justify-center text-white/60 text-xs font-bold shrink-0">
                            {u.username?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white/85 text-sm font-medium">@{u.username}</p>
                            <p className="text-white/30 text-xs">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                      <td className="px-4 py-3"><StatusDot banned={u.is_banned} /></td>
                      <td className="px-4 py-3 text-white/40 text-xs">{timeAgo(u.created_at)}</td>
                      <td className="px-4 py-3 text-white/40 text-xs">{timeAgo(u.last_login)}</td>
                      <td className="px-4 py-3">
                        <RowActions
                          user={u}
                          onBan={handleBan}
                          onReset={setResetUser}
                          onDelete={setDeleteUser}
                          onRoleChange={handleRoleChange}
                        />
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
            <p className="text-white/30 text-xs">{total.toLocaleString()} total users</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1.5 text-xs text-white/40 hover:text-white/70 disabled:opacity-30 rounded-md hover:bg-white/[0.04] transition-colors">
                Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = page < 3 ? i : page - 2 + i;
                if (pg >= totalPages) return null;
                return (
                  <button key={pg} onClick={() => setPage(pg)} className={`w-7 h-7 text-xs rounded-md transition-colors ${pg === page ? "bg-amber-500/20 text-amber-300" : "text-white/35 hover:bg-white/[0.04]"}`}>
                    {pg + 1}
                  </button>
                );
              })}
              <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1.5 text-xs text-white/40 hover:text-white/70 disabled:opacity-30 rounded-md hover:bg-white/[0.04] transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} onCreated={fetchUsers} />}
      {resetUser && <ResetPasswordModal user={resetUser} onClose={() => setResetUser(null)} />}
      {deleteUser && (
        <ConfirmDeleteModal
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}