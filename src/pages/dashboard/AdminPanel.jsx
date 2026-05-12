import React, {
  useState,
  useEffect,
} from 'react';

import { motion } from 'framer-motion';

import {
  Users,
  Package,
  TrendingUp,
  Truck,
  Shield,
  Activity,
  Search,
} from 'lucide-react';

import Sidebar from '../../components/common/Sidebar';

import {
  StatsCard,
  Badge,
} from '../../components/common/UIComponents';

import useDonationStore from '../../store/useDonationStore';

import { adminService } from '../../services/api';

import {
  formatTime,
  getStatusLabel,
} from '../../utils/helpers';

export default function AdminPanel() {
  const {
    donations,
    fetchDonations,
  } = useDonationStore();

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const [tab, setTab] =
    useState('overview');

  const [stats, setStats] =
    useState(null);

  const [users, setUsers] =
    useState([]);

  const [
    userSearch,
    setUserSearch,
  ] = useState('');

  const [
    roleFilter,
    setRoleFilter,
  ] = useState('all');

  useEffect(() => {
    loadStats();
    loadUsers();
  }, []);

  const loadStats = async () => {
    try {
      const res =
        await adminService.getStats();

      if (res.success)
        setStats(res.data);
    } catch (err) {
      console.error(
        'Failed to load admin stats:',
        err
      );
    }
  };

  const loadUsers = async () => {
    try {
      const res =
        await adminService.getUsers();

      if (res.success)
        setUsers(res.data);
    } catch (err) {
      console.error(
        'Failed to load users:',
        err
      );
    }
  };

  const filteredUsers = users
    .filter(
      (u) =>
        roleFilter ===
          'all' ||
        u.role === roleFilter
    )
    .filter(
      (u) =>
        !userSearch ||
        u.name
          .toLowerCase()
          .includes(
            userSearch.toLowerCase()
          ) ||
        u.email
          .toLowerCase()
          .includes(
            userSearch.toLowerCase()
          )
    );

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col lg:flex-row overflow-hidden">
      <Sidebar />

      <div className="flex-1 overflow-auto min-w-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-dark-900/90 backdrop-blur-sm border-b border-white/5 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5 break-words">
              Admin Panel
            </p>

            <h1 className="font-display font-bold text-base sm:text-lg flex items-center gap-2 break-words">
              <Shield
                size={18}
                className="text-brand-green flex-shrink-0"
              />

              <span>
                System Overview
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs glass px-3 py-1.5 rounded-full border border-white/5 w-fit max-w-full">
            <Activity
              size={12}
              className="text-brand-green flex-shrink-0"
            />

            <span className="text-gray-400 break-words">
              All systems
              operational
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6 overflow-hidden">
          {/* Key stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-3">
            {stats ? (
              [
                {
                  label:
                    'Total Donations',
                  value:
                    stats.totalDonations,
                  icon: Package,
                  color: 'green',
                },

                {
                  label:
                    'Delivered',
                  value:
                    stats.deliveredDonations,
                  icon: Truck,
                  color: 'blue',
                },

                {
                  label:
                    'Volunteers',
                  value:
                    stats.volunteers,
                  icon: Users,
                  color: 'purple',
                },

                {
                  label: 'NGOs',
                  value:
                    stats.ngos,
                  icon: Shield,
                  color: 'yellow',
                },

                {
                  label:
                    'Restaurants',
                  value:
                    stats.restaurants,
                  icon:
                    TrendingUp,
                  color: 'green',
                },

                {
                  label:
                    'Total Users',
                  value:
                    stats.totalUsers,
                  icon:
                    Activity,
                  color: 'blue',
                },
              ].map((s) => (
                <StatsCard
                  key={s.label}
                  label={s.label}
                  value={s.value}
                  icon={s.icon}
                  color={s.color}
                />
              ))
            ) : (
              Array(6)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="card animate-pulse h-24 bg-dark-800"
                  />
                ))
            )}
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-1 bg-dark-800 p-1 rounded-xl w-full sm:w-fit border border-white/5 overflow-x-auto">
            {[
              'overview',
              'users',
              'donations',
            ].map((t) => (
              <button
                key={t}
                onClick={() =>
                  setTab(t)
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap ${
                  tab === t
                    ? 'bg-brand-green text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* OVERVIEW */}
          {tab ===
            'overview' &&
            stats && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Summary */}
                <div className="lg:col-span-2 card overflow-hidden">
                  <div className="flex items-center justify-between mb-5 gap-3">
                    <div className="min-w-0">
                      <h3 className="font-display font-bold break-words">
                        Platform
                        Summary
                      </h3>

                      <p className="text-xs text-gray-500 mt-0.5 break-words">
                        Real-time
                        data from
                        database
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/3 rounded-xl overflow-hidden">
                      <p className="text-xs text-gray-500 break-words">
                        Pending
                        Donations
                      </p>

                      <p className="text-2xl font-bold text-yellow-400 mt-1 break-words">
                        {
                          stats.pendingDonations
                        }
                      </p>
                    </div>

                    <div className="p-4 bg-white/3 rounded-xl overflow-hidden">
                      <p className="text-xs text-gray-500 break-words">
                        Delivered
                      </p>

                      <p className="text-2xl font-bold text-green-400 mt-1 break-words">
                        {
                          stats.deliveredDonations
                        }
                      </p>
                    </div>

                    <div className="p-4 bg-white/3 rounded-xl overflow-hidden">
                      <p className="text-xs text-gray-500 break-words">
                        Critical
                      </p>

                      <p className="text-2xl font-bold text-red-400 mt-1 break-words">
                        {
                          stats.criticalDonations
                        }
                      </p>
                    </div>

                    <div className="p-4 bg-white/3 rounded-xl overflow-hidden">
                      <p className="text-xs text-gray-500 break-words">
                        Standard
                      </p>

                      <p className="text-2xl font-bold text-blue-400 mt-1 break-words">
                        {stats.standardDonations ||
                          stats.totalDonations -
                            stats.criticalDonations}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Distribution */}
                <div className="card overflow-hidden">
                  <h3 className="font-display font-bold mb-4 break-words">
                    User
                    Distribution
                  </h3>

                  <div className="space-y-3">
                    {[
                      {
                        label:
                          'Restaurants',
                        count:
                          stats.restaurants,
                        pct:
                          stats.totalUsers >
                          0
                            ? Math.round(
                                (stats.restaurants /
                                  stats.totalUsers) *
                                  100
                              )
                            : 0,
                        color:
                          'bg-orange-400',
                      },

                      {
                        label:
                          'NGOs',
                        count:
                          stats.ngos,
                        pct:
                          stats.totalUsers >
                          0
                            ? Math.round(
                                (stats.ngos /
                                  stats.totalUsers) *
                                  100
                              )
                            : 0,
                        color:
                          'bg-blue-400',
                      },

                      {
                        label:
                          'Volunteers',
                        count:
                          stats.volunteers,
                        pct:
                          stats.totalUsers >
                          0
                            ? Math.round(
                                (stats.volunteers /
                                  stats.totalUsers) *
                                  100
                              )
                            : 0,
                        color:
                          'bg-purple-400',
                      },
                    ].map(
                      (item) => (
                        <div
                          key={
                            item.label
                          }
                        >
                          <div className="flex justify-between gap-2 text-xs mb-1">
                            <span className="text-gray-400 break-words">
                              {
                                item.label
                              }
                            </span>

                            <span className="text-white font-medium break-words">
                              {
                                item.count
                              }
                            </span>
                          </div>

                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{
                                width: 0,
                              }}
                              animate={{
                                width: `${item.pct}%`,
                              }}
                              transition={{
                                duration: 0.8,
                              }}
                              className={`h-full rounded-full ${item.color}`}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* USERS */}
          {tab === 'users' && (
            <div className="space-y-4 overflow-hidden">
              {/* Filters */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-3 flex-wrap">
                <div className="relative w-full sm:max-w-xs">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
                  />

                  <input
                    type="text"
                    placeholder="Search users..."
                    value={
                      userSearch
                    }
                    onChange={(e) =>
                      setUserSearch(
                        e.target
                          .value
                      )
                    }
                    className="w-full pl-8"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    'all',
                    'restaurant',
                    'ngo',
                    'volunteer',
                  ].map((r) => (
                    <button
                      key={r}
                      onClick={() =>
                        setRoleFilter(
                          r
                        )
                      }
                      className={`px-3 py-1.5 rounded-full text-xs border transition-all capitalize whitespace-nowrap ${
                        roleFilter ===
                        r
                          ? 'bg-brand-green text-black border-brand-green'
                          : 'border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="block lg:hidden space-y-3">
                {filteredUsers.map(
                  (u, i) => (
                    <motion.div
                      key={u._id}
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      transition={{
                        delay:
                          i *
                          0.05,
                      }}
                      className="card space-y-3 overflow-hidden"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green text-sm font-bold flex-shrink-0">
                          {u.avatar ||
                            u.name[0]}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white break-words">
                            {
                              u.name
                            }
                          </p>

                          <p className="text-xs text-gray-500 break-words">
                            {
                              u.email
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant={
                            u.role ===
                            'restaurant'
                              ? 'standard'
                              : u.role ===
                                'ngo'
                              ? 'accepted'
                              : 'pending'
                          }
                        >
                          {u.role}
                        </Badge>

                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                            u.status ===
                            'active'
                              ? 'text-green-400 bg-green-400/10'
                              : 'text-yellow-400 bg-yellow-400/10'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.status ===
                              'active'
                                ? 'bg-green-400'
                                : 'bg-yellow-400'
                            }`}
                          />

                          {u.status}
                        </span>
                      </div>

                      <div className="text-xs text-gray-400 break-words">
                        {
                          u.activityCount
                        }{' '}
                        {
                          u.activityLabel
                        }
                      </div>
                    </motion.div>
                  )
                )}
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block card overflow-x-auto p-0">
                <table className="w-full text-sm min-w-[900px]">
                  <thead>
                    <tr className="border-b border-white/5">
                      {[
                        'Name',
                        'Role',
                        'Email',
                        'Activity',
                        'Status',
                        'Joined',
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map(
                      (u, i) => (
                        <motion.tr
                          key={u._id}
                          initial={{
                            opacity: 0,
                          }}
                          animate={{
                            opacity: 1,
                          }}
                          transition={{
                            delay:
                              i *
                              0.05,
                          }}
                          className="border-b border-white/3 hover:bg-white/3 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green text-xs font-bold flex-shrink-0">
                                {u.avatar ||
                                  u
                                    .name[0]}
                              </div>

                              <span className="font-medium text-white whitespace-nowrap">
                                {
                                  u.name
                                }
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge
                              variant={
                                u.role ===
                                'restaurant'
                                  ? 'standard'
                                  : u.role ===
                                    'ngo'
                                  ? 'accepted'
                                  : 'pending'
                              }
                            >
                              {
                                u.role
                              }
                            </Badge>
                          </td>

                          <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                            {
                              u.email
                            }
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                            {u.activityCount ||
                              0}{' '}
                            {u.activityLabel ||
                              ''}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                                u.status ===
                                'active'
                                  ? 'text-green-400 bg-green-400/10'
                                  : 'text-yellow-400 bg-yellow-400/10'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  u.status ===
                                  'active'
                                    ? 'bg-green-400'
                                    : 'bg-yellow-400'
                                }`}
                              />

                              {
                                u.status
                              }
                            </span>
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                            {new Date(
                              u.createdAt
                            ).toLocaleDateString()}
                          </td>
                        </motion.tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}