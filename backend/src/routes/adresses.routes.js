const express = require('express');
const AdresseController = require('../controllers/AdresseController');
const { verifyToken } = require('../middlewares/authJwt');

const router = express.Router();

router.get('/', verifyToken, AdresseController.listAdresses);
router.post('/', verifyToken, AdresseController.createAdresse);
router.patch('/:id', verifyToken, AdresseController.updateAdresse);
router.delete('/:id', verifyToken, AdresseController.deleteAdresse);

module.exports = router;


