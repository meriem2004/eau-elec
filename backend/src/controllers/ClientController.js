const { Client } = require('../models');

const listClients = async (req, res) => {
  try {
    const clients = await Client.findAll({
      order: [['nom_complet', 'ASC']]
    });

    // eslint-disable-next-line no-console
    console.log(`[ClientController] ${clients.length} clients trouvés`);

    const payload = clients.map((c) => ({
      id_client: c.id_client,
      ref_client_erp: c.ref_client_erp,
      nom_complet: c.nom_complet
    }));

    return res.status(200).json(payload);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('ClientController.listClients error:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération des clients' });
  }
};

module.exports = {
  listClients
};

