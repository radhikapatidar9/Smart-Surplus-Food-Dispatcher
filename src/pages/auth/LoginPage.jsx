import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(`/dashboard/${user.role}`, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setError('');
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      toast.success(`Welcome back!`);
      navigate(`/dashboard/${result.user.role}`, { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-black grid lg:grid-cols-2">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center p-16 bg-dark-800 border-r border-white/5 grid-bg relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-green/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <Link to="/" className="font-display font-bold text-2xl mb-12 block">
            Food<span className="text-brand-green">Bridge</span>
          </Link>
          <h1 className="font-display text-4xl font-extrabold mb-4 leading-tight">
            Every day,<br />
            <span className="text-brand-green">we save thousands</span><br />
            of meals.
          </h1>
          <p className="text-gray-500 mb-10 leading-relaxed">Join our growing network of restaurants, NGOs, and volunteers making hunger history — one delivery at a time.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-col justify-center p-6 lg:p-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm w-full mx-auto">
          <Link to="/" className="font-display font-bold text-xl mb-8 block lg:hidden">
            Food<span className="text-brand-green">Bridge</span>
          </Link>

          <h2 className="font-display font-bold text-2xl mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div>
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>

            <div>
              <label>Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-3 text-sm" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Signing in...</span>
              ) : (
                <span className="flex items-center gap-2">Sign In <ArrowRight size={16} /></span>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-green hover:underline">Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
