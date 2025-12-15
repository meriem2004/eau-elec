# 🌊 SI Relevés - Gestion Intelligente (AI-Driven Project)

> **Projet Académique - Système d'Information & Intelligence Artificielle**
> *RABAT ENERGIE & EAU (REE)*

![AI Powered](https://img.shields.io/badge/AI-Powered-blueviolet) ![Status](https://img.shields.io/badge/Status-Development-yellow) ![Date](https://img.shields.io/badge/Deadline-19%20Dec%202025-red)

## 📄 Contexte du Projet

Ce projet s'inscrit dans la transformation digitale de la société **Rabat Energie & Eau (REE)**. [cite_start]L'objectif est de développer la brique **"SI Relevés"** (Backoffice Web) permettant la gestion centralisée des compteurs d'eau et d'électricité ainsi que l'affectation des agents de terrain[cite: 53, 54].

### 🤖 La Particularité : Méta-Ingénierie par IA
Ce projet n'est pas un développement classique. [cite_start]Conformément aux consignes, **l'ensemble du cycle de vie du Système d'Information (Analyse, Conception, Développement, Test, Déploiement) est assisté ou généré par des outils d'Intelligence Artificielle**[cite: 10, 11].

---

## 🚀 Fonctionnalités Clés

Le système couvre les besoins fonctionnels suivants, extraits du cahier des charges par analyse sémantique :

### [cite_start]🔐 Espace Super-Administrateur [cite: 244-271]
* **Gestion des utilisateurs :** Création des accès pour les administrateurs Backoffice.
* [cite_start]**Sécurité :** Génération automatique de mots de passe complexes et envoi sécurisé par email (simulation SMTP) [cite: 305-306].

### [cite_start]📊 Espace Administrateur (Backoffice) [cite: 79-83]
* **Tableaux de bord (KPIs) :**
    * Taux de couverture des relevés.
    * Performance par agent et par quartier.
    * [cite_start]Évolution de la consommation (Eau/Élec) [cite: 153-167].
* [cite_start]**Gestion des Compteurs :** Création, association aux adresses, historique des index [cite: 97-104].
* [cite_start]**Gestion des Agents :** Affectation des agents de terrain aux quartiers de Rabat[cite: 105].
* [cite_start]**Suivi des Relevés :** Calcul automatique des consommations (Nouveau - Ancien Index)[cite: 136].

---

## 🛠 Stack Technique & Architecture

[cite_start]L'architecture a été générée pour respecter les contraintes imposées [cite: 288-300].

* **Backend :** Node.js (Express)
* **Frontend :** React.js
* **Base de Données :** MySQL
* [cite_start]**Sécurité :** JWT, HTTPS (Self-signed certificates)[cite: 312, 319].
* **Conteneurisation :** Docker & Docker Compose.

---

## 🧠 Utilisation de l'IA (Cycle de Vie)

Ce dépôt contient les traces des interactions avec l'IA pour chaque phase :

| Phase | Outils IA Utilisés | Livrables Générés |
| :--- | :--- | :--- |
| **1. Analyse** | [Ex: ChatGPT-4o] | Extraction des besoins, User Stories. |
| **2. Conception** | [Ex: PlantUML via AI] | Diagrammes (Use Case, MCD, Architecture). |
| **3. Dév** | [Ex: Copilot, Cursor] | Code boilerplate, algorithmes de calcul, CRUD. |
| **4. Tests** | [Ex: CodiumAI] | Tests unitaires, génération de Datasets SQL massifs (Clients/Compteurs). |
| **5. Ops** | [Ex: Script Gen] | Scripts de déploiement, Dockerfiles, Monitoring prédictif. |

> [cite_start]*Note : Les interactions avec l'ERP (RH/Commercial) et l'Application Mobile sont simulées via des mocks générés par IA [cite: 30-31].*

---

## ⚙️ Installation et Démarrage

### Prérequis
* Docker & Docker Compose
* Node.js 18+
* NPM (inclus avec Node.js)

### Démarrage Rapide
1. **Cloner le repo**

```bash
git clone https://github.com/ENSIAS-3A-Projects/RABAT-ENERGIE-EAU-REE.git
cd RABAT-ENERGIE-EAU-REE
```

2. **Lancer la stack (Base de données & Backend)**

```bash
docker-compose up -d --build
```

3. **Lancer le Frontend (React.js)**

```bash
cd frontend
npm install
npm start
```

4. **Accès**
* Application : `https://localhost:4200` (ou port choisi)
* Identifiants démo (Générés par IA) : `admin@ree.ma` / `password123`

---

## 👥 Équipe Projet
* Bouazza Chaymae
* Benabbou Imane
* Alaoui Sosse Saad
* Taqi Mohamed

---
*Projet réalisé dans le cadre du module "Intelligence dans les Systèmes d'Information" - Décembre 2025.*