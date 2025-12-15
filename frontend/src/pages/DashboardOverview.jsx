import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Activity, Zap, FileText } from 'lucide-react';
import api from '../services/api';

const StatCard = ({ label, value, icon: Icon, trend, subLabel }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg hover:border-slate-700 transition-colors">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-400 text-sm font-medium">{label}</p>
        <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
      </div>
      <div className="p-2 bg-slate-800/50 rounded-lg text-indigo-400">
        <Icon size={20} />
      </div>
    </div>
    <div className="mt-4 flex items-center text-xs">
      {trend !== undefined && trend !== null && (
        <span className={`font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend > 0 ? '+' : ''}
          {trend}%
        </span>
      )}
      <span className="text-slate-500 ml-2">{subLabel}</span>
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 bg-slate-900 rounded-xl border border-slate-800" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-80 bg-slate-900 rounded-xl border border-slate-800" />
      <div className="h-80 bg-slate-900 rounded-xl border border-slate-800" />
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
        <p className="text-slate-200 font-medium mb-1">{label}</p>
        <p className="text-indigo-400 text-sm">
          {payload[0].value} <span className="text-slate-500 text-xs">unités</span>
        </p>
      </div>
    );
  }
  return null;
};

function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats(data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        setError("Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-2 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Taux de Couverture"
          value={`${stats.tauxCouverture}%`}
          icon={Activity}
          subLabel="Objectif mensuel"
          trend={stats.tauxCouverture > 80 ? 5 : -2}
        />
        <StatCard
          label="Total Compteurs"
          value={stats.totalCompteurs.toLocaleString()}
          icon={Zap}
          subLabel="Actifs sur le réseau"
        />
        <StatCard
          label="Relevés ce mois"
          value={stats.relevésCeMois.toLocaleString()}
          icon={FileText}
          subLabel="Données validées"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-200">Consommation Globale</h3>
            <select className="bg-slate-800 border-none text-xs text-slate-400 rounded-md py-1 px-2 outline-none">
              <option>Derniers 6 mois</option>
              <option>Cette année</option>
            </select>
          </div>
          <div className="h-64 w-full">
            {stats.consommationParMois?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.consommationParMois}>
                  <defs>
                    <linearGradient id="colorCons" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="mois"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `M${val}`}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val / 1000}k`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155' }} />
                  <Area
                    type="monotone"
                    dataKey="totalConsommation"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCons)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-200 mb-6">Performance des Agents</h3>
          <div className="h-64 w-full">
            {stats.topAgents?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topAgents} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e293b"
                    horizontal
                    vertical={false}
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="nom"
                    type="category"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip
                    cursor={{ fill: '#1e293b' }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      color: '#f8fafc'
                    }}
                  />
                  <Bar
                    dataKey="nbReleves"
                    fill="#10b981"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Aucune activité récente
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;


