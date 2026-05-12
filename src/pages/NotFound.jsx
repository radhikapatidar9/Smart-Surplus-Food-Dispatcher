import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-center px-4 grid-bg">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="font-display text-8xl font-extrabold text-brand-green opacity-30 mb-4">404</p>
        <h1 className="font-display text-3xl font-bold mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-8">This page doesn't exist or has been moved.</p>
        <button onClick={() => window.history.length > 2 ? navigate(-1) : navigate('/', { replace: true })} className="btn-primary inline-flex">
          <ArrowLeft size={16} /> Back
        </button>
      </motion.div>
    </div>
  );
}
