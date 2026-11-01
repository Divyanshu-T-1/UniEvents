import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  GraduationCap,
  User,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

import authService from "../../services/authService";

function Register() {
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rollNo: "",
    department: "",
    year: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const userData = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      rollNo: formData.rollNo.trim(),
      department: formData.department.trim(),
      year: Number(formData.year),
    };

    if (userData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await authService.register(userData);

      setSuccess("Account created successfully! Redirecting to login...");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (err) {
      const message = err.response?.data?.message;
      const validationMessage = err.response?.data?.errors?.[0]?.msg;

      setError(
        validationMessage ||
          message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = submitting || loading;

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      {/* Left: Branding panel */}
      <section className="relative hidden overflow-hidden bg-purple-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-purple-500/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-indigo-400/30 blur-3xl" />

        <Link to="/" className="relative flex items-center gap-3">
          <div className="rounded-xl bg-white/15 p-3">
            <GraduationCap size={30} />
          </div>

          <div>
            <h1 className="text-2xl font-bold">UniEvents</h1>
            <p className="text-sm text-purple-200">Campus Life, Connected</p>
          </div>
        </Link>

        <div className="relative max-w-lg">
          <span className="rounded-full bg-white/10 px-4 py-2 text-sm">
            Join your campus community
          </span>

          <h2 className="mt-8 text-5xl font-bold leading-tight">
            Your university journey starts here.
          </h2>

          <p className="mt-6 text-lg leading-8 text-purple-100">
            Create your account, explore exciting events, connect with students,
            and make unforgettable campus memories.
          </p>

          <div className="mt-10 flex gap-3">
            <span className="h-2 w-10 rounded-full bg-white" />
            <span className="h-2 w-5 rounded-full bg-white/40" />
            <span className="h-2 w-5 rounded-full bg-white/40" />
          </div>
        </div>

        <p className="relative text-sm text-purple-200">
          Built for your university community.
        </p>
      </section>

      {/* Right: Registration form */}
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-lg font-bold text-purple-700 lg:hidden"
          >
            <GraduationCap size={28} />
            UniEvents
          </Link>

          <div className="mb-7">
            <p className="text-sm font-semibold uppercase tracking-wider text-purple-600">
              Get started
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Create your account
            </h2>

            <p className="mt-3 leading-6 text-slate-500">
              Enter your university details to join UniEvents.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Full name
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-100">
                <User size={19} className="shrink-0 text-slate-400" />

                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-transparent py-3 text-sm outline-none"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                University email
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-100">
                <Mail size={19} className="shrink-0 text-slate-400" />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-transparent py-3 text-sm outline-none"
                  required
                />
              </div>
            </div>

            {/* Roll number */}
            <div>
              <label
                htmlFor="rollNo"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                University roll number
              </label>

              <input
                id="rollNo"
                name="rollNo"
                type="text"
                placeholder="Enter your roll number"
                value={formData.rollNo}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                required
              />
            </div>

            {/* Department and year */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="department"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Department
                </label>

                <input
                  id="department"
                  name="department"
                  type="text"
                  placeholder="e.g. CSE"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="year"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Academic year
                </label>

                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                  required
                >
                  <option value="">Select</option>
                  {[1, 2, 3, 4, 5].map((year) => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-100">
                <LockKeyhole size={19} className="shrink-0 text-slate-400" />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-transparent py-3 text-sm outline-none"
                  required
                />

                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3.5 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Creating account..." : "Create Account"}

              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-purple-700 hover:text-purple-800"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Register;
