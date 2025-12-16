const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// User -> t_utilisateur
const User = sequelize.define(
  'User',
  {
    id_user: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nom: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    prenom: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('SUPERADMIN', 'USER'),
      allowNull: false,
      defaultValue: 'USER'
    },
    must_change_password: {
      // Indique si l'utilisateur doit changer son mot de passe à la prochaine connexion
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    date_creation: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    date_modification: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: 't_utilisateur',
    timestamps: false
  }
);

// Quartier -> t_quartier
const Quartier = sequelize.define(
  'Quartier',
  {
    id_quartier: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    libelle: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    ville: {
      type: DataTypes.STRING(50),
      defaultValue: 'Rabat'
    }
  },
  {
    tableName: 't_quartier',
    timestamps: false
  }
);

// Agent -> t_agent
const Agent = sequelize.define(
  'Agent',
  {
    id_agent: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    matricule_rh: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    nom: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    prenom: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    tel_pro: {
      type: DataTypes.STRING(20)
    },
    tel_perso: {
      type: DataTypes.STRING(20)
    }
  },
  {
    tableName: 't_agent',
    timestamps: false
  }
);

// Client -> t_client
const Client = sequelize.define(
  'Client',
  {
    id_client: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ref_client_erp: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    nom_complet: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  },
  {
    tableName: 't_client',
    timestamps: false
  }
);

// Adresse -> t_adresse
const Adresse = sequelize.define(
  'Adresse',
  {
    id_adresse: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ref_adresse_erp: {
      type: DataTypes.STRING(50)
    },
    libelle_complet: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  },
  {
    tableName: 't_adresse',
    timestamps: false
  }
);

// Compteur -> t_compteur
const Compteur = sequelize.define(
  'Compteur',
  {
    numero_serie: {
      type: DataTypes.CHAR(9),
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM('EAU', 'ELECTRICITE'),
      allowNull: false
    },
    index_actuel: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    date_installation: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 't_compteur',
    timestamps: false
  }
);

// Releve -> t_releve
const Releve = sequelize.define(
  'Releve',
  {
    id_releve: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    date_releve: {
      type: DataTypes.DATE,
      allowNull: false
    },
    ancien_index: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nouvel_index: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    consommation: {
      type: DataTypes.INTEGER
    }
  },
  {
    tableName: 't_releve',
    timestamps: false
  }
);

// LogConnexion -> t_log_connexion
const LogConnexion = sequelize.define(
  'LogConnexion',
  {
    id_log: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    date_connexion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    success: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    tableName: 't_log_connexion',
    timestamps: false
  }
);

// Associations (conformes aux FKs du schema.sql)
Quartier.hasMany(Agent, { foreignKey: 'id_quartier' });
Agent.belongsTo(Quartier, { foreignKey: 'id_quartier' });

Quartier.hasMany(Adresse, { foreignKey: 'id_quartier' });
Adresse.belongsTo(Quartier, { foreignKey: 'id_quartier' });

Adresse.hasMany(Compteur, { foreignKey: 'id_adresse' });
Compteur.belongsTo(Adresse, { foreignKey: 'id_adresse' });

Client.hasMany(Compteur, { foreignKey: 'id_client' });
Compteur.belongsTo(Client, { foreignKey: 'id_client' });

Compteur.hasMany(Releve, { foreignKey: 'numero_serie' });
Releve.belongsTo(Compteur, { foreignKey: 'numero_serie' });

Agent.hasMany(Releve, { foreignKey: 'id_agent' });
Releve.belongsTo(Agent, { foreignKey: 'id_agent' });

User.hasMany(LogConnexion, { foreignKey: 'id_user' });
LogConnexion.belongsTo(User, { foreignKey: 'id_user' });

module.exports = {
  sequelize,
  User,
  Quartier,
  Agent,
  Client,
  Adresse,
  Compteur,
  Releve,
  LogConnexion
};


