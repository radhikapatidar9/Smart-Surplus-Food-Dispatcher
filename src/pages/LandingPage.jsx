import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, MapPin, Brain, ArrowRight, ChevronRight, Users, Star, Shield, Clock } from 'lucide-react';
import Navbar from '../components/common/Navbar';

const STATS = [
  { value: '12,450+', label: 'Kg Food Saved' },
  { value: '847', label: 'Deliveries Done' },
  { value: '38', label: 'NGOs Served' },
  { value: '124', label: 'Active Volunteers' },
];

const FEATURES = [
  {
    icon: Brain,
    title: 'AI Food Classification',
    desc: 'Our model instantly categorizes food by perishability — Critical (2hr) or Standard (6-8hr) — ensuring zero waste through smart prioritization.',
    color: 'purple',
  },
  {
    icon: MapPin,
    title: 'Real-Time GPS Tracking',
    desc: 'Live volunteer location tracking, route optimization, and ETA updates keep everyone informed from pickup to delivery.',
    color: 'green',
  },
  {
    icon: Zap,
    title: 'Flash Dispatch',
    desc: 'Critical food alerts trigger instant notifications to nearby volunteers. Average response time under 4 minutes.',
    color: 'yellow',
  },
  {
    icon: Shield,
    title: 'Safety Verification',
    desc: 'Every donation is AI-verified for safety. Volunteers are background-checked. Recipients get food safety reports.',
    color: 'blue',
  },
  {
    icon: Users,
    title: 'Community Network',
    desc: 'Connect with 500+ restaurants, 38 NGOs, and 124 volunteers across the city through one unified platform.',
    color: 'pink',
  },
  {
    icon: Clock,
    title: '24/7 Operations',
    desc: 'Round-the-clock coordination ensures late-night event leftovers reach shelters before dawn.',
    color: 'orange',
  },
];

const STEPS = [
  { step: '01', role: 'Restaurant', icon: '🍽️', title: 'Post Surplus Food', desc: 'Upload food details, quantity, and a photo. Our AI instantly classifies priority.' },
  { step: '02', role: 'System', icon: '⚡', title: 'Smart Matching', desc: 'Algorithm matches donation to nearest NGO. Flash alerts sent to available volunteers.' },
  { step: '03', role: 'Volunteer', icon: '🚴', title: 'Accept & Pickup', desc: 'Volunteer accepts, gets GPS route, picks up food from donor location.' },
  { step: '04', role: 'NGO', icon: '🏠', title: 'Receive & Distribute', desc: 'NGO receives food, confirms delivery. Community gets fed. Everyone wins.' },
];

const TESTIMONIALS = [
  { name: 'Chef Ramesh Kumar', role: 'Restaurant Owner', text: 'We used to throw away 20kg every night. Now it reaches families in need within 2 hours. Incredible.', stars: 5 },
  { name: 'Sister Maria', role: 'Hope Foundation NGO', text: 'FoodBridge has been transformative. We now receive consistent, safe donations daily.', stars: 5 },
  { name: 'Priya Venkat', role: 'Volunteer', text: 'Super easy to use. I complete 2-3 deliveries a week on my bike. Feels great.', stars: 5 },
];

const colorMap = {
  purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  green: 'text-brand-green bg-brand-green/10 border-brand-green/20',
  yellow: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  pink: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
  orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
};

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

