import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Calendar, Zap, Droplets, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

const CompactRow = ({ r, index }) => {
  const isElec = r.type_compteur !== 'EAU';
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`group relative grid grid-cols-12 gap-4 items-center p-3 my-1 rounded-lg border border-white/5 hover:bg-white/5 transition-all cursor-pointer ${isElec ? 'hover:border-elec-500/30 border-l-[3px] border-l-elec-500' : 'hover:border-water-500/30 border-l-[3px] border-l-water-500'
        } bg-slate-800/40 backdrop-blur-sm shadow-sm`}
    >
      {/* Date */}
      <div className="col-span-3 text-xs text-slate-300 font-mono">
        {new Date(r.date_releve).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })}
        <span className="text-slate-500 ml-2">{new Date(r.date_releve).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      {/* Info Compteur */}
      <div className="col-span-3">
        <div className="flex items-center gap-2">
          {isElec ? <Zap size={14} className="text-elec-400" /> : <Droplets size={14} className="text-water-400" />}
          <span className="text-sm font-bold text-slate-200">{r.numero_serie}</span>
        </div>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider pl-6">{r.quartier || 'Non défini'}</p>
      </div>

      {/* Indexes */}
      <div className="col-span-3 flex items-center justify-between px-4 border-x border-white/5">
        <div className="text-right">
          <span className="block text-[10px] text-slate-500">Ancien</span>
          <span className="text-xs text-slate-400 font-mono">{r.ancien_index}</span>
        </div>
        <div className="text-right">
          <span className="block text-[10px] text-slate-500">Nouveau</span>
          <span className="text-sm text-slate-200 font-mono font-bold">{r.nouvel_index}</span>
        </div>
      </div>

      {/* Consommation */}
      <div className="col-span-2 text-right pr-4">
        <span className={`text-sm font-bold ${isElec ? 'text-elec-400' : 'text-water-400'}`}>
          {r.consommation}
        </span>
        <span className="text-[10px] text-slate-500 ml-1">unités</span>
      </div>

      {/* Agent Avatar */}
      <div className="col-span-1 flex justify-end">
        {r.agent ? (
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 border border-white/10" title={`${r.agent.prenom} ${r.agent.nom}`}>
            {r.agent.prenom[0]}{r.agent.nom[0]}
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-dashed border-slate-600" />
        )}
      </div>
    </motion.div>
  );
};

function DashboardReleves() {
  const [releves, setReleves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [quartier, setQuartier] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/releves');
      setReleves(data);
    } catch (err) {
      console.error(err);
      setError("Erreur chargement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Compute Neighborhoods
  const quartiers = useMemo(() => Array.from(new Set(releves.map(r => r.quartier).filter(Boolean))).sort(), [releves]);

  // Filtering Logic
  const filteredData = useMemo(() => {
    return releves.filter(r => {
      const d = new Date(r.date_releve);
      if (dateFrom && d < new Date(dateFrom)) return false;
      if (dateTo && d > new Date(dateTo)) return false;
      if (quartier !== 'ALL' && r.quartier !== quartier) return false;
      if (typeFilter !== 'ALL') {
        if (typeFilter === 'EAU' && r.type_compteur !== 'EAU') return false;
        if (typeFilter === 'ELEC' && r.type_compteur === 'EAU') return false;
      }
      return true;
    }).sort((a, b) => new Date(b.date_releve) - new Date(a.date_releve));
  }, [releves, dateFrom, dateTo, quartier, typeFilter]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Relevés de Consommation</h2>
          <p className="text-slate-400 text-sm">Suivi temps réel des index eau et électricité.</p>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col lg:flex-row items-center gap-4">
        <div className="flex items-center gap-2 w-full lg:w-auto text-slate-300 bg-slate-900/50 px-3 py-2 rounded-xl border border-white/5">
          <Calendar size={16} className="text-accent-500" />
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-transparent text-xs outline-none w-28" placeholder="Du" />
          <span className="text-slate-600">-</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-transparent text-xs outline-none w-28" placeholder="Au" />
        </div>

        <div className="h-8 w-[1px] bg-white/10 hidden lg:block" />

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <select
              value={quartier} onChange={e => setQuartier(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/5 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-300 outline-none focus:border-accent-500 appearance-none"
            >
              <option value="ALL">Tous les quartiers</option>
              {quartiers.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>

          <div className="flex bg-slate-900/50 rounded-xl p-1 border border-white/5">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${typeFilter === 'ALL' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >Everything</button>
            <button
              onClick={() => setTypeFilter('EAU')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${typeFilter === 'EAU' ? 'bg-water-500/20 text-water-400 shadow-sm border border-water-500/20' : 'text-slate-500 hover:text-water-400'}`}
            >Eau</button>
            <button
              onClick={() => setTypeFilter('ELEC')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${typeFilter === 'ELEC' ? 'bg-elec-500/20 text-elec-400 shadow-sm border border-elec-500/20' : 'text-slate-500 hover:text-elec-400'}`}
            >Elec</button>
          </div>
        </div>

        <div className="ml-auto flex gap-2">
          <button onClick={() => { setDateFrom(''); setDateTo(''); setQuartier('ALL'); setTypeFilter('ALL'); }} className="p-2 text-slate-500 hover:text-white transition-colors" title="Réinitialiser">
            <Filter size={18} />
          </button>
          <button onClick={loadData} className="p-2 text-accent-500 hover:text-accent-400 transition-colors" title="Rafraîchir">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Minimized Compact List */}
      <div className="space-y-1">

        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          <div className="col-span-3">Date & Heure</div>
          <div className="col-span-3">Compteur & Zone</div>
          <div className="col-span-3 text-center">Index (Ancien / Nouveau)</div>
          <div className="col-span-2 text-right pr-6">Volume</div>
          <div className="col-span-1 text-right">Agent</div>
        </div>

        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 bg-slate-800/30 rounded-lg border border-white/5" />)}
          </div>
        ) : (
          <div className="min-h-[300px]">
            {paginatedData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-sm">
                <Filter size={32} className="mb-2 opacity-50" />
                Aucun résultat trouvé
              </div>
            ) : (
              paginatedData.map((r, i) => <CompactRow key={r.id_releve} r={r} index={i} />)
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-white/5">
        <span>Affichage {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, filteredData.length)} sur {filteredData.length}</span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardReleves;
