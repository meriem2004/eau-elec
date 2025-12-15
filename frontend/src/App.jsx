import React from 'react';

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
      <div className="max-w-xl w-full border border-slate-800 rounded-2xl p-8 bg-slate-900/60 shadow-xl">
        <h1 className="text-3xl font-semibold mb-4 text-center">
          SI Relevés - Rabat Energie &amp; Eau
        </h1>
        <p className="text-slate-300 text-center mb-6">
          Phase 1 – Initialisation terminée : backend &amp; frontend de base sont en place.
        </p>
        <div className="text-sm text-slate-400 space-y-1">
          <p>✅ Backend : Express + Sequelize + mapping MLD MySQL.</p>
          <p>✅ Frontend : React + Vite + Tailwind (squelette).</p>
          <p>✅ Docker : MySQL 8.0 + MailHog + services backend/frontend déclarés.</p>
        </div>
      </div>
    </div>
  );
}

export default App;


