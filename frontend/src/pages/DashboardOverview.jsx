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
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Activity, Zap, FileText } from 'lucide-react';
import api from '../services/api';

const StatCard = ({ label, value, icon: Icon, trend, subLabel }) => (
  <div className="relative group overflow-hidden bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-slate-800/60 transition-all duration-300">
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon size={80} />
    </div>

    <div className="relative z-10 flex justify-between items-start">
      <div>
        <p className="text-slate-400 text-sm font-medium tracking-wide uppercase">{label}</p>
        <h3 className="text-3xl font-bold text-white mt-2 tracking-tight">{value}</h3>
      </div>
      <div className="p-3 bg-gradient-to-br from-accent-500/20 to-primary-500/20 rounded-xl text-accent-400 border border-white/5 shadow-inner">
        <Icon size={24} />
      </div>
    </div>

    <div className="relative z-10 mt-6 flex items-center text-xs font-medium">
      {trend !== undefined && trend !== null && (
        <span className={`flex items-center gap-1 px-2 py-1 rounded-md ${trend >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
      <span className="text-slate-500 ml-3">{subLabel}</span>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 border border-white/10 p-3 rounded-xl shadow-xl backdrop-blur-md">
        <p className="text-slate-300 font-medium mb-1 text-xs">{label}</p>
        <p className="text-accent-400 text-lg font-bold">
          {payload[0].value} <span className="text-slate-500 text-xs font-normal">unités</span>
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
        console.error(err);
        setError("Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-slate-800/50 rounded-2xl border border-white/5" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* KPI Cards */}
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart */}
        <div className="bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-200">Consommation Globale</h3>
            <select className="bg-slate-900/50 border border-white/10 text-xs text-slate-400 rounded-lg py-1.5 px-3 outline-none focus:border-accent-500 transition-colors">
              <option>Derniers 6 mois</option>
              <option>Cette année</option>
            </select>
          </div>
          <div className="h-72 w-full">
            {stats.consommationParMois?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.consommationParMois}>
                  <defs>
                    <linearGradient id="colorCons" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="mois"
                    stroke="#475569"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `M${val}`}
                    dy={10}
                  />
                  <YAxis
                    stroke="#475569"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val / 1000}k`}
                    dx={-10}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                  <Area
                    type="monotone"
                    dataKey="totalConsommation"
                    stroke="#0ea5e9"
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

        {/* Bar Chart - Top Agents */}
        <div className="bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-slate-200 mb-8">Top Agents (Performance)</h3>
          <div className="h-72 w-full">
            {stats.topAgents?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topAgents} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
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
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: 'rgba(255,255,255,0.1)',
                      color: '#f8fafc',
                      borderRadius: '0.75rem'
                    }}
                  />
                  <Bar
                    dataKey="nbReleves"
                    fill="#14b8a6"
                    radius={[0, 4, 4, 0]}
                    barSize={24}
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

        {/* Sector Diagram - Energy vs Water */}
        <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-200 mb-2">Répartition Sectorielle</h3>
            <p className="text-xs text-slate-400 mb-6">Eau vs Électricité (Volume traité)</p>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Électricité', value: 65, color: '#f59e0b' },
                      { name: 'Eau Potable', value: 35, color: '#06b6d4' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell key="cell-0" fill="#f59e0b" />
                    <Cell key="cell-1" fill="#06b6d4" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: 'rgba(255,255,255,0.1)',
                      color: '#f8fafc',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gradient-to-br from-elec-500/20 to-water-500/20 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-900/50 flex items-center justify-center mb-4 border border-white/10 shadow-xl">
              <Zap className="text-elec-400 w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">Performance Réseau</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              L'efficacité énergétique a augmenté de
              <span className="text-emerald-400 font-bold ml-1">+12%</span> cette semaine grace aux nouveaux compteurs intelligents.
            </p>
            <button className="mt-6 px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors border border-white/5">
              Voir détails
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;


