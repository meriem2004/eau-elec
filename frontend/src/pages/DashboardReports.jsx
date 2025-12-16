import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';

function DashboardReports() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [monthly, setMonthly] = useState(null);
  const [yearly, setYearly] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [monthlyRes, yearlyRes, trendsRes] = await Promise.all([
        api.get('/reports/monthly', { params: { year, month } }),
        api.get('/reports/yearly-comparison', { params: { year } }),
        api.get('/reports/trends', { params: { year, months: 6 } })
      ]);
      setMonthly(monthlyRes.data);
      setYearly(yearlyRes.data);
      setTrends(trendsRes.data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError("Impossible de charger les rapports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownloadPdf = async () => {
    try {
      const response = await api.get('/reports/monthly.pdf', {
        params: { year, month },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport_${year}_${month}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError("Impossible de télécharger le rapport PDF.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Rapports & Comparatifs</h2>
          <p className="text-xs text-slate-500 mt-1">
            Analyse mensuelle détaillée et comparaison annuelle des consommations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
          <select
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={loadData}
            className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100"
          >
            Rafraîchir
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="px-3 py-1.5 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            Télécharger PDF
          </button>
        </div>
      </div>
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {loading ? (
        <p className="text-sm text-slate-400">Chargement des rapports...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-100 mb-2">Rapport mensuel</h3>
            {!monthly ? (
              <p className="text-xs text-slate-500">Aucune donnée.</p>
            ) : (
              <div className="space-y-2 text-xs text-slate-300">
                <p>Total relevés: {monthly.totalReleves}</p>
                {monthly.parType && (
                  <div>
                    <p className="font-semibold text-slate-200 mb-1">Par type</p>
                    <ul className="space-y-1 mb-2">
                      <li>
                        EAU — {monthly.parType.EAU?.nbReleves || 0} relevés,{' '}
                        {monthly.parType.EAU?.totalConsommation || 0} unités
                      </li>
                      <li>
                        ELECTRICITE — {monthly.parType.ELECTRICITE?.nbReleves || 0} relevés,{' '}
                        {monthly.parType.ELECTRICITE?.totalConsommation || 0} unités
                      </li>
                    </ul>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-slate-200 mb-1">Par agent</p>
                  <ul className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {monthly.parAgent.map((a) => (
                      <li key={a.id_agent} className="text-xs">
                        <span className="text-slate-200">{a.nom} {a.prenom}</span>
                        <br />
                        <span className="text-slate-400">
                          {a.nbReleves} relevés ({a.moyenneRelevesParJour || 0}/jour), {a.totalConsommation} unités
                        </span>
                        {a.parType && (
                          <span className="text-slate-500 ml-1 block">
                            EAU: {a.parType.EAU?.nbReleves || 0}, ELEC: {a.parType.ELECTRICITE?.nbReleves || 0}
                          </span>
                        )}
                        {a.parQuartier && a.parQuartier.length > 0 && (
                          <div className="text-slate-500 text-[10px] mt-1 ml-2">
                            Par quartier:
                            {a.parQuartier.map((q) => (
                              <span key={q.id_quartier} className="ml-1">
                                {q.libelle}: {q.moyenneRelevesParJour || 0}/jour
                              </span>
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-slate-200 mb-1">Par quartier</p>
                  <ul className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {monthly.parQuartier.map((q) => (
                      <li key={q.id_quartier}>
                        {q.libelle} — {q.nbReleves} relevés, {q.totalConsommation} unités
                        {q.parType && (
                          <span className="text-slate-500 ml-1">
                            (EAU: {q.parType.EAU?.nbReleves || 0}, ELEC: {q.parType.ELECTRICITE?.nbReleves || 0})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-100 mb-2">
              Comparaison annuelle (N vs N-1)
            </h3>
            {!yearly ? (
              <p className="text-xs text-slate-500">Aucune donnée.</p>
            ) : (
              <div className="space-y-2 text-xs text-slate-300">
                <p>Année étudiée: {yearly.year}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="font-semibold text-slate-200 mb-1">Année courante ({yearly.year})</p>
                    <ul className="space-y-1 max-h-48 overflow-y-auto pr-1 text-[10px]">
                      {yearly.current.map((m) => (
                        <li key={`c-${m.mois}`}>
                          M{m.mois}: {m.total} unités
                          <span className="text-slate-500 ml-1">
                            (EAU: {m.EAU || 0}, ELEC: {m.ELECTRICITE || 0})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200 mb-1">Année précédente ({yearly.year - 1})</p>
                    <ul className="space-y-1 max-h-48 overflow-y-auto pr-1 text-[10px]">
                      {yearly.previous.map((m) => (
                        <li key={`p-${m.mois}`}>
                          M{m.mois}: {m.total} unités
                          <span className="text-slate-500 ml-1">
                            (EAU: {m.EAU || 0}, ELEC: {m.ELECTRICITE || 0})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
          {trends && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 lg:col-span-2">
              <h3 className="text-sm font-semibold text-slate-100 mb-2">
                Tendances de consommation (6 derniers mois)
              </h3>
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends.donnees}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis
                      dataKey="mois"
                      tickFormatter={(value) => `M${value}`}
                      stroke="#94a3b8"
                      style={{ fontSize: '10px' }}
                    />
                    <YAxis stroke="#94a3b8" style={{ fontSize: '10px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Total"
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="EAU"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      name="EAU"
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="ELECTRICITE"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      name="ELECTRICITE"
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-800/50 rounded p-2">
                  <p className="text-slate-400 mb-1">Tendance Total</p>
                  <p className={`font-semibold ${
                    trends.tendances.total.trend === 'increasing' ? 'text-emerald-400' :
                    trends.tendances.total.trend === 'decreasing' ? 'text-rose-400' : 'text-slate-300'
                  }`}>
                    {trends.tendances.total.trend === 'increasing' ? '↗ Croissante' :
                     trends.tendances.total.trend === 'decreasing' ? '↘ Décroissante' : '→ Stable'}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded p-2">
                  <p className="text-slate-400 mb-1">Tendance EAU</p>
                  <p className={`font-semibold ${
                    trends.tendances.EAU.trend === 'increasing' ? 'text-emerald-400' :
                    trends.tendances.EAU.trend === 'decreasing' ? 'text-rose-400' : 'text-slate-300'
                  }`}>
                    {trends.tendances.EAU.trend === 'increasing' ? '↗ Croissante' :
                     trends.tendances.EAU.trend === 'decreasing' ? '↘ Décroissante' : '→ Stable'}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded p-2">
                  <p className="text-slate-400 mb-1">Tendance ELECTRICITE</p>
                  <p className={`font-semibold ${
                    trends.tendances.ELECTRICITE.trend === 'increasing' ? 'text-emerald-400' :
                    trends.tendances.ELECTRICITE.trend === 'decreasing' ? 'text-rose-400' : 'text-slate-300'
                  }`}>
                    {trends.tendances.ELECTRICITE.trend === 'increasing' ? '↗ Croissante' :
                     trends.tendances.ELECTRICITE.trend === 'decreasing' ? '↘ Décroissante' : '→ Stable'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DashboardReports;


