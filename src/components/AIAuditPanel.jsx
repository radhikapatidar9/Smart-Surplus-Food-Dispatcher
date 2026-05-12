import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, Info, Thermometer, ShoppingBag, Clock } from 'lucide-react';

const AIAuditPanel = ({ audit }) => {
  if (!audit) {
    return (
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-brand-green/30 border-t-brand-green rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">AI is auditing food quality...</p>
      </div>
    );
  }

  const getClassificationColor = (cls) => {
    switch (cls) {
      case 'Unsafe': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Critical': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      default: return 'text-brand-green bg-brand-green/10 border-brand-green/20';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'bg-brand-green';
    if (score >= 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl bg-white/5 border border-white/10 shadow-xl overflow-hidden relative"
    >
      {/* Background Glow */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 blur-3xl opacity-10 rounded-full ${getClassificationColor(audit.classification).split(' ')[0]}`} />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-brand-green" size={20} />
          <h3 className="font-display font-bold text-lg">AI Safety Audit</h3>
        </div>
        <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${getClassificationColor(audit.classification)}`}>
          {audit.classification}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Thermometer size={14} className="text-gray-500" />
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Freshness</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-display font-bold">{audit.freshnessScore}</span>
            <span className="text-xs text-gray-600 mb-1">/ 10</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${audit.freshnessScore * 10}%` }}
              className={`h-full ${getScoreColor(audit.freshnessScore)}`}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-gray-500" />
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Risk Score</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-display font-bold">{audit.riskScore}</span>
            <span className="text-xs text-gray-600 mb-1">/ 10</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${audit.riskScore * 10}%` }}
              className={`h-full ${getScoreColor(10 - audit.riskScore)}`}
            />
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <Info size={14} className="text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">AI Observation</p>
            <p className="text-xs text-gray-300 leading-relaxed">{audit.safetyNotes}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
            <ShoppingBag size={14} className="text-purple-400" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Detected Type</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-300">{audit.foodType}</p>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500 font-mono">
                {audit.isPackaged ? 'Packaged' : 'Cooked/Open'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-500/10 flex items-center justify-center flex-shrink-0">
            <Clock size={14} className="text-gray-400" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Audit Timestamp</p>
            <p className="text-[10px] font-mono text-gray-500">
              {new Date(audit.auditedAt || Date.now()).toLocaleString()} · Model: {audit.modelUsed || 'Gemini 1.5 Flash'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIAuditPanel;
