# 1. Étape de Build
FROM node:20-slim AS builder

WORKDIR /app

# Activation de corepack pour yarn
RUN corepack enable

# Copie des fichiers de dépendances
COPY package.json yarn.lock ./
COPY prisma ./prisma/

# Installation avec cache mount pour accélérer les rebuilds
RUN --mount=type=cache,target=/root/.yarn \
    yarn install --frozen-lockfile

# Prisma generate
RUN yarn prisma generate

# Copie du reste et Build
COPY . .
RUN yarn build

# 2. Étape de Production (Image légère)
FROM node:20-slim AS runner

# Installation d'OpenSSL (requis par Prisma)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN corepack enable

# Copie du build depuis l'étape précédente
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Installer uniquement Prisma CLI (plus léger que tout réinstaller)
RUN yarn add -D --ignore-scripts prisma@6.19.2

# Variable pour dire à Nuxt d'écouter sur le bon port
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

# Commande de démarrage avec migrations
CMD yarn prisma migrate deploy && node .output/server/index.mjs