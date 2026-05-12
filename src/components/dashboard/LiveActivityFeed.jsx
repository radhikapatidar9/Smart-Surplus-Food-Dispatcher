import React from 'react';
import {
  motion,
  AnimatePresence,
} from 'framer-motion';

import {
  Bell,
  Clock,
  Package,
  Truck,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

const icons = {
  new_donation: (
    <Package
      size={14}
      className="text-brand-green"
    />
  ),

  critical: (
    <AlertTriangle
      size={14}
      className="text-red-400"
    />
  ),

  volunteer_assigned: (
    <Truck
      size={14}
      className="text-blue-400"
    />
  ),

  in_transit: (
    <Truck
      size={14}
      className="text-orange-400"
    />
  ),

  delivered: (
    <CheckCircle
      size={14}
      className="text-brand-green"
    />
  ),

  default: (
    <Bell
      size={14}
      className="text-gray-400"
    />
  ),
};

const LiveActivityFeed = ({
  notifications = [],
}) => {
  return (
    <div className="flex flex-col gap-3 w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
        <h3 className="text-xs sm:text-sm font-bold font-display uppercase tracking-wider text-gray-400 break-words">
          Live Activity
        </h3>

        <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-gray-500 font-mono w-fit">
          Real-time
        </span>
      </div>

      {/* Feed */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
        <AnimatePresence mode="popLayout">
          {notifications.length === 0 ? (
            <div className="p-6 sm:p-8 text-center border border-dashed border-white/5 rounded-2xl">
              <p className="text-xs text-gray-600 break-words">
                No recent activity
              </p>
            </div>
          ) : (
            notifications.map(
              (notif, index) => (
                <motion.div
                  key={
                    notif._id || index
                  }
                  initial={{
                    opacity: 0,
                    x: -10,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                  }}
                  className={`p-3 rounded-xl border flex gap-3 transition-all overflow-hidden ${
                    notif.read
                      ? 'bg-transparent border-white/5'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      notif.priority ===
                      'critical'
                        ? 'bg-red-400/10'
                        : 'bg-white/5'
                    }`}
                  >
                    {icons[
                      notif.type
                    ] || icons.default}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p
                        className={`text-xs font-medium break-words leading-relaxed ${
                          notif.read
                            ? 'text-gray-500'
                            : 'text-gray-200'
                        }`}
                      >
                        {notif.message}
                      </p>

                      {notif.priority ===
                        'critical' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse flex-shrink-0 mt-1" />
                      )}
                    </div>

                    {/* Time */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-600">
                      <Clock
                        size={10}
                        className="flex-shrink-0"
                      />

                      <span className="break-words">
                        {new Date(
                          notif.createdAt
                        ).toLocaleTimeString(
                          [],
                          {
                            hour: '2-digit',
                            minute:
                              '2-digit',
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LiveActivityFeed;
