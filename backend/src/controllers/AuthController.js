const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sendPasswordEmail } = require('../services/emailService');

const TOKEN_EXPIRATION = '4h';

function generateRandomPassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let pwd = '';
  for (let i = 0; i < length; i += 1) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe sont requis' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const payload = {
      id_user: user.id_user,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', {
      expiresIn: TOKEN_EXPIRATION
    });

    return res.status(200).json({
      user: {
        id_user: user.id_user,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('AuthController.login error:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la connexion' });
  }
};

const register = async (req, res) => {
  try {
    const { nom, prenom, email, role = 'USER' } = req.body;

    if (!nom || !prenom || !email) {
      return res.status(400).json({ message: 'nom, prenom et email sont requis' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
    }

    const plainPassword = generateRandomPassword(12);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = await User.create({
      nom: nom.toUpperCase(),
      prenom,
      email,
      password: hashedPassword,
      role
    });

    try {
      await sendPasswordEmail(email, plainPassword);
    } catch (mailError) {
      // Ne pas faire échouer la requête si MailHog / SMTP tombe
      console.error('Erreur lors de l’envoi de l’email de mot de passe:', mailError);
    }

    return res.status(201).json({
      message: 'Utilisateur créé et mot de passe envoyé par email (simulation)',
      user: {
        id_user: user.id_user,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('AuthController.register error:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la création utilisateur' });
  }
};

const listAdmins = async (req, res) => {
  try {
    const admins = await User.findAll({
      where: { role: 'SUPERADMIN' },
      order: [['date_creation', 'DESC']]
    });

    return res.status(200).json(
      admins.map((u) => ({
        id_user: u.id_user,
        nom: u.nom,
        prenom: u.prenom,
        email: u.email,
        role: u.role,
        date_creation: u.date_creation
      }))
    );
  } catch (error) {
    console.error('AuthController.listAdmins error:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération des administrateurs' });
  }
};

module.exports = {
  login,
  register,
  listAdmins
};


