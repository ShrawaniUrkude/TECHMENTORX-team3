import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Toast from "./components/Toast";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DonorDashboard from "./pages/DonorDashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import OrganizationDashboard from "./pages/OrganizationDashboard";
import Leaderboard from "./pages/Leaderboard";
import TrackingPage from "./pages/TrackingPage";
// Role-specific login pages
import DonorLogin from "./pages/DonorLogin";
import VolunteerLogin from "./pages/VolunteerLogin";
import OrganizationLogin from "./pages/OrganizationLogin";
// Role-specific register pages
import DonorRegister from "./pages/DonorRegister";
import VolunteerRegister from "./pages/VolunteerRegister";
import OrganizationRegister from "./pages/OrganizationRegister";

// Component to handle root redirect based on user role
const RootRedirect = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Home />;
  }

  if (user.role === "donor") {
    return <Navigate to="/donor/dashboard" />;
  } else if (user.role === "volunteer") {
    return <Navigate to="/volunteer/dashboard" />;
  } else if (user.role === "organization") {
    return <Navigate to="/organization/dashboard" />;
  } else if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" />;
  }

  return <Home />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toast />
          <Navbar />
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Role-specific login routes */}
            <Route path="/donor/login" element={<DonorLogin />} />
            <Route path="/volunteer/login" element={<VolunteerLogin />} />
            <Route path="/organization/login" element={<OrganizationLogin />} />

            {/* Role-specific register routes */}
            <Route path="/donor/register" element={<DonorRegister />} />
            <Route path="/volunteer/register" element={<VolunteerRegister />} />
            <Route
              path="/organization/register"
              element={<OrganizationRegister />}
            />

            <Route path="/leaderboard" element={<Leaderboard />} />

            {/* Donor Routes */}
            <Route
              path="/donor/dashboard"
              element={
                <ProtectedRoute allowedRoles={["donor"]}>
                  <DonorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Volunteer Routes */}
            <Route
              path="/volunteer/dashboard"
              element={
                <ProtectedRoute allowedRoles={["volunteer"]}>
                  <VolunteerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer/track/:donationId"
              element={
                <ProtectedRoute allowedRoles={["volunteer"]}>
                  <TrackingPage />
                </ProtectedRoute>
              }
            />

            {/* Organization Routes */}
            <Route
              path="/organization/dashboard"
              element={
                <ProtectedRoute allowedRoles={["organization"]}>
                  <OrganizationDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
