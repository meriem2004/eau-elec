import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

function DashboardAdresses() {
  const [adresses, setAdresses] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showAssociateModal, setShowAssociateModal] = useState(false);
  const [selectedAdresse, setSelectedAdresse] = useState(null);
  const [associateForm, setAssociateForm] = useState({
    numero_serie: '',
    type: 'EAU',
    id_client: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const loadAdresses = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filter === 'WITH') params.hasCompteur = 'true';
      if (filter === 'WITHOUT') params.hasCompteur = 'false';
      const { data } = await api.get('/adresses', { params });
      setAdresses(data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError("Impossible de charger les adresses.");
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const { data } = await api.get('/clients');
      setClients(data || []);
      // eslint-disable-next-line no-console
      console.log('Clients chargés:', data?.length || 0);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Erreur lors du chargement des clients:', err);
      setClients([]);
    }
  };

  useEffect(() => {
    loadAdresses();
    loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const totalPages = Math.max(1, Math.ceil(adresses.length / pageSize));

  const currentPageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return adresses.slice(start, start + pageSize);
  }, [adresses, page, pageSize]);

  const handleChangePageSize = (value) => {
    const size = Number(value);
    setPageSize(size);
    setPage(1);
  };

  const handleAssociateCompteur = (adresse) => {
    setSelectedAdresse(adresse);
    setAssociateForm({ numero_serie: '', type: 'EAU', id_client: '' });
    setShowAssociateModal(true);
    setError('');
    setSuccess('');
  };

  const handleAssociateInputChange = (e) => {
    const { name, value } = e.target;
    setAssociateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitAssociate = async (e) => {
    e.preventDefault();
    if (!selectedAdresse) return;

    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await api.post('/compteurs', {
        ...associateForm,
        id_adresse: selectedAdresse.id_adresse
      });
      setSuccess('Compteur associé avec succès.');
      setShowAssociateModal(false);
      await loadAdresses();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError(err.response?.data?.message || "Impossible d'associer le compteur.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Gestion des adresses</h2>
          <p className="text-xs text-slate-500 mt-1">
            Liste des adresses avec leur quartier et le nombre de compteurs associés.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">Toutes</option>
            <option value="WITH">Avec compteurs</option>
            <option value="WITHOUT">Sans compteur</option>
          </select>
          <button
            type="button"
            onClick={loadAdresses}
            className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100"
          >
            Rafraîchir
          </button>
        </div>
      </div>
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-sm">
          {success}
        </div>
      )}
      {loading ? (
        <p className="text-sm text-slate-400">Chargement des adresses...</p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>
              {adresses.length === 0
                ? 'Aucune adresse à afficher.'
                : `Affichage de ${(page - 1) * pageSize + 1} à ${Math.min(
                    page * pageSize,
                    adresses.length
                  )} sur ${adresses.length} adresses`}
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
                  <th className="px-4 py-2 text-left font-medium text-slate-400">Adresse</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-400">Quartier</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-400">Ville</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-400">Ref ERP</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-400">Nb compteurs</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPageItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-xs text-slate-500"
                    >
                      Aucune adresse.
                    </td>
                  </tr>
                )}
                {currentPageItems.map((a) => (
                  <tr key={a.id_adresse} className="border-t border-slate-800/60 hover:bg-slate-900/40">
                    <td className="px-4 py-2 text-slate-100">{a.libelle_complet}</td>
                    <td className="px-4 py-2 text-slate-300">{a.quartier?.libelle || '-'}</td>
                    <td className="px-4 py-2 text-slate-300">{a.quartier?.ville || '-'}</td>
                    <td className="px-4 py-2 text-slate-300">{a.ref_adresse_erp || '-'}</td>
                    <td className="px-4 py-2 text-slate-300">
                      {a.nb_compteurs === 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          Sans compteur
                        </span>
                      ) : (
                        a.nb_compteurs
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-300">
                      {a.nb_compteurs === 0 && (
                        <button
                          type="button"
                          onClick={() => handleAssociateCompteur(a)}
                          className="px-2 py-1 rounded border border-indigo-600 text-indigo-400 hover:bg-indigo-600/10"
                        >
                          Associer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {adresses.length > 0 && (
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

      {showAssociateModal && selectedAdresse && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Associer un compteur</h3>
            <p className="text-xs text-slate-500 mb-4">
              Adresse : <span className="text-slate-300">{selectedAdresse.libelle_complet}</span>
            </p>
            <form onSubmit={handleSubmitAssociate} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1" htmlFor="assoc-numero_serie">
                  Numéro de série (optionnel, 9 chiffres)
                </label>
                <input
                  id="assoc-numero_serie"
                  name="numero_serie"
                  type="text"
                  maxLength={9}
                  value={associateForm.numero_serie}
                  onChange={handleAssociateInputChange}
                  placeholder="000000001"
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1" htmlFor="assoc-type">
                  Type
                </label>
                <select
                  id="assoc-type"
                  name="type"
                  required
                  value={associateForm.type}
                  onChange={handleAssociateInputChange}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="EAU">EAU</option>
                  <option value="ELECTRICITE">ELECTRICITE</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1" htmlFor="assoc-id_client">
                  Client *
                </label>
                <select
                  id="assoc-id_client"
                  name="id_client"
                  required
                  value={associateForm.id_client}
                  onChange={handleAssociateInputChange}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={clients.length === 0}
                >
                  <option value="">
                    {clients.length === 0 ? 'Aucun client disponible' : 'Sélectionner un client'}
                  </option>
                  {clients.map((c) => (
                    <option key={c.id_client} value={c.id_client}>
                      {c.nom_complet}
                    </option>
                  ))}
                </select>
                {clients.length === 0 && (
                  <p className="text-xs text-rose-400 mt-1">
                    Aucun client trouvé. Veuillez d&apos;abord importer des clients via l&apos;intégration ERP.
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssociateModal(false);
                    setSelectedAdresse(null);
                  }}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3 py-2 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium disabled:opacity-60"
                >
                  {submitting ? 'Association...' : 'Associer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardAdresses;


