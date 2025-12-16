import React, { useState } from 'react';
import {
  LayoutDashboard, Users, FileText, Settings, LogOut,
  Activity, Bell, MapPin, Gauge
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardOverview from './DashboardOverview';
import DashboardAdmins from './DashboardAdmins';
import DashboardReleves from './DashboardReleves';
import DashboardCompteurs from './DashboardCompteurs';
import DashboardAdresses from './DashboardAdresses';
import DashboardAgents from './DashboardAgents';
import DashboardReports from './DashboardReports';

const SidebarItem = ({ icon: Icon, label, active, onClick, hidden }) => {
  if (hidden) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
        active
          ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20'
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );
};

function Dashboard() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      <aside className="w-64 border-r border-slate-800 hidden md:flex flex-col p-4 bg-slate-950">
        <div className="flex items-center gap-2 px-2 mb-8 mt-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Activity size={20} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">SI Relevés</span>
        </div>

        <nav className="space-y-1 flex-1">
          <SidebarItem
            icon={LayoutDashboard}
            label="Vue d'ensemble"
            active={activeSection === 'overview'}
            onClick={() => setActiveSection('overview')}
          />
          <SidebarItem
            icon={FileText}
            label="Relevés"
            active={activeSection === 'releves'}
            onClick={() => setActiveSection('releves')}
          />
          <SidebarItem
            icon={Gauge}
            label="Compteurs"
            active={activeSection === 'compteurs'}
            onClick={() => setActiveSection('compteurs')}
          />
          <SidebarItem
            icon={MapPin}
            label="Adresses"
            active={activeSection === 'adresses'}
            onClick={() => setActiveSection('adresses')}
          />
          <SidebarItem
            icon={Users}
            label="Utilisateurs"
            active={activeSection === 'admins'}
            onClick={() => setActiveSection('admins')}
            hidden={user?.role !== 'SUPERADMIN'}
          />
          <SidebarItem
            icon={Users}
            label="Agents"
            active={activeSection === 'agents'}
            onClick={() => setActiveSection('agents')}
          />
          <SidebarItem
            icon={Settings}
            label="Rapports"
            active={activeSection === 'reports'}
            onClick={() => setActiveSection('reports')}
          />
        </nav>

        <div className="pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:text-rose-400 transition-colors"
          >
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950 sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-slate-100">
            {activeSection === 'overview' && 'Tableau de bord'}
            {activeSection === 'releves' && 'Relevés'}
            {activeSection === 'admins' && 'Gestion des utilisateurs'}
            {activeSection === 'compteurs' && 'Gestion des compteurs'}
            {activeSection === 'adresses' && 'Gestion des adresses'}
            {activeSection === 'agents' && 'Affectation des agents'}
            {activeSection === 'reports' && 'Rapports & comparatifs'}
          </h2>

          <div className="flex items-center gap-6">
            <button
              type="button"
              className="relative text-slate-400 hover:text-slate-200"
            >
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full" />
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-200">
                  {user?.nom} {user?.prenom}
                </p>
                <p className="text-xs text-slate-500 capitalize">
                  {user?.role || 'Admin'}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400 border border-slate-700">
                {user?.nom?.[0]}
                {user?.prenom?.[0]}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {activeSection === 'overview' && <DashboardOverview />}
          {activeSection === 'admins' && <DashboardAdmins />}
          {activeSection === 'releves' && <DashboardReleves />}
          {activeSection === 'compteurs' && <DashboardCompteurs />}
          {activeSection === 'adresses' && <DashboardAdresses />}
          {activeSection === 'agents' && <DashboardAgents />}
          {activeSection === 'reports' && <DashboardReports />}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;