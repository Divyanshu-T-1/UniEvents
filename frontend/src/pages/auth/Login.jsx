import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  GraduationCap,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

import { loginUser } from "../../features/auth/authSlice";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setValidationError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = formData.email.trim();

    if (!email || !formData.password) {
      setValidationError("Please enter your email and password.");
      return;
    }

    try {
      const result = await dispatch(
        loginUser({
          email,
          password: formData.password,
        }),
      ).unwrap();

      const role = result.data.user.role;

      if (role === "student") {
        navigate("/student/dashboard", { replace: true });
      } else if (role === "faculty") {
        navigate("/faculty/dashboard", { replace: true });
      } else if (role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        setValidationError("Your account has an unsupported role.");
      }
    } catch {
      // Redux stores the API error in auth.error.
    }
  };

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
            Your campus, your community
          </span>

          <h2 className="mt-8 text-5xl font-bold leading-tight">
            Every event is a chance to connect.
          </h2>

          <p className="mt-6 text-lg leading-8 text-purple-100">
            Discover campus events, meet like-minded people, and make your
            university experience unforgettable.
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

      {/* Right: Login form */}
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-10 inline-flex items-center gap-2 text-lg font-bold text-purple-700 lg:hidden"
          >
            <GraduationCap size={28} />
            UniEvents
          </Link>

          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-purple-600">
              Welcome back
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Sign in to UniEvents
            </h2>

            <p className="mt-3 leading-6 text-slate-500">
              Enter your credentials to access your campus dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="w-full bg-transparent py-3.5 text-sm outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-purple-700 hover:text-purple-800"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-100">
                <LockKeyhole size={19} className="shrink-0 text-slate-400" />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-transparent py-3.5 text-sm outline-none"
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

            {(validationError || error) && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {validationError || error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3.5 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-purple-700 hover:text-purple-800"
            >
              Create an account
            </Link>
          </p>

          <p className="mt-10 text-center text-xs leading-5 text-slate-400">
            By signing in, you agree to follow your university's event
            participation policies.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Login;
