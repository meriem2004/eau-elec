import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, MapPin, Home, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';

const AddressRow = ({ a, index, onAssociate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group relative grid grid-cols-12 gap-4 items-center p-3 my-1 rounded-lg border border-white/5 hover:bg-white/5 transition-all cursor-pointer border-l-[3px] border-l-slate-600 hover:border-l-slate-400 bg-slate-800/40 backdrop-blur-sm shadow-sm"
    >
      {/* Address Text */}
      <div className="col-span-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 border border-white/5">
          <Home size={14} />
        </div>
        <div className="min-w-0">
          <span className="block text-sm font-bold text-slate-200 truncate">{a.libelle_complet}</span>
          <span className="text-[10px] text-slate-500 font-mono">REF: {a.ref_adresse_erp || 'N/A'}</span>
        </div>
      </div>

      {/* Zone */}
      <div className="col-span-3 pl-4 border-l border-white/5">
        <div className="flex items-center gap-1.5">
          <MapPin size={12} className="text-slate-500" />
          <span className="text-xs text-slate-300">{a.quartier?.libelle || 'Hors zone'}</span>
        </div>
        <span className="text-[10px] text-slate-500 ml-4.5 block">{a.quartier?.ville || 'Rabat'}</span>
      </div>

      {/* Meters Count */}
      <div className="col-span-2 text-center border-l border-white/5">
        {a.nb_compteurs === 0 ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            0 Compteurs
          </span>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-white leading-none">{a.nb_compteurs}</span>
            <span className="text-[9px] text-slate-500 uppercase">Compteurs</span>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="col-span-2 flex justify-end">
        {a.nb_compteurs === 0 && (
          <button
            onClick={() => onAssociate(a)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition-colors"
          >
            <Plus size={14} /> Associer
          </button>
        )}
      </div>

    </motion.div>
  );
};

function DashboardAdresses() {
  const [adresses, setAdresses] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);

  const [showAssociateModal, setShowAssociateModal] = useState(false);
  const [selectedAdresse, setSelectedAdresse] = useState(null);
  const [associateForm, setAssociateForm] = useState({ numero_serie: '', type: 'EAU', id_client: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadAdresses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter === 'WITH') params.hasCompteur = 'true';
      if (filter === 'WITHOUT') params.hasCompteur = 'false';
      const { data } = await api.get('/adresses', { params });
      setAdresses(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const loadClients = async () => {
    try { const { data } = await api.get('/clients'); setClients(data || []); } catch (e) { }
  };

  useEffect(() => { loadAdresses(); loadClients(); }, [filter]);

  const handleAssociate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/compteurs', { ...associateForm, id_adresse: selectedAdresse.id_adresse });
      setShowAssociateModal(false);
      loadAdresses();
    } catch (e) { console.error(e); } finally { setSubmitting(false); }
  };

  const paginatedData = adresses.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(adresses.length / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Zones & Adresses</h2>
          <p className="text-slate-400 text-sm">Cartographie du réseau et points de fourniture.</p>
        </div>

        <div className="flex bg-slate-900/50 rounded-xl p-1 border border-white/5">
          {['ALL', 'WITH', 'WITHOUT'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {f === 'ALL' ? 'Tout' : f === 'WITH' ? 'Connectés' : 'Vierges'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          <div className="col-span-5">Adresse</div>
          <div className="col-span-3 pl-4">Zone</div>
          <div className="col-span-2 text-center">Équipement</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-800/30 rounded-lg border border-white/5" />)}
          </div>
        ) : (
          <div className="min-h-[300px]">
            {paginatedData.length === 0 ? <div className="p-8 text-center text-slate-500">Aucune adresse</div> :
              paginatedData.map((a, i) => <AddressRow key={a.id_adresse} a={a} index={i} onAssociate={(addr) => { setSelectedAdresse(addr); setShowAssociateModal(true); }} />)
            }
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-white/5">
        <span>Page {page} sur {totalPages}</span>
        <div className="flex gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30"><ChevronLeft size={16} /></button>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Associate Modal */}
      <AnimatePresence>
        {showAssociateModal && selectedAdresse && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAssociateModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-2">Raccordement Compteur</h3>
              <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/5">
                <p className="text-[10px] uppercase text-slate-500 font-bold">Adresse</p>
                <p className="text-sm text-slate-200">{selectedAdresse.libelle_complet}</p>
              </div>
              <form onSubmit={handleAssociate} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Type</label>
                  <select
                    value={associateForm.type}
                    onChange={e => setAssociateForm({ ...associateForm, type: e.target.value })}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-accent-500 outline-none"
                  >
                    <option value="EAU">EAU</option>
                    <option value="ELECTRICITE">ELECTRICITE</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Client</label>
                  <select
                    value={associateForm.id_client}
                    onChange={e => setAssociateForm({ ...associateForm, id_client: e.target.value })}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-accent-500 outline-none"
                    required
                  >
                    <option value="">Sélectionner...</option>
                    {clients.map(c => <option key={c.id_client} value={c.id_client}>{c.nom_complet}</option>)}
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowAssociateModal(false)} className="px-4 py-2 text-slate-400 hover:text-white text-sm">Annuler</button>
                  <button type="submit" disabled={submitting} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/20 text-sm">Associer</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DashboardAdresses;
