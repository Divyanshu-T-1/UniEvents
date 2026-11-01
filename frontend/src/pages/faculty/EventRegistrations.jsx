import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Download,
  Mail,
  RefreshCw,
  Users,
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

export default function EventRegistrations() {
  const { id } = useParams();
  const user = getUser();

  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchRegistrations() {
    try {
      setLoading(true);
      setError("");

      // Fetch the event details.
      const eventResponse = await api.get(`/events/${id}`);
      const eventData = eventResponse.data?.data;
      const eventDetails = eventData?.event || eventData;

      setEvent(eventDetails);

      // Fetch registrations for this event.
      const registrationResponse = await api.get(`/registrations/event/${id}`);

      const data = registrationResponse.data?.data;

      setRegistrations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load event registrations. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function exportRegistrationsToCSV() {
    if (registrations.length === 0) {
      return;
    }

    const headers = [
      "Student Name",
      "Roll Number",
      "Department",
      "Year",
      "Email",
      "Registration Status",
    ];

    const escapeCSV = (value) => {
      const text = String(value ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    };

    const rows = registrations.map((registration) => {
      const student = registration.student || {};

      return [
        student.name,
        student.rollNo,
        student.department,
        student.year,
        student.email,
        registration.status || "registered",
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    // BOM helps Excel display UTF-8 characters correctly.
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const eventName = (event?.title || "Event")
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
      .trim()
      .replace(/\s+/g, "_");

    link.href = url;
    link.download = `${eventName || "Event"}_Registrations.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    fetchRegistrations();
  }, [id]);

  return (
    <DashboardLayout role="faculty" title="Event Registrations" user={user}>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">
              Faculty Portal
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Event Registrations
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View students registered for your event.
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
              onClick={fetchRegistrations}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              type="button"
              onClick={exportRegistrationsToCSV}
              disabled={loading || registrations.length === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Event details */}
        {event && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="inline-flex rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                  {event.category || "Campus Event"}
                </span>

                <h2 className="mt-3 text-2xl font-bold text-slate-900">
                  {event.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {event.description || "No description available."}
                </p>
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
                {event.status || "pending"}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <CalendarDays size={18} className="text-violet-600" />

                <div>
                  <p className="text-xs text-slate-400">Event Date</p>
                  <p className="mt-1 font-medium">{formatDate(event.date)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Users size={18} className="text-violet-600" />

                <div>
                  <p className="text-xs text-slate-400">Capacity</p>
                  <p className="mt-1 font-medium">
                    {event.capacity ?? "N/A"} participants
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Users size={18} className="text-violet-600" />

                <div>
                  <p className="text-xs text-slate-400">Active Registrations</p>
                  <p className="mt-1 font-medium">{registrations.length}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Registration count */}
        {!loading && !error && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-violet-50 p-3 text-violet-700">
                <Users size={24} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Total Active Registrations
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {registrations.length}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <RefreshCw
              size={28}
              className="mx-auto animate-spin text-violet-600"
            />

            <p className="mt-4 text-sm text-slate-500">
              Loading registrations...
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && registrations.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <Users size={40} className="mx-auto text-slate-400" />

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              No Registrations Yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              No students have registered for this event yet.
            </p>
          </div>
        )}

        {/* Registrations table */}
        {!loading && registrations.length > 0 && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-900">
                Registered Students
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Student details for this event.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Student</th>

                    <th className="px-6 py-4 font-semibold">Roll Number</th>

                    <th className="px-6 py-4 font-semibold">Department</th>

                    <th className="px-6 py-4 font-semibold">Year</th>

                    <th className="px-6 py-4 font-semibold">Email</th>

                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {registrations.map((registration) => {
                    const student = registration.student || {};

                    return (
                      <tr
                        key={registration._id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="font-semibold text-slate-900">
                            {student.name || "Unknown Student"}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                          {student.rollNo || "—"}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                          {student.department || "—"}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                          {student.year || "—"}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <a
                            href={`mailto:${student.email || ""}`}
                            className="inline-flex items-center gap-2 text-violet-700 hover:text-violet-900"
                          >
                            <Mail size={15} />
                            {student.email || "—"}
                          </a>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold capitalize text-emerald-700">
                            {registration.status || "registered"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
