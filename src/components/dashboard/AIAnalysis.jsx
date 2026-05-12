import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Brain,
  AlertTriangle,
  CheckCircle2,
  X,
  Zap,
} from 'lucide-react';

// Local AI mock — no backend endpoint for image analysis yet
const mockAnalyzeFood = async (file) => {
  await new Promise((r) => setTimeout(r, 1500));

  const fileName = file.name.toLowerCase();

  // Packed / sealed food keywords
  const packedKeywords = [
    'packet',
    'packed',
    'chips',
    'biscuit',
    'cookies',
    'juice',
    'snack',
    'sealed',
    'dry',
    'namkeen',
    'tetra',
  ];

  // Fresh / highly perishable foods
  const criticalKeywords = [
    'biryani',
    'rice',
    'meal',
    'curry',
    'pizza',
    'burger',
    'paneer',
    'chicken',
    'meat',
    'fish',
    'dal',
    'roti',
    'noodles',
  ];

  const isPacked = packedKeywords.some((k) =>
    fileName.includes(k)
  );

  const isCritical = criticalKeywords.some((k) =>
    fileName.includes(k)
  );

  if (isPacked) {
    return {
      category: 'standard',
      confidence: 95,
      estimatedExpiry: '24 hours',
      safetyMessage:
        'This appears to be packaged/sealed food and is suitable for standard priority pickup.',
    };
  }

  if (isCritical) {
    return {
      category: 'critical',
      confidence: 92,
      estimatedExpiry: '2 hours',
      safetyMessage:
        'Fresh cooked food detected. Immediate pickup recommended to avoid spoilage.',
    };
  }

  // Default
  return {
    category: 'standard',
    confidence: 80,
    estimatedExpiry: '6 hours',
    safetyMessage:
      'Food appears suitable for standard delivery handling.',
  };
};

export default function AIAnalysis({
  onResult,
  compact = false,
}) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (f) => {
    if (!f) return;

    setFile(f);
    setResult(null);

    const reader = new FileReader();

    reader.onload = (e) => setPreview(e.target.result);

    reader.readAsDataURL(f);
  };

  const analyze = async () => {
    if (!file) return;

    setLoading(true);

    const res = await mockAnalyzeFood(file);

    setResult(res);
    setLoading(false);

    if (onResult) onResult(res);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className={`${compact ? '' : 'card'} w-full`}>
      {!compact && (
        <div className="flex items-start sm:items-center gap-2 mb-4">
          <div className="p-2 bg-purple-400/10 rounded-lg flex-shrink-0">
            <Brain
              size={16}
              className="text-purple-400"
            />
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-sm break-words">
              AI Food Analysis
            </h3>

            <p className="text-xs text-gray-500 break-words">
              Upload a photo to classify priority
            </p>
          </div>
        </div>
      )}

      {!preview ? (
        <label
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-5 sm:p-8 cursor-pointer transition-all text-center min-h-[220px] sm:min-h-[260px] ${
            dragging
              ? 'border-brand-green bg-brand-green/5'
              : 'border-white/10 hover:border-white/20'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files[0]);
          }}
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              handleFile(e.target.files[0])
            }
          />

          <Upload
            size={24}
            className="sm:w-7 sm:h-7 text-gray-600 mb-3"
          />

          <p className="text-sm text-gray-400 font-medium break-words">
            Drop food image here
          </p>

          <p className="text-xs text-gray-600 mt-1 break-words">
            PNG, JPG up to 10MB
          </p>
        </label>
      ) : (
        <div className="w-full">
          <div
            className="relative rounded-xl overflow-hidden mb-3 w-full"
            style={{
              maxHeight: compact ? 120 : 220,
            }}
          >
            <img
              src={preview}
              alt="Food preview"
              className="w-full object-cover"
              style={{
                maxHeight: compact ? 120 : 220,
              }}
            />

            <button
              onClick={reset}
              className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {!result && !loading && (
            <button
              onClick={analyze}
              className="btn-primary w-full justify-center text-sm py-2.5 px-4 flex-wrap text-center"
            >
              <Brain size={15} />
              <span className="break-words">
                Analyze with AI
              </span>
            </button>
          )}

          {loading && (
            <div className="flex flex-col items-center py-4 gap-2 text-center px-2">
              <div className="relative w-12 h-12 flex-shrink-0">
                <div className="absolute inset-0 rounded-full border-2 border-purple-400/20" />

                <div className="absolute inset-0 rounded-full border-2 border-t-purple-400 animate-spin" />

                <Brain
                  size={18}
                  className="absolute inset-0 m-auto text-purple-400"
                />
              </div>

              <p className="text-xs text-gray-400 break-words">
                Analyzing food safety & perishability...
              </p>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-3 p-3 sm:p-4 rounded-xl border overflow-hidden ${
              result.category === 'critical'
                ? 'border-red-400/30 bg-red-400/5'
                : 'border-green-400/30 bg-green-400/5'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.category === 'critical' ? (
                <AlertTriangle
                  size={18}
                  className="text-red-400 flex-shrink-0 mt-0.5"
                />
              ) : (
                <CheckCircle2
                  size={18}
                  className="text-green-400 flex-shrink-0 mt-0.5"
                />
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className={`text-xs sm:text-sm font-bold uppercase break-words ${
                      result.category === 'critical'
                        ? 'text-red-400'
                        : 'text-green-400'
                    }`}
                  >
                    {result.category === 'critical'
                      ? '⚡ CRITICAL'
                      : '✓ STANDARD'}
                  </span>

                  <span className="text-[10px] sm:text-xs text-gray-500 break-words">
                    · {result.confidence}% confidence
                  </span>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed break-words">
                  {result.safetyMessage}
                </p>

                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <Zap
                    size={12}
                    className={
                      result.category === 'critical'
                        ? 'text-red-400'
                        : 'text-green-400'
                    }
                  />

                  <span className="text-xs font-medium break-words">
                    Expires in:{' '}
                    <span
                      className={
                        result.category === 'critical'
                          ? 'text-red-400'
                          : 'text-green-400'
                      }
                    >
                      {result.estimatedExpiry}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
