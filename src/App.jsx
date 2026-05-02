import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const PatientDashboard = lazy(() => import("./pages/PatientDashboard"));
const DoctorDashboard = lazy(() => import("./pages/DoctorDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const DoctorsListPage = lazy(() => import("./pages/DoctorsListPage"));
const BookAppointmentPage = lazy(() => import("./pages/BookAppointmentPage"));
const AppointmentHistoryPage = lazy(() => import("./pages/AppointmentHistoryPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function HomeRedirect() {
  const { authUser, profile, loading } = useAuth();

  if (loading) {
    return <div className="page-center">Loading...</div>;
  }

  if (!authUser || !profile) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={`/${profile.role}`} replace />;
}

export default function App() {
  return (
    <Suspense fallback={<div className="page-center">Loading...</div>}>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/doctors" element={<DoctorsListPage />} />
          <Route path="/book/:doctorId" element={<BookAppointmentPage />} />
          <Route path="/appointments" element={<AppointmentHistoryPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
          <Route path="/doctor" element={<DoctorDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
