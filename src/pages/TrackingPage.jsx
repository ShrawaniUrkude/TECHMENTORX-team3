import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { volunteerAPI } from '../services/api';

const TrackingPage = () => {
  const { donationId } = useParams();
  const navigate = useNavigate();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tracking, setTracking] = useState(false);
  const [volunteerLocation, setVolunteerLocation] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const intervalRef = useState(null);

  useEffect(() => {
    fetchTrackingInfo();
  }, [donationId]);

  useEffect(() => {
    if (tracking) {
      updateLocation();
      intervalRef.current = setInterval(() => {
        updateLocation();
      }, 10000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [tracking]);

  const fetchTrackingInfo = async () => {
    try {
      const response = await volunteerAPI.getTrackingInfo(donationId);
      console.log('Tracking info:', response.data);
      setDonation(response.data);
    } catch (err) {
      console.error('Tracking error:', err);
      setError('Failed to load tracking information');
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async () => {
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported');
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          
          setVolunteerLocation(location);
          setLastUpdate(new Date());

          // Send to backend
          await volunteerAPI.updateLocation(donationId, location.latitude, location.longitude);
          console.log('Location updated:', location);
        },
        (error) => {
          console.error('Location error:', error);
          setError('Failed to get location. Please enable location access.');
        }
      );
    } catch (err) {
      console.error('Update location error:', err);
      setError(err.message);
    }
  };

  const handleToggleTracking = () => {
    setTracking(!tracking);
    setError('');
  };

  const getStatusColor = (status) => {
    const colors = {
      CREATED: 'bg-blue-100 text-blue-800',
      ASSIGNED: 'bg-yellow-100 text-yellow-800',
      PICKED_UP: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500/30 border-t-blue-500 mx-auto"></div>
          <p className="mt-6 text-slate-300 text-lg font-medium">Loading tracking info...</p>
        </div>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-400 hover:text-blue-300 mb-6 flex items-center transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <div className="bg-red-500/20 backdrop-blur border border-red-500/50 rounded-2xl p-8 text-center">
            <p className="text-red-300 text-lg mb-6">{error || 'Donation not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-400 hover:text-blue-300 mb-6 flex items-center transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            📍 Live Delivery Tracking
          </h1>
        </div>

        {/* Donation Info Card */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-white">{donation.donation.title}</h2>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  donation.donation.status === 'CREATED' ? 'bg-blue-500/20 text-blue-300' :
                  donation.donation.status === 'ASSIGNED' ? 'bg-yellow-500/20 text-yellow-300' :
                  donation.donation.status === 'PICKED_UP' ? 'bg-purple-500/20 text-purple-300' :
                  'bg-green-500/20 text-green-300'
                }`}>
                  {donation.donation.status === 'PICKED_UP' ? '🚚' : '📦'} {donation.donation.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-slate-400 mb-1">Pickup Address</p>
                  <p className="text-white font-medium">{donation.donation.pickupAddress}</p>
                </div>
                {donation.donor && (
                  <div>
                    <p className="text-slate-400 mb-1">Donor Contact</p>
                    <p className="text-white font-medium">{donation.donor.name}</p>
                    {donation.donor.phone && <p className="text-slate-300 text-xs">{donation.donor.phone}</p>}
                  </div>
                )}
                {donation.volunteer && (
                  <div>
                    <p className="text-slate-400 mb-1">Volunteer</p>
                    <p className="text-white font-medium">{donation.volunteer.name}</p>
                    {donation.volunteer.phone && <p className="text-slate-300 text-xs">{donation.volunteer.phone}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tracking Control Card */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white">Location Tracking</h3>
              {lastUpdate && (
                <p className="text-slate-400 text-sm mt-1">
                  ⏱️ Last updated: {lastUpdate.toLocaleTimeString()}
                </p>
              )}
            </div>
            <button
              onClick={handleToggleTracking}
              className={`px-8 py-4 rounded-xl text-white font-bold text-lg transition transform hover:scale-105 shadow-lg ${
                tracking
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
              }`}
            >
              {tracking ? '⏹️ Stop Tracking' : '▶️ Start Tracking'}
            </button>
          </div>

          {volunteerLocation && (
            <div className="bg-slate-700/50 rounded-xl p-4 mb-4 border border-slate-600">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Current Location</p>
              <p className="text-white font-mono text-lg">
                📍 {volunteerLocation.latitude.toFixed(6)}, {volunteerLocation.longitude.toFixed(6)}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
              <p className="text-red-300 text-sm">⚠️ {error}</p>
            </div>
          )}

          {tracking && (
            <div className="flex items-center gap-2 text-blue-300 text-sm bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <svg className="animate-pulse w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8" />
              </svg>
              <span>Live tracking active • Location updates every 10 seconds</span>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur border border-blue-500/30 rounded-2xl p-8">
          <h3 className="font-bold text-blue-300 mb-4 text-lg flex items-center">
            <span className="mr-2">ℹ️</span> How Live Tracking Works
          </h3>
          <ul className="space-y-3 text-slate-300 text-sm">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 text-blue-400 font-bold mt-0.5">1</span>
              <span>Click "Start Tracking" to share your live location with the donor</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 text-blue-400 font-bold mt-0.5">2</span>
              <span>Your location updates automatically every 10 seconds</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 text-blue-400 font-bold mt-0.5">3</span>
              <span>The donor can see your real-time coordinates and track your progress</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 text-blue-400 font-bold mt-0.5">4</span>
              <span>Keep this page open while making the delivery for continuous tracking</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 text-blue-400 font-bold mt-0.5">5</span>
              <span>Click "Stop Tracking" when you've completed the delivery</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;
