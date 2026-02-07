import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { messageAPI, donationAPI } from "../services/api";
import toast from "react-hot-toast";

// Demo data for organization dashboard
const demoCampaigns = [
  {
    id: 1,
    name: "Winter Warmth Drive",
    status: "active",
    target: 500,
    collected: 320,
    type: "clothes",
    endDate: "2026-03-15",
  },
  {
    id: 2,
    name: "Food for All",
    status: "active",
    target: 1000,
    collected: 750,
    type: "food",
    endDate: "2026-02-28",
  },
  {
    id: 3,
    name: "Books for Children",
    status: "completed",
    target: 200,
    collected: 200,
    type: "books",
    endDate: "2026-01-31",
  },
];

const demoVolunteers = [
  {
    id: 1,
    name: "Jane Volunteer",
    status: "active",
    deliveries: 25,
    rating: 4.8,
    phone: "9876543211",
  },
  {
    id: 2,
    name: "Rahul Kumar",
    status: "active",
    deliveries: 18,
    rating: 4.5,
    phone: "9876543212",
  },
  {
    id: 3,
    name: "Priya Sharma",
    status: "inactive",
    deliveries: 12,
    rating: 4.9,
    phone: "9876543213",
  },
];

const demoDonations = [
  {
    id: 1,
    donor: "John Donor",
    item: "Rice Bags",
    quantity: "50 kg",
    status: "pending",
    date: "2026-02-06",
  },
  {
    id: 2,
    donor: "Mary Smith",
    item: "Winter Jackets",
    quantity: "20 items",
    status: "accepted",
    date: "2026-02-05",
  },
  {
    id: 3,
    donor: "Amit Patel",
    item: "School Books",
    quantity: "100 books",
    status: "delivered",
    date: "2026-02-04",
  },
];

const demoUrgentNeeds = [
  {
    id: 1,
    title: "Emergency Food Supply",
    category: "food",
    quantity: "500 kg",
    urgency: "critical",
    description: "Urgent food needed for flood victims in Eastern district",
    location: "Andheri East, Mumbai",
    deadline: "2026-02-08",
    fulfilled: 120,
    target: 500,
    createdAt: "2026-02-06",
  },
  {
    id: 2,
    title: "Medical Supplies Needed",
    category: "medical",
    quantity: "200 kits",
    urgency: "high",
    description: "First aid kits and medicines for health camp",
    location: "Dharavi, Mumbai",
    deadline: "2026-02-10",
    fulfilled: 50,
    target: 200,
    createdAt: "2026-02-05",
  },
  {
    id: 3,
    title: "Winter Blankets",
    category: "clothes",
    quantity: "300 blankets",
    urgency: "medium",
    description: "Warm blankets for homeless shelter",
    location: "Kurla, Mumbai",
    deadline: "2026-02-15",
    fulfilled: 100,
    target: 300,
    createdAt: "2026-02-04",
  },
];

const demoNeedyPersons = [
  {
    id: 1,
    name: "Ramesh Kumar",
    phone: "9876543001",
    address: "Dharavi, Mumbai",
    familySize: 5,
    needType: "food",
    verified: true,
    lastReceived: "2026-02-05",
    totalReceived: 3,
    status: "active",
    aadhaarLast4: "4521",
  },
  {
    id: 2,
    name: "Sunita Devi",
    phone: "9876543002",
    address: "Kurla East, Mumbai",
    familySize: 4,
    needType: "clothes",
    verified: true,
    lastReceived: "2026-02-03",
    totalReceived: 2,
    status: "active",
    aadhaarLast4: "7832",
  },
  {
    id: 3,
    name: "Mohammad Ismail",
    phone: "9876543003",
    address: "Andheri East, Mumbai",
    familySize: 6,
    needType: "medical",
    verified: false,
    lastReceived: null,
    totalReceived: 0,
    status: "pending",
    aadhaarLast4: "1234",
  },
  {
    id: 4,
    name: "Lakshmi Bai",
    phone: "9876543004",
    address: "Bandra, Mumbai",
    familySize: 3,
    needType: "food",
    verified: true,
    lastReceived: "2026-02-06",
    totalReceived: 5,
    status: "active",
    aadhaarLast4: "9087",
  },
];

const OrganizationDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("overview");
  const [campaigns, setCampaigns] = useState(demoCampaigns);
  const [volunteers, setVolunteers] = useState(demoVolunteers);
  const [donations, setDonations] = useState(demoDonations);
  const [messages, setMessages] = useState([]);
  const [urgentNeeds, setUrgentNeeds] = useState(demoUrgentNeeds);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showUrgentNeedModal, setShowUrgentNeedModal] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    type: "food",
    target: "",
    endDate: "",
  });
  const [newUrgentNeed, setNewUrgentNeed] = useState({
    title: "",
    category: "food",
    quantity: "",
    urgency: "high",
    description: "",
    location: "",
    deadline: "",
    target: "",
  });
  const [needyPersons, setNeedyPersons] = useState(demoNeedyPersons);
  const [showAddNeedyModal, setShowAddNeedyModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedNeedy, setSelectedNeedy] = useState(null);
  const [otpValue, setOtpValue] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [newNeedy, setNewNeedy] = useState({
    name: "",
    phone: "",
    address: "",
    familySize: 1,
    needType: "food",
    aadhaarLast4: "",
  });

  useEffect(() => {
    fetchMessages();
    fetchDonations();
    const interval = setInterval(() => {
      fetchMessages();
      fetchDonations();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDonations = () => {
    // Load donations from localStorage (created by donors)
    const localDonations = JSON.parse(
      localStorage.getItem("localDonations") || "[]",
    );

    // Map localStorage donations to display format
    const mappedLocalDonations = localDonations.map((donation, index) => ({
      id: `local-${donation.id || index}`,
      donor: donation.donorName || "Anonymous Donor",
      item: donation.title || donation.item || "Donation",
      quantity: donation.quantity || "1 item",
      status:
        donation.status?.toLowerCase() === "created"
          ? "pending"
          : donation.status?.toLowerCase() || "pending",
      date:
        donation.donationDate ||
        donation.createdAt?.split("T")[0] ||
        new Date().toISOString().split("T")[0],
      description: donation.description,
      location: donation.location,
    }));

    // Merge with demo data, avoiding duplicates
    const mergedDonations = [...mappedLocalDonations, ...demoDonations];
    setDonations(mergedDonations);
  };

  const fetchMessages = async () => {
    try {
      const response = await messageAPI.getMessages();
      setMessages(response.data);
    } catch (error) {
      // Demo messages
      setMessages([
        {
          id: 1,
          from: { name: "John Donor", role: "donor" },
          content: "I have 50kg of rice to donate. When can you pick up?",
          createdAt: new Date("2026-02-06T10:30:00"),
          read: false,
        },
        {
          id: 2,
          from: { name: "Jane Volunteer", role: "volunteer" },
          content:
            "I completed the delivery at Andheri. Attached are the photos.",
          createdAt: new Date("2026-02-05T15:45:00"),
          read: true,
        },
        {
          id: 3,
          from: { name: "Mary Smith", role: "donor" },
          content: "Thank you for accepting my donation!",
          createdAt: new Date("2026-02-04T09:00:00"),
          read: true,
        },
      ]);
    }
  };

  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.target) {
      toast.error("Please fill all required fields");
      return;
    }
    const campaign = {
      id: campaigns.length + 1,
      ...newCampaign,
      status: "active",
      collected: 0,
    };
    setCampaigns([campaign, ...campaigns]);
    setShowNewCampaign(false);
    setNewCampaign({ name: "", type: "food", target: "", endDate: "" });
    toast.success("Campaign created successfully!");
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedRecipient) {
      toast.error("Please enter a message");
      return;
    }
    try {
      await messageAPI.sendMessage(selectedRecipient.id, messageText);
      toast.success(`Message sent to ${selectedRecipient.name}`);
    } catch (error) {
      toast.success(`Message sent to ${selectedRecipient.name}`);
    }
    setShowMessageModal(false);
    setMessageText("");
    setSelectedRecipient(null);
  };

  const handleAcceptDonation = (donationId) => {
    setDonations(
      donations.map((d) =>
        d.id === donationId ? { ...d, status: "accepted" } : d,
      ),
    );

    // Also update localStorage if it's a local donation
    if (String(donationId).startsWith("local-")) {
      const localDonations = JSON.parse(
        localStorage.getItem("localDonations") || "[]",
      );
      const originalId = donationId.replace("local-", "");
      const updatedLocalDonations = localDonations.map((d) =>
        String(d.id) === originalId ? { ...d, status: "accepted" } : d,
      );
      localStorage.setItem(
        "localDonations",
        JSON.stringify(updatedLocalDonations),
      );
    }

    toast.success("Donation accepted! Volunteer will be assigned.");
  };

  const handleCreateUrgentNeed = () => {
    if (
      !newUrgentNeed.title ||
      !newUrgentNeed.quantity ||
      !newUrgentNeed.target
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    const need = {
      id: urgentNeeds.length + 1,
      ...newUrgentNeed,
      target: parseInt(newUrgentNeed.target),
      fulfilled: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    // Save to localStorage for donors to see
    const existingNeeds = JSON.parse(
      localStorage.getItem("urgentNeeds") || "[]",
    );
    localStorage.setItem(
      "urgentNeeds",
      JSON.stringify([need, ...existingNeeds]),
    );

    setUrgentNeeds([need, ...urgentNeeds]);
    setShowUrgentNeedModal(false);
    setNewUrgentNeed({
      title: "",
      category: "food",
      quantity: "",
      urgency: "high",
      description: "",
      location: "",
      deadline: "",
      target: "",
    });
    toast.success("🚨 Urgent need posted! Donors will be notified.");
  };

  const handleDeleteUrgentNeed = (needId) => {
    setUrgentNeeds(urgentNeeds.filter((n) => n.id !== needId));
    const existingNeeds = JSON.parse(
      localStorage.getItem("urgentNeeds") || "[]",
    );
    localStorage.setItem(
      "urgentNeeds",
      JSON.stringify(existingNeeds.filter((n) => n.id !== needId)),
    );
    toast.success("Urgent need removed");
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/50";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/50";
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      food: "🍞",
      clothes: "👕",
      medical: "💊",
      books: "📚",
      electronics: "💻",
      furniture: "🛋️",
      toys: "🧸",
      other: "📦",
    };
    return icons[category] || "📦";
  };

  // Needy Person Management Functions
  const handleAddNeedyPerson = () => {
    if (!newNeedy.name || !newNeedy.phone || !newNeedy.address) {
      toast.error("Please fill all required fields");
      return;
    }
    if (newNeedy.phone.length !== 10) {
      toast.error("Phone number must be 10 digits");
      return;
    }
    const needy = {
      id: needyPersons.length + 1,
      ...newNeedy,
      familySize: parseInt(newNeedy.familySize),
      verified: false,
      lastReceived: null,
      totalReceived: 0,
      status: "pending",
    };

    setNeedyPersons([needy, ...needyPersons]);
    setShowAddNeedyModal(false);
    setNewNeedy({
      name: "",
      phone: "",
      address: "",
      familySize: 1,
      needType: "food",
      aadhaarLast4: "",
    });
    toast.success("Needy person added! Send OTP to verify.");
  };

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendOtp = (needy) => {
    const otp = generateOTP();
    setGeneratedOtp(otp);
    setSelectedNeedy(needy);
    setOtpSent(true);
    setShowOtpModal(true);
    // In real app, send OTP via SMS API
    toast.success(`OTP sent to ${needy.phone}: ${otp}`);
    console.log(`OTP for ${needy.name}: ${otp}`); // For demo purposes
  };

  const handleVerifyOtp = () => {
    if (otpValue === generatedOtp) {
      setNeedyPersons(
        needyPersons.map((n) =>
          n.id === selectedNeedy.id
            ? { ...n, verified: true, status: "active" }
            : n,
        ),
      );
      toast.success(`✅ ${selectedNeedy.name} verified successfully!`);
      setShowOtpModal(false);
      setOtpValue("");
      setGeneratedOtp("");
      setSelectedNeedy(null);
      setOtpSent(false);
    } else {
      toast.error("Invalid OTP. Please try again.");
    }
  };

  const handleConfirmDelivery = (needy) => {
    const otp = generateOTP();
    setGeneratedOtp(otp);
    setSelectedNeedy({ ...needy, action: "delivery" });
    setOtpSent(true);
    setShowOtpModal(true);
    // In real app, send OTP via SMS
    toast.success(`Delivery OTP sent to ${needy.phone}: ${otp}`);
    console.log(`Delivery OTP for ${needy.name}: ${otp}`);
  };

  const handleVerifyDeliveryOtp = () => {
    if (otpValue === generatedOtp) {
      setNeedyPersons(
        needyPersons.map((n) =>
          n.id === selectedNeedy.id
            ? {
                ...n,
                lastReceived: new Date().toISOString().split("T")[0],
                totalReceived: n.totalReceived + 1,
              }
            : n,
        ),
      );
      toast.success(`✅ Delivery to ${selectedNeedy.name} confirmed!`);
      setShowOtpModal(false);
      setOtpValue("");
      setGeneratedOtp("");
      setSelectedNeedy(null);
      setOtpSent(false);
    } else {
      toast.error("Invalid OTP. Delivery not confirmed.");
    }
  };

  const handleRemoveNeedy = (needyId) => {
    setNeedyPersons(needyPersons.filter((n) => n.id !== needyId));
    toast.success("Person removed from list");
  };

  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter((c) => c.status === "active").length,
    totalVolunteers: volunteers.length,
    activeVolunteers: volunteers.filter((v) => v.status === "active").length,
    totalDonations: donations.length,
    pendingDonations: donations.filter((d) => d.status === "pending").length,
    unreadMessages: messages.filter((m) => !m.read).length,
    criticalNeeds: urgentNeeds.filter((n) => n.urgency === "critical").length,
    totalNeedy: needyPersons.length,
    verifiedNeedy: needyPersons.filter((n) => n.verified).length,
    pendingVerification: needyPersons.filter((n) => !n.verified).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                🏢 {user?.name || "Organization"} Dashboard
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Manage campaigns, volunteers, and donations
              </p>
            </div>
            <button
              onClick={() => setShowNewCampaign(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition flex items-center gap-2"
            >
              ➕ New Campaign
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
            <div className="text-blue-400 text-2xl mb-2">📊</div>
            <div className="text-2xl font-bold text-white">
              {stats.activeCampaigns}
            </div>
            <div className="text-slate-400 text-sm">Active Campaigns</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
            <div className="text-green-400 text-2xl mb-2">👥</div>
            <div className="text-2xl font-bold text-white">
              {stats.activeVolunteers}
            </div>
            <div className="text-slate-400 text-sm">Active Volunteers</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
            <div className="text-orange-400 text-2xl mb-2">📦</div>
            <div className="text-2xl font-bold text-white">
              {stats.pendingDonations}
            </div>
            <div className="text-slate-400 text-sm">Pending Donations</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 relative">
            <div className="text-purple-400 text-2xl mb-2">💬</div>
            <div className="text-2xl font-bold text-white">
              {stats.unreadMessages}
            </div>
            <div className="text-slate-400 text-sm">Unread Messages</div>
            {stats.unreadMessages > 0 && (
              <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            "overview",
            "urgentNeeds",
            "needyPersons",
            "campaigns",
            "volunteers",
            "donations",
            "messages",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium capitalize whitespace-nowrap transition ${
                activeTab === tab
                  ? tab === "urgentNeeds"
                    ? "bg-red-500 text-white"
                    : tab === "needyPersons"
                      ? "bg-purple-500 text-white"
                      : "bg-blue-500 text-white"
                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {tab === "messages" && stats.unreadMessages > 0 && (
                <span className="mr-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {stats.unreadMessages}
                </span>
              )}
              {tab === "needyPersons" && stats.pendingVerification > 0 && (
                <span className="mr-2 px-2 py-0.5 bg-yellow-500 text-black text-xs rounded-full">
                  {stats.pendingVerification}
                </span>
              )}
              {tab === "urgentNeeds" && stats.criticalNeeds > 0 && (
                <span className="mr-2 px-2 py-0.5 bg-red-600 text-white text-xs rounded-full animate-pulse">
                  {stats.criticalNeeds}
                </span>
              )}
              {tab === "urgentNeeds"
                ? "🚨 Urgent Needs"
                : tab === "needyPersons"
                  ? "👥 Needy List"
                  : tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">📊 Overview</h2>

              {/* Active Campaigns Progress */}
              <div>
                <h3 className="text-lg font-medium text-slate-300 mb-3">
                  Campaign Progress
                </h3>
                <div className="space-y-4">
                  {campaigns
                    .filter((c) => c.status === "active")
                    .map((campaign) => (
                      <div
                        key={campaign.id}
                        className="bg-slate-700/50 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-medium">
                            {campaign.name}
                          </span>
                          <span className="text-slate-400 text-sm">
                            {campaign.collected}/{campaign.target} items
                          </span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${(campaign.collected / campaign.target) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-medium text-slate-300 mb-3">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {donations.slice(0, 3).map((donation) => (
                    <div
                      key={donation.id}
                      className="flex items-center gap-4 bg-slate-700/30 rounded-lg p-3"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          donation.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : donation.status === "accepted"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {donation.status === "pending"
                          ? "⏳"
                          : donation.status === "accepted"
                            ? "✓"
                            : "✅"}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">
                          <span className="font-medium">{donation.donor}</span>{" "}
                          donated {donation.quantity} of {donation.item}
                        </p>
                        <p className="text-slate-400 text-xs">
                          {donation.date}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          donation.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : donation.status === "accepted"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {donation.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Urgent Needs Tab */}
          {activeTab === "urgentNeeds" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    🚨 Emergency & Urgent Needs
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Post urgent donation requests that will be highlighted to
                    donors
                  </p>
                </div>
                <button
                  onClick={() => setShowUrgentNeedModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-lg font-medium transition flex items-center gap-2"
                >
                  🚨 Post Urgent Need
                </button>
              </div>

              {/* Urgency Legend */}
              <div className="flex gap-4 mb-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="text-slate-400 text-sm">
                    Critical - Immediate
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                  <span className="text-slate-400 text-sm">
                    High - Within 24hrs
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                  <span className="text-slate-400 text-sm">
                    Medium - Within 3 days
                  </span>
                </div>
              </div>

              {/* Urgent Needs List */}
              {urgentNeeds.length === 0 ? (
                <div className="text-center py-12 bg-slate-700/30 rounded-xl">
                  <div className="text-5xl mb-4">📋</div>
                  <p className="text-slate-400">No urgent needs posted yet</p>
                  <button
                    onClick={() => setShowUrgentNeedModal(true)}
                    className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition"
                  >
                    Post First Urgent Need
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {urgentNeeds.map((need) => (
                    <div
                      key={need.id}
                      className={`border rounded-xl p-5 transition hover:scale-[1.01] ${getUrgencyColor(need.urgency)}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">
                            {getCategoryIcon(need.category)}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-white font-bold text-lg">
                                {need.title}
                              </h3>
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                  need.urgency === "critical"
                                    ? "bg-red-500 text-white animate-pulse"
                                    : need.urgency === "high"
                                      ? "bg-orange-500 text-white"
                                      : "bg-yellow-500 text-black"
                                }`}
                              >
                                {need.urgency}
                              </span>
                            </div>
                            <p className="text-slate-300 text-sm mb-2">
                              {need.description}
                            </p>
                            <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                              <span>📦 {need.quantity}</span>
                              <span>📍 {need.location}</span>
                              <span>⏰ Deadline: {need.deadline}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteUrgentNeed(need.id)}
                          className="text-slate-400 hover:text-red-400 p-2 hover:bg-slate-700 rounded-lg transition"
                          title="Remove urgent need"
                        >
                          🗑️
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-400">Fulfilled</span>
                          <span className="text-white font-medium">
                            {need.fulfilled} / {need.target} (
                            {((need.fulfilled / need.target) * 100).toFixed(0)}
                            %)
                          </span>
                        </div>
                        <div className="w-full bg-slate-600/50 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              need.urgency === "critical"
                                ? "bg-gradient-to-r from-red-500 to-red-400"
                                : need.urgency === "high"
                                  ? "bg-gradient-to-r from-orange-500 to-yellow-400"
                                  : "bg-gradient-to-r from-yellow-500 to-green-400"
                            }`}
                            style={{
                              width: `${(need.fulfilled / need.target) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Needy Persons Tab */}
          {activeTab === "needyPersons" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    👥 Needy Persons Registry
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Manage and verify beneficiaries with OTP verification
                  </p>
                </div>
                <button
                  onClick={() => setShowAddNeedyModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg font-medium transition flex items-center gap-2"
                >
                  ➕ Add Needy Person
                </button>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white">
                    {stats.totalNeedy}
                  </div>
                  <div className="text-slate-400 text-sm">Total Registered</div>
                </div>
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {stats.verifiedNeedy}
                  </div>
                  <div className="text-green-400 text-sm">Verified</div>
                </div>
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-400">
                    {stats.pendingVerification}
                  </div>
                  <div className="text-yellow-400 text-sm">
                    Pending Verification
                  </div>
                </div>
              </div>

              {/* Needy Persons List */}
              {needyPersons.length === 0 ? (
                <div className="text-center py-12 bg-slate-700/30 rounded-xl">
                  <div className="text-5xl mb-4">📋</div>
                  <p className="text-slate-400">
                    No needy persons registered yet
                  </p>
                  <button
                    onClick={() => setShowAddNeedyModal(true)}
                    className="mt-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm transition"
                  >
                    Add First Person
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {needyPersons.map((needy) => (
                    <div
                      key={needy.id}
                      className={`border rounded-xl p-5 transition ${
                        needy.verified
                          ? "bg-slate-700/30 border-slate-600"
                          : "bg-yellow-500/10 border-yellow-500/30"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                              needy.verified
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {needy.verified ? "✓" : "⏳"}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-white font-bold text-lg">
                                {needy.name}
                              </h3>
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-bold ${
                                  needy.verified
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-yellow-500/20 text-yellow-400"
                                }`}
                              >
                                {needy.verified ? "✓ Verified" : "⏳ Pending"}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                              <div>
                                <p className="text-slate-500">Phone</p>
                                <p className="text-slate-300 font-medium">
                                  📱 {needy.phone}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-500">Family Size</p>
                                <p className="text-slate-300 font-medium">
                                  👨‍👩‍👧‍👦 {needy.familySize} members
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-500">Need Type</p>
                                <p className="text-slate-300 font-medium">
                                  {getCategoryIcon(needy.needType)}{" "}
                                  {needy.needType}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-500">Total Received</p>
                                <p className="text-slate-300 font-medium">
                                  📦 {needy.totalReceived} deliveries
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 text-sm">
                              <p className="text-slate-500">Address</p>
                              <p className="text-slate-300">
                                📍 {needy.address}
                              </p>
                            </div>
                            {needy.lastReceived && (
                              <p className="text-slate-500 text-xs mt-2">
                                Last received: {needy.lastReceived}
                              </p>
                            )}
                            {needy.aadhaarLast4 && (
                              <p className="text-slate-500 text-xs mt-1">
                                Aadhaar: ****-****-{needy.aadhaarLast4}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {!needy.verified && (
                            <button
                              onClick={() => handleSendOtp(needy)}
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
                            >
                              📲 Send OTP
                            </button>
                          )}
                          {needy.verified && (
                            <button
                              onClick={() => handleConfirmDelivery(needy)}
                              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
                            >
                              📦 Confirm Delivery
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveNeedy(needy.id)}
                            className="px-4 py-2 bg-slate-700 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg text-sm transition"
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Campaigns Tab */}
          {activeTab === "campaigns" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">📋 Campaigns</h2>
                <button
                  onClick={() => setShowNewCampaign(true)}
                  className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition"
                >
                  ➕ Create Campaign
                </button>
              </div>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="bg-slate-700/50 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-white font-medium text-lg">
                          {campaign.name}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          Type: {campaign.type} • Ends: {campaign.endDate}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          campaign.status === "active"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-slate-500/20 text-slate-400"
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-3 mb-2">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          campaign.status === "completed"
                            ? "bg-green-500"
                            : "bg-gradient-to-r from-blue-500 to-purple-500"
                        }`}
                        style={{
                          width: `${(campaign.collected / campaign.target) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">
                        Progress:{" "}
                        {((campaign.collected / campaign.target) * 100).toFixed(
                          0,
                        )}
                        %
                      </span>
                      <span className="text-slate-300">
                        {campaign.collected} / {campaign.target} items
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Volunteers Tab */}
          {activeTab === "volunteers" && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">
                👥 Volunteers
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left text-slate-400 text-sm font-medium pb-3">
                        Name
                      </th>
                      <th className="text-left text-slate-400 text-sm font-medium pb-3">
                        Status
                      </th>
                      <th className="text-left text-slate-400 text-sm font-medium pb-3">
                        Deliveries
                      </th>
                      <th className="text-left text-slate-400 text-sm font-medium pb-3">
                        Rating
                      </th>
                      <th className="text-left text-slate-400 text-sm font-medium pb-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {volunteers.map((volunteer) => (
                      <tr
                        key={volunteer.id}
                        className="border-b border-slate-700/50"
                      >
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                              🤝
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {volunteer.name}
                              </p>
                              <p className="text-slate-400 text-xs">
                                {volunteer.phone}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              volunteer.status === "active"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-slate-500/20 text-slate-400"
                            }`}
                          >
                            {volunteer.status}
                          </span>
                        </td>
                        <td className="text-slate-300">
                          {volunteer.deliveries}
                        </td>
                        <td className="text-yellow-400">
                          ⭐ {volunteer.rating}
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setSelectedRecipient({
                                id: volunteer.id,
                                name: volunteer.name,
                                role: "volunteer",
                              });
                              setShowMessageModal(true);
                            }}
                            className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition text-sm"
                          >
                            💬 Message
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Donations Tab */}
          {activeTab === "donations" && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">
                📦 Incoming Donations
              </h2>
              <div className="space-y-4">
                {donations.map((donation) => (
                  <div
                    key={donation.id}
                    className="bg-slate-700/50 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center text-2xl">
                        🎁
                      </div>
                      <div>
                        <h3 className="text-white font-medium">
                          {donation.item}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          From: {donation.donor} • Qty: {donation.quantity}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {donation.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          donation.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : donation.status === "accepted"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {donation.status}
                      </span>
                      {donation.status === "pending" && (
                        <button
                          onClick={() => handleAcceptDonation(donation.id)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition"
                        >
                          Accept
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedRecipient({
                            id: donation.id,
                            name: donation.donor,
                            role: "donor",
                          });
                          setShowMessageModal(true);
                        }}
                        className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition text-sm"
                      >
                        💬
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === "messages" && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">💬 Messages</h2>
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">
                    No messages yet
                  </p>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`bg-slate-700/50 rounded-lg p-4 border-l-4 ${
                        message.read ? "border-slate-600" : "border-blue-500"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              message.from.role === "donor"
                                ? "bg-orange-500/20 text-orange-400"
                                : "bg-green-500/20 text-green-400"
                            }`}
                          >
                            {message.from.role === "donor" ? "🎁" : "🤝"}
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {message.from.name}
                            </p>
                            <p className="text-slate-400 text-xs capitalize">
                              {message.from.role}
                            </p>
                          </div>
                        </div>
                        <span className="text-slate-500 text-xs">
                          {new Date(message.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-300 mb-3">{message.content}</p>
                      <button
                        onClick={() => {
                          setSelectedRecipient({
                            id: message.from.id,
                            name: message.from.name,
                            role: message.from.role,
                          });
                          setShowMessageModal(true);
                        }}
                        className="text-blue-400 text-sm hover:text-blue-300 transition"
                      >
                        ↩️ Reply
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Campaign Modal */}
      {showNewCampaign && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">
              Create New Campaign
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) =>
                    setNewCampaign({ ...newCampaign, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                  placeholder="e.g., Winter Clothes Drive"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Type
                </label>
                <select
                  value={newCampaign.type}
                  onChange={(e) =>
                    setNewCampaign({ ...newCampaign, type: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                >
                  <option value="food">🍞 Food</option>
                  <option value="clothes">👕 Clothes</option>
                  <option value="books">📚 Books</option>
                  <option value="medical">💊 Medical</option>
                  <option value="other">📦 Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Target (items) *
                </label>
                <input
                  type="number"
                  value={newCampaign.target}
                  onChange={(e) =>
                    setNewCampaign({ ...newCampaign, target: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                  placeholder="500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={newCampaign.endDate}
                  onChange={(e) =>
                    setNewCampaign({ ...newCampaign, endDate: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewCampaign(false)}
                className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCampaign}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">
              💬 Message to {selectedRecipient?.name}
            </h3>
            <div className="mb-4">
              <span
                className={`px-2 py-1 rounded text-xs ${
                  selectedRecipient?.role === "donor"
                    ? "bg-orange-500/20 text-orange-400"
                    : "bg-green-500/20 text-green-400"
                }`}
              >
                {selectedRecipient?.role}
              </span>
            </div>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white h-32 resize-none"
              placeholder="Type your message..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setMessageText("");
                  setSelectedRecipient(null);
                }}
                className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Urgent Need Modal */}
      {showUrgentNeedModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                🚨 Post Urgent Need
              </h3>
              <button
                onClick={() => setShowUrgentNeedModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newUrgentNeed.title}
                  onChange={(e) =>
                    setNewUrgentNeed({
                      ...newUrgentNeed,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  placeholder="e.g., Emergency Food Supply Needed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Category
                  </label>
                  <select
                    value={newUrgentNeed.category}
                    onChange={(e) =>
                      setNewUrgentNeed({
                        ...newUrgentNeed,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                  >
                    <option value="food">🍞 Food</option>
                    <option value="clothes">👕 Clothes</option>
                    <option value="medical">💊 Medical</option>
                    <option value="books">📚 Books</option>
                    <option value="electronics">💻 Electronics</option>
                    <option value="furniture">🛋️ Furniture</option>
                    <option value="toys">🧸 Toys</option>
                    <option value="other">📦 Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Urgency Level <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={newUrgentNeed.urgency}
                    onChange={(e) =>
                      setNewUrgentNeed({
                        ...newUrgentNeed,
                        urgency: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                  >
                    <option value="critical">🔴 Critical - Immediate</option>
                    <option value="high">🟠 High - Within 24hrs</option>
                    <option value="medium">🟡 Medium - Within 3 days</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Quantity Needed <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUrgentNeed.quantity}
                    onChange={(e) =>
                      setNewUrgentNeed({
                        ...newUrgentNeed,
                        quantity: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                    placeholder="e.g., 500 kg, 100 items"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Target Amount <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={newUrgentNeed.target}
                    onChange={(e) =>
                      setNewUrgentNeed({
                        ...newUrgentNeed,
                        target: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                    placeholder="e.g., 500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={newUrgentNeed.location}
                  onChange={(e) =>
                    setNewUrgentNeed({
                      ...newUrgentNeed,
                      location: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                  placeholder="e.g., Andheri East, Mumbai"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={newUrgentNeed.deadline}
                  onChange={(e) =>
                    setNewUrgentNeed({
                      ...newUrgentNeed,
                      deadline: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Description
                </label>
                <textarea
                  value={newUrgentNeed.description}
                  onChange={(e) =>
                    setNewUrgentNeed({
                      ...newUrgentNeed,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white h-24 resize-none"
                  placeholder="Describe the urgent need and why it's needed..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowUrgentNeedModal(false)}
                className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUrgentNeed}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition font-medium"
              >
                🚨 Post Urgent Need
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Needy Person Modal */}
      {showAddNeedyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                👥 Add Needy Person
              </h3>
              <button
                onClick={() => setShowAddNeedyModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newNeedy.name}
                  onChange={(e) =>
                    setNewNeedy({ ...newNeedy, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-purple-500"
                  placeholder="e.g., Ramesh Kumar"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={newNeedy.phone}
                  onChange={(e) =>
                    setNewNeedy({
                      ...newNeedy,
                      phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                  placeholder="10-digit phone number"
                  maxLength={10}
                />
                <p className="text-slate-500 text-xs mt-1">
                  OTP will be sent to this number for verification
                </p>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Address <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={newNeedy.address}
                  onChange={(e) =>
                    setNewNeedy({ ...newNeedy, address: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white h-20 resize-none"
                  placeholder="Full address for delivery"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Family Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newNeedy.familySize}
                    onChange={(e) =>
                      setNewNeedy({ ...newNeedy, familySize: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Primary Need
                  </label>
                  <select
                    value={newNeedy.needType}
                    onChange={(e) =>
                      setNewNeedy({ ...newNeedy, needType: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                  >
                    <option value="food">🍞 Food</option>
                    <option value="clothes">👕 Clothes</option>
                    <option value="medical">💊 Medical</option>
                    <option value="books">📚 Books</option>
                    <option value="other">📦 Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Aadhaar Last 4 Digits (Optional)
                </label>
                <input
                  type="text"
                  value={newNeedy.aadhaarLast4}
                  onChange={(e) =>
                    setNewNeedy({
                      ...newNeedy,
                      aadhaarLast4: e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 4),
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                  placeholder="Last 4 digits for verification"
                  maxLength={4}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddNeedyModal(false)}
                className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNeedyPerson}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition font-medium"
              >
                ➕ Add Person
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && selectedNeedy && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📲</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                {selectedNeedy.action === "delivery"
                  ? "Confirm Delivery"
                  : "Verify Person"}
              </h3>
              <p className="text-slate-400 mt-2">
                {selectedNeedy.action === "delivery"
                  ? `Confirm delivery to ${selectedNeedy.name}`
                  : `Verifying ${selectedNeedy.name}`}
              </p>
            </div>

            <div className="bg-slate-700/50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">OTP sent to</span>
                <span className="text-white font-mono">
                  {selectedNeedy.phone}
                </span>
              </div>
              <p className="text-slate-500 text-xs">
                {selectedNeedy.action === "delivery"
                  ? "Ask the recipient to share the OTP they received"
                  : "Ask the person to share the OTP they received"}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-2 text-center">
                Enter 6-digit OTP
              </label>
              <input
                type="text"
                value={otpValue}
                onChange={(e) =>
                  setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="w-full px-4 py-4 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-center text-2xl tracking-[0.5em] font-mono focus:border-green-500 focus:ring-1 focus:ring-green-500"
                placeholder="• • • • • •"
                maxLength={6}
              />
              <p className="text-center text-slate-500 text-xs mt-2">
                Demo OTP:{" "}
                <span className="text-green-400 font-mono">{generatedOtp}</span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowOtpModal(false);
                  setOtpValue("");
                  setGeneratedOtp("");
                  setSelectedNeedy(null);
                  setOtpSent(false);
                }}
                className="flex-1 px-4 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={
                  selectedNeedy.action === "delivery"
                    ? handleVerifyDeliveryOtp
                    : handleVerifyOtp
                }
                disabled={otpValue.length !== 6}
                className={`flex-1 px-4 py-3 rounded-lg transition font-medium ${
                  otpValue.length === 6
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
                    : "bg-slate-700 text-slate-500 cursor-not-allowed"
                }`}
              >
                ✓ Verify OTP
              </button>
            </div>

            <button
              onClick={() => {
                const otp = generateOTP();
                setGeneratedOtp(otp);
                toast.success(`New OTP sent: ${otp}`);
              }}
              className="w-full mt-4 text-slate-400 hover:text-white text-sm transition"
            >
              Didn't receive OTP? <span className="text-blue-400">Resend</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationDashboard;
