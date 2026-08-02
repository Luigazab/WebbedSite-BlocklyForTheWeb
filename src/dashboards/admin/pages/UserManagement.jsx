import { useState, useEffect, useCallback } from "react";
import { Search, UserPlus, MoreHorizontal, Shield, ShieldOff, KeyRound, Trash2, X, Check, Loader2, RefreshCw, Mail, User, Lock, Users, GraduationCap, ShieldUser, School, Plus, ChevronDown, Ellipsis } from "lucide-react";
import { supabase } from "../../../supabaseClient";
import { AppBreadcrumb } from "#components/common/breadcrumb";
import AdminStat from "../components/AdminStat";
import { Button } from "#components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "#components/ui/dropdown-menu";
import DeleteModal from "#components/ui/DeleteModal";
import ResetPasswordModal from "../components/ResetPasswordModal";
import CreateUserModal from "../components/CreateUserModal";

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
    <div className="p-6 space-y-6">
      <AppBreadcrumb
        items={[
          { label: 'Home', href: '/admin/' },
          { label: 'User Management', href: '/admin/users' },
        ]}
      />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">User Management</h2>
          <p className="mt-1 text-sm text-muted-foreground">View and manage user accounts.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="formalPlain">Import CSV</Button>
          <Button onClick={() => setShowCreate(true)} variant="formalPrimary"><UserPlus size={20}/>Invite User</Button>
        </div>
      </div>
      <section className="grid gap-4 md:grid-cols-4">
        <AdminStat label="Total Users" value="5" icon={Users} sub="registered"/>
        <AdminStat label="Students" value="3" icon={GraduationCap} sub="active"/>
        <AdminStat label="Teachers" value="2" icon={School} sub="active"/>
        <AdminStat label="Admins" value="1" icon={ShieldUser} sub="active" accent/>
      </section>
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
        <div className="relative flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2.5 flex-1 min-w-48 shadow focus-within:border-sky-500/30 transition-colors!">
          <Search size={13} className="shrink-0" />
          <input
            placeholder="Search username or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="bg-transparent text-sm  outline-none flex-1"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex shadow items-center gap-2 px-3 py-2.5 text-sm bg-white border border-border rounded-lg hover:bg-slate-50 transition-colors">
                <span className="capitalize">
                  {roleFilter === "all" ? "All Roles" : roleFilter}
                </span>
                <ChevronDown size={14} className="text-slate-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-40">
              {["all", "student", "teacher", "admin"].map((role) => (
                <DropdownMenuItem 
                  key={role}
                  onClick={() => { setRoleFilter(role); setPage(0); }}
                  className={`capitalize ${roleFilter === role ? "bg-sky-700/10 text-sky-700" : ""}`}
                >
                  {role === "all" ? "All Roles" : role}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <button onClick={fetchUsers} className="w-10 h-10 flex items-center justify-center rounded-lg shadow bg-white border border-slate-200 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

      </div>

      {/* Table */}
      <div className="overflow-hidden bg-card border border-border shadow rounded-lg">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-slate-50">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground">
                {["User", "Email", "Role", "Status", "Joined", "Last Login", ""].map((h, i) => (
                  <th key={h} className={`px-6 py-3 ${i === 0 ? "sticky left-0 bg-card z-10" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(8).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-border/60">
                      {Array(6).fill(0).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-3 bg-card/60 rounded animate-pulse w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                : users.map((u) => (
                    <tr key={u.id} className="border-b border-black/20 hover:bg-border/10 transition-colors group">
                      <td className="px-6 py-3 sticky left-0 bg-card z-10">
                        <div className="flex items-center gap-3">
                          <img src={u.avatar_url || '/default-avatar.png'} alt="" className="w-8 h-8 rounded-full border border-border object-cover" />
                          <div>
                            <p className="font-medium truncate">{u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">{u.email}</td>
                      <td className="px-6 py-3"><RoleBadge role={u.role} /></td>
                      <td className="px-6 py-3"><StatusDot banned={u.is_banned} /></td>
                      <td className="px-6 py-3 text-muted-foreground">{timeAgo(u.created_at)}</td>
                      <td className="px-6 py-3 text-muted-foreground">{timeAgo(u.last_login)}</td>
                      <td className="px-6 py-3 w-10">
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <p className=" text-xs">{total.toLocaleString()} total users</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1.5 text-xs  hover: disabled:opacity-30 rounded-md hover:bg-slate-50 transition-colors">
                Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = page < 3 ? i : page - 2 + i;
                if (pg >= totalPages) return null;
                return (
                  <button key={pg} onClick={() => setPage(pg)} className={`w-7 h-7 text-xs rounded-md transition-colors ${pg === page ? "bg-amber-500/20 text-amber-300" : " hover:bg-slate-50"}`}>
                    {pg + 1}
                  </button>
                );
              })}
              <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1.5 text-xs  hover: disabled:opacity-30 rounded-md hover:bg-slate-50 transition-colors">
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
        <DeleteModal isOpen={!!deleteUser} onClose={() => setDeleteUser(null)} onConfirm={handleDelete} title="Remove User" message={`Are you sure you want to permanently remove ${deleteUser.username}? This cannot be undone.`}confirmText="Remove" loading={deleteLoading}/>
      )}
    </div>
  );
}
function RoleBadge({ role }) {
  const map = {
    student: "bg-sky-700/15 text-sky-600 border-sky-700/20",
    teacher: "bg-amber-600/15 text-amber-600 border-amber-600/20",
    admin:   "bg-violet-600/15 text-violet-600 border-violet-600/20",
  };
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${map[role] || map.student}`}>
      {role}
    </span>
  );
}

function StatusDot({ banned }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${banned ? "text-red-600" : "text-emerald-600"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${banned ? "bg-red-600" : "bg-emerald-600"}`} />
      {banned ? "Banned" : "Active"}
    </span>
  );
}

function RowActions({ user, onBan, onReset, onDelete, onRoleChange }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onBan(user)} className={`${user.is_banned ? "text-emerald-600" : "text-amber-600"} cursor-pointer`}>
          {user.is_banned ? <Shield className="h-4 w-4 mr-2" /> : <ShieldOff className="h-4 w-4 mr-2" />}
          {user.is_banned ? "Unban User" : "Ban User"}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onReset(user)} className="cursor-pointer">
          <KeyRound className="h-4 w-4 mr-2" />
          Reset Password
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {["student", "teacher", "admin"].filter((r) => r !== user.role).map((r) => (
          <DropdownMenuItem key={r} onClick={() => onRoleChange(user, r)} className="capitalize cursor-pointer">
            <User className="h-4 w-4 mr-2" />
            Set as {r}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => onDelete(user)} className="text-rose-600 cursor-pointer hover:text-rose-700 hover:bg-rose-50">
          <Trash2 className="h-4 w-4 mr-2" />
          Remove User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
