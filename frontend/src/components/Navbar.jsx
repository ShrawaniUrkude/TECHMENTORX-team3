import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [showSignupDropdown, setShowSignupDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowLoginDropdown(false);
      setShowSignupDropdown(false);
    };
    if (showLoginDropdown || showSignupDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showLoginDropdown, showSignupDropdown]);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-green-500/10 border-b border-slate-700/50' 
          : 'bg-slate-900/80 backdrop-blur-md border-b border-slate-800/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="group flex items-center space-x-3 transform hover:scale-105 transition-all duration-300"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-2.5 rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                UnityDrop
              </h1>
              <p className="text-xs text-slate-400 font-medium">Making Impact Together</p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* User Info Card */}
                <div className="hidden sm:flex items-center space-x-4 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl px-5 py-2.5 shadow-lg">
                  <div className="text-right">
                    <p className="text-white text-sm font-semibold">{user.name}</p>
                    <p className="text-slate-400 text-xs capitalize flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        user.role === 'donor' ? 'bg-green-500' :
                        user.role === 'volunteer' ? 'bg-emerald-500' : 'bg-teal-500'
                      } animate-pulse`}></span>
                      {user.role}
                    </p>
                  </div>
                  {user.role === 'volunteer' && (
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur opacity-75 group-hover:opacity-100 transition"></div>
                      <div className="relative px-4 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {user.points || 0}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Dashboard Button */}
                <Link
                  to={
                    user.role === 'donor' ? '/donor/dashboard' :
                    user.role === 'volunteer' ? '/volunteer/dashboard' :
                    '/admin/dashboard'
                  }
                  className="group relative px-5 py-2.5 rounded-xl text-sm font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 transition-transform group-hover:scale-110"></div>
                  <div className="relative flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Dashboard
                  </div>
                </Link>
                
                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="group relative px-5 py-2.5 rounded-xl text-sm font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-600 transition-transform group-hover:scale-110"></div>
                  <div className="relative flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </div>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Login Dropdown */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLoginDropdown(!showLoginDropdown);
                      setShowSignupDropdown(false);
                    }}
                    className="group relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 text-white hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/20"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Login
                    <svg className={`w-4 h-4 transition-transform duration-300 ${showLoginDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showLoginDropdown && (
                    <div className="absolute right-0 mt-3 w-56 bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden transform animate-slideDown">
                      <div className="p-2">
                        <Link
                          to="/login?role=donor"
                          onClick={() => setShowLoginDropdown(false)}
                          className="group block px-4 py-3.5 text-sm rounded-xl hover:bg-gradient-to-r hover:from-green-600/20 hover:to-emerald-600/20 transition-all duration-200 border border-transparent hover:border-green-500/30"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform">
                              🎁
                            </div>
                            <div>
                              <span className="font-semibold text-white block">Donor Login</span>
                              <span className="text-xs text-slate-400">Contribute donations</span>
                            </div>
                          </div>
                        </Link>
                        <Link
                          to="/login?role=volunteer"
                          onClick={() => setShowLoginDropdown(false)}
                          className="group block px-4 py-3.5 text-sm rounded-xl hover:bg-gradient-to-r hover:from-green-600/20 hover:to-teal-600/20 transition-all duration-200 border border-transparent hover:border-green-500/30 mt-1"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform">
                              🤝
                            </div>
                            <div>
                              <span className="font-semibold text-white block">Volunteer Login</span>
                              <span className="text-xs text-slate-400">Deliver & earn points</span>
                            </div>
                          </div>
                        </Link>
                        <Link
                          to="/login?role=organization"
                          onClick={() => setShowLoginDropdown(false)}
                          className="group block px-4 py-3.5 text-sm rounded-xl hover:bg-gradient-to-r hover:from-teal-600/20 hover:to-cyan-600/20 transition-all duration-200 border border-transparent hover:border-teal-500/30 mt-1"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform">
                              🏢
                            </div>
                            <div>
                              <span className="font-semibold text-white block">Organization Login</span>
                              <span className="text-xs text-slate-400">Manage campaigns</span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sign Up Dropdown */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSignupDropdown(!showSignupDropdown);
                      setShowLoginDropdown(false);
                    }}
                    className="group relative px-6 py-2.5 rounded-xl text-sm font-bold text-white overflow-hidden transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 transition-transform group-hover:scale-110"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity blur"></div>
                    <div className="relative flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Sign Up
                      <svg className={`w-4 h-4 transition-transform duration-300 ${showSignupDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  {showSignupDropdown && (
                    <div className="absolute right-0 mt-3 w-72 bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden transform animate-slideDown">
                      <div className="p-2">
                        <Link
                          to="/register?role=donor"
                          onClick={() => setShowSignupDropdown(false)}
                          className="group block px-4 py-4 text-sm rounded-xl hover:bg-gradient-to-r hover:from-green-600/20 hover:to-emerald-600/20 transition-all duration-200 border border-transparent hover:border-green-500/30"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">
                              🎁
                            </div>
                            <div className="flex-1">
                              <span className="font-bold text-white block text-base">Donor Sign Up</span>
                              <span className="text-xs text-slate-400 block mt-0.5">Donate food & essentials to those in need</span>
                            </div>
                          </div>
                        </Link>
                        <Link
                          to="/register?role=volunteer"
                          onClick={() => setShowSignupDropdown(false)}
                          className="group block px-4 py-4 text-sm rounded-xl hover:bg-gradient-to-r hover:from-emerald-600/20 hover:to-teal-600/20 transition-all duration-200 border border-transparent hover:border-emerald-500/30 mt-1"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">
                              🤝
                            </div>
                            <div className="flex-1">
                              <span className="font-bold text-white block text-base">Volunteer Sign Up</span>
                              <span className="text-xs text-slate-400 block mt-0.5">Deliver donations & earn reward points</span>
                            </div>
                          </div>
                        </Link>
                        <Link
                          to="/register?role=organization"
                          onClick={() => setShowSignupDropdown(false)}
                          className="group block px-4 py-4 text-sm rounded-xl hover:bg-gradient-to-r hover:from-teal-600/20 hover:to-cyan-600/20 transition-all duration-200 border border-transparent hover:border-teal-500/30 mt-1"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">
                              🏢
                            </div>
                            <div className="flex-1">
                              <span className="font-bold text-white block text-base">Organization Sign Up</span>
                              <span className="text-xs text-slate-400 block mt-0.5">Manage your team & donation campaigns</span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

