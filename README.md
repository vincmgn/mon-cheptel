# Mon Cheptel — Guide de développement

Nuxt 4 + Prisma + PostgreSQL, avec Docker pour la base de données.

## Prérequis

- Docker & Docker Compose
- Yarn (1.x)
- PostgreSQL via Docker (service `db`)

## Installation

```bash
yarn
```

Prisma est épinglé en 6.19.2. Évite de passer à Prisma 7 pour le moment (comportement différent sur `DATABASE_URL`).

## Environnements et variables

- Dev: `.env` (déjà présent)
  - Exemple attendu:
    ```bash
    DATABASE_URL="postgresql://cheptel_admin:cheptel_password@localhost:5432/cheptel_db"
    NUXT_PUBLIC_API_BASE="/api"
    ```
- Prod: `.env.production` (à créer pour l’usage avec `docker-compose.prod.yml`)
  - Exemple:
    ```bash
    DATABASE_URL="postgresql://user_prod:password_prod@db:5432/cheptel_db"
    NUXT_SECRET="<valeur-aléatoire-robuste>"
    NUXT_PUBLIC_API_BASE="/api"
    ```

## Base de données (Docker)

- Démarrer la base en local (dev):
  ```bash
  docker compose up -d db
  ```
- Arrêter/Nettoyer:
  ```bash
  docker compose down
  ```

## Prisma (migrations, seed, studio)

- Vérifier la version:
  ```bash
  yarn prisma -v
  ```
- Appliquer les migrations (prod/dev DB déjà démarrée):
  ```bash
  yarn prisma migrate deploy
  ```
- Créer une migration (développement, après modifications du schéma):
  ```bash
  yarn prisma migrate dev --name <nom>
  ```
- Générer le client Prisma (si nécessaire):
  ```bash
  yarn prisma generate
  ```
- Seed de la base:
  ```bash
  yarn prisma db seed
  ```
- Studio (UI de la DB):
  ```bash
  yarn prisma studio
  ```

## Développement (Nuxt)

- Lancer le serveur dev (`http://localhost:3000`):
  ```bash
  yarn dev
  ```

## Production (Docker Compose)

- **Build et push l'image vers GHCR** (GitHub Container Registry):
  ```bash
  docker build -t ghcr.io/vincmgn/mon-cheptel:latest .
  docker push ghcr.io/vincmgn/mon-cheptel:latest
  ```
- **Déployer sur le serveur** (avec Traefik + Portainer):

  ```bash
  docker compose --env-file .env.production -f docker-compose.prod.yml up -d
  ```

- **Remarques importantes**:
  - Le Dockerfile utilise `yarn prisma` pour forcer Prisma 6.19.2 (éviter Prisma 7)
  - Les migrations sont exécutées automatiquement au démarrage (`yarn prisma migrate deploy`)
  - Le service `app` expose le port 3000, Traefik route vers `mon-cheptel.vincentmagnien.com`
  - Assure-toi que `.env.production` contient `DATABASE_URL` avec l'hôte `db` (réseau interne)

## Dépannage

- Prisma 7 vs 6: si un message indique que `datasource.url` n’est plus supporté, tu es probablement sur Prisma 7. Reste en 6:
  ```bash
  yarn add -D prisma@6.19.2
  yarn add @prisma/client@6.19.2
  yarn prisma -v
  ```
- Image GHCR invalide: le nom doit être en minuscules et réel. En local, préfère `docker-compose.yml` sans le fichier prod.

## Référence rapide

- DB (dev): `docker compose up -d db` / `docker compose down`
- Migrations (dev/prod): `yarn prisma migrate deploy`
- Dev server: `yarn dev`
- Lint + typecheck + build: `yarn validate`

## CI/CD Pipeline

Le workflow `.github/workflows/deploy.yml` automatise:

1. **Validate** (~45-50s): Lint + typecheck en parallèle
2. **Build & Push** (~5 min): Docker multi-stage build vers GHCR avec caching
3. **Deploy** (~5s): Mise à jour Portainer stack

Optimisations implémentées:

- **Dockerfile multi-stage**: node:20-alpine (petit, rapide)
- **Docker layer caching**: RUN commands fusionnées, dépendances avant le code
- **GHA cache**: Réutilisation des layers entre builds (~30-40% gain après 1er run)
- **Pas de Prisma CLI en prod**: Migrations lancées avant le déploiement
- **Concurrency**: Annule les builds en cours si nouveau push
- **Lint & typecheck parallèles**: Économie de 10-15s sur validation
