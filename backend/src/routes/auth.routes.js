const express = require('express');
const AuthController = require('../controllers/AuthController');
const { verifyToken, isSuperAdmin } = require('../middlewares/authJwt');

const router = express.Router();

router.post('/login', AuthController.login);
router.post('/register', verifyToken, isSuperAdmin, AuthController.register);
router.get('/admins', verifyToken, isSuperAdmin, AuthController.listAdmins);

module.exports = router;



