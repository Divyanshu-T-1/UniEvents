import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Ticket,
  RefreshCw,
  XCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import api from "../../services/api";

function formatDate(date) {
  if (!date) return "Date to be announced";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date to be announced";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function MyEvents() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/registrations/my");

      if (response.data?.success === false) {
        throw new Error(
          response.data.message || "Unable to load your registrations.",
        );
      }

      const data = response.data?.data;

      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.registrations)
          ? data.registrations
          : [];

      setRegistrations(items);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load your registered events.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleCancel = async (registration) => {
    const event = registration.event;

    if (!event || typeof event !== "object") {
      setError("Event details are unavailable. Please refresh the page.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to cancel your registration for "${event.title}"?`,
    );

    if (!confirmed) return;

    setCancellingId(registration._id);
    setError("");
    setNotice("");

    try {
      const response = await api.delete(`/registrations/${registration._id}`);

      if (response.data?.success === false) {
        throw new Error(
          response.data.message || "Unable to cancel registration.",
        );
      }

      setNotice(`Your registration for "${event.title}" has been cancelled.`);

      await fetchRegistrations();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to cancel your registration.",
      );
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <DashboardLayout role="student" title="My Events" user={user}>
      {/* Hero */}
      <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 p-6 text-white sm:p-9">
        <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm">
            <Sparkles size={15} />
            Your campus journey
          </div>

          <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
            My registered events.
          </h1>

          <p className="mt-3 leading-7 text-purple-100">
            Keep track of your upcoming events, plan your campus experience, and
            manage your registrations in one place.
          </p>
        </div>
      </section>

      {/* Notifications */}
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          {notice}
        </div>
      )}

      {/* Header */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Your registrations
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {loading
              ? "Loading your events..."
              : `${registrations.length} registered event${
                  registrations.length === 1 ? "" : "s"
                }`}
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={fetchRegistrations}
          disabled={loading || cancellingId !== null}
        >
          <span className="inline-flex items-center gap-2">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </span>
        </Button>
      </div>

      {/* Registration list */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <RefreshCw
            size={28}
            className="mx-auto animate-spin text-purple-600"
          />

          <p className="mt-4 text-sm text-slate-500">
            Loading your registered events...
          </p>
        </div>
      ) : registrations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <Ticket size={36} className="mx-auto text-slate-400" />

          <h3 className="mt-4 text-lg font-bold text-slate-900">
            No registered events yet
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Explore campus events and register for something exciting.
          </p>

          <Link
            to="/student/events"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
          >
            Explore Events
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {registrations.map((registration) => {
            const event = registration.event;
            const isCancelling = cancellingId === registration._id;

            if (!event || typeof event !== "object") {
              return null;
            }

            return (
              <Card key={registration._id}>
                <div className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold capitalize text-purple-700">
                      {event.category || "Campus event"}
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Registered
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-slate-900">
                    {event.title || "Campus Event"}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {event.description || "Your upcoming campus event."}
                  </p>

                  <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
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
                      <span>{event.venue || "Venue to be announced"}</span>
                    </div>

                    {event.startTime && (
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <Clock3
                          size={17}
                          className="mt-0.5 shrink-0 text-purple-600"
                        />
                        <span>
                          {event.startTime}
                          {event.endTime ? ` – ${event.endTime}` : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-6">
                    <Button
                      variant="danger"
                      onClick={() => handleCancel(registration)}
                      disabled={cancellingId !== null}
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        <XCircle size={17} />
                        {isCancelling ? "Cancelling..." : "Cancel Registration"}
                      </span>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}

export default MyEvents;
