
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  MapPin,
  Brain,
  ArrowRight,
  ChevronRight,
  Users,
  Star,
  Shield,
  Clock
} from 'lucide-react';

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
  {
    step: '01',
    role: 'Restaurant',
    icon: '🍽️',
    title: 'Post Surplus Food',
    desc: 'Upload food details, quantity, and a photo. Our AI instantly classifies priority.'
  },
  {
    step: '02',
    role: 'System',
    icon: '⚡',
    title: 'Smart Matching',
    desc: 'Algorithm matches donation to nearest NGO. Flash alerts sent to available volunteers.'
  },
  {
    step: '03',
    role: 'Volunteer',
    icon: '🚴',
    title: 'Accept & Pickup',
    desc: 'Volunteer accepts, gets GPS route, picks up food from donor location.'
  },
  {
    step: '04',
    role: 'NGO',
    icon: '🏠',
    title: 'Receive & Distribute',
    desc: 'NGO receives food, confirms delivery. Community gets fed. Everyone wins.'
  },
];

const TESTIMONIALS = [
  {
    name: 'Chef Ramesh Kumar',
    role: 'Restaurant Owner',
    text: 'We used to throw away 20kg every night. Now it reaches families in need within 2 hours. Incredible.',
    stars: 5
  },
  {
    name: 'Sister Maria',
    role: 'Hope Foundation NGO',
    text: 'FoodBridge has been transformative. We now receive consistent, safe donations daily.',
    stars: 5
  },
  {
    name: 'Priya Venkat',
    role: 'Volunteer',
    text: 'Super easy to use. I complete 2-3 deliveries a week on my bike. Feels great.',
    stars: 5
  },
];

const colorMap = {
  purple:
    'text-purple-400 bg-purple-400/10 border-purple-400/20',

  green:
    'text-brand-green bg-brand-green/10 border-brand-green/20',

  yellow:
    'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',

  blue:
    'text-blue-400 bg-blue-400/10 border-blue-400/20',

  pink:
    'text-pink-400 bg-pink-400/10 border-pink-400/20',

  orange:
    'text-orange-400 bg-orange-400/10 border-orange-400/20',
};

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 30
  },

  visible: {
    opacity: 1,
    y: 0
  }
};

export default function LandingPage() {
  const [ticker, setTicker] =
    useState(0);

  useEffect(() => {
    const t = setInterval(
      () =>
        setTicker(
          p => (p + 1) % 4
        ),
      2500
    );

    return () =>
      clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-body overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center grid-bg pt-14 overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-green/5 rounded-full blur-3xl pointer-events-none" />

        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-brand-green/3 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center overflow-hidden">
          {/* Left */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.12
                }
              }
            }}
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 glass-green px-3 py-1.5 rounded-full text-xs text-brand-green font-medium mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />

              Live:
              {' '}
              {
                STATS[ticker]
                  .value
              }
              {' '}
              {
                STATS[ticker]
                  .label
              }
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6 break-words"
            >
              Reduce
              <br />

              <span className="text-brand-green text-glow">
                Food Waste.
              </span>

              <br />

              Deliver Hope.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-sm sm:text-base text-gray-400 max-w-md mb-8 leading-relaxed break-words"
            >
              FoodBridge connects restaurants and event halls with NGOs and volunteers to rescue surplus food — in real time, every day.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row flex-wrap gap-3"
            >
              <Link
                to="/signup"
                className="btn-primary text-sm sm:text-base px-6 py-3 justify-center w-full sm:w-auto"
              >
                Donate Food

                <ArrowRight size={18} />
              </Link>

              <Link
                to="/signup"
                className="btn-secondary text-sm sm:text-base px-6 py-3 justify-center w-full sm:w-auto"
              >
                Join as Volunteer

                <ChevronRight size={18} />
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              className="mt-10 grid grid-cols-2 sm:flex gap-6 flex-wrap"
            >
              {STATS.map(s => (
                <div key={s.label}>
                  <p className="font-display font-bold text-lg sm:text-xl text-brand-green break-words">
                    {s.value}
                  </p>

                  <p className="text-xs text-gray-500 break-words">
                    {s.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{
              opacity: 0,
              x: 40
            }}

            animate={{
              opacity: 1,
              x: 0
            }}

            transition={{
              delay: 0.3,
              duration: 0.6
            }}

            className="hidden lg:block relative"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <div className="absolute inset-1/4 glass-green rounded-full flex items-center justify-center glow-green animate-float">
                <div className="text-center">
                  <span className="text-4xl">
                    🌱
                  </span>

                  <p className="text-xs text-brand-green mt-1 font-semibold">
                    LIVE
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(
            (f, i) => (
              <motion.div
                key={i}
                className="card group cursor-default overflow-hidden"
              >
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${colorMap[f.color]}`}
                >
                  <f.icon size={18} />
                </div>

                <h3 className="font-display font-bold text-white mb-2 break-words">
                  {f.title}
                </h3>

                <p className="text-sm text-gray-500 leading-relaxed break-words">
                  {f.desc}
                </p>
              </motion.div>
            )
          )}
        </div>
      </section>
    </div>
  );
}