export default function LandingPage() {
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTicker(p => (p + 1) % 4), 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-body overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center grid-bg pt-20 sm:pt-24">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-green/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-brand-green/3 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 glass-green px-3 py-1.5 rounded-full text-xs text-brand-green font-medium mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
              Live: {STATS[ticker].value} {STATS[ticker].label}
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-5 sm:mb-6"
            >
              Reduce
              <br />
              <span className="text-brand-green text-glow">Food Waste.</span>
              <br />
              Deliver Hope.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-sm sm:text-base text-gray-400 max-w-md mb-6 sm:mb-8 leading-relaxed"
            >
              FoodBridge connects restaurants and event halls with NGOs and volunteers to rescue surplus food — in real time, every day.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row flex-wrap gap-3 w-full sm:w-auto"
            >
              <Link
                to="/signup"
                className="btn-primary text-sm sm:text-base px-5 sm:px-6 py-3 w-full sm:w-auto justify-center"
              >
                Donate Food <ArrowRight size={18} />
              </Link>

              <Link
                to="/signup"
                className="btn-secondary text-sm sm:text-base px-5 sm:px-6 py-3 w-full sm:w-auto justify-center"
              >
                Join as Volunteer <ChevronRight size={18} />
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-8 sm:mt-10 grid grid-cols-2 sm:flex gap-5 sm:gap-6"
            >
              {STATS.map(s => (
                <div key={s.label}>
                  <p className="font-display font-bold text-xl text-brand-green">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="hidden lg:block relative"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <div className="absolute inset-1/4 glass-green rounded-full flex items-center justify-center glow-green animate-float">
                <div className="text-center">
                  <span className="text-4xl">🌱</span>
                  <p className="text-xs text-brand-green mt-1 font-semibold">LIVE</p>
                </div>
              </div>

              {[
                { emoji: '🍛', label: 'Donor', angle: 0 },
                { emoji: '🚴', label: 'Volunteer', angle: 120 },
                { emoji: '🏠', label: 'NGO', angle: 240 },
              ].map((n, i) => {
                const rad = (n.angle * Math.PI) / 180;
                const x = 50 + 38 * Math.sin(rad);
                const y = 50 - 38 * Math.cos(rad);

                return (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
                    className="absolute glass rounded-2xl p-3 text-center border border-white/10"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%,-50%)',
                      width: 80,
                    }}
                  >
                    <span className="text-2xl">{n.emoji}</span>
                    <p className="text-[10px] text-gray-400 mt-1">{n.label}</p>
                  </motion.div>
                );
              })}

              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {[0, 120, 240].map((angle, i) => {
                  const rad = (angle * Math.PI) / 180;
                  const x = 50 + 38 * Math.sin(rad);
                  const y = 50 - 38 * Math.cos(rad);

                  return (
                    <line
                      key={i}
                      x1="50"
                      y1="50"
                      x2={x}
                      y2={y}
                      stroke="rgba(34,197,94,0.2)"
                      strokeWidth="0.5"
                      strokeDasharray="2,2"
                    />
                  );
                })}
              </svg>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="py-16 sm:py-20 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="text-xs font-medium text-brand-green uppercase tracking-widest">
              Platform Features
            </span>

            <h2 className="font-display text-3xl font-bold mt-3 tracking-tight">
              Built for Speed & Impact
            </h2>

            <p className="text-gray-400 mt-3 max-w-xl mx-auto">
              Every feature is designed to get food from donor to recipient as fast as humanly (and technically) possible.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={i} variants={fadeUp} className="card group cursor-default">
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${colorMap[f.color]}`}
                >
                  <f.icon size={18} />
                </div>

                <h3 className="font-display font-bold text-white mb-2">{f.title}</h3>

                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="py-16 sm:py-20 lg:py-24 bg-dark-800 border-y border-white/5"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-medium text-brand-green uppercase tracking-widest">
              Process
            </span>

            <h2 className="font-display text-3xl font-bold mt-3 tracking-tight">
              How FoodBridge Works
            </h2>

            <p className="text-gray-400 mt-3">
              From post to plate in under 2 hours for critical food
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <div className="relative z-10 text-center">
                  <div className="text-4xl mb-3">{s.icon}</div>

                  <div className="font-mono text-xs text-brand-green mb-2 font-bold">
                    {s.step}
                  </div>

                  <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-500 mb-2">
                    {s.role}
                  </span>

                  <h3 className="font-display font-bold mb-2">{s.title}</h3>

                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 lg:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl font-bold tracking-tight">
            Loved by Communities
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card"
            >
              <div className="flex gap-1 mb-3">
                {Array(t.stars)
                  .fill(0)
                  .map((_, j) => (
                    <Star
                      key={j}
                      size={14}
                      className="text-yellow-400 fill-yellow-400"
                    />
                  ))}
              </div>

              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                "{t.text}"
              </p>

              <div className="flex items-center gap-2.5 pt-3 border-t border-white/5">
                <div className="w-8 h-8 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green text-xs font-bold">
                  {t.name[0]}
                </div>

                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto glass-green rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 grid-bg opacity-30" />

          <div className="relative z-10">
            <span className="text-4xl mb-4 block">🌍</span>

            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4 tracking-tight leading-tight">
              Every meal saved is
              <br />
              <span className="text-brand-green">a family fed.</span>
            </h2>

            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Join 500+ restaurants, 38 NGOs, and 124 volunteers who are already making a difference daily.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
              <Link to="/signup" className="btn-primary px-8 py-3 text-base">
                Start Donating
              </Link>

              <Link to="/signup" className="btn-secondary px-8 py-3 text-base">
                Volunteer Today
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="font-display font-bold text-xl mb-3">
              Food<span className="text-brand-green">Bridge</span>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed">
              Smart logistics platform connecting surplus food with communities in need.
            </p>
          </div>

          {[
            {
              title: 'Platform',
              links: ['For Restaurants', 'For NGOs', 'For Volunteers', 'Admin Panel'],
            },
            {
              title: 'Company',
              links: ['About Us', 'Blog', 'Press', 'Careers'],
            },
            {
              title: 'Contact',
              links: ['hello@foodbridge.in', '+91 98765 43210', 'Bangalore, India', 'Impact Report'],
            },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                {col.title}
              </h4>

              <ul className="space-y-2">
                {col.links.map(l => (
                  <li
                    key={l}
                    className="text-sm text-gray-400 hover:text-brand-green cursor-pointer transition-colors"
                  >
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto border-t border-white/5 mt-8 pt-6 flex flex-col sm:flex-row gap-3 justify-between items-center text-xs text-gray-600 text-center sm:text-left">
          <p>© 2025 FoodBridge. All rights reserved.</p>
          <p>Made with 💚 to fight hunger</p>
        </div>
      </footer>
    </div>
  );
}
