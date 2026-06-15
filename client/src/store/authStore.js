import { create } from 'zustand';
import api from '../services/api';

const TOKEN_KEY = 'parkease_token';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY) || null,
  loading: true,

  isAuthenticated: () => !!get().token && !!get().user,
  isOwner: () => ['owner', 'admin'].includes(get().user?.role),

  setSession: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ token, user });
  },

  // Hydrate the user from the token on app start
  loadUser: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      set({ loading: false, user: null, token: null });
      return;
    }
    try {
      const { user } = await api.get('/auth/me').then((r) => r.data);
      set({ user, token, loading: false });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      set({ user: null, token: null, loading: false });
    }
  },

  register: async (payload) => {
    const { token, user } = await api.post('/auth/register', payload).then((r) => r.data);
    localStorage.setItem(TOKEN_KEY, token);
    set({ token, user });
    return user;
  },

  login: async (payload) => {
    const { token, user } = await api.post('/auth/login', payload).then((r) => r.data);
    localStorage.setItem(TOKEN_KEY, token);
    set({ token, user });
    return user;
  },

  updateProfile: async (payload) => {
    const { user } = await api.put('/auth/me', payload).then((r) => r.data);
    set({ user });
    return user;
  },

  toggleFavorite: async (spotId) => {
    const { favorites } = await api.post(`/auth/favorites/${spotId}`).then((r) => r.data);
    set((s) => ({ user: { ...s.user, favorites } }));
    return favorites;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null });
  },
}));
