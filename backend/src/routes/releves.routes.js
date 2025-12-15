const express = require('express');
const ReleveController = require('../controllers/ReleveController');
const { verifyToken } = require('../middlewares/authJwt');

const router = express.Router();

// Simulation mobile : création d'un relevé
router.post('/', verifyToken, ReleveController.createReleve);

// Liste des relevés pour le backoffice (avec filtres simples)
router.get('/', verifyToken, ReleveController.listReleves);

module.exports = router;



