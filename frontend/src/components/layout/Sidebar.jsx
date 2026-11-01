import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  PlusCircle,
  CheckCircle,
  Users,
  Settings,
  GraduationCap,
} from "lucide-react";

const navigation = {
  student: [
    { label: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
    { label: "Explore Events", path: "/student/events", icon: CalendarDays },
    { label: "My Events", path: "/student/my-events", icon: ClipboardList },
  ],
  faculty: [
    { label: "Dashboard", path: "/faculty/dashboard", icon: LayoutDashboard },
    { label: "Create Event", path: "/faculty/create-event", icon: PlusCircle },
    { label: "My Events", path: "/faculty/my-events", icon: CalendarDays },
  ],
  admin: [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "All Events", path: "/admin/events", icon: CalendarDays },
    { label: "Pending Approvals", path: "/admin/approvals", icon: CheckCircle },
    { label: "Users", path: "/admin/users", icon: Users },
    { label: "Settings", path: "/admin/settings", icon: Settings },
  ],
};

function Sidebar({ role = "student" }) {
  const links = navigation[role] ?? navigation.student;
  console.log(
    "Sidebar role:",
    role,
    "Links:",
    links.map((link) => link.path),
  );

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-5 py-6">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600 text-white">
          <GraduationCap size={25} />
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-900">UniEvents</h1>
          <p className="text-xs text-slate-500">Campus Life, Connected</p>
        </div>
      </div>

      <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Menu
      </p>

      <nav className="flex flex-col gap-2">
        {links.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-purple-50 text-purple-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-xl bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-800">
          University Events
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Discover what's happening across your campus.
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
