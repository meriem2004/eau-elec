import React, { useState } from 'react';
import {
  LayoutDashboard, Users, FileText, Settings, LogOut,
  Activity, Bell, MapPin, Gauge, Menu, X, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardOverview from './DashboardOverview';
import DashboardAdmins from './DashboardAdmins';
import DashboardReleves from './DashboardReleves';
import DashboardCompteurs from './DashboardCompteurs';
import DashboardAdresses from './DashboardAdresses';
import DashboardAgents from './DashboardAgents';
import DashboardReports from './DashboardReports';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarItem = ({ icon: Icon, label, active, onClick, hidden, collapsed }) => {
  if (hidden) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${active
          ? 'text-white shadow-lg bg-gradient-to-r from-accent-500 to-accent-600'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
        } ${collapsed ? 'justify-center' : 'w-full'}`}
    >
      <Icon size={20} strokeWidth={active ? 2.5 : 2} className={`relative z-10 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />

      {!collapsed && (
        <span className="font-medium tracking-wide relative z-10 text-sm whitespace-nowrap">
          {label}
        </span>
      )}

      {active && !collapsed && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
        />
      )}
    </button>
  );
};

function Dashboard() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-900 via-primary-950 to-slate-950 text-slate-100 flex overflow-hidden font-sans selection:bg-accent-500/30">

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Floating Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isSidebarCollapsed ? 80 : 280,
          translateX: isMobileMenuOpen ? 0 : 0
        }}
        className={`fixed md:relative z-50 h-[calc(100vh-2rem)] m-4 flex flex-col bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${!isMobileMenuOpen && 'hidden md:flex'
          }`}
      >
        {/* Logo Area */}
        <div className={`flex items-center gap-4 p-6 border-b border-white/5 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-accent-500/20">
              <Activity size={22} className="text-white" />
            </div>
            <div className="absolute -inset-2 bg-accent-500/20 blur-xl rounded-full -z-10" />
          </div>
          {!isSidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="font-bold text-lg tracking-tight text-white leading-none">SI Relevés</span>
              <span className="text-[10px] text-accent-400 font-semibold tracking-wider uppercase mt-1">Management</span>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2 scrollbar-hide">
          <SidebarItem
            icon={LayoutDashboard}
            label="Vue d'ensemble"
            active={activeSection === 'overview'}
            onClick={() => setActiveSection('overview')}
            collapsed={isSidebarCollapsed}
          />
          <div className="my-4 border-t border-white/5 mx-2" />
          <SidebarItem
            icon={FileText}
            label="Relevés & Conso"
            active={activeSection === 'releves'}
            onClick={() => setActiveSection('releves')}
            collapsed={isSidebarCollapsed}
          />
          <SidebarItem
            icon={Gauge}
            label="Parc Compteurs"
            active={activeSection === 'compteurs'}
            onClick={() => setActiveSection('compteurs')}
            collapsed={isSidebarCollapsed}
          />
          <SidebarItem
            icon={MapPin}
            label="Zones & Adresses"
            active={activeSection === 'adresses'}
            onClick={() => setActiveSection('adresses')}
            collapsed={isSidebarCollapsed}
          />

          <div className="my-4 border-t border-white/5 mx-2" />

          <SidebarItem
            icon={Users}
            label="Administrateurs"
            active={activeSection === 'admins'}
            onClick={() => setActiveSection('admins')}
            hidden={user?.role !== 'SUPERADMIN'}
            collapsed={isSidebarCollapsed}
          />
          <SidebarItem
            icon={Users}
            label="Agents Terrain"
            active={activeSection === 'agents'}
            onClick={() => setActiveSection('agents')}
            collapsed={isSidebarCollapsed}
          />
          <SidebarItem
            icon={Settings}
            label="Rapports & Analytics"
            active={activeSection === 'reports'}
            onClick={() => setActiveSection('reports')}
            collapsed={isSidebarCollapsed}
          />
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/5 bg-slate-950/30">
          <button
            onClick={toggleSidebar}
            className="hidden md:flex items-center justify-center w-full p-2 text-slate-500 hover:text-white transition-colors mb-2"
          >
            <ChevronRight size={16} className={`transform transition-transform ${!isSidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>

          <button
            type="button"
            onClick={logout}
            className={`flex items-center gap-3 w-full p-3 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all group ${isSidebarCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            {!isSidebarCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">

        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8 pt-4 pb-2 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 text-white bg-slate-800/50 rounded-lg backdrop-blur-md"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:block">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight">
                {activeSection === 'overview' && 'Tableau de bord'}
                {activeSection === 'releves' && 'Relevés Clients'}
                {activeSection === 'admins' && 'Gestion Administrateurs'}
                {activeSection === 'compteurs' && 'Parc de Compteurs'}
                {activeSection === 'adresses' && 'Zones & Adresses'}
                {activeSection === 'agents' && 'Agents de Terrain'}
                {activeSection === 'reports' && 'Rapports & Analyses'}
              </h2>
              <p className="text-slate-400 text-xs font-medium mt-0.5">
                Bienvenue, {user?.nom} {user?.prenom}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent-500 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.6)] animate-pulse" />
            </button>

            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-200 leading-tight">
                  {user?.nom} {user?.prenom}
                </p>
                <p className="text-[10px] text-accent-400 font-bold uppercase tracking-wider">
                  {user?.role || 'User'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 p-[2px] shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-sm font-bold text-white">
                  {user?.nom?.[0]}{user?.prenom?.[0]}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto pb-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeSection === 'overview' && <DashboardOverview />}
                {activeSection === 'admins' && <DashboardAdmins />}
                {activeSection === 'releves' && <DashboardReleves />}
                {activeSection === 'compteurs' && <DashboardCompteurs />}
                {activeSection === 'adresses' && <DashboardAdresses />}
                {activeSection === 'agents' && <DashboardAgents />}
                {activeSection === 'reports' && <DashboardReports />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;