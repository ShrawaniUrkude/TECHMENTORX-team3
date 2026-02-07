import { useState, useEffect } from 'react';
import { donationAPI } from '../services/api';
import { getLocationDetails } from '../utils/location';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const volunteerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const DonorDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'food',
    quantity: '',
    pickupAddress: '',
    city: '',
    pincode: ''
  });

  useEffect(() => {
    fetchDonations();
    const interval = setInterval(fetchDonations, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await donationAPI.getMyDonations();
      setDonations(response.data);
    } catch (error) {
      console.error('Failed to fetch donations:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGetLocation = async () => {
    setGettingLocation(true);
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
      alert(err.message || 'Failed to get location. Please enable location access in your browser or enter manually.');
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await donationAPI.create(formData);
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        category: 'food',
        quantity: '',
        pickupAddress: '',
        city: '',
        pincode: ''
      });
      fetchDonations();
    } catch (error) {
      toast.error('Failed to create donation');
      toast.success(`Location detected: ${location.city}`);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            Donor Dashboard
          </h1>
          <p className="text-slate-400">Create and track your donations</p>
        </div>

        {/* Create Donation Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold transition transform hover:scale-105 shadow-lg"
          >
            {showForm ? '✕ Cancel' : '+ Create Donation'}
          </button>
        </div>

        {/* Donation Form */}
        {showForm && (
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">New Donation</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g., Rice Bags"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                  <select
                    name="category"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="food">🍞 Food</option>
                    <option value="clothes">👕 Clothes</option>
                    <option value="books">📚 Books</option>
                    <option value="electronics">💻 Electronics</option>
                    <option value="furniture">🛋️ Furniture</option>
                    <option value="other">📦 Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  name="description"
                  required
                  rows="3"
                  placeholder="Describe your donation in detail..."
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition resize-none"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Quantity</label>
                  <input
                    type="text"
                    name="quantity"
                    required
                    placeholder="e.g., 10 kg"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    value={formData.quantity}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Pickup Address</label>
                  <input
                    type="text"
                    name="pickupAddress"
                    required
                    placeholder="Full address"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    value={formData.pickupAddress}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="City"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    placeholder="Pincode"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    value={formData.pincode}
                    onChange={handleChange}
                  />
                </div>
              </div>

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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? 'Creating...' : 'Create Donation'}
              </button>
            </form>
          </div>
        )}

        {/* Donations List */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">My Donations</h2>
          {donations.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-12 text-center">
              <p className="text-slate-400 text-lg">No donations yet. Create your first donation!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {donations.map((donation) => (
                <div key={donation._id} className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-blue-500/50 transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{donation.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          donation.status === 'CREATED' ? 'bg-blue-500/20 text-blue-300' :
                          donation.status === 'ASSIGNED' ? 'bg-yellow-500/20 text-yellow-300' :
                          donation.status === 'PICKED_UP' ? 'bg-purple-500/20 text-purple-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {donation.status === 'CREATED' ? '📋' : donation.status === 'ASSIGNED' ? '👤' : donation.status === 'PICKED_UP' ? '🚚' : '✓'} {donation.status}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm mb-3">{donation.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400">Category</p>
                          <p className="text-white font-medium">{donation.category}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Quantity</p>
                          <p className="text-white font-medium">{donation.quantity}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Location</p>
                          <p className="text-white font-medium">{donation.city}, {donation.pincode}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Address</p>
                          <p className="text-white font-medium text-xs truncate">{donation.pickupAddress}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {donation.assignedVolunteer && (
                    <div className="pt-4 border-t border-slate-700 mt-4">
                      <p className="text-blue-400 text-sm">
                        👤 Assigned to: <span className="font-semibold">{donation.assignedVolunteer.name}</span>
                      </p>
                      {donation.volunteerLocation?.latitude && donation.volunteerLocation?.longitude && (
                        <div className="mt-3 text-sm text-slate-300">
                          <p>
                            📍 Volunteer Location: {donation.volunteerLocation.latitude.toFixed(6)}, {donation.volunteerLocation.longitude.toFixed(6)}
                          </p>
                          {donation.volunteerLocation.lastUpdated && (
                            <p className="text-slate-400 text-xs mt-1">
                              Last updated: {new Date(donation.volunteerLocation.lastUpdated).toLocaleTimeString()}
                            </p>
                          )}
                          <div className="mt-4 rounded-xl overflow-hidden border border-slate-700">
                            <MapContainer
                              center={[donation.volunteerLocation.latitude, donation.volunteerLocation.longitude]}
                              zoom={15}
                              scrollWheelZoom={false}
                              style={{ height: '220px', width: '100%' }}
                            >
                              <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="&copy; OpenStreetMap contributors"
                              />
                              <Marker
                                position={[donation.volunteerLocation.latitude, donation.volunteerLocation.longitude]}
                                icon={volunteerIcon}
                              >
                                <Popup>
                                  Volunteer is here
                                </Popup>
                              </Marker>
                            </MapContainer>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
