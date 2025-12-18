import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import api from '../services/api';
import { motion } from 'framer-motion';
import { FileText, Download, TrendingUp, AlertTriangle, CheckCircle, Calendar, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MockTrends = [
  { mois: 'Jan', EAU: 4000, ELECTRICITE: 2400 },
  { mois: 'Fev', EAU: 3000, ELECTRICITE: 1398 },
  { mois: 'Mar', EAU: 2000, ELECTRICITE: 9800 },
  { mois: 'Avr', EAU: 2780, ELECTRICITE: 3908 },
  { mois: 'Mai', EAU: 1890, ELECTRICITE: 4800 },
  { mois: 'Juin', EAU: 2390, ELECTRICITE: 3800 },
  { mois: 'Juil', EAU: 3490, ELECTRICITE: 4300 },
];

const IncidentCard = ({ title, date, severity, status }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/40 border border-white/5 hover:bg-slate-800/60 transition-colors">
    <div className={`p-2 rounded-lg ${severity === 'high' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>
      <AlertTriangle size={18} />
    </div>
    <div className="flex-1">
      <h4 className="text-sm font-bold text-slate-200">{title}</h4>
      <p className="text-xs text-slate-500">{date}</p>
    </div>
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
      {status}
    </span>
  </div>
);

function DashboardReports() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState(MockTrends);

  const loadData = async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const generatePdf = () => {
    const doc = new jsPDF();

    // --- Header Background ---
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 40, 'F');

    // --- Logo / Title ---
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(56, 189, 248); // sky-400
    doc.text('RABAT', 14, 25);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text('ENERGIE & EAU', 52, 25);

    // --- Document Info ---
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('Rapport Mensuel Détaillé', 196, 20, { align: 'right' });
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(`01/${year}`, 196, 28, { align: 'right' });

    // --- KPI Section (Manual Drawing) ---
    let y = 60;

    // Card 1: Total
    doc.setFillColor(241, 245, 249); // slate-100
    doc.roundedRect(14, y, 55, 30, 3, 3, 'F');
    doc.setFontSize(8); doc.setTextColor(100, 116, 139); doc.text('TOTAL RELEVÉS', 19, y + 8);
    doc.setFontSize(16); doc.setTextColor(15, 23, 42); doc.setFont('helvetica', 'bold'); doc.text('12,450', 19, y + 20);

    // Card 2: Eau
    doc.setFillColor(236, 254, 255); // cyan-50
    doc.roundedRect(77, y, 55, 30, 3, 3, 'F');
    doc.setFontSize(8); doc.setTextColor(8, 145, 178); doc.setFont('helvetica', 'normal'); doc.text('EAU (m3)', 82, y + 8);
    doc.setFontSize(16); doc.setTextColor(14, 116, 144); doc.setFont('helvetica', 'bold'); doc.text('45,200', 82, y + 20);

    // Card 3: Elec
    doc.setFillColor(255, 251, 235); // amber-50
    doc.roundedRect(140, y, 55, 30, 3, 3, 'F');
    doc.setFontSize(8); doc.setTextColor(217, 119, 6); doc.setFont('helvetica', 'normal'); doc.text('ELECTRICITÉ (kWh)', 145, y + 8);
    doc.setFontSize(16); doc.setTextColor(180, 83, 9); doc.setFont('helvetica', 'bold'); doc.text('32,800', 145, y + 20);

    y += 45;

    // --- Agents Table ---
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('Performance Agents', 14, y);

    y += 5;

    const tableColumn = ["Agent", "Zone", "Relevés", "Anomalies", "Efficacité"];
    const tableRows = [
      ["BENALI Ahmed", "Agdal", "1,240", "2", "99.8%"],
      ["IDRISSI Karim", "Hay Riad", "980", "1", "99.9%"],
      ["ALAMI Sara", "Ocean", "1,150", "5", "96.5%"],
      ["CHRAIBI Moncef", "Takaddoum", "890", "0", "100%"],
      ["OUAZZANI Leila", "Souissi", "1,050", "3", "98.2%"],
    ];

    autoTable(doc, {
      startY: y,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    // --- Footer ---
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Généré le ${new Date().toLocaleDateString()} - RABAT ENERGIE & EAU`, 14, 285);

    doc.save(`rapport_ree_${year}.pdf`);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Rapports & Analyses</h2>
          <p className="text-slate-400 text-sm">Vue d'ensemble de la performance réseau et incidents.</p>
        </div>
        <button onClick={generatePdf} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all text-sm font-medium">
          <Download size={16} /> Exporter PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main Chart Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Consumption Trends */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-slate-900/40 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp size={18} className="text-accent-400" />
                  Tendances de Consommation
                </h3>
                <p className="text-xs text-slate-400">Eau vs Électricité (unités) - 2024</p>
              </div>
              <select className="bg-slate-800 text-slate-300 text-xs border border-white/10 rounded-lg px-2 py-1 outline-none">
                <option>Derniers 6 mois</option>
                <option>Année N</option>
                <option>Année N-1</option>
              </select>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorElec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEau" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="mois" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="ELECTRICITE" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorElec)" name="Électricité" />
                  <Area type="monotone" dataKey="EAU" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorEau)" name="Eau" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Incidents */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-slate-900/40">
            <h3 className="text-lg font-bold text-white mb-4">Incidents Réseaux & Alertes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <IncidentCard title="Chute Tension - Zone Nord" date="Aujourd'hui, 10:42" severity="high" status="En cours" />
              <IncidentCard title="Fuite Majeure - Takaddoum" date="Hier, 14:15" severity="high" status="Resolved" />
              <IncidentCard title="Maintenance Planifiée #402" date="20 Déc, 08:00" severity="medium" status="Prévu" />
              <IncidentCard title="Anomalie Compteur #9923" date="18 Déc, 09:30" severity="medium" status="Resolved" />
            </div>
          </div>
        </div>

        {/* Right Panel - Generator Form */}
        <div className="space-y-6">
          {/* Report Generator */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-accent-500/10 text-accent-400">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">Générer Rapport</h3>
                <p className="text-xs text-slate-400">Export PDF détaillé</p>
              </div>
            </div>

            <form className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase mb-1.5 block">Type de rapport</label>
                <select className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:border-accent-500 outline-none">
                  <option>Mensuel Global</option>
                  <option>Incidents Critiques</option>
                  <option>Performance Agents</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase mb-1.5 block">Mois</label>
                  <select className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:border-accent-500 outline-none">
                    {['Jan', 'Fev', 'Mar', 'Avr', 'Mai'].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase mb-1.5 block">Année</label>
                  <input type="number" value={year} onChange={e => setYear(e.target.value)} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:border-accent-500 outline-none" />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input type="checkbox" className="rounded bg-slate-800 border-white/20 text-accent-500 focus:ring-accent-500" defaultChecked />
                  Inclure graphiques
                </label>
              </div>

              <button
                type="button"
                onClick={generatePdf}
                className="w-full py-3 mt-2 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors flex justify-center items-center gap-2 active:scale-95 transform"
              >
                <Download size={18} /> Télécharger PDF
              </button>
            </form>
          </div>

          {/* Quick Stats */}
          <div className="bg-slate-800/40 rounded-2xl p-6 border border-white/5 space-y-4">
            <h4 className="text-sm font-bold text-slate-400 uppercase">Résumé Mensuel</h4>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-sm text-slate-300">Total Relevés</span>
              <span className="text-lg font-bold text-white">12,450</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-sm text-slate-300">Anomalies</span>
              <span className="text-lg font-bold text-rose-400">23</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-sm text-slate-300">Efficacité</span>
              <span className="text-lg font-bold text-emerald-400">98.2%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardReports;
