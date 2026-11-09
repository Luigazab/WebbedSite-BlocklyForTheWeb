import { useEffect, useState } from "react";
import { Link } from "react-router";
import { supabase } from "../../supabaseClient";
import { useAuthStore } from "../../store/authStore";
import { 
  ArrowUpRight, 
  Activity, 
  BookOpen, 
  ClipboardCheck, 
  Flag, 
  GraduationCap, 
  RefreshCcw, 
  School, 
  Users, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  TrendingUp, 
  Inbox, 
  AlertCircle 
} from "lucide-react";
import StatCard from "../common/StatCard";
import { Button } from "../ui/button";

/* ---------- helpers ---------- */

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, { 
        month: "short", 
        day: "numeric", 
        hour: "numeric", 
        minute: "2-digit" 
      })
    : "—";

const percent = (done, total) => 
  total ? Math.max(0, Math.min(100, Math.round((100 * done) / total))) : 0;

/* ---------- building blocks ---------- */

function Panel({ title, description, icon: Icon, action, children, className = "" }) {
  return (
    <section className={`flex min-w-0 flex-col rounded-2xl border border-border bg-card p-5 shadow-xs transition-shadow sm:p-6 ${className}`}>
      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Icon size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold tracking-tight text-foreground">{title}</h2>
            {description && (
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      <div className="flex-1 flex flex-col">{children}</div>
    </section>
  );
}

function Empty({ icon: Icon = Inbox, children }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/10 px-5 py-8 text-center">
      <Icon className="size-6 text-muted-foreground/60 mb-2" />
      <p className="text-xs text-muted-foreground max-w-xs">{children}</p>
    </div>
  );
}

function Avatar({ name }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold uppercase text-primary border border-primary/20"
    >
      {(name ?? "?").charAt(0)}
    </span>
  );
}

function ActivityRow({ as: Tag = "div", name, title, meta, badge, ...props }) {
  return (
    <Tag
      className="group flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-all hover:border-primary/40 hover:bg-muted/20"
      {...props}
    >
      <Avatar name={name} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </p>
        <p className="truncate text-[11px] text-muted-foreground mt-0.5">{meta}</p>
      </div>
      {badge && <div className="shrink-0">{badge}</div>}
    </Tag>
  );
}

function LoadingState({ statCount = 4 }) {
  return (
    <div aria-busy="true" aria-label="Loading dashboard" className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: statCount }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-card border border-border" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="h-80 animate-pulse rounded-2xl bg-card border border-border lg:col-span-2" />
        <div className="h-80 animate-pulse rounded-2xl bg-card border border-border" />
      </div>
    </div>
  );
}

const STAT_CONFIG = {
  teacher: [
    { label: "Classrooms", icon: School, iconClassName: "bg-sky-500/10 text-sky-600" },
    { label: "Students", icon: Users, iconClassName: "bg-violet-500/10 text-violet-600" },
    { label: "Labs awaiting review", icon: ClipboardCheck, iconClassName: "bg-amber-500/10 text-amber-600" },
  ],
  admin: [
    { label: "Students", icon: Users, iconClassName: "bg-violet-500/10 text-violet-600" },
    { label: "Teachers", icon: GraduationCap, iconClassName: "bg-emerald-500/10 text-emerald-600" },
    { label: "Classrooms", icon: School, iconClassName: "bg-sky-500/10 text-sky-600" },
    { label: "Course templates", icon: BookOpen, iconClassName: "bg-indigo-500/10 text-indigo-600" },
    { label: "Open reports", icon: Flag, iconClassName: "bg-rose-500/10 text-rose-600" },
  ],
};

const QUICK_ACTIONS = {
  teacher: [
    { to: "/teacher/classrooms", label: "Manage classrooms", variant: "formalPrimary" },
    { to: "/teacher/projects", label: "My projects", variant: "formalPlain" },
  ],
  admin: [
    { to: "/admin/users", label: "Manage accounts", variant: "formalPrimary" },
    { to: "/admin/courses", label: "Course templates", variant: "formalPlain" },
    { to: "/admin/reports", label: "Review reports", variant: "formalPlain" },
  ],
};

/* ---------- Teacher Sections ---------- */

