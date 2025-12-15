const express = require('express');
const AuthController = require('../controllers/AuthController');
const { verifyToken, isSuperAdmin } = require('../middlewares/authJwt');

const router = express.Router();

router.post('/login', AuthController.login);
router.post('/register', verifyToken, isSuperAdmin, AuthController.register);

module.exports = router;


