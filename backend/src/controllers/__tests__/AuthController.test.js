const AuthController = require('../AuthController');
const { User, LogConnexion } = require('../../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock des dépendances
jest.mock('../../models');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../services/emailService', () => ({
  sendPasswordEmail: jest.fn().mockResolvedValue(true)
}));

describe('AuthController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should log successful login', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123'
        },
        headers: {}
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockUser = {
        id_user: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        nom: 'TEST',
        prenom: 'User',
        role: 'USER',
        must_change_password: false
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mockToken');
      jwt.decode.mockReturnValue({ exp: 1234567890 });
      LogConnexion.create = jest.fn().mockResolvedValue({});

      await AuthController.login(req, res);

      expect(LogConnexion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          id_user: 1,
          success: true
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should log failed login with invalid email', async () => {
      const req = {
        body: {
          email: 'invalid@example.com',
          password: 'password123'
        },
        headers: {}
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      User.findOne.mockResolvedValue(null);
      LogConnexion.create = jest.fn().mockResolvedValue({});

      await AuthController.login(req, res);

      expect(LogConnexion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'invalid@example.com',
          id_user: null,
          success: false
        })
      );
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('updateUser', () => {
    it('should update date_modification when modifying user', async () => {
      const req = {
        params: { id: '1' },
        body: {
          nom: 'NEWNAME',
          prenom: 'New'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockUser = {
        id_user: 1,
        nom: 'OLD',
        prenom: 'Old',
        email: 'test@example.com',
        role: 'USER',
        must_change_password: false,
        date_creation: new Date('2024-01-01'),
        save: jest.fn().mockResolvedValue(true)
      };

      User.findByPk.mockResolvedValue(mockUser);

      await AuthController.updateUser(req, res);

      expect(mockUser.date_modification).toBeDefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('resetPassword', () => {
    it('should update date_modification when resetting password', async () => {
      const req = {
        params: { id: '1' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockUser = {
        id_user: 1,
        email: 'test@example.com',
        nom: 'TEST',
        prenom: 'User',
        role: 'USER',
        password: 'oldHash',
        must_change_password: false,
        save: jest.fn().mockResolvedValue(true)
      };

      User.findByPk.mockResolvedValue(mockUser);
      bcrypt.hash.mockResolvedValue('newHashedPassword');

      await AuthController.resetPassword(req, res);

      expect(mockUser.date_modification).toBeDefined();
      expect(mockUser.must_change_password).toBe(true);
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});

