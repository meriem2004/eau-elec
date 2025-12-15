const { Compteur, Releve } = require('../models');

const createReleve = async (req, res) => {
  try {
    const { numero_serie, nouvel_index, id_agent } = req.body;

    if (!numero_serie || nouvel_index === undefined || !id_agent) {
      return res
        .status(400)
        .json({ message: 'numero_serie, nouvel_index et id_agent sont requis' });
    }

    const compteur = await Compteur.findByPk(numero_serie);
    if (!compteur) {
      return res.status(404).json({ message: 'Compteur introuvable' });
    }

    const ancien_index = compteur.index_actuel || 0;

    if (Number(nouvel_index) < Number(ancien_index)) {
      return res
        .status(400)
        .json({ message: 'nouvel_index doit être supérieur ou égal à ancien_index' });
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

    // Simulation appel ERP Facturation
    console.log('Simulation appel ERP...', {
      numero_serie,
      consommation
    });

    return res.status(201).json(releve);
  } catch (error) {
    console.error('ReleveController.createReleve error:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la création du relevé' });
  }
};

module.exports = {
  createReleve
};


