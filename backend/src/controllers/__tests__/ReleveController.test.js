const { createReleve } = require('../ReleveController');

// On mocke les modèles Sequelize pour éviter toute dépendance à la base de données
jest.mock('../../models', () => ({
  Compteur: {
    findByPk: jest.fn()
  },
  Releve: {
    create: jest.fn()
  }
}));

const { Compteur, Releve } = require('../../models');

function createMockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('ReleveController.createReleve', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('retourne 400 si nouvel_index < ancien_index', async () => {
    Compteur.findByPk.mockResolvedValue({
      numero_serie: '000000001',
      index_actuel: 100
    });

    const req = {
      body: {
        numero_serie: '000000001',
        nouvel_index: 90,
        id_agent: 1
      }
    };
    const res = createMockRes();

    await createReleve(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'nouvel_index doit être supérieur ou égal à ancien_index'
      })
    );
    expect(Releve.create).not.toHaveBeenCalled();
  });

  test('crée un relevé valide et met à jour le compteur', async () => {
    const saveMock = jest.fn();

    Compteur.findByPk.mockResolvedValue({
      numero_serie: '000000001',
      index_actuel: 100,
      save: saveMock
    });

    Releve.create.mockResolvedValue({
      id_releve: 1,
      numero_serie: '000000001'
    });

    const req = {
      body: {
        numero_serie: '000000001',
        nouvel_index: 130,
        id_agent: 2
      }
    };
    const res = createMockRes();

    await createReleve(req, res);

    expect(Releve.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ancien_index: 100,
        nouvel_index: 130,
        consommation: 30,
        numero_serie: '000000001',
        id_agent: 2
      })
    );
    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });
});


