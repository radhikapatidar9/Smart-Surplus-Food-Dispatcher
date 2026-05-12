import React from 'react';
import { motion } from 'framer-motion';

import {
  ShieldCheck,
  AlertTriangle,
  Info,
  Thermometer,
  ShoppingBag,
  Clock,
} from 'lucide-react';

const AIAuditPanel = ({ audit }) => {
  if (!audit) {
    return (
      <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-8 h-8 border-2 border-brand-green/30 border-t-brand-green rounded-full animate-spin flex-shrink-0" />

        <p className="text-sm text-gray-500 font-medium break-words">
          AI is auditing food quality...
        </p>
      </div>
    );
  }

  const getClassificationColor = (
    cls
  ) => {
    switch (cls) {
      case 'Unsafe':
        return 'text-red-400 bg-red-400/10 border-red-400/20';

      case 'Critical':
        return 'text-orange-400 bg-orange-400/10 border-orange-400/20';

      default:
        return 'text-brand-green bg-brand-green/10 border-brand-green/20';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8)
      return 'bg-brand-green';

    if (score >= 5)
      return 'bg-yellow-500';

    return 'bg-red-500';
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="p-4 sm:p-6 rounded-3xl bg-white/5 border border-white/10 shadow-xl overflow-hidden relative w-full"
    >
      {/* Background Glow */}
      <div
        className={`absolute -top-10 -right-10 w-24 sm:w-32 h-24 sm:h-32 blur-3xl opacity-10 rounded-full ${
          getClassificationColor(
            audit.classification
          ).split(' ')[0]
        }`}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck
            className="text-brand-green flex-shrink-0"
            size={20}
          />

          <h3 className="font-display font-bold text-base sm:text-lg break-words">
            AI Safety Audit
          </h3>
        </div>

        <div
          className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest text-center w-fit max-w-full break-words ${
            getClassificationColor(
              audit.classification
            )
          }`}
        >
          {audit.classification}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Freshness */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <Thermometer
              size={14}
              className="text-gray-500 flex-shrink-0"
            />

            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider break-words">
              Freshness
            </span>
          </div>

          <div className="flex items-end gap-2 flex-wrap">
            <span className="text-2xl font-display font-bold break-words">
              {audit.freshnessScore}
            </span>

            <span className="text-xs text-gray-600 mb-1">
              / 10
            </span>
          </div>

          <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{
                width: 0,
              }}
              animate={{
                width: `${audit.freshnessScore * 10}%`,
              }}
              className={`h-full ${getScoreColor(
                audit.freshnessScore
              )}`}
            />
          </div>
        </div>

        {/* Risk Score */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle
              size={14}
              className="text-gray-500 flex-shrink-0"
            />

            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider break-words">
              Risk Score
            </span>
          </div>

          <div className="flex items-end gap-2 flex-wrap">
            <span className="text-2xl font-display font-bold break-words">
              {audit.riskScore}
            </span>

            <span className="text-xs text-gray-600 mb-1">
              / 10
            </span>
          </div>

          <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{
                width: 0,
              }}
              animate={{
                width: `${audit.riskScore * 10}%`,
              }}
              className={`h-full ${getScoreColor(
                10 - audit.riskScore
              )}`}
            />
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="space-y-4">
        {/* Observation */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <Info
              size={14}
              className="text-blue-400"
            />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5 break-words">
              AI Observation
            </p>

            <p className="text-xs text-gray-300 leading-relaxed break-words">
              {audit.safetyNotes}
            </p>
          </div>
        </div>

        {/* Food Type */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
            <ShoppingBag
              size={14}
              className="text-purple-400"
            />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5 break-words">
              Detected Type
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs text-gray-300 break-words">
                {audit.foodType}
              </p>

              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500 font-mono break-words">
                {audit.isPackaged
                  ? 'Packaged'
                  : 'Cooked/Open'}
              </span>
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-500/10 flex items-center justify-center flex-shrink-0">
            <Clock
              size={14}
              className="text-gray-400"
            />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5 break-words">
              Audit Timestamp
            </p>

            <p className="text-[10px] font-mono text-gray-500 break-words leading-relaxed">
              {new Date(
                audit.auditedAt ||
                  Date.now()
              ).toLocaleString()}{' '}
              · Model:{' '}
              {audit.modelUsed ||
                'Gemini 1.5 Flash'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIAuditPanel;
