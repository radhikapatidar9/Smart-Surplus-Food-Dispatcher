import { create } from 'zustand';
import { donationService } from '../services/api';

const useDonationStore = create((set, get) => ({
  donations: [],
  loading: false,
  error: null,

  fetchDonations: async () => {
    set({ loading: true });
    try {
      const res = await donationService.getAll();
      if (res.success) {
        set({ donations: res.data, error: null });
      }
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  addDonation: async (data) => {
    try {
      const res = await donationService.create(data);
      if (res.success) {
        set((state) => ({ donations: [res.data, ...state.donations] }));
        return res.data;
      }
    } catch (err) {
      console.error('Failed to add donation:', err);
      throw err;
    }
  },

  updateDonationStatus: async (id, status, extra = {}) => {
    try {
      const body = { status, ...extra };
      const res = await donationService.updateStatus(id, body);
      if (res.success) {
        set((state) => ({
          donations: state.donations.map((d) => (d._id === id ? res.data : d)),
        }));
        return res.data;
      }
    } catch (err) {
      console.error('Failed to update donation status:', err);
      throw err;
    }
  },

  setDonations: (donations) => set({ donations }),
}));

export default useDonationStore;
