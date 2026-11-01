import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function DashboardLayout({ role, title, user, children }) {
  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <Sidebar role={role} />

      <div className="min-w-0 flex-1">
        <Topbar title={title} user={user} />

        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
