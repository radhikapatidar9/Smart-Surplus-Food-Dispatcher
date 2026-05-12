import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Plus, List, MapPin, LogOut, ChevronLeft, ChevronRight, Truck, Users, BarChart3, Zap } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const navItems = {
  restaurant: [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard/restaurant', section: 'main' },
    { icon: Plus, label: 'Add Donation', path: '/dashboard/restaurant#add', section: 'main' },
    { icon: List, label: 'My Donations', path: '/dashboard/restaurant#list', section: 'main' },
    { icon: MapPin, label: 'Live Tracking', path: '/tracking/d3', section: 'main' },
  ],
  ngo: [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard/ngo', section: 'main' },
    { icon: List, label: 'Available Food', path: '/dashboard/ngo#available', section: 'main' },
    { icon: Truck, label: 'Active Pickups', path: '/dashboard/ngo#active', section: 'main' },
    { icon: MapPin, label: 'Track Delivery', path: '/tracking/d3', section: 'main' },
  ],
  volunteer: [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard/volunteer', section: 'main' },
    { icon: Zap, label: 'Flash Requests', path: '/dashboard/volunteer#flash', section: 'main' },
    { icon: Truck, label: 'My Deliveries', path: '/dashboard/volunteer#deliveries', section: 'main' },
    { icon: MapPin, label: 'Route Map', path: '/tracking/d3', section: 'main' },
  ],
  admin: [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard/admin', section: 'main' },
    { icon: Users, label: 'All Users', path: '/dashboard/admin#users', section: 'main' },
    { icon: List, label: 'Donations', path: '/dashboard/admin#donations', section: 'main' },
    { icon: BarChart3, label: 'Analytics', path: '/dashboard/admin#analytics', section: 'main' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);


  const items = navItems[user?.role] || [];

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.2 }}
      className="flex-shrink-0 h-screen sticky top-0 flex flex-col border-r border-white/5 bg-dark-850 overflow-hidden"
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-white/5">
        {!collapsed && (
          <span className="font-display font-bold text-white text-base">
            Food<span className="text-brand-green">Bridge</span>
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`${collapsed ? 'mx-auto' : 'ml-auto'} p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-all`}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* User */}
      {!collapsed && (
        <div className="p-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-green flex items-center justify-center text-black text-xs font-bold flex-shrink-0">
              {user?.avatar}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {items.map((item) => {
          const isActive = location.pathname === item.path.split('#')[0];
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
                isActive
                  ? 'bg-brand-green/15 text-brand-green border border-brand-green/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={16} className="flex-shrink-0" />
              {!collapsed && <span className="font-medium truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-white/5 space-y-0.5">
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all"
          onClick={() => { logout(); navigate('/', { replace: true }); }}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={16} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
