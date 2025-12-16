/* eslint-disable no-console */
/**
 * Script de simulation de trafic :
 * - Se connecte avec l'admin seedé (admin@ree.ma / password123)
 * - Tire un compteur et un agent au hasard
 * - Envoie un relevé simulé vers l'API toutes les 10 secondes
 *
 * Usage :
 *   node scripts/simulateTraffic.js
 *
 * Variables d'environnement (optionnelles) :
 *   SIM_API_URL  -> URL de l'API (défaut: http://localhost:3000/api)
 *   SIM_EMAIL    -> Email pour login (défaut: admin@ree.ma)
 *   SIM_PASSWORD -> Mot de passe pour login (défaut: password123)
 */

require('dotenv').config();
const { sequelize, Compteur, Agent } = require('../src/models');

const API_URL = process.env.SIM_API_URL || 'http://localhost:3000/api';
const SIM_EMAIL = process.env.SIM_EMAIL || 'admin@ree.ma';
const SIM_PASSWORD = process.env.SIM_PASSWORD || 'password123';
const INTERVAL_MS = Number(process.env.SIM_INTERVAL_MS || 10000);

async function login(maxRetries = 10, delayMs = 5000) {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      // eslint-disable-next-line no-console
      console.log(`🔐 Tentative de login à ${API_URL} (essai ${attempt + 1}/${maxRetries})...`);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: SIM_EMAIL, password: SIM_PASSWORD })
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Login failed (${res.status}): ${msg}`);
      }

      const data = await res.json();
      return data.token;
    } catch (err) {
      attempt += 1;
      if (attempt >= maxRetries) {
        throw err;
      }
      // eslint-disable-next-line no-console
      console.warn(`⚠️  Login échoué, nouvelle tentative dans ${delayMs / 1000}s...`, err.message);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function pickRandom(model) {
  const count = await model.count();
  if (count === 0) throw new Error(`No records found for ${model.name}`);
  const offset = Math.floor(Math.random() * count);
  const record = await model.findOne({ offset });
  return record;
}

async function simulateOnce(token) {
  const compteur = await pickRandom(Compteur);
  const agent = await pickRandom(Agent);

  const increment = Math.floor(Math.random() * 41) + 10; // 10 à 50
  const nouvel_index = Number(compteur.index_actuel || 0) + increment;

  const payload = {
    numero_serie: compteur.numero_serie,
    nouvel_index,
    id_agent: agent.id_agent
  };

  const res = await fetch(`${API_URL}/releves`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`POST /releves failed (${res.status}): ${msg}`);
  }

  const data = await res.json();
  console.log(`✅ Relevé simulé => Compteur ${payload.numero_serie}, +${increment} u, Agent #${payload.id_agent}`);
  return data;
}

async function waitForDatabase(maxRetries = 20, retryDelayMs = 5000) {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    attempt += 1;
    try {
      console.log(`⏳ simulateTraffic: tentative connexion DB (${attempt}/${maxRetries})...`);
      // eslint-disable-next-line no-await-in-loop
      await sequelize.authenticate();
      console.log('✅ simulateTraffic: connexion DB OK.');
      return;
    } catch (err) {
      if (attempt >= maxRetries) {
        throw err;
      }
      console.warn(
        `⚠️  simulateTraffic: connexion DB échouée (${attempt}/${maxRetries}), nouvelle tentative dans ${retryDelayMs / 1000}s...`,
        err.message
      );
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
}

async function main() {
  console.log('🔄 Démarrage de la simulation de trafic...');

  await waitForDatabase();

  const token = await login();
  console.log('✅ Authentifié pour la simulation.');

  await simulateOnce(token); // premier tir

  setInterval(async () => {
    try {
      await simulateOnce(token);
    } catch (err) {
      console.error('⚠️  Erreur durant la simulation:', err.message);
    }
  }, INTERVAL_MS);
}

main().catch((err) => {
  console.error('❌ Simulation stoppée:', err);
  process.exit(1);
});


