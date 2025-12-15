const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { sequelize } = require('./config/database');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  return res.status(200).json({ status: 'ok', service: 'si-releves-backend' });
});

// TODO: plug routes here (auth, agents, compteurs, relevés, dashboard, etc.)

// Start server after DB connection
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // In Phase 1 we can sync to validate mapping; migrations can replace this later
    await sequelize.sync({ alter: true });
    console.log('✅ Models synchronized with database.');

    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

startServer();


