FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock ./
COPY prisma ./prisma/

RUN --mount=type=cache,target=/root/.yarn \
    yarn install --frozen-lockfile && \
    yarn prisma generate

COPY . .

RUN yarn build

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

ENV PORT=3000 \
    NODE_ENV=production

EXPOSE 3000

CMD npx prisma migrate deploy && npx tsx prisma/setup.ts && node .output/server/index.mjs