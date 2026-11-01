import { useEffect, useState } from "react";
import {
  Users,
  CalendarDays,
  Clock3,
  CheckCircle2,
  XCircle,
  ClipboardList,
  RefreshCw,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import adminService from "../../services/adminService";

const statistics = [
  {
    key: "totalUsers",
    label: "Total Users",
    icon: Users,
    description: "Registered accounts",
    color: "bg-blue-50 text-blue-700",
  },
  {
    key: "totalEvents",
    label: "Total Events",
    icon: CalendarDays,
    description: "All events",
    color: "bg-purple-50 text-purple-700",
  },
  {
    key: "pendingEvents",
    label: "Pending Approvals",
    icon: Clock3,
    description: "Awaiting review",
    color: "bg-amber-50 text-amber-700",
  },
  {
    key: "approvedEvents",
    label: "Approved Events",
    icon: CheckCircle2,
    description: "Approved by admin",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    key: "rejectedEvents",
    label: "Rejected Events",
    icon: XCircle,
    description: "Rejected submissions",
    color: "bg-red-50 text-red-700",
  },
  {
    key: "totalRegistrations",
    label: "Registrations",
    icon: ClipboardList,
    description: "Event registrations",
    color: "bg-indigo-50 text-indigo-700",
  },
];

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await adminService.getDashboard();

      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Unable to load dashboard statistics.",
        );
      }

      setDashboard(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load dashboard statistics.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <DashboardLayout
      role="admin"
      title="Admin Dashboard"
      user={JSON.parse(localStorage.getItem("user") || "null")}
    >
      {/* Page heading */}
      <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-purple-600">
            University Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Overview
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Monitor campus events, manage approvals, and keep track of
            university participation from one place.
          </p>
        </div>

        <Button variant="secondary" onClick={fetchDashboard} disabled={loading}>
          <span className="inline-flex items-center gap-2">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </span>
        </Button>
      </section>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-semibold text-red-800">
              Dashboard could not be loaded
            </p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>

          <Button onClick={fetchDashboard} disabled={loading}>
            Try Again
          </Button>
        </div>
      )}

      {/* Statistics */}
      <section aria-label="Dashboard statistics">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Campus at a glance
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Current statistics from your university database.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {statistics.map((item) => {
            const Icon = item.icon;
            const value = dashboard?.[item.key];

            return (
              <Card key={item.key}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {item.label}
                    </p>

                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                      {loading
                        ? "—"
                        : typeof value === "number"
                          ? value.toLocaleString()
                          : "—"}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      {item.description}
                    </p>
                  </div>

                  <div className={`rounded-xl p-3 ${item.color}`}>
                    <Icon size={22} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Dashboard information */}
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-purple-50 p-3 text-purple-700">
            <CalendarDays size={24} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Event management
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Review event submissions and manage approved university
              activities. We'll connect the approval queue and event management
              table to your existing APIs next.
            </p>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default AdminDashboard;
