FROM node:22-alpine AS build

WORKDIR /app

ARG RUN_TESTS=false

COPY package*.json ./
RUN npm install

COPY . .

# Lancer la suite de tests frontend (Vitest) pendant le build (optionnel)
RUN if [ "$RUN_TESTS" = "true" ]; then npm test; else echo "Skipping frontend tests in Docker build"; fi

# Compiler le bundle frontend
RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
