import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Star,
  Clock,
  Package,
  Navigation,
  ShieldCheck,
  CheckCircle2,
  Circle
} from 'lucide-react';

import { Badge } from '../components/common/UIComponents';
import AIAuditPanel from '../components/AIAuditPanel';
import { donationService } from '../services/api';
import { useSocket } from '../context/SocketContext';

const STATUS_STAGES = [
  {
    id: 'pending',
    label: 'Donation Posted',
    desc: 'Food details submitted and awaiting verification.'
  },
  {
    id: 'accepted',
    label: 'NGO Claimed',
    desc: 'A partner NGO has claimed this donation.'
  },
  {
    id: 'volunteer_assigned',
    label: 'Volunteer Dispatched',
    desc: 'Courier assigned for the rescue mission.'
  },
  {
    id: 'pickup_started',
    label: 'Heading to Pickup',
    desc: 'Volunteer is on the way to the restaurant.'
  },
  {
    id: 'picked_up',
    label: 'Food Collected',
    desc: 'Rescue complete! Food is securely with the volunteer.'
  },
  {
    id: 'in_transit',
    label: 'In Transit',
    desc: 'Navigating to the final destination.'
  },
  {
    id: 'delivered',
    label: 'Arrived at Destination',
    desc: 'Food delivered to the NGO/Shelter.'
  },
  {
    id: 'completed',
    label: 'Mission Completed',
    desc: 'Donation lifecycle officially closed.'
  }
];

export default function LiveTrackingPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const {
    subscribeToDonation,
    socket
  } = useSocket();

  const [donation, setDonation] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const fetchDonation =
    async () => {
      try {
        const res =
          await donationService.getById(
            id
          );

        if (res.success) {
          setDonation(
            res.data
          );
        }
      } catch (err) {
        console.error(
          'Fetch error:',
          err
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchDonation();

    subscribeToDonation(id);
  }, [id, subscribeToDonation]);

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (
      updatedDonation
    ) => {
      if (
        updatedDonation._id ===
        id
      ) {
        setDonation(
          updatedDonation
        );
      }
    };

    socket.on(
      'donation_updated',
      handleUpdate
    );

    socket.on(
      'donation_status_update',
      handleUpdate
    );

    return () => {
      socket.off(
        'donation_updated',
        handleUpdate
      );

      socket.off(
        'donation_status_update',
        handleUpdate
      );
    };
  }, [socket, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 border-2 border-brand-green/30 border-t-brand-green rounded-full animate-spin" />

          <p className="text-sm text-gray-500 break-words">
            Syncing with logistics network...
          </p>
        </div>
      </div>
    );
  }

  const currentStageIdx =
    STATUS_STAGES.findIndex(
      s =>
        s.id ===
        donation?.status
    );

  return (
    <div className="min-h-screen bg-black flex flex-col text-gray-200 overflow-hidden">
      {/* Top Header */}
      <header className="glass border-b border-white/5 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-start sm:items-center gap-4 min-w-0">
          <button
            onClick={() =>
              window.history
                .length > 2
                ? navigate(-1)
                : navigate(
                    '/dashboard'
                  )
            }
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all flex-shrink-0"
          >
            <ArrowLeft
              size={20}
            />
          </button>

          <div className="min-w-0">
            <h1 className="font-display font-black text-base sm:text-lg tracking-tight uppercase break-words">
              Live Mission
              Pulse
            </h1>

            <p className="text-[10px] text-gray-500 font-mono break-all">
              TRACKING ID:{' '}
              {id.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-[10px] font-bold text-brand-green uppercase whitespace-nowrap">
              Encrypted
              Connection
            </span>

            <span className="text-[9px] text-gray-600 font-mono uppercase whitespace-nowrap">
              Status: Live
            </span>
          </div>

          <Badge
            variant={
              donation?.status
            }
          >
            {donation?.status?.replace(
              '_',
              ' '
            )}
          </Badge>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-4 sm:p-6 md:p-12 overflow-hidden">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 sm:mb-12">
            <h2 className="font-display font-black text-2xl sm:text-3xl uppercase italic tracking-tighter break-words">
              Mission
              Progress
            </h2>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                Auto-Synced
              </span>

              <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
            </div>
          </div>

          <div className="relative pl-8 sm:pl-10 space-y-10 sm:space-y-12 overflow-hidden">
            {/* Visual Line */}
            <div className="absolute left-3 sm:left-4 top-2 bottom-2 w-[2px] bg-white/5" />

            <motion.div
              className="absolute left-3 sm:left-4 top-2 w-[2px] bg-brand-green origin-top"
              initial={{
                scaleY: 0
              }}
              animate={{
                scaleY:
                  (currentStageIdx +
                    1) /
                  STATUS_STAGES.length
              }}
              transition={{
                duration: 1,
                ease: 'easeOut'
              }}
            />

            {STATUS_STAGES.map(
              (stage, idx) => {
                const isDone =
                  idx <
                  currentStageIdx;

                const isCurrent =
                  idx ===
                  currentStageIdx;

                return (
                  <motion.div
                    key={
                      stage.id
                    }
                    initial={{
                      opacity: 0,
                      x: -10
                    }}
                    animate={{
                      opacity: 1,
                      x: 0
                    }}
                    transition={{
                      delay:
                        idx *
                        0.1
                    }}
                    className={`relative ${
                      isDone ||
                      isCurrent
                        ? 'opacity-100'
                        : 'opacity-20'
                    }`}
                  >
                    {/* Indicator */}
                    <div
                      className={`absolute -left-8 sm:-left-10 top-0.5 w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center z-10 transition-all duration-500 ${
                        isDone
                          ? 'bg-brand-green text-black'
                          : isCurrent
                          ? 'bg-brand-green text-black ring-8 ring-brand-green/10'
                          : 'bg-dark-800 border border-white/10 text-gray-700'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2
                          size={
                            16
                          }
                        />
                      ) : isCurrent ? (
                        <div className="w-2 h-2 rounded-full bg-black animate-ping" />
                      ) : (
                        <Circle
                          size={
                            12
                          }
                        />
                      )}
                    </div>

                    <div
                      className={`transition-all duration-500 ${
                        isCurrent
                          ? 'translate-x-1 sm:translate-x-2'
                          : ''
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 sm:gap-4">
                        <h4
                          className={`font-display font-bold text-base sm:text-lg uppercase tracking-wider break-words ${
                            isCurrent
                              ? 'text-brand-green'
                              : isDone
                              ? 'text-white'
                              : 'text-gray-600'
                          }`}
                        >
                          {
                            stage.label
                          }
                        </h4>

                        {donation
                          ?.delivery
                          ?.timestamps?.[
                          `${stage.id}At`
                        ] && (
                          <span className="text-[10px] font-mono text-gray-600 uppercase whitespace-nowrap">
                            {new Date(
                              donation
                                .delivery
                                .timestamps[
                                `${stage.id}At`
                              ]
                            ).toLocaleTimeString(
                              [],
                              {
                                hour:
                                  '2-digit',
                                minute:
                                  '2-digit'
                              }
                            )}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-500 mt-1 leading-relaxed max-w-md break-words">
                        {
                          stage.desc
                        }
                      </p>
                    </div>
                  </motion.div>
                );
              }
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto glass border-t border-white/5 p-4 sm:p-6 text-center overflow-hidden">
        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] break-words">
          Securing global
          food distribution
          through agentic
          logistics
        </p>
      </footer>
    </div>
  );
}