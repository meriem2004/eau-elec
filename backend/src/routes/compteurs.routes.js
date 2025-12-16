const express = require('express');
const CompteurController = require('../controllers/CompteurController');
const { verifyToken } = require('../middlewares/authJwt');

const router = express.Router();

router.get('/', verifyToken, CompteurController.listCompteurs);
router.post('/', verifyToken, CompteurController.createCompteur);
router.patch('/:numero_serie', verifyToken, CompteurController.updateCompteur);
router.delete('/:numero_serie', verifyToken, CompteurController.deleteCompteur);

module.exports = router;


