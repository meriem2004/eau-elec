import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Badge = ({ children }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-200">
    {children}
  </span>
);

function DashboardAdmins() {
  const { user } = useAuth();

  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState({
    nom: '',
    prenom: '',
    email: ''
  });
  const [adminSubmitting, setAdminSubmitting] = useState(false);
  const [adminSuccess, setAdminSuccess] = useState('');

  const loadAdmins = async () => {
    setLoadingAdmins(true);
    setAdminError('');
    try {
      const { data } = await api.get('/auth/admins');
      setAdmins(data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setAdminError("Impossible de charger les administrateurs.");
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleAdminInputChange = (e) => {
    const { name, value } = e.target;
    setAdminForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminError('');
    setAdminSuccess('');
    setAdminSubmitting(true);
    try {
      await api.post('/auth/register', {
        nom: adminForm.nom,
        prenom: adminForm.prenom,
        email: adminForm.email,
        role: 'SUPERADMIN'
      });
      setAdminSuccess("Admin créé et email envoyé (simulation MailHog).");
      setAdminForm({ nom: '', prenom: '', email: '' });
      await loadAdmins();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setAdminError("Impossible de créer l'administrateur.");
    } finally {
      setAdminSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Gestion des administrateurs</h2>
          <p className="text-xs text-slate-500 mt-1">
            Vue réservée au SUPERADMIN pour gérer les accès backoffice.
          </p>
        </div>
        {user?.role === 'SUPERADMIN' && (
          <button
            type="button"
            onClick={() => {
              setAdminSuccess('');
              setAdminError('');
              setShowAdminModal(true);
            }}
            className="px-3 py-2 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm"
          >
            + Ajouter un admin
          </button>
        )}
      </div>

      {adminError && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-sm">
          {adminError}
        </div>
      )}
      {adminSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-sm">
          {adminSuccess}
        </div>
      )}

      {loadingAdmins ? (
        <p className="text-sm text-slate-400">Chargement des administrateurs...</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/70 border-b border-slate-800">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-slate-400">Nom complet</th>
                <th className="px-4 py-2 text-left font-medium text-slate-400">Email</th>
                <th className="px-4 py-2 text-left font-medium text-slate-400">Rôle</th>
                <th className="px-4 py-2 text-left font-medium text-slate-400">Créé le</th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-xs text-slate-500"
                  >
                    Aucun administrateur pour le moment.
                  </td>
                </tr>
              )}
              {admins.map((a) => (
                <tr key={a.id_user} className="border-t border-slate-800/60 hover:bg-slate-900/40">
                  <td className="px-4 py-2 text-slate-100">
                    {a.nom} {a.prenom}
                  </td>
                  <td className="px-4 py-2 text-slate-300">{a.email}</td>
                  <td className="px-4 py-2 text-slate-300 text-xs">
                    <Badge>{a.role}</Badge>
                  </td>
                  <td className="px-4 py-2 text-slate-400 text-xs">
                    {a.date_creation
                      ? new Date(a.date_creation).toLocaleDateString('fr-FR')
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdminModal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Ajouter un administrateur</h3>
            <p className="text-xs text-slate-500 mb-4">
              Un mot de passe aléatoire sera généré et envoyé par email (via MailHog).
            </p>
            <form onSubmit={handleCreateAdmin} className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-slate-400 mb-1" htmlFor="nom">
                    Nom
                  </label>
                  <input
                    id="nom"
                    name="nom"
                    required
                    value={adminForm.nom}
                    onChange={handleAdminInputChange}
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-slate-400 mb-1" htmlFor="prenom">
                    Prénom
                  </label>
                  <input
                    id="prenom"
                    name="prenom"
                    required
                    value={adminForm.prenom}
                    onChange={handleAdminInputChange}
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={adminForm.email}
                  onChange={handleAdminInputChange}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={adminSubmitting}
                  className="px-3 py-2 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium disabled:opacity-60"
                >
                  {adminSubmitting ? 'Création...' : 'Créer et envoyer l’email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardAdmins;


