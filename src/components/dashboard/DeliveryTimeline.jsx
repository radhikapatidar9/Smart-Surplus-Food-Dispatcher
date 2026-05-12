import React from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Clock,
  Truck,
  Package,
  Flag,
} from 'lucide-react';

const STAGES = [
  { id: 'pending', label: 'Requested', icon: Package },
  { id: 'accepted', label: 'Accepted', icon: Check },
  { id: 'volunteer_assigned', label: 'Assigned', icon: Check },
  { id: 'pickup_started', label: 'Pickup', icon: Clock },
  { id: 'picked_up', label: 'Collected', icon: Truck },
  { id: 'in_transit', label: 'In Transit', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: Flag },
  { id: 'completed', label: 'Done', icon: Check },
];

const DeliveryTimeline = ({
  status,
  timestamps = {},
}) => {
  const currentIdx = STAGES.findIndex(
    (s) => s.id === status
  );

  return (
    <div className="py-4 w-full overflow-hidden">
      <div className="flex flex-col gap-6">
        {STAGES.map((stage, index) => {
          const isCompleted = index < currentIdx;
          const isActive = index === currentIdx;

          const Icon = stage.icon;

          const time =
            timestamps[`${stage.id}At`];

          return (
            <div
              key={stage.id}
              className="flex gap-3 sm:gap-4 relative"
            >
              {/* Connector Line */}
              {index < STAGES.length - 1 && (
                <div
                  className={`absolute left-[13px] sm:left-3.5 top-8 w-[1px] h-10 transition-colors duration-500 ${
                    isCompleted
                      ? 'bg-brand-green'
                      : 'bg-white/5'
                  }`}
                />
              )}

              {/* Icon / Indicator */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center z-10 transition-all duration-500 flex-shrink-0 ${
                  isCompleted
                    ? 'bg-brand-green text-black'
                    : isActive
                    ? 'bg-brand-green text-black ring-4 ring-brand-green/20'
                    : 'bg-white/5 text-gray-700 border border-white/10'
                }`}
              >
                {isCompleted ? (
                  <Check size={14} />
                ) : (
                  <Icon size={12} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                  <p
                    className={`text-[11px] sm:text-xs font-bold font-display uppercase tracking-wider transition-colors break-words ${
                      isActive
                        ? 'text-brand-green'
                        : isCompleted
                        ? 'text-gray-300'
                        : 'text-gray-600'
                    }`}
                  >
                    {stage.label}
                  </p>

                  {time && (
                    <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-1.5 py-0.5 rounded w-fit max-w-full break-words">
                      {new Date(time).toLocaleTimeString(
                        [],
                        {
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </span>
                  )}
                </div>

                {isActive && (
                  <motion.p
                    initial={{
                      opacity: 0,
                      x: -5,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    className="text-[10px] text-gray-500 mt-0.5 break-words"
                  >
                    Processing live...
                  </motion.p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeliveryTimeline;
