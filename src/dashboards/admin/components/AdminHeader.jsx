import { useLocation } from "react-router";
import { Bell, Search } from "lucide-react";

const PAGE_META = {
  "/admin": { title: "Overview", desc: "Platform at a glance" },
  "/admin/users": { title: "User Management", desc: "Manage accounts, roles, and access" },
  "/admin/engagement": { title: "Engagement", desc: "Platform usage and activity metrics" },
  "/admin/content": { title: "Content", desc: "Lessons, tutorials, quizzes & projects" },
  "/admin/feedback": { title: "Feedback & Reports", desc: "Student and teacher submitted reports" },
  "/admin/settings": { title: "Settings", desc: "Platform configuration and preferences" },
};

export default function AdminHeader() {
  const { pathname } = useLocation();
  const meta = PAGE_META[pathname] || { title: "Admin", desc: "" };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-white sticky top-0 z-10">
      <div>
        <h1 className="text-gray-900 text-[15px] font-semibold leading-none">{meta.title}</h1>
        <p className="text-gray-400 text-xs mt-1 leading-none">{meta.desc}</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-52 focus-within:border-amber-400 transition-colors">
          <Search size={13} className="text-gray-400 shrink-0" />
          <input
            placeholder="Search..."
            className="bg-transparent text-gray-700 text-xs placeholder:text-gray-400 outline-none flex-1 min-w-0"
          />
        </div>

        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">
          <Bell size={15} className="text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
        </button>
      </div>
    </header>
  );
}