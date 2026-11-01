import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  UserRound,
  Mail,
  Building2,
  GraduationCap,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import api from "../../services/api";

const roleStyles = {
  admin: "bg-purple-50 text-purple-700",
  faculty: "bg-blue-50 text-blue-700",
  student: "bg-emerald-50 text-emerald-700",
};

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      // This endpoint must exist in the backend.
      const response = await api.get("/admin/users");

      if (!response.data.success) {
        throw new Error(response.data.message || "Unable to load users.");
      }

      const result = response.data.data;

      const userList = Array.isArray(result) ? result : (result?.users ?? []);

      setUsers(userList);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load users. Check whether GET /api/admin/users exists in your backend.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.department?.toLowerCase().includes(query) ||
        user.rollNo?.toLowerCase().includes(query);

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const roleCounts = useMemo(
    () => ({
      all: users.length,
      student: users.filter((user) => user.role === "student").length,
      faculty: users.filter((user) => user.role === "faculty").length,
      admin: users.filter((user) => user.role === "admin").length,
    }),
    [users],
  );

  return (
    <DashboardLayout
      role="admin"
      title="User Management"
      user={JSON.parse(localStorage.getItem("user") || "null")}
    >
      <section className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-purple-600">
          University Administration
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          User Management
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          View university accounts and find students, faculty members, and
          administrators.
        </p>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Users",
            value: roleCounts.all,
            icon: Users,
            color: "bg-purple-50 text-purple-700",
          },
          {
            label: "Students",
            value: roleCounts.student,
            icon: GraduationCap,
            color: "bg-emerald-50 text-emerald-700",
          },
          {
            label: "Faculty",
            value: roleCounts.faculty,
            icon: Building2,
            color: "bg-blue-50 text-blue-700",
          },
          {
            label: "Administrators",
            value: roleCounts.admin,
            icon: UserRound,
            color: "bg-amber-50 text-amber-700",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {loading ? "—" : item.value}
                  </p>
                </div>

                <div className={`rounded-xl p-3 ${item.color}`}>
                  <Icon size={22} />
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              University Accounts
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Search and filter registered accounts.
            </p>
          </div>

          <Button variant="secondary" onClick={fetchUsers} disabled={loading}>
            <span className="inline-flex items-center gap-2">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </span>
          </Button>
        </div>

        <div className="flex flex-col gap-3 p-5 sm:flex-row">
          <label className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-purple-500">
            <Search size={18} className="shrink-0 text-slate-400" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, department, or roll number..."
              aria-label="Search users"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            aria-label="Filter users by role"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-purple-500"
          >
            <option value="all">All roles</option>
            <option value="student">Students</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Administrators</option>
          </select>
        </div>

        {error && (
          <div
            role="alert"
            className="mx-5 mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw
              size={26}
              className="mx-auto animate-spin text-purple-600"
            />

            <p className="mt-4 text-sm text-slate-500">
              Loading university accounts...
            </p>
          </div>
        ) : !error && filteredUsers.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <Users size={30} className="mx-auto text-slate-400" />

            <h3 className="mt-3 font-semibold text-slate-900">
              No users found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or role filter.
            </p>
          </div>
        ) : !error ? (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">User</th>
                    <th className="px-5 py-4 font-semibold">Role</th>
                    <th className="px-5 py-4 font-semibold">Department</th>
                    <th className="px-5 py-4 font-semibold">Roll Number</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 font-semibold text-purple-700">
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900">
                              {user.name || "Unnamed user"}
                            </p>

                            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                              <Mail size={14} />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                            roleStyles[user.role] ||
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {user.department || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {user.rollNo || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="grid grid-cols-1 gap-3 p-4 md:hidden">
              {filteredUsers.map((user) => (
                <article
                  key={user._id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-100 font-semibold text-purple-700">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-semibold text-slate-900">
                        {user.name || "Unnamed user"}
                      </h3>

                      <p className="mt-1 break-all text-sm text-slate-500">
                        {user.email}
                      </p>

                      <span
                        className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          roleStyles[user.role] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {user.role}
                      </span>

                      <p className="mt-3 text-sm text-slate-600">
                        Department: {user.department || "—"}
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Roll number: {user.rollNo || "—"}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : null}

        {!loading && !error && (
          <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}

export default AdminUsers;
