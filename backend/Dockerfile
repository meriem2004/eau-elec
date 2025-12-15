FROM node:18-alpine AS build

WORKDIR /app

ARG RUN_TESTS=false

# Installer toutes les dépendances (prod + dev) pour pouvoir exécuter les tests
COPY package*.json ./
RUN npm install

COPY . .

# Lancer la suite de tests backend (unit + integration) pendant le build (optionnel)
RUN if [ "$RUN_TESTS" = "true" ]; then npm test; else echo "Skipping backend tests in Docker build"; fi


FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Installer uniquement les dépendances de production dans l'image finale
RUN npm install --omit=dev

COPY src ./src
COPY scripts ./scripts

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
