import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

const OrganizationLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = await login(formData.email, formData.password);
      if (userData.role !== "organization") {
        toast.error("Please use the correct login portal for your role");
        return;
      }
      toast.success(`Welcome back, ${userData.name}!`);
      navigate("/organization/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-800 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="mb-8">
          <Link
            to="/"
            className="text-blue-300 hover:text-blue-200 text-sm font-medium transition"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="bg-slate-800/70 backdrop-blur border border-blue-500/30 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏢</div>
            <h2 className="text-3xl font-bold text-blue-400 mb-2">
              Organization Login
            </h2>
            <p className="text-slate-400 text-sm">
              Sign in to manage your campaigns
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="org@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In as Organization"}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-slate-400 text-sm">
              Don't have an account?{" "}
              <Link
                to="/organization/register"
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Sign Up
              </Link>
            </p>
            <div className="flex justify-center gap-4 text-xs text-slate-500">
              <Link
                to="/donor/login"
                className="hover:text-orange-400 transition"
              >
                Donor Login →
              </Link>
              <Link
                to="/volunteer/login"
                className="hover:text-green-400 transition"
              >
                Volunteer Login →
              </Link>
            </div>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-xs font-medium mb-2">
              Demo Credentials:
            </p>
            <p className="text-slate-400 text-xs">Email: org@demo.com</p>
            <p className="text-slate-400 text-xs">Password: demo123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationLogin;
