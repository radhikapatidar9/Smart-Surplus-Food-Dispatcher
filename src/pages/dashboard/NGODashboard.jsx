import React, {
  useState,
  useEffect,
} from 'react';

import { motion } from 'framer-motion';

import {
  Package,
  CheckCircle2,
  Truck,
  Search,
  Clock,
  Activity,
} from 'lucide-react';

import Sidebar from '../../components/common/Sidebar';

import {
  StatsCard,
} from '../../components/common/UIComponents';

import DonationCard from '../../components/dashboard/DonationCard';

import LiveActivityFeed from '../../components/dashboard/LiveActivityFeed';

import DeliveryTimeline from '../../components/dashboard/DeliveryTimeline';

import useAuthStore from '../../store/useAuthStore';

import useDonationStore from '../../store/useDonationStore';

import useNotificationStore from '../../store/useNotificationStore';

import { useSocket } from '../../context/SocketContext';

import toast from 'react-hot-toast';

export default function NGODashboard() {
  const { user } =
    useAuthStore();

  const {
    donations,
    updateDonationStatus,
    fetchDonations,
  } = useDonationStore();

  const {
    notifications,
    fetchNotifications,
  } =
    useNotificationStore();

  const { syncState } =
    useSocket();

  useEffect(() => {
    fetchDonations();
    fetchNotifications();
  }, [
    fetchDonations,
    fetchNotifications,
  ]);

  const [filter, setFilter] =
    useState('all');

  const [search, setSearch] =
    useState('');

  const [tab, setTab] =
    useState('available');

  const [
    selectedDonation,
    setSelectedDonation,
  ] = useState(null);

  const userId = user?.id;

  const available =
    donations.filter(
      (d) =>
        d.status ===
        'pending'
    );

  const active =
    donations.filter(
      (d) =>
        ![
          'pending',
          'delivered',
          'completed',
          'rejected',
          'expired',
        ].includes(
          d.status
        ) &&
        String(
          d.ngoId?._id ||
            d.ngoId
        ) ===
          String(userId)
    );

  const history =
    donations.filter(
      (d) =>
        [
          'delivered',
          'completed',
        ].includes(
          d.status
        ) &&
        String(
          d.ngoId?._id ||
            d.ngoId
        ) ===
          String(userId)
    );

  const filtered = (
    tab === 'available'
      ? available
      : tab === 'active'
      ? active
      : history
  )
    .filter(
      (d) =>
        filter ===
          'all' ||
        d.category ===
          filter
    )
    .filter(
      (d) =>
        !search ||
        d.foodType
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        d.restaurantName
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  const accept = async (
    donation
  ) => {
    try {
      await updateDonationStatus(
        donation._id,
        'accepted',
        {
          ngoId: userId,
        }
      );

      toast.success(
        'Donation accepted! Logistics engine is assigning a volunteer.'
      );
    } catch (err) {
      toast.error(
        'Failed to accept donation'
      );
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row text-gray-200 overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-auto flex flex-col min-w-0">
        {/* Top Navigation */}
        <header className="sticky top-0 z-30 glass border-b border-white/5 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display font-black text-xl sm:text-2xl tracking-tight break-words">
              NGO Mission
              Control
            </h1>

            <p className="text-xs text-gray-500 font-medium break-words mt-1">
              Monitoring{' '}
              {active.length}{' '}
              active rescues ·{' '}
              {
                available.length
              }{' '}
              available
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-bold text-brand-green whitespace-nowrap">
                NETWORK
                STATUS
              </span>

              <span className="text-[10px] text-gray-600 font-mono whitespace-nowrap">
                LATENCY:
                24ms
              </span>
            </div>

            <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse flex-shrink-0" />
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 flex flex-col xl:flex-row gap-6 lg:gap-8 flex-1 overflow-hidden">
          {/* Main Dashboard Area */}
          <div className="flex-1 space-y-6 lg:space-y-8 max-w-full xl:max-w-5xl min-w-0">
            {/* Real-time Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatsCard
                label="Fleet Active"
                value={
                  active.length
                }
                icon={Truck}
                color="green"
                trend="+2 from last hour"
              />

              <StatsCard
                label="Total Saved"
                value={
                  history.length
                }
                icon={
                  CheckCircle2
                }
                color="blue"
              />

              <StatsCard
                label="Pending Audit"
                value={
                  donations.filter(
                    (d) =>
                      d.status ===
                      'pending'
                  ).length
                }
                icon={Activity}
                color="yellow"
              />

              <StatsCard
                label="Critical Risk"
                value={
                  available.filter(
                    (d) =>
                      d.category ===
                      'critical'
                  ).length
                }
                icon={Clock}
                color="red"
              />
            </div>

            {/* Navigation & Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 overflow-hidden">
              {/* Tabs */}
              <div className="flex overflow-x-auto gap-1 bg-black/40 p-1 rounded-xl border border-white/5 scrollbar-hide">
                {[
                  {
                    id: 'available',
                    label:
                      'Marketplace',
                    count:
                      available.length,
                  },

                  {
                    id: 'active',
                    label:
                      'Live Tracking',
                    count:
                      active.length,
                  },

                  {
                    id: 'history',
                    label:
                      'History',
                    count:
                      history.length,
                  },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() =>
                      setTab(
                        t.id
                      )
                    }
                    className={`px-4 sm:px-5 py-2 rounded-lg text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                      tab === t.id
                        ? 'bg-brand-green text-black'
                        : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    {t.label}

                    {t.count >
                      0 && (
                      <span className="ml-1 opacity-60">
                        (
                        {
                          t.count
                        }
                        )
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
                  />

                  <input
                    type="text"
                    placeholder="Global search..."
                    value={
                      search
                    }
                    onChange={(
                      e
                    ) =>
                      setSearch(
                        e
                          .target
                          .value
                      )
                    }
                    className="bg-black/40 border border-white/10 text-xs py-2 pl-9 pr-4 rounded-lg focus:border-brand-green/50 transition-all w-full"
                  />
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* List View */}
              <div className="space-y-4 min-w-0">
                {filtered.length ===
                0 ? (
                  <div className="text-center py-14 sm:py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 px-4">
                    <Package
                      size={48}
                      className="mx-auto mb-4 opacity-10"
                    />

                    <p className="text-gray-600 font-medium break-words">
                      No donations
                      matching your
                      criteria
                    </p>
                  </div>
                ) : (
                  filtered.map(
                    (d) => (
                      <DonationCard
                        key={d._id}
                        donation={
                          d
                        }
                        onClick={() =>
                          setSelectedDonation(
                            d
                          )
                        }
                        active={
                          selectedDonation?._id ===
                          d._id
                        }
                        actions={
                          tab ===
                          'available' ? (
                            <div className="flex gap-2 w-full mt-4">
                              <button
                                onClick={(
                                  e
                                ) => {
                                  e.stopPropagation();

                                  accept(
                                    d
                                  );
                                }}
                                className="btn-primary w-full py-2 text-xs font-bold uppercase tracking-widest px-3 break-words"
                              >
                                Claim
                                Donation
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2 w-full mt-4">
                              <button
                                onClick={(
                                  e
                                ) => {
                                  e.stopPropagation();

                                  window.location.href = `/tracking/${d._id}`;
                                }}
                                className="btn-secondary w-full py-2 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 px-3 break-words"
                              >
                                <Truck
                                  size={
                                    14
                                  }
                                />

                                Full
                                Map
                                Tracking
                              </button>
                            </div>
                          )
                        }
                      />
                    )
                  )
                )}
              </div>

              {/* Context Panel */}
              <div className="space-y-6 hidden lg:block sticky top-32 h-fit min-w-0">
                {selectedDonation ? (
                  <div className="p-4 sm:p-6 rounded-3xl bg-white/5 border border-white/10 shadow-2xl overflow-hidden">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 break-words">
                      Mission
                      Lifecycle
                    </h4>

                    <DeliveryTimeline
                      status={
                        selectedDonation.status
                      }
                      timestamps={
                        selectedDonation
                          .delivery
                          ?.timestamps
                      }
                    />
                  </div>
                ) : (
                  <div className="h-full bg-white/5 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center p-8 sm:p-12 text-center overflow-hidden">
                    <Activity
                      size={40}
                      className="mb-4 text-gray-700"
                    />

                    <p className="text-sm text-gray-500 break-words">
                      Select a
                      donation to
                      view live
                      mission pulse
                      and AI safety
                      audit
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity Sidebar */}
          <aside className="w-full xl:w-80 flex-shrink-0 space-y-6 lg:space-y-8">
            <LiveActivityFeed
              notifications={
                notifications
              }
            />

            <div className="p-5 rounded-2xl bg-brand-green/5 border border-brand-green/10 overflow-hidden">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-green mb-3 break-words">
                System Health
              </h4>

              <div className="space-y-3">
                <div className="flex justify-between gap-2 text-[10px]">
                  <span className="text-gray-500 break-words">
                    Logistics
                    Engine
                  </span>

                  <span className="text-brand-green whitespace-nowrap">
                    Operational
                  </span>
                </div>

                <div className="flex justify-between gap-2 text-[10px]">
                  <span className="text-gray-500 break-words">
                    AI Safety
                    Auditor
                  </span>

                  <span className="text-brand-green whitespace-nowrap">
                    Active
                  </span>
                </div>

                <div className="flex justify-between gap-2 text-[10px]">
                  <span className="text-gray-500 break-words">
                    Geospatial
                    Index
                  </span>

                  <span className="text-brand-green whitespace-nowrap">
                    Synced
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
