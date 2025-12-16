const CompteurController = require('../CompteurController');
const { Compteur, Adresse, Client } = require('../../models');

// Mock des modèles
jest.mock('../../models', () => ({
  Compteur: {
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    count: jest.fn(),
    max: jest.fn()
  },
  Adresse: {},
  Client: {},
  Quartier: {}
}));

describe('CompteurController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCompteur', () => {
    it('should validate maximum 4 compteurs per adresse', async () => {
      const req = {
        body: {
          type: 'EAU',
          id_adresse: 1,
          id_client: 1
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      Compteur.count.mockResolvedValue(4);

      await CompteurController.createCompteur(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Cette adresse possède déjà le nombre maximum de compteurs autorisés (4).'
      });
    });

    it('should generate numero_serie if not provided', async () => {
      const req = {
        body: {
          type: 'EAU',
          id_adresse: 1,
          id_client: 1
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      Compteur.count.mockResolvedValue(0);
      Compteur.max.mockResolvedValue('000000123');
      Compteur.findByPk.mockResolvedValue(null);
      Compteur.create.mockResolvedValue({
        numero_serie: '000000124',
        type: 'EAU',
        id_adresse: 1,
        id_client: 1,
        index_actuel: 0
      });

      await CompteurController.createCompteur(req, res);

      expect(Compteur.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should validate type enum', async () => {
      const req = {
        body: {
          type: 'INVALID',
          id_adresse: 1,
          id_client: 1
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      Compteur.count.mockResolvedValue(0);

      await CompteurController.createCompteur(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'type doit être EAU ou ELECTRICITE'
      });
    });
  });
});

