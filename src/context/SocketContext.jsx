import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../store/useAuthStore';

const SocketContext = createContext(null);
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export function SocketProvider({ children }) {
  const { user, token } = useAuthStore();
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);
  const [syncState, setSyncState] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      // Invalidate everything on reconnect to ensure fresh data
      queryClient.invalidateQueries();
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('sync_state', (state) => {
      setSyncState(state);
      // Seed initial query data from sync payload
      if (state.notifications) {
        queryClient.setQueryData(['notifications'], state.notifications);
      }
    });

    socket.on('new_donation', (donation) => {
      toast(`🍛 New donation: ${donation.foodType}`, { duration: 4000 });
      queryClient.invalidateQueries({ queryKey: ['donations'] });
    });

    socket.on('donation_updated', (donation) => {
      const statusEmoji = {
        volunteer_assigned: '✅',
        pickup_started: '🚴',
        picked_up: '📦',
        in_transit: '🛣️',
        delivered: '🎉',
        completed: '🎊',
        rejected: '↩️',
      };
      toast(`${statusEmoji[donation.status] || '📦'} Donation "${donation.foodType}" updated to ${donation.status.replace('_', ' ')}`);
      
      // Smart Invalidation
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['donations', donation._id] });
    });

    socket.on('new_notification', (notif) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id, token, queryClient]);

  const emit = (event, data, callback) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data, callback);
    }
  };

  const subscribeToDonation = (donationId) => {
    emit('subscribe_donation', donationId);
  };

  return (
    <SocketContext.Provider value={{ 
      emit, 
      connected, 
      socket: socketRef.current, 
      syncState,
      subscribeToDonation 
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
