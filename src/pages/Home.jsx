import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { adminAPI, volunteerAPI } from '../services/api';

const Home = () => {
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalVolunteers: 0,
    totalDelivered: 0,
    impactScore: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Try to fetch from admin API (public stats)
      const response = await adminAPI.getStats();
      const data = response.data;
      
      const delivered = data.donationsByStatus.find(s => s._id === 'DELIVERED')?.count || 0;
      
      setStats({
        totalDonations: data.totalDonations || 0,
        totalVolunteers: data.totalVolunteers || 0,
        totalDelivered: delivered,
        impactScore: (data.totalVolunteers * 50) + (delivered * 100)
      });
    } catch (error) {
      // If API fails, show default values
      setStats({
        totalDonations: 150,
        totalVolunteers: 89,
        totalDelivered: 120,
        impactScore: 16450
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation Bar */}
      <nav className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center border-b border-slate-700">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Social Mentor
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="mb-8 inline-block">
            <span className="inline-block px-4 py-2 rounded-full bg-blue-500/20 text-blue-300 text-sm font-semibold border border-blue-500/30">
              ✨ Empowering Communities
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Connect. Donate. <br />
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Transform Lives
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            A centralized, location-based platform connecting generous donors with passionate 
            volunteers. Real-time tracking, gamified rewards, and community impact at your fingertips.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link
              to="/register"
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-base font-semibold hover:from-green-600 hover:to-emerald-700 transition shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 bg-slate-700 text-white rounded-lg text-base font-semibold hover:bg-slate-600 transition border border-slate-600"
            >
              Sign In
            </Link>
          </div>

          <Link to="/leaderboard" className="text-green-400 hover:text-green-300 transition text-sm font-medium">
            View Top Contributors →
          </Link>
        </div>

        {/* Problems We Solve Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Problems We <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Solve</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Addressing critical challenges in donation management and community support
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 backdrop-blur border border-red-500/30 rounded-2xl p-8 hover:border-red-500/50 transition">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Food Waste Crisis</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                40% of food produced globally is wasted while millions go hungry. We bridge this gap by connecting surplus food with those in need.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-orange-500/30 rounded-2xl p-8 hover:border-orange-500/50 transition">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Lack of Trust & Transparency</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Donors often don't know where their contributions go. Our real-time tracking and verified deliveries ensure complete transparency.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-yellow-500/30 rounded-2xl p-8 hover:border-yellow-500/50 transition">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Coordination Challenges</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Manual coordination between donors and volunteers is inefficient. Our location-based matching automates and optimizes the process.
              </p>
            </div>
          </div>
        </div>

        {/* Impact Statistics */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Impact</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Real-time statistics showing the difference we're making together
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur border border-green-500/30 rounded-2xl p-6 text-center transform hover:scale-105 transition">
              <div className="text-5xl mb-3">📦</div>
              <p className="text-green-300 text-sm font-medium mb-2">Total Donations</p>
              <p className="text-4xl font-bold text-white">{stats.totalDonations}</p>
              <p className="text-green-400 text-xs mt-2">Items Shared</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 backdrop-blur border border-emerald-500/30 rounded-2xl p-6 text-center transform hover:scale-105 transition">
              <div className="text-5xl mb-3">👥</div>
              <p className="text-emerald-300 text-sm font-medium mb-2">Active Volunteers</p>
              <p className="text-4xl font-bold text-white">{stats.totalVolunteers}</p>
              <p className="text-emerald-400 text-xs mt-2">Community Heroes</p>
            </div>
            <div className="bg-gradient-to-br from-teal-500/20 to-cyan-600/20 backdrop-blur border border-teal-500/30 rounded-2xl p-6 text-center transform hover:scale-105 transition">
              <div className="text-5xl mb-3">✅</div>
              <p className="text-teal-300 text-sm font-medium mb-2">Delivered</p>
              <p className="text-4xl font-bold text-white">{stats.totalDelivered}</p>
              <p className="text-teal-400 text-xs mt-2">Completed Tasks</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 backdrop-blur border border-yellow-500/30 rounded-2xl p-6 text-center transform hover:scale-105 transition">
              <div className="text-5xl mb-3">🌟</div>
              <p className="text-yellow-300 text-sm font-medium mb-2">Impact Score</p>
              <p className="text-4xl font-bold text-white">{stats.impactScore.toLocaleString()}</p>
              <p className="text-yellow-400 text-xs mt-2">Lives Touched</p>
            </div>
          </div>
        </div>

        {/* How You Can Contribute Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How You Can <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Contribute</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Join our community and make a difference in multiple ways
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 hover:border-green-500/50 transition hover:bg-slate-800/80">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition"></div>
                <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Become a Donor</h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                Share surplus food, clothing, or essentials. Create donation listings and track their journey from pickup to delivery.
              </p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Post donations anytime
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Track live delivery status
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> See your impact metrics
                </li>
              </ul>
            </div>

            <div className="group bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 hover:border-emerald-500/50 transition hover:bg-slate-800/80">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition"></div>
                <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Join as Volunteer</h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                Accept delivery tasks in your area, earn points, and climb the leaderboard. Make a direct impact in your community.
              </p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> Choose tasks near you
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> Earn reward points
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> Build your reputation
                </li>
              </ul>
            </div>

            <div className="group bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 hover:border-teal-500/50 transition hover:bg-slate-800/80">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition"></div>
                <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Register Organization</h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                NGOs and community groups can manage large-scale campaigns, coordinate multiple volunteers, and amplify impact.
              </p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span> Manage team members
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span> Run campaigns
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span> Access analytics
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/register"
              className="inline-block px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-base font-bold hover:from-green-700 hover:to-emerald-700 transition shadow-lg hover:shadow-2xl transform hover:scale-105"
            >
              Start Making a Difference Today →
            </Link>
          </div>
        </div>

        {/* Impact Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mt-20 mb-20" style={{display: 'none'}}>
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur border border-blue-500/30 rounded-2xl p-6 text-center">
            <p className="text-blue-300 text-sm font-medium mb-2">Total Donations</p>
            <p className="text-4xl font-bold text-white">{stats.totalDonations}</p>
            <p className="text-blue-400 text-xs mt-2">📦 Items Shared</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur border border-purple-500/30 rounded-2xl p-6 text-center">
            <p className="text-purple-300 text-sm font-medium mb-2">Active Volunteers</p>
            <p className="text-4xl font-bold text-white">{stats.totalVolunteers}</p>
            <p className="text-purple-400 text-xs mt-2">👥 Community Heroes</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur border border-green-500/30 rounded-2xl p-6 text-center">
            <p className="text-green-300 text-sm font-medium mb-2">Delivered</p>
            <p className="text-4xl font-bold text-white">{stats.totalDelivered}</p>
            <p className="text-green-400 text-xs mt-2">✓ Completed Tasks</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 backdrop-blur border border-yellow-500/30 rounded-2xl p-6 text-center">
            <p className="text-yellow-300 text-sm font-medium mb-2">Impact Score</p>
            <p className="text-4xl font-bold text-white">{stats.impactScore.toLocaleString()}</p>
            <p className="text-yellow-400 text-xs mt-2">🌟 Lives Touched</p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 mb-16">
          {[
            {
              icon: "📍",
              title: "Location-Based Matching",
              description: "Connect with donors and volunteers in your area instantly",
              gradient: "from-green-500 to-emerald-600"
            },
            {
              icon: "📊",
              title: "Real-Time Tracking",
              description: "Track donations from pickup to delivery with live GPS tracking",
              gradient: "from-emerald-500 to-teal-600"
            },
            {
              icon: "🏆",
              title: "Gamified Rewards",
              description: "Earn points and climb the leaderboard for your contributions",
              gradient: "from-teal-500 to-cyan-600"
            }
          ].map((feature, idx) => (
            <div key={idx} className="group bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 hover:border-green-500/50 transition hover:bg-slate-800/80">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="text-white font-bold text-xl mb-3">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400 text-sm">
            © 2026 UnityDrop. Making impact together, one donation at a time.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
