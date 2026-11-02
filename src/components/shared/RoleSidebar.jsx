import { createElement } from "react";
import { NavLink } from "react-router";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Users,
  BookOpen,
  Bug,
  BarChart3,
  Folders,
  Settings,
  GraduationCap,
  LogOut,
  HelpCircle,
  EllipsisVertical,
} from "lucide-react";
import { useUIStore } from "../../store/uiStore";
import { useAuthStore } from "../../store/authStore";
import { useAuth } from "../../hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "#components/ui/dropdown-menu";

const navigation = {
  admin: [
    ["", "Overview", Home],
    ["/users", "Users", Users],
    ["/courses", "Course Templates", BookOpen],
    ["/reports", "Reports", Bug],
    ["/analytics", "Analytics", BarChart3],
  ],
  teacher: [
    ["", "Home", Home],
    ["/classrooms", "Classrooms", GraduationCap],
    ["/projects", "My Projects", Folders],
  ],
  student: [
    ["", "Home", Home],
    ["/classrooms", "My Classrooms", GraduationCap],
    ["/projects", "My Projects", Folders],
  ],
};
export default function RoleSidebar({ role }) {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const profile = useAuthStore((s) => s.profile);
  const { handleSignOut } = useAuth();
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all! ${sidebarOpen ? (role === "admin" ? "w-64" : "w-75") : "w-16"}`}
    >
      <div className="flex items-center gap-2 px-3 py-8">
        {sidebarOpen && (
          <img src="/anotherlogo.png" alt="WebbedSite" className="h-12" />
        )}
        <button
          aria-label="Toggle navigation"
          onClick={toggleSidebar}
          className="ml-auto rounded p-2 hover:bg-slate-100"
        >
          {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
        </button>
      </div>
      <nav
        aria-label={`${role} navigation`}
        className={`flex-1 space-y-3 overflow-y-auto ${sidebarOpen ? "px-3" : "px-2"}`}
      >
        {navigation[role].map(([path, label, Icon]) => (
          <NavLink
            key={path}
            to={`/${role}${path}`}
            end={!path}
            title={label}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-3 shadow border font-semibold ${isActive ? "bg-sidebar-primary text-sidebar-primary-foreground border-sidebar-primary" : "bg-sidebar border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"}`
            }
          >
            {createElement(Icon, { className: "size-6 shrink-0" })}
            {sidebarOpen && label}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-1 p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center justify-between rounded-md py-2 shadow border font-semibold bg-sidebar border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent">
              <div className="flex gap-3 items-center ">
                <img
                  src={profile?.avatar_url || "/default-avatar.png"}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                {sidebarOpen && <div>
                  <h5>{profile?.username || ""}</h5>
                  <p className="badge bg-primary/50 text-primary-foreground w-fit">
                    {role}
                  </p>
                </div> }
              </div>
              {sidebarOpen && <EllipsisVertical/>}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              {[
                ["settings", "Account Settings", Settings],
                ["help", "Help & Report an Issue", HelpCircle],
              ].map(([path, label, Icon]) => (
                <DropdownMenuItem>
                  <NavLink
                    key={path}
                    to={`/${role}/${path}`}
                    title={label}
                    className="flex gap-3 w-full"
                  >
                    {createElement(Icon, { className: "size-5 shrink-0" })}
                    { label}
                  </NavLink>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem variant="destructive">
                <button
                  onClick={handleSignOut}
                  title="Sign out"
                  className="flex gap-3 w-full"
                >
                  <LogOut className="size-5 shrink-0" />
                  { "Sign out"}
                </button>
              </DropdownMenuItem>
              <DropdownMenuLabel>{profile?.email}</DropdownMenuLabel>

            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
