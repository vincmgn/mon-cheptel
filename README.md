# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
yarn
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
yarn dev
```

## Production

Build the application for production:

```bash
yarn build
```

Locally preview production build:

```bash
yarn preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

# Générer le client Prisma (après changement du schema.prisma)

npx prisma generate

# Créer une migration et l'appliquer (dev)

npx prisma migrate dev --name init

# Pousser le schéma directement (prototypage, sans migration)

npx prisma db push

# Ouvrir l'interface graphique pour voir/éditer les données

npx prisma studio

# Remplir la base de données avec des données de test (Seed)

npx prisma db seed

```

```
