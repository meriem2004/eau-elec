import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const Badge = ({ variant = 'default', children }) => {
  const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium';
  const variants = {
    default: 'bg-slate-800 text-slate-200',
    blue: 'bg-sky-500/10 text-sky-300 border border-sky-500/40',
    yellow: 'bg-amber-500/10 text-amber-300 border border-amber-500/40'
  };
  return <span className={`${base} ${variants[variant]}`}>{children}</span>;
};

function DashboardReleves() {
  const [releves, setReleves] = useState([]);
  const [loadingReleves, setLoadingReleves] = useState(false);
  const [relevesError, setRelevesError] = useState('');
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    quartier: 'ALL'
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState('date_releve');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'

  const loadReleves = async () => {
    setLoadingReleves(true);
    setRelevesError('');
    try {
      const { data } = await api.get('/releves');
      setReleves(data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setRelevesError("Impossible de charger les relevés.");
    } finally {
      setLoadingReleves(false);
    }
  };

  useEffect(() => {
    loadReleves();
  }, []);

  const quartiersOptions = useMemo(() => {
    const set = new Set();
    releves.forEach((r) => {
      if (r.quartier) set.add(r.quartier);
    });
    return Array.from(set).sort();
  }, [releves]);

  const filteredReleves = useMemo(() => {
    const base = releves.filter((r) => {
      const d = new Date(r.date_releve);
      if (filters.dateFrom && d < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && d > new Date(filters.dateTo)) return false;
      if (filters.quartier !== 'ALL' && r.quartier !== filters.quartier) return false;
      return true;
    });

    const sorted = [...base].sort((a, b) => {
      const dir = sortDirection === 'asc' ? 1 : -1;

      if (sortBy === 'date_releve') {
        return (new Date(a.date_releve) - new Date(b.date_releve)) * dir;
      }
      if (sortBy === 'numero_serie') {
        return a.numero_serie.localeCompare(b.numero_serie) * dir;
      }
      if (sortBy === 'quartier') {
        return (a.quartier || '').localeCompare(b.quartier || '') * dir;
      }
      if (sortBy === 'consommation') {
        return (a.consommation - b.consommation) * dir;
      }
      return 0;
    });

    return sorted;
  }, [releves, filters, sortBy, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredReleves.length / pageSize));

  const currentPageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredReleves.slice(start, start + pageSize);
  }, [filteredReleves, page, pageSize]);

  const handleChangePageSize = (value) => {
    const size = Number(value);
    setPageSize(size);
    setPage(1);
  };

  const toggleSort = (field) => {
    setPage(1);
    setSortBy((prevField) => {
      if (prevField === field) {
        setSortDirection((prevDir) => (prevDir === 'asc' ? 'desc' : 'asc'));
        return prevField;
      }
      setSortDirection('asc');
      return field;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Liste des relevés</h2>
          <p className="text-xs text-slate-500 mt-1">
            Visualisez les relevés avec filtres par période et quartier.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-xs text-slate-400 mb-1" htmlFor="dateFrom">
            Date début
          </label>
          <input
            id="dateFrom"
            type="date"
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-100"
            value={filters.dateFrom}
            onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1" htmlFor="dateTo">
            Date fin
          </label>
          <input
            id="dateTo"
            type="date"
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-100"
            value={filters.dateTo}
            onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1" htmlFor="quartier">
            Quartier
          </label>
          <select
            id="quartier"
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-100"
            value={filters.quartier}
            onChange={(e) => setFilters((f) => ({ ...f, quartier: e.target.value }))}
          >
            <option value="ALL">Tous les quartiers</option>
            {quartiersOptions.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 justify-end md:justify-start">
          <button
            type="button"
            onClick={loadReleves}
            className="px-3 py-2 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium"
          >
            Rafraîchir
          </button>
          <button
            type="button"
            onClick={() => {
              setFilters({ dateFrom: '', dateTo: '', quartier: 'ALL' });
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {relevesError && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-sm">
          {relevesError}
        </div>
      )}

      {loadingReleves ? (
        <p className="text-sm text-slate-400">Chargement des relevés...</p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>
              {filteredReleves.length === 0
                ? 'Aucun relevé à afficher.'
                : `Affichage de ${(page - 1) * pageSize + 1} à ${Math.min(
                    page * pageSize,
                    filteredReleves.length
                  )} sur ${filteredReleves.length} relevés`}
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
                  <th
                    className="px-3 py-2 text-left font-medium text-slate-400 cursor-pointer select-none"
                    onClick={() => toggleSort('date_releve')}
                  >
                    Date
                    {sortBy === 'date_releve' && (
                      <span className="ml-1 text-[10px]">
                        {sortDirection === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </th>
                  <th
                    className="px-3 py-2 text-left font-medium text-slate-400 cursor-pointer select-none"
                    onClick={() => toggleSort('numero_serie')}
                  >
                    Compteur
                    {sortBy === 'numero_serie' && (
                      <span className="ml-1 text-[10px]">
                        {sortDirection === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-400">Type</th>
                  <th
                    className="px-3 py-2 text-left font-medium text-slate-400 cursor-pointer select-none"
                    onClick={() => toggleSort('quartier')}
                  >
                    Quartier
                    {sortBy === 'quartier' && (
                      <span className="ml-1 text-[10px]">
                        {sortDirection === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-400">Ancien index</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-400">Nouvel index</th>
                  <th
                    className="px-3 py-2 text-left font-medium text-slate-400 cursor-pointer select-none"
                    onClick={() => toggleSort('consommation')}
                  >
                    Consommation
                    {sortBy === 'consommation' && (
                      <span className="ml-1 text-[10px]">
                        {sortDirection === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-400">Agent</th>
                </tr>
              </thead>
              <tbody>
                {currentPageItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-6 text-center text-xs text-slate-500"
                    >
                      Aucun relevé ne correspond aux filtres sélectionnés.
                    </td>
                  </tr>
                )}
                {currentPageItems.map((r) => {
                  const type = r.type_compteur;
                  const badgeVariant = type === 'EAU' ? 'blue' : 'yellow';
                  return (
                    <tr
                      key={r.id_releve}
                      className="border-t border-slate-800/60 hover:bg-slate-900/40"
                    >
                      <td className="px-3 py-2 text-slate-200">
                        {new Date(r.date_releve).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-3 py-2 text-slate-300">{r.numero_serie}</td>
                      <td className="px-3 py-2">
                        <Badge variant={badgeVariant}>
                          {type === 'EAU' ? 'Eau' : 'Électricité'}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-slate-300">{r.quartier || '-'}</td>
                      <td className="px-3 py-2 text-slate-300">{r.ancien_index}</td>
                      <td className="px-3 py-2 text-slate-300">{r.nouvel_index}</td>
                      <td className="px-3 py-2 text-slate-200 font-medium">
                        {r.consommation} <span className="text-slate-500">u</span>
                      </td>
                      <td className="px-3 py-2 text-slate-300">
                        {r.agent ? `${r.agent.nom} ${r.agent.prenom}` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredReleves.length > 0 && (
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

export default DashboardReleves;


