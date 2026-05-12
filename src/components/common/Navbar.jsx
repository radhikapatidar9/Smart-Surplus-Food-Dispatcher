import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Menu, X, LogOut } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useNotificationStore from '../../store/useNotificationStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { notifications } = useNotificationStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const unread = notifications?.filter(n => !n.read).length || 0;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between h-14">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group min-w-0">
          <div className="w-7 h-7 rounded-lg bg-brand-green flex items-center justify-center flex-shrink-0">
            <span className="text-black font-display font-bold text-xs">
              FB
            </span>
          </div>

          <span className="font-display font-bold text-white text-base sm:text-lg truncate">
            Food<span className="text-brand-green">Bridge</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          {!user ? (
            <>
              <a
                href="#features"
                className="text-sm text-gray-400 hover:text-white transition-colors whitespace-nowrap"
              >
                Features
              </a>

              <a
                href="#how-it-works"
                className="text-sm text-gray-400 hover:text-white transition-colors whitespace-nowrap"
              >
                How It Works
              </a>

              <Link
                to="/login"
                className="btn-secondary text-sm py-2 px-4 whitespace-nowrap"
              >
                Log in
              </Link>

              <Link
                to="/signup"
                className="btn-primary text-sm py-2 px-4 whitespace-nowrap"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              <Link
                to={`/dashboard/${user.role}`}
                className="text-sm text-gray-400 hover:text-white transition-colors whitespace-nowrap"
              >
                Dashboard
              </Link>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Bell size={18} />

                  {unread > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-brand-green rounded-full text-[10px] text-black font-bold flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-full mt-2 w-[90vw] max-w-sm sm:w-80 glass rounded-xl border border-white/10 overflow-hidden shadow-2xl"
                    >
                      <div className="p-3 border-b border-white/5">
                        <p className="text-sm font-semibold">
                          Notifications
                        </p>
                      </div>

                      <div className="max-h-64 overflow-y-auto">
                        {notifications.slice(0, 8).map(n => (
                          <div
                            key={n._id || n.id}
                            className={`p-3 border-b border-white/5 hover:bg-white/5 transition-colors ${
                              !n.read ? 'bg-brand-green/5' : ''
                            }`}
                          >
                            <p className="text-sm text-gray-300 break-words">
                              {n.message}
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                              {n.createdAt
                                ? new Date(n.createdAt).toLocaleString()
                                : n.time}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-brand-green flex items-center justify-center text-black text-xs font-bold flex-shrink-0">
                  {user.avatar}
                </div>

                <span className="text-sm text-gray-300 hidden lg:block truncate max-w-[120px]">
                  {user.name}
                </span>

                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-white/5 px-4 py-4 flex flex-col gap-3 bg-black/95 backdrop-blur-lg"
          >
            {user ? (
              <>
                <Link
                  to={`/dashboard/${user.role}`}
                  className="text-gray-300 py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-left text-red-400 py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a
                  href="#features"
                  className="text-gray-300 py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  Features
                </a>

                <a
                  href="#how-it-works"
                  className="text-gray-300 py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  How It Works
                </a>

                <Link
                  to="/login"
                  className="btn-secondary text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Log in
                </Link>

                <Link
                  to="/signup"
                  className="btn-primary text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}