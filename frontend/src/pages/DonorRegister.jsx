import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getLocationDetails } from "../utils/location";
import toast from "react-hot-toast";

const DonorRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "donor",
    phone: "",
    city: "",
    pincode: "",
  });
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGetLocation = async () => {
    setGettingLocation(true);
    try {
      const location = await getLocationDetails();
      setFormData({
        ...formData,
        city: location.city,
        pincode: location.pincode,
      });
      toast.success(`Location detected: ${location.city}`);
    } catch (err) {
      toast.error("Failed to get location. Please enter manually.");
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = await register(formData);
      toast.success(`Welcome to Social Mentor, ${userData.name}!`);
      navigate("/donor/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-900 via-red-900 to-orange-800 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="mb-8">
          <Link
            to="/"
            className="text-orange-300 hover:text-orange-200 text-sm font-medium transition"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="bg-slate-800/70 backdrop-blur border border-orange-500/30 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎁</div>
            <h2 className="text-3xl font-bold text-orange-400 mb-2">
              Donor Sign Up
            </h2>
            <p className="text-slate-400 text-sm">
              Join us to donate and make a difference
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="donor@example.com"
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
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="9876543210"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Mumbai"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="400001"
                  required
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleGetLocation}
              disabled={gettingLocation}
              className="w-full py-2 px-4 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 transition flex items-center justify-center gap-2"
            >
              {gettingLocation
                ? "📍 Getting location..."
                : "📍 Auto-detect Location"}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition transform hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Donor Account"}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-slate-400 text-sm">
              Already have an account?{" "}
              <Link
                to="/donor/login"
                className="text-orange-400 hover:text-orange-300 font-medium"
              >
                Sign In
              </Link>
            </p>
            <div className="flex justify-center gap-4 text-xs text-slate-500">
              <Link
                to="/volunteer/register"
                className="hover:text-green-400 transition"
              >
                Volunteer Sign Up →
              </Link>
              <Link
                to="/organization/register"
                className="hover:text-blue-400 transition"
              >
                Organization Sign Up →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorRegister;
