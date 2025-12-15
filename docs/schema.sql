CREATE TABLE `t_utilisateur` (
  `id_user` int PRIMARY KEY AUTO_INCREMENT,
  `nom` varchar(50) NOT NULL COMMENT 'MAJUSCULES',
  `prenom` varchar(50) NOT NULL,
  `email` varchar(100) UNIQUE NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` ENUM ('SUPERADMIN', 'USER') NOT NULL DEFAULT 'USER',
  `date_creation` datetime DEFAULT (now())
);

CREATE TABLE `t_quartier` (
  `id_quartier` int PRIMARY KEY AUTO_INCREMENT,
  `libelle` varchar(100) NOT NULL,
  `ville` varchar(50) DEFAULT 'Rabat'
);

CREATE TABLE `t_agent` (
  `id_agent` int PRIMARY KEY AUTO_INCREMENT,
  `matricule_rh` varchar(50) UNIQUE NOT NULL COMMENT 'Ref venant du SI RH',
  `nom` varchar(50) NOT NULL,
  `prenom` varchar(50) NOT NULL,
  `tel_pro` varchar(20),
  `tel_perso` varchar(20),
  `id_quartier` int
);

CREATE TABLE `t_client` (
  `id_client` int PRIMARY KEY AUTO_INCREMENT,
  `ref_client_erp` varchar(50) UNIQUE NOT NULL COMMENT 'Ref venant du SI Commercial',
  `nom_complet` varchar(100) NOT NULL
);

CREATE TABLE `t_adresse` (
  `id_adresse` int PRIMARY KEY AUTO_INCREMENT,
  `ref_adresse_erp` varchar(50) COMMENT 'Optionnel',
  `libelle_complet` varchar(255) NOT NULL,
  `id_quartier` int NOT NULL
);

CREATE TABLE `t_compteur` (
  `numero_serie` char(9) PRIMARY KEY COMMENT 'Ex: 000123456',
  `type` ENUM ('EAU', 'ELECTRICITE') NOT NULL,
  `index_actuel` int DEFAULT 0,
  `date_installation` datetime DEFAULT (now()),
  `id_adresse` int NOT NULL,
  `id_client` int NOT NULL
);

CREATE TABLE `t_releve` (
  `id_releve` bigint PRIMARY KEY AUTO_INCREMENT,
  `date_releve` datetime NOT NULL,
  `ancien_index` int NOT NULL,
  `nouvel_index` int NOT NULL,
  `consommation` int COMMENT 'Calculé: Nouveau - Ancien',
  `numero_serie` char(9) NOT NULL,
  `id_agent` int NOT NULL
);

ALTER TABLE `t_utilisateur` COMMENT = 'Utilisateurs du Backoffice Web uniquement';

ALTER TABLE `t_releve` COMMENT = 'Historique immuable des relevés';

ALTER TABLE `t_agent` ADD FOREIGN KEY (`id_quartier`) REFERENCES `t_quartier` (`id_quartier`);

ALTER TABLE `t_adresse` ADD FOREIGN KEY (`id_quartier`) REFERENCES `t_quartier` (`id_quartier`);

ALTER TABLE `t_compteur` ADD FOREIGN KEY (`id_adresse`) REFERENCES `t_adresse` (`id_adresse`);

ALTER TABLE `t_compteur` ADD FOREIGN KEY (`id_client`) REFERENCES `t_client` (`id_client`);

ALTER TABLE `t_releve` ADD FOREIGN KEY (`numero_serie`) REFERENCES `t_compteur` (`numero_serie`);

ALTER TABLE `t_releve` ADD FOREIGN KEY (`id_agent`) REFERENCES `t_agent` (`id_agent`);
