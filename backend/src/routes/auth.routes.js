const express = require('express');
const AuthController = require('../controllers/AuthController');
const { verifyToken, isSuperAdmin } = require('../middlewares/authJwt');

const router = express.Router();

router.post('/login', AuthController.login);
router.post('/register', verifyToken, isSuperAdmin, AuthController.register);
router.get('/admins', verifyToken, isSuperAdmin, AuthController.listAdmins);

// Gestion globale des utilisateurs (SUPERADMIN uniquement)
router.get('/users', verifyToken, isSuperAdmin, AuthController.listUsers);
router.get('/users/:id', verifyToken, isSuperAdmin, AuthController.getUser);
router.patch('/users/:id', verifyToken, isSuperAdmin, AuthController.updateUser);
router.post('/users/:id/reset-password', verifyToken, isSuperAdmin, AuthController.resetPassword);

// Changement de mot de passe (utilisateur authentifié)
router.post('/change-password', verifyToken, AuthController.changePassword);

module.exports = router;



