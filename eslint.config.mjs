import { createConfigForNuxt } from '@nuxt/eslint'

export default createConfigForNuxt({
  features: {
    // Activer le support de TypeScript
    typescript: true,
    // Stylistic rules (indentation, quotes, etc.)
    stylistic: true,
  },
})
  .append(
    // Règles personnalisées si nécessaire
    {
      rules: {
        // Exemple: autoriser console.log en dev
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      },
    },
  )
