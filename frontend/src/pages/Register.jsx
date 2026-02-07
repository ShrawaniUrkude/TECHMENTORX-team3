import { useState, useContext } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getLocationDetails } from '../utils/location';
import toast from 'react-hot-toast';

const Register = () => {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: roleParam || 'donor',
    phone: '',
    city: '',
    pincode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGetLocation = async () => {
    setGettingLocation(true);
    setError('');
    try {
      console.log('Getting location...');
      const location = await getLocationDetails();
      console.log('Location received:', location);
      
      setFormData({
        ...formData,
        city: location.city,
        pincode: location.pincode
      });
      
      alert(`Location detected!\nCity: ${location.city}\nPincode: ${location.pincode}`);
    } catch (err) {
      console.error('Location error:', err);
      setError(err.message || 'Failed to get location. Please enable location access in your browser or enter manually.');
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await register(formData);
      toast.success(`Welcome to Social Mentor, ${userData.name}!`);
      
      // Redirect based on role
      if (userData.role === 'donor') {
        navigate('/donor/dashboard');
      } else if (userData.role === 'volunteer') {
        navigate('/volunteer/dashboard');
      } else if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      toast.error(errorMsg);
      toast.success(`Location detected: ${location.city}, ${location.pincode}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Back to Home link */}
        <div className="mb-8">
          <Link to="/" className="text-blue-400 hover:text-blue-300 text-sm font-medium transition">
            ← Back to Home
          </Link>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
              {formData.role === 'donor' ? '🎁 Donor Sign Up' : 
               formData.role === 'volunteer' ? '🤝 Volunteer Sign Up' : 
               '🏢 Organization Sign Up'}
            </h2>
            <p className="text-slate-400 text-sm">
              {formData.role === 'donor' ? 'Donate food & essentials' : 
               formData.role === 'volunteer' ? 'Deliver donations & earn points' : 
               'Manage team & campaigns'}
            </p>
          </div>

          {/* Role Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Select Your Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'donor' })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  formData.role === 'donor'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                🎁 Donor
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'volunteer' })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  formData.role === 'volunteer'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                🤝 Volunteer
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'organization' })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  formData.role === 'organization'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                🏢 Org
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="john@example.com"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength="6"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            {/* City and Pincode */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-slate-300 mb-2">
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="New York"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-slate-300 mb-2">
                  Pincode
                </label>
                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  placeholder="10001"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  value={formData.pincode}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Location Button */}
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={gettingLocation}
              className="w-full flex justify-center items-center py-3 px-4 border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {gettingLocation ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Detecting Location...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  📍 Use My Current Location
                </>
              )}
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">or</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-4">
              Already have an account?
            </p>
            <Link
              to="/login"
              className="inline-block w-full py-2 px-4 border border-slate-600 text-slate-300 hover:bg-slate-700 font-medium rounded-lg transition"
            >
              Sign In Instead
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-500 text-xs">
          <p>By registering, you agree to our Terms of Service</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
