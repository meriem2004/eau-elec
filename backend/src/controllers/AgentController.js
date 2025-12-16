const {
  Agent,
  Quartier,
  Adresse
} = require('../models');

const listAgents = async (req, res) => {
  try {
    const agents = await Agent.findAll({
      include: [Quartier],
      order: [['id_agent', 'ASC']]
    });

    // Calcul simple de la "charge" par quartier : nombre d'adresses dans le quartier
    const adressesParQuartier = await Adresse.findAll({
      attributes: ['id_quartier']
    });
    const chargeMap = adressesParQuartier.reduce((acc, a) => {
      const key = a.id_quartier;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    // Compter les agents par quartier pour les recommandations
    const agentsParQuartier = {};
    agents.forEach((a) => {
      if (a.Quartier) {
        const qId = a.Quartier.id_quartier;
        agentsParQuartier[qId] = (agentsParQuartier[qId] || 0) + 1;
      }
    });

    const payload = agents.map((a) => {
      const chargeEstimee = a.Quartier ? chargeMap[a.Quartier.id_quartier] || 0 : 0;
      const agentsDansQuartier = a.Quartier ? agentsParQuartier[a.Quartier.id_quartier] || 0 : 0;
      const AGENTS_PAR_ADRESSES = 300;
      const agentsRecommandes = chargeEstimee > 0 ? Math.ceil(chargeEstimee / AGENTS_PAR_ADRESSES) : 0;
      
      return {
        id_agent: a.id_agent,
        matricule_rh: a.matricule_rh,
        nom: a.nom,
        prenom: a.prenom,
        quartier: a.Quartier
          ? {
              id_quartier: a.Quartier.id_quartier,
              libelle: a.Quartier.libelle,
              ville: a.Quartier.ville
            }
          : null,
        charge_estimee: chargeEstimee,
        agents_recommandes: agentsRecommandes,
        agents_actuels: agentsDansQuartier,
        ratio_optimal: agentsDansQuartier > 0 && chargeEstimee > 0 ? Math.round(chargeEstimee / agentsDansQuartier) : null
      };
    });

    return res.status(200).json(payload);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('AgentController.listAgents error:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération des agents' });
  }
};

const updateAffectation = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_quartier } = req.body;

    if (!id_quartier) {
      return res.status(400).json({ message: 'id_quartier est requis' });
    }

    const agent = await Agent.findByPk(id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent introuvable' });
    }

    // Compter le nombre d'adresses dans le quartier
    const nbAdresses = await Adresse.count({
      where: { id_quartier }
    });

    // Compter le nombre d'agents déjà affectés à ce quartier (y compris celui qu'on modifie)
    const agentsDansQuartier = await Agent.count({
      where: { id_quartier }
    });

    // Calculer le nombre d'agents recommandés (1 agent pour 300 adresses)
    const AGENTS_PAR_ADRESSES = 300;
    const agentsRecommandes = Math.ceil(nbAdresses / AGENTS_PAR_ADRESSES);
    const agentsActuels = agentsDansQuartier + (agent.id_quartier === id_quartier ? 0 : 1);

    // Mettre à jour l'affectation
    agent.id_quartier = id_quartier;
    await agent.save();

    // Préparer la réponse avec recommandations
    const response = {
      message: 'Affectation mise à jour avec succès',
      quartier: {
        id_quartier,
        nbAdresses
      },
      agents: {
        actuels: agentsActuels,
        recommandes: agentsRecommandes
      },
      recommandation: null
    };

    // Générer une recommandation si nécessaire
    if (agentsActuels < agentsRecommandes) {
      const agentsManquants = agentsRecommandes - agentsActuels;
      response.recommandation = {
        niveau: 'warning',
        message: `Ce quartier compte ${nbAdresses} adresses. Recommandation : ${agentsRecommandes} agent(s) pour une charge optimale (1 agent pour 300 adresses). ${agentsManquants} agent(s) supplémentaire(s) recommandé(s).`
      };
    } else if (agentsActuels > agentsRecommandes * 1.5) {
      response.recommandation = {
        niveau: 'info',
        message: `Ce quartier compte ${nbAdresses} adresses avec ${agentsActuels} agent(s). La charge est bien répartie.`
      };
    } else {
      response.recommandation = {
        niveau: 'success',
        message: `Affectation optimale : ${agentsActuels} agent(s) pour ${nbAdresses} adresses (ratio: ${Math.round(nbAdresses / agentsActuels)} adresses/agent).`
      };
    }

    return res.status(200).json(response);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('AgentController.updateAffectation error:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de l\'affectation' });
  }
};

module.exports = {
  listAgents,
  updateAffectation
};


