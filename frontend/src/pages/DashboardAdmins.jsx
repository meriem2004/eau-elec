import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit2, RotateCcw, Trash2, Filter, ChevronLeft, ChevronRight, User } from 'lucide-react';

const Badge = ({ children, type }) => {
  const styles = {
    SUPERADMIN: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    USER: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    WARNING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  const getStyle = (text) => {
    if (text === 'SUPERADMIN') return styles.SUPERADMIN;
    if (text === 'USER') return styles.USER;
    if (text === 'Actif') return styles.ACTIVE;
    return styles.WARNING;
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStyle(type || children)}`}>
      {children}
    </span>
  );
};

function DashboardAdmins() {
  const { user } = useAuth();

  const [admins, setAdmins] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Forms
  const [adminForm, setAdminForm] = useState({ nom: '', prenom: '', email: '' });
  const [editingForm, setEditingForm] = useState({ nom: '', prenom: '', role: '' });
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filterRole, setFilterRole] = useState('');
  const [sortBy, setSortBy] = useState('nom');

  const loadData = async () => {
    setLoadingUsers(true);
    try {
      // Mocked multiple calls or just load users
      const params = { page, pageSize, role: filterRole || undefined, sortBy };
      const { data } = await api.get('/auth/users', { params });
      setAllUsers(data.items || []);
      setTotalUsers(data.total || 0);
    } catch (err) {
      console.error(err);
      setError("Erreur chargement données.");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, pageSize, filterRole, sortBy]);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/auth/register', { ...adminForm, role: 'SUPERADMIN' });
      setSuccess("Administrateur créé avec succès.");
      setAdminForm({ nom: '', prenom: '', email: '' });
      setShowAdminModal(false);
      loadData();
    } catch (err) {
      setError("Erreur lors de la création.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/auth/users/${editingUser.id_user}`, editingForm);
      setSuccess("Utilisateur mis à jour.");
      setEditingUser(null);
      loadData();
    } catch (err) {
      setError("Erreur modification.");
    }
  };

  const totalPages = Math.ceil(totalUsers / pageSize);

  return (
    <div className="space-y-6">

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Gestion Utilisateurs</h2>
          <p className="text-slate-400 text-sm">Contrôle d'accès et administration.</p>
        </div>
        {user?.role === 'SUPERADMIN' && (
          <button
            onClick={() => setShowAdminModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent-600 hover:bg-accent-500 text-white rounded-xl font-medium shadow-lg shadow-accent-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={18} />
            <span>Nouveau Admin</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-xl border ${error ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}
          >
            {error || success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              placeholder="Rechercher par nom..."
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:border-accent-500 outline-none transition-all placeholder:text-slate-600"
            />
          </div>
          <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-slate-900/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300 outline-none focus:border-accent-500"
          >
            <option value="">Tous les Rôles</option>
            <option value="SUPERADMIN">Super Admin</option>
            <option value="USER">Utilisateur</option>
          </select>
        </div>
      </div>

      {/* Users List - Floating Cards */}
      <div className="space-y-3">
        {/* Table Header (Hidden on mobile, visible on desktop for alignment) */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <div className="col-span-4">Utilisateur</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Rôle</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>

        {loadingUsers ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-800/40 rounded-xl" />)}
          </div>
        ) : (
          <AnimatePresence mode='popLayout'>
            {allUsers.map((u, i) => (
              <motion.div
                key={u.id_user}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative md:grid md:grid-cols-12 gap-4 items-center bg-slate-800/40 backdrop-blur-sm border border-white/5 rounded-xl p-4 hover:bg-slate-800/60 hover:border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-black/20"
              >
                <div className="col-span-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold border border-white/5">
                    {u.nom?.[0]}{u.prenom?.[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-200">{u.nom} {u.prenom}</h4>
                    <p className="text-xs text-slate-500 md:hidden">{u.email}</p>
                  </div>
                </div>

                <div className="col-span-3 hidden md:block text-sm text-slate-400">
                  {u.email}
                </div>

                <div className="col-span-2 flex items-center gap-2">
                  <Badge type={u.role}>{u.role}</Badge>
                  {u.must_change_password && <Badge type="WARNING">MDP Exp.</Badge>}
                </div>

                <div className="col-span-3 flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditingUser(u); setEditingForm({ nom: u.nom, prenom: u.prenom, role: u.role }); }}
                    className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="Modifier"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="Réinitialiser MDP"
                  >
                    <RotateCcw size={16} />
                  </button>
                  {/* Only show delete if not self */}
                  <button
                    className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-slate-400 mt-6">
        <span>Page {page} sur {totalPages || 1}</span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Admin Modal */}
      <AnimatePresence>
        {showAdminModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAdminModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-6">Nouvel Admin</h3>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 uppercase font-semibold mb-1 block">Nom</label>
                    <input
                      required
                      value={adminForm.nom}
                      onChange={e => setAdminForm({ ...adminForm, nom: e.target.value })}
                      className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-accent-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 uppercase font-semibold mb-1 block">Prénom</label>
                    <input
                      required
                      value={adminForm.prenom}
                      onChange={e => setAdminForm({ ...adminForm, prenom: e.target.value })}
                      className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-accent-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase font-semibold mb-1 block">Email</label>
                  <input
                    type="email"
                    required
                    value={adminForm.email}
                    onChange={e => setAdminForm({ ...adminForm, email: e.target.value })}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-accent-500 outline-none"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setShowAdminModal(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Annuler</button>
                  <button type="submit" disabled={submitting} className="px-6 py-2 bg-accent-600 hover:bg-accent-500 text-white rounded-xl font-medium shadow-lg shadow-accent-500/20">
                    {submitting ? '...' : 'Créer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit User Modal - Same Structure */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setEditingUser(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-6">Mise à jour</h3>
              <form onSubmit={handleEditUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 uppercase font-semibold mb-1 block">Nom</label>
                    <input
                      required
                      value={editingForm.nom}
                      onChange={e => setEditingForm({ ...editingForm, nom: e.target.value })}
                      className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-accent-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 uppercase font-semibold mb-1 block">Prénom</label>
                    <input
                      required
                      value={editingForm.prenom}
                      onChange={e => setEditingForm({ ...editingForm, prenom: e.target.value })}
                      className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-accent-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase font-semibold mb-1 block">Rôle</label>
                  <select
                    value={editingForm.role}
                    onChange={e => setEditingForm({ ...editingForm, role: e.target.value })}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-accent-500 outline-none"
                  >
                    <option value="USER">Utilisateur</option>
                    <option value="SUPERADMIN">Super Admin</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Annuler</button>
                  <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/20">
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DashboardAdmins;
