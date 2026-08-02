import { AppBreadcrumb } from "#components/common/breadcrumb";
import { LessonChip } from "#components/common/LessonChip";
import { Button } from "#components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "#components/ui/dropdown-menu";
import { Activity, BookOpen, ClipboardCheck, FlaskConical, GraduationCap, Megaphone, MonitorPlay, Plus, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

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
const course = {
  id:"c-web",
  title:"Quarter 1",
  description:"The learners demonstrate an understanding of fundamental concepts and principles of syntax and elements in Hyper Text Mark-Up Language (HTML) and the properties and values used in Cascading Style Sheet (CSS) in developing and designing a website.",
  color:"#f97316",
  image_src:"https://ffnjdqoiaywleodqswnp.supabase.co/storage/v1/object/public/system-images/course-images/html_logo.png",
  created_at:"2026-04-28 15:59:04.635748+00",
  slug:"html",
  order:1,
  topics: [
    {
      id:"html-1",
      title:"HTML Fundamentals",
      description:"Discuss the HTML fundamentals: versions, role, web editors, structures and syntax",
      order:1,
      created_at:"2026-04-28 15:59:04.635748+00",
      is_published:true,
      slug:"html-fundamentals",
      is_unlocked:true,
      unlocked_at:null,
      unlocked_by:null,
      lessons: [
        {
          id:"lecture-1",
          author:"",
          title:"HTML introduction",
          type:"lecture",
          updated_at:"",
          created_at:"",
          slug:"",
          order:1,
        },
        {
          id:"lecture-1",
          author:"",
          title:"HTML introduction",
          type:"quiz",
          updated_at:"",
          created_at:"",
          slug:"",
          order:2,
        },
        {
          id:"lecture-1",
          author:"",
          title:"HTML introduction",
          type:"tutorial",
          updated_at:"",
          created_at:"",
          slug:"",
          order:3,
        },
        {
          id:"lecture-1",
          author:"",
          title:"HTML introduction",
          type:"laboratory",
          updated_at:"",
          created_at:"",
          slug:"",
          order:4,
        }
      ]
    },
    {
      id:"html-2",
      title:"HTML Fundamentals",
      description:"Discuss the HTML fundamentals: versions, role, web editors, structures and syntax",
      order:2,
      created_at:"2026-04-28 15:59:04.635748+00",
      is_published:true,
      slug:"html-fundamentals",
      is_unlocked:false,
      unlocked_at:null,
      unlocked_by:null,
      lessons: [
        {
          id:"lecture-1",
          author:"",
          title:"HTML introduction",
          type:"lecture",
          updated_at:"",
          created_at:"",
          slug:"",
          order:1,
        },
        {
          id:"lecture-1",
          author:"",
          title:"HTML introduction",
          type:"quiz",
          updated_at:"",
          created_at:"",
          slug:"",
          order:2,
        },
        {
          id:"lecture-1",
          author:"",
          title:"HTML introduction",
          type:"tutorial",
          updated_at:"",
          created_at:"",
          slug:"",
          order:3,
        },
        {
          id:"lecture-1",
          author:"",
          title:"HTML introduction",
          type:"laboratory",
          updated_at:"",
          created_at:"",
          slug:"",
          order:4,
        }
      ]
    }
  ]
}
const tabs = [
  { id: 'activities', label: 'Activities', icon: Activity },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'grades', label: 'Grades', icon: GraduationCap },
  { id: 'students', label: 'Students', icon: Users },
]
export default function ClassroomDetai() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('activities');
  return(
    <div className="p-6 space-y-6">
      <AppBreadcrumb
        items={[
          { label: 'Home', href: '/teacher/' },
          { label: 'Classrooms', href: '/teacher/classrooms' },
          { label: 'Section Name', href: '/teacher/classroomsdetail/see' },
        ]}
      />
      <section className="relative overflow-hidden rounded-3xl border border-border border-b-4 border-b-slate-400 shadow bg-[url('/teacher_banner.png')] bg-cover bg-center p-8 text-sky-800">
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-balance md:text-4xl">
              ICRT NAME ADFGDF
            </h1>
            <p className="mt-3 max-w-lg text-pretty text-sm text-muted-foreground md:text-base">
              Cloned from <span className="text-foreground">computer programming</span>. Edit topics
              freely — changes stay in this classroom.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <img src="/default-avatar.png" alt="teacher picture" className="w-10 h-10 rounded-full object-cover object-center" />
              <div>
                <p className="text-sm font-semibold text-gray-600">Teacher A. NameLast</p>
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
                ABCDEF
              </p>
            </div>
            <Button className="rounded-md text-xs px-1">
              Copy Invite
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Students" value="20" sub="enrolled"/>
        <StatCard label="AVG. Progress" value="50%" sub="across topics" progress={50}/>
        <StatCard label="Active Topics" value="2/4" sub="unlocked"/>
        <StatCard label="Pending" value="12" sub="submissions" accent/>
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
              <div>
                <Button variant="outline" size="sm">Add</Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default" size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create New
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-auto min-w-0">
                    {dropdownItems.map(({title, to, icon:Icon}) => (
                      <DropdownMenuItem key={title} className="gap-2 hover:cursor-pointer" onClick={() => navigate(to)}>
                        <Icon className="w-4 h-4" />
                        {title}
                      </DropdownMenuItem>  
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <ol className="space-y-4">
              {course.topics.map((t, i) => (
                <li
                  key={t.id}
                  className={`rounded-2xl border border-b-4 p-6 transition-colors border-b-slate-400 ${
                    t.is_unlocked
                      ? "border-border bg-card"
                      : "border-border bg-card/50 opacity-40"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`grid size-10 place-items-center rounded-lg font-mono text-sm font-semibold ${
                          t.is_unlocked
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {t.is_unlocked ? String(i + 1).padStart(2, "0") : "🔒"}
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-semibold">{t.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{t.summary}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {t.lessons.map((l) => (
                      <div
                        key={l.id}
                        className="flex items-center gap-3 rounded-xl border border-border bg-background/50 px-3 py-2.5"
                      >
                        <LessonChip type={l.type} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{l.title}</p>
                          <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${l.completedByPct}%` }}
                            />
                          </div>
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {l.completedByPct}%
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                    <span>
                      Class-wide unlock:{" "}
                      <span className="text-foreground">
                        {t.is_unlocked
                          ? "all lessons available"
                          : "waiting on students to finish previous topic"}
                      </span>
                    </span>
                    <button className="rounded-md border border-border px-2 py-1 hover:bg-surface-hover">
                      {t.is_unlocked ? "Edit" : "Force unlock"}
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <aside className="space-y-4">
            <div className="rounded-2xl border border-b-3 shadow border-border border-b-slate-400 bg-card p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">Student progress</h3>
                <button className="text-xs text-primary hover:underline">View all</button>
              </div>
              <ul className="mt-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <img src="/default-avatar.png" alt="teacher picture" className="w-8 h-8 rounded-full object-cover object-center" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate font-medium">Luisha Gail C. Zaballero</span>
                        <span className="font-mono text-[11px] text-muted-foreground">90%</span>
                      </div>
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                        {/* <div
                          className={`h-full rounded-full ${
                            s.status === "at-risk"
                              ? "bg-destructive"
                              : s.status === "ahead"
                              ? "bg-success"
                              : "bg-primary"
                          }`} */}
                        <div className="h-full rounded-full bg-success bg-primary w-90"/>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-b-3 shadow border-border border-b-slate-400 bg-card p-5">
              <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">Recent Activity</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <ActivityItem tone="primary" name="Julian Gray" verb="submitted" thing="Lab 2" when="4m ago"/>
                <ActivityItem tone="success" name="Gerina Kris" verb="finished" thing="Quiz 2" when="18m ago"/>
                <ActivityItem tone="muted" name="System" verb="unlocked" thing="Topic 2 for all" when="2h ago"/>
                <ActivityItem tone="warning" name="Sofia the first" verb="missed deadline" thing="Tutorial 1" when="Yesterday"/>
              </ul>
            </div>
          </aside>
        </section>
      )}

      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Announcements</h2>
            <Button size="sm" className="gap-2">
              <Megaphone className="w-4 h-4" />
              New Announcement
            </Button>
          </div>
          <div className="grid gap-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="rounded-2xl border border-b-4 border-border border-b-slate-400 bg-card p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold">Important Reminder: Project Deadline</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Posted by Teacher A. NameLast • 2 hours ago
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    New
                  </span>
                </div>
                <p className="mt-3 text-sm">
                  Please remember to submit your HTML projects by Friday. Late submissions will incur a 10% penalty per day.
                </p>
                <div className="mt-4 flex gap-3">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'grades' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Grades</h2>
            <Button size="sm" className="gap-2">
              <GraduationCap className="w-4 h-4" />
              Export Grades
            </Button>
          </div>
          <div className="rounded-2xl border border-b-4 border-border border-b-slate-400 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quiz 1</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lab 1</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quiz 2</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Final</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Average</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">Student {i + 1}</td>
                      <td className="px-4 py-3 text-sm">85%</td>
                      <td className="px-4 py-3 text-sm">92%</td>
                      <td className="px-4 py-3 text-sm">78%</td>
                      <td className="px-4 py-3 text-sm">88%</td>
                      <td className="px-4 py-3 text-sm font-semibold">85.75%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Students</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Invite Students</Button>
              <Button size="sm" className="gap-2">
                <Users className="w-4 h-4" />
                Manage Class
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-b-4 border-border border-b-slate-400 bg-card p-5">
                <div className="flex items-center gap-4">
                  <img src="/default-avatar.png" alt="student" className="w-12 h-12 rounded-full object-cover object-center" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">Student Name {i + 1}</p>
                    <p className="text-xs text-muted-foreground truncate">student{i+1}@email.com</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Active</span>
                      <span className="text-xs text-muted-foreground">Progress: 75%</span>
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
    tone === "success"
      ? "bg-green-700"
      : tone === "warning"
      ? "bg-amber-500"
      : tone === "muted"
      ? "bg-muted-foreground"
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