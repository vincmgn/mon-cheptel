# 1. Étape de Build
FROM node:20-slim AS builder

WORKDIR /app

# Activation de corepack pour yarn
RUN corepack enable

# Copie des fichiers de dépendances
COPY package.json yarn.lock ./
COPY prisma ./prisma/

# Installation avec Prisma generate (force version 6.19.2)
RUN yarn install --frozen-lockfile
RUN yarn prisma generate

# Copie du reste et Build
COPY . .
RUN yarn build

# 2. Étape de Production (Image légère)
FROM node:20-slim AS runner

# Installation d'OpenSSL (requis par Prisma)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copie du build depuis l'étape précédente
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Variable pour dire à Nuxt d'écouter sur le bon port
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

# Installation de Prisma CLI en production (version lockée)
RUN corepack enable && yarn add -D prisma@6.19.2

# Commande de démarrage
# On lance les migrations Prisma avant de démarrer pour être sûr que la DB est à jour
CMD yarn prisma migrate deploy && node .output/server/index.mjs