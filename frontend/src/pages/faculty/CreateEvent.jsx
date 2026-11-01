import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock, MapPin, Users } from "lucide-react";
import api from "../../services/api";

const initialForm = {
  title: "",
  description: "",
  category: "",
  date: "",
  startTime: "",
  endTime: "",
  venue: "",
  capacity: "",
};

const CreateEvent = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (form.endTime <= form.startTime) {
      setError("End time must be later than start time.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        capacity: Number(form.capacity),
      };

      const response = await api.post("/events", payload);

      if (!response.data.success) {
        throw new Error(response.data.message || "Unable to create event.");
      }

      setSuccess(
        "Event created successfully! It may require administrator approval.",
      );

      setForm(initialForm);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to create event. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100";

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <button
        type="button"
        onClick={() => navigate("/faculty/dashboard")}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-violet-700"
      >
        <ArrowLeft size={17} />
        Back to Dashboard
      </button>

      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-violet-600">
            FACULTY PORTAL
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Create New Event
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Provide the event details for administrator review.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
        >
          <section>
            <h2 className="text-lg font-bold text-slate-900">
              Basic Information
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                Event Title *
                <input
                  required
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Annual Technology Fest"
                  className={inputClass}
                />
              </label>

              <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                Description *
                <textarea
                  required
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the event, its purpose and activities..."
                  className={inputClass}
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Category *
                <select
                  required
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select category</option>
                  <option value="Technical">Technical</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label className="text-sm font-medium text-slate-700">
                Maximum Capacity *
                <input
                  required
                  type="number"
                  min="1"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  placeholder="e.g. 200"
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">
              Schedule & Location
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                <span className="flex items-center gap-2">
                  <CalendarDays size={16} />
                  Event Date *
                </span>
                <input
                  required
                  type="date"
                  name="date"
                  min={new Date().toLocaleDateString("en-CA")}
                  value={form.date}
                  onChange={handleChange}
                  className={inputClass}
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                <span className="flex items-center gap-2">
                  <Clock size={16} />
                  Start Time *
                </span>
                <input
                  required
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  className={inputClass}
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                <span className="flex items-center gap-2">
                  <Clock size={16} />
                  End Time *
                </span>
                <input
                  required
                  type="time"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                  className={inputClass}
                />
              </label>

              <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                <span className="flex items-center gap-2">
                  <MapPin size={16} />
                  Venue *
                </span>
                <input
                  required
                  name="venue"
                  value={form.venue}
                  onChange={handleChange}
                  placeholder="e.g. Main Auditorium"
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/faculty/dashboard")}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Event..." : "Submit Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
