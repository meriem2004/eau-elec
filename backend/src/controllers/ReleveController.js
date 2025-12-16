const { Op } = require('sequelize');
const {
  Compteur, Releve, Adresse, Quartier, Agent
} = require('../models');

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

    // Simulation appel ERP Facturation via endpoint mock
    try {
      const http = require('http');
      const apiUrl = process.env.API_URL || 'http://localhost:3000';
      const url = new URL(`${apiUrl}/api/mock/facturation/consommations`);
      
      const postData = JSON.stringify({
        numero_serie,
        consommation,
        date_releve: releve.date_releve,
        id_client: compteur.id_client
      });

      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          Authorization: req.headers.authorization || ''
        }
      };

      await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve();
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${data}`));
            }
          });
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
      });
    } catch (factError) {
      // Ne pas faire échouer la création du relevé si l'appel mock échoue
      // eslint-disable-next-line no-console
      console.warn('Erreur lors de l\'appel mock facturation (non bloquant):', factError.message);
    }

    return res.status(201).json(releve);
  } catch (error) {
    console.error('ReleveController.createReleve error:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la création du relevé' });
  }
};

const listReleves = async (req, res) => {
  try {
    const { dateFrom, dateTo, quartier } = req.query;

    const where = {};

    if (dateFrom || dateTo) {
      where.date_releve = {};
      if (dateFrom) {
        where.date_releve[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        where.date_releve[Op.lte] = new Date(dateTo);
      }
    }

    const quartierFilter = quartier && quartier !== 'ALL'
      ? { libelle: quartier }
      : {};

    const releves = await Releve.findAll({
      where,
      include: [
        {
          model: Compteur,
          include: [
            {
              model: Adresse,
              include: [
                {
                  model: Quartier,
                  where: quartierFilter
                }
              ]
            }
          ]
        },
        {
          model: Agent
        }
      ],
      order: [['date_releve', 'DESC']],
      limit: 500
    });

    const payload = releves.map((r) => ({
      id_releve: r.id_releve,
      date_releve: r.date_releve,
      ancien_index: r.ancien_index,
      nouvel_index: r.nouvel_index,
      consommation: r.consommation,
      numero_serie: r.Compteur?.numero_serie,
      type_compteur: r.Compteur?.type,
      quartier: r.Compteur?.Adresse?.Quartier?.libelle,
      agent: r.Agent
        ? {
            id_agent: r.Agent.id_agent,
            nom: r.Agent.nom,
            prenom: r.Agent.prenom
          }
        : null
    }));

    return res.status(200).json(payload);
  } catch (error) {
    console.error('ReleveController.listReleves error:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération des relevés' });
  }
};

module.exports = {
  createReleve,
  listReleves
};


