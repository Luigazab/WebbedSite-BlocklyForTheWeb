import { useEffect, useState } from "react";
import { Link } from "react-router";
import { supabase } from "../../supabaseClient";
import { useAuthStore } from "../../store/authStore";
import { ArrowUpRight, Activity, BookOpen, ClipboardCheck, Flag, GraduationCap, RefreshCcw, School, Users } from "lucide-react";
import StatCard from "../common/StatCard";
import { Button } from "../ui/button";

/* ---------- helpers ---------- */

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : "—";

const percent = (done, total) => (total ? Math.max(0, Math.min(100, Math.round((100 * done) / total))) : 0);

/* ---------- building blocks ---------- */

function Panel({ title, description, icon: Icon, children, className = "" }) {
  return (
    <section className={`flex min-w-0 flex-col rounded-2xl border bg-card p-4 shadow-sm sm:p-6 ${className}`}>
      <header className="mb-4 flex items-start gap-3">
        <span className="rounded-xl bg-primary/10 p-2.5 text-primary">
          <Icon size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="font-semibold tracking-tight">{title}</h2>
          {description && <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

const rowClass =
  "rounded-xl border border-border bg-background/60 p-3.5 transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Empty({ children }) {
  return (
    <p className="rounded-xl border border-dashed border-border bg-background/60 px-5 py-8 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

function Avatar({ name }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold uppercase text-primary"
    >
      {(name ?? "?").charAt(0)}
    </span>
  );
}

function ActivityRow({ as: Tag = "div", name, title, meta, ...props }) {
  return (
    <Tag className={`${rowClass} flex items-center gap-3`} {...props}>
      <Avatar name={name} />
      <span className="min-w-0 flex-1">
        <span className="truncate text-sm font-medium">{title}</span>
        <span className="truncate text-xs text-muted-foreground">{meta}</span>
      </span>
    </Tag>
  );
}

function LoadingState({ statCount }) {
  return (
    <div aria-busy="true" aria-label="Loading dashboard" className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: statCount }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="h-72 animate-pulse rounded-2xl bg-muted lg:col-span-2" />
        <div className="h-72 animate-pulse rounded-2xl bg-muted" />
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

/* ---------- teacher sections ---------- */

function TeacherLayout({ data }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {/* Main column */}
      <Panel
        title="My classrooms"
        description="Progress across published student activities."
        icon={School}
        className="lg:col-span-2"
      >
        {!data.classrooms.length && <Empty>Your classrooms will appear here once created.</Empty>}
        <div className="grid gap-3 sm:grid-cols-2">
          {data.classrooms.map((c) => {
            const pct = percent(c.completed, c.possible);
            return (
              <Link key={c.id} to={`/teacher/classrooms/${c.id}`} className={rowClass}>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="truncate font-semibold">{c.name}</h3>
                  <span className="text-sm font-semibold tabular-nums">{pct}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${c.name} completion`}
                  className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary/10"
                >
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{c.students} students · activities completed</p>
              </Link>
            );
          })}
        </div>
      </Panel>

      {/* Side column: the thing that needs action */}
      <Panel
        title="Awaiting laboratory review"
        description="Open a submission to review student work."
        icon={ClipboardCheck}
        className="lg:row-span-2"
      >
        <div className="max-h-[560px] space-y-2.5 overflow-y-auto pr-1">
          {!data.queue.length && <Empty>You’re all caught up. No laboratories are awaiting review.</Empty>}
          {data.queue.map((q) => (
            <ActivityRow
              key={q.id}
              as={Link}
              to={`/teacher/classrooms/${q.classroom_id}?tab=gradebook&student=${q.student_id}`}
              name={q.username}
              title={q.title}
              meta={`${q.username} · ${formatDate(q.submitted_at)}`}
            />
          ))}
        </div>
      </Panel>

      <Panel
        title="Recent submissions"
        description="The latest work from your students."
        icon={Activity}
        className="lg:col-span-2"
      >
        {!data.recent.length && <Empty>Student submissions will appear here.</Empty>}
        <div className="grid gap-2.5 md:grid-cols-2">
          {data.recent.map((r, i) => (
            <ActivityRow key={i} name={r.username} title={r.title} meta={`${r.username} · ${formatDate(r.submitted_at)}`} />
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ---------- admin sections ---------- */

const MONTHS_SHOWN = 6;

function toMonthly(signups, months = MONTHS_SHOWN) {
  const byMonth = new Map();
  for (const s of signups) {
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
    <ul className="flex h-52 items-stretch gap-3 sm:gap-5">
      {months.map((m) => (
        <li
          key={m.key}
          title={`${m.label}: ${m.users} new${m.current ? " (so far)" : ""}`}
          className="flex h-full flex-1 flex-col items-center gap-1.5"
        >
          <span className="text-sm font-semibold tabular-nums">{m.users}</span>
          <div className="flex w-full flex-1 items-end">
            <div
              className={`w-full rounded-t-lg ${m.current ? "bg-primary/60" : "bg-primary"}`}
              style={{ height: `${(m.users / max) * 100}%`, minHeight: 4 }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{m.label}{m.current ? "*" : ""}</span>
        </li>
      ))}
    </ul>
  );
}

function CourseActivityTable({ courses }) {
  const headers = [
    ["Course", "text-left"],
    ["Published lessons", "text-right"],
    ["Completions", "text-right"],
    ["Quiz attempts", "text-right"],
    ["Quiz average", "text-right"],
    ["Reviewed labs", "text-right"],
    ["Lab average", "text-right"],
  ];
  const pct = (v) => (v == null ? "—" : `${v}%`);
  return (
    <Panel
      title="Course activity"
      description="Quiz averages use completed attempts; lab averages use currently reviewed submissions. Completion counts are student–lesson records, including classroom copies."
      icon={BookOpen}
      className="lg:col-span-3"
    >
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr>
              {headers.map(([label, align]) => (
                <th key={label} scope="col" className={`px-3 py-2.5 font-medium ${align}`}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {courses.map((c, i) => (
              <tr key={i} className="hover:bg-primary/5">
                <th scope="row" className="px-3 py-2.5 text-left font-medium">{c.title}</th>
                {[c.published_lessons, c.completions, c.quiz_attempts, pct(c.quiz_average), c.reviewed_labs, pct(c.lab_average)].map(
                  (v, j) => (
                    <td key={j} className="px-3 py-2.5 text-right tabular-nums">{v}</td>
                  )
                )}
              </tr>
            ))}
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
    <div className="grid gap-5 lg:grid-cols-3">
      {analytics && <CourseActivityTable courses={data.courses} />}

      <Panel
        title="New accounts"
        description={`Last ${MONTHS_SHOWN} months · ${totalSignups} registrations. *Current month, still in progress. Counts show sign-ups, not active use.`}
        icon={Users}
        className="lg:col-span-2"
      >
        {totalSignups ? <SignupChart months={months} /> : <Empty>No registrations in this period.</Empty>}
      </Panel>

      <Panel title="Recent reports" description="Feedback and issues from your community." icon={Flag}>
        {!data.reports.length && <Empty>No reports yet.</Empty>}
        <div className="max-h-64 space-y-2.5 overflow-y-auto pr-1">
          {data.reports.map((r) => (
            <Link key={r.id} to="/admin/reports" className={rowClass}>
              <span className="truncate text-sm font-medium">{r.title || r.type}</span>
              <span className="text-xs text-muted-foreground">
                {r.status} · {formatDate(r.created_at)}
              </span>
            </Link>
          ))}
        </div>
      </Panel>

      <Panel
        title="Recent lesson completions"
        description="Learning milestones across classrooms."
        icon={GraduationCap}
        className="lg:col-span-3"
      >
        {!data.recent_completions?.length && <Empty>No lesson completions recorded yet.</Empty>}
        <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
          {data.recent_completions?.map((r, i) => (
            <ActivityRow
              key={i}
              name={r.classroom ?? r.title}
              title={r.title}
              meta={`${r.classroom ?? "Learning activity"} · ${r.completed_at ? formatDate(r.completed_at) : "Legacy completion"}`}
            />
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ---------- page ---------- */

export default function StaffDashboard({ analytics = false }) {
  const role = useAuthStore((s) => s.profile?.role);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    supabase.rpc("release_dashboard").then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setError(error.message);
      } else {
        setError("");
        setData(data);
      }
    });
    return () => {
      active = false;
    };
  }, [retry]);

  const isTeacher = role === "teacher";
  const stats = STAT_CONFIG[role] ?? [];
  const actions = QUICK_ACTIONS[role] ?? [];

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">
            {analytics ? "Analytics" : isTeacher ? "Home" : "Overview"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isTeacher
              ? "Your classrooms, reviews, and latest student activity."
              : "A snapshot of your learning community."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {actions.map((a) => (
            <Button key={a.to} asChild variant={a.variant}>
              <Link to={a.to}>
                {a.label} <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </Button>
          ))}
          <Button variant="formalPlain" size="icon" aria-label="Refresh dashboard" onClick={() => setRetry((n) => n + 1)}>
            <RefreshCcw size={18} aria-hidden="true" />
          </Button>
        </div>
      </header>

      {error && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span>Couldn’t load the dashboard: {error}</span>
          <Button variant="formalPlain" onClick={() => setRetry((n) => n + 1)}>Try again</Button>
        </div>
      )}

      {!data && !error && <LoadingState statCount={stats.length || 3} />}

      {data && (
        <>
          <section
            aria-label="Dashboard statistics"
            className={`grid gap-4 ${isTeacher ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"}`}
          >
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} value={data.counts?.[stat.label] ?? "—"} iconVariant="badge" />
            ))}
          </section>

          {isTeacher ? <TeacherLayout data={data} /> : <AdminLayout data={data} analytics={analytics} />}
        </>
      )}
    </main>
  );
}