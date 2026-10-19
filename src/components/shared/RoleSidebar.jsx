import { createElement } from 'react'
import { NavLink } from 'react-router'
import { ChevronLeft, ChevronRight, Home, Users, BookOpen, Bug, BarChart3, Folders, Settings, GraduationCap, LogOut, HelpCircle } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'
import { useAuth } from '../../hooks/useAuth'

const navigation = {
  admin: [['', 'Overview', Home], ['/users', 'Users', Users], ['/courses', 'Course Templates', BookOpen], ['/reports', 'Reports', Bug], ['/analytics', 'Analytics', BarChart3]],
  teacher: [['', 'Home', Home], ['/classrooms', 'Classrooms', GraduationCap], ['/projects', 'My Projects', Folders]],
  student: [['', 'Home', Home], ['/classrooms', 'My Classrooms', GraduationCap], ['/projects', 'My Projects', Folders]],
}
export default function RoleSidebar({ role }) {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const profile = useAuthStore(s => s.profile)
  const { handleSignOut } = useAuth()
  return <aside className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r bg-white transition-all ${sidebarOpen ? role === 'admin' ? 'w-64' : 'w-75' : 'w-16'}`}>
    <div className="flex items-center gap-2 px-3 py-8">{sidebarOpen && <img src="/anotherlogo.png" alt="WebbedSite" className="h-12" />}<button aria-label="Toggle navigation" onClick={toggleSidebar} className="ml-auto rounded p-2 hover:bg-slate-100">{sidebarOpen ? <ChevronLeft /> : <ChevronRight />}</button></div>
    <nav aria-label={`${role} navigation`} className="flex-1 space-y-1 overflow-y-auto px-2">{navigation[role].map(([path, label, Icon]) => <NavLink key={path} to={`/${role}${path}`} end={!path} title={label} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 font-semibold ${isActive ? 'bg-indigo-100 text-indigo-950' : 'text-slate-600 hover:bg-slate-100'}`}>{createElement(Icon,{className:'size-6 shrink-0'})}{sidebarOpen && label}</NavLink>)}</nav>
    <div className="space-y-1 border-t p-2">{[['settings', 'Account Settings', Settings], ['help', 'Help & Report an Issue', HelpCircle]].map(([path, label, Icon]) => <NavLink key={path} to={`/${role}/${path}`} title={label} className="flex items-center gap-3 rounded-lg p-3 text-sm text-slate-700 hover:bg-slate-100">{createElement(Icon,{className:'size-5 shrink-0'})}{sidebarOpen && label}</NavLink>)}<button onClick={handleSignOut} title="Sign out" className="flex w-full items-center gap-3 rounded-lg p-3 text-sm text-slate-700 hover:bg-slate-100"><LogOut className="size-5 shrink-0" />{sidebarOpen && 'Sign out'}</button>{sidebarOpen && <p className="truncate px-3 py-2 text-xs text-slate-500">{profile?.username} · {role}</p>}</div>
  </aside>
}
