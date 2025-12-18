import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, User, MapPin, Briefcase, Play, ChevronLeft, ChevronRight } from 'lucide-react';

const AgentRow = ({ a, index, quartiers, onAssign }) => {
  const statusColor = a.agents_actuels < a.agents_recommandes
    ? 'border-l-amber-500 hover:border-amber-500/30'
    : a.agents_actuels === a.agents_recommandes ? 'border-l-emerald-500 hover:border-emerald-500/30' : 'border-l-blue-500 hover:border-blue-500/30';

  const statusText = a.agents_actuels < a.agents_recommandes
    ? 'text-amber-500'
    : a.agents_actuels === a.agents_recommandes ? 'text-emerald-500' : 'text-blue-500';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`group relative grid grid-cols-12 gap-4 items-center p-3 my-1 rounded-lg border border-white/5 hover:bg-white/5 transition-all cursor-pointer border-l-[3px] bg-slate-800/40 backdrop-blur-sm shadow-sm ${statusColor}`}
    >
      {/* Agent Info */}
      <div className="col-span-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 border border-white/10 shrink-0">
          {a.nom[0]}{a.prenom[0]}
        </div>
        <div className="min-w-0">
          <span className="block text-sm font-bold text-slate-200 truncate">{a.nom} {a.prenom}</span>
          <span className="text-[10px] text-slate-500 font-mono tracking-wider">{a.matricule_rh}</span>
        </div>
      </div>

      {/* Assignment Dropdown */}
      <div className="col-span-3 pl-2">
        <div className="flex items-center gap-2 bg-slate-900/40 px-2 py-1.5 rounded-lg border border-white/5">
          <MapPin size={12} className="text-slate-500" />
          <select
            value={a.quartier?.id_quartier || ''}
            onChange={(e) => onAssign(a.id_agent, Number(e.target.value))}
            className="bg-transparent text-xs text-slate-300 outline-none w-full cursor-pointer hover:text-white transition-colors"
          >
            <option value="" className="bg-slate-900 text-slate-500">Non affecté</option>
            {quartiers.map(q => (
              <option key={q.id_quartier} value={q.id_quartier} className="bg-slate-900 text-slate-200">{q.libelle}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Charge / Workload */}
      <div className="col-span-3 pl-4 border-l border-white/5">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Portefeuille</span>
          <span className="text-sm text-white font-bold">{a.charge_estimee} <span className="text-[10px] font-normal text-slate-500">adresses</span></span>
        </div>
      </div>

      {/* Reco / Status */}
      <div className="col-span-3 pl-4 border-l border-white/5">
        {a.quartier && a.charge_estimee > 0 ? (
          <div className="flex flex-col">
            <span className={`text-[10px] font-bold uppercase ${statusText}`}>
              {a.agents_actuels < a.agents_recommandes ? `⚠️ Manque ${a.agents_recommandes - a.agents_actuels} Agents` :
                a.agents_actuels === a.agents_recommandes ? '✓ Optimal' : 'ℹ Bien réparti'}
            </span>
            <span className="text-[10px] text-slate-500">
              Zone: {a.agents_actuels}/{a.agents_recommandes} Staffés
            </span>
          </div>
        ) : <span className="text-slate-600 text-[10px] italic">Pas de données</span>}
      </div>

    </motion.div>
  );
};

function DashboardAgents() {
  const [agents, setAgents] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/agents');
      setAgents(data);
      const uniqueQuartiers = [];
      const seen = new Set();
      data.forEach(a => {
        if (a.quartier && !seen.has(a.quartier.id_quartier)) {
          seen.add(a.quartier.id_quartier);
          uniqueQuartiers.push(a.quartier);
        }
      });
      setQuartiers(uniqueQuartiers);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { loadAgents(); }, []);

  const handleAssign = async (idAgent, idQuartier) => {
    try {
      await api.patch(`/agents/${idAgent}/affectation`, { id_quartier: idQuartier });
      loadAgents(); // Reload to update calculs
    } catch (e) { console.error(e); }
  };

  const paginatedData = agents.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(agents.length / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Agents de Terrain</h2>
          <p className="text-slate-400 text-sm">Répartition et optimisation de la force de travail.</p>
        </div>
        <button onClick={loadAgents} className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-lg hover:bg-white/10">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="space-y-1">
        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          <div className="col-span-3">Agent</div>
          <div className="col-span-3 pl-2">Affectation</div>
          <div className="col-span-3 pl-4">Charge</div>
          <div className="col-span-3 pl-4">Optimum</div>
        </div>

        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-800/30 rounded-lg border border-white/5" />)}
          </div>
        ) : (
          <div className="min-h-[300px]">
            {paginatedData.length === 0 ? <div className="p-8 text-center text-slate-500">Aucun agent</div> :
              paginatedData.map((a, i) => <AgentRow key={a.id_agent} a={a} index={i} quartiers={quartiers} onAssign={handleAssign} />)
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
    </div>
  );
}

export default DashboardAgents;
