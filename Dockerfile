# Stage 1: Build
FROM node:20-slim AS builder

# Installation de openssl et des outils nécessaires
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Installation précise
RUN pnpm install --frozen-lockfile

# Forcer le generate avec la version du projet
RUN npx prisma generate

COPY . .
RUN pnpm build

# Stage 2: Runtime
FROM node:20-slim AS runner
# Installation de openssl en runtime aussi
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/prisma ./prisma

ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

# On lance la synchro DB puis l'app
CMD npx prisma db push && node .output/server/index.mjs