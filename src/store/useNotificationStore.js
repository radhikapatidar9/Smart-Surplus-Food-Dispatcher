import { create } from 'zustand';
import { notificationService } from '../services/api';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const res = await notificationService.getAll();
      if (res.success) {
        set({ notifications: res.data });
      }
    } finally {
      set({ loading: false });
    }
  },

  addNotification: (notif) => {
    set((state) => ({
      notifications: [{
        _id: 'temp_' + Date.now(),
        ...notif,
        read: false,
        createdAt: new Date().toISOString(),
      }, ...state.notifications]
    }));
  },

  markAsRead: async (id) => {
    try {
      await notificationService.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) => 
          (n._id === id ? { ...n, read: true } : n)
        ),
      }));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  },

  clearNotifications: () => set({ notifications: [] }),
}));

export default useNotificationStore;
