import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-center px-4 sm:px-6 grid-bg overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg mx-auto"
      >
        <p className="font-display text-6xl sm:text-8xl font-extrabold text-brand-green opacity-30 mb-4 break-words">
          404
        </p>

        <h1 className="font-display text-2xl sm:text-3xl font-bold mb-2 break-words">
          Page Not Found
        </h1>

        <p className="text-sm sm:text-base text-gray-500 mb-8 break-words leading-relaxed">
          This page doesn't exist or has been moved.
        </p>

        <button
          onClick={() =>
            window.history.length > 2
              ? navigate(-1)
              : navigate('/', { replace: true })
          }
          className="btn-primary inline-flex justify-center items-center gap-2 w-full sm:w-auto px-6 py-3 text-sm sm:text-base"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </motion.div>
    </div>
  );
}
