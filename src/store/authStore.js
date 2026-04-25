import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';
import { useVaultStore } from './vaultStore';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      isUnlocked: false,
      _hasHydrated: false,
      lockTimer: null,
      autoLockTime: 5, // default 5 minutes

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      register: async (userData) => {
        const res = await api.post('/auth/register', userData);
        return res.data;
      },

      login: async (username, password) => {
        const res = await api.post('/auth/login', { username, password });
        const { token, login, email, role, autoLockTimer } = res.data;
        const user = { login, email, role };
        localStorage.setItem('token', token);
        set({ user, token, role, isUnlocked: false, autoLockTime: autoLockTimer || 5 });
        return res.data;
      },

      logout: () => {
        localStorage.removeItem('token');
        useVaultStore.getState().reset();
        set({ user: null, token: null, role: null, isUnlocked: false });
      },

      unlockVault: async (masterPassword) => {
        const res = await api.post('/auth/unlock', { masterPassword });
        set({ isUnlocked: true });
        get().startLockTimer();
        return res.data;
      },

      lockVault: () => {
        const { lockTimer } = get();
        if (lockTimer) clearTimeout(lockTimer);
        useVaultStore.getState().reset();
        set({ isUnlocked: false, lockTimer: null });
      },

      startLockTimer: () => {
        const { lockTimer, autoLockTime } = get();
        if (lockTimer) clearTimeout(lockTimer);
        const timer = setTimeout(() => {
          set({ isUnlocked: false, lockTimer: null });
        }, autoLockTime * 60 * 1000);
        set({ lockTimer: timer });
      },

      setAutoLockTime: (minutes) => {
        set({ autoLockTime: minutes });
        get().resetLockTimer();
      },

      fetchMe: async () => {
        try {
          const res = await api.get('/auth/me');
          const { email, role, login, autoLockTimer } = res.data;
          set({ user: { email, role, login }, role, autoLockTime: autoLockTimer || 5 });
          return res.data;
        } catch (e) {
          get().logout();
          throw e;
        }
      },

      changePassword: async (oldPassword, newPassword) => {
        await api.put('/auth/change-password', { oldPassword, newPassword });
      },

      saveSettings: async () => {
        const { autoLockTime } = get();
        await api.put('/account/settings', { autoLockTimer: autoLockTime });
      },

      resetLockTimer: () => {
        const { isUnlocked } = get();
        if (isUnlocked) get().startLockTimer();
      },
      
      checkUser: async (query) => {
        const res = await api.get(`/auth/check-user?query=${encodeURIComponent(query)}`);
        return res.data;
      },

      searchUsers: async (query) => {
        const res = await api.get(`/auth/search-users?query=${encodeURIComponent(query)}`);
        return res.data;
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user, token: state.token, role: state.role, autoLockTime: state.autoLockTime }),
      onRehydrateStorage: () => (state) => {
        state.setHasHydrated(true);
      }
    }
  )
);
