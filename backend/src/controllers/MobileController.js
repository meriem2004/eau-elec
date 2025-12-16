const { Op } = require('sequelize');
const { Agent, Quartier, Adresse, Compteur, Releve, Client } = require('../models');

// Liste des adresses/compteurs non relevés pour un agent (pour l'app mobile)
const getTournees = async (req, res) => {
  try {
    const { agentId } = req.query;

    if (!agentId) {
      return res.status(400).json({ message: 'agentId est requis' });
    }

    const agent = await Agent.findByPk(agentId, { include: [Quartier] });
    if (!agent || !agent.id_quartier) {
      return res.status(404).json({ message: 'Agent introuvable ou non affecté à un quartier' });
    }

    // Récupérer tous les compteurs du quartier de l'agent
    const compteurs = await Compteur.findAll({
      include: [
        {
          model: Adresse,
          where: { id_quartier: agent.id_quartier },
          include: [Quartier],
          required: true
        },
        {
          model: Client,
          required: false
        },
        {
          model: Releve,
          required: false,
          where: {
            date_releve: {
              [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }
      ]
    });

    // Filtrer pour ne garder que ceux non relevés ce mois
    const nonReleves = compteurs.filter((c) => !c.Releves || c.Releves.length === 0);

    const payload = nonReleves.map((c) => ({
      numero_serie: c.numero_serie,
      type: c.type,
      index_actuel: c.index_actuel,
      adresse: {
        id_adresse: c.Adresse.id_adresse,
        libelle_complet: c.Adresse.libelle_complet,
        quartier: c.Adresse.Quartier ? c.Adresse.Quartier.libelle : null
      },
      client: c.Client
        ? {
            id_client: c.Client.id_client,
            nom_complet: c.Client.nom_complet
          }
        : null
    }));

    return res.status(200).json({
      agent: {
        id_agent: agent.id_agent,
        nom: agent.nom,
        prenom: agent.prenom,
        quartier: agent.Quartier ? agent.Quartier.libelle : null
      },
      compteurs: payload
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('MobileController.getTournees error:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération des tournées' });
  }
};

// Wrapper pour création de relevé depuis l'app mobile
const createReleveMobile = async (req, res) => {
  try {
    const { numero_serie, nouvel_index, id_agent } = req.body;

    if (!numero_serie || nouvel_index === undefined || !id_agent) {
      return res.status(400).json({ message: 'numero_serie, nouvel_index et id_agent sont requis' });
    }

    const compteur = await Compteur.findByPk(numero_serie);
    if (!compteur) {
      return res.status(404).json({ message: 'Compteur introuvable' });
    }

    const ancien_index = compteur.index_actuel || 0;

    if (Number(nouvel_index) < Number(ancien_index)) {
      return res.status(400).json({ message: 'nouvel_index doit être supérieur ou égal à ancien_index' });
    }

    const consommation = Number(nouvel_index) - Number(ancien_index);

    const releve = await Releve.create({
      date_releve: new Date(),
      ancien_index,
      nouvel_index,
      consommation,
      numero_serie,
      id_agent
    });

    compteur.index_actuel = nouvel_index;
    await compteur.save();

    return res.status(201).json({
      success: true,
      releve: {
        id_releve: releve.id_releve,
        date_releve: releve.date_releve,
        consommation
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('MobileController.createReleveMobile error:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la création du relevé' });
  }
};

module.exports = {
  getTournees,
  createReleveMobile
};

