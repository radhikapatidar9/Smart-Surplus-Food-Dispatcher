import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, List, TrendingUp, Package, Clock, CheckCircle2, Filter, Activity, ShieldCheck } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import { StatsCard, Modal } from '../../components/common/UIComponents';
import DonationForm from '../../components/dashboard/DonationForm';
import DonationCard from '../../components/dashboard/DonationCard';
import DeliveryTimeline from '../../components/dashboard/DeliveryTimeline';
import useAuthStore from '../../store/useAuthStore';
import useDonationStore from '../../store/useDonationStore';

export default function RestaurantDashboard() {
  const { user } = useAuthStore();
  const { donations, fetchDonations } = useDonationStore();

  React.useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState('active');
  const [selectedDonation, setSelectedDonation] = useState(null);

  const myDonations = donations.filter(d => {
    const rid = d.restaurantId?._id || d.restaurantId;
    return rid === user?.id || String(rid) === String(user?.id);
  });

  const active = myDonations.filter(d => !['delivered', 'completed', 'rejected', 'expired'].includes(d.status));
  const history = myDonations.filter(d => ['delivered', 'completed'].includes(d.status));

  return (
    <div className="min-h-screen bg-black flex text-gray-200">
      <Sidebar />
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-white/5 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="font-display font-black text-2xl tracking-tight">Partner Dashboard</h1>
            <p className="text-xs text-gray-500 font-medium">{user?.name} · Verified Partner</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary py-3 px-6 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <Plus size={16} /> Post Donation
          </button>
        </header>

        <div className="p-8 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard label="Total Saved" value={history.length} icon={Package} color="green" />
            <StatsCard label="In Transit" value={active.filter(d => d.status === 'in_transit').length} icon={Clock} color="yellow" />
            <StatsCard label="Critical Tasks" value={myDonations.filter(d => d.category === 'critical').length} icon={ShieldCheck} color="blue" />
            <StatsCard label="Community Impact" value="High" icon={TrendingUp} color="red" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left: Donation Management */}
            <div className="xl:col-span-2 space-y-6">
              <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit border border-white/10">
                {[
                  { id: 'active', label: `Active (${active.length})` },
                  { id: 'history', label: 'History' },
                ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${tab === t.id ? 'bg-brand-green text-black' : 'text-gray-500 hover:text-white'}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(tab === 'active' ? active : history).map(d => (
                  <DonationCard 
                    key={d._id} 
                    donation={d} 
                    onClick={() => setSelectedDonation(d)}
                    active={selectedDonation?._id === d._id}
                  />
                ))}
              </div>
            </div>

            {/* Right: Insight Panel */}
            <div className="space-y-6">
              {selectedDonation ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-2xl space-y-8"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-green/20 flex items-center justify-center border border-brand-green/30 text-brand-green">
                      <Activity size={20} />
                    </div>
                    <div>
                      <h3 className="font-black font-display text-sm uppercase tracking-wider">Mission Insight</h3>
                      <p className="text-xs text-gray-500">{selectedDonation.foodType}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Delivery Progress</h4>
                    <DeliveryTimeline status={selectedDonation.status} timestamps={selectedDonation.delivery?.timestamps} />
                  </div>
                </motion.div>
              ) : (
                <div className="p-12 rounded-[2.5rem] bg-white/5 border border-dashed border-white/10 text-center space-y-4">
                  <ShieldCheck size={40} className="mx-auto text-gray-700" />
                  <p className="text-sm text-gray-600 font-medium">Select a donation to view<br/>AI safety audit and delivery status.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Food Donation" size="lg">
        <DonationForm onSuccess={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
