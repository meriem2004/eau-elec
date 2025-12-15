const express = require('express');
const ReleveController = require('../controllers/ReleveController');
const { verifyToken } = require('../middlewares/authJwt');

const router = express.Router();

// Simulation mobile : création d'un relevé
router.post('/', verifyToken, ReleveController.createReleve);

module.exports = router;


