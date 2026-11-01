import { useState } from "react";
import {
  Settings,
  UserRound,
  ShieldCheck,
  Info,
  LogOut,
  CheckCircle2,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { logout } from "../../features/auth/authSlice";

function AdminSettings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [notice, setNotice] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to log out of UniEvents?",
    );

    if (!confirmed) return;

    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const handleCopyEmail = async () => {
    if (!user?.email) {
      setNotice("No email address is available.");
      return;
    }

    try {
      await navigator.clipboard.writeText(user.email);
      setNotice("Email address copied to clipboard.");
    } catch {
      setNotice("Unable to copy email. Please copy it manually.");
    }
  };

  return (
    <DashboardLayout role="admin" title="Settings" user={user}>
      {/* Heading */}
      <section className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-purple-600">
          Account Preferences
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Settings
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          Manage your account information and review your UniEvents
          administrator access.
        </p>
      </section>

      {notice && (
        <div
          role="status"
          className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          <CheckCircle2 size={18} />
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Profile */}
        <section className="space-y-6 xl:col-span-2">
          <Card>
            <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
              <div className="rounded-xl bg-purple-50 p-3 text-purple-700">
                <UserRound size={23} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Administrator Profile
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your currently signed-in account.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-3xl font-bold text-purple-700">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>

              <div className="min-w-0">
                <h3 className="break-words text-xl font-bold text-slate-900">
                  {user?.name || "Administrator"}
                </h3>

                <p className="mt-1 break-all text-sm text-slate-500">
                  {user?.email || "Email unavailable"}
                </p>

                <span className="mt-3 inline-flex rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold capitalize text-purple-700">
                  {user?.role || "admin"}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Department
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {user?.department || "Not specified"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Account Role
                </p>

                <p className="mt-2 font-semibold capitalize text-slate-900">
                  {user?.role || "admin"}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button variant="secondary" onClick={handleCopyEmail}>
                Copy Email Address
              </Button>
            </div>
          </Card>

          {/* Security */}
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                <ShieldCheck size={23} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Account Security
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Information about your current session.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-emerald-700"
                />

                <div>
                  <p className="font-semibold text-emerald-900">
                    Administrator access
                  </p>

                  <p className="mt-1 text-sm leading-6 text-emerald-800">
                    Your account role determines which administrative operations
                    you can access. The backend must enforce these permissions
                    on every protected request.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <Button variant="danger" onClick={handleLogout}>
                <span className="inline-flex items-center gap-2">
                  <LogOut size={17} />
                  Log Out
                </span>
              </Button>
            </div>
          </Card>
        </section>

        {/* Application information */}
        <aside>
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                <Info size={23} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Application
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Project information.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Application Name
                </p>

                <p className="mt-1 font-semibold text-slate-900">UniEvents</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Tagline
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  Campus Life, Connected
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Application Version
                </p>

                <p className="mt-1 text-sm text-slate-700">Development</p>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-purple-50 p-4">
              <div className="flex items-center gap-2 text-purple-700">
                <Settings size={18} />

                <p className="text-sm font-semibold">
                  University Event Management
                </p>
              </div>

              <p className="mt-2 text-xs leading-5 text-purple-700">
                Manage campus activities, event approvals, and university
                participation through one platform.
              </p>
            </div>
          </Card>
        </aside>
      </div>
    </DashboardLayout>
  );
}

export default AdminSettings;
