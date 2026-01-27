# 1. Étape de Build
FROM node:20-alpine AS builder

WORKDIR /app

# Activation de corepack pour yarn
RUN corepack enable

# Copie des fichiers de dépendances (avant le reste = meilleur cache)
COPY package.json yarn.lock ./
COPY prisma ./prisma/

# Installation + Prisma generate (une seule RUN pour réduire les layers)
RUN --mount=type=cache,target=/root/.yarn \
    yarn install --frozen-lockfile && \
    yarn prisma generate

# Copie du reste du code
COPY . .

# Build Nuxt
RUN yarn build

# 2. Étape de Production (Image ultra-légère)
FROM node:20-alpine AS runner

WORKDIR /app

# Copie uniquement le build + prisma (pas de node_modules entier)
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Variables d'environnement
ENV PORT=3000 \
    NODE_ENV=production

EXPOSE 3000

# Démarrage du serveur (pas de migrations ici pour être plus rapide au startup)
CMD node .output/server/index.mjs