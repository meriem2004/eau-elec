import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Zap, Droplets, MapPin, User, ChevronLeft, ChevronRight, RefreshCw, X } from 'lucide-react';

const CompteurRow = ({ c, index }) => {
  const isElec = c.type === 'ELECTRICITE' || c.type === 'ELEC';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`group relative grid grid-cols-12 gap-4 items-center p-3 my-1 rounded-lg border border-white/5 hover:bg-white/5 transition-all cursor-pointer ${isElec ? 'hover:border-elec-500/30 border-l-[3px] border-l-elec-500' : 'hover:border-water-500/30 border-l-[3px] border-l-water-500'
        } bg-slate-800/40 backdrop-blur-sm shadow-sm`}
    >
      {/* Serial & Type */}
      <div className="col-span-3 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isElec ? 'bg-elec-500/10 border-elec-500/20 text-elec-400' : 'bg-water-500/10 border-water-500/20 text-water-400'}`}>
          {isElec ? <Zap size={14} /> : <Droplets size={14} />}
        </div>
        <div>
          <span className="block text-sm font-bold text-slate-200 font-mono tracking-wide">{c.numero_serie}</span>
          <span className="text-[10px] text-slate-500 font-bold uppercase">{c.type}</span>
        </div>
      </div>

      {/* Address */}
      <div className="col-span-4 pl-4 border-l border-white/5">
        <div className="flex items-center gap-1.5 mb-0.5">
          <MapPin size={12} className="text-slate-500" />
          <span className="text-xs text-slate-300 truncate">{c.adresse?.libelle_complet || 'Adresse inconnue'}</span>
        </div>
        <span className="text-[10px] text-slate-500 ml-4.5 block uppercase tracking-wider">{c.adresse?.quartier?.libelle || '-'}</span>
      </div>

      {/* Client */}
      <div className="col-span-3 flex items-center gap-2 pl-4 border-l border-white/5">
        {c.client ? (
          <>
            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 border border-white/10">
              {c.client.nom_complet.charAt(0)}
            </div>
            <span className="text-xs text-slate-300 truncate">{c.client.nom_complet}</span>
          </>
        ) : (
          <span className="text-[10px] text-slate-500 italic">Aucun client</span>
        )}
      </div>

      {/* Index */}
      <div className="col-span-2 text-right">
        <span className="block text-[10px] text-slate-500">Index Actuel</span>
        <span className="text-sm font-bold text-white font-mono">{c.index_actuel}</span>
      </div>

    </motion.div>
  );
};

