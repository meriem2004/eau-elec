import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Droplets, Zap, ArrowRight, Lock, Mail } from 'lucide-react';

function Login({ onLoginSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@ree.ma');
  const [password, setPassword] = useState('password123');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      console.error(err);
      setError('Identifiants invalides ou erreur serveur.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-900 overflow-hidden font-sans">

      {/* Left Side - Visual */}
      <div className="relative hidden lg:flex flex-col justify-center p-16 bg-slate-900 overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-900 via-slate-950 to-slate-950 opacity-80" />
        <div className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-accent-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[60%] right-[10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-accent-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-accent-500/20">
              <Droplets size={32} className="text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white tracking-tight">SI Relevés</h1>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-3xl font-light text-slate-300 mb-8 leading-snug"
          >
            Plateforme Unifiée de Gestion <br />
            <span className="text-accent-400 font-semibold">Eau & Électricité</span> à Rabat
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-slate-300">Système Opérationnel</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <Zap size={14} className="text-amber-400" />
              <span className="text-sm text-slate-300">v2.4.0 (Deep Ocean)</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center p-8 bg-slate-50 lg:bg-slate-900/50 backdrop-blur-xl relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none lg:invert" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white lg:bg-slate-800/50 lg:backdrop-blur-xl border border-gray-200 lg:border-white/10 rounded-3xl shadow-2xl p-8 lg:p-12 relative overflow-hidden"
        >
          {/* Decorative Top Glow */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent-400 to-primary-600" />

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-slate-800 lg:text-white mb-2">Bon retour</h2>
            <p className="text-sm text-slate-500 lg:text-slate-400">Connectez-vous pour accéder au tableau de bord</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 lg:text-slate-400 ml-1">Email Professionnel</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-400 group-focus-within:text-accent-500 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="nom@ree.ma"
                  className="w-full bg-gray-50 lg:bg-slate-900/50 border border-gray-200 lg:border-white/10 rounded-xl px-4 py-3.5 pl-11 text-sm text-slate-900 lg:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 lg:text-slate-400 ml-1">Mot de passe</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400 group-focus-within:text-accent-500 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-gray-50 lg:bg-slate-900/50 border border-gray-200 lg:border-white/10 rounded-xl px-4 py-3.5 pl-11 text-sm text-slate-900 lg:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="rounded border-gray-300 text-accent-600 focus:ring-accent-500 bg-gray-100 lg:bg-white/10 lg:border-white/20" />
                <span className="text-slate-500 lg:text-slate-400 group-hover:text-slate-300 transition-colors">Rester connecté</span>
              </label>
              <a href="#" className="text-accent-600 lg:text-accent-400 hover:text-accent-500 font-medium transition-colors">Mot de passe oublié ?</a>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-xl bg-rose-50 lg:bg-rose-500/10 border border-rose-200 lg:border-rose-500/20 text-rose-600 lg:text-rose-400 text-sm flex items-center gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-accent-500/20 transform transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Accéder à l'espace</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 lg:border-white/5 text-center">
            <p className="text-[10px] text-slate-400 lg:text-slate-500 uppercase tracking-widest font-semibold">
              Rabat Energie & Eau &copy; {new Date().getFullYear()}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
