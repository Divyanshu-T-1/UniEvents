import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock, MapPin, Save } from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

const initialForm = {
  title: "",
  description: "",
  category: "Workshop",
  date: "",
  startTime: "",
  endTime: "",
  venue: "",
  capacity: "",
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function formatDateForInput(date) {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  return [
    parsedDate.getFullYear(),
    String(parsedDate.getMonth() + 1).padStart(2, "0"),
    String(parsedDate.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getUser();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load the selected event.
  useEffect(() => {
    let active = true;

    async function fetchEvent() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/events/${id}`);

        const result = response.data?.data;
        const event = result?.event || result;

        if (!event || !event._id) {
          throw new Error("The requested event could not be found.");
        }

        if (!active) return;

        setForm({
          title: event.title || "",
          description: event.description || "",
          category: event.category || "Workshop",
          date: formatDateForInput(event.date),
          startTime: event.startTime || "",
          endTime: event.endTime || "",
          venue: event.venue || "",
          capacity: event.capacity ?? "",
        });
      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load the event. Please try again.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    if (id) {
      fetchEvent();
    } else {
      setError("Event ID is missing.");
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [id]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.date ||
      !form.startTime ||
      !form.endTime ||
      !form.venue.trim() ||
      form.capacity === ""
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (form.endTime <= form.startTime) {
      setError("End time must be later than start time.");
      return;
    }

    const capacity = Number(form.capacity);

    if (!Number.isInteger(capacity) || capacity < 1) {
      setError("Capacity must be a positive whole number.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        venue: form.venue.trim(),
        capacity,
      };

      await api.put(`/events/${id}`, payload);

      navigate("/faculty/my-events", {
        replace: true,
        state: {
          notice: "Event updated successfully.",
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update the event. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout role="faculty" title="Edit Event" user={user}>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">
              Faculty Portal
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Edit Event
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Update your event details and save your changes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/faculty/my-events")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            Back to My Events
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-sm text-slate-500">Loading event details...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Edit form */}
        {!loading && (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
          >
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Event Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Update the information below.
              </p>
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="text-sm font-semibold text-slate-700"
              >
                Event Title *
              </label>

              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter event title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="text-sm font-semibold text-slate-700"
              >
                Description *
              </label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                className={inputClass}
                rows={5}
                placeholder="Describe your event"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="text-sm font-semibold text-slate-700"
              >
                Category *
              </label>

              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Competition">Competition</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label
                htmlFor="date"
                className="flex items-center gap-2 text-sm font-semibold text-slate-700"
              >
                <CalendarDays size={17} />
                Event Date *
              </label>

              <input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            {/* Time */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="startTime"
                  className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                >
                  <Clock size={17} />
                  Start Time *
                </label>

                <input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="endTime"
                  className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                >
                  <Clock size={17} />
                  End Time *
                </label>

                <input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Venue */}
            <div>
              <label
                htmlFor="venue"
                className="flex items-center gap-2 text-sm font-semibold text-slate-700"
              >
                <MapPin size={17} />
                Venue *
              </label>

              <input
                id="venue"
                name="venue"
                value={form.venue}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter venue"
                required
              />
            </div>

            {/* Capacity */}
            <div>
              <label
                htmlFor="capacity"
                className="text-sm font-semibold text-slate-700"
              >
                Maximum Participants *
              </label>

              <input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                step="1"
                value={form.capacity}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter participant capacity"
                required
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/faculty/my-events")}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={17} />
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
