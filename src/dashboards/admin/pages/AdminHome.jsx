import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Users, BookOpen, Layout, FolderKanban, GraduationCap,
  TrendingUp, Activity, AlertCircle, ChevronRight,
  ArrowUpRight, ArrowDownRight, Layers, Trophy
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { supabase } from "../../../supabaseClient";

// ─── Tiny helpers ──────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, trend, trendLabel, color = "amber", loading }) {
  const colors = {
    amber:  { bg: "bg-amber-50",   icon: "text-amber-500",  border: "border-amber-100" },
    sky:    { bg: "bg-sky-50",     icon: "text-sky-500",    border: "border-sky-100"   },
    violet: { bg: "bg-violet-50",  icon: "text-violet-500", border: "border-violet-100"},
    emerald:{ bg: "bg-emerald-50", icon: "text-emerald-500",border: "border-emerald-100"},
    rose:   { bg: "bg-rose-50",    icon: "text-rose-500",   border: "border-rose-100"  },
    orange: { bg: "bg-orange-50",  icon: "text-orange-500", border: "border-orange-100"},
  };
  const c = colors[color];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4 hover:border-gray-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center`}>
          <Icon size={16} className={c.icon} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
            {trend >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        {loading ? (
          <div className="h-7 w-20 bg-gray-100 rounded animate-pulse mb-1" />
        ) : (
          <p className="text-gray-900 text-2xl font-bold tracking-tight">{value?.toLocaleString() ?? "—"}</p>
        )}
        <p className="text-gray-500 text-xs mt-0.5">{label}</p>
        {trendLabel && <p className="text-gray-400 text-[11px] mt-1">{trendLabel}</p>}
      </div>
    </div>
  );
}

function ActivityRow({ action, user, time, badge, badgeColor }) {
  const colors = { amber: "bg-amber-50 text-amber-700", sky: "bg-sky-50 text-sky-700", emerald: "bg-emerald-50 text-emerald-700", rose: "bg-rose-50 text-rose-600", violet: "bg-violet-50 text-violet-700" };
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-[11px] font-bold shrink-0">
        {user?.[0]?.toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-700 text-xs truncate"><span className="text-gray-900 font-medium">{user}</span> {action}</p>
        <p className="text-gray-400 text-[11px]">{time}</p>
      </div>
      {badge && <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 capitalize ${colors[badgeColor] || colors.sky}`}>{badge}</span>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg">
        <p className="text-gray-500 text-[11px] mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} className="text-gray-800 text-sm font-semibold">{p.name}: <span className="text-amber-600">{p.value}</span></p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function AdminHome() {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [openFeedback, setOpenFeedback] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [
          { count: totalUsers },
          { count: totalStudents },
          { count: totalTeachers },
          { count: totalLessons },
          { count: totalClassrooms },
          { count: totalProjects },
          { count: totalTutorials },
          { count: totalQuizzes },
          { count: openCount },
          { data: recentProfiles },
          { data: feedbackItems },
        ] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
          supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "teacher"),
          supabase.from("lessons").select("*", { count: "exact", head: true }),
          supabase.from("classrooms").select("*", { count: "exact", head: true }),
          supabase.from("projects").select("*", { count: "exact", head: true }),
          supabase.from("tutorials").select("*", { count: "exact", head: true }),
          supabase.from("quizzes").select("*", { count: "exact", head: true }),
          supabase.from("feedback").select("*", { count: "exact", head: true }).eq("status", "open"),
          supabase.from("profiles").select("id,username,role,created_at,avatar_url").order("created_at", { ascending: false }).limit(6),
          supabase.from("feedback").select("id,title,category,status,created_at,profiles(username)").eq("status", "open").order("created_at", { ascending: false }).limit(5),
        ]);

        setStats({ totalUsers, totalStudents, totalTeachers, totalLessons, totalClassrooms, totalProjects, totalTutorials, totalQuizzes, openCount });
        setRecentUsers(recentProfiles || []);
        setOpenFeedback(feedbackItems || []);

        // Fake weekly signups chart (last 7 months)
        const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
        setChartData(months.map((m, i) => ({
          month: m,
          Students: Math.floor(Math.random() * 80 + 20 + i * 12),
          Teachers: Math.floor(Math.random() * 10 + 2 + i * 1.5),
        })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const timeAgo = (ts) => {
    const s = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  const roleColors = { student: "sky", teacher: "violet", admin: "amber" };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4">
      <h1 className="text-lg sm:text-xl font-bold text-gray-900">
        Overview
      </h1>
      {/* Stats Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Accounts" value={stats?.totalUsers} icon={Users} trend={12} trendLabel="vs last month" color="amber" loading={loading} />
        <StatCard label="Students" value={stats?.totalStudents} icon={GraduationCap} trend={15} color="sky" loading={loading} />
        <StatCard label="Teachers" value={stats?.totalTeachers} icon={Users} trend={4} color="violet" loading={loading} />
        <StatCard label="Open Reports" value={stats?.openCount} icon={AlertCircle} trend={-8} color="rose" loading={loading} />
      </div>

      {/* Stats Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Lessons Created" value={stats?.totalLessons} icon={BookOpen} color="emerald" loading={loading} />
        <StatCard label="Active Classrooms" value={stats?.totalClassrooms} icon={Layout} color="amber" loading={loading} />
        <StatCard label="Projects" value={stats?.totalProjects} icon={FolderKanban} color="orange" loading={loading} />
        <StatCard label="Tutorials" value={stats?.totalTutorials} icon={Layers} color="violet" loading={loading} />
      </div>

      {/* Chart + Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-gray-900 text-sm font-semibold">User Growth</h3>
              <p className="text-gray-400 text-xs mt-0.5">New registrations per month</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-gray-400"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Students</span>
              <span className="flex items-center gap-1.5 text-gray-400"><span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />Teachers</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gTeachers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Students" stroke="#f59e0b" strokeWidth={2} fill="url(#gStudents)" />
              <Area type="monotone" dataKey="Teachers" stroke="#a78bfa" strokeWidth={2} fill="url(#gTeachers)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Users */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 text-sm font-semibold">Recent Sign-ups</h3>
            <Link to="/admin/users" className="text-amber-600 text-xs hover:text-amber-500 flex items-center gap-0.5 font-medium">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="flex-1 space-y-0">
            {loading
              ? Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-100">
                    <div className="w-7 h-7 rounded-full bg-gray-100 animate-pulse" />
                    <div className="flex-1 space-y-1">
                      <div className="h-2.5 w-24 bg-gray-100 rounded animate-pulse" />
                      <div className="h-2 w-16 bg-gray-100 rounded animate-pulse" />
                    </div>
                  </div>
                ))
              : recentUsers.map((u) => (
                  <ActivityRow
                    key={u.id}
                    user={u.username}
                    action="joined"
                    time={timeAgo(u.created_at)}
                    badge={u.role}
                    badgeColor={roleColors[u.role]}
                  />
                ))}
          </div>
        </div>
      </div>

      {/* Open Feedback */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-gray-900 text-sm font-semibold">Open Feedback</h3>
            <p className="text-gray-400 text-xs mt-0.5">Requires attention</p>
          </div>
          <Link to="/admin/feedback" className="text-amber-600 text-xs hover:text-amber-500 flex items-center gap-0.5 font-medium">
            View all <ChevronRight size={12} />
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-10 bg-gray-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : openFeedback.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">No open reports</p>
        ) : (
          <div className="space-y-2">
            {openFeedback.map((f) => {
              const catColors = { bug: "bg-rose-50 text-rose-600", lesson: "bg-sky-50 text-sky-600", account: "bg-violet-50 text-violet-600", general: "bg-amber-50 text-amber-700", other: "bg-gray-100 text-gray-500" };
              const c = catColors[f.category] || catColors.general;
              return (
                <div key={f.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100">
                  <AlertCircle size={14} className="text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700 text-xs font-medium truncate">{f.title}</p>
                    <p className="text-gray-400 text-[11px]">by {f.profiles?.username} · {timeAgo(f.created_at)}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 capitalize ${c}`}>{f.category}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}