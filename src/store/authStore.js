import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: true,

  setAuth: (user, token) => {
    if (token) {
      localStorage.setItem('token', token);
    }
    set({ user, token, isAuthenticated: true, loading: false });
  },

  updateUser: (updatedUser) => {
    set((state) => ({
      user: { ...state.user, ...updatedUser }
    }));
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false, loading: false });
  },

  setLoading: (isLoading) => set({ loading: isLoading })
}));
