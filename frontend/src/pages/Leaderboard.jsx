import { useState, useEffect } from 'react';
import { volunteerAPI } from '../services/api';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await volunteerAPI.getLeaderboard();
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🏆 Volunteer Leaderboard
          </h1>
          <p className="text-slate-300 text-lg">Celebrating our top community helpers</p>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No volunteers yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((volunteer, index) => (
              <div
                key={volunteer._id}
                className={`flex items-center gap-4 p-4 rounded-lg transition ${
                  index < 3
                    ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30'
                    : 'bg-slate-800/50 border border-slate-700'
                } hover:border-blue-500/50 hover:bg-slate-800/80`}
              >
                {/* Rank Badge */}
                <div className="text-3xl font-bold">
                  {index === 0 && <span className="text-4xl">🥇</span>}
                  {index === 1 && <span className="text-4xl">🥈</span>}
                  {index === 2 && <span className="text-4xl">🥉</span>}
                  {index > 2 && (
                    <span className="text-slate-400 text-2xl">#{index + 1}</span>
                  )}
                </div>

                {/* Volunteer Info */}
                <div className="flex-1">
                  <p className="text-white font-semibold text-lg">{volunteer.name}</p>
                  <p className="text-slate-400 text-sm">
                    {volunteer.city || 'Location not set'} • {volunteer.tasksCompleted} tasks completed
                  </p>
                </div>

                {/* Points */}
                <div className="text-right">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent text-3xl font-bold">
                    {volunteer.points}
                  </div>
                  <p className="text-slate-400 text-xs">points</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
