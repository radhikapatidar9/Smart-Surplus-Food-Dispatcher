import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: !!user 
      }),

      login: async (email, password) => {
        try {
          const { authService } = await import('../services/api');
          const res = await authService.login(email, password);
          if (res.success) {
            set({ 
              user: res.user, 
              token: res.accessToken, 
              isAuthenticated: true 
            });
            return { success: true, user: res.user };
          }
          return { success: false, error: res.error || 'Login failed' };
        } catch (err) {
          return { 
            success: false, 
            error: err.response?.data?.error || err.message || 'Login failed' 
          };
        }
      },

      signup: async (data) => {
        try {
          const { authService } = await import('../services/api');
          const res = await authService.signup(data);
          if (res.success) {
            set({ 
              user: res.user, 
              token: res.accessToken, 
              isAuthenticated: true 
            });
            return { success: true, user: res.user };
          }
          return { success: false, error: res.error || 'Signup failed' };
        } catch (err) {
          return { 
            success: false, 
            error: err.response?.data?.error || err.message || 'Signup failed' 
          };
        }
      },

      logout: () => set({ 
        user: null, 
        token: null, 
        isAuthenticated: false 
      }),

      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
