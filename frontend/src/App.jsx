import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EventApprovals from "./pages/admin/EventApprovals";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import Login from "./pages/auth/Login";
import DashboardLayout from "./components/layout/DashboardLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import ExploreEvents from "./pages/student/ExploreEvents";
import MyEvents from "./pages/student/MyEvents";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import CreateEvent from "./pages/faculty/CreateEvent";
import FacultyMyEvents from "./pages/faculty/MyEvents";
import EditEvent from "./pages/faculty/EditEvent";
import EventRegistrations from "./pages/faculty/EventRegistrations";
import AttendanceManagement from "./pages/faculty/AttendanceManagement.jsx";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import ForgotPassword from "./pages/auth/ForgotPassword";

function ProtectedRoute({ allowedRoles, children }) {
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated || !token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
}

function DashboardPlaceholder({ role }) {
  const titles = {
    student: "Student Dashboard",
    faculty: "Faculty Dashboard",
    admin: "Admin Dashboard",
  };

  return (
    <DashboardLayout role={role} title={titles[role]} user={null}>
      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-purple-600">
          UNI EVENTS
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Welcome to your {role} dashboard
        </h1>

        <p className="mt-3 text-slate-500">
          Your dashboard is connected to the application layout. We'll add real
          event data and dashboard features next.
        </p>
      </div>
    </DashboardLayout>
  );
}

function App() {
  return (
    <Routes>
      {/* Default route */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Student routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/events"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <ExploreEvents />
          </ProtectedRoute>
        }
      />

      {/* Faculty routes */}
      <Route
        path="/faculty/dashboard"
        element={
          <ProtectedRoute allowedRoles={["faculty"]}>
            <FacultyDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/faculty/create-event"
        element={
          <ProtectedRoute allowedRoles={["faculty"]}>
            <CreateEvent />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/approvals"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <EventApprovals />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/events"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminEvents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminSettings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/my-events"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <MyEvents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/faculty/my-events"
        element={
          <ProtectedRoute allowedRoles={["faculty"]}>
            <FacultyMyEvents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/faculty/edit-event/:id"
        element={
          <ProtectedRoute allowedRoles={["faculty"]}>
            <EditEvent />
          </ProtectedRoute>
        }
      />

      <Route
        path="/faculty/events/:id/registrations"
        element={
          <ProtectedRoute allowedRoles={["faculty"]}>
            <EventRegistrations />
          </ProtectedRoute>
        }
      />

      <Route
        path="/faculty/events/:id/attendance"
        element={
          <ProtectedRoute allowedRoles={["faculty"]}>
            <AttendanceManagement />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
