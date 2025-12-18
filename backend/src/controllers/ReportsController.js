const { Op, fn, col, literal } = require('sequelize');
const { Releve, Compteur, Agent, Adresse, Quartier } = require('../models');

const getMonthlyReport = async (req, res) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);

    if (!year || !month) {
      return res.status(400).json({ message: 'year et month sont requis' });
    }

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    // Calculer le nombre de jours dans le mois
    const daysInMonth = new Date(year, month, 0).getDate();

    // Relevés joints pour statistiques détaillées
    const relevés = await Releve.findAll({
      where: {
        date_releve: {
          [Op.gte]: start,
          [Op.lt]: end
        }
      },
      include: [
        {
          model: Compteur,
          include: [
            {
              model: Adresse,
              include: [Quartier]
            }
          ]
        },
        {
          model: Agent
        }
      ]
    });

    // Agrégation par agent et par type
    const perAgent = {};
    const perQuartier = {};
    const perType = { EAU: { nbReleves: 0, totalConsommation: 0 }, ELECTRICITE: { nbReleves: 0, totalConsommation: 0 } };

    relevés.forEach((r) => {
      const agentKey = r.Agent ? r.Agent.id_agent : null;
      const q = r.Compteur?.Adresse?.Quartier;
      const quartierKey = q ? q.id_quartier : null;
      const cons = r.consommation || 0;
      const type = r.Compteur?.type || 'UNKNOWN';

      // Par type
      if (type === 'EAU' || type === 'ELECTRICITE') {
        perType[type].nbReleves += 1;
        perType[type].totalConsommation += cons;
      }

      if (agentKey) {
        if (!perAgent[agentKey]) {
          perAgent[agentKey] = {
            id_agent: r.Agent.id_agent,
            nom: r.Agent.nom,
            prenom: r.Agent.prenom,
            nbReleves: 0,
            totalConsommation: 0,
            parType: { EAU: { nbReleves: 0, totalConsommation: 0 }, ELECTRICITE: { nbReleves: 0, totalConsommation: 0 } },
            parQuartier: {}
          };
        }
        perAgent[agentKey].nbReleves += 1;
        perAgent[agentKey].totalConsommation += cons;
        if (type === 'EAU' || type === 'ELECTRICITE') {
          perAgent[agentKey].parType[type].nbReleves += 1;
          perAgent[agentKey].parType[type].totalConsommation += cons;
        }
        // Compter par quartier pour cet agent
        if (quartierKey) {
          if (!perAgent[agentKey].parQuartier[quartierKey]) {
            perAgent[agentKey].parQuartier[quartierKey] = {
              id_quartier: q.id_quartier,
              libelle: q.libelle,
              nbReleves: 0
            };
          }
          perAgent[agentKey].parQuartier[quartierKey].nbReleves += 1;
        }
      }

      if (quartierKey) {
        if (!perQuartier[quartierKey]) {
          perQuartier[quartierKey] = {
            id_quartier: q.id_quartier,
            libelle: q.libelle,
            ville: q.ville,
            nbReleves: 0,
            totalConsommation: 0,
            parType: { EAU: { nbReleves: 0, totalConsommation: 0 }, ELECTRICITE: { nbReleves: 0, totalConsommation: 0 } }
          };
        }
        perQuartier[quartierKey].nbReleves += 1;
        perQuartier[quartierKey].totalConsommation += cons;
        if (type === 'EAU' || type === 'ELECTRICITE') {
          perQuartier[quartierKey].parType[type].nbReleves += 1;
          perQuartier[quartierKey].parType[type].totalConsommation += cons;
        }
      }
    });

    // Calculer le nombre moyen de relevés par agent par jour par quartier
    const agentsWithAverages = Object.values(perAgent).map((agent) => {
      const quartiersWithAvg = Object.values(agent.parQuartier || {}).map((q) => ({
        ...q,
        moyenneRelevesParJour: daysInMonth > 0 ? Number((q.nbReleves / daysInMonth).toFixed(2)) : 0
      }));
      return {
        ...agent,
        moyenneRelevesParJour: daysInMonth > 0 ? Number((agent.nbReleves / daysInMonth).toFixed(2)) : 0,
        parQuartier: quartiersWithAvg
      };
    });

    return res.status(200).json({
      periode: { year, month },
      joursDansMois: daysInMonth,
      totalReleves: relevés.length,
      parType: perType,
      parAgent: agentsWithAverages,
      parQuartier: Object.values(perQuartier)
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('ReportsController.getMonthlyReport error:', error);
    return res.status(500).json({ message: 'Erreur serveur lors du rapport mensuel' });
  }
};

