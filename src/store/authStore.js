import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      isUnlocked: false,
      lockTimer: null,

      login: async (username, password) => {
        const res = await api.post('/auth/login', { username, password });
        const { token, login, email, role } = res.data;
        const user = { login, email, role };
        localStorage.setItem('token', token);
        set({ user, token, role, isUnlocked: false });
        return res.data;
      },

      logout: () => {
        localStorage.removeItem('token');
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
        set({ isUnlocked: false, lockTimer: null });
      },

      startLockTimer: () => {
        const { lockTimer } = get();
        if (lockTimer) clearTimeout(lockTimer);
        const timer = setTimeout(() => {
          set({ isUnlocked: false, lockTimer: null });
        }, 5 * 60 * 1000);
        set({ lockTimer: timer });
      },

      fetchMe: async () => {
        try {
          const res = await api.get('/auth/me');
          const { email, role, login } = res.data;
          set({ user: { email, role, login }, role });
          return res.data;
        } catch (e) {
          get().logout();
          throw e;
        }
      },

      changePassword: async (oldPassword, newPassword) => {
        await api.put('/auth/change-password', { oldPassword, newPassword });
      },

      resetLockTimer: () => {
        const { isUnlocked } = get();
        if (isUnlocked) get().startLockTimer();
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user, token: state.token, role: state.role }),
    }
  )
);
