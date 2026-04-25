import { create } from 'zustand';
import api from '../api/axios';

export const useVaultStore = create((set, get) => ({
  items: [],
  stats: null,
  selectedItem: null,
  loading: false,
  error: null,
  hasFetched: false,
  hasFetchedStats: false,

  fetchItems: async (force = false) => {
    if (get().hasFetched && !force) return;
    set({ loading: true, error: null });
    try {
      const res = await api.get('/vault');
      set({ items: res.data, loading: false, hasFetched: true });
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },

  fetchStats: async (force = false) => {
    if (get().hasFetchedStats && !force) return;
    try {
      const res = await api.get('/vault/stats');
      set({ stats: res.data, hasFetchedStats: true });
    } catch (e) {}
  },

  exportVault: async () => {
    try {
      const res = await api.get('/vault/export');
      const data = JSON.stringify(res.data, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vault-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      throw e;
    }
  },

  checkReuse: async (password, excludeId = null) => {
    try {
      const res = await api.post('/vault/reuse-check', { password, excludeId });
      return res.data;
    } catch (e) {
      return { reused: false, count: 0 };
    }
  },

  addItem: async (data) => {
    const res = await api.post('/vault', data);
    get().fetchItems(true); // Force fresh fetch to update reuseCounts
    get().fetchStats(true);
    return res.data;
  },

  updateItem: async (id, data) => {
    const res = await api.put(`/vault/${id}`, data);
    get().fetchItems(true); // Force fresh fetch
    get().fetchStats(true);
    return res.data;
  },

  deleteItem: async (id) => {
    await api.delete(`/vault/${id}`);
    get().fetchItems(true); // Force fresh fetch
    get().fetchStats(true);
  },

  getItemDetail: async (id) => {
    const res = await api.get(`/vault/${id}`);
    return res.data;
  },

  recordCopy: async (id) => {
    await api.post(`/vault/${id}/copy`);
  },

  setSelectedItem: (item) => set({ selectedItem: item }),
}));
