import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Ticket,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";

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

function getEventList(response) {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.events)) return data.events;
  if (Array.isArray(data?.registrations)) return data.registrations;

  return [];
}

function StudentDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const results = await Promise.allSettled([
        api.get("/events"),
        api.get("/registrations/my"),
      ]);

      const eventResult = results[0];
      const registrationResult = results[1];

      if (eventResult.status === "rejected") {
        throw new Error(
          eventResult.reason?.response?.data?.message ||
            "Unable to load campus events.",
        );
      }

      const allEvents = getEventList(eventResult.value.data);

      // Students should discover approved events only.
      const approvedEvents = allEvents.filter(
        (event) => event.status === "approved",
      );

      setEvents(
        approvedEvents.sort((a, b) => new Date(a.date) - new Date(b.date)),
      );

      if (registrationResult.status === "fulfilled") {
        setRegistrations(getEventList(registrationResult.value.data));
      } else {
        // Keep event discovery available if registrations fail.
        setRegistrations([]);
        console.error(
          "Could not load student registrations:",
          registrationResult.reason,
        );
      }
    } catch (err) {
      setError(
        err.message || "Something went wrong while loading your dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const upcomingEvents = events.slice(0, 3);

  const registeredEventIds = new Set(
    registrations
      .filter((registration) => registration.status === "registered")
      .map((registration) => {
        const event = registration.event;

        return typeof event === "object" ? event?._id : event;
      })
      .filter(Boolean),
  );

  return (
    <DashboardLayout role="student" title="Student Dashboard" user={user}>
      {/* Welcome section */}
      <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 p-6 text-white sm:p-9">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 h-48 w-48 rounded-full bg-indigo-300/20 blur-3xl" />

        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-purple-50">
            <Sparkles size={15} />
            Your campus, your community
          </div>

          <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
            Hey, {user?.name?.split(" ")[0] || "there"}!
            <br />
            Find your next campus moment.
          </h1>

          <p className="mt-4 max-w-xl leading-7 text-purple-100">
            Discover exciting events, meet people who share your interests, and
            make your university experience memorable.
          </p>

          <Link
            to="/student/events"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-purple-700 transition hover:bg-purple-50"
          >
            Explore Events
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Statistics */}
      <section className="mb-9 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Approved Campus Events
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {loading ? "—" : events.length}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Events available to explore
              </p>
            </div>

            <div className="rounded-2xl bg-purple-50 p-4 text-purple-700">
              <CalendarDays size={25} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                My Registrations
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {loading ? "—" : registeredEventIds.size}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Events you've registered for
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-700">
              <Ticket size={25} />
            </div>
          </div>
        </Card>
      </section>

      {/* Event section heading */}
      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-purple-600">
              Discover
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Upcoming Events
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Find something exciting happening on campus.
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={fetchDashboard}
            disabled={loading}
          >
            <span className="inline-flex items-center gap-2">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </span>
          </Button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={fetchDashboard}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <RefreshCw
              size={28}
              className="mx-auto animate-spin text-purple-600"
            />

            <p className="mt-4 text-sm text-slate-500">
              Discovering campus events...
            </p>
          </div>
        ) : !error && upcomingEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <CalendarDays size={28} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              No approved events yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Check back soon! Approved university events will appear here when
              they're available.
            </p>
          </div>
        ) : !error ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {upcomingEvents.map((event) => (
              <Card key={event._id}>
                <div className="flex h-full flex-col">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold capitalize text-purple-700">
                      {event.category || "Campus event"}
                    </span>

                    {registeredEventIds.has(event._id) && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Registered
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {event.title}
                  </h3>

                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                    {event.description || "Discover this campus event."}
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

                    {typeof event.capacity === "number" && (
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <Users
                          size={17}
                          className="mt-0.5 shrink-0 text-purple-600"
                        />
                        <span>{event.capacity} available capacity limit</span>
                      </div>
                    )}
                  </div>

                  <Link
                    to="/student/events"
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-purple-200 px-4 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
                  >
                    View Events
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : null}

        <div className="mt-7 text-center">
          <Link
            to="/student/events"
            className="inline-flex items-center gap-2 font-semibold text-purple-700 hover:text-purple-800"
          >
            Browse all events
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default StudentDashboard;
