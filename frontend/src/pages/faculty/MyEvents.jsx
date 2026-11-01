import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  MapPin,
  Search,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  Users,
  ClipboardCheck
} from "lucide-react";
import { ClipboardList } from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  rejected: "bg-red-50 text-red-700 ring-red-600/20",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

function formatDate(date) {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function extractEvents(response) {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.events)) return data.events;

  return [];
}

export default function FacultyMyEvents() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/events");

      if (response.data?.success === false) {
        throw new Error(response.data.message || "Unable to load events.");
      }

      const allEvents = extractEvents(response.data);

      // Display only events created by the logged-in faculty member.
      const currentUserId = user?.id || user?._id;

      const myEvents = allEvents.filter((event) => {
        const organizer = event.organizer;
        const organizerId =
          typeof organizer === "object" ? organizer?._id : organizer;

        return organizerId && String(organizerId) === String(currentUserId);
      });

      setEvents(myEvents);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load your events.",
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?._id]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        !query ||
        event.title?.toLowerCase().includes(query) ||
        event.venue?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" || event.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, search, statusFilter]);

  const handleDelete = async (event) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${event.title}"?`,
    );

    if (!confirmed) return;

    setDeletingId(event._id);
    setError("");

    try {
      await api.delete(`/events/${event._id}`);

      setEvents((previous) =>
        previous.filter((item) => item._id !== event._id),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete this event.");
    } finally {
      setDeletingId(null);
    }
  };

  const counts = {
    total: events.length,
    pending: events.filter((event) => event.status === "pending").length,
    approved: events.filter((event) => event.status === "approved").length,
    rejected: events.filter((event) => event.status === "rejected").length,
  };

  return (
    <DashboardLayout role="faculty" title="My Events" user={user}>
      <div className="space-y-7">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-violet-600">
              FACULTY PORTAL
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              My Events
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage the events you have organized and track their approval.
            </p>
          </div>

          <Link
            to="/faculty/create-event"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            <Plus size={18} />
            Create New Event
          </Link>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[
            { label: "Total Events", value: counts.total },
            { label: "Pending", value: counts.pending },
            { label: "Approved", value: counts.approved },
            { label: "Rejected", value: counts.rejected },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">{item.label}</p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {loading ? "—" : item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Search and filters */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-violet-500">
            <Search size={18} className="text-slate-400" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by event title or venue..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-violet-500"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <button
            type="button"
            onClick={fetchEvents}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
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

        {/* Events list */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            Loading your events...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <CalendarDays size={36} className="mx-auto text-slate-300" />

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              No events found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {events.length === 0
                ? "You haven't created any events yet."
                : "Try changing your search or status filter."}
            </p>

            {events.length === 0 && (
              <Link
                to="/faculty/create-event"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
              >
                <Plus size={17} />
                Create Your First Event
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {filteredEvents.map((event) => (
              <article
                key={event._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                      {event.category || "General"}
                    </span>

                    <h2 className="mt-3 text-lg font-bold text-slate-900">
                      {event.title}
                    </h2>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${
                      statusStyles[event.status] || statusStyles.cancelled
                    }`}
                  >
                    {event.status || "Unknown"}
                  </span>
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                  {event.description || "No description provided."}
                </p>

                <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
                  <div className="flex items-center gap-3">
                    <CalendarDays
                      size={17}
                      className="shrink-0 text-violet-500"
                    />
                    {formatDate(event.date)}
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock size={17} className="shrink-0 text-violet-500" />
                    {event.startTime || "—"} – {event.endTime || "—"}
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin size={17} className="shrink-0 text-violet-500" />
                    {event.venue || "Venue not specified"}
                  </div>

                  <div className="flex items-center gap-3">
                    <Users size={17} className="shrink-0 text-violet-500" />
                    Capacity: {event.capacity ?? "—"}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/faculty/edit-event/${event._id}`)}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-violet-700"
                  >
                    <Pencil size={15} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(event)}
                    disabled={deletingId === event._id}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                    {deletingId === event._id ? "Deleting..." : "Delete"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/faculty/events/${event._id}/registrations`)
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-violet-200 px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
                  >
                    <ClipboardList size={15} />
                    View Registrations
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/faculty/events/${event._id}/attendance`)
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                  >
                    <ClipboardCheck size={15} />
                    Manage Attendance
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
