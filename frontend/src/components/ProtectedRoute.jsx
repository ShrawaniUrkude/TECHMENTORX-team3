import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard
    if (user.role === "donor") {
      return <Navigate to="/donor/dashboard" />;
    } else if (user.role === "volunteer") {
      return <Navigate to="/volunteer/dashboard" />;
    } else if (user.role === "organization") {
      return <Navigate to="/organization/dashboard" />;
    } else if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" />;
    }
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
