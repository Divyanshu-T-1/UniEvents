import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Search,
  RefreshCw,
  MapPin,
  Clock3,
  Users,
  XCircle,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import api from "../../services/api";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  cancelled: "bg-slate-100 text-slate-600",
};

function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [processingId, setProcessingId] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/events");

      if (!response.data.success) {
        throw new Error(response.data.message || "Unable to load events.");
      }

      const result = response.data.data;
      const eventList = Array.isArray(result) ? result : (result?.events ?? []);

      setEvents(eventList);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Unable to load events.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = events.filter((event) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      event.title?.toLowerCase().includes(query) ||
      event.venue?.toLowerCase().includes(query) ||
      event.category?.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "all" || event.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDecision = async (event, decision) => {
    const action = decision === "approve" ? "approve" : "reject";

    if (decision === "reject") {
      const confirmed = window.confirm(
        `Are you sure you want to reject "${event.title}"?`,
      );

      if (!confirmed) return;
    }

    setProcessingId(event._id);
    setError("");

    try {
      await api.patch(`/events/${event._id}/${action}`);

      await fetchEvents();
    } catch (err) {
      setError(
        err.response?.data?.message || `Unable to ${action} this event.`,
      );
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Date not specified";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "Invalid date";

    return parsed.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const counts = {
    all: events.length,
    pending: events.filter((event) => event.status === "pending").length,
    approved: events.filter((event) => event.status === "approved").length,
    rejected: events.filter((event) => event.status === "rejected").length,
  };

  return (
    <DashboardLayout
      role="admin"
      title="All Events"
      user={JSON.parse(localStorage.getItem("user") || "null")}
    >
      <section className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-purple-600">
          Campus Management
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          All Events
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
          Search, review, and monitor university event submissions.
        </p>
      </section>

      <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "All Events", value: counts.all },
          { label: "Pending", value: counts.pending },
          { label: "Approved", value: counts.approved },
          { label: "Rejected", value: counts.rejected },
        ].map((item) => (
          <Card key={item.label}>
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {loading ? "—" : item.value}
            </p>
          </Card>
        ))}
      </section>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-100 lg:max-w-md lg:flex-1">
            <Search size={19} className="shrink-0 text-slate-400" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, venue, or category..."
              aria-label="Search events"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by event status"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-purple-500"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <Button
              variant="secondary"
              onClick={fetchEvents}
              disabled={loading || processingId !== null}
            >
              <span className="inline-flex items-center gap-2">
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </span>
            </Button>
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <RefreshCw
            className="mx-auto animate-spin text-purple-600"
            size={28}
          />
          <p className="mt-4 text-sm text-slate-500">Loading events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <CalendarDays size={32} className="mx-auto text-slate-400" />

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            No events found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Try a different search term or status filter.
          </p>
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {filteredEvents.map((event) => (
            <Card key={event._id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      statusStyles[event.status] || statusStyles.cancelled
                    }`}
                  >
                    {event.status || "Unknown"}
                  </span>

                  <h2 className="mt-3 break-words text-xl font-bold text-slate-900">
                    {event.title}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {event.category || "General event"}
                  </p>
                </div>

                <div className="shrink-0 rounded-xl bg-purple-50 p-3 text-purple-700">
                  <CalendarDays size={22} />
                </div>
              </div>

              <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                {event.description || "No description provided."}
              </p>

              <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <CalendarDays size={17} className="text-purple-600" />
                  <span>{formatDate(event.date)}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <MapPin size={17} className="text-purple-600" />
                  <span>{event.venue || "Venue not specified"}</span>
                </div>

                {event.startTime && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Clock3 size={17} className="text-purple-600" />
                    <span>
                      {event.startTime}
                      {event.endTime ? ` – ${event.endTime}` : ""}
                    </span>
                  </div>
                )}

                {typeof event.capacity === "number" && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Users size={17} className="text-purple-600" />
                    <span>Capacity: {event.capacity}</span>
                  </div>
                )}
              </div>

              {event.status === "pending" && (
                <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                  <Button
                    onClick={() => handleDecision(event, "approve")}
                    disabled={processingId !== null}
                  >
                    {processingId === event._id ? "Processing..." : "Approve"}
                  </Button>

                  <Button
                    variant="danger"
                    onClick={() => handleDecision(event, "reject")}
                    disabled={processingId !== null}
                  >
                    <span className="inline-flex items-center gap-2">
                      <XCircle size={16} />
                      Reject
                    </span>
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </section>
      )}
    </DashboardLayout>
  );
}

export default AdminEvents;
