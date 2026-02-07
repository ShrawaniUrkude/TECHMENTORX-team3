import { useState, useEffect } from "react";
import { donationAPI } from "../services/api";
import { getLocationDetails } from "../utils/location";
import toast from "react-hot-toast";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";

const volunteerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const categories = [
  {
    id: "food",
    name: "Food",
    icon: "🍞",
    color: "from-orange-500 to-red-500",
    urgent: true,
  },
  {
    id: "clothes",
    name: "Clothes",
    icon: "👕",
    color: "from-blue-500 to-indigo-500",
    urgent: false,
  },
  {
    id: "books",
    name: "Books",
    icon: "📚",
    color: "from-green-500 to-teal-500",
    urgent: false,
  },
  {
    id: "electronics",
    name: "Electronics",
    icon: "💻",
    color: "from-purple-500 to-pink-500",
    urgent: false,
  },
  {
    id: "furniture",
    name: "Furniture",
    icon: "🛋️",
    color: "from-yellow-500 to-orange-500",
    urgent: false,
  },
  {
    id: "medical",
    name: "Medical",
    icon: "💊",
    color: "from-red-500 to-pink-500",
    urgent: true,
  },
  {
    id: "toys",
    name: "Toys",
    icon: "🧸",
    color: "from-pink-500 to-purple-500",
    urgent: false,
  },
  {
    id: "other",
    name: "Other",
    icon: "📦",
    color: "from-slate-500 to-slate-600",
    urgent: false,
  },
];

const impactBadges = [
  {
    id: 1,
    name: "First Step",
    icon: "🌱",
    desc: "Made your first donation",
    threshold: 1,
    color: "text-green-400",
  },
  {
    id: 2,
    name: "Generous Heart",
    icon: "💚",
    desc: "5 donations completed",
    threshold: 5,
    color: "text-emerald-400",
  },
  {
    id: 3,
    name: "Community Hero",
    icon: "⭐",
    desc: "10 donations completed",
    threshold: 10,
    color: "text-yellow-400",
  },
  {
    id: 4,
    name: "Champion",
    icon: "🏆",
    desc: "25 donations completed",
    threshold: 25,
    color: "text-orange-400",
  },
  {
    id: 5,
    name: "Legend",
    icon: "👑",
    desc: "50+ donations completed",
    threshold: 50,
    color: "text-purple-400",
  },
];

const urgentNeeds = [
  {
    id: 1,
    category: "food",
    need: "Fresh Vegetables",
    location: "Andheri West",
    urgency: "Critical",
    time: "2h ago",
  },
  {
    id: 2,
    category: "medical",
    need: "First Aid Supplies",
    location: "Bandra",
    urgency: "High",
    time: "4h ago",
  },
  {
    id: 3,
    category: "clothes",
    need: "Winter Clothes",
    location: "Kurla",
    urgency: "Medium",
    time: "6h ago",
  },
];

const thankYouNotes = [
  {
    id: 1,
    from: "Hope Foundation",
    message: "Your food donation fed 50 families. Thank you!",
    date: "2 days ago",
    avatar: "🏠",
  },
  {
    id: 2,
    from: "Care NGO",
    message: "The books you donated are now in our library. Amazing!",
    date: "5 days ago",
    avatar: "📖",
  },
  {
    id: 3,
    from: "Smile Trust",
    message: "Your clothes brought warmth to many children. Grateful!",
    date: "1 week ago",
    avatar: "💝",
  },
];

const DonorDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState([19.076, 72.8777]); // Mumbai default
  const [showLiveTracking, setShowLiveTracking] = useState(false);
  const [trackingDonation, setTrackingDonation] = useState(null);
  const [volunteerPosition, setVolunteerPosition] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "food",
    quantity: "",
    pickupAddress: "",
    city: "",
    pincode: "",
  });

  useEffect(() => {
    fetchDonations();
    const interval = setInterval(fetchDonations, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await donationAPI.getMyDonations();
      // Merge with any local donations
      const localDonations = JSON.parse(
        localStorage.getItem("localDonations") || "[]",
      );
      setDonations([...localDonations, ...response.data]);
    } catch (error) {
      console.error("Failed to fetch donations:", error);
      // Load local donations if available
      const localDonations = JSON.parse(
        localStorage.getItem("localDonations") || "[]",
      );
      if (localDonations.length > 0) {
        setDonations(localDonations);
      } else {
        // Demo data for hackathon
        setDonations([
          {
            _id: "1",
            title: "Rice Bags",
            description: "25kg rice bags for distribution",
            category: "food",
            quantity: "25 kg",
            pickupAddress: "123 Main St",
            city: "Mumbai",
            pincode: "400001",
            status: "DELIVERED",
          },
        ]);
      }
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category.id);
    setFormData({
      ...formData,
      category: category.id,
      title: `${category.name} Donation`,
    });
    setShowForm(true);
    toast.success(`Selected: ${category.name}`);
  };

  const earnedBadges = impactBadges.filter(
    (badge) => donations.length >= badge.threshold,
  );
  const nextBadge = impactBadges.find(
    (badge) => donations.length < badge.threshold,
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGetLocation = async () => {
    setGettingLocation(true);
    try {
      console.log("Getting location...");
      const location = await getLocationDetails();
      console.log("Location received:", location);

      setFormData({
        ...formData,
        city: location.city,
        pincode: location.pincode,
      });

      alert(
        `Location detected!\nCity: ${location.city}\nPincode: ${location.pincode}`,
      );
    } catch (err) {
      console.error("Location error:", err);
      alert(
        err.message ||
          "Failed to get location. Please enable location access in your browser or enter manually.",
      );
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await donationAPI.create(formData);
      toast.success("Donation created successfully! 🎉");
      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        category: "food",
        quantity: "",
        pickupAddress: "",
        city: "",
        pincode: "",
      });
      fetchDonations();
    } catch (error) {
      console.error("Create donation error:", error);
      // Fallback: Add donation locally if backend fails
      const newDonation = {
        _id: "local-" + Date.now(),
        ...formData,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      // Save to localStorage
      const localDonations = JSON.parse(
        localStorage.getItem("localDonations") || "[]",
      );
      localDonations.unshift(newDonation);
      localStorage.setItem("localDonations", JSON.stringify(localDonations));

      setDonations((prev) => [newDonation, ...prev]);
      toast.success("Donation saved! 🎉");
      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        category: "food",
        quantity: "",
        pickupAddress: "",
        city: "",
        pincode: "",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      CREATED: "bg-blue-100 text-blue-800",
      ASSIGNED: "bg-yellow-100 text-yellow-800",
      PICKED_UP: "bg-purple-100 text-purple-800",
      DELIVERED: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2">
            Donor Dashboard
          </h1>
          <p className="text-slate-400">Make an impact with every donation</p>
        </div>

        {/* Impact Badges Section */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🏆</span> Your Impact Badges
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            {impactBadges.map((badge) => {
              const isEarned = donations.length >= badge.threshold;
              return (
                <div
                  key={badge.id}
                  className={`text-center p-4 rounded-xl border-2 transition ${
                    isEarned
                      ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50"
                      : "bg-slate-700/30 border-slate-600 opacity-50"
                  }`}
                >
                  <div
                    className={`text-4xl mb-2 ${isEarned ? "animate-bounce" : "grayscale"}`}
                  >
                    {badge.icon}
                  </div>
                  <p
                    className={`text-sm font-bold ${isEarned ? badge.color : "text-slate-400"}`}
                  >
                    {badge.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{badge.desc}</p>
                </div>
              );
            })}
          </div>
          {nextBadge && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
              <p className="text-blue-300 text-sm">
                <span className="font-bold">
                  {nextBadge.threshold - donations.length} more donation(s)
                </span>{" "}
                to unlock <span className="font-bold">{nextBadge.name}</span>{" "}
                {nextBadge.icon}
              </p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Category Icons Section */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📦</span> What are you giving today?
              </h2>
              <div className="grid grid-cols-4 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category)}
                    className={`relative p-4 rounded-xl border-2 transition transform hover:scale-105 ${
                      selectedCategory === category.id
                        ? "bg-gradient-to-br " +
                          category.color +
                          " border-white shadow-lg"
                        : "bg-slate-700/50 border-slate-600 hover:border-green-500/50"
                    }`}
                  >
                    {category.urgent && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    )}
                    <div className="text-4xl mb-2">{category.icon}</div>
                    <p className="text-white text-xs font-semibold">
                      {category.name}
                    </p>
                  </button>
                ))}
              </div>
              <p className="text-slate-400 text-xs mt-4 text-center">
                ⚠️ Red dot = Urgent need in your area
              </p>
            </div>

            {/* Urgent Needs Feed */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🚨</span> Urgent Needs Near You
              </h2>
              <div className="space-y-3">
                {urgentNeeds.map((need) => (
                  <div
                    key={need.id}
                    className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-red-500/50 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              need.urgency === "Critical"
                                ? "bg-red-500 text-white"
                                : need.urgency === "High"
                                  ? "bg-orange-500 text-white"
                                  : "bg-yellow-500 text-black"
                            }`}
                          >
                            {need.urgency}
                          </span>
                          <span className="text-white font-semibold">
                            {need.need}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm">
                          📍 {need.location} • {need.time}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const cat = categories.find(
                            (c) => c.id === need.category,
                          );
                          if (cat) handleCategoryClick(cat);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition"
                      >
                        Donate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Donation Form */}
            {showForm && (
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl shadow-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    New Donation
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        required
                        placeholder="e.g., Rice Bags"
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
                        value={formData.title}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Category
                      </label>
                      <select
                        name="category"
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
                        value={formData.category}
                        onChange={handleChange}
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      required
                      rows="3"
                      placeholder="Describe your donation in detail..."
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition resize-none"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Quantity
                      </label>
                      <input
                        type="text"
                        name="quantity"
                        required
                        placeholder="e.g., 10 kg"
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
                        value={formData.quantity}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Pickup Address
                      </label>
                      <input
                        type="text"
                        name="pickupAddress"
                        required
                        placeholder="Full address"
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
                        value={formData.pickupAddress}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        placeholder="City"
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Pincode
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        required
                        placeholder="Pincode"
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
                        value={formData.pincode}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Map Picker */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowMap(!showMap)}
                      className="w-full flex justify-center items-center py-3 px-4 border border-green-500/50 text-green-400 hover:bg-green-500/10 font-medium rounded-lg transition"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                        />
                      </svg>
                      {showMap ? "Hide Map" : "🗺️ Pick Location on Map"}
                    </button>
                    {showMap && (
                      <div className="mt-4 rounded-xl overflow-hidden border-2 border-green-500/50">
                        <MapContainer
                          center={mapCenter}
                          zoom={13}
                          scrollWheelZoom={true}
                          style={{ height: "300px", width: "100%" }}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; OpenStreetMap contributors"
                          />
                          <Marker position={mapCenter} icon={volunteerIcon}>
                            <Popup>Your pickup location</Popup>
                          </Marker>
                        </MapContainer>
                        <p className="text-xs text-slate-400 mt-2 text-center">
                          Click on map to set pickup location
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={gettingLocation}
                    className="w-full flex justify-center items-center py-3 px-4 border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {gettingLocation ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Detecting Location...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        📍 Use My Current Location
                      </>
                    )}
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading ? "Creating..." : "✨ Create Donation"}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Thank You Wall */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">💝</span> Thank You Wall
              </h2>
              <div className="space-y-4">
                {thankYouNotes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-xl p-4 hover:border-pink-500/50 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{note.avatar}</div>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm mb-1">
                          {note.from}
                        </p>
                        <p className="text-slate-300 text-sm mb-2">
                          "{note.message}"
                        </p>
                        <p className="text-slate-500 text-xs">{note.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-sm text-green-400 hover:text-green-300 font-medium transition">
                View all messages →
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Your Impact</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Donations</span>
                  <span className="text-2xl font-bold text-green-400">
                    {donations.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Families Helped</span>
                  <span className="text-2xl font-bold text-blue-400">
                    {donations.length * 12}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Impact Score</span>
                  <span className="text-2xl font-bold text-purple-400">
                    {donations.length * 150}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Donations History */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            My Donations History
          </h2>
          {donations.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-slate-400 text-lg mb-4">No donations yet</p>
              <p className="text-slate-500 text-sm">
                Click on a category above to start your first donation!
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {donations.map((donation) => (
                <div
                  key={donation._id}
                  className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-blue-500/50 transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">
                          {donation.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            donation.status === "CREATED"
                              ? "bg-blue-500/20 text-blue-300"
                              : donation.status === "ASSIGNED"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : donation.status === "PICKED_UP"
                                  ? "bg-purple-500/20 text-purple-300"
                                  : "bg-green-500/20 text-green-300"
                          }`}
                        >
                          {donation.status === "CREATED"
                            ? "📋"
                            : donation.status === "ASSIGNED"
                              ? "👤"
                              : donation.status === "PICKED_UP"
                                ? "🚚"
                                : "✓"}{" "}
                          {donation.status}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm mb-3">
                        {donation.description}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400">Category</p>
                          <p className="text-white font-medium">
                            {donation.category}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Quantity</p>
                          <p className="text-white font-medium">
                            {donation.quantity}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Location</p>
                          <p className="text-white font-medium">
                            {donation.city}, {donation.pincode}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Address</p>
                          <p className="text-white font-medium text-xs truncate">
                            {donation.pickupAddress}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Track Live Button */}
                    {donation.status !== "CREATED" &&
                      donation.status !== "DELIVERED" && (
                        <button
                          onClick={() => {
                            setTrackingDonation(donation);
                            setShowLiveTracking(true);
                            // Simulate volunteer position
                            setVolunteerPosition({
                              lat: 19.076 + (Math.random() - 0.5) * 0.02,
                              lng: 72.8777 + (Math.random() - 0.5) * 0.02,
                              lastUpdated: new Date(),
                            });
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition flex items-center gap-2 text-sm font-semibold"
                        >
                          📍 Track Live
                        </button>
                      )}
                  </div>
                  {donation.assignedVolunteer && (
                    <div className="pt-4 border-t border-slate-700 mt-4">
                      <p className="text-blue-400 text-sm">
                        👤 Assigned to:{" "}
                        <span className="font-semibold">
                          {donation.assignedVolunteer.name}
                        </span>
                      </p>
                      {donation.volunteerLocation?.latitude &&
                        donation.volunteerLocation?.longitude && (
                          <div className="mt-3 text-sm text-slate-300">
                            <p>
                              📍 Volunteer Location:{" "}
                              {donation.volunteerLocation.latitude.toFixed(6)},{" "}
                              {donation.volunteerLocation.longitude.toFixed(6)}
                            </p>
                            {donation.volunteerLocation.lastUpdated && (
                              <p className="text-slate-400 text-xs mt-1">
                                Last updated:{" "}
                                {new Date(
                                  donation.volunteerLocation.lastUpdated,
                                ).toLocaleTimeString()}
                              </p>
                            )}
                            <div className="mt-4 rounded-xl overflow-hidden border border-slate-700">
                              <MapContainer
                                center={[
                                  donation.volunteerLocation.latitude,
                                  donation.volunteerLocation.longitude,
                                ]}
                                zoom={15}
                                scrollWheelZoom={false}
                                style={{ height: "220px", width: "100%" }}
                              >
                                <TileLayer
                                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                  attribution="&copy; OpenStreetMap contributors"
                                />
                                <Marker
                                  position={[
                                    donation.volunteerLocation.latitude,
                                    donation.volunteerLocation.longitude,
                                  ]}
                                  icon={volunteerIcon}
                                >
                                  <Popup>Volunteer is here</Popup>
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

      {/* Live Tracking Modal */}
      {showLiveTracking && trackingDonation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto border border-slate-700">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    📍 Live Tracking
                    <span className="flex items-center gap-1 text-sm font-normal bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Live
                    </span>
                  </h2>
                  <p className="text-slate-400 mt-1">
                    Tracking: {trackingDonation.title}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowLiveTracking(false);
                    setTrackingDonation(null);
                  }}
                  className="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Status Timeline */}
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-4">
                  Delivery Progress
                </h3>
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-5 left-0 right-0 h-1 bg-slate-700"></div>
                  <div
                    className="absolute top-5 left-0 h-1 bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                    style={{
                      width:
                        trackingDonation.status === "ASSIGNED"
                          ? "33%"
                          : trackingDonation.status === "PICKED_UP"
                            ? "66%"
                            : trackingDonation.status === "DELIVERED"
                              ? "100%"
                              : "0%",
                    }}
                  ></div>

                  {/* Step 1: Created */}
                  <div className="flex flex-col items-center z-10">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      ✓
                    </div>
                    <span className="text-xs text-slate-400 mt-2">Created</span>
                  </div>

                  {/* Step 2: Assigned */}
                  <div className="flex flex-col items-center z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        ["ASSIGNED", "PICKED_UP", "DELIVERED"].includes(
                          trackingDonation.status,
                        )
                          ? "bg-blue-500 text-white"
                          : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      {["ASSIGNED", "PICKED_UP", "DELIVERED"].includes(
                        trackingDonation.status,
                      )
                        ? "✓"
                        : "2"}
                    </div>
                    <span className="text-xs text-slate-400 mt-2">
                      Assigned
                    </span>
                  </div>

                  {/* Step 3: Picked Up */}
                  <div className="flex flex-col items-center z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        ["PICKED_UP", "DELIVERED"].includes(
                          trackingDonation.status,
                        )
                          ? "bg-purple-500 text-white"
                          : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      {["PICKED_UP", "DELIVERED"].includes(
                        trackingDonation.status,
                      )
                        ? "✓"
                        : "3"}
                    </div>
                    <span className="text-xs text-slate-400 mt-2">
                      Picked Up
                    </span>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className="flex flex-col items-center z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        trackingDonation.status === "DELIVERED"
                          ? "bg-green-500 text-white"
                          : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      {trackingDonation.status === "DELIVERED" ? "✓" : "4"}
                    </div>
                    <span className="text-xs text-slate-400 mt-2">
                      Delivered
                    </span>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="rounded-xl overflow-hidden border border-slate-700 mb-6">
                <MapContainer
                  center={
                    volunteerPosition
                      ? [volunteerPosition.lat, volunteerPosition.lng]
                      : mapCenter
                  }
                  zoom={14}
                  scrollWheelZoom={true}
                  style={{ height: "350px", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  {/* Volunteer Marker */}
                  {volunteerPosition && (
                    <Marker
                      position={[volunteerPosition.lat, volunteerPosition.lng]}
                      icon={volunteerIcon}
                    >
                      <Popup>
                        <div className="text-center">
                          <p className="font-bold">🚚 Volunteer</p>
                          <p className="text-sm">
                            {trackingDonation.assignedVolunteer?.name ||
                              "Volunteer"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Updated:{" "}
                            {volunteerPosition.lastUpdated?.toLocaleTimeString()}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                  {/* Pickup Location */}
                  <Circle
                    center={mapCenter}
                    radius={200}
                    pathOptions={{
                      color: "blue",
                      fillColor: "blue",
                      fillOpacity: 0.2,
                    }}
                  />
                </MapContainer>
              </div>

              {/* Info Cards */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <h4 className="text-slate-400 text-sm mb-2">
                    Volunteer Info
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-xl">
                      👤
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        {trackingDonation.assignedVolunteer?.name ||
                          "Assigned Volunteer"}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {trackingDonation.assignedVolunteer?.phone ||
                          "Contact via app"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-xl p-4">
                  <h4 className="text-slate-400 text-sm mb-2">
                    Estimated Arrival
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xl">
                      ⏱️
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        {trackingDonation.status === "PICKED_UP"
                          ? "15-20 minutes"
                          : "Awaiting pickup"}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {trackingDonation.status === "PICKED_UP"
                          ? "En route to destination"
                          : "Volunteer will arrive soon"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;
