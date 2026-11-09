import { Outlet, useLocation } from "react-router";
import { Menu, Sparkles } from "lucide-react";
import { useTour } from "#components/tour/TourProvider";
import { useUIStore } from "@/store/uiStore";
import RoleSidebar from "./RoleSidebar";
import NotificationPanel from "#components/ui/NotificationPanel";
import ThemeSelect from "#components/common/ThemeSelect";


export default function RoleLayout({ role, navbar: Navbar }) {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { startTour } = useTour?.() || {};
  const location = useLocation();

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
    <div className="flex h-screen bg-muted overflow-hidden">
      <RoleSidebar role={role} />
      <div
        className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ml-0 ${
          sidebarOpen ? "md:ml-64" : "md:ml-18"
        }`}
      >
        <header className="flex h-14 items-center justify-between border-b border-border bg-sidebar px-3 md:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSidebar}
              aria-label="Open menu"
              className="rounded-lg p-2 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
            >
              <Menu className="size-5" />
            </button>
            <img src="/anotherlogo.png" alt="Logo" className="h-7 object-contain" />
          </div>

          <div className="flex items-center gap-1.5">
            {tourId && startTour && (
              <button
                onClick={() => startTour(tourId)}
                title="Start page tour"
                className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-sidebar-accent transition-colors"
              >
                <Sparkles className="size-5 text-amber-500 animate-pulse" />
                <span className="sr-only">Start tour</span>
              </button>
            )}

            <div className="relative">
              <NotificationPanel />
            </div>

            <div className="scale-90">
              <ThemeSelect iconOnly />
            </div>
          </div>
        </header>
        <main className="wrapper flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}