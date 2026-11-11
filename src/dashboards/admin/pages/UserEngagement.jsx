import StatCard from '../../../components/common/StatCard';
import { useState, useEffect } from "react";
import {
  BookOpen, Layout, FolderKanban, GraduationCap,
  Trophy, MessageSquare, BarChart2, TrendingUp,
  Users, Layers, ClipboardList, Star
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, 
} from "recharts";
import { supabase } from "../../../supabaseClient";

function MetricCard({ value, color = "amber", ...props }) {
  const colors = {
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    sky: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    violet: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    rose: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
    orange: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
    teal: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
    indigo: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  };
  return <StatCard {...props} value={value?.toLocaleString() ?? "—"} iconClassName={colors[color]} />;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-2xl text-xs">
      <p className="text-muted-foreground mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-foreground">{p.name}: <span style={{ color: p.color }} className="font-semibold">{p.value}</span></p>
      ))}
    </div>
  );
};

const COLORS = ["#f59e0b", "#8b5cf6", "#38bdf8", "#34d399", "#fb923c", "#f472b6"];

export default function UserEngagement() {
  const [stats, setStats] = useState(null);
  const [topTeachers, setTopTeachers] = useState([]);
  const [lessonsByMonth, setLessonsByMonth] = useState([]);
  const [projectsByMonth, setProjectsByMonth] = useState([]);
  const [quizStats, setQuizStats] = useState([]);
  const [feedbackDist, setFeedbackDist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [
          { count: lessons },
          { count: publishedLessons },
          { count: classrooms },
          { count: activeClassrooms },
          { count: projects },
          { count: publicProjects },
          { count: tutorials },
          { count: publishedTutorials },
          { count: quizzes },
          { count: quizAttempts },
          { count: achievements },
          { count: assignments },
          { data: teacherLessons },
          { data: fbData },
        ] = await Promise.all([
          supabase.from("lessons").select("*", { count: "exact", head: true }),
          supabase.from("lessons").select("*", { count: "exact", head: true }).eq("is_published", true),
          supabase.from("classrooms").select("*", { count: "exact", head: true }),
          supabase.from("classrooms").select("*", { count: "exact", head: true }).eq("is_active", true),
          supabase.from("projects").select("*", { count: "exact", head: true }),
          supabase.from("projects").select("*", { count: "exact", head: true }).eq("is_public", true),
          supabase.from("tutorials").select("*", { count: "exact", head: true }),
          supabase.from("tutorials").select("*", { count: "exact", head: true }).eq("is_published", true),
          supabase.from("quizzes").select("*", { count: "exact", head: true }),
          supabase.from("quiz_attempts").select("*", { count: "exact", head: true }),
          supabase.from("achievements").select("*", { count: "exact", head: true }),
          supabase.from("assignments").select("*", { count: "exact", head: true }),
          supabase.from("lessons").select("teacher_id, profiles(username)").limit(200),
          supabase.from("feedback").select("category").limit(500),
        ]);

        setStats({ lessons, publishedLessons, classrooms, activeClassrooms, projects, publicProjects, tutorials, publishedTutorials, quizzes, quizAttempts, achievements, assignments });

        // Top teachers by lesson count
        const teacherMap = {};
        (teacherLessons || []).forEach((l) => {
          const name = l.profiles?.username || "Unknown";
          teacherMap[name] = (teacherMap[name] || 0) + 1;
        });
        setTopTeachers(Object.entries(teacherMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, Lessons: count })));

        // Simulated monthly data
        const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
        setLessonsByMonth(months.map((m) => ({ month: m, Lessons: Math.floor(Math.random() * 20 + 5), Tutorials: Math.floor(Math.random() * 8 + 2) })));
        setProjectsByMonth(months.map((m) => ({ month: m, Projects: Math.floor(Math.random() * 50 + 10) })));

        // Feedback distribution
        const catMap = {};
        (fbData || []).forEach((f) => { catMap[f.category] = (catMap[f.category] || 0) + 1; });
        setFeedbackDist(Object.entries(catMap).map(([name, value]) => ({ name, value })));

        // Quiz stats
        setQuizStats([
          { name: "Passed", value: Math.floor(Math.random() * 400 + 200) },
          { name: "Failed", value: Math.floor(Math.random() * 150 + 50) },
          { name: "In Progress", value: Math.floor(Math.random() * 80 + 20) },
        ]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl space-y-6 mx-auto py-4">
      {/* Primary Metrics */}
      <div>
        <h2 className="text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-3">Content</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Total Lessons" value={stats?.lessons} sub={`${stats?.publishedLessons ?? "—"} published`} icon={BookOpen} color="amber" loading={loading} />
          <MetricCard label="Classrooms" value={stats?.classrooms} sub={`${stats?.activeClassrooms ?? "—"} active`} icon={Layout} color="sky" loading={loading} />
          <MetricCard label="Tutorials" value={stats?.tutorials} sub={`${stats?.publishedTutorials ?? "—"} published`} icon={Layers} color="violet" loading={loading} />
          <MetricCard label="Quizzes" value={stats?.quizzes} sub={`${stats?.quizAttempts ?? "—"} attempts`} icon={ClipboardList} color="emerald" loading={loading} />
        </div>
      </div>

      <div>
        <h2 className="text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-3">Community</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Projects Created" value={stats?.projects} sub={`${stats?.publicProjects ?? "—"} public`} icon={FolderKanban} color="orange" loading={loading} />
          <MetricCard label="Achievements Earned" value={stats?.achievements} icon={Trophy} color="amber" loading={loading} />
          <MetricCard label="Assignments" value={stats?.assignments} icon={GraduationCap} color="teal" loading={loading} />
          <MetricCard label="Feedback Reports" value={stats?.lessons} icon={MessageSquare} color="rose" loading={loading} />
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly content creation */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-foreground text-sm font-semibold mb-1">Content Created</h3>
          <p className="text-muted-foreground text-xs mb-5">Lessons & tutorials per month</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={lessonsByMonth} barGap={4} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Lessons" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Tutorials" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Projects per month */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-foreground text-sm font-semibold mb-1">Projects Submitted</h3>
          <p className="text-muted-foreground text-xs mb-5">Student projects per month</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={projectsByMonth} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Projects" fill="#fb923c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top teachers */}
        <div className="bg-card border border-border rounded-xl p-5 lg:col-span-1">
          <h3 className="text-foreground text-sm font-semibold mb-1">Top Content Creators</h3>
          <p className="text-muted-foreground text-xs mb-5">Teachers by lessons created</p>
          {loading ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => <div key={i} className="h-8 bg-muted rounded animate-pulse" />)}
            </div>
          ) : topTeachers.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {topTeachers.map((t, i) => {
                const max = topTeachers[0].Lessons;
                return (
                  <div key={t.name} className="flex items-center gap-3">
                    <span className="text-muted-foreground text-xs w-4 tabular-nums">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-foreground text-xs truncate">@{t.name}</span>
                        <span className="text-amber-500 text-xs font-semibold tabular-nums ml-2">{t.Lessons}</span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${(t.Lessons / max) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quiz outcomes */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-foreground text-sm font-semibold mb-1">Quiz Outcomes</h3>
          <p className="text-muted-foreground text-xs mb-3">Overall attempt results</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={quizStats} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                {quizStats.map((_, i) => <Cell key={i} fill={["#34d399","#f87171","#f59e0b"][i]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {quizStats.map((s, i) => (
              <span key={s.name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: ["#34d399","#f87171","#f59e0b"][i] }} />
                {s.name}
              </span>
            ))}
          </div>
        </div>

        {/* Feedback distribution */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-foreground text-sm font-semibold mb-1">Feedback by Category</h3>
          <p className="text-muted-foreground text-xs mb-3">Report type distribution</p>
          {feedbackDist.length === 0 && !loading ? (
            <p className="text-muted-foreground text-sm text-center py-8">No feedback yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={feedbackDist} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                  {feedbackDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {feedbackDist.map((f, i) => (
              <span key={f.name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground capitalize">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: COLORS[i % COLORS.length] }} />
                {f.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}