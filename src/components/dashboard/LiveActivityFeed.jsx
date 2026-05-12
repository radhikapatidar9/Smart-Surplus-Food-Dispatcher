import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Clock, Package, Truck, CheckCircle, AlertTriangle } from 'lucide-react';

const icons = {
  new_donation: <Package size={14} className="text-brand-green" />,
  critical: <AlertTriangle size={14} className="text-red-400" />,
  volunteer_assigned: <Truck size={14} className="text-blue-400" />,
  in_transit: <Truck size={14} className="text-orange-400" />,
  delivered: <CheckCircle size={14} className="text-brand-green" />,
  default: <Bell size={14} className="text-gray-400" />,
};

const LiveActivityFeed = ({ notifications = [] }) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold font-display uppercase tracking-wider text-gray-400">Live Activity</h3>
        <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-gray-500 font-mono">
          Real-time
        </span>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
        <AnimatePresence mode="popLayout">
          {notifications.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-white/5 rounded-2xl">
              <p className="text-xs text-gray-600">No recent activity</p>
            </div>
          ) : (
            notifications.map((notif, index) => (
              <motion.div
                key={notif._id || index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-3 rounded-xl border flex gap-3 transition-all ${
                  notif.read ? 'bg-transparent border-white/5' : 'bg-white/5 border-white/10'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  notif.priority === 'critical' ? 'bg-red-400/10' : 'bg-white/5'
                }`}>
                  {icons[notif.type] || icons.default}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`text-xs font-medium truncate ${notif.read ? 'text-gray-500' : 'text-gray-200'}`}>
                      {notif.message}
                    </p>
                    {notif.priority === 'critical' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                    <Clock size={10} />
                    <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LiveActivityFeed;
