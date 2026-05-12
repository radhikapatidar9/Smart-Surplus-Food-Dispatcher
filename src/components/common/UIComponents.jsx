import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';

export function Card({
  children,
  className = '',
  hover = true,
  glow = false,
}) {
  return (
    <div
      className={`card ${
        hover ? 'hover:border-brand-green/20' : ''
      } ${glow ? 'glow-green' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  trend,
  color = 'green',
  className = '',
}) {
  const colors = {
    green: 'text-brand-green bg-brand-green/10',
    red: 'text-red-400 bg-red-400/10',
    blue: 'text-blue-400 bg-blue-400/10',
    yellow: 'text-yellow-400 bg-yellow-400/10',
    purple: 'text-purple-400 bg-purple-400/10',
  };

  return (
    <div className={`card ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 break-words">
            {label}
          </p>

          <p className="text-xl sm:text-2xl font-display font-bold text-white break-words">
            {value}
          </p>

          {trend && (
            <p className="text-xs text-gray-500 mt-1 break-words">
              {trend}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={`p-2 sm:p-2.5 rounded-lg flex-shrink-0 ${colors[color]}`}
          >
            <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
        )}
      </div>
    </div>
  );
}

export function Badge({
  children,
  variant = 'default',
  className = '',
}) {
  const variants = {
    default: 'bg-white/10 text-gray-300',
    critical:
      'bg-red-500/15 text-red-400 border border-red-500/30',
    standard:
      'bg-green-500/15 text-green-400 border border-green-500/30',
    pending:
      'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
    accepted:
      'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    in_transit:
      'bg-orange-500/15 text-orange-400 border border-orange-500/30',
    delivered:
      'bg-green-500/15 text-green-400 border border-green-500/30',
    rejected:
      'bg-red-500/15 text-red-400 border border-red-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap ${
        variants[variant] || variants.default
      } ${className}`}
    >
      {children}
    </span>
  );
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full ${sizes[size]} glass rounded-2xl border border-white/10 p-4 sm:p-6 max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex items-start justify-between gap-3 mb-5">
              <h3 className="font-display font-bold text-base sm:text-lg break-words">
                {title}
              </h3>

              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg flex-shrink-0 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Loader({ size = 'md', text }) {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 40,
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 px-4 text-center">
      <Loader2
        size={sizes[size]}
        className="text-brand-green animate-spin"
      />

      {text && (
        <p className="text-sm text-gray-400 break-words">
          {text}
        </p>
      )}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  desc,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 sm:py-12 px-4 text-center gap-3">
      {Icon && (
        <div className="p-4 bg-white/5 rounded-full">
          <Icon size={28} className="sm:w-8 sm:h-8 text-gray-600" />
        </div>
      )}

      <div className="max-w-md">
        <p className="font-semibold text-gray-400 break-words">
          {title}
        </p>

        {desc && (
          <p className="text-sm text-gray-600 mt-1 break-words">
            {desc}
          </p>
        )}
      </div>

      {action && action}
    </div>
  );
}

export function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col lg:flex-row overflow-x-hidden">
      {children}
    </div>
  );
}

export function MapPlaceholder({
  height = '400px',
  label = 'Map View',
  markers = [],
}) {
  return (
    <div
      className="relative rounded-xl overflow-hidden border border-white/10 w-full"
      style={{
        height,
        minHeight: '280px',
      }}
    >
      {/* Grid background simulating map */}
      <div className="absolute inset-0 bg-dark-800 grid-bg" />

      <div className="absolute inset-0 opacity-30">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="mapgrid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="rgba(34,197,94,0.15)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>

          <rect
            width="100%"
            height="100%"
            fill="url(#mapgrid)"
          />
        </svg>
      </div>

      {/* Fake road lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <line
          x1="10%"
          y1="50%"
          x2="90%"
          y2="50%"
          stroke="#22c55e"
          strokeWidth="2"
          strokeDasharray="8,4"
        />

        <line
          x1="50%"
          y1="5%"
          x2="50%"
          y2="95%"
          stroke="#22c55e"
          strokeWidth="2"
          strokeDasharray="8,4"
        />

        <line
          x1="20%"
          y1="20%"
          x2="80%"
          y2="80%"
          stroke="#666"
          strokeWidth="1"
          strokeDasharray="4,6"
        />

        <line
          x1="80%"
          y1="20%"
          x2="20%"
          y2="80%"
          stroke="#666"
          strokeWidth="1"
          strokeDasharray="4,6"
        />
      </svg>

      {/* Markers */}
      {markers.map((m, i) => (
        <div
          key={i}
          className="absolute transform -translate-x-1/2 -translate-y-full"
          style={{
            left: m.x,
            top: m.y,
          }}
        >
          <div
            className={`w-4 h-4 rounded-full ${
              m.color || 'bg-brand-green'
            } border-2 border-white shadow-lg animate-pulse`}
          />

          <div
            className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 rounded text-[10px] sm:text-xs text-white whitespace-nowrap ${
              m.color?.replace('bg-', 'bg-') ||
              'bg-brand-green'
            }`}
          >
            {m.label}
          </div>
        </div>
      ))}

      <div className="absolute bottom-3 left-3 right-3 sm:right-auto glass px-3 py-1.5 rounded-lg text-[10px] sm:text-xs text-gray-400 border border-white/5 break-words">
        {label} · Google Maps Integration
      </div>
    </div>
  );
}
