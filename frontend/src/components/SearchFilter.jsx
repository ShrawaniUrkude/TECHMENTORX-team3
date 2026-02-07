const SearchFilter = ({ searchTerm, onSearchChange, statusFilter, onStatusChange, showStatusFilter = true }) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row gap-4">
      {/* Search */}
      <div className="flex-1">
        <div className="relative">
          <input
            type="text"
            placeholder="Search donations by title, description, or category..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-3 pl-10 bg-slate-700/50 border border-slate-600 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
          />
          <svg
            className="absolute left-3 top-3.5 w-5 h-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Status Filter */}
      {showStatusFilter && (
        <div className="md:w-64">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
          >
            <option value="ALL">All Status</option>
            <option value="CREATED">📋 Created</option>
            <option value="ASSIGNED">👤 Assigned</option>
            <option value="PICKED_UP">🚚 Picked Up</option>
            <option value="DELIVERED">✓ Delivered</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
