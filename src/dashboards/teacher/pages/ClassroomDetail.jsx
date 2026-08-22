import { AppBreadcrumb } from "#components/common/breadcrumb";
import { LessonChip } from "#components/common/LessonChip";
import { Button } from "#components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "#components/ui/dropdown-menu";
import { useClassroom } from "#hooks/useClassroom";
import { useCurriculum } from "#hooks/useCurriculum";
import { useTeacherOverview } from "#hooks/useTeacherOverview";
import { useAuthStore } from "@/store/authStore";
import { useCopyCode } from "@/utils/copyCode";
import { formatTimeAgo } from "@/utils/dateFormat";
import { Activity, BookOpen, ClipboardCheck, FlaskConical, GraduationCap, Loader2, Megaphone, MonitorPlay, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

const lessonIcons = {
  lecture:    <BookOpen className="w-6 h-6" />,
  quiz:       <ClipboardCheck className="w-6 h-6" />,
  tutorial:   <MonitorPlay className="w-6 h-6" />,
  laboratory: <FlaskConical className="w-6 h-6" />,
}
const dropdownItems = [
  {title: 'Lecture',    icon:BookOpen,        to:'/teacher/lecture/create'   },
  {title: 'Quiz',       icon:ClipboardCheck,  to:'/teacher/quiz/create'      },
  {title: 'Tutorial',   icon:MonitorPlay,     to:'/teacher/tutorial/create'  },
  {title: 'Laboratory', icon:FlaskConical,    to:'/teacher/laboratory/create'},
]
const tabs = [
  { id: 'activities', label: 'Activities', icon: Activity },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'grades', label: 'Grades', icon: GraduationCap },
  { id: 'students', label: 'Students', icon: Users },
]
export default function ClassroomDetail() {
  const navigate = useNavigate();
  const { classroomId } = useParams();
  const profile = useAuthStore((s) => s.profile);
  const [activeTab, setActiveTab] = useState('activities');
  const {copied, copyCode} = useCopyCode()

  const { currentClassroom, detailLoading, classroomPosts, fetchClassroomDetail, fetchClassroomPosts, handleCreatePost } = useClassroom();

  const { classroomCourse, topics, loading: curriculumLoading, assigning, masterCourses, fetchMasterCourses, handleAssignCourse, fetchClassroomCurriculum, handleUnlockTopic, handleCreateTopic } = useCurriculum();

  const { stats, studentProgress, lessonCompletion, loading: overviewLoading, fetchOverview } = useTeacherOverview();

  useEffect(() => {
    if (!classroomId) return
    fetchClassroomDetail(classroomId)
    fetchClassroomCurriculum(classroomId)
    fetchOverview(classroomId)
    fetchClassroomPosts(classroomId)
    fetchMasterCourses()
  }, [classroomId]);

  const onAddWeek = async () => {
    if (!classroomCourse) {
      toast.error('Assign a curriculum first before adding weeks.')
      return
    }
    const title = window.prompt('Title for the new week?')
    if (!title) return
    await handleCreateTopic(classroomId, classroomCourse.course_id, { title, description: '' })
  }

  const onNewAnnouncement = async () => {
    const content = window.prompt('Announcement text?')
    if (!content) return
    await handleCreatePost({ classroomId, type: 'announcement', content })
  }

  const initialLoading = detailLoading && !currentClassroom;
  const announcements = classroomPosts.filter((p) => p.type === 'announcement');
  const recentActivity = classroomPosts.filter((p) => p.type !== 'announcement').slice(0, 4);

  if (initialLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
      </div>
    )
  }

  return(
    <div className="p-6 space-y-6">
      <AppBreadcrumb
        items={[
          { label: 'Home', href: '/teacher/' },
          { label: 'Classrooms', href: '/teacher/classrooms' },
          { label: currentClassroom?.name ?? 'Classroom', href: `/teacher/classrooms/${classroomId}` },
        ]}
      />
      <section className="relative overflow-hidden rounded-3xl border border-border border-b-4 border-b-slate-400 shadow bg-[url('/teacher_banner.png')] bg-cover bg-center p-8 text-sky-800">
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-balance md:text-4xl">
              {currentClassroom?.name}
            </h1>
            <p className="mt-3 max-w-lg text-pretty text-sm text-muted-foreground md:text-base">
              {classroomCourse
                ? <>Cloned from <span className="text-foreground">{classroomCourse.courses?.title}</span>. Edit topics freely — changes stay in this classroom.</>
                : "No curriculum assigned yet."}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <img src={currentClassroom?.teacher?.avatar_url || "/default-avatar.png"} alt="teacher picture" className="w-10 h-10 rounded-full object-cover object-center" />
              <div>
                <p className="text-sm font-semibold text-gray-600">{currentClassroom?.teacher?.username}</p>
                <p className="text-xs border border-cyan-700 bg-cyan-50 text-cyan-500 rounded-full px-2 w-fit">Teacher</p>
              </div>
            </div>
          </div>
          <div className="flex items-end gap-3 rounded-xl border border-border/60 bg-card/70 px-4 py-3 backdrop-blur shadow">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Join code
              </p>
              <p className="mt-1 font-display text-2xl font-semibold">
                {currentClassroom?.join_code}
              </p>
            </div>
            {copied
            ? <Button onClick={() => ( copyCode(currentClassroom?.join_code || ''))} title="copy join code" className="rounded-md text-xs px-1">
                Code copied
              </Button>
            : <Button onClick={() => ( copyCode(currentClassroom?.join_code || ''))} title="copy join code" className="rounded-md text-xs px-1">
                Copy Invite
              </Button>
          }
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Students" value={stats?.studentCount ?? '—'} sub="enrolled" />
        <StatCard label="AVG. Progress" value={`${stats?.avgProgressPct ?? 0}%`} sub="across topics" progress={stats?.avgProgressPct ?? 0} />
        <StatCard label="Active Topics" value={`${stats?.unlockedTopics ?? 0}/${stats?.totalTopics ?? 0}`} sub="unlocked" />
        <StatCard label="Pending" value={stats?.pendingSubmissions ?? 0} sub="in-progress quizzes" accent />
      </section>

      <div className="border-b border-border">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative
                  ${isActive 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {activeTab === 'activities' && (
        <section className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Curriculum</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onAddWeek}>Add</Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default" size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create New
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-auto min-w-0">
                    {dropdownItems.map(({ title, to, icon: Icon }) => (
                      <DropdownMenuItem key={title} className="gap-2 hover:cursor-pointer" onClick={() => navigate(to)}>
                        <Icon className="w-4 h-4" />
                        {title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
 
            {!classroomCourse && !curriculumLoading && (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-3">
                <p className="font-medium">This classroom doesn't have a curriculum yet.</p>
                <p className="text-sm text-muted-foreground">Pick one from the library — it'll be cloned into this classroom so you can edit it freely.</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button disabled={assigning}>{assigning ? 'Setting up…' : 'Assign Curriculum'}</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center">
                    {masterCourses.map((c) => (
                      <DropdownMenuItem key={c.id} onClick={() => handleAssignCourse(classroomId, c.id, c.title)}>
                        {c.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
 
            {curriculumLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
              </div>
            )}
 
            {!curriculumLoading && topics.length > 0 && (
              <ol className="space-y-4">
                {topics.map((t, i) => (
                  <li
                    key={t.id}
                    className={`rounded-2xl border border-b-4 p-6 transition-colors border-b-slate-400 ${
                      t.isUnlocked
                        ? "border-border bg-card"
                        : "border-border bg-card/50 opacity-40"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`grid size-10 place-items-center rounded-lg font-mono text-sm font-semibold ${
                            t.isUnlocked
                              ? "bg-primary/15 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {t.isUnlocked ? String(i + 1).padStart(2, "0") : "🔒"}
                        </div>
                        <div>
                          <h3 className="font-display text-lg font-semibold">{t.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                        </div>
                      </div>
                    </div>
 
                    <div className="mt-5 grid gap-2 sm:grid-cols-2">
                      {t.lessons.map((l) => {
                        const pct = lessonCompletion[l.id] ?? 0
                        return (
                          <div
                            key={l.id}
                            className="flex items-center gap-3 rounded-xl border border-border bg-background/50 px-3 py-2.5"
                          >
                            <LessonChip type={l.type} size="sm" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{l.title}</p>
                              <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                                <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                            <span className="font-mono text-[10px] text-muted-foreground">{pct}%</span>
                          </div>
                        )
                      })}
                    </div>
 
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                      <span>
                        Class-wide unlock:{" "}
                        <span className="text-foreground">
                          {t.isUnlocked
                            ? "all lessons available"
                            : "waiting on students to finish previous topic"}
                        </span>
                      </span>
                      {t.isUnlocked ? (
                        <button
                          className="rounded-md border border-border px-2 py-1 hover:bg-surface-hover"
                          onClick={() => navigate(`/teacher/topics/${t.id}/edit`)}
                        >
                          Edit
                        </button>
                      ) : (
                        <button
                          className="rounded-md border border-border px-2 py-1 hover:bg-surface-hover"
                          onClick={() => handleUnlockTopic(t.id, t.title)}
                        >
                          Force unlock
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <aside className="space-y-4">
            <div className="rounded-2xl border border-b-3 shadow border-border border-b-slate-400 bg-card p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">Student progress</h3>
                <button className="text-xs text-primary hover:underline" onClick={() => setActiveTab('students')}>View all</button>
              </div>
              <ul className="mt-4 space-y-3">
                {overviewLoading && studentProgress.length === 0 && (
                  <li className="flex justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
                  </li>
                )}
                {studentProgress.slice(0, 5).map((s) => (
                  <li key={s.studentId} className="flex items-center gap-3">
                    <img src={s.avatarUrl || "/default-avatar.png"} alt={s.username} className="w-8 h-8 rounded-full object-cover object-center" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate font-medium">{s.username}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">{s.progressPct}%</span>
                      </div>
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${s.progressPct}%` }} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-b-3 shadow border-border border-b-slate-400 bg-card p-5">
              <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">Recent Activity</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {recentActivity.length === 0 && (
                  <li className="text-xs text-muted-foreground">No recent activity yet.</li>
                )}
                {recentActivity.map((post) => (
                  <ActivityItem
                    key={post.id}
                    tone={post.type === 'quiz_scored' ? 'success' : post.type === 'laboratory_completed' ? 'primary' : 'muted'}
                    name={post.author?.username ?? 'A student'}
                    verb=""
                    thing={post.content}
                    when={formatTimeAgo(post.created_at)}
                  />
                ))}
              </ul>
            </div>
          </aside>
        </section>
      )}
 
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Announcements</h2>
            <Button size="sm" className="gap-2" onClick={onNewAnnouncement}>
              <Megaphone className="w-4 h-4" />
              New Announcement
            </Button>
          </div>
          <div className="grid gap-4">
            {announcements.length === 0 && (
              <p className="text-sm text-muted-foreground">No announcements yet.</p>
            )}
            {announcements.map((post) => (
              <div key={post.id} className="rounded-2xl border border-b-4 border-border border-b-slate-400 bg-card p-6">
                <div className="flex items-start justify-between">
                  <p className="text-sm text-muted-foreground">
                    Posted by {post.author?.username ?? 'Teacher'} • {formatTimeAgo(post.created_at)}
                  </p>
                </div>
                <p className="mt-3 text-sm">{post.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
 
      {activeTab === 'grades' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Grades</h2>
          </div>
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Per-assessment grade breakdown (quiz-by-quiz, lab-by-lab) isn't wired up yet —
            it needs its own reporting query on top of quiz_attempts. Ask and I'll build it next.
          </div>
        </div>
      )}
 
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Students</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {studentProgress.length === 0 && !overviewLoading && (
              <p className="text-sm text-muted-foreground">No students enrolled yet — share the join code.</p>
            )}
            {studentProgress.map((s) => (
              <div key={s.studentId} className="rounded-2xl border border-b-4 border-border border-b-slate-400 bg-card p-5">
                <div className="flex items-center gap-4">
                  <img src={s.avatarUrl || "/default-avatar.png"} alt="student" className="w-12 h-12 rounded-full object-cover object-center" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{s.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Level {s.currentLevel}</span>
                      <span className="text-xs text-muted-foreground">Progress: {s.progressPct}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({label, value, sub, progress, accent}){
  return(
    <div className={`shadow border-b-4 rounded-2xl border p-5 ${
        accent
          ? "border-primary/40 bg-linear-to-br from-primary/15 to-transparent"
          : "border-border border-b-slate-400 bg-card"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className={`mt-2 font-display text-3xl font-black ${accent ? "text-primary-glow" : ""}`}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      {typeof progress === "number" && (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-blue-300 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}
function ActivityItem({ name, verb, thing, when, tone }) {
  const dot =
    tone === "success" ? "bg-green-700"
    : tone === "warning" ? "bg-amber-500"
    : tone === "muted" ? "bg-muted-foreground"
    : "bg-primary";
  return (
    <li className="flex items-start gap-3">
      <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${dot}`} />
      <p className="min-w-0 flex-1">
        <span className="font-medium">{name}</span>{" "}
        <span className="text-muted-foreground">{verb}</span>{" "}
        <span className="font-medium">{thing}</span>
        <span className="ml-2 text-[11px] text-muted-foreground">{when}</span>
      </p>
    </li>
  );
}