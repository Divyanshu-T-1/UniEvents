import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  RefreshCw,
  Users,
  XCircle,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function formatDate(date) {
  if (!date) return "Date not specified";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date not specified";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const AttendanceManagement = () => {
  const { id } = useParams();
  const user = getUser();

  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/registrations/event/${id}/attendance`);

      setAttendanceData(response.data?.data || null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load attendance records. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const markAttendance = async (registrationId, attendance) => {
    try {
      setUpdatingId(registrationId);
      setError("");
      setSuccess("");

      await api.patch(
        `/registrations/event/${id}/attendance/${registrationId}`,
        { attendance },
      );

      setSuccess(
        attendance === "present"
          ? "Student marked present successfully."
          : "Student marked absent successfully.",
      );

      await fetchAttendance();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update attendance. Please try again.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const event = attendanceData?.event;
  const statistics = attendanceData?.statistics;
  const registrations = attendanceData?.registrations || [];

  const statCards = [
    {
      title: "Total Registered",
      value: statistics?.totalRegistered ?? 0,
      icon: Users,
      color: "bg-violet-50 text-violet-600",
    },
    {
      title: "Present",
      value: statistics?.present ?? 0,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Absent",
      value: statistics?.absent ?? 0,
      icon: XCircle,
      color: "bg-red-50 text-red-600",
    },
    {
      title: "Not Marked",
      value: statistics?.notMarked ?? 0,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <DashboardLayout role="faculty" title="Attendance Management" user={user}>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">
              Faculty Portal
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Attendance Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Record and monitor attendance for your events.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/faculty/my-events"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft size={17} />
              Back to My Events
            </Link>

            <button
              type="button"
              onClick={fetchAttendance}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Success message */}
        {success && (
          <div
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            {success}
          </div>
        )}

        {/* Loading state */}
        {loading && !attendanceData && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <RefreshCw
              size={28}
              className="mx-auto animate-spin text-violet-600"
            />

            <p className="mt-4 text-sm text-slate-500">
              Loading attendance records...
            </p>
          </div>
        )}

        {/* Event information */}
        {event && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {event.title}
                </h2>

                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <CalendarDays size={17} className="text-violet-600" />
                  {formatDate(event.date)}
                </div>
              </div>

              <span
                className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
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
          </section>
        )}

        {/* Statistics */}
        {statistics && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          {card.title}
                        </p>

                        <p className="mt-3 text-3xl font-bold text-slate-900">
                          {card.value}
                        </p>
                      </div>

                      <div className={`rounded-xl p-3 ${card.color}`}>
                        <Icon size={22} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Attendance percentage */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Attendance Percentage
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Percentage of registered students marked present.
                  </p>
                </div>

                <p className="text-3xl font-bold text-violet-600">
                  {statistics.attendancePercentage}%
                </p>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-violet-600 transition-all duration-500"
                  style={{
                    width: `${Math.min(statistics.attendancePercentage, 100)}%`,
                  }}
                />
              </div>
            </section>
          </>
        )}

        {/* Attendance table */}
        {attendanceData && !loading && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-900">
                Student Attendance
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Mark each registered student as present or absent.
              </p>
            </div>

            {registrations.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Users size={40} className="mx-auto text-slate-400" />

                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  No Registered Students
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Students must register for this event before attendance can be
                  recorded.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Student</th>

                      <th className="px-6 py-4 font-semibold">Roll Number</th>

                      <th className="px-6 py-4 font-semibold">Department</th>

                      <th className="px-6 py-4 font-semibold">Attendance</th>

                      <th className="px-6 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {registrations.map((registration) => {
                      const student = registration.student || {};
                      const attendance =
                        registration.attendance || "not_marked";

                      const updating = updatingId === registration._id;

                      return (
                        <tr
                          key={registration._id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="whitespace-nowrap px-6 py-4">
                            <p className="font-semibold text-slate-900">
                              {student.name || "Unknown Student"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {student.email || "No email"}
                            </p>
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                            {student.rollNo || "—"}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                            {student.department || "—"}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                                attendance === "present"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : attendance === "absent"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {attendance.replace("_", " ")}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  markAttendance(registration._id, "present")
                                }
                                disabled={updating || loading}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <CheckCircle2 size={14} />
                                {updating && attendance === "present"
                                  ? "Saving..."
                                  : "Present"}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  markAttendance(registration._id, "absent")
                                }
                                disabled={updating || loading}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <XCircle size={14} />
                                {updating && attendance === "absent"
                                  ? "Saving..."
                                  : "Absent"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AttendanceManagement;
