import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

function DashboardAgents() {
  const [agents, setAgents] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const loadAgents = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/agents');
      setAgents(data);
      const uniqueQuartiers = [];
      const seen = new Set();
      data.forEach((a) => {
        if (a.quartier && !seen.has(a.quartier.id_quartier)) {
          seen.add(a.quartier.id_quartier);
          uniqueQuartiers.push(a.quartier);
        }
      });
      setQuartiers(uniqueQuartiers);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError("Impossible de charger les agents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const totalPages = Math.max(1, Math.ceil(agents.length / pageSize));

  const currentPageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return agents.slice(start, start + pageSize);
  }, [agents, page, pageSize]);

  const handleChangePageSize = (value) => {
    const size = Number(value);
    setPageSize(size);
    setPage(1);
  };

  const handleChangeQuartier = async (idAgent, id_quartier) => {
    setError('');
    setSuccess('');
    setUpdatingId(idAgent);
    try {
      const response = await api.patch(`/agents/${idAgent}/affectation`, { id_quartier });
      const data = response.data;
      
      // Afficher le message de succès avec recommandation si présente
      let message = data.message || 'Affectation mise à jour.';
      if (data.recommandation) {
        message += ` ${data.recommandation.message}`;
      }
      
      setSuccess(message);
      await loadAgents();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError(err.response?.data?.message || "Impossible de mettre à jour l'affectation.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Affectation des agents</h2>
          <p className="text-xs text-slate-500 mt-1">
            Visualisez les agents de terrain et ajustez leur affectation par quartier.
          </p>
        </div>
        <button
          type="button"
          onClick={loadAgents}
          className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100"
        >
          Rafraîchir
        </button>
      </div>
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-sm">
          {success}
        </div>
      )}
      {loading ? (
        <p className="text-sm text-slate-400">Chargement des agents...</p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>
              {agents.length === 0
                ? 'Aucun agent à afficher.'
                : `Affichage de ${(page - 1) * pageSize + 1} à ${Math.min(
                    page * pageSize,
                    agents.length
                  )} sur ${agents.length} agents`}
            </span>
            <div className="flex items-center gap-2">
              <span>Par page</span>
              <select
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-100"
                value={pageSize}
                onChange={(e) => handleChangePageSize(e.target.value)}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-900/70 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-slate-400">Matricule</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-400">Nom</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-400">Quartier</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-400">Charge estimée</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-400">Recommandation</th>
                </tr>
              </thead>
              <tbody>
                {currentPageItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-xs text-slate-500"
                    >
                      Aucun agent.
                    </td>
                  </tr>
                )}
                {currentPageItems.map((a) => (
                  <tr key={a.id_agent} className="border-t border-slate-800/60 hover:bg-slate-900/40">
                    <td className="px-4 py-2 text-slate-100">{a.matricule_rh}</td>
                    <td className="px-4 py-2 text-slate-300">
                      {a.nom} {a.prenom}
                    </td>
                    <td className="px-4 py-2 text-slate-300">
                      <select
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
                        value={a.quartier?.id_quartier || ''}
                        onChange={(e) => handleChangeQuartier(a.id_agent, Number(e.target.value))}
                      >
                        <option value="">Non affecté</option>
                        {quartiers.map((q) => (
                          <option key={q.id_quartier} value={q.id_quartier}>
                            {q.libelle}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 text-slate-300">
                      {updatingId === a.id_agent ? (
                        'Mise à jour...'
                      ) : (
                        <div>
                          <div>{a.charge_estimee} adresses</div>
                          {a.ratio_optimal && (
                            <div className="text-[10px] text-slate-500">
                              Ratio: {a.ratio_optimal} adr/agent
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 text-slate-300">
                      {a.quartier && a.charge_estimee > 0 ? (
                        <div className="text-[10px]">
                          {a.agents_actuels < a.agents_recommandes ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              ⚠ {a.agents_recommandes - a.agents_actuels} agent(s) manquant(s)
                            </span>
                          ) : a.agents_actuels === a.agents_recommandes ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              ✓ Optimal
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              ℹ Bien réparti
                            </span>
                          )}
                          <div className="mt-1 text-slate-500">
                            {a.agents_actuels}/{a.agents_recommandes} agent(s)
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[10px]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {agents.length > 0 && (
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
              <span>
                Page {page} sur {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-2 py-1 rounded border border-slate-700 disabled:opacity-40 hover:bg-slate-800"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2 py-1 rounded border border-slate-700 disabled:opacity-40 hover:bg-slate-800"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DashboardAgents;