function DashboardCompteurs() {
  const [compteurs, setCompteurs] = useState([]);
  const [adresses, setAdresses] = useState([]);
  const [adressesSansCompteur, setAdressesSansCompteur] = useState([]); // Needed for modal
  const [quartiers, setQuartiers] = useState([]); // Needed for modal
  const [clients, setClients] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal & Form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ numero_serie: '', type: 'EAU', id_adresse: '', id_client: '' });
  const [filterQuartier, setFilterQuartier] = useState('');
  const [searchAdresse, setSearchAdresse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const loadCompteurs = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/compteurs');
      setCompteurs(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les compteurs.");
    } finally {
      setLoading(false);
    }
  };

  const loadAdresses = async () => {
    try {
      const { data } = await api.get('/adresses');
      setAdresses(data);
      // Load addresses without counters for popup
      const { data: adressesSans } = await api.get('/adresses', { params: { hasCompteur: 'false' } });
      setAdressesSansCompteur(adressesSans || []);

      const uniqueQuartiers = [];
      const seen = new Set();
      adressesSans?.forEach(a => {
        if (a.quartier && !seen.has(a.quartier.id_quartier)) {
          seen.add(a.quartier.id_quartier);
          uniqueQuartiers.push(a.quartier);
        }
      });
      setQuartiers(uniqueQuartiers);
    } catch (e) { console.error(e); }
  };

  const loadClients = async () => {
    try {
      const { data } = await api.get('/clients');
      setClients(data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadCompteurs(); loadAdresses(); loadClients(); }, []);

  const handleCreateCompteur = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/compteurs', createForm);
      setSuccess('Compteur créé avec succès.');
      setShowCreateModal(false);
      setCreateForm({ numero_serie: '', type: 'EAU', id_adresse: '', id_client: '' });
      loadCompteurs();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur création.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredData = compteurs; // Add filters later if needed
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);
  const totalPages = Math.ceil(filteredData.length / pageSize);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Parc de Compteurs</h2>
          <p className="text-slate-400 text-sm">Gestion des compteurs eau & électricité.</p>
        </div>
        <button
          onClick={async () => { await loadAdresses(); setShowCreateModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-500 text-white rounded-xl font-medium shadow-lg shadow-accent-500/20 transition-all hover:scale-105 active:scale-95 text-sm"
        >
          <Plus size={18} /> Nouveau Compteur
        </button>
      </div>

      {/* Simple Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between">
        <div className="relative w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Rechercher compteur..." className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-300 focus:border-accent-500 outline-none" />
        </div>
        <button onClick={loadCompteurs} className="p-2 text-slate-400 hover:text-white transition-colors">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Compact List */}
      <div className="space-y-1">
        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          <div className="col-span-3">N° Série</div>
          <div className="col-span-4 pl-4">Localisation</div>
          <div className="col-span-3 pl-4">Titulaire</div>
          <div className="col-span-2 text-right">Dernier Index</div>
        </div>

        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-slate-800/30 rounded-lg border border-white/5" />)}
          </div>
        ) : (
          <div className="min-h-[300px]">
            {paginatedData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-sm">Aucun compteur trouvé</div>
            ) : (
              paginatedData.map((c, i) => <CompteurRow key={c.numero_serie} c={c} index={i} />)
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-white/5">
        <span>Page {page} sur {totalPages || 1}</span>
        <div className="flex gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30"><ChevronLeft size={16} /></button>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Nouveau Compteur</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>

              <form onSubmit={handleCreateCompteur} className="space-y-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['EAU', 'ELECTRICITE'].map(type => (
                        <button
                          key={type} type="button"
                          onClick={() => setCreateForm({ ...createForm, type })}
                          className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${createForm.type === type
                            ? (type === 'EAU' ? 'bg-water-500/20 text-water-400 border-water-500/50' : 'bg-elec-500/20 text-elec-400 border-elec-500/50')
                            : 'border-white/5 text-slate-500 hover:bg-white/5'
                            }`}
                        >{type}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">N° Série (Auto si vide)</label>
                    <input
                      maxLength={9}
                      value={createForm.numero_serie}
                      onChange={e => setCreateForm({ ...createForm, numero_serie: e.target.value })}
                      placeholder="000000001"
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-accent-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Adresse (Sans compteur)</label>
                    <select
                      value={createForm.id_adresse}
                      onChange={e => setCreateForm({ ...createForm, id_adresse: e.target.value })}
                      className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-accent-500 outline-none"
                    >
                      <option value="">Choisir une adresse...</option>
                      {adressesSansCompteur.map(a => (
                        <option key={a.id_adresse} value={a.id_adresse}>{a.libelle_complet} ({a.quartier?.libelle})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Client Titulaire</label>
                    <select
                      value={createForm.id_client}
                      onChange={e => setCreateForm({ ...createForm, id_client: e.target.value })}
                      className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-accent-500 outline-none"
                    >
                      <option value="">Choisir un client...</option>
                      {clients.map(c => (
                        <option key={c.id_client} value={c.id_client}>{c.nom_complet}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-slate-400 hover:text-white text-sm">Annuler</button>
                  <button type="submit" disabled={submitting} className="px-6 py-2 bg-accent-600 hover:bg-accent-500 text-white rounded-xl font-medium shadow-lg shadow-accent-500/20 text-sm">
                    {submitting ? '...' : 'Créer'}
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

export default DashboardCompteurs;
