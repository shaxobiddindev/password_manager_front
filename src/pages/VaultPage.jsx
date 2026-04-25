import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useVaultStore } from '../store/vaultStore';
import CredentialCard from '../components/CredentialCard';
import CredentialFormModal from '../components/CredentialFormModal';
import MainLayout from '../layouts/MainLayout';
import { useAuthStore } from '../store/authStore';

export default function VaultPage() {
  const { category } = useParams();
  const { items, fetchItems, loading, stats, fetchStats } = useVaultStore();
  const { role } = useAuthStore();
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => { 
    fetchItems();
    fetchStats();
  }, []);

  useEffect(() => { 
    setCurrentPage(1); // Reset page on category/search change
  }, [category, search]);

  const filtered = items.filter((item) => {
    const matchCat = !category || item.category?.toLowerCase() === category;
    const q = search.toLowerCase();
    const matchQ = !q || item.serviceName?.toLowerCase().includes(q) || item.username?.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openAdd = () => { setEditItem(null); setShowModal(true); };
  const openEdit = (item) => { setEditItem(item); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditItem(null); };

  return (
    <MainLayout onSearch={setSearch} onAddNew={openAdd}>
      <div className="p-6 animate-fadeIn">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-bold text-white text-xl capitalize">
              {category || 'All Credentials'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</p>
          </div>

          {/* Stats */}
          {stats && !category && (
            <div className="hidden md:flex items-center gap-4 animate-fadeIn">
              <div className="px-4 py-2 rounded-xl bg-white/4 border border-white/6 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Total</span>
                  <span className="text-sm text-white font-mono font-bold">{stats.total}</span>
                </div>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/4 border border-white/6 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Weak</span>
                  <span className="text-sm text-white font-mono font-bold">{stats.weak}</span>
                </div>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/4 border border-white/6 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Reused</span>
                  <span className="text-sm text-white font-mono font-bold">{stats.reused}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <p className="text-sm text-slate-500 font-display">Loading vault…</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/8 flex items-center justify-center mb-5">
              <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-white text-lg mb-2">Your vault is empty</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-xs">
              {search ? 'No credentials match your search.' : 'Start adding your credentials to keep them secure.'}
            </p>
            {role === 'ADMIN' && !search && (
              <button
                onClick={openAdd}
                className="px-6 py-2.5 rounded-xl btn-primary font-display font-semibold text-white text-sm"
              >
                + Add your first credential
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {!loading && paginatedItems.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedItems.map((item) => (
                <CredentialCard key={item.id} item={item} onEdit={openEdit} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all"
                >
                  <i className="fas fa-chevron-left text-xs"></i>
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-display font-bold transition-all ${
                        currentPage === page 
                          ? 'bg-blue-500 text-white' 
                          : 'text-slate-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all"
                >
                  <i className="fas fa-chevron-right text-xs"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <CredentialFormModal 
        isOpen={showModal} 
        item={editItem} 
        onClose={closeModal} 
      />
    </MainLayout>
  );
}
