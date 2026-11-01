import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ClipboardCheck,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import api from "../../services/api";

function EventApprovals() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [notice, setNotice] = useState("");

  const fetchPendingEvents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Fetch events from the existing backend.
      const response = await api.get("/events");

      if (!response.data.success) {
        throw new Error(response.data.message || "Unable to load events.");
      }

      // Only pending events require administrative review.
      const allEvents = Array.isArray(response.data.data)
        ? response.data.data
        : (response.data.data?.events ?? []);

      setEvents(allEvents.filter((event) => event.status === "pending"));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load pending events.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingEvents();
  }, [fetchPendingEvents]);

  const handleDecision = async (eventId, decision) => {
    const action = decision === "approve" ? "approve" : "reject";

    if (decision === "reject") {
      const confirmed = window.confirm(
        "Are you sure you want to reject this event?",
      );

      if (!confirmed) return;
    }

    setProcessingId(eventId);
    setError("");
    setNotice("");

    try {
      await api.patch(`/events/${eventId}/${action}`);

      setEvents((previous) =>
        previous.filter((event) => event._id !== eventId),
      );

      setNotice(
        decision === "approve"
          ? "Event approved successfully."
          : "Event rejected successfully.",
      );
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

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Invalid date";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getOrganizerName = (event) => {
    if (typeof event.organizer === "object") {
      return event.organizer?.name || "University organizer";
    }

    return "University organizer";
  };

  return (
    <DashboardLayout
      role="admin"
      title="Event Approvals"
      user={JSON.parse(localStorage.getItem("user") || "null")}
    >
      <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-purple-600">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Pending Approvals
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Review faculty event submissions before they appear as approved
            events on campus.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={fetchPendingEvents}
          disabled={loading || processingId !== null}
        >
          <span className="inline-flex items-center gap-2">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </span>
        </Button>
      </section>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Awaiting Review</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {loading ? "—" : events.length}
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
              <ClipboardCheck size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Review Process</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                Administrator Review
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Approve or reject each submission.
              </p>
            </div>

            <div className="rounded-xl bg-purple-50 p-3 text-purple-700">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </Card>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          {notice}
        </div>
      )}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">Submitted Events</h2>
          <p className="mt-1 text-sm text-slate-500">
            Events awaiting your decision.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <RefreshCw
              className="mx-auto animate-spin text-purple-600"
              size={28}
            />
            <p className="mt-4 text-sm text-slate-500">
              Loading pending events...
            </p>
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <CheckCircle2 size={28} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              You're all caught up!
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              There are no pending event submissions right now. New submissions
              will appear here when faculty create events.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {events.map((event) => (
              <Card key={event._id}>
                <div className="flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        <Clock3 size={13} />
                        Pending review
                      </span>

                      <h3 className="mt-3 break-words text-xl font-bold text-slate-900">
                        {event.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Organized by {getOrganizerName(event)}
                      </p>
                    </div>

                    <div className="shrink-0 rounded-xl bg-purple-50 p-3 text-purple-700">
                      <CalendarDays size={23} />
                    </div>
                  </div>

                  <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                    {event.description || "No description provided."}
                  </p>

                  <div className="grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <CalendarDays
                        size={17}
                        className="mt-0.5 shrink-0 text-purple-600"
                      />
                      <span>{formatDate(event.date)}</span>
                    </div>

                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <MapPin
                        size={17}
                        className="mt-0.5 shrink-0 text-purple-600"
                      />
                      <span className="break-words">
                        {event.venue || "Venue not specified"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row">
                    <Button
                      onClick={() => handleDecision(event._id, "approve")}
                      disabled={processingId !== null}
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        <CheckCircle2 size={17} />
                        {processingId === event._id
                          ? "Processing..."
                          : "Approve Event"}
                      </span>
                    </Button>

                    <Button
                      variant="danger"
                      onClick={() => handleDecision(event._id, "reject")}
                      disabled={processingId !== null}
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        <XCircle size={17} />
                        Reject
                      </span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}

export default EventApprovals;
