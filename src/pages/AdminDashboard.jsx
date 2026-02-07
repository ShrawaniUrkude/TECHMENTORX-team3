import { useState, useEffect } from 'react';
import { adminAPI, volunteerAPI } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [donations, setDonations] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [donors, setDonors] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStats();
    fetchDonations();
    fetchVolunteers();
    fetchDonors();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchDonations = async () => {
    try {
      const response = await adminAPI.getAllDonations();
      setDonations(response.data);
    } catch (error) {
      console.error('Failed to fetch donations:', error);
    }
  };

  const fetchVolunteers = async () => {
    try {
      const response = await adminAPI.getAllVolunteers();
      setVolunteers(response.data);
    } catch (error) {
      console.error('Failed to fetch volunteers:', error);
    }
  };

  const fetchDonors = async () => {
    try {
      const response = await adminAPI.getAllDonors();
      setDonors(response.data);
    } catch (error) {
      console.error('Failed to fetch donors:', error);
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 mt-2">Platform Overview & Management</p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 flex-wrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-semibold rounded-lg transition ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('donations')}
            className={`px-6 py-3 font-semibold rounded-lg transition ${
              activeTab === 'donations'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            📦 Donations ({donations.length})
          </button>
          <button
            onClick={() => setActiveTab('volunteers')}
            className={`px-6 py-3 font-semibold rounded-lg transition ${
              activeTab === 'volunteers'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            👥 Volunteers ({volunteers.length})
          </button>
          <button
            onClick={() => setActiveTab('donors')}
            className={`px-6 py-3 font-semibold rounded-lg transition ${
              activeTab === 'donors'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🎁 Donors ({donors.length})
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur border border-blue-500/30 rounded-2xl p-8">
                <p className="text-slate-400 text-sm font-medium mb-2">Total Donations</p>
                <p className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                  {stats.totalDonations}
                </p>
                <p className="text-slate-500 text-sm mt-2">Active & Completed</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur border border-purple-500/30 rounded-2xl p-8">
                <p className="text-slate-400 text-sm font-medium mb-2">Total Volunteers</p>
                <p className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text text-transparent">
                  {stats.totalVolunteers}
                </p>
                <p className="text-slate-500 text-sm mt-2">Active Contributors</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur border border-green-500/30 rounded-2xl p-8">
                <p className="text-slate-400 text-sm font-medium mb-2">Total Donors</p>
                <p className="text-5xl font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
                  {stats.totalDonors}
                </p>
                <p className="text-slate-500 text-sm mt-2">Registered Members</p>
              </div>
            </div>

            {/* Donations by Status */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Donations by Status</h3>
              <div className="space-y-4">
                {stats.donationsByStatus.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        item._id === 'CREATED' ? 'bg-blue-500/20 text-blue-300' :
                        item._id === 'ASSIGNED' ? 'bg-yellow-500/20 text-yellow-300' :
                        item._id === 'PICKED_UP' ? 'bg-purple-500/20 text-purple-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>
                        {item._id === 'CREATED' ? '📋' : item._id === 'ASSIGNED' ? '👤' : item._id === 'PICKED_UP' ? '🚚' : '✓'} {item._id}
                      </span>
                    </div>
                    <p className="text-4xl font-bold text-white">{item.count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Donations Tab */}
        {activeTab === 'donations' && (
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-700 bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Donor</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Volunteer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {donations.map((donation) => (
                    <tr key={donation._id} className="hover:bg-slate-700/50 transition">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-white">{donation.title}</div>
                        <div className="text-xs text-slate-400 mt-1">{donation.category}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">{donation.donor?.name}</div>
                        <div className="text-xs text-slate-400">{donation.donor?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {donation.city}, {donation.pincode}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          donation.status === 'CREATED' ? 'bg-blue-500/20 text-blue-300' :
                          donation.status === 'ASSIGNED' ? 'bg-yellow-500/20 text-yellow-300' :
                          donation.status === 'PICKED_UP' ? 'bg-purple-500/20 text-purple-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {donation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {donation.assignedVolunteer?.name || <span className="text-slate-500">Not assigned</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Volunteers Tab */}
        {activeTab === 'volunteers' && (
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-700 bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Points</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Tasks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {volunteers.map((volunteer) => (
                    <tr key={volunteer._id} className="hover:bg-slate-700/50 transition">
                      <td className="px-6 py-4 text-sm font-semibold text-white">{volunteer.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{volunteer.email}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {volunteer.city || 'N/A'}, {volunteer.pincode || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-bold">
                          ⭐ {volunteer.points}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-semibold">
                          {volunteer.tasksCompleted}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Donors Tab */}
        {activeTab === 'donors' && (
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-700 bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Donations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {donors.map((donor) => (
                    <tr key={donor._id} className="hover:bg-slate-700/50 transition">
                      <td className="px-6 py-4 text-sm font-semibold text-white">{donor.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{donor.email}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {donor.city || 'N/A'}, {donor.pincode || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-bold">
                          🎁 {donor.donationsCreated}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
