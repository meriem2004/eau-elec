const {
  Adresse,
  Quartier,
  Compteur
} = require('../models');

const listAdresses = async (req, res) => {
  try {
    const { hasCompteur } = req.query;

    const adresses = await Adresse.findAll({
      include: [
        {
          model: Quartier
        },
        {
          model: Compteur
        }
      ],
      order: [['id_adresse', 'ASC']]
    });

    let filtered = adresses;
    if (hasCompteur === 'true') {
      filtered = adresses.filter((a) => a.Compteurs && a.Compteurs.length > 0);
    } else if (hasCompteur === 'false') {
      filtered = adresses.filter((a) => !a.Compteurs || a.Compteurs.length === 0);
    }

    const payload = filtered.map((a) => ({
      id_adresse: a.id_adresse,
      ref_adresse_erp: a.ref_adresse_erp,
      libelle_complet: a.libelle_complet,
      quartier: a.Quartier
        ? {
            id_quartier: a.Quartier.id_quartier,
            libelle: a.Quartier.libelle,
            ville: a.Quartier.ville
          }
        : null,
      nb_compteurs: a.Compteurs ? a.Compteurs.length : 0
    }));

    return res.status(200).json(payload);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('AdresseController.listAdresses error:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération des adresses' });
  }
};

const createAdresse = async (req, res) => {
  try {
    const { libelle_complet, id_quartier, ref_adresse_erp } = req.body;

    if (!libelle_complet || !id_quartier) {
      return res
        .status(400)
        .json({ message: 'libelle_complet et id_quartier sont requis' });
    }

    const adresse = await Adresse.create({
      libelle_complet,
      id_quartier,
      ref_adresse_erp
    });

    return res.status(201).json(adresse);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('AdresseController.createAdresse error:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la création de l’adresse' });
  }
};

const updateAdresse = async (req, res) => {
  try {
    const { id } = req.params;
    const { libelle_complet, ref_adresse_erp } = req.body;

    const adresse = await Adresse.findByPk(id);
    if (!adresse) {
      return res.status(404).json({ message: 'Adresse introuvable' });
    }

    if (libelle_complet) {
      adresse.libelle_complet = libelle_complet;
    }
    if (ref_adresse_erp) {
      adresse.ref_adresse_erp = ref_adresse_erp;
    }

    await adresse.save();
    return res.status(200).json(adresse);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('AdresseController.updateAdresse error:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de l’adresse' });
  }
};

const deleteAdresse = async (req, res) => {
  try {
    const { id } = req.params;
    const adresse = await Adresse.findByPk(id);
    if (!adresse) {
      return res.status(404).json({ message: 'Adresse introuvable' });
    }

    await adresse.destroy();
    return res.status(204).send();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('AdresseController.deleteAdresse error:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la suppression de l’adresse' });
  }
};

module.exports = {
  listAdresses,
  createAdresse,
  updateAdresse,
  deleteAdresse
};


