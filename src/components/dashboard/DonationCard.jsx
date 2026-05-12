import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Package, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../common/UIComponents';
import { formatTime, getStatusLabel } from '../../utils/helpers';

export default function DonationCard({ donation, actions, compact = false, onClick, active = false }) {
  const catColor = donation.category === 'critical'
    ? 'border-red-500/20 hover:border-red-500/40'
    : 'border-white/5 hover:border-brand-green/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`bg-dark-750 rounded-2xl border p-5 transition-all cursor-pointer ${
        active ? 'border-brand-green ring-1 ring-brand-green/20' : catColor
      } ${compact ? '' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h4 className="font-semibold text-sm text-white truncate">{donation.foodType}</h4>
            {donation.category === 'critical' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-400/10 border border-red-400/30 px-1.5 py-0.5 rounded-full animate-pulse">
                ⚡ CRITICAL
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">{donation.restaurantName}</p>
        </div>
        <Badge variant={donation.status}>{getStatusLabel(donation.status)}</Badge>
      </div>

      {/* Details */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Package size={12} className="text-gray-600" />
          <span>{donation.quantity} {donation.unit || ''}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin size={12} className="text-gray-600" />
          <span className="truncate max-w-[140px]">{donation.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock size={12} className={donation.category === 'critical' ? 'text-red-400' : 'text-gray-600'} />
          <span className={donation.category === 'critical' ? 'text-red-400 font-medium' : ''}>
            {donation.status === 'delivered' ? 'Delivered' : `Expires: ${donation.expiresIn}`}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock size={12} className="text-gray-600" />
          <span>Posted {formatTime(donation.createdAt)}</span>
        </div>
      </div>

      {/* Status progress */}
      {!compact && (
        <div className="flex items-center gap-1.5 mb-3">
          {['pending', 'accepted', 'in_transit', 'delivered'].map((s, i) => {
            const statuses = ['pending', 'accepted', 'in_transit', 'delivered'];
            const currentIdx = statuses.indexOf(donation.status);
            const stepIdx = statuses.indexOf(s);
            const active = stepIdx <= currentIdx;
            const labels = ['Posted', 'Accepted', 'Transit', 'Done'];
            return (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center gap-0.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${active ? (s === donation.status ? 'bg-brand-green text-black' : 'bg-brand-green/30 text-brand-green') : 'bg-white/5 text-gray-600'}`}>
                    {active && stepIdx < currentIdx ? '✓' : i + 1}
                  </div>
                  <span className={`text-[9px] ${active ? 'text-gray-400' : 'text-gray-700'}`}>{labels[i]}</span>
                </div>
                {i < 3 && <div className={`flex-1 h-px mb-3 transition-all ${active && stepIdx < currentIdx ? 'bg-brand-green/40' : 'bg-white/5'}`} />}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Actions */}
      {actions && (
        <div className="flex gap-2 pt-2 border-t border-white/5">
          {actions}
          {donation.status === 'in_transit' && (
            <Link to={`/tracking/${donation._id}`} className="btn-secondary text-xs py-1.5 px-3 ml-auto flex items-center gap-1">
              <Truck size={12} /> Track
            </Link>
          )}
        </div>
      )}
    </motion.div>
  );
}
