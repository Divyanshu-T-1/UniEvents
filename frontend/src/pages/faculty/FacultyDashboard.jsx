import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Users,
  Clock,
  CheckCircle2,
  Plus,
  RefreshCw,
  ChartNoAxesCombined,
  MapPin,
} from "lucide-react";

import facultyService from "../../services/facultyService";
import DashboardLayout from "../../components/layout/DashboardLayout";

const FacultyDashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    approvedEvents: 0,
    pendingEvents: 0,
    rejectedEvents: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await facultyService.getFacultyDashboardStats();

      if (!response.success) {
        throw new Error(
          response.message || "Unable to load dashboard statistics.",
        );
      }

      setStats(response.data);
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
    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Events",
      value: stats.totalEvents,
      icon: CalendarDays,
      description: "Events you've organized",
    },
    {
      title: "Registrations",
      value: stats.totalRegistrations,
      icon: Users,
      description: "Active event registrations",
    },
    {
      title: "Pending Approval",
      value: stats.pendingEvents,
      icon: Clock,
      description: "Events awaiting approval",
    },
    {
      title: "Approved Events",
      value: stats.approvedEvents,
      icon: CheckCircle2,
      description: "Events approved by admin",
    },
  ];

  const totalCapacity = stats.totalCapacity || 0;

  const overallRegistrationPercentage =
    stats.overallRegistrationPercentage || 0;

  const availableSeats = Math.max(totalCapacity - stats.totalRegistrations, 0);

  return (
    <DashboardLayout role= "faculty" title="Faculty Dashboard">
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-violet-600">
              Faculty Portal
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Faculty Dashboard 
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage your events and monitor student registrations.
            </p>
          </div>

          <Link
            to="/faculty/create-event"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
          >
            <Plus size={18} />
            Create New Event
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-red-700">{error}</p>

            <button
              onClick={fetchStats}
              className="inline-flex items-center gap-2 self-start text-sm font-semibold text-red-700 hover:text-red-900"
            >
              <RefreshCw size={15} />
              Retry
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {card.title}
                    </p>

                    <p className="mt-3 text-3xl font-bold text-slate-900">
                      {loading ? "—" : card.value}
                    </p>
                  </div>

                  <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                    <Icon size={22} />
                  </div>
                </div>

                <p className="mt-4 text-xs text-slate-500">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Event Status */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Event Status Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current status of the events you've organized.
            </p>
          </div>

          {loading ? (
            <p className="py-6 text-sm text-slate-500">
              Loading event statistics...
            </p>
          ) : (
            <div className="space-y-5">
              {[
                {
                  label: "Approved",
                  value: stats.approvedEvents,
                  color: "bg-emerald-500",
                },
                {
                  label: "Pending Approval",
                  value: stats.pendingEvents,
                  color: "bg-amber-500",
                },
                {
                  label: "Rejected",
                  value: stats.rejectedEvents,
                  color: "bg-red-500",
                },
              ].map((item) => {
                const percentage =
                  stats.totalEvents > 0
                    ? (item.value / stats.totalEvents) * 100
                    : 0;

                return (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${item.color}`}
                        />

                        <span className="text-sm font-medium text-slate-700">
                          {item.label}
                        </span>
                      </div>

                      <span className="text-sm font-semibold text-slate-900">
                        {item.value}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Registration Summary */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Users size={22} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">Registration Summary</h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Your events currently have{" "}
                <span className="font-semibold text-slate-900">
                  {loading ? "—" : stats.totalRegistrations}
                </span>{" "}
                active registrations in total.
              </p>
            </div>
          </div>
        </div>

        {/* Registration Capacity Analytics */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Overall Registration Rate */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Registration Capacity
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Overall occupancy across your events
                </p>
              </div>

              <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                <ChartNoAxesCombined size={22} />
              </div>
            </div>

            {loading ? (
              <p className="mt-6 text-sm text-slate-500">
                Loading capacity analytics...
              </p>
            ) : (
              <>
                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <p className="text-4xl font-bold text-slate-900">
                      {overallRegistrationPercentage}%
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      Overall registration rate
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {stats.totalRegistrations} / {totalCapacity}
                    </p>

                    <p className="text-xs text-slate-500">
                      Registered / Capacity
                    </p>
                  </div>
                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-violet-600 transition-all duration-500"
                    style={{
                      width: `${Math.min(overallRegistrationPercentage, 100)}%`,
                    }}
                  />
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                  <MapPin size={20} className="text-violet-600" />

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {availableSeats} seats available
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Combined remaining capacity across your events
                    </p>
                  </div>
                </div>

                {totalCapacity === 0 && (
                  <p className="mt-3 text-xs text-amber-600">
                    No event capacity has been configured yet.
                  </p>
                )}
              </>
            )}
          </section>

          {/* Event-wise Analytics */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Event-wise Analytics
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Registration progress for each event
              </p>
            </div>

            {loading ? (
              <p className="py-6 text-sm text-slate-500">
                Loading event analytics...
              </p>
            ) : !stats.eventAnalytics?.length ? (
              <p className="py-6 text-sm text-slate-500">
                No events available yet. Create an event to see its analytics.
              </p>
            ) : (
              <div className="space-y-6">
                {stats.eventAnalytics.map((event) => (
                  <div key={event.eventId}>
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {event.title}
                        </p>

                        <span
                          className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                            event.status === "approved"
                              ? "bg-emerald-50 text-emerald-700"
                              : event.status === "rejected"
                                ? "bg-red-50 text-red-700"
                                : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {event.status}
                        </span>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-sm font-semibold text-slate-900">
                          {event.registrations} / {event.capacity}
                        </p>

                        <p className="text-xs text-slate-500">
                          {event.registrationPercentage}% occupied
                        </p>
                      </div>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-violet-600 transition-all duration-500"
                        style={{
                          width: `${Math.min(event.registrationPercentage, 100)}%`,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      {event.availableSeats} seats remaining
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyDashboard;
