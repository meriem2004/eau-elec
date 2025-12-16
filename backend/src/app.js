const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { sequelize } = require('./config/database');
const { seed } = require('./seed');
const authRoutes = require('./routes/auth.routes');
const relevesRoutes = require('./routes/releves.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const adressesRoutes = require('./routes/adresses.routes');
const compteursRoutes = require('./routes/compteurs.routes');
const agentsRoutes = require('./routes/agents.routes');
const reportsRoutes = require('./routes/reports.routes');
const integrationRoutes = require('./routes/integration.routes');
const clientsRoutes = require('./routes/clients.routes');
const mobileRoutes = require('./routes/mobile.routes');
const mockRoutes = require('./routes/mock.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  return res.status(200).json({ status: 'ok', service: 'si-releves-backend' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/releves', relevesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/adresses', adressesRoutes);
app.use('/api/compteurs', compteursRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/integration', integrationRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/mobile', mobileRoutes);
app.use('/api/mock', mockRoutes);

// Start server after DB connection
const PORT = process.env.PORT || 3000;

async function waitForDatabase(maxRetries = 10, retryDelayMs = 5000) {
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt += 1;
    try {
      console.log(`⏳ Attempting database connection (attempt ${attempt}/${maxRetries})...`);
      await sequelize.authenticate();
      console.log('✅ Database connection established successfully.');
      return;
    } catch (error) {
      console.error(`⚠️ Database connection failed (attempt ${attempt}/${maxRetries}):`, error.message);

      // If we've exhausted all retries, rethrow to be handled by the caller
      if (attempt >= maxRetries) {
        throw error;
      }

      console.log(`🔁 Retrying in ${retryDelayMs / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
}

async function startServer() {
  try {
    await waitForDatabase();

    // In Phase 1 we can sync to validate mapping; migrations can replace this later
    await sequelize.sync({ alter: true });
    console.log('✅ Models synchronized with database.');

    // Optionnel : seeding automatique au démarrage (ex: en dev ou pour démos)
    if (process.env.SEED_ON_START === 'true') {
      console.log('🔄 SEED_ON_START=true détecté, exécution du script de seeding...');
      await seed();
    }

    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  startServer
};


