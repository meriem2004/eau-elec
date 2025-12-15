
# 📘 GUIDE D'IMPLÉMENTATION "SI RELEVÉS" (AI-AGENT READY)

**Rôle de l'IA :** Senior Full Stack Developer (MERN Stack)
**Objectif :** Générer une application Backoffice complète pour la gestion des relevés d'eau/électricité.
**Contraintes :** Code propre, sécurisé, commenté, et prêt pour Docker.

## 1\. Stack Technique & Structure

  * **Backend :** Node.js (v18+), Express.js
  * **ORM :** Sequelize
  * **Database :** MySQL 8.0
  * **Frontend :** React (Vite), TailwindCSS, Axios, Recharts (pour les KPI)
  * **DevOps :** Docker, Docker Compose
  * **Test Email :** MailHog (SMTP Mock)

### Structure de Dossiers Attendue

```text
/project-root
  /backend
    /src
      /config       # DB Connection & Env vars
      /controllers  # Logique métier (Auth, Compteurs, Relevés)
      /models       # Définitions Sequelize
      /middlewares  # AuthJwt, Validation
      /routes       # API Endpoints
      /services     # Services (Email, Calculs)
      app.js
    package.json
  /frontend
    /src
      /components   # UI (Cards, Tables, Navbar)
      /pages        # Vues (Dashboard, Login, Agents)
      /context      # AuthContext
      /services     # API calls (Axios setup)
    package.json
  docker-compose.yml
  .env
```

-----

## 2\. Phase Backend (Node.js/Express)

### A. Dépendances

Installe les paquets suivants : `express`, `mysql2`, `sequelize`, `cors`, `dotenv`, `bcryptjs`, `jsonwebtoken`, `nodemailer` (pour SMTP MailHog), `faker` (pour le seeding).

### B. Modèles de Données (Sequelize)

Implémente les modèles suivants basés sur le MLD validé :

1.  **User** : `id`, `nom` (uppercase), `prenom`, `email` (unique), `password` (hashed), `role` ('SUPERADMIN', 'USER').
2.  **Quartier** : `id`, `libelle`, `ville`.
3.  **Agent** : `id`, `matricule_rh`, `nom`, `prenom`, `id_quartier` (FK).
4.  **Client** : `id`, `ref_client_erp`, `nom_complet`.
5.  **Adresse** : `id`, `libelle`, `id_quartier` (FK).
6.  **Compteur** : `numero_serie` (PK string), `type` ('EAU', 'ELEC'), `index_actuel` (int), `id_adresse` (FK), `id_client` (FK).
7.  **Releve** : `id`, `date_releve`, `ancien_index`, `nouvel_index`, `consommation` (int), `id_agent` (FK), `numero_serie` (FK).

### C. Logique Métier Critique (Controllers)

#### `AuthController.js`

  * **login :** Vérifier email/password. Générer JWT (durée 4h). Retourner User + Token.
  * **register (Superadmin only) :**
      * Générer un mot de passe aléatoire de 12 caractères.
      * Hasher le mot de passe avec `bcrypt`.
      * Créer l'utilisateur.
      * Envoyer le mot de passe en clair via `nodemailer` (Config SMTP: Host `mailhog`, Port `1025`).

#### `ReleveController.js` (Simulation Mobile)

  * **createReleve :**
      * Input: `{ numero_serie, nouvel_index, id_agent }`.
      * Logique :
        1.  Récupérer le compteur via `numero_serie`.
        2.  `ancien_index` = `compteur.index_actuel`.
        3.  Validation : `nouvel_index` doit être \>= `ancien_index`.
        4.  `consommation` = `nouvel_index` - `ancien_index`.
        5.  Créer entrée dans table `Releve`.
        6.  Mettre à jour `compteur.index_actuel`.
        7.  (Optionnel) Simuler un appel vers API Facturation.

#### `DashboardController.js` (KPIs)

  * **getStats :**
      * Calculer le taux de couverture : `(Nb Compteurs relevés ce mois / Total Compteurs) * 100`.
      * Top Agents : Liste agents triée par nombre de relevés.
      * Consommation : Somme consommation par mois (Group By Month).

### D. Seeding (Données de test)

Crée un script `seed.js` qui peuple la BDD au démarrage si elle est vide :

  * 1 Superadmin (`admin@ree.ma` / `password123`)
  * 5 Quartiers (Agdal, Hay Riad, Hassan, etc.)
  * 20 Agents
  * 100 Clients & Adresses
  * 200 Compteurs (Mix Eau/Elec)
  * 500 Relevés historiques (sur les 3 derniers mois pour générer des graphes).

-----

## 3\. Phase Frontend (React + Vite)

### A. Configuration

  * Utiliser **TailwindCSS** pour le styling rapide.
  * Configurer **Axios** avec un intercepteur pour injecter le token JWT (`Authorization: Bearer ...`) dans chaque requête.

### B. Pages & Composants

1.  **Login Page :** Formulaire email/password. Redirection vers Dashboard si succès.
2.  **Layout (Protected) :** Sidebar (Menu), Topbar (Logout), Content Area.
3.  **Dashboard :**
      * 3 "Stat Cards" : Total Compteurs, Relevés du mois, Alertes.
      * Graphique (Recharts) : Évolution consommation Eau vs Élec.
      * Bar Chart : Performance des Agents.
4.  **Gestion Utilisateurs (Vue Superadmin) :**
      * Tableau des admins.
      * Bouton "Ajouter Admin" -\> Modal -\> Appel API -\> Afficher succès "Email envoyé".
5.  **Liste des Relevés :**
      * Datatable avec filtres (Date, Quartier).
      * Badge couleur pour le type (Eau = Bleu, Elec = Jaune).

-----

## 4\. Phase Simulation & Intégration

### Script de Simulation (`/backend/scripts/simulateTraffic.js`)

L'IA doit créer un script Node.js autonome qui simule l'activité :

  * Toutes les 10 secondes, il choisit un compteur au hasard.
  * Il génère un `nouvel_index` cohérent (+10 à +50 unités).
  * Il envoie une requête POST à `/api/releves` (Simule l'agent sur le terrain).
  * *Objectif :* Voir les graphiques du Dashboard bouger en temps réel lors de la démo.

-----

## 5\. Configuration Docker (Final)

Crée le fichier `docker-compose.yml` :

```yaml
version: '3.8'
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: si_releves_db
    ports:
      - "3307:3306"

  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025" # SMTP
      - "8025:8025" # Web UI

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DB_HOST: db
      SMTP_HOST: mailhog
    depends_on:
      - db
      - mailhog

  frontend:
    build: ./frontend
    ports:
      - "4200:80" # Nginx
    depends_on:
      - backend
```

-----

## ⚠️ Instructions Spéciales pour l'IA

1.  **Gestion des Erreurs :** Chaque Controller doit être entouré d'un bloc `try/catch` et retourner des codes HTTP standard (200, 201, 400, 401, 500).
2.  **Date Handling :** Utilise `moment` ou `date-fns` pour gérer les formats de date (DD/MM/YYYY) côté Frontend.
3.  **Mocking :** Si un service externe (ERP) est appelé, loggue simplement "Simulation appel ERP..." dans la console serveur au lieu de faire échouer la requête.