const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const faker = require('faker');
const { sequelize, User, Quartier, Agent, Client, Adresse, Compteur, Releve } = require('./models');

dotenv.config();

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  const userCount = await User.count();
  if (userCount > 0) {
    console.log('La base semble déjà peuplée, abandon du seeding.');
    return;
  }

  console.log('Seeding de la base SI Relevés...');

    // 1 Superadmin
    const adminPasswordPlain = 'password123';
    const adminPasswordHashed = await bcrypt.hash(adminPasswordPlain, 10);
    const superadmin = await User.create({
      nom: 'ADMIN',
      prenom: 'Super',
      email: 'admin@ree.ma',
      password: adminPasswordHashed,
      role: 'SUPERADMIN'
    });
    console.log('Superadmin créé:', superadmin.email, '/', adminPasswordPlain);

    // 5 Quartiers
    const quartiersLibelles = ['Agdal', 'Hay Riad', 'Hassan', 'Yacoub El Mansour', 'Souissi'];
    const quartiers = [];
    for (const libelle of quartiersLibelles) {
      const q = await Quartier.create({ libelle, ville: 'Rabat' });
      quartiers.push(q);
    }

    // Utilitaire simple pour limiter la longueur des numéros de téléphone
    const genPhone = () => faker.phone.phoneNumber().slice(0, 20);

    // 20 Agents
    const agents = [];
    for (let i = 0; i < 20; i += 1) {
      const q = quartiers[Math.floor(Math.random() * quartiers.length)];
      const agent = await Agent.create({
        matricule_rh: `RH${String(i + 1).padStart(4, '0')}`,
        nom: faker.name.lastName().toUpperCase(),
        prenom: faker.name.firstName(),
        tel_pro: genPhone(),
        tel_perso: genPhone(),
        id_quartier: q.id_quartier
      });
      agents.push(agent);
    }

    // 100 Clients & Adresses
    const clients = [];
    const adresses = [];
    for (let i = 0; i < 100; i += 1) {
      const client = await Client.create({
        ref_client_erp: `CL${String(i + 1).padStart(5, '0')}`,
        nom_complet: `${faker.name.lastName().toUpperCase()} ${faker.name.firstName()}`
      });
      clients.push(client);

      const q = quartiers[Math.floor(Math.random() * quartiers.length)];
      const adresse = await Adresse.create({
        ref_adresse_erp: `AD${String(i + 1).padStart(5, '0')}`,
        libelle_complet: faker.address.streetAddress(),
        id_quartier: q.id_quartier
      });
      adresses.push(adresse);
    }

    // 200 Compteurs (Mix Eau / Electricité)
    const compteurs = [];
    for (let i = 0; i < 200; i += 1) {
      const client = clients[Math.floor(Math.random() * clients.length)];
      const adresse = adresses[Math.floor(Math.random() * adresses.length)];
      const type = Math.random() < 0.5 ? 'EAU' : 'ELECTRICITE';
      const numero_serie = String(i + 1).padStart(9, '0');

      const compteur = await Compteur.create({
        numero_serie,
        type,
        index_actuel: 0,
        id_adresse: adresse.id_adresse,
        id_client: client.id_client
      });
      compteurs.push(compteur);
    }

    // 500 Relevés historiques sur les 3 derniers mois
    const now = new Date();
    const troisMoisAvant = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());

    // Pour garder un index cohérent par compteur
    const indexMap = new Map();

    for (let i = 0; i < 500; i += 1) {
      const compteur = compteurs[Math.floor(Math.random() * compteurs.length)];
      const agent = agents[Math.floor(Math.random() * agents.length)];

      const lastIndex = indexMap.get(compteur.numero_serie) || 0;
      const increment = Math.floor(Math.random() * 41) + 10; // 10 à 50
      const nouvel_index = lastIndex + increment;

      const randomTimestamp =
        troisMoisAvant.getTime() +
        Math.random() * (now.getTime() - troisMoisAvant.getTime());
      const date_releve = new Date(randomTimestamp);

      await Releve.create({
        date_releve,
        ancien_index: lastIndex,
        nouvel_index,
        consommation: increment,
        numero_serie: compteur.numero_serie,
        id_agent: agent.id_agent
      });

      indexMap.set(compteur.numero_serie, nouvel_index);
    }

    // Mettre à jour index_actuel des compteurs
    for (const compteur of compteurs) {
      const lastIndex = indexMap.get(compteur.numero_serie) || 0;
      compteur.index_actuel = lastIndex;
      await compteur.save();
    }

  console.log('Seeding terminé avec succès.');
}

module.exports = {
  seed
};

// Exécution directe via `node src/seed.js`
if (require.main === module) {
  seed()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erreur lors du seeding:', error);
      process.exit(1);
    });
}
