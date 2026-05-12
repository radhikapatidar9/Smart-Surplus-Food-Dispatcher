import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Request Interceptor: Attach JWT from Zustand Store
API.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle 401 Unauthorized Globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      useAuthStore.getState().logout();
      if (!['/login', '/signup', '/'].includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    return res.data;
  },
  signup: async (data) => {
    const res = await API.post('/auth/signup', data);
    return res.data;
  },
  getMe: async () => {
    const res = await API.get('/auth/me');
    return res.data;
  },
};

export const donationService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    const res = await API.get(`/donations?${params.toString()}`);
    return res.data;
  },
  getById: async (id) => {
    const res = await API.get(`/donations/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await API.post('/donations', data);
    return res.data;
  },
  updateStatus: async (id, body) => {
    const res = await API.patch(`/donations/${id}/status`, body);
    return res.data;
  },
  delete: async (id) => {
    const res = await API.delete(`/donations/${id}`);
    return res.data;
  },
};

export const notificationService = {
  getAll: async () => {
    const res = await API.get('/notifications');
    return res.data;
  },
  markAsRead: async (id) => {
    const res = await API.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await API.patch('/notifications/read-all');
    return res.data;
  },
};

export const adminService = {
  getUsers: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    const res = await API.get(`/admin/users?${params.toString()}`);
    return res.data;
  },
  getStats: async () => {
    const res = await API.get('/admin/stats');
    return res.data;
  },
};

export const trackingService = {
  getDelivery: async (id) => {
    try {
      const res = await API.get(`/donations/${id}`);
      const d = res.data.data;
      return {
        id: d._id,
        volunteer: {
          name: d.volunteerId?.name || 'Volunteer',
          phone: '+91 98765 43210',
          rating: 4.8,
        },
        pickup: { address: d.location, lat: d.lat, lng: d.lng },
        delivery: { address: d.ngoId?.location || 'NGO Location', lat: d.lat + 0.03, lng: d.lng + 0.015 },
        volunteerLocation: { lat: d.lat + 0.015, lng: d.lng + 0.008 },
        status: d.status,
        estimatedArrival: '15 mins',
        distance: '4.2 km',
      };
    } catch (err) {
      return {
        id,
        volunteer: { name: 'Volunteer', phone: '', rating: 0 },
        pickup: { address: 'Unknown', lat: 0, lng: 0 },
        delivery: { address: 'Unknown', lat: 0, lng: 0 },
        volunteerLocation: { lat: 0, lng: 0 },
        status: 'unknown',
        estimatedArrival: '--',
        distance: '--',
      };
    }
  },
};

export default API;