function TeacherLayout({ data }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Classrooms Progress Panel */}
      <Panel
        title="My Classrooms"
        description="Overall learning activity progress across published modules."
        icon={School}
        action={
          <Button variant="ghost" size="sm" asChild className="text-xs h-7 gap-1">
            <Link to="/teacher/classrooms">
              View all <ChevronRight className="size-3" />
            </Link>
          </Button>
        }
        className="lg:col-span-2"
      >
        {!data.classrooms.length ? (
          <Empty icon={School}>Your classrooms will appear here once created.</Empty>
        ) : (
          <div className="grid gap-3.5 sm:grid-cols-2">
            {data.classrooms.map((c) => {
              const pct = percent(c.completed, c.possible);
              return (
                <Link
                  key={c.id}
                  to={`/teacher/classrooms/${c.id}`}
                  className="group flex flex-col justify-between rounded-xl border border-border bg-background p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                        {c.name}
                      </h3>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {pct}%
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {c.students} {c.students === 1 ? "student" : "students"} enrolled
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${c.name} completion`}
                      className="h-2 w-full overflow-hidden rounded-full bg-muted"
                    >
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Panel>

      {/* Laboratory Review Queue */}
      <Panel
        title="Laboratory Review Queue"
        description="Open a submission to review code and submit grades."
        icon={ClipboardCheck}
        action={
          data.queue.length > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
              {data.queue.length} pending
            </span>
          )
        }
        className="lg:row-span-2"
      >
        {!data.queue.length ? (
          <Empty icon={CheckCircle2}>
            You’re all caught up! No laboratories are currently awaiting review.
          </Empty>
        ) : (
          <div className="max-h-[580px] space-y-2.5 overflow-y-auto pr-1">
            {data.queue.map((q) => (
              <ActivityRow
                key={q.id}
                as={Link}
                to={`/teacher/classrooms/${q.classroom_id}?tab=gradebook&student=${q.student_id}`}
                name={q.username}
                title={q.title}
                meta={`${q.username} · ${formatDate(q.submitted_at)}`}
                badge={
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded border border-amber-500/20">
                    Review
                  </span>
                }
              />
            ))}
          </div>
        )}
      </Panel>

      {/* Recent Submissions Feed */}
      <Panel
        title="Recent Submissions"
        description="Real-time activity milestones from your active students."
        icon={Activity}
        className="lg:col-span-2"
      >
        {!data.recent.length ? (
          <Empty icon={Activity}>Recent student submissions will appear here.</Empty>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {data.recent.map((r, i) => (
              <ActivityRow
                key={i}
                name={r.username}
                title={r.title}
                meta={`${r.username} · ${formatDate(r.submitted_at)}`}
              />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

/* ---------- Admin Sections ---------- */

const MONTHS_SHOWN = 6;

function toMonthly(signups, months = MONTHS_SHOWN) {
  const byMonth = new Map();
  for (const s of (signups || [])) {
    const key = String(s.day).slice(0, 7);
    byMonth.set(key, (byMonth.get(key) ?? 0) + Number(s.users));
  }
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return {
      key,
      label: d.toLocaleString(undefined, { month: "short" }),
      users: byMonth.get(key) ?? 0,
      current: i === months - 1,
    };
  });
}

function SignupChart({ months }) {
  const max = Math.max(1, ...months.map((m) => m.users));
  return (
    <div className="flex flex-col justify-end h-60 pt-4">
      <ul className="flex items-end justify-between gap-3 sm:gap-6 h-full px-2">
        {months.map((m) => {
          const heightPercent = Math.max(8, Math.round((m.users / max) * 100));
          return (
            <li
              key={m.key}
              className="group flex flex-1 flex-col items-center gap-2 h-full justify-end"
            >
              <span className="text-xs font-mono font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                {m.users}
              </span>
              <div className="w-full flex-1 flex items-end">
                <div className="w-full h-full bg-muted/40 rounded-t-xl overflow-hidden flex items-end p-0.5">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      m.current 
                        ? "bg-primary/70 group-hover:bg-primary" 
                        : "bg-primary group-hover:brightness-110"
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
              </div>
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-0.5">
                {m.label}
                {m.current && <span className="text-primary text-[10px]">*</span>}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="text-[11px] text-muted-foreground text-right mt-3">
        * Current month still ongoing
      </p>
    </div>
  );
}

function CourseActivityTable({ courses = [] }) {
  const headers = [
    { label: "Course Template", align: "text-left" },
    { label: "Published Lessons", align: "text-right" },
    { label: "Completions", align: "text-right" },
    { label: "Quiz Attempts", align: "text-right" },
    { label: "Quiz Avg", align: "text-right" },
    { label: "Reviewed Labs", align: "text-right" },
    { label: "Lab Avg", align: "text-right" },
  ];
  const pct = (v) => (v == null ? "—" : `${v}%`);

  return (
    <Panel
      title="Course Template Activity"
      description="Aggregated learning metrics across both template courses and cloned classroom copies."
      icon={BookOpen}
      className="lg:col-span-3"
    >
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[760px] text-sm text-left">
          <thead className="bg-muted/40 text-xs text-muted-foreground border-b border-border">
            <tr>
              {headers.map((h) => (
                <th key={h.label} className={`px-4 py-3 font-semibold ${h.align}`}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {courses.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-xs text-muted-foreground">
                  No course performance data recorded yet.
                </td>
              </tr>
            ) : (
              courses.map((c, i) => (
                <tr key={i} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{c.title}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{c.published_lessons}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-foreground">{c.completions}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{c.quiz_attempts}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      c.quiz_average >= 75 ? "bg-emerald-500/10 text-emerald-600" : "text-muted-foreground"
                    }`}>
                      {pct(c.quiz_average)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{c.reviewed_labs}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      c.lab_average >= 75 ? "bg-emerald-500/10 text-emerald-600" : "text-muted-foreground"
                    }`}>
                      {pct(c.lab_average)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function AdminLayout({ data, analytics }) {
  const months = toMonthly(data.signups);
  const totalSignups = months.reduce((sum, m) => sum + m.users, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {analytics && <CourseActivityTable courses={data.courses} />}

      {/* Signups Chart */}
      <Panel
        title="Account Registrations"
        description={`Past ${MONTHS_SHOWN} months · ${totalSignups.toLocaleString()} total verified sign-ups.`}
        icon={Users}
        action={
          <Button variant="ghost" size="sm" asChild className="text-xs h-7 gap-1">
            <Link to="/admin/users">
              All accounts <ChevronRight className="size-3" />
            </Link>
          </Button>
        }
        className="lg:col-span-2"
      >
        {totalSignups ? (
          <SignupChart months={months} />
        ) : (
          <Empty icon={Users}>No account registrations recorded in this period.</Empty>
        )}
      </Panel>

      {/* Reports Panel */}
      <Panel
        title="Community Reports"
        description="Latest bug reports and feedback submitted by users."
        icon={Flag}
        action={
          <Button variant="ghost" size="sm" asChild className="text-xs h-7 gap-1">
            <Link to="/admin/reports">
              View all <ChevronRight className="size-3" />
            </Link>
          </Button>
        }
      >
        {!data.reports.length ? (
          <Empty icon={CheckCircle2}>No reports currently submitted.</Empty>
        ) : (
          <div className="max-h-72 space-y-2.5 overflow-y-auto pr-1">
            {data.reports.map((r) => {
              const isOpen = r.status === "open";
              return (
                <Link
                  key={r.id}
                  to="/admin/reports"
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:border-primary/40 hover:bg-muted/20"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {r.title || r.type || "Untitled Report"}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {formatDate(r.created_at)}
                    </p>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    isOpen 
                      ? "bg-amber-500/10 text-amber-600 border-amber-500/20" 
                      : "bg-muted text-muted-foreground border-border"
                  }`}>
                    {r.status?.replace("_", " ")}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </Panel>

      {/* Lesson Completions Feed */}
      <Panel
        title="Recent Lesson Completions"
        description="Learning milestones completed across active classrooms."
        icon={GraduationCap}
        className="lg:col-span-3"
      >
        {!data.recent_completions?.length ? (
          <Empty icon={GraduationCap}>No lesson completions recorded yet.</Empty>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {data.recent_completions?.map((r, i) => (
              <ActivityRow
                key={i}
                name={r.classroom ?? r.title}
                title={r.title}
                meta={`${r.classroom ?? "Learning activity"} · ${
                  r.completed_at ? formatDate(r.completed_at) : "Legacy completion"
                }`}
              />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

/* ---------- Main Dashboard Page ---------- */

export default function StaffDashboard({ analytics = false }) {
  const role = useAuthStore((s) => s.profile?.role);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let active = true;
    setIsRefreshing(true);
    supabase
      .rpc("release_dashboard")
      .then(({ data: resData, error: resError }) => {
        if (!active) return;
        if (resError) {
          setError(resError.message);
        } else {
          setError("");
          setData(resData);
        }
      })
      .finally(() => {
        if (active) setIsRefreshing(false);
      });

    return () => {
      active = false;
    };
  }, [retry]);

  const isTeacher = role === "teacher";
  const stats = STAT_CONFIG[role] ?? [];
  const actions = QUICK_ACTIONS[role] ?? [];

  return (
    /* Full-fluid container with max-w-[1600px] cap for wide monitors */
    <main className="wide-container">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              {analytics ? "Platform Analytics" : isTeacher ? "Teacher Overview" : "Admin Operations"}
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {role || "Staff"}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {isTeacher
              ? "Monitor student lab submissions, track classroom progress, and review activity."
              : "Live health status of learning materials, registrations, and submitted tickets."}
          </p>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {actions.map((a) => (
            <Button key={a.to} asChild variant={a.variant} size="sm" className="text-xs gap-1.5">
              <Link to={a.to}>
                {a.label} <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            </Button>
          ))}
          <Button
            variant="formalPlain"
            size="icon"
            aria-label="Refresh dashboard"
            onClick={() => setRetry((n) => n + 1)}
            disabled={isRefreshing}
            className="size-8"
          >
            <RefreshCcw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true" />
          </Button>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs text-destructive font-medium"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>Could not load dashboard data: {error}</span>
          </div>
          <Button variant="formalPlain" size="sm" onClick={() => setRetry((n) => n + 1)} className="text-xs h-7">
            Try again
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {!data && !error && <LoadingState statCount={stats.length || 3} />}

      {/* Loaded Dashboard Content */}
      {data && (
        <>
          {/* Key Metric Stat Cards */}
          <section
            aria-label="Dashboard statistics"
            className={`grid gap-4 ${
              isTeacher 
                ? "grid-cols-1 sm:grid-cols-3" 
                : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
            }`}
          >
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                {...stat}
                value={data.counts?.[stat.label] ?? "0"}
                iconVariant="badge"
              />
            ))}
          </section>

          {/* Teacher or Admin Role View */}
          {isTeacher ? (
            <TeacherLayout data={data} />
          ) : (
            <AdminLayout data={data} analytics={analytics} />
          )}
        </>
      )}
    </main>
  );
}