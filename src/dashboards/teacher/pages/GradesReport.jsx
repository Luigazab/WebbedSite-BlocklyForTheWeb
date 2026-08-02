/**
 * TODO: Integrate dynamic data through hooks -> services & stores
 * NOTE: UI styling good July 24, 2026
 */
import { AppBreadcrumb } from "#components/common/breadcrumb";
import StatCard from "#components/common/StatCard";
import { Button } from "#components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "#components/ui/dropdown-menu";
import { Activity, BookOpen, BookOpenCheck, ChevronDown, ClipboardCheck, Filter, FlaskConical, FolderKanban, MonitorPlay, Plus, Search, Tag, X } from "lucide-react";
import { useState } from "react";

const dropdownItems = [
  { value:'filter',         label: 'Filter',           icon:Filter,        },
  { value:'course',         label: 'By Course',        icon:FolderKanban,  },
  { value:'activity type',  label: 'By Activity Type', icon:Activity,      },
  { value:'name',           label: 'By Name',          icon:Tag,           },
  { value:'grade',          label: 'By Grade',         icon:BookOpenCheck, },
]

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

const cols = ["Lecture 1", "Quiz 1", "Tutorial 1", "Lab 1", "Quiz 2", "Lab 2"];

export default function GradesReport() {
  const [ search, setSearch ] = useState('');
  const [ filterCategory, setFilterCategory ] = useState('all');
  return (
    <div className="space-y-6 p-6">
      <AppBreadcrumb
        items={[
          { label: 'Home', href: '/teacher/' },
          { label: 'Grades', href: '/teacher/grades' },
        ]}
      />
      <div className="flex flex-col gap-4 md:flex-row justify-between items-end">
        <div>
          <h2 className="font-display text-2xl font-semibold">Gradebook</h2>
          <p className="mt-1 text-sm text-muted-foreground">Live scores from quizzes and labs.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="default">Export CSV</Button>
        </div>
      </div>
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Quiz" value="2" sub="above 85% progress" imageSrc='/quiz_icon.png'/>
        <StatCard label="Tutorial" value="4" sub="of the students" imageSrc='/learn_web.png'/>
        <StatCard label="Laboratory" value="3" sub="below 50% of progress" imageSrc='/computer.svg'/>
        <StatCard label="Average" value="20" sub="enrolled" progress={60} accent imageSrc='/svggrade.svg'/>
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
                  {filterCategory === "all" ? "Filter" : filterCategory}
                </span>
                <ChevronDown size={14} className="text-slate-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-40">
              {dropdownItems.map(({ value, label, icon: Icon }) => (
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
              {cols.map((c) => (
                <th key={c} className="px-4 py-3 whitespace-nowrap">{c}</th>
              ))}
              <th className="px-4 py-3 whitespace-nowrap">Avg</th>
            </tr>
          </thead>
          <tbody className="">
            {students.map((s) => {
              const scores = cols.map((_, i) => 
                Math.min(100, 55 + ((s.avatarSeed.charCodeAt(0) + i * 7) % 45))
              );
              const avg = Math.round(scores.reduce((n, v) => n + v, 0) / scores.length);
              
              return (
                <tr key={s.id} className="hover:bg-surface-hover/40">
                  <td className="px-6 py-3 font-medium whitespace-nowrap">{s.name}</td>
                  {scores.map((v, i) => (
                    <td 
                      key={i} 
                      className={`px-4 py-3 font-mono whitespace-nowrap ${
                        v >= 85 ? "text-emerald-500" : v >= 65 ? "text-foreground" : "text-destructive"
                      }`}
                    >
                      {v}
                    </td>
                  ))}
                  <td className="px-4 py-3 font-mono font-semibold whitespace-nowrap">{avg}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}