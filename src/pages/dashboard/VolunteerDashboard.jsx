import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Truck, CheckCircle2, MapPin, Star, Package, Navigation, Clock, ShieldCheck, Activity } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import { StatsCard, Badge } from '../../components/common/UIComponents';
import DeliveryTimeline from '../../components/dashboard/DeliveryTimeline';
import useAuthStore from '../../store/useAuthStore';
import useDonationStore from '../../store/useDonationStore';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

export default function VolunteerDashboard() {
  const { user } = useAuthStore();
  const { donations, updateDonationStatus, fetchDonations } = useDonationStore();
  const { emit } = useSocket();

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);
  const [tab, setTab] = useState('flash');

  const userId = user?.id;
  const activeDelivery = donations.find(d => 
    String(d.volunteerId?._id || d.volunteerId) === String(userId) && 
    !['delivered', 'completed', 'rejected', 'expired'].includes(d.status)
  );

  const flashRequests = donations.filter(d => d.status === 'accepted' && !d.volunteerId && d.category === 'critical');
  const standardRequests = donations.filter(d => d.status === 'accepted' && !d.volunteerId && d.category === 'standard');
  const myDeliveries = donations.filter(d => String(d.volunteerId?._id || d.volunteerId) === String(userId));
  const completedCount = myDeliveries.filter(d => d.status === 'delivered' || d.status === 'completed').length;

  const acceptDelivery = async (donation) => {
    try {
      await updateDonationStatus(donation._id, 'volunteer_assigned', { volunteerId: userId });
      toast.success('Task Assigned! Prepare for pickup.');
      setTab('active');
    } catch (err) {
      toast.error('Failed to accept delivery');
    }
  };

  const updateStage = async (nextStatus) => {
    try {
      await updateDonationStatus(activeDelivery._id, nextStatus);
      toast.success(`Status updated to ${nextStatus.replace('_', ' ')}`);
    } catch (err) {
      toast.error('Failed to update stage');
    }
  };

  // Simulated Telemetry (Production would use Geolocation API)
  useEffect(() => {
    if (!activeDelivery) return;
    const interval = setInterval(() => {
      emit('volunteer_telemetry', {
        location: {
          type: 'Point',
          coordinates: [77.5946 + Math.random() * 0.01, 12.9716 + Math.random() * 0.01]
        },
        timestamp: new Date()
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [activeDelivery, emit]);

  return (
    <div className="min-h-screen bg-black flex text-gray-200">
      <Sidebar />
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-white/5 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="font-display font-black text-2xl tracking-tight">Volunteer Hub</h1>
            <p className="text-xs text-gray-500 font-medium">Ready for dispatch · {flashRequests.length} urgent tasks</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="active">Active Duty</Badge>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard label="Critical Tasks" value={flashRequests.length} icon={Zap} color="red" />
            <StatsCard label="Impact Points" value={completedCount * 100} icon={Star} color="yellow" />
            <StatsCard label="Deliveries" value={completedCount} icon={CheckCircle2} color="green" />
            <StatsCard label="Efficiency" value="98%" icon={Activity} color="blue" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left: Active Tasks / Selection */}
            <div className="xl:col-span-2 space-y-6">
              <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit border border-white/10">
                {[
                  { id: 'flash', label: `⚡ Urgent (${flashRequests.length})` },
                  { id: 'standard', label: `Available (${standardRequests.length})` },
                  { id: 'history', label: 'My Impact' },
                ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${tab === t.id ? 'bg-brand-green text-black' : 'text-gray-500 hover:text-white'}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {tab === 'flash' && (
                  <AnimatePresence>
                    {flashRequests.map(d => (
                      <motion.div key={d._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        className="p-6 rounded-3xl border border-red-500/20 bg-red-500/5 flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center animate-pulse border border-red-500/30">
                          <Zap size={24} className="text-red-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-1">{d.foodType}</h4>
                          <p className="text-xs text-gray-500">{d.restaurantName} · {d.location}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest bg-red-400/10 px-2 py-0.5 rounded">Urgent</span>
                            <span className="text-xs text-gray-400 font-medium flex items-center gap-1"><Clock size={12}/> {d.expiresIn} left</span>
                          </div>
                        </div>
                        <button onClick={() => acceptDelivery(d)} className="btn-primary py-3 px-8 text-sm font-bold uppercase tracking-widest">
                          Respond
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}

                {tab === 'standard' && standardRequests.map(d => (
                  <div key={d._id} className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                      <Package size={24} className="text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-1">{d.foodType}</h4>
                      <p className="text-xs text-gray-500">{d.restaurantName} · {d.location}</p>
                    </div>
                    <button onClick={() => acceptDelivery(d)} className="btn-secondary py-3 px-8 text-sm font-bold uppercase tracking-widest">
                      Accept
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Active Mission Control */}
            <div className="space-y-6">
              {activeDelivery ? (
                <div className="p-6 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6">
                    <span className="w-2 h-2 rounded-full bg-brand-green animate-ping block" />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-green/20 flex items-center justify-center border border-brand-green/30 text-brand-green">
                      <Navigation size={20} />
                    </div>
                    <div>
                      <h3 className="font-black font-display text-sm uppercase tracking-wider">Active Mission</h3>
                      <p className="text-xs text-gray-500">{activeDelivery.foodType}</p>
                    </div>
                  </div>

                  <DeliveryTimeline status={activeDelivery.status} timestamps={activeDelivery.delivery?.timestamps} />

                  <div className="pt-4 space-y-3">
                    {activeDelivery.status === 'volunteer_assigned' && (
                      <button onClick={() => updateStage('pickup_started')} className="btn-primary w-full py-4 text-sm font-black uppercase tracking-widest">
                        Start Pickup Journey
                      </button>
                    )}
                    {activeDelivery.status === 'pickup_started' && (
                      <button onClick={() => updateStage('picked_up')} className="btn-primary w-full py-4 text-sm font-black uppercase tracking-widest">
                        📦 Confirm Pickup
                      </button>
                    )}
                    {activeDelivery.status === 'picked_up' && (
                      <button onClick={() => updateStage('in_transit')} className="btn-primary w-full py-4 text-sm font-black uppercase tracking-widest">
                        🛣️ Start Transit
                      </button>
                    )}
                    {activeDelivery.status === 'in_transit' && (
                      <button onClick={() => updateStage('delivered')} className="btn-primary w-full py-4 text-sm font-black uppercase tracking-widest">
                        🏁 Complete Delivery
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-12 rounded-[2.5rem] bg-white/5 border border-dashed border-white/10 text-center space-y-4">
                  <Activity size={40} className="mx-auto text-gray-700" />
                  <p className="text-sm text-gray-600 font-medium">Ready for dispatch.<br/>Select a task to begin mission tracking.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
