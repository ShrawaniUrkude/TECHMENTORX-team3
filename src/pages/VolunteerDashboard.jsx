import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { volunteerAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const VolunteerDashboard = () => {
  const [availableTasks, setAvailableTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('available');
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableTasks();
    fetchMyTasks();
  }, []);

  const fetchAvailableTasks = async () => {
    try {
      const response = await volunteerAPI.getAvailableTasks();
      setAvailableTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch available tasks:', error);
    }
  };

  const fetchMyTasks = async () => {
    try {
      const response = await volunteerAPI.getMyTasks();
      setMyTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch my tasks:', error);
    }
  };

  const handleAcceptTask = async (donationId) => {
    setLoading(true);
    try {
      await volunteerAPI.acceptTask(donationId);
      fetchAvailableTasks();
      fetchMyTasks();
      toast.success('Task accepted successfully!');
    } catch (error) {
      toast.error('Failed to accept task');
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
      toast.error('Failed to update status');
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
        {/* Header with Points */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Volunteer Dashboard
          </h1>
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur border border-blue-500/30 rounded-xl p-6 max-w-md">
            <p className="text-slate-400 text-sm mb-2">Your Impact Points</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              ⭐ {user?.points || 0}
            </p>
            <p className="text-slate-400 text-xs mt-2">Keep volunteering to climb the leaderboard!</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-6 py-3 font-semibold rounded-lg transition ${
              activeTab === 'available'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            📋 Available Tasks ({availableTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('my-tasks')}
            className={`px-6 py-3 font-semibold rounded-lg transition ${
              activeTab === 'my-tasks'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            ✓ My Tasks ({myTasks.length})
          </button>
        </div>

        {/* Available Tasks */}
        {activeTab === 'available' && (
          <div className="space-y-6">
            {availableTasks.length === 0 ? (
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl px-8 py-12 text-center">
                <p className="text-slate-400 text-lg">No available tasks in your area right now.</p>
                <p className="text-slate-500 text-sm mt-2">Check back later or expand your service area!</p>
              </div>
            ) : (
              availableTasks.map((task) => (
                <div key={task._id} className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-blue-500/50 transition">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-white">{task.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          task.status === 'CREATED' ? 'bg-blue-500/20 text-blue-300' :
                          task.status === 'ASSIGNED' ? 'bg-yellow-500/20 text-yellow-300' :
                          task.status === 'PICKED_UP' ? 'bg-purple-500/20 text-purple-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                      <p className="text-slate-300 mb-4">{task.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-slate-400">Category</p>
                          <p className="text-white font-medium">{task.category}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Quantity</p>
                          <p className="text-white font-medium">{task.quantity}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Location</p>
                          <p className="text-white font-medium">{task.city}, {task.pincode}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Points</p>
                          <p className="text-yellow-400 font-bold">+{task.pointsAwarded}</p>
                        </div>
                      </div>

                      <div className="border-t border-slate-700 pt-4">
                        <p className="text-slate-400 text-sm mb-2"><span className="font-semibold">📍 Pickup:</span> {task.pickupAddress}</p>
                        {task.donor && (
                          <p className="text-blue-400 text-sm"><span className="font-semibold">👤 Donor:</span> {task.donor.name}</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAcceptTask(task._id)}
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg whitespace-nowrap"
                    >
                      Accept Task
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* My Tasks */}
        {activeTab === 'my-tasks' && (
          <div className="space-y-6">
            {myTasks.length === 0 ? (
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl px-8 py-12 text-center">
                <p className="text-slate-400 text-lg">You haven't accepted any tasks yet.</p>
                <p className="text-slate-500 text-sm mt-2">Check the available tasks to get started!</p>
              </div>
            ) : (
              myTasks.map((task) => (
                <div key={task._id} className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-blue-500/50 transition">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-white">{task.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          task.status === 'ASSIGNED' ? 'bg-yellow-500/20 text-yellow-300' :
                          task.status === 'PICKED_UP' ? 'bg-purple-500/20 text-purple-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {task.status === 'ASSIGNED' ? '📋' : task.status === 'PICKED_UP' ? '🚚' : '✓'} {task.status}
                        </span>
                      </div>
                      <p className="text-slate-300 mb-4">{task.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-slate-400">Category</p>
                          <p className="text-white font-medium">{task.category}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Quantity</p>
                          <p className="text-white font-medium">{task.quantity}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Location</p>
                          <p className="text-white font-medium">{task.city}, {task.pincode}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Points</p>
                          <p className="text-yellow-400 font-bold">+{task.pointsAwarded}</p>
                        </div>
                      </div>

                      <div className="border-t border-slate-700 pt-4">
                        <p className="text-slate-400 text-sm mb-2"><span className="font-semibold">📍 Pickup:</span> {task.pickupAddress}</p>
                        {task.donor && (
                          <p className="text-blue-400 text-sm"><span className="font-semibold">👤 Donor:</span> {task.donor.name}
                            {task.donor.phone && ` • ${task.donor.phone}`}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {(task.status === 'ASSIGNED' || task.status === 'PICKED_UP') && (
                        <button
                          onClick={() => navigate(`/volunteer/track/${task._id}`)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-sm whitespace-nowrap"
                        >
                          📍 Track Live
                        </button>
                      )}
                      {task.status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleUpdateStatus(task._id, 'PICKED_UP')}
                          disabled={loading}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          🚚 Picked Up
                        </button>
                      )}
                      {task.status === 'PICKED_UP' && (
                        <button
                          onClick={() => handleUpdateStatus(task._id, 'DELIVERED')}
                          disabled={loading}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          ✓ Delivered
                        </button>
                      )}
                      {task.status === 'DELIVERED' && (
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
  );
};

export default VolunteerDashboard;
