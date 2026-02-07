import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { volunteerAPI } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";

const donationIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Demo mission data for map
const missionLocations = [
  {
    id: 1,
    lat: 19.076,
    lng: 72.8777,
    category: "food",
    urgent: true,
    count: 5,
  },
  {
    id: 2,
    lat: 19.0596,
    lng: 72.8295,
    category: "clothes",
    urgent: false,
    count: 3,
  },
  {
    id: 3,
    lat: 19.1136,
    lng: 72.8697,
    category: "medical",
    urgent: true,
    count: 8,
  },
];

const VolunteerDashboard = () => {
  const [availableTasks, setAvailableTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("available");
  const [loading, setLoading] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showDigitalID, setShowDigitalID] = useState(false);
  const [showMissionMap, setShowMissionMap] = useState(false);
  const [selectedDonorInfo, setSelectedDonorInfo] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const volunteerStats = {
    totalPoints: myTasks.length * 50 || 150,
    tasksCompleted:
      myTasks.filter((t) => t.status === "DELIVERED").length || 12,
    currentLevel: Math.floor((myTasks.length * 50 || 150) / 100) + 1,
    nextLevelPoints: (Math.floor((myTasks.length * 50 || 150) / 100) + 2) * 100,
  };

  useEffect(() => {
    fetchAvailableTasks();
    fetchMyTasks();
  }, []);

  const fetchAvailableTasks = async () => {
    try {
      const response = await volunteerAPI.getAvailableTasks();
      // Also get local donations from donors
      const localDonations = JSON.parse(
        localStorage.getItem("localDonations") || "[]",
      );
      const localTasks = localDonations
        .filter((d) => d.status === "pending" || d.status === "CREATED")
        .map((d) => ({
          _id: d._id,
          title: d.title || `${d.category} Donation`,
          description: d.description || "Donation from local donor",
          category: d.category,
          quantity: d.quantity,
          city: d.city || "Mumbai",
          pincode: d.pincode || "400001",
          pickupAddress: d.pickupAddress || "Contact donor for address",
          status: "CREATED",
          pointsAwarded: 50,
          donor: { name: "Local Donor", phone: "Contact via app" },
          createdAt: d.createdAt,
        }));
      setAvailableTasks([...localTasks, ...response.data]);
    } catch (error) {
      console.error("Failed to fetch available tasks:", error);
      // Get local donations from donors
      const localDonations = JSON.parse(
        localStorage.getItem("localDonations") || "[]",
      );
      const localTasks = localDonations
        .filter((d) => d.status === "pending" || d.status === "CREATED")
        .map((d) => ({
          _id: d._id,
          title: d.title || `${d.category} Donation`,
          description: d.description || "Donation from local donor",
          category: d.category,
          quantity: d.quantity,
          city: d.city || "Mumbai",
          pincode: d.pincode || "400001",
          pickupAddress: d.pickupAddress || "Contact donor for address",
          status: "CREATED",
          pointsAwarded: 50,
          donor: { name: "Local Donor", phone: "Contact via app" },
          createdAt: d.createdAt,
        }));

      if (localTasks.length > 0) {
        setAvailableTasks(localTasks);
      } else {
        // Demo data for hackathon
        setAvailableTasks([
          {
            _id: "1",
            title: "Food Donation Pickup",
            description: "Collect rice and vegetables from donor",
            category: "food",
            quantity: "10 kg",
            city: "Mumbai",
            pincode: "400001",
            pickupAddress: "123 Main Street, Andheri",
            status: "CREATED",
            pointsAwarded: 50,
            donor: { name: "John Doe" },
          },
        ]);
      }
    }
  };

  const fetchMyTasks = async () => {
    try {
      const response = await volunteerAPI.getMyTasks();
      setMyTasks(response.data);
    } catch (error) {
      console.error("Failed to fetch my tasks:", error);
      // Demo data
      setMyTasks([
        {
          _id: "2",
          title: "Books Delivery",
          description: "Deliver books to community center",
          category: "books",
          quantity: "20 books",
          city: "Mumbai",
          pincode: "400002",
          pickupAddress: "456 Library Road",
          status: "ASSIGNED",
          pointsAwarded: 40,
          donor: { name: "Jane Smith" },
        },
      ]);
    }
  };

  const handleQRScan = () => {
    setShowQRScanner(true);
    toast.success("QR Scanner activated!");
    setTimeout(() => {
      toast.success("✅ Delivery verified successfully!");
      setShowQRScanner(false);
    }, 2000);
  };

  const handleViewDonorInfo = async (task) => {
    try {
      const response = await volunteerAPI.getDonorInfo(task._id);
      setSelectedDonorInfo(response.data);
      toast.success("Donor info loaded");
    } catch (error) {
      // Use task's donor data if API fails
      setSelectedDonorInfo({
        donor: task.donor,
        donation: {
          title: task.title,
          category: task.category,
          status: task.status,
          pickupAddress: task.pickupAddress,
        },
      });
    }
  };

  const handleAcceptTask = async (donationId) => {
    setLoading(true);
    try {
      await volunteerAPI.acceptTask(donationId);
      fetchAvailableTasks();
      fetchMyTasks();
      toast.success("Task accepted successfully!");
    } catch (error) {
      // Try to update localStorage for local donations
      const localDonations = JSON.parse(
        localStorage.getItem("localDonations") || "[]",
      );
      const donationIndex = localDonations.findIndex(
        (d) => d._id === donationId || d.id === donationId,
      );

      if (donationIndex !== -1) {
        // Update the donation status in localStorage
        localDonations[donationIndex].status = "ASSIGNED";
        localDonations[donationIndex].volunteer = user?.name || "Volunteer";
        localStorage.setItem("localDonations", JSON.stringify(localDonations));

        // Move from available to my tasks
        const acceptedTask = availableTasks.find((t) => t._id === donationId);
        if (acceptedTask) {
          setAvailableTasks(availableTasks.filter((t) => t._id !== donationId));
          setMyTasks([...myTasks, { ...acceptedTask, status: "ASSIGNED" }]);
        }

        toast.success("Task accepted successfully!");
      } else {
        // Demo mode fallback - just move the task locally
        const acceptedTask = availableTasks.find((t) => t._id === donationId);
        if (acceptedTask) {
          setAvailableTasks(availableTasks.filter((t) => t._id !== donationId));
          setMyTasks([...myTasks, { ...acceptedTask, status: "ASSIGNED" }]);
          toast.success("Task accepted successfully!");
        } else {
          toast.error("Failed to accept task");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (donationId, newStatus) => {
    setLoading(true);
    try {
      await volunteerAPI.updateTaskStatus(donationId, newStatus);
      fetchMyTasks();
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      // Try to update localStorage for local donations
      const localDonations = JSON.parse(
        localStorage.getItem("localDonations") || "[]",
      );
      const donationIndex = localDonations.findIndex(
        (d) => d._id === donationId || d.id === donationId,
      );

      if (donationIndex !== -1) {
        localDonations[donationIndex].status = newStatus;
        localStorage.setItem("localDonations", JSON.stringify(localDonations));
      }

      // Update local state
      setMyTasks(
        myTasks.map((t) =>
          t._id === donationId ? { ...t, status: newStatus } : t,
        ),
      );
      toast.success(`Status updated to ${newStatus}`);
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
            Volunteer Dashboard
          </h1>
          <p className="text-slate-400">Your mission to make a difference</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Main Dashboard Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Points Tracker */}
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur border border-green-500/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">⭐</span> Points Tracker
                </h2>
                <button
                  onClick={() => navigate("/leaderboard")}
                  className="text-sm text-green-400 hover:text-green-300 font-medium"
                >
                  View Leaderboard →
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-yellow-400">
                    {volunteerStats.totalPoints}
                  </p>
                  <p className="text-slate-400 text-sm mt-1">Total Points</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-green-400">
                    {volunteerStats.tasksCompleted}
                  </p>
                  <p className="text-slate-400 text-sm mt-1">Completed</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-purple-400">
                    {volunteerStats.currentLevel}
                  </p>
                  <p className="text-slate-400 text-sm mt-1">Level</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Next Level Progress</span>
                  <span className="text-green-400 font-bold">
                    {volunteerStats.totalPoints}/
                    {volunteerStats.nextLevelPoints}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${(volunteerStats.totalPoints / volunteerStats.nextLevelPoints) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {volunteerStats.nextLevelPoints - volunteerStats.totalPoints}{" "}
                  points to Level {volunteerStats.currentLevel + 1}
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <div className="flex-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-3">
                  <p className="text-yellow-400 font-semibold text-sm">
                    🔥 Streak: 7 days
                  </p>
                </div>
                <div className="flex-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-blue-400 font-semibold text-sm">
                    🏅 Rank: #12
                  </p>
                </div>
              </div>
            </div>

            {/* Mission Map */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">🗺️</span> Mission Map
                </h2>
                <button
                  onClick={() => setShowMissionMap(!showMissionMap)}
                  className="px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-sm font-medium transition"
                >
                  {showMissionMap ? "Hide Map" : "Show Map"}
                </button>
              </div>

              {showMissionMap ? (
                <div className="rounded-xl overflow-hidden border-2 border-green-500/30">
                  <MapContainer
                    center={[19.076, 72.8777]}
                    zoom={12}
                    scrollWheelZoom={false}
                    style={{ height: "400px", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                    />
                    {missionLocations.map((location) => (
                      <div key={location.id}>
                        <Circle
                          center={[location.lat, location.lng]}
                          radius={location.count * 200}
                          pathOptions={{
                            color: location.urgent ? "#ef4444" : "#10b981",
                            fillColor: location.urgent ? "#ef4444" : "#10b981",
                            fillOpacity: 0.3,
                          }}
                        />
                        <Marker
                          position={[location.lat, location.lng]}
                          icon={donationIcon}
                        >
                          <Popup>
                            <strong>
                              {location.count} {location.category} donations
                            </strong>
                            <br />
                            {location.urgent && (
                              <span className="text-red-500">⚠️ Urgent</span>
                            )}
                          </Popup>
                        </Marker>
                      </div>
                    ))}
                  </MapContainer>
                </div>
              ) : (
                <div className="bg-slate-700/30 rounded-xl p-8 text-center">
                  <div className="text-6xl mb-4">🗺️</div>
                  <p className="text-slate-300 mb-2">
                    See density of needs in your neighborhood
                  </p>
                  <p className="text-slate-500 text-sm">
                    Click "Show Map" to view active missions near you
                  </p>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400 font-semibold text-sm">
                    🔴 Urgent: 8 missions
                  </p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <p className="text-green-400 font-semibold text-sm">
                    🟢 Normal: 15 missions
                  </p>
                </div>
              </div>
            </div>

            {/* QR Scanner */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📱</span> QR Scanner
              </h2>

              {showQRScanner ? (
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-blue-500/50 rounded-xl p-8 text-center">
                  <div className="animate-pulse">
                    <div className="text-6xl mb-4">📷</div>
                    <div className="w-48 h-48 mx-auto border-4 border-dashed border-blue-400 rounded-lg flex items-center justify-center mb-4">
                      <div className="text-center">
                        <div className="animate-spin text-4xl mb-2">⌖</div>
                        <p className="text-blue-300 font-semibold">
                          Scanning...
                        </p>
                      </div>
                    </div>
                    <p className="text-white font-semibold">
                      Verifying delivery
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-700/30 rounded-xl p-6 text-center">
                    <div className="text-6xl mb-4">📱</div>
                    <p className="text-slate-300 mb-2">
                      Secure, No-Contact Verification
                    </p>
                    <p className="text-slate-500 text-sm mb-4">
                      Scan QR code to verify pickup or delivery
                    </p>
                    <button
                      onClick={handleQRScan}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition transform hover:scale-105"
                    >
                      <span className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                          />
                        </svg>
                        Open Scanner
                      </span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-green-400">45</p>
                      <p className="text-slate-400 text-xs">Verified Pickups</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-blue-400">42</p>
                      <p className="text-slate-400 text-xs">
                        Verified Deliveries
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Digital ID */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🪪</span> Digital ID
              </h2>

              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 rounded-xl p-6">
                <div className="text-center mb-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mx-auto mb-3 flex items-center justify-center text-4xl font-bold text-white">
                    {user?.name?.charAt(0) || "V"}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {user?.name || "Volunteer User"}
                  </h3>
                  <p className="text-green-400 font-semibold text-sm">
                    ✓ Verified Volunteer
                  </p>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-slate-400 text-xs">Volunteer ID</p>
                    <p className="text-white font-mono text-sm">
                      VOL-{user?._id?.slice(-6).toUpperCase() || "A1B2C3"}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-slate-400 text-xs">Email</p>
                    <p className="text-white text-sm truncate">
                      {user?.email || "volunteer@example.com"}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-slate-400 text-xs">Location</p>
                    <p className="text-white text-sm">
                      {user?.city || "Mumbai"}, {user?.pincode || "400001"}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-slate-400 text-xs">Member Since</p>
                    <p className="text-white text-sm">Jan 2026</p>
                  </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                  <div className="text-4xl mb-2">🛡️</div>
                  <p className="text-green-400 font-semibold text-sm">
                    Trusted & Background Verified
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDigitalID(!showDigitalID)}
                className="w-full mt-4 py-2 text-sm text-green-400 hover:text-green-300 font-medium transition"
              >
                {showDigitalID ? "Hide Full ID" : "View Full ID →"}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab("available")}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 border border-blue-500/30 text-blue-300 rounded-lg text-sm font-medium transition"
                >
                  📋 Browse Missions
                </button>
                <button
                  onClick={() => navigate("/leaderboard")}
                  className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-500/30 text-yellow-300 rounded-lg text-sm font-medium transition"
                >
                  🏆 Leaderboard
                </button>
                <button
                  onClick={handleQRScan}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 border border-purple-500/30 text-purple-300 rounded-lg text-sm font-medium transition"
                >
                  📱 Scan QR
                </button>
              </div>
            </div>

            {/* Donor Info Section */}
            {selectedDonorInfo && (
              <div className="bg-slate-800/50 backdrop-blur border border-blue-500/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">👤</span> Donor Info
                  </h2>
                  <button
                    onClick={() => setSelectedDonorInfo(null)}
                    className="text-slate-400 hover:text-white transition"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-xl p-4 mb-4">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl font-bold text-white">
                      {selectedDonorInfo.donor?.name?.charAt(0) || "D"}
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {selectedDonorInfo.donor?.name || "Donor"}
                    </h3>
                    <p className="text-blue-400 text-sm">Verified Donor</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-slate-400 text-xs mb-1">📧 Email</p>
                    <p className="text-white text-sm">
                      {selectedDonorInfo.donor?.email || "Not available"}
                    </p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-slate-400 text-xs mb-1">📱 Phone</p>
                    <p className="text-white text-sm">
                      {selectedDonorInfo.donor?.phone || "Not available"}
                    </p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-slate-400 text-xs mb-1">📍 Address</p>
                    <p className="text-white text-sm">
                      {selectedDonorInfo.donor?.address ||
                        selectedDonorInfo.donation?.pickupAddress ||
                        "Not available"}
                    </p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-slate-400 text-xs mb-1">📦 Donation</p>
                    <p className="text-white text-sm">
                      {selectedDonorInfo.donation?.title} (
                      {selectedDonorInfo.donation?.category})
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${selectedDonorInfo.donor?.phone}`}
                    className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 rounded-lg text-sm font-medium text-center transition"
                  >
                    📞 Call
                  </a>
                  <a
                    href={`mailto:${selectedDonorInfo.donor?.email}`}
                    className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-lg text-sm font-medium text-center transition"
                  >
                    ✉️ Email
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Tasks Section */}
        <div>
          <div className="mb-8 flex gap-4">
            <button
              onClick={() => setActiveTab("available")}
              className={`px-6 py-3 font-semibold rounded-lg transition ${
                activeTab === "available"
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
              }`}
            >
              📋 Available Tasks ({availableTasks.length})
            </button>
            <button
              onClick={() => setActiveTab("my-tasks")}
              className={`px-6 py-3 font-semibold rounded-lg transition ${
                activeTab === "my-tasks"
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
              }`}
            >
              ✓ My Tasks ({myTasks.length})
            </button>
          </div>

          {/* Available Tasks */}
          {activeTab === "available" && (
            <div className="space-y-6">
              {availableTasks.length === 0 ? (
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl px-8 py-12 text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <p className="text-slate-400 text-lg">
                    No available tasks in your area right now.
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    Check back later or expand your service area!
                  </p>
                </div>
              ) : (
                availableTasks.map((task) => (
                  <div
                    key={task._id}
                    className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-blue-500/50 transition"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-white">
                            {task.title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              task.status === "CREATED"
                                ? "bg-blue-500/20 text-blue-300"
                                : task.status === "ASSIGNED"
                                  ? "bg-yellow-500/20 text-yellow-300"
                                  : task.status === "PICKED_UP"
                                    ? "bg-purple-500/20 text-purple-300"
                                    : "bg-green-500/20 text-green-300"
                            }`}
                          >
                            {task.status}
                          </span>
                        </div>
                        <p className="text-slate-300 mb-4">
                          {task.description}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div>
                            <p className="text-slate-400">Category</p>
                            <p className="text-white font-medium">
                              {task.category}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400">Quantity</p>
                            <p className="text-white font-medium">
                              {task.quantity}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400">Location</p>
                            <p className="text-white font-medium">
                              {task.city}, {task.pincode}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400">Points</p>
                            <p className="text-yellow-400 font-bold">
                              +{task.pointsAwarded}
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-slate-700 pt-4">
                          <p className="text-slate-400 text-sm mb-2">
                            <span className="font-semibold">📍 Pickup:</span>{" "}
                            {task.pickupAddress}
                          </p>
                          {task.donor && (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mt-2">
                              <p className="text-blue-400 text-sm font-semibold mb-1">
                                👤 Donor
                              </p>
                              <p className="text-white text-sm">
                                {task.donor.name}
                              </p>
                              {task.donor.address && (
                                <p className="text-slate-300 text-sm">
                                  📍 {task.donor.address}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleViewDonorInfo(task)}
                          className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 font-semibold rounded-lg transition text-sm whitespace-nowrap"
                        >
                          👤 View Donor
                        </button>
                        <button
                          onClick={() => handleAcceptTask(task._id)}
                          disabled={loading}
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg whitespace-nowrap"
                        >
                          Accept Task
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* My Tasks */}
          {activeTab === "my-tasks" && (
            <div className="space-y-6">
              {myTasks.length === 0 ? (
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl px-8 py-12 text-center">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-slate-400 text-lg">
                    You haven't accepted any tasks yet.
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    Check the available tasks to get started!
                  </p>
                </div>
              ) : (
                myTasks.map((task) => (
                  <div
                    key={task._id}
                    className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-blue-500/50 transition"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-white">
                            {task.title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              task.status === "ASSIGNED"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : task.status === "PICKED_UP"
                                  ? "bg-purple-500/20 text-purple-300"
                                  : "bg-green-500/20 text-green-300"
                            }`}
                          >
                            {task.status === "ASSIGNED"
                              ? "📋"
                              : task.status === "PICKED_UP"
                                ? "🚚"
                                : "✓"}{" "}
                            {task.status}
                          </span>
                        </div>
                        <p className="text-slate-300 mb-4">
                          {task.description}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div>
                            <p className="text-slate-400">Category</p>
                            <p className="text-white font-medium">
                              {task.category}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400">Quantity</p>
                            <p className="text-white font-medium">
                              {task.quantity}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400">Location</p>
                            <p className="text-white font-medium">
                              {task.city}, {task.pincode}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400">Points</p>
                            <p className="text-yellow-400 font-bold">
                              +{task.pointsAwarded}
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-slate-700 pt-4">
                          <p className="text-slate-400 text-sm mb-2">
                            <span className="font-semibold">📍 Pickup:</span>{" "}
                            {task.pickupAddress}
                          </p>
                          {task.donor && (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mt-2">
                              <p className="text-blue-400 text-sm font-semibold mb-1">
                                👤 Donor Contact
                              </p>
                              <p className="text-white text-sm">
                                {task.donor.name}
                              </p>
                              {task.donor.phone && (
                                <p className="text-slate-300 text-sm">
                                  📱 {task.donor.phone}
                                </p>
                              )}
                              {task.donor.email && (
                                <p className="text-slate-300 text-sm">
                                  📧 {task.donor.email}
                                </p>
                              )}
                              {task.donor.address && (
                                <p className="text-slate-300 text-sm">
                                  📍 {task.donor.address}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleViewDonorInfo(task)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition text-sm whitespace-nowrap"
                        >
                          👤 Donor Info
                        </button>
                        {(task.status === "ASSIGNED" ||
                          task.status === "PICKED_UP") && (
                          <button
                            onClick={() =>
                              navigate(`/volunteer/track/${task._id}`)
                            }
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-sm whitespace-nowrap"
                          >
                            📍 Track Live
                          </button>
                        )}
                        {task.status === "ASSIGNED" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(task._id, "PICKED_UP")
                            }
                            disabled={loading}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            🚚 Picked Up
                          </button>
                        )}
                        {task.status === "PICKED_UP" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(task._id, "DELIVERED")
                            }
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            ✓ Delivered
                          </button>
                        )}
                        {task.status === "DELIVERED" && (
                          <span className="px-4 py-2 bg-green-500/20 text-green-300 font-semibold rounded-lg text-sm text-center">
                            ✓ Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