const getYearlyComparison = async (req, res) => {
  try {
    const year = Number(req.query.year);
    if (!year) {
      return res.status(400).json({ message: 'year est requis' });
    }

    const startCurrent = new Date(year, 0, 1);
    const endCurrent = new Date(year + 1, 0, 1);
    const startPrev = new Date(year - 1, 0, 1);
    const endPrev = new Date(year, 0, 1);

    const aggregate = async (start, end) => {
      const rows = await Releve.findAll({
        attributes: [
          [fn('MONTH', col('date_releve')), 'mois'],
          [fn('SUM', col('consommation')), 'totalConsommation']
        ],
        where: {
          date_releve: {
            [Op.gte]: start,
            [Op.lt]: end
          }
        },
        include: [
          {
            model: Compteur,
            attributes: ['type'],
            required: true
          }
        ],
        group: ['mois', 'Compteur.type'],
        order: [[literal('mois'), 'ASC'], ['Compteur.type', 'ASC']]
      });

      // Organiser par mois et par type
      const byMonth = {};
      rows.forEach((r) => {
        const mois = r.get('mois');
        const type = r.Compteur?.type || 'UNKNOWN';
        if (!byMonth[mois]) {
          byMonth[mois] = {
            mois,
            EAU: 0,
            ELECTRICITE: 0,
            total: 0
          };
        }
        const cons = Number(r.get('totalConsommation') || 0);
        if (type === 'EAU' || type === 'ELECTRICITE') {
          byMonth[mois][type] = cons;
        }
        byMonth[mois].total += cons;
      });

      return Object.values(byMonth).sort((a, b) => a.mois - b.mois);
    };

    const current = await aggregate(startCurrent, endCurrent);
    const previous = await aggregate(startPrev, endPrev);

    return res.status(200).json({
      year,
      current,
      previous
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('ReportsController.getYearlyComparison error:', error);
    return res.status(500).json({ message: 'Erreur serveur lors du rapport annuel comparatif' });
  }
};

// Génération PDF Moderne avec Design Premium et Fallback Mock Data
const getMonthlyReportPdf = async (req, res) => {
  const PDFDocument = require('pdfkit');

  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = Number(req.query.month) || (new Date().getMonth() + 1);

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    // 1. Récupération des données réelles
    let relevés = await Releve.findAll({
      where: {
        date_releve: { [Op.gte]: start, [Op.lt]: end }
      },
      include: [
        { model: Compteur, include: [{ model: Adresse, include: [Quartier] }] },
        { model: Agent }
      ]
    });

    // 2. FALLBACK MOCK DATA (Si vide, pour la démo "Beautiful PDF")
    let isMock = false;
    if (relevés.length === 0) {
      isMock = true;
      // Génération de fausses données pour le rendu
      const mockAgents = [
        { id: 1, nom: 'BENALI', prenom: 'Ahmed' },
        { id: 2, nom: 'IDRISSI', prenom: 'Karim' },
        { id: 3, nom: 'ALAMI', prenom: 'Sara' },
        { id: 4, nom: 'CHRAIBI', prenom: 'Moncef' }
      ];
      const mockQuartiers = [
        { id: 1, libelle: 'Agdal', ville: 'Rabat' },
        { id: 2, libelle: 'Hay Riad', ville: 'Rabat' },
        { id: 3, libelle: 'Ocean', ville: 'Rabat' },
        { id: 4, libelle: 'Takaddoum', ville: 'Rabat' }
      ];

      // Simuler 50 relevés agrégés
      relevés = []; // On ne remplit pas le tableau brut mais on préparera les stats directement
    }

    // 3. Préparation des statistiques
    let stats = {
      total: 0,
      eau: { count: 0, cons: 0 },
      elec: { count: 0, cons: 0 },
      agents: {},
      quartiers: {}
    };

    if (isMock) {
      stats.total = 12450;
      stats.eau = { count: 7200, cons: 45000 };
      stats.elec = { count: 5250, cons: 32000 };

      const mockAgents = ['BENALI Ahmed', 'IDRISSI Karim', 'ALAMI Sara', 'CHRAIBI Moncef'];
      mockAgents.forEach(nom => {
        stats.agents[nom] = {
          name: nom,
          count: Math.floor(Math.random() * 3000) + 1000,
          cons: Math.floor(Math.random() * 15000) + 5000
        };
      });

      const mockQuartiers = ['Agdal', 'Hay Riad', 'Ocean', 'Takaddoum'];
      mockQuartiers.forEach(nom => {
        stats.quartiers[nom] = {
          name: nom,
          ville: 'Rabat',
          count: Math.floor(Math.random() * 3000) + 1000,
          cons: Math.floor(Math.random() * 15000) + 5000
        };
      });

    } else {
      stats.total = relevés.length;
      relevés.forEach(r => {
        const type = r.Compteur?.type;
        const cons = r.consommation || 0;

        if (type === 'EAU') { stats.eau.count++; stats.eau.cons += cons; }
        if (type === 'ELECTRICITE') { stats.elec.count++; stats.elec.cons += cons; }

        if (r.Agent) {
          const nom = `${r.Agent.nom} ${r.Agent.prenom}`;
          if (!stats.agents[nom]) stats.agents[nom] = { name: nom, count: 0, cons: 0 };
          stats.agents[nom].count++;
          stats.agents[nom].cons += cons;
        }

        const q = r.Compteur?.Adresse?.Quartier;
        if (q) {
          const nom = q.libelle;
          if (!stats.quartiers[nom]) stats.quartiers[nom] = { name: nom, ville: q.ville, count: 0, cons: 0 };
          stats.quartiers[nom].count++;
          stats.quartiers[nom].cons += cons;
        }
      });
    }

    // 4. Dessin du PDF
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="rapport_ree_${month}_${year}.pdf"`);
    doc.pipe(res);

    // --- HEADER ---
    doc.rect(0, 0, 612, 120).fill('#0f172a'); // Background header

    // Logo Text (Left)
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#38bdf8').text('RABAT', 50, 45);
    doc.fontSize(24).font('Helvetica').fillColor('#ffffff').text('ENERGIE & EAU', 140, 45);

    // Date/Report Info (Right)
    doc.fontSize(10).fillColor('#94a3b8').text(`RAPPORT MENSUEL`, 400, 45, { align: 'right' });
    doc.fontSize(16).fillColor('#ffffff').text(`${month}/${year}`, 400, 60, { align: 'right' });

    // --- KPI CARDS ---
    const drawCard = (x, title, value, sub, color) => {
      doc.roundedRect(x, 150, 150, 80, 5).fillOpacity(0.1).fill(color);
      doc.rect(x, 150, 150, 80).strokeOpacity(0.2).stroke(color);
      doc.fillOpacity(1);

      doc.fontSize(10).fillColor('#64748b').text(title, x + 15, 165);
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#0f172a').text(value, x + 15, 185);
      doc.fontSize(8).font('Helvetica').fillColor(color).text(sub, x + 15, 210);
    };

    drawCard(50, 'TOTAL RELEVÉS', stats.total.toLocaleString(), isMock ? 'Données Simulé' : 'Données Réelles', '#3b82f6');
    drawCard(220, 'EAU (m³)', stats.eau.cons.toLocaleString(), `${stats.eau.count} Compteurs`, '#06b6d4');
    drawCard(390, 'ELECTRICITÉ (kWh)', stats.elec.cons.toLocaleString(), `${stats.elec.count} Compteurs`, '#f59e0b');

    doc.moveDown(8);

    // --- TABLE: PERFORMANCE AGENTS ---
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#0f172a').text('Performance des Agents', 50, 260);

    let y = 290;
    // Header Row
    doc.rect(50, y, 510, 30).fill('#f1f5f9');
    doc.fontSize(10).fillColor('#475569').text('AGENT', 65, y + 10);
    doc.text('RELEVÉS', 250, y + 10);
    doc.text('CONSOMMATION TOTALE', 400, y + 10);

    y += 35;
    Object.values(stats.agents).forEach((agent, i) => {
      if (i % 2 === 0) doc.rect(50, y - 5, 510, 25).fillOpacity(0.5).fill('#f8fafc');
      doc.fillOpacity(1);

      doc.fontSize(10).font('Helvetica').fillColor('#1e293b').text(agent.name, 65, y);
      doc.text(agent.count.toLocaleString(), 250, y);
      doc.text(agent.cons.toLocaleString(), 400, y);

      y += 25;
    });

    // --- TABLE: QUARTIERS ---
    y += 40;
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#0f172a').text('Répartition par Quartier', 50, y);
    y += 30;

    // Header Row
    doc.rect(50, y, 510, 30).fill('#f1f5f9');
    doc.fontSize(10).fillColor('#475569').text('QUARTIER', 65, y + 10);
    doc.text('RELEVÉS', 250, y + 10);
    doc.text('VOLUME DISTRIBUÉ', 400, y + 10);

    y += 35;
    Object.values(stats.quartiers).forEach((q, i) => {
      if (i % 2 === 0) doc.rect(50, y - 5, 510, 25).fillOpacity(0.5).fill('#f8fafc');
      doc.fillOpacity(1);

      doc.fontSize(10).font('Helvetica').fillColor('#1e293b').text(`${q.name} (${q.ville})`, 65, y);
      doc.text(q.count.toLocaleString(), 250, y);
      doc.text(q.cons.toLocaleString(), 400, y);
      y += 25;
    });

    // --- FOOTER ---
    doc.fontSize(8).fillColor('#cbd5e1').text(`Généré par SI-Relevés le ${new Date().toLocaleDateString()}`, 50, 700, { align: 'center' });

    doc.end();
    return null;
  } catch (error) {
    console.error('ReportsController.getMonthlyReportPdf error:', error);
    return res.status(500).json({ message: 'Erreur génération PDF' });
  }
};

// Fonction pour calculer la tendance (régression linéaire simple)
function calculateTrend(data) {
  if (!data || data.length < 2) {
    return { slope: 0, intercept: 0, trend: 'stable' };
  }

  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  data.forEach((point, index) => {
    const x = index + 1;
    const y = point.totalConsommation || point.total || 0;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  let trend = 'stable';
  if (slope > 0.1) trend = 'increasing';
  else if (slope < -0.1) trend = 'decreasing';

  return { slope, intercept, trend };
}

// Endpoint pour obtenir les tendances
const getTrends = async (req, res) => {
  try {
    const { year, months = 6 } = req.query;
    const numMonths = Number(months);
    const targetYear = Number(year) || new Date().getFullYear();

    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear + 1, 0, 1);

    // Récupérer les données mensuelles
    const rows = await Releve.findAll({
      attributes: [
        [fn('MONTH', col('date_releve')), 'mois'],
        [fn('SUM', col('consommation')), 'totalConsommation']
      ],
      where: {
        date_releve: {
          [Op.gte]: startDate,
          [Op.lt]: endDate
        }
      },
      include: [
        {
          model: Compteur,
          attributes: ['type'],
          required: true
        }
      ],
      group: ['mois', 'Compteur.type'],
      order: [[literal('mois'), 'ASC'], ['Compteur.type', 'ASC']]
    });

    // Organiser par mois et type
    const monthlyData = {};
    rows.forEach((r) => {
      const mois = r.get('mois');
      const type = r.Compteur?.type || 'UNKNOWN';
      if (!monthlyData[mois]) {
        monthlyData[mois] = { mois, EAU: 0, ELECTRICITE: 0, total: 0 };
      }
      const cons = Number(r.get('totalConsommation') || 0);
      if (type === 'EAU' || type === 'ELECTRICITE') {
        monthlyData[mois][type] = cons;
      }
      monthlyData[mois].total += cons;
    });

    const sortedData = Object.values(monthlyData)
      .sort((a, b) => a.mois - b.mois)
      .slice(-numMonths);

    // Calculer les tendances
    const trendTotal = calculateTrend(sortedData.map((d) => ({ total: d.total })));
    const trendEau = calculateTrend(sortedData.map((d) => ({ totalConsommation: d.EAU })));
    const trendElectricite = calculateTrend(sortedData.map((d) => ({ totalConsommation: d.ELECTRICITE })));

    return res.status(200).json({
      periode: { year: targetYear, months: numMonths },
      donnees: sortedData,
      tendances: {
        total: trendTotal,
        EAU: trendEau,
        ELECTRICITE: trendElectricite
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('ReportsController.getTrends error:', error);
    return res.status(500).json({ message: 'Erreur serveur lors du calcul des tendances' });
  }
};

module.exports = {
  getMonthlyReport,
  getYearlyComparison,
  getMonthlyReportPdf,
  getTrends,
  calculateTrend
};


