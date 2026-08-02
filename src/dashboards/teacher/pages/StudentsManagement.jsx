/**
 * TODO: Integrate dynamic data through hooks -> services & stores
 * NOTE: UI styling good July 24, 2026
 */
import { AppBreadcrumb } from "#components/common/breadcrumb";
import StatCard from "#components/common/StatCard";
import { Button } from "#components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "#components/ui/dropdown-menu";
import { ChevronDown, ChevronsUp, Clock, Filter, Search, TriangleAlert, Users, X } from "lucide-react";
import { useState } from "react";

const students = [
  { id: "s1", name: "Liam Henderson", email: "liam.h@lumina.edu", avatarSeed: "LH", progress: 92, lastActive: "2 min ago", streak: 12, status: "ahead" },
  { id: "s2", name: "Sofia Valeri", email: "sofia.v@lumina.edu", avatarSeed: "SV", progress: 45, lastActive: "1 hr ago", streak: 3, status: "at-risk" },
  { id: "s3", name: "Marcus Thorne", email: "marcus.t@lumina.edu", avatarSeed: "MT", progress: 78, lastActive: "Yesterday", streak: 7, status: "on-track" },
  { id: "s4", name: "Elena Kostic", email: "elena.k@lumina.edu", avatarSeed: "EK", progress: 88, lastActive: "5 min ago", streak: 15, status: "ahead" },
  { id: "s5", name: "Julian Gray", email: "julian.g@lumina.edu", avatarSeed: "JG", progress: 61, lastActive: "3 hr ago", streak: 4, status: "on-track" },
  { id: "s6", name: "Amara Okafor", email: "amara.o@lumina.edu", avatarSeed: "AO", progress: 33, lastActive: "2 days ago", streak: 0, status: "at-risk" },
  { id: "s7", name: "Kenji Nakamura", email: "kenji.n@lumina.edu", avatarSeed: "KN", progress: 71, lastActive: "40 min ago", streak: 9, status: "on-track" },
  { id: "s8", name: "Priya Shah", email: "priya.s@lumina.edu", avatarSeed: "PS", progress: 84, lastActive: "20 min ago", streak: 11, status: "on-track" },
];

const FILTER = [
  { value: 'all',      label: 'All Students',   icon: Users },
  { value: 'ahead',    label: 'Ahead',          icon: ChevronsUp },
  { value: 'on track',  label: 'On track',        icon: Clock           },
  { value: 'at risk',  label: 'At risk',        icon: TriangleAlert      },
]


export default function StudentsManagement() {
  const [ search, setSearch ] = useState('');
  const [ filterCategory, setFilterCategory ] = useState('all');
  return (
    <div className="space-y-6 p-6">
      <AppBreadcrumb
        items={[
          { label: 'Home', href: '/teacher/' },
          { label: 'Students', href: '/teacher/students' },
        ]}
      />
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-display text-2xl font-semibold">Students</h2>
          <p className="mt-1 text-sm text-muted-foreground">Global roster of students across your classrooms.</p>
        </div>
        <Button variant="default">Export CSV</Button>
      </div>
      
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Students" value="20" sub="enrolled" icon={Users} />
        <StatCard label="Ahead" value="2" sub="above 85% progress" icon={ChevronsUp} />
        <StatCard label="On track" value="4" sub="of the students" icon={Clock} />
        <StatCard label="At risk" value="3" sub="below 50% of progress" accent icon={TriangleAlert} />
      </section>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2.5 flex-1 min-w-48 shadow focus-within:border-sky-500/30 transition-colors!">
          <Search className="shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, sender, or message..."
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
            <DropdownMenuTrigger asChild className="min-w-40 justify-between">
              <button className="flex shadow items-center gap-2 px-3 py-2.5 bg-white border border-border rounded-lg hover:bg-slate-50 transition-colors">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="capitalize">
                  {filterCategory === "all" ? "All Students" : filterCategory}
                </span>
                <ChevronDown size={14} className="text-slate-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-40">
              {FILTER.map(({ value, label, icon: Icon }) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => setFilterCategory(value)}
                  className={`capitalize ${
                    filterCategory === value
                      ? "bg-blockly-blue/10 text-blockly-blue"
                      : ""
                  }`}
                >
                  <Icon size={13}/>
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card border-b-4 border-b-slate-400">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground">
              <th className="px-6 py-3">Student</th>
              <th className="px-6 py-3">Progress</th>
              <th className="px-6 py-3">Streak</th>
              <th className="px-6 py-3">Last active</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-surface-hover/50">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid size-8 place-items-center rounded-full bg-muted text-[11px] font-medium">
                      {s.avatarSeed}
                    </div>
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-[11px] text-muted-foreground">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
                      <div 
                        className={`h-full ${
                          s.status === "at-risk" 
                            ? "bg-destructive" 
                            : s.status === "ahead" 
                            ? "bg-emerald-500" 
                            : "bg-primary"
                        }`} 
                        style={{ width: `${s.progress}%` }} 
                      />
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{s.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-3 text-muted-foreground">🔥 {s.streak}d</td>
                <td className="px-6 py-3 text-muted-foreground">{s.lastActive}</td>
                <td className="px-6 py-3">
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ring-1 ring-inset ${
                    s.status === "at-risk" 
                      ? "bg-destructive/15 text-destructive ring-destructive/25" 
                      : s.status === "ahead" 
                      ? "bg-emerald-500/15 text-emerald-500 ring-emerald-500/25" 
                      : "bg-primary/15 text-primary ring-primary/25"
                  }`}>
                    {s.status.replace("-", " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}