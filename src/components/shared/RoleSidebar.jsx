import { createElement, useEffect } from "react";
import { NavLink, useLocation } from "react-router";
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
  Sparkles,
  MoreVertical,
  X,
} from "lucide-react";

import { useUIStore } from "../../store/uiStore";
import { useAuthStore } from "../../store/authStore";
import { useAuth } from "../../hooks/useAuth";
import { useTour } from "../../components/tour/TourProvider";

import ThemeSelect from "../common/ThemeSelect";
import NotificationPanel from "../ui/NotificationPanel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#components/ui/dropdown-menu";

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
    ["/courses", "Course Library", BookOpen],
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
  const { startTour } = useTour?.() || {};
  const location = useLocation();

  // Close sidebar drawer automatically after navigating on mobile
  useEffect(() => {
    if (window.innerWidth < 768 && sidebarOpen) {
      toggleSidebar();
    }
  }, [location.pathname]);

  const getTourForRoute = () => {
    const path = location.pathname;
    if (path === `/${role}`) return "home";
    if (path.includes("/projects")) return "projects";
    if (path.includes("/classrooms")) return "classrooms";
    if (path.includes("/lessons")) return "lessons";
    if (path.includes("/tutorials")) return "tutorials";
    if (path.includes("/editor")) return "editor";
    if (path.includes("/settings")) return "settings";
    return null;
  };

  const tourId = getTourForRoute();

  return (
    <>
      {sidebarOpen && (
        <div
          role="presentation"
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out
          /* Mobile Drawer: Slides in from left */
          w-72 max-w-[85vw] ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
          /* Desktop: Docked fixed sidebar */
          md:translate-x-0 md:shadow-none ${sidebarOpen ? "md:w-64" : "md:w-18"}
        `}
      >
        <div className="flex h-16 items-center justify-between px-3 border-b border-sidebar-border/60">
          <div className="flex items-center gap-2 overflow-hidden px-2">
            <img
              src="/anotherlogo.png"
              alt="Logo"
              className={`h-8 max-w-full object-contain ${!sidebarOpen && "hidden md:hidden"}`}
            />
            {!sidebarOpen && (
              <div className="hidden md:flex mx-auto h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                W
              </div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
            className={`hidden md:flex rounded-lg p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors ${
              !sidebarOpen && "md:hidden"
            }`}
          >
            <ChevronLeft className="size-5" />
          </button>

          <button
            onClick={toggleSidebar}
            aria-label="Close sidebar"
            className="flex md:hidden rounded-lg p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div
          className={`hidden md:flex items-center gap-1.5 border-b border-sidebar-border/40 py-2 ${
            sidebarOpen ? "px-4 justify-between" : "flex-col px-2 justify-center"
          }`}
        >
          <div className={`flex items-center gap-1 ${!sidebarOpen && "flex-col"}`}>
            <div className="relative">
              <NotificationPanel />
            </div>

            {tourId && startTour && (
              <button
                onClick={() => startTour(tourId)}
                title="Start page tour"
                className="relative p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-sidebar-accent transition-colors group"
              >
                <Sparkles className="size-5 text-amber-500 animate-pulse" />
                <span className="sr-only">Start interactive tour</span>
              </button>
            )}
          </div>
          {!sidebarOpen && (
            <button
              onClick={toggleSidebar}
              title="Expand sidebar"
              className="rounded-lg p-2 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
            >
              <ChevronRight className="size-5" />
            </button>
          )}

          {sidebarOpen && (
            <div className="scale-90 origin-right">
              <ThemeSelect compact />
            </div>
          )}
        </div>
        <nav
          aria-label={`${role} navigation`}
          className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4"
        >
          {navigation[role]?.map(([path, label, Icon]) => (
            <NavLink
              key={path}
              to={`/${role}${path}`}
              end={!path}
              title={!sidebarOpen ? label : undefined}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                } ${!sidebarOpen && "md:justify-center md:px-2"}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-primary" />
                  )}
                  {createElement(Icon, {
                    className: `size-5 shrink-0 transition-colors ${
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground"
                    }`,
                  })}
                  <span className={`truncate ${!sidebarOpen && "hidden md:hidden"}`}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* 4. Footer & Profile */}
        <div className="border-t border-sidebar-border/60 p-2">
          {!sidebarOpen && (
            <div className="hidden md:flex justify-center pb-2">
              <ThemeSelect iconOnly />
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-sidebar-accent transition-colors ${
                  !sidebarOpen ? "md:justify-center" : "justify-between"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={profile?.avatar_url || "/default-avatar.png"}
                    alt={profile?.username || "Avatar"}
                    className="size-9 rounded-full object-cover ring-1 ring-border shrink-0"
                  />
                  <div className={`min-w-0 flex-1 ${!sidebarOpen && "hidden md:hidden"}`}>
                    <p className="truncate text-sm font-semibold leading-tight text-sidebar-foreground">
                      {profile?.username || "User"}
                    </p>
                    <span className="inline-block rounded bg-primary/10 px-1.5 py-0.2 text-[10px] font-medium uppercase tracking-wider text-primary">
                      {role}
                    </span>
                  </div>
                </div>
                {sidebarOpen && (
                  <MoreVertical className="size-4 shrink-0 text-muted-foreground" />
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side={sidebarOpen ? "top" : "right"}
              align={sidebarOpen ? "end" : "start"}
              className="w-56"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{profile?.username}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <NavLink to={`/${role}/settings`} className="flex items-center gap-2 cursor-pointer w-full">
                    <Settings className="size-4" />
                    <span>Account Settings</span>
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to={`/${role}/help`} className="flex items-center gap-2 cursor-pointer w-full">
                    <HelpCircle className="size-4" />
                    <span>Help & Support</span>
                  </NavLink>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={handleSignOut}
                className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="size-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
}
