import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  ArrowRight,
  RefreshCw,
  Ticket,
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

function extractArray(responseData, key) {
  const data = responseData?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];

  return [];
}

function ExploreEvents() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [registeringId, setRegisteringId] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/events");

      if (response.data?.success === false) {
        throw new Error(response.data.message || "Unable to load events.");
      }

      const allEvents = extractArray(response.data, "events");

      setEvents(
        allEvents
          .filter((event) => event.status === "approved")
          .sort((a, b) => new Date(a.date) - new Date(b.date)),
      );

      // Registrations are private, so load them separately.
      try {
        const registrationResponse = await api.get("/registrations/my");

        setRegistrations(
          extractArray(registrationResponse.data, "registrations"),
        );
      } catch (registrationError) {
        console.error("Unable to load registrations:", registrationError);
        setRegistrations([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load campus events.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

 const registeredEventIds = useMemo(() => {
   return new Set(
     registrations
       .filter((registration) => {
         return registration.status === "registered" || !registration.status;
       })
       .map((registration) => {
         const event = registration.event;

         if (typeof event === "object" && event !== null) {
           return event._id?.toString();
         }

         return event?.toString();
       })
       .filter(Boolean),
   );
 }, [registrations]);

  const categories = useMemo(() => {
    const values = events
      .map((event) => event.category?.trim())
      .filter(Boolean);

    return ["All", ...new Set(values)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        !query ||
        event.title?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.venue?.toLowerCase().includes(query) ||
        event.category?.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === "All" || event.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [events, search, selectedCategory]);

  const handleRegister = async (event) => {
    setRegisteringId(event._id);
    setError("");
    setNotice("");

    try {
      const response = await api.post(`/registrations/${event._id}`);

      if (response.data?.success === false) {
        throw new Error(response.data.message || "Registration failed.");
      }

      // Refresh registration data so the button reflects the new state.
      const registrationResponse = await api.get("/registrations/my");

      setRegistrations(
        extractArray(registrationResponse.data, "registrations"),
      );

      setNotice(`Successfully registered for ${event.title}.`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to register for this event.",
      );
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <DashboardLayout role="student" title="Explore Events" user={user}>
      {/* Hero */}
      <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 p-6 text-white sm:p-9">
        <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm">
            <Sparkles size={15} />
            Find your next campus moment
          </div>

          <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
            Discover campus events.
          </h1>

          <p className="mt-3 max-w-xl leading-7 text-purple-100">
            Explore workshops, technology festivals, cultural activities, and
            opportunities to connect with your campus.
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-100">
          <Search size={20} className="shrink-0 text-slate-400" />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search events, venues, or categories..."
            aria-label="Search campus events"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>

        <div className="mt-5">
          <p className="mb-3 text-sm font-semibold text-slate-700">
            Browse by category
          </p>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedCategory === category
                    ? "bg-purple-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
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

      {/* Results */}
      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Available Events
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Finding events..."
                : `${filteredEvents.length} event${
                    filteredEvents.length === 1 ? "" : "s"
                  } found`}
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={fetchEvents}
            disabled={loading || registeringId !== null}
          >
            <span className="inline-flex items-center gap-2">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </span>
          </Button>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <RefreshCw
              size={28}
              className="mx-auto animate-spin text-purple-600"
            />
            <p className="mt-4 text-sm text-slate-500">
              Loading campus events...
            </p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <CalendarDays size={32} className="mx-auto text-slate-400" />

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              No events found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try another search term or select a different category.
            </p>

            {(search || selectedCategory !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                }}
                className="mt-4 font-semibold text-purple-700 hover:text-purple-800"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredEvents.map((event) => {
              const isRegistered = registeredEventIds.has(event._id);
              const isRegistering = registeringId === event._id;

              return (
                <Card key={event._id}>
                  <div className="flex h-full flex-col">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold capitalize text-purple-700">
                        {event.category || "Campus event"}
                      </span>

                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Approved
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900">
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
                          <span>Capacity limit: {event.capacity}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto flex flex-col gap-3 pt-6">
                      <Button
                        onClick={() => handleRegister(event)}
                        disabled={isRegistered || registeringId !== null}
                      >
                        <span className="inline-flex items-center justify-center gap-2">
                          <Ticket size={17} />
                          {isRegistered
                            ? "Already Registered"
                            : isRegistering
                              ? "Registering..."
                              : "Register Now"}
                        </span>
                      </Button>

                      <Link
                        to="/student/my-events"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        My Events
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}

export default ExploreEvents;
