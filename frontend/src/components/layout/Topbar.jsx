import { Search, Bell, UserRound } from "lucide-react";

function Topbar({ title, user }) {
  return (
    <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4 lg:px-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back{user?.name ? `, ${user.name}` : ""}!
        </p>
      </div>

      <div className="flex items-center gap-3">
        <label className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 sm:flex">
          <Search size={18} className="text-slate-400" />
          <input
            type="search"
            placeholder="Search..."
            aria-label="Search"
            className="w-36 bg-transparent text-sm outline-none placeholder:text-slate-400 lg:w-48"
          />
        </label>

        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
        >
          <Bell size={19} />
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-700">
          <UserRound size={20} />
        </div>
      </div>
    </header>
  );
}

export default Topbar;
